"use server";

import { db } from "@/lib/prisma";

/**
 * Create availability slots for a specific doctor
 */
export async function createDoctorAvailabilitySlots() {
  try {
    // First, let's find or create Dr. Sumit
    let doctor = await db.user.findFirst({
      where: {
        name: {
          contains: "Sumit",
          mode: "insensitive"
        },
        role: "DOCTOR"
      }
    });

    // If Dr. Sumit doesn't exist, create the profile
    if (!doctor) {
      doctor = await db.user.create({
        data: {
          clerkUserId: "doctor_sumit_" + Date.now(), // Temporary clerk ID
          email: "dr.sumit@doctorsplatform.com",
          name: "Dr. Sumit Kumar",
          role: "DOCTOR",
          specialty: "General Medicine",
          experience: 8,
          description: "Experienced General Medicine practitioner with 8 years of experience in providing comprehensive healthcare services.",
          consultationFee: 150.00,
          verificationStatus: "VERIFIED",
          medicalDegree: "MBBS",
          licenseNumber: "MED2024001",
          workingHospital: "City Medical Center",
          verifiedAt: new Date(),
          verifiedBy: "admin",
        }
      });

      console.log("Created Dr. Sumit profile:", doctor.id);
    }

    // Clear existing availability slots for Dr. Sumit
    await db.availability.deleteMany({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE" // Only delete available slots, not booked ones
      }
    });

    const slots = [];
    const today = new Date();
    
    // Generate slots for next 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (day 0)
      if (date.getDay() === 0) continue;
      
      // Morning slots: 9:00 AM to 12:00 PM (30-minute slots)
      const morningStartHour = 9;
      const morningEndHour = 12;
      
      for (let hour = morningStartHour; hour < morningEndHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          const startTime = new Date(date);
          startTime.setHours(hour, minutes, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 30);
          
          slots.push({
            doctorId: doctor.id,
            startTime,
            endTime,
            status: "AVAILABLE"
          });
        }
      }
      
      // Evening slots: 2:00 PM to 6:00 PM (30-minute slots)
      const eveningStartHour = 14;
      const eveningEndHour = 18;
      
      for (let hour = eveningStartHour; hour < eveningEndHour; hour++) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
          const startTime = new Date(date);
          startTime.setHours(hour, minutes, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 30);
          
          slots.push({
            doctorId: doctor.id,
            startTime,
            endTime,
            status: "AVAILABLE"
          });
        }
      }
    }

    // Create all availability slots
    const createdSlots = await db.availability.createMany({
      data: slots
    });

    console.log(`Created ${createdSlots.count} availability slots for Dr. ${doctor.name}`);
    
    return {
      success: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty
      },
      slotsCreated: createdSlots.count,
      schedule: {
        morning: "9:00 AM - 12:00 PM",
        evening: "2:00 PM - 6:00 PM",
        slotDuration: "30 minutes",
        daysGenerated: 10,
        excludedDays: "Sundays"
      }
    };
    
  } catch (error) {
    console.error("Failed to create availability slots:", error);
    throw new Error("Failed to create availability slots: " + error.message);
  }
}