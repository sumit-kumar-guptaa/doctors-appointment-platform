require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAppointmentBooking() {
  try {
    console.log('🧪 Testing appointment booking system...');
    
    // Find a patient and doctor
    const patient = await prisma.user.findFirst({
      where: { role: 'PATIENT' }
    });
    
    const doctor = await prisma.user.findFirst({
      where: { 
        role: 'DOCTOR',
        verificationStatus: 'VERIFIED'
      }
    });
    
    if (!patient || !doctor) {
      console.log('❌ Missing patient or doctor data');
      return;
    }
    
    console.log('👤 Patient:', patient.name, '(Credits:', patient.credits + ')');
    console.log('👨‍⚕️ Doctor:', doctor.name);
    
    // Test the video session creation
    console.log('\n🎥 Testing video session creation...');
    
    const sessionId = process.env.VONAGE_SESSION_ID;
    const applicationId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID;
    const token = process.env.VONAGE_TOKEN;
    
    console.log('Session ID:', sessionId ? sessionId.substring(0, 20) + '...' : 'NOT SET');
    console.log('Application ID:', applicationId || 'NOT SET');
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'NOT SET');
    
    if (sessionId && applicationId && token) {
      console.log('✅ All video components available');
      
      // Create a test appointment
      console.log('\n📅 Creating test appointment...');
      
      const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes duration
      
      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          startTime,
          endTime,
          patientDescription: 'Test appointment for video integration',
          status: 'SCHEDULED',
          videoSessionId: sessionId,
          videoSessionToken: token
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
      
      console.log('✅ Test appointment created successfully!');
      console.log('Appointment ID:', appointment.id);
      console.log('Patient:', appointment.patient.name);
      console.log('Doctor:', appointment.doctor.name);
      console.log('Start Time:', appointment.startTime);
      console.log('Video Session ID:', appointment.videoSessionId.substring(0, 20) + '...');
      
      return appointment;
    } else {
      console.log('❌ Missing video session components');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAppointmentBooking();