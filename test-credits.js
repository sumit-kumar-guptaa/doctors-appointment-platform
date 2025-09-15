require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCreditTransaction() {
  try {
    console.log('💳 Testing credit transaction for appointment booking...');
    
    // Find a patient with credits and a doctor
    const patient = await prisma.user.findFirst({
      where: { 
        role: 'PATIENT',
        credits: { gt: 1 }
      }
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
    
    console.log('👤 Patient:', patient.name, '- Credits before:', patient.credits);
    console.log('👨‍⚕️ Doctor:', doctor.name, '- Credits before:', doctor.credits);
    
    // Test the credit deduction
    const APPOINTMENT_CREDIT_COST = 2;
    
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction record for patient (deduction)
      await tx.creditTransaction.create({
        data: {
          userId: patient.id,
          amount: -APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
          description: `Appointment booking - ${APPOINTMENT_CREDIT_COST} credits deducted`,
        },
      });

      // Create transaction record for doctor (addition)
      await tx.creditTransaction.create({
        data: {
          userId: doctor.id,
          amount: APPOINTMENT_CREDIT_COST,
          type: "APPOINTMENT_DEDUCTION",
          description: `Appointment booking - ${APPOINTMENT_CREDIT_COST} credits earned`,
        },
      });

      // Update patient's credit balance (decrement)
      const updatedPatient = await tx.user.update({
        where: {
          id: patient.id,
        },
        data: {
          credits: {
            decrement: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      // Update doctor's credit balance (increment)
      const updatedDoctor = await tx.user.update({
        where: {
          id: doctor.id,
        },
        data: {
          credits: {
            increment: APPOINTMENT_CREDIT_COST,
          },
        },
      });

      return { updatedPatient, updatedDoctor };
    });

    console.log('✅ Credit transaction completed successfully!');
    console.log('👤 Patient credits after:', result.updatedPatient.credits);
    console.log('👨‍⚕️ Doctor credits after:', result.updatedDoctor.credits);
    
    // Check the transaction records
    const patientTransactions = await prisma.creditTransaction.findMany({
      where: { userId: patient.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    const doctorTransactions = await prisma.creditTransaction.findMany({
      where: { userId: doctor.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    console.log('\n📊 Transaction Records:');
    console.log('Patient transaction:', patientTransactions[0]?.description);
    console.log('Doctor transaction:', doctorTransactions[0]?.description);
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Credit transaction test failed:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

testCreditTransaction();