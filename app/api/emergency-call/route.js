import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Initiate Emergency Call
export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { emergencyId, doctorId, callType = 'video' } = body;

    if (!emergencyId || !doctorId) {
      return NextResponse.json(
        { error: 'Emergency ID and Doctor ID required' },
        { status: 400 }
      );
    }

    // Verify emergency case exists
    const emergencyCase = await prisma.emergencyCase.findUnique({
      where: { id: emergencyId },
      include: { assignedDoctor: true }
    });

    if (!emergencyCase) {
      return NextResponse.json(
        { error: 'Emergency case not found' },
        { status: 404 }
      );
    }

    // Verify doctor availability
    const doctor = await prisma.doctor.findUnique({
      where: { 
        id: doctorId,
        status: 'VERIFIED',
        isOnline: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        }
      }
    });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not available' },
        { status: 404 }
      );
    }

    // Generate unique call session
    const callSessionId = uuidv4();
    const roomName = `emergency-${emergencyId}-${callSessionId}`;

    // Create emergency call record
    const emergencyCall = await prisma.emergencyCall.create({
      data: {
        id: callSessionId,
        emergencyId,
        doctorId,
        patientId: userId,
        callType,
        roomName,
        status: 'CONNECTING',
        startedAt: new Date()
      }
    });

    // Update emergency case with assigned doctor
    await prisma.emergencyCase.update({
      where: { id: emergencyId },
      data: {
        assignedDoctorId: doctorId,
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    });

    // Generate call tokens (for video calling service integration)
    const callTokens = await generateCallTokens(callSessionId, roomName, userId, doctorId);

    // Notify doctor about incoming emergency call
    await notifyDoctorEmergencyCall(doctorId, emergencyCall);

    return NextResponse.json({
      success: true,
      call: {
        id: callSessionId,
        roomName,
        status: 'CONNECTING',
        doctor: {
          id: doctor.id,
          name: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
          specialization: doctor.specialization,
          image: doctor.user.imageUrl
        },
        tokens: callTokens,
        estimatedConnectionTime: '30 seconds'
      }
    });

  } catch (error) {
    console.error('Emergency call initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate emergency call' },
      { status: 500 }
    );
  }
}

// Get Emergency Call Status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('id');

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID required' },
        { status: 400 }
      );
    }

    const emergencyCall = await prisma.emergencyCall.findUnique({
      where: { id: callId },
      include: {
        emergency: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!emergencyCall) {
      return NextResponse.json(
        { error: 'Emergency call not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      call: {
        id: emergencyCall.id,
        status: emergencyCall.status,
        startedAt: emergencyCall.startedAt,
        endedAt: emergencyCall.endedAt,
        duration: emergencyCall.duration,
        roomName: emergencyCall.roomName,
        doctor: {
          name: `Dr. ${emergencyCall.doctor.user.firstName} ${emergencyCall.doctor.user.lastName}`,
          specialization: emergencyCall.doctor.specialization,
          image: emergencyCall.doctor.user.imageUrl
        }
      }
    });

  } catch (error) {
    console.error('Get emergency call status error:', error);
    return NextResponse.json(
      { error: 'Failed to get call status' },
      { status: 500 }
    );
  }
}

// End Emergency Call
export async function PUT(request) {
  try {
    const body = await request.json();
    const { callId, endReason = 'completed' } = body;

    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID required' },
        { status: 400 }
      );
    }

    const emergencyCall = await prisma.emergencyCall.findUnique({
      where: { id: callId }
    });

    if (!emergencyCall) {
      return NextResponse.json(
        { error: 'Emergency call not found' },
        { status: 404 }
      );
    }

    // Calculate call duration
    const endTime = new Date();
    const duration = Math.floor((endTime - emergencyCall.startedAt) / 1000); // in seconds

    // Update call record
    await prisma.emergencyCall.update({
      where: { id: callId },
      data: {
        status: 'COMPLETED',
        endedAt: endTime,
        duration,
        endReason,
        updatedAt: new Date()
      }
    });

    // Update emergency case status
    await prisma.emergencyCase.update({
      where: { id: emergencyCall.emergencyId },
      data: {
        status: 'CONSULTATION_COMPLETED',
        updatedAt: new Date()
      }
    });

    // Generate consultation summary
    const consultationSummary = await generateConsultationSummary(emergencyCall.emergencyId, duration);

    return NextResponse.json({
      success: true,
      call: {
        id: callId,
        status: 'COMPLETED',
        duration,
        endedAt: endTime
      },
      consultation: consultationSummary
    });

  } catch (error) {
    console.error('End emergency call error:', error);
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    );
  }
}

// Generate Call Tokens for Video Service Integration
async function generateCallTokens(callSessionId, roomName, patientId, doctorId) {
  try {
    // In real implementation, integrate with services like:
    // - Agora
    // - Twilio Video
    // - Zoom SDK
    // - WebRTC
    
    // Simulated tokens
    return {
      patientToken: `patient_${callSessionId}_${Date.now()}`,
      doctorToken: `doctor_${callSessionId}_${Date.now()}`,
      roomId: roomName,
      appId: process.env.VIDEO_CALL_APP_ID || 'demo_app_id'
    };

  } catch (error) {
    console.error('Generate call tokens error:', error);
    return null;
  }
}

// Notify Doctor about Emergency Call
async function notifyDoctorEmergencyCall(doctorId, emergencyCall) {
  try {
    // In real implementation, this would:
    // 1. Send push notification to doctor's app
    // 2. Send SMS alert
    // 3. Update doctor dashboard
    // 4. Play emergency sound alert
    
    console.log(`Notifying doctor ${doctorId} about emergency call ${emergencyCall.id}`);
    
    // Create notification record
    await prisma.notification.create({
      data: {
        doctorId,
        type: 'EMERGENCY_CALL',
        title: 'Emergency Call Incoming',
        message: 'Patient needs immediate medical attention',
        data: JSON.stringify({
          callId: emergencyCall.id,
          emergencyId: emergencyCall.emergencyId,
          roomName: emergencyCall.roomName
        }),
        isRead: false
      }
    });

  } catch (error) {
    console.error('Error notifying doctor:', error);
  }
}

// Generate Consultation Summary
async function generateConsultationSummary(emergencyId, duration) {
  try {
    const emergencyCase = await prisma.emergencyCase.findUnique({
      where: { id: emergencyId },
      include: {
        assignedDoctor: {
          include: {
            user: true
          }
        }
      }
    });

    if (!emergencyCase) return null;

    const summary = {
      emergencyId,
      duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      doctor: `Dr. ${emergencyCase.assignedDoctor.user.firstName} ${emergencyCase.assignedDoctor.user.lastName}`,
      specialization: emergencyCase.assignedDoctor.specialization,
      consultationDate: new Date().toISOString(),
      symptoms: JSON.parse(emergencyCase.symptoms),
      diagnosis: 'Emergency consultation completed',
      followUpRequired: true,
      prescriptionGenerated: false
    };

    // Save consultation summary
    await prisma.consultation.create({
      data: {
        emergencyId,
        doctorId: emergencyCase.assignedDoctorId,
        patientId: emergencyCase.userId,
        duration,
        summary: JSON.stringify(summary),
        status: 'COMPLETED',
        type: 'EMERGENCY'
      }
    });

    return summary;

  } catch (error) {
    console.error('Generate consultation summary error:', error);
    return null;
  }
}