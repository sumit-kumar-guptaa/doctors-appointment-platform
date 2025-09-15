/**
 * Medical AI Integration API Routes
 * Handle comprehensive medical AI system integration
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        return await initializeIntegratedSession(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Medical AI integration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function initializeIntegratedSession(data) {
  try {
    const {
      sessionId,
      patientId,
      doctorId,
      appointmentId,
      systemsEnabled,
      initializationResults
    } = data;

    // Count successful initializations
    const successfulSystems = Object.values(initializationResults)
      .filter(result => result.success).length;

    // Store integrated session
    await prisma.medicalAISession.create({
      data: {
        id: sessionId,
        patientId,
        doctorId,
        appointmentId,
        healthMonitoringEnabled: systemsEnabled.healthMonitoring,
        medicalDiagnosisEnabled: systemsEnabled.medicalDiagnosis,
        translationEnabled: systemsEnabled.translation,
        emotionAnalysisEnabled: systemsEnabled.emotionAnalysis,
        drugInteractionsEnabled: systemsEnabled.drugInteractions,
        systemsInitialized: successfulSystems,
        initializationData: JSON.stringify(initializationResults),
        status: 'ACTIVE',
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Medical AI integration session initialized',
      sessionId,
      systemsInitialized: successfulSystems
    });

  } catch (error) {
    console.error('Integrated session initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize integrated session', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const action = searchParams.get('action');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'status':
        return await getSessionStatus(sessionId);
      case 'summary':
        return await getComprehensiveSummary(sessionId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Medical AI integration GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function getSessionStatus(sessionId) {
  try {
    const session = await prisma.medicalAISession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      { error: 'Failed to get session status', details: error.message },
      { status: 500 }
    );
  }
}

async function getComprehensiveSummary(sessionId) {
  try {
    // Get all related data for comprehensive summary
    const [
      session,
      healthMeasurements,
      emotionAnalysis,
      medicalDiagnoses,
      drugInteractions,
      translations
    ] = await Promise.all([
      prisma.medicalAISession.findUnique({
        where: { id: sessionId }
      }),
      prisma.healthMeasurement.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      prisma.emotionAnalysis.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      prisma.medicalDiagnosis.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: 5
      }),
      prisma.drugInteractionCheck.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      prisma.medicalTranslation.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: 20
      })
    ]);

    const summary = {
      session,
      healthData: {
        measurements: healthMeasurements,
        latestVitals: healthMeasurements[0] || null
      },
      emotionalData: {
        analyses: emotionAnalysis,
        currentState: emotionAnalysis[0] || null
      },
      medicalData: {
        diagnoses: medicalDiagnoses,
        latestDiagnosis: medicalDiagnoses[0] || null
      },
      drugData: {
        interactionChecks: drugInteractions,
        highRiskChecks: drugInteractions.filter(check => 
          check.riskLevel === 'high' || check.riskLevel === 'critical'
        )
      },
      translationData: {
        translations: translations,
        translationCount: translations.length
      }
    };

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error getting comprehensive summary:', error);
    return NextResponse.json(
      { error: 'Failed to get comprehensive summary', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { action, sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'end_session':
        return await endIntegratedSession(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Medical AI integration PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function endIntegratedSession(data) {
  try {
    const { sessionId, endResults, sessionEndTime } = data;

    // Update session with end results
    await prisma.medicalAISession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endResults: JSON.stringify(endResults),
        endedAt: new Date(sessionEndTime)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Medical AI integration session ended successfully'
    });

  } catch (error) {
    console.error('Integrated session end error:', error);
    return NextResponse.json(
      { error: 'Failed to end integrated session', details: error.message },
      { status: 500 }
    );
  }
}