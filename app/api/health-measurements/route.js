// API Route: /api/health-measurements
// Handles real health monitoring data storage

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const healthData = await request.json();
    
    // Validate required fields
    if (!healthData.sessionId || !healthData.heartRate) {
      return NextResponse.json(
        { error: 'Missing required health data' },
        { status: 400 }
      );
    }

    // Save to database
    const measurement = await prisma.healthMeasurement.create({
      data: {
        sessionId: healthData.sessionId,
        heartRate: healthData.heartRate,
        heartRateVariability: healthData.heartRateVariability || 0,
        respiratoryRate: healthData.respiratoryRate || 0,
        stressLevel: healthData.stressLevel || 0,
        systolicBP: healthData.bloodPressure?.systolic || 0,
        diastolicBP: healthData.bloodPressure?.diastolic || 0,
        oxygenSaturation: healthData.oxygenSaturation || 0,
        timestamp: new Date(healthData.timestamp || Date.now()),
        patientId: healthData.patientId || null,
        appointmentId: healthData.appointmentId || null
      }
    });

    // Check for critical values and alert doctor
    const criticalAlerts = await checkForCriticalVitals(healthData);
    
    if (criticalAlerts.length > 0) {
      // Send real-time alert to healthcare provider
      await sendDoctorAlert(healthData.sessionId, criticalAlerts);
    }

    return NextResponse.json({
      success: true,
      measurementId: measurement.id,
      alerts: criticalAlerts
    });

  } catch (error) {
    console.error('Health measurement storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store health measurement' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const measurements = await prisma.healthMeasurement.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Calculate trends and averages
    const analytics = calculateHealthAnalytics(measurements);

    return NextResponse.json({
      success: true,
      measurements,
      analytics
    });

  } catch (error) {
    console.error('Health measurement retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve health measurements' },
      { status: 500 }
    );
  }
}

// Check for critical vital signs
async function checkForCriticalVitals(vitals) {
  const alerts = [];

  // Critical heart rate ranges
  if (vitals.heartRate > 120) {
    alerts.push({
      type: 'critical',
      metric: 'Heart Rate',
      value: vitals.heartRate,
      message: 'Tachycardia detected - Heart rate over 120 bpm',
      severity: 'high'
    });
  } else if (vitals.heartRate < 50) {
    alerts.push({
      type: 'critical',
      metric: 'Heart Rate',
      value: vitals.heartRate,
      message: 'Bradycardia detected - Heart rate under 50 bpm',
      severity: 'high'
    });
  }

  // Critical blood pressure
  if (vitals.bloodPressure?.systolic > 180 || vitals.bloodPressure?.diastolic > 110) {
    alerts.push({
      type: 'critical',
      metric: 'Blood Pressure',
      value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`,
      message: 'Hypertensive crisis - Immediate medical attention required',
      severity: 'critical'
    });
  }

  // Critical stress level
  if (vitals.stressLevel > 85) {
    alerts.push({
      type: 'warning',
      metric: 'Stress Level',
      value: `${vitals.stressLevel}%`,
      message: 'Extremely high stress detected - Patient may need calming',
      severity: 'medium'
    });
  }

  return alerts;
}

// Send real-time alert to healthcare provider
async function sendDoctorAlert(sessionId, alerts) {
  try {
    // Store alert in database
    await prisma.healthAlert.create({
      data: {
        sessionId,
        alertType: 'critical_vitals',
        alertData: JSON.stringify(alerts),
        severity: alerts.some(a => a.severity === 'critical') ? 'critical' : 'high',
        timestamp: new Date(),
        acknowledged: false
      }
    });

    // Here you could integrate with:
    // - WebSocket for real-time notifications
    // - Email/SMS alerts
    // - Push notifications
    // - Hospital systems integration

    console.log('Doctor alert sent for session:', sessionId);
    
  } catch (error) {
    console.error('Failed to send doctor alert:', error);
  }
}

// Calculate health analytics and trends
function calculateHealthAnalytics(measurements) {
  if (measurements.length === 0) {
    return { trends: {}, averages: {}, recommendations: [] };
  }

  const heartRates = measurements.map(m => m.heartRate).filter(hr => hr > 0);
  const stressLevels = measurements.map(m => m.stressLevel).filter(sl => sl > 0);

  const analytics = {
    averages: {
      heartRate: heartRates.length > 0 ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) : 0,
      stressLevel: stressLevels.length > 0 ? Math.round(stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length) : 0
    },
    trends: {
      heartRateTrend: calculateTrend(heartRates.slice(-10)),
      stressTrend: calculateTrend(stressLevels.slice(-10))
    },
    recommendations: generateHealthRecommendations(measurements)
  };

  return analytics;
}

// Calculate trend direction
function calculateTrend(values) {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  
  if (diff > 5) return 'increasing';
  if (diff < -5) return 'decreasing';
  return 'stable';
}

// Generate health recommendations
function generateHealthRecommendations(measurements) {
  const recommendations = [];
  const latest = measurements[0];
  
  if (latest.heartRate > 90) {
    recommendations.push({
      type: 'lifestyle',
      message: 'Consider breathing exercises to lower heart rate',
      priority: 'medium'
    });
  }
  
  if (latest.stressLevel > 60) {
    recommendations.push({
      type: 'mental_health',
      message: 'High stress detected - recommend relaxation techniques',
      priority: 'high'
    });
  }
  
  return recommendations;
}