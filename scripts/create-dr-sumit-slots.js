import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDrSumitSlots() {
  try {
    console.log('🏥 Starting to create availability slots for Dr. Sumit...');

    // First, let's find or create Dr. Sumit
    let doctor = await prisma.user.findFirst({
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
      console.log('👨‍⚕️ Dr. Sumit not found. Creating profile...');
      doctor = await prisma.user.create({
        data: {
          clerkUserId: "doctor_sumit_" + Date.now(),
          email: "dr.sumit@doctorsplatform.com",
          name: "Dr. Sumit Kumar",
          role: "DOCTOR",
          specialty: "General Medicine",
          experience: 8,
          description: "Experienced General Medicine practitioner with 8 years of experience in providing comprehensive healthcare services. Specializes in preventive care, chronic disease management, and family medicine.",
          consultationFee: 150.00,
          verificationStatus: "VERIFIED",
          medicalDegree: "MBBS, MD (General Medicine)",
          licenseNumber: "MED2024001",
          workingHospital: "City Medical Center",
          verifiedAt: new Date(),
          verifiedBy: "system_admin",
          credits: 0,
        }
      });
      console.log(`✅ Created Dr. Sumit profile with ID: ${doctor.id}`);
    } else {
      console.log(`👨‍⚕️ Found existing Dr. Sumit with ID: ${doctor.id}`);
    }

    // Clear existing available slots for Dr. Sumit
    const deletedSlots = await prisma.availability.deleteMany({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE"
      }
    });
    console.log(`🗑️ Cleared ${deletedSlots.count} existing available slots`);

    const slots = [];
    const today = new Date();
    
    console.log('📅 Generating slots for the next 10 days...');
    
    // Generate slots for next 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays (day 0)
      if (date.getDay() === 0) {
        console.log(`⏭️ Skipping Sunday: ${date.toDateString()}`);
        continue;
      }
      
      console.log(`📆 Creating slots for: ${date.toDateString()}`);
      
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
    console.log(`⏰ Creating ${slots.length} availability slots...`);
    const createdSlots = await prisma.availability.createMany({
      data: slots
    });

    console.log('✅ SUCCESS! Slot creation completed:');
    console.log(`👨‍⚕️ Doctor: ${doctor.name}`);
    console.log(`🏥 Specialty: ${doctor.specialty}`);
    console.log(`📅 Slots Created: ${createdSlots.count}`);
    console.log(`🕘 Morning Hours: 9:00 AM - 12:00 PM`);
    console.log(`🕐 Evening Hours: 2:00 PM - 6:00 PM`);
    console.log(`⏱️ Slot Duration: 30 minutes`);
    console.log(`📆 Days: Next 10 days (excluding Sundays)`);
    
    return {
      success: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        email: doctor.email
      },
      slotsCreated: createdSlots.count
    };
    
  } catch (error) {
    console.error('❌ ERROR: Failed to create availability slots:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDrSumitSlots()
  .then(result => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });