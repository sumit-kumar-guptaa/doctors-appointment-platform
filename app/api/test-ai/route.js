/**
 * Medical AI Test API
 * Test endpoint for all AI systems
 */

import { NextResponse } from 'next/server';
import RealMedicalDiagnosis from '@/lib/real-medical-diagnosis';

export async function GET(request) {
  try {
    console.log('🧪 Testing Medical AI Systems...');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      systems: {}
    };

    // Test Medical Diagnosis System
    try {
      const diagnosis = new RealMedicalDiagnosis();
      
      const testCase = {
        sessionId: `api_test_${Date.now()}`,
        patientId: 'test_patient_api',
        symptoms: ['headache', 'fever'],
        patientHistory: 'No significant history',
        chiefComplaint: 'Headache and fever for 2 days',
        additionalNotes: 'Patient appears stressed',
        currentVitals: {
          heartRate: 85,
          bloodPressure: '120/80',
          temperature: 99.2
        }
      };
      
      const diagnosisResult = await diagnosis.analyzeMedicalCase(testCase);
      
      testResults.systems.medicalDiagnosis = {
        status: diagnosisResult.success ? 'WORKING' : 'FAILED',
        hasApiKey: !!process.env.GEMINI_API_KEY,
        result: diagnosisResult.success ? 'Diagnosis generated successfully' : diagnosisResult.error
      };
      
    } catch (error) {
      testResults.systems.medicalDiagnosis = {
        status: 'ERROR',
        error: error.message,
        hasApiKey: !!process.env.GEMINI_API_KEY
      };
    }

    // Test Environment Variables
    testResults.environment = {
      geminiApiKey: !!process.env.GEMINI_API_KEY,
      googleTranslateKey: !!process.env.GOOGLE_TRANSLATE_API_KEY,
      googleProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      databaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    };

    // Test Database Connection
    try {
      const { default: prisma } = await import('@/lib/prisma');
      await prisma.$connect();
      await prisma.$disconnect();
      
      testResults.database = {
        status: 'CONNECTED',
        connection: 'Prisma connection successful'
      };
    } catch (error) {
      testResults.database = {
        status: 'ERROR',
        error: error.message
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Medical AI systems test completed',
      results: testResults
    });

  } catch (error) {
    console.error('Medical AI test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { testType = 'diagnosis' } = body;

    let result = {};

    if (testType === 'diagnosis') {
      const diagnosis = new RealMedicalDiagnosis();
      
      const testData = body.testData || {
        sessionId: `manual_test_${Date.now()}`,
        patientId: 'manual_test_patient',
        symptoms: body.symptoms || ['headache', 'nausea'],
        patientHistory: body.patientHistory || 'No significant history',
        chiefComplaint: body.chiefComplaint || 'Patient reports headache',
        currentVitals: body.vitals || { heartRate: 80, bloodPressure: '118/75' }
      };

      result = await diagnosis.analyzeMedicalCase(testData);
    }

    return NextResponse.json({
      success: true,
      testType,
      result
    });

  } catch (error) {
    console.error('Manual test error:', error);
    return NextResponse.json(
      { error: 'Manual test failed', details: error.message },
      { status: 500 }
    );
  }
}