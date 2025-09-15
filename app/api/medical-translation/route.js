/**
 * Medical Translation API Routes
 * Handle real-time medical translation for consultations
 */

import { NextResponse } from 'next/server';
import RealMedicalTranslation from '@/lib/real-medical-translation';
import prisma from '@/lib/prisma';

// Global translation instances
const translationSessions = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        return await initializeTranslationSession(body);
      case 'translate':
        return await translateText(body);
      case 'realtime':
        return await realTimeTranslate(body);
      case 'store':
        return await storeTranslation(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Medical translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function initializeTranslationSession(data) {
  try {
    const {
      sessionId,
      sourceLanguage,
      targetLanguage,
      patientId,
      doctorId,
      medicalContext,
      realTime = true
    } = data;

    // Create new translation instance
    const translator = new RealMedicalTranslation();
    
    const config = {
      sessionId,
      sourceLanguage,
      targetLanguage,
      patientId,
      doctorId,
      medicalContext,
      realTime
    };

    const result = await translator.initializeSession(config);
    
    // Store translation instance
    translationSessions.set(sessionId, translator);

    // Store session in database
    await prisma.translationSession.create({
      data: {
        id: sessionId,
        patientId,
        doctorId,
        sourceLanguage,
        targetLanguage,
        medicalContext,
        realTimeEnabled: realTime,
        status: 'ACTIVE',
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Translation session initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize translation session', details: error.message },
      { status: 500 }
    );
  }
}

async function translateText(data) {
  try {
    const {
      sessionId,
      text,
      sourceLanguage,
      targetLanguage,
      speaker = 'unknown',
      isUrgent = false,
      medicalTerms = true
    } = data;

    const translator = translationSessions.get(sessionId);
    if (!translator) {
      return NextResponse.json(
        { error: 'Translation session not found' },
        { status: 404 }
      );
    }

    const options = {
      sourceLanguage,
      targetLanguage,
      isUrgent,
      speaker,
      medicalTerms
    };

    const result = await translator.translateMedicalText(text, options);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Text translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function realTimeTranslate(data) {
  try {
    const {
      sessionId,
      text,
      speaker = 'unknown',
      isDoctor = false,
      priority = 'normal'
    } = data;

    const translator = translationSessions.get(sessionId);
    if (!translator) {
      return NextResponse.json(
        { error: 'Translation session not found' },
        { status: 404 }
      );
    }

    const options = {
      speaker,
      isDoctor,
      priority
    };

    const result = await translator.realTimeTranslate(text, options);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Real-time translation error:', error);
    return NextResponse.json(
      { error: 'Real-time translation failed', details: error.message },
      { status: 500 }
    );
  }
}

async function storeTranslation(data) {
  try {
    const { translation } = data;

    // Store translation in database
    await prisma.medicalTranslation.create({
      data: {
        id: translation.id,
        sessionId: translation.sessionId,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        speaker: translation.speaker,
        isUrgent: translation.isUrgent,
        confidence: translation.confidence,
        medicalTermsDetected: JSON.stringify(translation.medicalTermsDetected),
        timestamp: translation.timestamp,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Translation stored successfully'
    });

  } catch (error) {
    console.error('Translation storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store translation', details: error.message },
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

    const translator = translationSessions.get(sessionId);
    if (!translator) {
      return NextResponse.json(
        { error: 'Translation session not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'history':
        return await getTranslationHistory(request, translator);
      case 'stats':
        return getSessionStats(translator);
      case 'languages':
        return getSupportedLanguages(translator);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Translation API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function getTranslationHistory(request, translator) {
  const { searchParams } = new URL(request.url);
  const speaker = searchParams.get('speaker');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const medicalTermsOnly = searchParams.get('medicalTermsOnly') === 'true';
  const limit = parseInt(searchParams.get('limit')) || 50;

  const filters = {
    speaker,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    medicalTermsOnly,
    limit
  };

  const history = translator.getTranslationHistory(filters);

  return NextResponse.json({
    success: true,
    data: history
  });
}

function getSessionStats(translator) {
  const stats = translator.getSessionStats();

  return NextResponse.json({
    success: true,
    data: stats
  });
}

function getSupportedLanguages(translator) {
  const languages = translator.getSupportedLanguages();

  return NextResponse.json({
    success: true,
    data: languages
  });
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

    const translator = translationSessions.get(sessionId);
    if (!translator) {
      return NextResponse.json(
        { error: 'Translation session not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'switch_languages':
        return await switchLanguages(body, translator);
      case 'end_session':
        return await endTranslationSession(body, translator);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Translation API PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function switchLanguages(data, translator) {
  try {
    const { sourceLanguage, targetLanguage } = data;

    const result = translator.switchLanguages(sourceLanguage, targetLanguage);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Language switch error:', error);
    return NextResponse.json(
      { error: 'Failed to switch languages', details: error.message },
      { status: 500 }
    );
  }
}

async function endTranslationSession(data, translator) {
  try {
    const { sessionId, stats } = data;

    // End translator session
    const result = await translator.endSession();

    // Update database session
    await prisma.translationSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        totalTranslations: stats.totalTranslations,
        averageConfidence: stats.averageConfidence,
        medicalTermsTranslated: stats.medicalTermsTranslated,
        endedAt: new Date()
      }
    });

    // Remove from active sessions
    translationSessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Session end error:', error);
    return NextResponse.json(
      { error: 'Failed to end session', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Force end session
    const translator = translationSessions.get(sessionId);
    if (translator) {
      await translator.endSession();
      translationSessions.delete(sessionId);
    }

    // Update database
    await prisma.translationSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        endedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Translation session cancelled'
    });

  } catch (error) {
    console.error('Translation session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel session', details: error.message },
      { status: 500 }
    );
  }
}