import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// KYC Verification Endpoint
export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { patientInfo, verification, emergencyId } = body;

    // Validate required documents
    if (!verification.aadhar || !verification.pan) {
      return NextResponse.json(
        { error: 'Aadhar and PAN are required for verification' },
        { status: 400 }
      );
    }

    // Validate Aadhar format (12 digits)
    if (!/^\d{12}$/.test(verification.aadhar)) {
      return NextResponse.json(
        { error: 'Invalid Aadhar number format' },
        { status: 400 }
      );
    }

    // Validate PAN format (5 letters, 4 digits, 1 letter)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(verification.pan)) {
      return NextResponse.json(
        { error: 'Invalid PAN number format' },
        { status: 400 }
      );
    }

    // Process verification payment (₹1)
    const paymentIntent = await createVerificationPayment();
    
    // Create or update KYC record
    const kycRecord = await prisma.kycVerification.upsert({
      where: { 
        userId: userId || 'anonymous'
      },
      update: {
        patientInfo: JSON.stringify(patientInfo),
        aadharNumber: verification.aadhar,
        panNumber: verification.pan,
        insuranceNumber: verification.insurance || null,
        verificationStatus: 'PENDING',
        verificationFee: 1.00,
        paymentIntentId: paymentIntent.id,
        updatedAt: new Date()
      },
      create: {
        userId: userId || 'anonymous',
        patientInfo: JSON.stringify(patientInfo),
        aadharNumber: verification.aadhar,
        panNumber: verification.pan,
        insuranceNumber: verification.insurance || null,
        verificationStatus: 'PENDING',
        verificationFee: 1.00,
        paymentIntentId: paymentIntent.id
      }
    });

    // Link KYC to emergency case if provided
    if (emergencyId) {
      await prisma.emergencyCase.update({
        where: { id: emergencyId },
        data: { 
          kycVerificationId: kycRecord.id,
          patientInfo: JSON.stringify(patientInfo)
        }
      });
    }

    // Simulate KYC verification process
    setTimeout(async () => {
      await completeKYCVerification(kycRecord.id);
    }, 3000); // 3 second delay to simulate processing

    return NextResponse.json({
      success: true,
      kycId: kycRecord.id,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount
      },
      message: 'KYC verification initiated. Payment required to complete.',
      estimatedVerificationTime: '2-5 minutes'
    });

  } catch (error) {
    console.error('KYC verification error:', error);
    return NextResponse.json(
      { error: 'KYC verification failed' },
      { status: 500 }
    );
  }
}

// Get KYC Status
export async function GET(request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const kycId = searchParams.get('id');

    if (!userId && !kycId) {
      return NextResponse.json(
        { error: 'User ID or KYC ID required' },
        { status: 400 }
      );
    }

    const kycRecord = await prisma.kycVerification.findFirst({
      where: kycId ? { id: kycId } : { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!kycRecord) {
      return NextResponse.json(
        { error: 'KYC record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      kyc: {
        id: kycRecord.id,
        status: kycRecord.verificationStatus,
        verifiedAt: kycRecord.verifiedAt,
        isVerified: kycRecord.verificationStatus === 'VERIFIED',
        patientInfo: JSON.parse(kycRecord.patientInfo),
        hasInsurance: !!kycRecord.insuranceNumber
      }
    });

  } catch (error) {
    console.error('Get KYC status error:', error);
    return NextResponse.json(
      { error: 'Failed to get KYC status' },
      { status: 500 }
    );
  }
}

// Create Verification Payment (₹1)
async function createVerificationPayment() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // ₹1 in paisa
      currency: 'inr',
      metadata: {
        type: 'kyc_verification',
        description: 'Identity verification fee'
      },
      description: 'KYC Identity Verification Fee'
    });

    return paymentIntent;
  } catch (error) {
    console.error('Create verification payment error:', error);
    throw error;
  }
}

// Complete KYC Verification (simulated)
async function completeKYCVerification(kycId) {
  try {
    // Simulate verification process with external APIs
    const verificationResult = await simulateDocumentVerification();
    
    await prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        verificationStatus: verificationResult.success ? 'VERIFIED' : 'REJECTED',
        verifiedAt: verificationResult.success ? new Date() : null,
        verificationDetails: JSON.stringify(verificationResult),
        updatedAt: new Date()
      }
    });

    // Send notification about verification status
    // In real implementation, send email/SMS notification

  } catch (error) {
    console.error('Complete KYC verification error:', error);
  }
}

// Simulate Document Verification
async function simulateDocumentVerification() {
  // Simulate external API calls for document verification
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% success rate for simulation
      const success = Math.random() > 0.05;
      resolve({
        success,
        aadharValid: success,
        panValid: success,
        verificationScore: success ? 95 : 45,
        message: success ? 'Documents verified successfully' : 'Document verification failed'
      });
    }, 2000);
  });
}