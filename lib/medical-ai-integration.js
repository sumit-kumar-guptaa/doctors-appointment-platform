/**
 * Medical AI Integration System
 * Combines all production AI systems for comprehensive medical consultations
 */

import RealHealthMonitor from '@/lib/real-health-monitor';
import RealMedicalDiagnosis from '@/lib/real-medical-diagnosis';
import RealMedicalTranslation from '@/lib/real-medical-translation';
import RealEmotionAnalysis from '@/lib/real-emotion-analysis';
import RealDrugInteractionSystem from '@/lib/real-drug-interactions';

class MedicalAIIntegration {
  constructor() {
    this.healthMonitor = new RealHealthMonitor();
    this.medicalDiagnosis = new RealMedicalDiagnosis();
    this.medicalTranslation = new RealMedicalTranslation();
    this.emotionAnalysis = new RealEmotionAnalysis();
    this.drugInteractions = new RealDrugInteractionSystem();
    
    this.sessionId = null;
    this.patientId = null;
    this.doctorId = null;
    this.appointmentId = null;
    this.isActive = false;
    this.systemsEnabled = {
      healthMonitoring: true,
      medicalDiagnosis: true,
      translation: true,
      emotionAnalysis: true,
      drugInteractions: true
    };
  }

  /**
   * Initialize comprehensive medical AI session
   * @param {Object} config - Session configuration
   */
  async initializeMedicalAI(config) {
    try {
      const {
        sessionId,
        patientId,
        doctorId,
        appointmentId,
        patientProfile = {},
        enabledSystems = this.systemsEnabled,
        translationConfig = { sourceLanguage: 'en', targetLanguage: 'ar' },
        currentMedications = []
      } = config;

      this.sessionId = sessionId;
      this.patientId = patientId;
      this.doctorId = doctorId;
      this.appointmentId = appointmentId;
      this.systemsEnabled = { ...this.systemsEnabled, ...enabledSystems };

      const initializationResults = {};

      console.log('Initializing Medical AI Integration System...');

      // Initialize Health Monitoring
      if (this.systemsEnabled.healthMonitoring) {
        try {
          const healthConfig = {
            sessionId,
            patientId,
            appointmentId,
            patientProfile,
            realTimeMonitoring: true
          };
          
          initializationResults.healthMonitoring = await this.healthMonitor.initializeHealthMonitoring(healthConfig);
          console.log('✓ Health monitoring initialized');
        } catch (error) {
          console.error('Health monitoring initialization failed:', error);
          initializationResults.healthMonitoring = { success: false, error: error.message };
        }
      }

      // Initialize Medical Translation
      if (this.systemsEnabled.translation) {
        try {
          const translationSessionConfig = {
            sessionId,
            patientId,
            doctorId,
            ...translationConfig
          };
          
          initializationResults.translation = await this.medicalTranslation.initializeSession(translationSessionConfig);
          console.log('✓ Medical translation initialized');
        } catch (error) {
          console.error('Medical translation initialization failed:', error);
          initializationResults.translation = { success: false, error: error.message };
        }
      }

      // Initialize Emotion Analysis
      if (this.systemsEnabled.emotionAnalysis) {
        try {
          const emotionConfig = {
            sessionId,
            patientId,
            doctorId,
            monitoringMode: 'continuous',
            alertsEnabled: true
          };
          
          await this.emotionAnalysis.initializeEmotionDetection();
          initializationResults.emotionAnalysis = await this.emotionAnalysis.startEmotionMonitoring(emotionConfig);
          console.log('✓ Emotion analysis initialized');
        } catch (error) {
          console.error('Emotion analysis initialization failed:', error);
          initializationResults.emotionAnalysis = { success: false, error: error.message };
        }
      }

      // Initialize Drug Interaction System
      if (this.systemsEnabled.drugInteractions) {
        try {
          const drugConfig = {
            sessionId,
            patientId,
            doctorId,
            currentMedications,
            patientProfile
          };
          
          initializationResults.drugInteractions = await this.drugInteractions.initializeSession(drugConfig);
          console.log('✓ Drug interaction system initialized');
        } catch (error) {
          console.error('Drug interaction initialization failed:', error);
          initializationResults.drugInteractions = { success: false, error: error.message };
        }
      }

      // Initialize session in database
      await this.initializeIntegratedSession(initializationResults);

      this.isActive = true;
      console.log('🎯 Medical AI Integration System fully initialized');

      return {
        success: true,
        sessionId,
        systemsInitialized: initializationResults,
        activeServices: Object.keys(initializationResults).filter(key => 
          initializationResults[key].success
        ).length
      };

    } catch (error) {
      console.error('Medical AI integration initialization failed:', error);
      throw new Error(`Failed to initialize Medical AI: ${error.message}`);
    }
  }

  /**
   * Start comprehensive medical consultation
   */
  async startMedicalConsultation() {
    try {
      if (!this.isActive) {
        throw new Error('Medical AI system not initialized');
      }

      console.log('Starting comprehensive medical consultation...');

      const consultationPromises = [];

      // Start health monitoring
      if (this.systemsEnabled.healthMonitoring) {
        consultationPromises.push(
          this.healthMonitor.startRealTimeMonitoring()
            .then(result => ({ system: 'healthMonitoring', result }))
            .catch(error => ({ system: 'healthMonitoring', error: error.message }))
        );
      }

      // Start emotion monitoring (already started in initialization)
      if (this.systemsEnabled.emotionAnalysis) {
        // Emotion monitoring is already running from initialization
        consultationPromises.push(
          Promise.resolve({ system: 'emotionAnalysis', result: { success: true, status: 'running' } })
        );
      }

      // Wait for all systems to start
      const startupResults = await Promise.all(consultationPromises);

      console.log('📋 Medical consultation started with all AI systems active');

      return {
        success: true,
        sessionId: this.sessionId,
        systemsActive: startupResults,
        consultationStartTime: new Date()
      };

    } catch (error) {
      console.error('Medical consultation startup failed:', error);
      throw new Error(`Failed to start consultation: ${error.message}`);
    }
  }

  /**
   * Process comprehensive medical diagnosis
   * @param {Object} diagnosisData - Patient data for diagnosis
   */
  async processMedicalDiagnosis(diagnosisData) {
    try {
      if (!this.systemsEnabled.medicalDiagnosis) {
        throw new Error('Medical diagnosis system not enabled');
      }

      console.log('Processing comprehensive medical diagnosis...');

      const {
        symptoms = [],
        patientHistory = '',
        chiefComplaint = '',
        additionalNotes = ''
      } = diagnosisData;

      // Get current health data
      let currentVitals = {};
      if (this.systemsEnabled.healthMonitoring) {
        try {
          currentVitals = await this.healthMonitor.getCurrentVitals();
        } catch (error) {
          console.warn('Could not get current vitals:', error);
        }
      }

      // Get current emotional state
      let emotionalState = {};
      if (this.systemsEnabled.emotionAnalysis) {
        try {
          emotionalState = this.emotionAnalysis.getCurrentEmotions();
        } catch (error) {
          console.warn('Could not get emotional state:', error);
        }
      }

      // Prepare comprehensive diagnosis input
      const comprehensiveDiagnosisData = {
        sessionId: this.sessionId,
        patientId: this.patientId,
        symptoms,
        patientHistory,
        chiefComplaint,
        additionalNotes,
        currentVitals: currentVitals.vitals || {},
        emotionalState: emotionalState.currentEmotions || {},
        vitalsSummary: currentVitals.summary || '',
        emotionSummary: this.generateEmotionSummary(emotionalState),
        timestamp: new Date()
      };

      // Process with AI diagnosis system
      const diagnosisResult = await this.medicalDiagnosis.analyzeMedicalCase(comprehensiveDiagnosisData);

      console.log('🩺 Medical diagnosis completed');

      return {
        success: true,
        diagnosis: diagnosisResult,
        vitalsIncluded: Object.keys(currentVitals).length > 0,
        emotionsIncluded: Object.keys(emotionalState).length > 0,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Medical diagnosis processing failed:', error);
      throw new Error(`Diagnosis failed: ${error.message}`);
    }
  }

  /**
   * Translate medical content in real-time
   * @param {string} text - Text to translate
   * @param {Object} options - Translation options
   */
  async translateMedicalContent(text, options = {}) {
    try {
      if (!this.systemsEnabled.translation) {
        throw new Error('Translation system not enabled');
      }

      const {
        isUrgent = false,
        speaker = 'unknown',
        realTime = false
      } = options;

      let result;

      if (realTime) {
        result = await this.medicalTranslation.realTimeTranslate(text, {
          speaker,
          isDoctor: speaker === 'doctor',
          priority: isUrgent ? 'urgent' : 'normal'
        });
      } else {
        result = await this.medicalTranslation.translateMedicalText(text, {
          isUrgent,
          speaker,
          medicalTerms: true
        });
      }

      return result;

    } catch (error) {
      console.error('Medical translation failed:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Check drug interactions for new medication
   * @param {Object} medication - New medication to check
   */
  async checkMedicationSafety(medication) {
    try {
      if (!this.systemsEnabled.drugInteractions) {
        throw new Error('Drug interaction system not enabled');
      }

      console.log(`Checking medication safety for: ${medication.name}`);

      const result = await this.drugInteractions.checkDrugInteractions(medication);

      // Create alert if high-risk interaction found
      if (result.riskAnalysis.requiresAction) {
        await this.createIntegratedAlert({
          type: 'MEDICATION_SAFETY',
          severity: result.riskAnalysis.riskLevel,
          message: `High-risk drug interaction detected with ${medication.name}`,
          data: result,
          requiresImmedateAction: result.riskAnalysis.riskLevel === 'critical'
        });
      }

      return result;

    } catch (error) {
      console.error('Medication safety check failed:', error);
      throw new Error(`Medication safety check failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive health summary
   */
  async getComprehensiveHealthSummary() {
    try {
      const summary = {
        sessionId: this.sessionId,
        timestamp: new Date(),
        systems: {}
      };

      // Get health monitoring data
      if (this.systemsEnabled.healthMonitoring) {
        try {
          const healthData = await this.healthMonitor.getCurrentVitals();
          summary.systems.vitals = {
            current: healthData.vitals,
            alerts: healthData.alerts,
            trends: healthData.trends
          };
        } catch (error) {
          summary.systems.vitals = { error: error.message };
        }
      }

      // Get emotion analysis data
      if (this.systemsEnabled.emotionAnalysis) {
        try {
          const emotionData = this.emotionAnalysis.getCurrentEmotions();
          summary.systems.emotions = {
            current: emotionData.currentEmotions,
            medicalIndicators: this.generateMedicalEmotionIndicators(emotionData),
            isMonitoring: emotionData.isMonitoring
          };
        } catch (error) {
          summary.systems.emotions = { error: error.message };
        }
      }

      // Get medication profile
      if (this.systemsEnabled.drugInteractions) {
        try {
          const medicationProfile = this.drugInteractions.getMedicationProfile();
          summary.systems.medications = medicationProfile;
        } catch (error) {
          summary.systems.medications = { error: error.message };
        }
      }

      // Get translation stats
      if (this.systemsEnabled.translation) {
        try {
          const translationStats = this.medicalTranslation.getSessionStats();
          summary.systems.translation = translationStats;
        } catch (error) {
          summary.systems.translation = { error: error.message };
        }
      }

      return summary;

    } catch (error) {
      console.error('Error generating comprehensive health summary:', error);
      throw new Error(`Failed to generate health summary: ${error.message}`);
    }
  }

  /**
   * Generate emotion summary for medical context
   * @param {Object} emotionalState - Current emotional state
   */
  generateEmotionSummary(emotionalState) {
    if (!emotionalState.currentEmotions) {
      return 'No emotional data available';
    }

    const emotions = emotionalState.currentEmotions;
    const indicators = [];

    if (emotions.stress_level?.percentage > 60) {
      indicators.push(`elevated stress (${emotions.stress_level.percentage}%)`);
    }

    if (emotions.anxiety_level?.percentage > 50) {
      indicators.push(`anxiety detected (${emotions.anxiety_level.percentage}%)`);
    }

    if (emotions.pain_indication?.percentage > 50) {
      indicators.push(`pain indicators (${emotions.pain_indication.percentage}%)`);
    }

    if (emotions.psychological_distress?.percentage > 60) {
      indicators.push(`psychological distress (${emotions.psychological_distress.percentage}%)`);
    }

    return indicators.length > 0 
      ? `Patient showing: ${indicators.join(', ')}`
      : 'Patient appears emotionally stable';
  }

  /**
   * Generate medical emotion indicators
   * @param {Object} emotionData - Emotion analysis data
   */
  generateMedicalEmotionIndicators(emotionData) {
    if (!emotionData.currentEmotions) return [];

    const indicators = [];
    const emotions = emotionData.currentEmotions;

    // Check for medical significance
    Object.entries(emotions).forEach(([emotion, data]) => {
      if (data.percentage && data.percentage > 50) {
        indicators.push({
          emotion,
          percentage: data.percentage,
          medicalTerm: data.medicalTerm,
          severity: data.severity,
          indicator: data.indicator
        });
      }
    });

    return indicators;
  }

  /**
   * Create integrated alert across all systems
   * @param {Object} alertData - Alert data
   */
  async createIntegratedAlert(alertData) {
    try {
      const response = await fetch('/api/medical-ai-integration/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          patientId: this.patientId,
          doctorId: this.doctorId,
          alert: alertData
        })
      });

      if (!response.ok) {
        console.error('Failed to create integrated alert');
      }
    } catch (error) {
      console.error('Error creating integrated alert:', error);
    }
  }

  /**
   * Initialize integrated session in database
   * @param {Object} initResults - Initialization results
   */
  async initializeIntegratedSession(initResults) {
    try {
      const response = await fetch('/api/medical-ai-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          sessionId: this.sessionId,
          patientId: this.patientId,
          doctorId: this.doctorId,
          appointmentId: this.appointmentId,
          systemsEnabled: this.systemsEnabled,
          initializationResults: initResults
        })
      });

      if (!response.ok) {
        console.error('Failed to initialize integrated session');
      }
    } catch (error) {
      console.error('Error initializing integrated session:', error);
    }
  }

  /**
   * End comprehensive medical AI session
   */
  async endMedicalAISession() {
    try {
      console.log('Ending comprehensive Medical AI session...');

      const endResults = {};

      // End health monitoring
      if (this.systemsEnabled.healthMonitoring) {
        try {
          endResults.healthMonitoring = await this.healthMonitor.stopHealthMonitoring();
        } catch (error) {
          endResults.healthMonitoring = { error: error.message };
        }
      }

      // End emotion analysis
      if (this.systemsEnabled.emotionAnalysis) {
        try {
          endResults.emotionAnalysis = await this.emotionAnalysis.stopEmotionMonitoring();
        } catch (error) {
          endResults.emotionAnalysis = { error: error.message };
        }
      }

      // End translation session
      if (this.systemsEnabled.translation) {
        try {
          endResults.translation = await this.medicalTranslation.endSession();
        } catch (error) {
          endResults.translation = { error: error.message };
        }
      }

      // End drug interaction session
      if (this.systemsEnabled.drugInteractions) {
        try {
          endResults.drugInteractions = await this.drugInteractions.endSession();
        } catch (error) {
          endResults.drugInteractions = { error: error.message };
        }
      }

      // Store final session data
      await this.storeFinalSessionData(endResults);

      this.isActive = false;
      console.log('🏁 Medical AI Integration session ended');

      return {
        success: true,
        sessionId: this.sessionId,
        endResults,
        sessionEndTime: new Date()
      };

    } catch (error) {
      console.error('Error ending Medical AI session:', error);
      throw new Error(`Failed to end Medical AI session: ${error.message}`);
    }
  }

  /**
   * Store final session data
   * @param {Object} endResults - Session end results
   */
  async storeFinalSessionData(endResults) {
    try {
      const response = await fetch('/api/medical-ai-integration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId: this.sessionId,
          endResults,
          sessionEndTime: new Date()
        })
      });

      if (!response.ok) {
        console.error('Failed to store final session data');
      }
    } catch (error) {
      console.error('Error storing final session data:', error);
    }
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      sessionId: this.sessionId,
      isActive: this.isActive,
      patientId: this.patientId,
      doctorId: this.doctorId,
      systemsEnabled: this.systemsEnabled,
      healthMonitoringActive: this.systemsEnabled.healthMonitoring && this.healthMonitor.isMonitoring,
      emotionAnalysisActive: this.systemsEnabled.emotionAnalysis && this.emotionAnalysis.isMonitoring,
      translationActive: this.systemsEnabled.translation && this.medicalTranslation.realTimeMode,
      drugInteractionsActive: this.systemsEnabled.drugInteractions,
      lastUpdate: new Date()
    };
  }
}

export default MedicalAIIntegration;