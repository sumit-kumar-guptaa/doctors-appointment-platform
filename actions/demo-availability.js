"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Setup demo availability for a doctor
 */
export async function setupDemoAvailability(doctorId) {
  try {
    console.log("🔧 Setting up demo availability for doctor:", doctorId);

    // Check if doctor already has availability
    const existingAvailability = await db.availability.findFirst({
      where: {
        doctorId: doctorId
      }
    });

    if (existingAvailability) {
      console.log("⚠️ Doctor already has availability set");
      return { success: true, message: "Doctor already has availability" };
    }

    // Get doctor info
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED"
      }
    });

    if (!doctor) {
      return { success: false, error: "Doctor not found or not verified" };
    }

    // Create demo availability: 9 AM to 5 PM for the next 14 days
    const today = new Date();
    let slotsCreated = 0;
    
    for (let i = 1; i <= 14; i++) { // Start from tomorrow
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Create morning availability: 9 AM - 1 PM
      const morningStart = new Date(date);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(13, 0, 0, 0);

      await db.availability.create({
        data: {
          doctorId: doctor.id,
          startTime: morningStart,
          endTime: morningEnd,
          status: 'AVAILABLE'
        }
      });
      slotsCreated++;

      // Create afternoon availability: 2 PM - 6 PM
      const afternoonStart = new Date(date);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(18, 0, 0, 0);

      await db.availability.create({
        data: {
          doctorId: doctor.id,
          startTime: afternoonStart,
          endTime: afternoonEnd,
          status: 'AVAILABLE'
        }
      });
      slotsCreated++;
    }

    console.log(`✅ Created ${slotsCreated} availability slots for Dr. ${doctor.name}`);

    return { 
      success: true, 
      message: `Demo availability created! ${slotsCreated} slots added for the next 2 weeks.`,
      slotsCreated 
    };

  } catch (error) {
    console.error("❌ Error setting up demo availability:", error);
    return { 
      success: false, 
      error: "Failed to setup demo availability: " + error.message 
    };
  }
}