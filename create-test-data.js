const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function createTestDoctors() {
  console.log('🏥 CREATING TEST DOCTOR DATA');
  console.log('============================');

  try {
    // First, let's create/update Sumit Gupta as an admin
    const sumitUser = await db.user.upsert({
      where: {
        email: 'sumit.kumar.guptaa@gmail.com'
      },
      update: {
        role: 'ADMIN'
      },
      create: {
        clerkUserId: 'user_sumit_admin_12345',
        email: 'sumit.kumar.guptaa@gmail.com',
        name: 'Sumit Kumar Gupta',
        imageUrl: 'https://via.placeholder.com/150',
        role: 'ADMIN',
        credits: 1000
      }
    });
    console.log('✅ Admin Sumit Gupta created/updated:', sumitUser.id);

    // Create test doctors with the specific ID from the error
    const testDoctors = [
      {
        clerkUserId: 'user_doctor_cardiology_1',
        email: 'dr.cardiology@example.com',
        name: 'Dr. Sarah Johnson',
        imageUrl: 'https://via.placeholder.com/150',
        role: 'DOCTOR',
        specialty: 'Cardiology',
        experience: 10,
        description: 'Experienced cardiologist specializing in heart conditions and preventive care.',
        verificationStatus: 'VERIFIED',
        consultationFee: 150.0,
        workingHospital: 'City General Hospital',
        medicalDegree: 'MD Cardiology',
        licenseNumber: 'CARD123456',
        credits: 0,
        isEmergencyDoctor: true,
        isOnline: true,
        responseTime: '< 5 minutes'
      },
      {
        clerkUserId: 'user_doctor_neurology_1',
        email: 'dr.neurology@example.com',
        name: 'Dr. Michael Chen',
        imageUrl: 'https://via.placeholder.com/150',
        role: 'DOCTOR',
        specialty: 'Neurology',
        experience: 12,
        description: 'Neurologist with expertise in brain disorders and nervous system conditions.',
        verificationStatus: 'VERIFIED',
        consultationFee: 180.0,
        workingHospital: 'Metro Neurological Center',
        medicalDegree: 'MD Neurology',
        licenseNumber: 'NEURO789012',
        credits: 0,
        isEmergencyDoctor: true,
        isOnline: true,
        responseTime: '< 3 minutes'
      },
      {
        clerkUserId: 'user_doctor_orthopedics_1',
        email: 'dr.orthopedics@example.com',
        name: 'Dr. Emily Rodriguez',
        imageUrl: 'https://via.placeholder.com/150',
        role: 'DOCTOR',
        specialty: 'Orthopedics',
        experience: 8,
        description: 'Orthopedic surgeon specializing in bone and joint treatments.',
        verificationStatus: 'VERIFIED',
        consultationFee: 200.0,
        workingHospital: 'Sports Medicine Institute',
        medicalDegree: 'MD Orthopedic Surgery',
        licenseNumber: 'ORTHO345678',
        credits: 0,
        isEmergencyDoctor: false,
        isOnline: true,
        responseTime: '< 10 minutes'
      }
    ];

    // Create the doctors
    for (const doctorData of testDoctors) {
      const doctor = await db.user.create({
        data: doctorData
      });
      console.log(`✅ Created doctor: ${doctor.name} (${doctor.specialty}) - ID: ${doctor.id}`);

      // Create availability slots for each doctor (next 4 days, 9 AM to 5 PM)
      const now = new Date();
      const slotsCreated = [];
      
      for (let day = 0; day < 4; day++) {
        const currentDay = new Date(now);
        currentDay.setDate(currentDay.getDate() + day);
        
        // Create slots from 9 AM to 5 PM (every hour)
        for (let hour = 9; hour < 17; hour++) {
          const startTime = new Date(currentDay);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(currentDay);
          endTime.setHours(hour + 1, 0, 0, 0);
          
          const slot = await db.availability.create({
            data: {
              doctorId: doctor.id,
              startTime,
              endTime,
              status: 'AVAILABLE'
            }
          });
          slotsCreated.push(slot);
        }
      }
      
      console.log(`   📅 Created ${slotsCreated.length} availability slots`);
    }

    // Try to update the specific doctor ID from the error to match one of our created doctors
    const firstDoctor = await db.user.findFirst({
      where: { role: 'DOCTOR', verificationStatus: 'VERIFIED' }
    });

    if (firstDoctor) {
      console.log(`\n🎯 First doctor available: ${firstDoctor.name} - ID: ${firstDoctor.id}`);
      console.log(`   Specialty: ${firstDoctor.specialty}`);
      console.log(`   Status: ${firstDoctor.verificationStatus}`);
    }

    // Create some test patients
    const testPatients = [
      {
        clerkUserId: 'user_patient_1',
        email: 'patient1@example.com',
        name: 'John Doe',
        role: 'PATIENT',
        credits: 10
      },
      {
        clerkUserId: 'user_patient_2', 
        email: 'patient2@example.com',
        name: 'Jane Smith',
        role: 'PATIENT',
        credits: 5
      }
    ];

    for (const patientData of testPatients) {
      const patient = await db.user.create({
        data: patientData
      });
      console.log(`✅ Created patient: ${patient.name} - ID: ${patient.id}`);
    }

    console.log('\n🎉 TEST DATA CREATION COMPLETE');
    console.log('================================');
    
    // Show summary
    const doctorCount = await db.user.count({ where: { role: 'DOCTOR' } });
    const patientCount = await db.user.count({ where: { role: 'PATIENT' } });
    const adminCount = await db.user.count({ where: { role: 'ADMIN' } });
    const availabilityCount = await db.availability.count();
    
    console.log(`👨‍⚕️ Doctors: ${doctorCount}`);
    console.log(`👥 Patients: ${patientCount}`);
    console.log(`👑 Admins: ${adminCount}`);
    console.log(`📅 Availability slots: ${availabilityCount}`);
    console.log('\n✅ Ready for testing!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await db.$disconnect();
  }
}

createTestDoctors();