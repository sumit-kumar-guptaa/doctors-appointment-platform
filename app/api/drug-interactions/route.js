/**
 * Drug Interactions API Routes
 * Handle medication safety analysis and drug interaction checking
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'initialize':
        return await initializeDrugSession(body);
      case 'store_check':
        return await storeInteractionCheck(body);
      case 'store_change':
        return await storeMedicationChange(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Drug interactions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function initializeDrugSession(data) {
  try {
    const {
      sessionId,
      patientId,
      doctorId,
      initialMedications
    } = data;

    // Store drug interaction session
    await db.drugInteractionSession.create({
      data: {
        id: sessionId,
        patientId,
        doctorId,
        initialMedicationCount: initialMedications.length,
        status: 'ACTIVE',
        createdAt: new Date()
      }
    });

    // Store initial medications
    for (const medication of initialMedications) {
      await db.patientMedication.create({
        data: {
          sessionId,
          patientId,
          medicationName: medication.name,
          rxcui: medication.rxcui,
          dosage: medication.dosage,
          frequency: medication.frequency,
          route: medication.route,
          validated: medication.validated,
          status: 'ACTIVE',
          addedAt: medication.addedDate,
          createdAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Drug interaction session initialized',
      sessionId
    });

  } catch (error) {
    console.error('Drug session initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize drug session', details: error.message },
      { status: 500 }
    );
  }
}

async function storeInteractionCheck(data) {
  try {
    const {
      sessionId,
      patientId,
      checkData
    } = data;

    // Store interaction check
    const checkRecord = await db.drugInteractionCheck.create({
      data: {
        sessionId,
        patientId,
        newMedicationName: checkData.newMedication.name,
        newMedicationRxcui: checkData.newMedication.rxcui,
        totalInteractions: checkData.interactions.length,
        riskLevel: checkData.riskAnalysis.riskLevel,
        riskScore: checkData.riskAnalysis.riskScore,
        requiresAction: checkData.riskAnalysis.requiresAction,
        recommendation: checkData.riskAnalysis.recommendation,
        interactionData: JSON.stringify(checkData.interactions),
        riskAnalysis: JSON.stringify(checkData.riskAnalysis),
        timestamp: checkData.timestamp,
        createdAt: new Date()
      }
    });

    // Store individual interactions
    for (const interaction of checkData.interactions) {
      await db.drugInteraction.create({
        data: {
          checkId: checkRecord.id,
          sessionId,
          drug1Name: interaction.drug1.name,
          drug1Rxcui: interaction.drug1.rxcui,
          drug2Name: interaction.drug2.name,
          drug2Rxcui: interaction.drug2.rxcui,
          description: interaction.description,
          severity: interaction.severity,
          source: interaction.source,
          timestamp: interaction.timestamp,
          createdAt: new Date()
        }
      });
    }

    // Create alerts for high-risk interactions
    if (checkData.riskAnalysis.requiresAction) {
      await createInteractionAlert(sessionId, patientId, checkRecord.id, checkData);
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction check stored successfully',
      checkId: checkRecord.id
    });

  } catch (error) {
    console.error('Interaction check storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store interaction check', details: error.message },
      { status: 500 }
    );
  }
}

async function storeMedicationChange(data) {
  try {
    const {
      sessionId,
      patientId,
      changeData
    } = data;

    // Store medication change
    await db.medicationChange.create({
      data: {
        sessionId,
        patientId,
        action: changeData.action,
        medicationName: changeData.medication.name,
        medicationRxcui: changeData.medication.rxcui,
        medicationData: JSON.stringify(changeData.medication),
        interactionData: changeData.interactions ? JSON.stringify(changeData.interactions) : null,
        riskData: changeData.riskAnalysis ? JSON.stringify(changeData.riskAnalysis) : null,
        timestamp: new Date(),
        createdAt: new Date()
      }
    });

    // Update medication status
    if (changeData.action === 'add') {
      await db.patientMedication.create({
        data: {
          sessionId,
          patientId,
          medicationName: changeData.medication.name,
          rxcui: changeData.medication.rxcui,
          dosage: changeData.medication.dosage,
          frequency: changeData.medication.frequency,
          route: changeData.medication.route,
          validated: changeData.medication.validated,
          status: 'ACTIVE',
          addedAt: new Date(),
          createdAt: new Date()
        }
      });
    } else if (changeData.action === 'remove') {
      await db.patientMedication.updateMany({
        where: {
          sessionId,
          patientId,
          medicationName: changeData.medication.name,
          status: 'ACTIVE'
        },
        data: {
          status: 'REMOVED',
          removedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Medication change stored successfully'
    });

  } catch (error) {
    console.error('Medication change storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store medication change', details: error.message },
      { status: 500 }
    );
  }
}

async function createInteractionAlert(sessionId, patientId, checkId, checkData) {
  try {
    const alertMessage = checkData.riskAnalysis.riskLevel === 'critical' 
      ? `CRITICAL: Contraindicated drug interaction detected with ${checkData.newMedication.name}`
      : `HIGH RISK: Major drug interaction detected with ${checkData.newMedication.name}`;

    await db.drugInteractionAlert.create({
      data: {
        sessionId,
        patientId,
        checkId,
        alertType: 'DRUG_INTERACTION',
        severity: checkData.riskAnalysis.riskLevel.toUpperCase(),
        message: alertMessage,
        recommendation: checkData.riskAnalysis.recommendation,
        interactionCount: checkData.interactions.length,
        criticalInteractions: checkData.riskAnalysis.criticalInteractions.length,
        majorInteractions: checkData.riskAnalysis.majorInteractions.length,
        acknowledged: false,
        timestamp: new Date(),
        createdAt: new Date()
      }
    });

    console.log('Drug interaction alert created');
  } catch (error) {
    console.error('Error creating interaction alert:', error);
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
      case 'medications':
        return await getPatientMedications(sessionId);
      case 'checks':
        return await getInteractionChecks(sessionId);
      case 'alerts':
        return await getInteractionAlerts(sessionId);
      case 'history':
        return await getMedicationHistory(sessionId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Drug interactions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function getPatientMedications(sessionId) {
  try {
    const medications = await db.patientMedication.findMany({
      where: {
        sessionId,
        status: 'ACTIVE'
      },
      orderBy: { addedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: medications
    });

  } catch (error) {
    console.error('Error getting patient medications:', error);
    return NextResponse.json(
      { error: 'Failed to get medications', details: error.message },
      { status: 500 }
    );
  }
}

async function getInteractionChecks(sessionId) {
  try {
    const checks = await db.drugInteractionCheck.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      include: {
        drugInteractions: true
      }
    });

    return NextResponse.json({
      success: true,
      data: checks
    });

  } catch (error) {
    console.error('Error getting interaction checks:', error);
    return NextResponse.json(
      { error: 'Failed to get interaction checks', details: error.message },
      { status: 500 }
    );
  }
}

async function getInteractionAlerts(sessionId) {
  try {
    const alerts = await db.drugInteractionAlert.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('Error getting interaction alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get interaction alerts', details: error.message },
      { status: 500 }
    );
  }
}

async function getMedicationHistory(sessionId) {
  try {
    const history = await db.medicationChange.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error getting medication history:', error);
    return NextResponse.json(
      { error: 'Failed to get medication history', details: error.message },
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
        return await endDrugSession(body);
      case 'acknowledge_alert':
        return await acknowledgeInteractionAlert(body);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Drug interactions PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function endDrugSession(data) {
  try {
    const { sessionId, stats } = data;

    // Update drug interaction session
    await db.drugInteractionSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        finalMedicationCount: stats.totalMedications,
        validatedMedicationCount: stats.validatedMedications,
        totalInteractionChecks: stats.totalInteractionChecks,
        endedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Drug interaction session ended successfully'
    });

  } catch (error) {
    console.error('Drug session end error:', error);
    return NextResponse.json(
      { error: 'Failed to end drug session', details: error.message },
      { status: 500 }
    );
  }
}

async function acknowledgeInteractionAlert(data) {
  try {
    const { alertId, acknowledgedBy } = data;

    await db.drugInteractionAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Drug interaction alert acknowledged'
    });

  } catch (error) {
    console.error('Drug alert acknowledgment error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert', details: error.message },
      { status: 500 }
    );
  }
}