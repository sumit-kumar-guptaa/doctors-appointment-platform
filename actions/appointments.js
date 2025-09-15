"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deductCreditsForAppointment } from "@/actions/credits";
import OpenTok from "opentok";
import { addDays, addMinutes, format, isBefore, endOfDay } from "date-fns";

// Initialize OpenTok client (simpler than Vonage SDK)
const opentok = new OpenTok(
  process.env.VONAGE_API_KEY || "dummy", // Use dummy if not available
  process.env.VONAGE_API_SECRET || "dummy"
);

/**
 * Book a new appointment with a doctor
 */
export async function bookAppointment(formData) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get the patient user
    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      return { success: false, error: "Patient not found" };
    }

    // Parse form data
    const doctorId = formData.get("doctorId");
    const startTime = new Date(formData.get("startTime"));
    const endTime = new Date(formData.get("endTime"));
    const patientDescription = formData.get("description") || null;

    // Validate input
    if (!doctorId || !startTime || !endTime) {
      return { success: false, error: "Doctor, start time, and end time are required" };
    }

    // Check if the doctor exists and is verified
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found or not verified" };
    }

    // Check if the patient has enough credits (2 credits per appointment)
    if (patient.credits < 2) {
      return { success: false, error: "Insufficient credits to book an appointment. You need 2 credits." };
    }

    // Check if the requested time slot is available
    const overlappingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: "SCHEDULED",
        OR: [
          {
            // New appointment starts during an existing appointment
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            // New appointment ends during an existing appointment  
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            // New appointment completely contains an existing appointment
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          },
          {
            // Existing appointment completely contains new appointment
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ],
      },
    });

    if (overlappingAppointment) {
      return { success: false, error: "This time slot is already booked. Please select a different time." };
    }

    // Create a new Vonage Video API session for this appointment
    const videoSession = await createVideoSession();

    // Deduct credits from patient and add to doctor
    const { success: creditSuccess, error: creditError } = await deductCreditsForAppointment(
      patient.id,
      doctor.id
    );

    if (!creditSuccess) {
      return { success: false, error: creditError || "Failed to deduct credits" };
    }

    // Create the appointment with direct startTime/endTime and video session
    const appointment = await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        patientDescription,
        status: "SCHEDULED",
        videoSessionId: videoSession.sessionId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true,
          }
        }
      }
    });

    console.log("✅ Appointment created successfully:", {
      id: appointment.id,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      videoSessionId: appointment.videoSessionId
    });

    revalidatePath("/appointments");
    return { 
      success: true, 
      appointment: appointment,
      message: "Appointment booked successfully! Video call will be available 30 minutes before your appointment."
    };

  } catch (error) {
    console.error("❌ Failed to book appointment:", error);
    return { 
      success: false, 
      error: "Failed to book appointment: " + error.message 
    };
  }
}

/**
 * Generate a Vonage Video API session
 */
async function createVideoSession() {
  try {
    console.log("🎥 Using existing Vonage video session from environment...");
    
    // Use the existing session ID from environment variables
    const sessionId = process.env.VONAGE_SESSION_ID;
    const applicationId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID;
    
    if (!sessionId || !applicationId) {
      throw new Error("Missing VONAGE_SESSION_ID or VONAGE_APPLICATION_ID in environment variables");
    }
    
    console.log("✅ Using existing video session:", {
      sessionId: sessionId.substring(0, 20) + "...",
      applicationId: applicationId
    });
    
    return {
      sessionId: sessionId,
      applicationId: applicationId
    };
  } catch (error) {
    console.error("❌ Failed to get video session:", error);
    throw new Error("Failed to create video session: " + error.message);
  }
}

/**
 * Generate a token for a video session
 * This will be called when either doctor or patient is about to join the call
 */
export async function generateVideoToken(formData) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const appointmentId = formData.get("appointmentId");

    if (!appointmentId) {
      return { success: false, error: "Appointment ID is required" };
    }

    // Find the appointment and verify the user is part of it
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true
          }
        }
      }
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    // Verify the user is either the doctor or the patient for this appointment
    if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
      return { success: false, error: "You are not authorized to join this call" };
    }

    // Verify the appointment is scheduled
    if (appointment.status !== "SCHEDULED") {
      return { success: false, error: "This appointment is not currently scheduled" };
    }

    // Verify the appointment is within a valid time range (30 minutes before to end time)
    const now = new Date();
    const appointmentStartTime = new Date(appointment.startTime);
    const appointmentEndTime = new Date(appointment.endTime);
    
    // Calculate time difference in minutes
    const timeDifferenceStart = (appointmentStartTime - now) / (1000 * 60);
    const timeDifferenceEnd = (now - appointmentEndTime) / (1000 * 60);

    // Allow access 30 minutes before appointment until 30 minutes after it ends
    if (timeDifferenceStart > 30) {
      return { 
        success: false, 
        error: `The video call will be available 30 minutes before the scheduled time (${format(appointmentStartTime, "h:mm a")})`
      };
    }

    if (timeDifferenceEnd > 30) {
      return { 
        success: false, 
        error: "This appointment has ended. Video call is no longer available."
      };
    }

    // Check if we have a video session ID
    if (!appointment.videoSessionId) {
      return { success: false, error: "No video session found for this appointment" };
    }

    // Generate a token for the video session
    // Token expires 3 hours after the appointment end time for safety
    const expirationTime = Math.floor((appointmentEndTime.getTime() + (3 * 60 * 60 * 1000)) / 1000);

    // Use user's name and role as connection data
    const connectionData = JSON.stringify({
      name: user.name,
      role: user.role,
      userId: user.id,
      appointmentId: appointment.id
    });

    console.log("🎫 Generating video token for:", {
      userName: user.name,
      userRole: user.role,
      appointmentId: appointment.id,
      sessionId: appointment.videoSessionId
    });

    // Use the existing token from environment if available, or generate a new one
    let token;
    
    // If we have an existing token in environment, use it (for testing)
    if (process.env.VONAGE_TOKEN && appointment.videoSessionId === process.env.VONAGE_SESSION_ID) {
      console.log("📋 Using existing token from environment");
      token = process.env.VONAGE_TOKEN;
    } else {
      // Try to generate a new token (this might fail with current credentials)
      try {
        const connectionData = JSON.stringify({
          name: user.name,
          role: user.role,
          userId: user.id,
          appointmentId: appointment.id
        });

        token = opentok.generateToken(appointment.videoSessionId, {
          role: "publisher",
          expireTime: expirationTime,
          data: connectionData,
        });
        
        console.log("✅ New token generated successfully");
      } catch (tokenError) {
        console.log("⚠️ Token generation failed, using environment token as fallback");
        console.error("Token error:", tokenError.message);
        
        // Fallback to environment token
        if (process.env.VONAGE_TOKEN) {
          token = process.env.VONAGE_TOKEN;
        } else {
          throw new Error("Unable to generate token and no fallback available");
        }
      }
    }

    // Update the appointment with the latest token (optional, for tracking)
    await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        videoSessionToken: token,
        updatedAt: new Date()
      },
    });

    console.log("✅ Video token generated successfully");

    return {
      success: true,
      videoSessionId: appointment.videoSessionId,
      token: token,
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        patient: appointment.patient,
        doctor: appointment.doctor
      }
    };

  } catch (error) {
    console.error("❌ Failed to generate video token:", error);
    return { 
      success: false, 
      error: "Failed to generate video token: " + error.message 
    };
  }
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(doctorId) {
  try {
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return { doctor };
  } catch (error) {
    console.error("Failed to fetch doctor:", error);
    throw new Error("Failed to fetch doctor details");
  }
}

/**
 * Get available time slots for booking for the next 4 days
 */
export async function getAvailableTimeSlots(doctorId) {
  try {
    console.log("📅 Fetching available time slots for doctor:", doctorId);
    
    // Validate doctor existence and verification
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      return { 
        success: false, 
        error: "Doctor not found or not verified",
        days: [] 
      };
    }

    // Fetch doctor availability
    const availability = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE",
      },
    });

    if (!availability) {
      return {
        success: true,
        days: [],
        message: `Dr. ${doctor.name} hasn't set availability yet. Please check back later.`
      };
    }

    // Get the next 4 days
    const now = new Date();
    const days = [now, addDays(now, 1), addDays(now, 2), addDays(now, 3)];

    // Fetch existing appointments for the doctor over the next 4 days
    const lastDay = endOfDay(days[3]);
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        createdAt: {
          gte: now,
          lte: lastDay,
        },
      },
    });

    console.log(`📊 Found ${existingAppointments.length} existing appointments`);

    const availableSlotsByDay = {};

    // For each of the next 4 days, generate available slots
    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");
      availableSlotsByDay[dayString] = [];

      // Create a copy of the availability start/end times for this day
      const availabilityStart = new Date(availability.startTime);
      const availabilityEnd = new Date(availability.endTime);

      // Set the day to the current day we're processing
      availabilityStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      availabilityEnd.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      let current = new Date(availabilityStart);
      const end = new Date(availabilityEnd);

      // Generate 30-minute slots
      while (isBefore(addMinutes(current, 30), end) || +addMinutes(current, 30) === +end) {
        const next = addMinutes(current, 30);

        // Skip past slots (add 15 minutes buffer for current time)
        if (isBefore(current, addMinutes(now, 15))) {
          current = next;
          continue;
        }

        // Check for overlapping appointments
        const overlaps = existingAppointments.some((appointment) => {
          const aStart = new Date(appointment.startTime);
          const aEnd = new Date(appointment.endTime);

          return (
            (current >= aStart && current < aEnd) ||
            (next > aStart && next <= aEnd) ||
            (current <= aStart && next >= aEnd)
          );
        });

        if (!overlaps) {
          availableSlotsByDay[dayString].push({
            startTime: current.toISOString(),
            endTime: next.toISOString(),
            formatted: `${format(current, "h:mm a")} - ${format(next, "h:mm a")}`,
            day: format(current, "EEEE, MMMM d"),
          });
        }

        current = next;
      }
    }

    // Convert to array of slots grouped by day for easier consumption by the UI
    const result = Object.entries(availableSlotsByDay).map(([date, slots]) => ({
      date,
      displayDate: slots.length > 0 ? slots[0].day : format(new Date(date), "EEEE, MMMM d"),
      slots,
      availableCount: slots.length
    }));

    const totalSlots = result.reduce((acc, day) => acc + day.availableCount, 0);
    console.log(`✅ Generated ${totalSlots} available time slots across ${result.length} days`);

    return { 
      success: true,
      days: result,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty
      }
    };

  } catch (error) {
    console.error("❌ Failed to fetch available slots:", error);
    return { 
      success: false, 
      error: "Failed to fetch available time slots: " + error.message,
      days: []
    };
  }
}
