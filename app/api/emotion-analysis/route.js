/**
 * Emotion Analysis API Routes
 * Handle real-time emotion detection and medical emotional indicators
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        return await initializeEmotionSession(body);
      case 'store':
        return await storeEmotionData(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Emotion analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function initializeEmotionSession(data) {
  try {
    const {
      sessionId,
      patientId,
      doctorId,
      config
    } = data;

    // Store emotion session in database
    await db.emotionSession.create({
      data: {
        id: sessionId,
        patientId,
        doctorId,
        monitoringMode: config.monitoringMode,
        alertsEnabled: config.alertsEnabled,
        recordingEnabled: config.recordingEnabled,
        status: 'ACTIVE',
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Emotion session initialized',
      sessionId
    });

  } catch (error) {
    console.error('Emotion session initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize emotion session', details: error.message },
      { status: 500 }
    );
  }
}

async function storeEmotionData(data) {
  try {
    const {
      sessionId,
      patientId,
      emotionData
    } = data;

    // Store emotion analysis record
    await db.emotionAnalysis.create({
      data: {
        sessionId,
        patientId,
        emotionData: JSON.stringify(emotionData.emotions),
        medicalIndicators: JSON.stringify(emotionData.medicalIndicators),
        stressLevel: emotionData.emotions.stress_level.percentage,
        anxietyLevel: emotionData.emotions.anxiety_level.percentage,
        painIndication: emotionData.emotions.pain_indication.percentage,
        psychologicalDistress: emotionData.emotions.psychological_distress.percentage,
        confidence: emotionData.confidence,
        timestamp: emotionData.timestamp,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Emotion data stored successfully'
    });

  } catch (error) {
    console.error('Emotion data storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store emotion data', details: error.message },
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
      case 'history':
        return await getEmotionHistory(request);
      case 'stats':
        return await getEmotionStats(request);
      case 'alerts':
        return await getEmotionAlerts(request);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Emotion analysis GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function getEmotionHistory(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit')) || 100;

    const emotionHistory = await db.emotionAnalysis.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: emotionHistory
    });

  } catch (error) {
    console.error('Emotion history retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to get emotion history', details: error.message },
      { status: 500 }
    );
  }
}

async function getEmotionStats(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    const stats = await db.emotionAnalysis.aggregate({
      where: { sessionId },
      _avg: {
        stressLevel: true,
        anxietyLevel: true,
        painIndication: true,
        psychologicalDistress: true,
        confidence: true
      },
      _max: {
        stressLevel: true,
        anxietyLevel: true,
        painIndication: true,
        psychologicalDistress: true
      },
      _count: true
    });

    const alertCount = await db.emotionAlert.count({
      where: { sessionId }
    });

    return NextResponse.json({
      success: true,
      data: {
        averages: stats._avg,
        maximums: stats._max,
        totalRecords: stats._count,
        totalAlerts: alertCount
      }
    });

  } catch (error) {
    console.error('Emotion stats retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to get emotion stats', details: error.message },
      { status: 500 }
    );
  }
}

async function getEmotionAlerts(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const acknowledged = searchParams.get('acknowledged') === 'true';

    const alerts = await db.emotionAlert.findMany({
      where: {
        sessionId,
        acknowledged: acknowledged ? true : undefined
      },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Emotion alerts retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to get emotion alerts', details: error.message },
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
        return await endEmotionSession(body);
      case 'acknowledge_alert':
        return await acknowledgeEmotionAlert(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Emotion analysis PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function endEmotionSession(data) {
  try {
    const { sessionId, finalStats } = data;

    // Update emotion session
    await db.emotionSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        totalRecords: finalStats.totalRecords,
        sessionDuration: finalStats.sessionDuration,
        endedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Emotion session ended successfully'
    });

  } catch (error) {
    console.error('Emotion session end error:', error);
    return NextResponse.json(
      { error: 'Failed to end emotion session', details: error.message },
      { status: 500 }
    );
  }
}

async function acknowledgeEmotionAlert(data) {
  try {
    const { alertId, acknowledgedBy } = data;

    await db.emotionAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Emotion alert acknowledged'
    });

  } catch (error) {
    console.error('Emotion alert acknowledgment error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert', details: error.message },
      { status: 500 }
    );
  }
}