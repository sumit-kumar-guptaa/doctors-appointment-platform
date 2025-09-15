// API Route: /api/medical-diagnosis
// Handles real medical diagnosis storage and retrieval

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { RealMedicalDiagnosis } from '@/lib/real-medical-diagnosis';

const prisma = new PrismaClient();
const diagnosisEngine = new RealMedicalDiagnosis();

export async function POST(request) {
  try {
    const diagnosisData = await request.json();
    
    // Validate required fields
    if (!diagnosisData.patientId || !diagnosisData.sessionId) {
      return NextResponse.json(
        { error: 'Patient ID and Session ID are required' },
        { status: 400 }
      );
    }

    // Save diagnosis to database
    const diagnosis = await prisma.medicalDiagnosis.create({
      data: {
        patientId: diagnosisData.patientId,
        sessionId: diagnosisData.sessionId,
        rawAnalysis: diagnosisData.rawAnalysis,
        structuredDiagnosis: JSON.stringify(diagnosisData.structured),
        confidenceLevel: diagnosisData.structured?.confidenceLevel || 0,
        riskAssessment: JSON.stringify(diagnosisData.structured?.riskAssessment || {}),
        timestamp: new Date(diagnosisData.timestamp),
        appointmentId: diagnosisData.appointmentId || null,
        patientSymptoms: JSON.stringify(diagnosisData.patientData?.symptoms || []),
        patientVitals: JSON.stringify(diagnosisData.patientData?.vitals || {})
      }
    });

    // Check if immediate attention is required
    const riskAssessment = diagnosisData.structured?.riskAssessment;
    if (riskAssessment?.requiresImmediateAttention) {
      // Send urgent alert to healthcare provider
      await sendUrgentMedicalAlert(diagnosisData);
    }

    return NextResponse.json({
      success: true,
      diagnosisId: diagnosis.id,
      requiresImmediateAttention: riskAssessment?.requiresImmediateAttention || false
    });

  } catch (error) {
    console.error('Medical diagnosis storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store medical diagnosis' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');

    let where = {};
    if (patientId) where.patientId = patientId;
    if (sessionId) where.sessionId = sessionId;

    const diagnoses = await prisma.medicalDiagnosis.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Parse JSON fields
    const parsedDiagnoses = diagnoses.map(diagnosis => ({
      ...diagnosis,
      structuredDiagnosis: JSON.parse(diagnosis.structuredDiagnosis || '{}'),
      riskAssessment: JSON.parse(diagnosis.riskAssessment || '{}'),
      patientSymptoms: JSON.parse(diagnosis.patientSymptoms || '[]'),
      patientVitals: JSON.parse(diagnosis.patientVitals || '{}')
    }));

    return NextResponse.json({
      success: true,
      diagnoses: parsedDiagnoses
    });

  } catch (error) {
    console.error('Medical diagnosis retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve medical diagnoses' },
      { status: 500 }
    );
  }
}

// Process new diagnosis request
export async function PUT(request) {
  try {
    const patientData = await request.json();
    
    // Initialize diagnosis engine if needed
    if (!diagnosisEngine.medicalKnowledgeBase) {
      await diagnosisEngine.initialize();
    }
    
    // Perform real AI medical analysis
    const diagnosisResult = await diagnosisEngine.analyzeMedicalCase(patientData);
    
    if (!diagnosisResult.success) {
      return NextResponse.json({
        success: false,
        error: diagnosisResult.error,
        fallbackDiagnosis: diagnosisResult.fallbackDiagnosis
      }, { status: 422 });
    }
    
    return NextResponse.json({
      success: true,
      diagnosis: diagnosisResult.diagnosis,
      requiresImmediateAttention: diagnosisResult.diagnosis.structured?.riskAssessment?.requiresImmediateAttention || false
    });

  } catch (error) {
    console.error('Medical diagnosis analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze medical case' },
      { status: 500 }
    );
  }
}

// Send urgent medical alert
async function sendUrgentMedicalAlert(diagnosisData) {
  try {
    await prisma.urgentMedicalAlert.create({
      data: {
        patientId: diagnosisData.patientId,
        sessionId: diagnosisData.sessionId,
        alertType: 'high_risk_diagnosis',
        diagnosisId: diagnosisData.id,
        riskLevel: diagnosisData.structured?.riskAssessment?.level || 'high',
        alertMessage: `High-risk medical condition detected for patient. Immediate medical attention recommended.`,
        redFlags: JSON.stringify(diagnosisData.structured?.redFlags || []),
        timestamp: new Date(),
        acknowledged: false
      }
    });

    // Here you would integrate with:
    // - Hospital alert systems
    // - Emergency response protocols  
    // - Healthcare provider notifications
    // - Electronic health record systems

    console.log('Urgent medical alert sent for patient:', diagnosisData.patientId);
    
  } catch (error) {
    console.error('Failed to send urgent medical alert:', error);
  }
}