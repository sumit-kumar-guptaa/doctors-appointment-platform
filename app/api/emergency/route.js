import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/prisma';

// Emergency Assessment Endpoint
export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { symptoms, description, patientInfo, severity } = body;

    // AI-powered emergency assessment
    const emergencyScore = calculateEmergencyScore(symptoms, description);
    const isEmergency = emergencyScore >= 7 || severity === 'critical';
    
    // Create emergency record
    const emergencyRecord = await prisma.emergencyCase.create({
      data: {
        userId: userId || null,
        symptoms: JSON.stringify(symptoms),
        description,
        patientInfo: JSON.stringify(patientInfo),
        emergencyScore,
        isEmergency,
        status: isEmergency ? 'URGENT' : 'CONSULTATION',
        createdAt: new Date()
      }
    });

    if (isEmergency) {
      // Find available emergency doctors
      const availableDoctors = await findEmergencyDoctors();
      
      // Notify emergency doctors
      await notifyEmergencyDoctors(emergencyRecord.id, availableDoctors);
      
      return NextResponse.json({
        success: true,
        isEmergency: true,
        emergencyId: emergencyRecord.id,
        availableDoctors,
        message: 'Emergency detected. Connecting to available doctors.',
        estimatedResponseTime: '< 2 minutes'
      });
    } else {
      return NextResponse.json({
        success: true,
        isEmergency: false,
        emergencyId: emergencyRecord.id,
        message: 'Non-emergency case. Starting chat consultation.',
        recommendedAction: 'chat_consultation'
      });
    }

  } catch (error) {
    console.error('Emergency assessment error:', error);
    return NextResponse.json(
      { error: 'Emergency assessment failed' },
      { status: 500 }
    );
  }
}

// Get Emergency Status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const emergencyId = searchParams.get('id');

    if (!emergencyId) {
      return NextResponse.json(
        { error: 'Emergency ID required' },
        { status: 400 }
      );
    }

    const emergencyCase = await prisma.emergencyCase.findUnique({
      where: { id: emergencyId },
      include: {
        assignedDoctor: true,
        consultations: true
      }
    });

    if (!emergencyCase) {
      return NextResponse.json(
        { error: 'Emergency case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      emergency: emergencyCase,
      status: emergencyCase.status,
      assignedDoctor: emergencyCase.assignedDoctor
    });

  } catch (error) {
    console.error('Get emergency status error:', error);
    return NextResponse.json(
      { error: 'Failed to get emergency status' },
      { status: 500 }
    );
  }
}

// Calculate Emergency Score (0-10 scale)
function calculateEmergencyScore(symptoms, description) {
  let score = 0;
  
  // Critical symptom mappings
  const criticalSymptoms = {
    'chest_pain': 8,
    'breathing': 9,
    'stroke': 10,
    'allergic': 8,
    'unconscious': 10,
    'accident': 7
  };
  
  // Urgent symptom mappings
  const urgentSymptoms = {
    'severe_pain': 6,
    'bleeding': 7,
    'fever_high': 5,
    'other': 3
  };

  // Score based on selected symptoms
  symptoms.forEach(symptom => {
    if (criticalSymptoms[symptom]) {
      score = Math.max(score, criticalSymptoms[symptom]);
    } else if (urgentSymptoms[symptom]) {
      score = Math.max(score, urgentSymptoms[symptom]);
    }
  });

  // Analyze description for emergency keywords
  const emergencyKeywords = {
    'heart attack': 10,
    'chest pain': 8,
    'can\'t breathe': 9,
    'difficulty breathing': 8,
    'stroke': 10,
    'unconscious': 10,
    'severe pain': 7,
    'heavy bleeding': 8,
    'overdose': 9,
    'allergic reaction': 7,
    'accident': 7
  };

  const lowerDescription = description.toLowerCase();
  Object.entries(emergencyKeywords).forEach(([keyword, keywordScore]) => {
    if (lowerDescription.includes(keyword)) {
      score = Math.max(score, keywordScore);
    }
  });

  return Math.min(score, 10); // Cap at 10
}

// Find Available Emergency Doctors
async function findEmergencyDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        status: 'VERIFIED',
        isOnline: true,
        specialization: {
          in: ['Emergency Medicine', 'General Medicine', 'Internal Medicine', 'Cardiology']
        }
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        specialization: true,
        rating: true,
        responseTime: true,
        consultationFee: true,
        isOnline: true
      },
      orderBy: [
        { isOnline: 'desc' },
        { rating: 'desc' },
        { responseTime: 'asc' }
      ],
      take: 5
    });

    return doctors.map(doctor => ({
      id: doctor.id,
      name: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
      specialization: doctor.specialization,
      rating: doctor.rating || 4.5,
      responseTime: doctor.responseTime || '< 3 minutes',
      isOnline: doctor.isOnline,
      image: doctor.user.imageUrl || '/api/placeholder/60/60',
      consultationFee: doctor.consultationFee
    }));

  } catch (error) {
    console.error('Error finding emergency doctors:', error);
    return [];
  }
}

// Notify Emergency Doctors
async function notifyEmergencyDoctors(emergencyId, doctors) {
  try {
    // In real implementation, this would:
    // 1. Send push notifications to doctors
    // 2. Send SMS alerts
    // 3. Update doctor dashboards
    // 4. Log notification attempts
    
    console.log(`Notifying ${doctors.length} emergency doctors for case ${emergencyId}`);
    
    // Create notification records
    const notifications = doctors.map(doctor => ({
      doctorId: doctor.id,
      emergencyId,
      type: 'EMERGENCY_ALERT',
      message: 'New emergency case requiring immediate attention',
      sentAt: new Date()
    }));

    // In real implementation, save to database
    // await prisma.emergencyNotification.createMany({ data: notifications });

  } catch (error) {
    console.error('Error notifying emergency doctors:', error);
  }
}