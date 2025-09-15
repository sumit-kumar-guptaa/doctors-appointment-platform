/**
 * Emotion Analysis Alerts API
 * Handle emotion-based medical alerts
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
      alerts,
      timestamp
    } = body;

    // Store emotional alerts in database
    const alertRecords = [];

    for (const alert of alerts) {
      const alertRecord = await prisma.emotionAlert.create({
        data: {
          sessionId,
          patientId,
          doctorId,
          alertType: alert.type,
          severity: alert.severity,
          message: alert.message,
          emotionData: JSON.stringify(alert.emotionData),
          acknowledged: false,
          timestamp: alert.timestamp,
          createdAt: new Date()
        }
      });
      
      alertRecords.push(alertRecord);
    }

    // Send real-time notifications to medical staff
    await sendEmotionNotifications(alertRecords, doctorId);

    return NextResponse.json({
      success: true,
      message: 'Emotional alerts processed',
      alertsCreated: alertRecords.length
    });

  } catch (error) {
    console.error('Emotion alerts API error:', error);
    return NextResponse.json(
      { error: 'Failed to process emotional alerts', details: error.message },
      { status: 500 }
    );
  }
}

async function sendEmotionNotifications(alertRecords, doctorId) {
  try {
    // Create notifications for doctor
    for (const alert of alertRecords) {
      await prisma.notification.create({
        data: {
          doctorId,
          type: 'EMOTIONAL_ALERT',
          title: 'Patient Emotional Alert',
          message: alert.message,
          data: JSON.stringify({
            alertId: alert.id,
            alertType: alert.alertType,
            severity: alert.severity,
            emotionData: JSON.parse(alert.emotionData)
          }),
          isRead: false,
          createdAt: new Date()
        }
      });
    }

    console.log(`Emotion notifications sent for ${alertRecords.length} alerts`);
  } catch (error) {
    console.error('Error sending emotion notifications:', error);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const severity = searchParams.get('severity');

    const whereClause = { sessionId };
    if (severity) {
      whereClause.severity = severity;
    }

    const alerts = await prisma.emotionAlert.findMany({
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
    console.error('Emotion alerts retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve emotional alerts', details: error.message },
      { status: 500 }
    );
  }
}