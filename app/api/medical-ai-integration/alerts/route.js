/**
 * Medical AI Integration Alerts API
 * Handle integrated alerts from all AI systems
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      patientId,
      doctorId,
      alert
    } = body;

    // Store integrated alert
    const alertRecord = await prisma.medicalAIAlert.create({
      data: {
        sessionId,
        patientId,
        doctorId,
        alertType: alert.type,
        severity: alert.severity,
        message: alert.message,
        alertData: JSON.stringify(alert.data),
        requiresImmediateAction: alert.requiresImmedateAction || false,
        acknowledged: false,
        timestamp: new Date(),
        createdAt: new Date()
      }
    });

    // Send notification to medical staff
    await prisma.notification.create({
      data: {
        doctorId,
        type: 'MEDICAL_AI_ALERT',
        title: `Medical AI Alert: ${alert.type}`,
        message: alert.message,
        data: JSON.stringify({
          alertId: alertRecord.id,
          severity: alert.severity,
          requiresImmedateAction: alert.requiresImmedateAction
        }),
        isRead: false,
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Medical AI alert created',
      alertId: alertRecord.id
    });

  } catch (error) {
    console.error('Medical AI alert creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create medical AI alert', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const severity = searchParams.get('severity');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const whereClause = { sessionId };
    if (severity) {
      whereClause.severity = severity.toUpperCase();
    }

    const alerts = await prisma.medicalAIAlert.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: {
        patient: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Medical AI alerts retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve medical AI alerts', details: error.message },
      { status: 500 }
    );
  }
}