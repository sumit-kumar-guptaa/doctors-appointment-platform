// API Route: /api/health-alerts  
// Handles real-time health alerts for healthcare providers

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const alertData = await request.json();
    
    // Store alert in database
    const alert = await prisma.healthAlert.create({
      data: {
        sessionId: alertData.sessionId,
        alertType: 'realtime_monitoring',
        alertData: JSON.stringify(alertData.alerts),
        severity: determineSeverity(alertData.alerts),
        vitalsSnapshot: JSON.stringify(alertData.vitals),
        timestamp: new Date(alertData.timestamp),
        acknowledged: false,
        patientId: alertData.patientId || null,
        appointmentId: alertData.appointmentId || null
      }
    });

    // Send real-time notification to healthcare provider
    await notifyHealthcareProvider(alertData);

    return NextResponse.json({
      success: true,
      alertId: alert.id,
      severity: alert.severity
    });

  } catch (error) {
    console.error('Health alert error:', error);
    return NextResponse.json(
      { error: 'Failed to process health alert' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const acknowledged = searchParams.get('acknowledged') === 'true';

    const where = {};
    if (sessionId) where.sessionId = sessionId;
    if (acknowledged !== undefined) where.acknowledged = acknowledged;

    const alerts = await prisma.healthAlert.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      alerts: alerts.map(alert => ({
        ...alert,
        alertData: JSON.parse(alert.alertData),
        vitalsSnapshot: JSON.parse(alert.vitalsSnapshot || '{}')
      }))
    });

  } catch (error) {
    console.error('Health alert retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve health alerts' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { alertId, acknowledged, response } = await request.json();
    
    const alert = await prisma.healthAlert.update({
      where: { id: alertId },
      data: {
        acknowledged,
        acknowledgedAt: acknowledged ? new Date() : null,
        doctorResponse: response || null
      }
    });

    return NextResponse.json({
      success: true,
      alert
    });

  } catch (error) {
    console.error('Health alert update error:', error);
    return NextResponse.json(
      { error: 'Failed to update health alert' },
      { status: 500 }
    );
  }
}

// Determine alert severity
function determineSeverity(alerts) {
  if (alerts.some(alert => alert.type === 'critical')) return 'critical';
  if (alerts.some(alert => alert.type === 'warning')) return 'high';
  return 'medium';
}

// Notify healthcare provider of critical alerts
async function notifyHealthcareProvider(alertData) {
  const criticalAlerts = alertData.alerts.filter(alert => alert.type === 'critical' || alert.type === 'warning');
  
  if (criticalAlerts.length === 0) return;

  // Here you would integrate with real notification systems:
  // - WebSocket for real-time dashboard updates
  // - Email notifications
  // - SMS alerts for critical situations
  // - Push notifications to mobile apps
  // - Integration with hospital paging systems

  console.log('Healthcare provider notified:', {
    sessionId: alertData.sessionId,
    alertCount: criticalAlerts.length,
    severity: determineSeverity(alertData.alerts)
  });

  // Example: Send email notification (you would implement with your email service)
  // await sendEmailAlert(alertData);
  
  // Example: Send WebSocket notification (you would implement with your WebSocket server)
  // await sendWebSocketAlert(alertData);
}