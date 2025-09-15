// Demo script to add availability for doctors
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDemoAvailability() {
  try {
    // Get all verified doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        verificationStatus: 'VERIFIED'
      }
    });

    console.log(`Found ${doctors.length} verified doctors`);

    for (const doctor of doctors) {
      // Check if doctor already has availability
      const existingAvailability = await prisma.availability.findFirst({
        where: {
          doctorId: doctor.id
        }
      });

      if (!existingAvailability) {
        // Create demo availability: 9 AM to 5 PM for the next 30 days
        const today = new Date();
        
        // Set availability for next 30 days
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          // Skip weekends (Saturday = 6, Sunday = 0)
          if (date.getDay() === 0 || date.getDay() === 6) {
            continue;
          }

          // Create morning slot: 9 AM - 1 PM
          const morningStart = new Date(date);
          morningStart.setHours(9, 0, 0, 0);
          const morningEnd = new Date(date);
          morningEnd.setHours(13, 0, 0, 0);

          await prisma.availability.create({
            data: {
              doctorId: doctor.id,
              startTime: morningStart,
              endTime: morningEnd,
              status: 'AVAILABLE'
            }
          });

          // Create afternoon slot: 2 PM - 6 PM
          const afternoonStart = new Date(date);
          afternoonStart.setHours(14, 0, 0, 0);
          const afternoonEnd = new Date(date);
          afternoonEnd.setHours(18, 0, 0, 0);

          await prisma.availability.create({
            data: {
              doctorId: doctor.id,
              startTime: afternoonStart,
              endTime: afternoonEnd,
              status: 'AVAILABLE'
            }
          });
        }

        console.log(`✅ Added availability for Dr. ${doctor.name}`);
      } else {
        console.log(`⚠️ Dr. ${doctor.name} already has availability set`);
      }
    }

    console.log('✅ Demo availability setup completed!');
  } catch (error) {
    console.error('❌ Error setting up demo availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDemoAvailability();