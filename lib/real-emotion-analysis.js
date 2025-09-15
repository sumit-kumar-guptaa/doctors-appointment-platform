/**
 * Production Emotion Analysis System
 * Real-time facial emotion detection for medical consultations using Face-API.js
 */

import * as faceapi from 'face-api.js';

class RealEmotionAnalysis {
  constructor() {
    this.isInitialized = false;
    this.isMonitoring = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.emotionHistory = [];
    this.currentEmotions = {};
    this.sessionId = null;
    this.patientId = null;
    this.doctorId = null;
    this.alertThresholds = {
      stress: 0.7,
      anxiety: 0.6,
      pain: 0.6,
      depression: 0.5,
      fear: 0.7
    };
    this.medicalEmotionMapping = {
      'angry': { medical: 'irritability', severity: 'medium', indicator: 'pain_discomfort' },
      'disgusted': { medical: 'nausea_discomfort', severity: 'medium', indicator: 'gastrointestinal' },
      'fearful': { medical: 'anxiety_fear', severity: 'high', indicator: 'psychological_distress' },
      'happy': { medical: 'positive_affect', severity: 'low', indicator: 'recovery_wellness' },
      'neutral': { medical: 'stable_baseline', severity: 'low', indicator: 'normal_state' },
      'sad': { medical: 'depressed_mood', severity: 'medium', indicator: 'psychological_concern' },
      'surprised': { medical: 'shock_confusion', severity: 'medium', indicator: 'cognitive_response' }
    };
  }

  /**
   * Initialize Face-API.js and emotion detection models
   */
  async initializeEmotionDetection() {
    try {
      console.log('Initializing emotion detection system...');

      // Load Face-API.js models
      await this.loadFaceAPIModels();

      // Initialize video stream
      await this.initializeVideoStream();

      this.isInitialized = true;
      console.log('Emotion detection system initialized successfully');

      return {
        success: true,
        message: 'Emotion detection ready',
        modelsLoaded: true,
        cameraAccess: !!this.videoElement
      };

    } catch (error) {
      console.error('Emotion detection initialization failed:', error);
      throw new Error(`Failed to initialize emotion detection: ${error.message}`);
    }
  }

  /**
   * Load Face-API.js models for emotion detection
   */
  async loadFaceAPIModels() {
    try {
      // Load required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);

      console.log('Face-API models loaded successfully');
    } catch (error) {
      console.error('Failed to load Face-API models:', error);
      throw new Error('Face-API models could not be loaded');
    }
  }

  /**
   * Initialize video stream for emotion detection
   */
  async initializeVideoStream() {
    try {
      // Create video element
      this.videoElement = document.createElement('video');
      this.videoElement.width = 640;
      this.videoElement.height = 480;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;

      // Create canvas for drawing detections
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 640;
      this.canvasElement.height = 480;

      // Get camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      this.videoElement.srcObject = stream;

      // Wait for video to load
      await new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = resolve;
        this.videoElement.onerror = reject;
        setTimeout(reject, 10000); // 10 second timeout
      });

      console.log('Video stream initialized');
    } catch (error) {
      console.error('Video stream initialization failed:', error);
      throw new Error('Cannot access camera for emotion detection');
    }
  }

  /**
   * Start emotion monitoring session
   * @param {Object} config - Session configuration
   */
  async startEmotionMonitoring(config) {
    try {
      if (!this.isInitialized) {
        await this.initializeEmotionDetection();
      }

      const {
        sessionId,
        patientId,
        doctorId,
        monitoringMode = 'continuous',
        alertsEnabled = true,
        recordingEnabled = false
      } = config;

      this.sessionId = sessionId;
      this.patientId = patientId;
      this.doctorId = doctorId;
      this.monitoringMode = monitoringMode;
      this.alertsEnabled = alertsEnabled;
      this.recordingEnabled = recordingEnabled;

      // Initialize session in database
      await this.initializeEmotionSession();

      // Start monitoring loop
      this.isMonitoring = true;
      this.startEmotionDetectionLoop();

      console.log('Emotion monitoring started');

      return {
        success: true,
        sessionId,
        monitoringActive: true,
        detectionRate: '5 FPS',
        alertsEnabled
      };

    } catch (error) {
      console.error('Failed to start emotion monitoring:', error);
      throw new Error(`Emotion monitoring failed: ${error.message}`);
    }
  }

  /**
   * Main emotion detection loop
   */
  async startEmotionDetectionLoop() {
    const detectEmotions = async () => {
      if (!this.isMonitoring) return;

      try {
        // Detect face and emotions
        const detections = await faceapi
          .detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions()
          .withFaceLandmarks();

        if (detections && detections.length > 0) {
          await this.processEmotionDetections(detections);
        }

        // Continue detection loop
        setTimeout(detectEmotions, 200); // 5 FPS
      } catch (error) {
        console.error('Emotion detection error:', error);
        setTimeout(detectEmotions, 1000); // Retry after error
      }
    };

    detectEmotions();
  }

  /**
   * Process emotion detection results
   * @param {Array} detections - Face-API detection results
   */
  async processEmotionDetections(detections) {
    try {
      const detection = detections[0]; // Use first face detected
      const expressions = detection.expressions;

      // Convert to emotion data
      const emotionData = this.analyzeEmotions(expressions);

      // Update current emotions
      this.currentEmotions = emotionData;

      // Add to emotion history
      const emotionRecord = {
        timestamp: new Date(),
        emotions: emotionData,
        medicalIndicators: this.generateMedicalIndicators(emotionData),
        faceDetected: true,
        confidence: this.calculateOverallConfidence(expressions)
      };

      this.emotionHistory.push(emotionRecord);

      // Check for medical alerts
      if (this.alertsEnabled) {
        await this.checkEmotionalAlerts(emotionData);
      }

      // Store emotion data
      await this.storeEmotionData(emotionRecord);

      // Limit history size
      if (this.emotionHistory.length > 1000) {
        this.emotionHistory = this.emotionHistory.slice(-500);
      }

    } catch (error) {
      console.error('Emotion processing error:', error);
    }
  }

  /**
   * Analyze emotions from Face-API expressions
   * @param {Object} expressions - Face-API expression results
   */
  analyzeEmotions(expressions) {
    const emotionData = {};
    
    // Primary emotions with medical context
    Object.entries(expressions).forEach(([emotion, confidence]) => {
      const medicalMapping = this.medicalEmotionMapping[emotion];
      
      emotionData[emotion] = {
        confidence: Math.round(confidence * 100) / 100,
        percentage: Math.round(confidence * 100),
        medicalTerm: medicalMapping?.medical || emotion,
        severity: medicalMapping?.severity || 'low',
        indicator: medicalMapping?.indicator || 'emotional_state'
      };
    });

    // Calculate composite medical indicators
    emotionData.stress_level = this.calculateStressLevel(expressions);
    emotionData.anxiety_level = this.calculateAnxietyLevel(expressions);
    emotionData.pain_indication = this.calculatePainIndication(expressions);
    emotionData.psychological_distress = this.calculatePsychologicalDistress(expressions);

    return emotionData;
  }

  /**
   * Calculate stress level from emotions
   * @param {Object} expressions - Raw emotion expressions
   */
  calculateStressLevel(expressions) {
    const stressFactors = {
      angry: expressions.angry * 0.8,
      fearful: expressions.fearful * 0.7,
      disgusted: expressions.disgusted * 0.5,
      sad: expressions.sad * 0.3
    };

    const stressScore = Object.values(stressFactors).reduce((sum, val) => sum + val, 0);
    const normalizedStress = Math.min(stressScore, 1.0);

    return {
      level: normalizedStress,
      percentage: Math.round(normalizedStress * 100),
      classification: this.classifyStressLevel(normalizedStress),
      medicalSignificance: normalizedStress > 0.6 ? 'high' : normalizedStress > 0.4 ? 'moderate' : 'low'
    };
  }

  /**
   * Calculate anxiety level from emotions
   * @param {Object} expressions - Raw emotion expressions
   */
  calculateAnxietyLevel(expressions) {
    const anxietyFactors = {
      fearful: expressions.fearful * 0.9,
      surprised: expressions.surprised * 0.4,
      sad: expressions.sad * 0.3,
      angry: expressions.angry * 0.2
    };

    const anxietyScore = Object.values(anxietyFactors).reduce((sum, val) => sum + val, 0);
    const normalizedAnxiety = Math.min(anxietyScore, 1.0);

    return {
      level: normalizedAnxiety,
      percentage: Math.round(normalizedAnxiety * 100),
      classification: this.classifyAnxietyLevel(normalizedAnxiety),
      medicalSignificance: normalizedAnxiety > 0.5 ? 'clinically_significant' : 'normal_range'
    };
  }

  /**
   * Calculate pain indication from facial expressions
   * @param {Object} expressions - Raw emotion expressions
   */
  calculatePainIndication(expressions) {
    const painFactors = {
      angry: expressions.angry * 0.6,
      disgusted: expressions.disgusted * 0.7,
      sad: expressions.sad * 0.4,
      fearful: expressions.fearful * 0.3
    };

    const painScore = Object.values(painFactors).reduce((sum, val) => sum + val, 0);
    const normalizedPain = Math.min(painScore, 1.0);

    return {
      level: normalizedPain,
      percentage: Math.round(normalizedPain * 100),
      classification: this.classifyPainLevel(normalizedPain),
      medicalRelevance: normalizedPain > 0.5 ? 'requires_attention' : 'monitor'
    };
  }

  /**
   * Calculate psychological distress from emotions
   * @param {Object} expressions - Raw emotion expressions
   */
  calculatePsychologicalDistress(expressions) {
    const distressFactors = {
      sad: expressions.sad * 0.8,
      fearful: expressions.fearful * 0.7,
      angry: expressions.angry * 0.5,
      disgusted: expressions.disgusted * 0.3,
      happy: expressions.happy * -0.4 // Positive emotions reduce distress
    };

    const distressScore = Math.max(0, Object.values(distressFactors).reduce((sum, val) => sum + val, 0));
    const normalizedDistress = Math.min(distressScore, 1.0);

    return {
      level: normalizedDistress,
      percentage: Math.round(normalizedDistress * 100),
      classification: this.classifyDistressLevel(normalizedDistress),
      clinicalSignificance: normalizedDistress > 0.6 ? 'high' : normalizedDistress > 0.4 ? 'moderate' : 'low'
    };
  }

  /**
   * Generate medical indicators from emotion data
   * @param {Object} emotionData - Processed emotion data
   */
  generateMedicalIndicators(emotionData) {
    const indicators = [];

    // Check stress indicators
    if (emotionData.stress_level.percentage > 60) {
      indicators.push({
        type: 'stress',
        severity: 'high',
        message: 'Elevated stress levels detected',
        recommendation: 'Monitor patient comfort and pain levels'
      });
    }

    // Check anxiety indicators
    if (emotionData.anxiety_level.percentage > 50) {
      indicators.push({
        type: 'anxiety',
        severity: 'medium',
        message: 'Anxiety signs detected',
        recommendation: 'Provide reassurance and explain procedures'
      });
    }

    // Check pain indicators
    if (emotionData.pain_indication.percentage > 50) {
      indicators.push({
        type: 'pain',
        severity: 'medium',
        message: 'Facial expressions suggest discomfort',
        recommendation: 'Assess pain levels and consider intervention'
      });
    }

    // Check psychological distress
    if (emotionData.psychological_distress.percentage > 60) {
      indicators.push({
        type: 'distress',
        severity: 'high',
        message: 'Psychological distress indicated',
        recommendation: 'Consider mental health support'
      });
    }

    return indicators;
  }

  /**
   * Check for emotional alerts that require medical attention
   * @param {Object} emotionData - Current emotion analysis
   */
  async checkEmotionalAlerts(emotionData) {
    const alerts = [];

    // Critical stress alert
    if (emotionData.stress_level.percentage > 80) {
      alerts.push({
        type: 'critical_stress',
        severity: 'high',
        message: 'Critical stress levels detected - immediate attention required',
        emotionData: emotionData.stress_level,
        timestamp: new Date()
      });
    }

    // Severe anxiety alert
    if (emotionData.anxiety_level.percentage > 75) {
      alerts.push({
        type: 'severe_anxiety',
        severity: 'high',
        message: 'Severe anxiety detected - patient may need calming intervention',
        emotionData: emotionData.anxiety_level,
        timestamp: new Date()
      });
    }

    // Acute pain alert
    if (emotionData.pain_indication.percentage > 70) {
      alerts.push({
        type: 'acute_pain',
        severity: 'medium',
        message: 'Facial expressions indicate significant pain',
        emotionData: emotionData.pain_indication,
        timestamp: new Date()
      });
    }

    // Send alerts if any detected
    if (alerts.length > 0) {
      await this.sendEmotionalAlerts(alerts);
    }
  }

  /**
   * Send emotional alerts to medical staff
   * @param {Array} alerts - List of emotional alerts
   */
  async sendEmotionalAlerts(alerts) {
    try {
      const response = await fetch('/api/emotion-analysis/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          patientId: this.patientId,
          doctorId: this.doctorId,
          alerts,
          timestamp: new Date()
        })
      });

      if (!response.ok) {
        console.error('Failed to send emotional alerts');
      }
    } catch (error) {
      console.error('Error sending emotional alerts:', error);
    }
  }

  /**
   * Store emotion data in database
   * @param {Object} emotionRecord - Emotion analysis record
   */
  async storeEmotionData(emotionRecord) {
    try {
      const response = await fetch('/api/emotion-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store',
          sessionId: this.sessionId,
          patientId: this.patientId,
          emotionData: emotionRecord
        })
      });

      if (!response.ok) {
        console.error('Failed to store emotion data');
      }
    } catch (error) {
      console.error('Error storing emotion data:', error);
    }
  }

  /**
   * Initialize emotion analysis session in database
   */
  async initializeEmotionSession() {
    try {
      const response = await fetch('/api/emotion-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          sessionId: this.sessionId,
          patientId: this.patientId,
          doctorId: this.doctorId,
          config: {
            monitoringMode: this.monitoringMode,
            alertsEnabled: this.alertsEnabled,
            recordingEnabled: this.recordingEnabled
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to initialize emotion session');
      }
    } catch (error) {
      console.error('Error initializing emotion session:', error);
    }
  }

  // Classification helper methods
  classifyStressLevel(level) {
    if (level > 0.8) return 'critical';
    if (level > 0.6) return 'high';
    if (level > 0.4) return 'moderate';
    if (level > 0.2) return 'mild';
    return 'minimal';
  }

  classifyAnxietyLevel(level) {
    if (level > 0.7) return 'severe';
    if (level > 0.5) return 'moderate';
    if (level > 0.3) return 'mild';
    return 'minimal';
  }

  classifyPainLevel(level) {
    if (level > 0.7) return 'severe';
    if (level > 0.5) return 'moderate';
    if (level > 0.3) return 'mild';
    return 'minimal';
  }

  classifyDistressLevel(level) {
    if (level > 0.8) return 'severe';
    if (level > 0.6) return 'high';
    if (level > 0.4) return 'moderate';
    if (level > 0.2) return 'mild';
    return 'minimal';
  }

  /**
   * Calculate overall confidence in emotion detection
   * @param {Object} expressions - Raw emotion expressions
   */
  calculateOverallConfidence(expressions) {
    const values = Object.values(expressions);
    const maxConfidence = Math.max(...values);
    const avgConfidence = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Weight towards higher confidence in primary emotion
    return (maxConfidence * 0.7 + avgConfidence * 0.3);
  }

  /**
   * Get current emotional state
   */
  getCurrentEmotions() {
    return {
      currentEmotions: this.currentEmotions,
      isMonitoring: this.isMonitoring,
      sessionId: this.sessionId,
      lastUpdate: this.emotionHistory.length > 0 ? this.emotionHistory[this.emotionHistory.length - 1].timestamp : null
    };
  }

  /**
   * Get emotion analysis history
   * @param {Object} filters - History filters
   */
  getEmotionHistory(filters = {}) {
    const {
      timeRange = 300000, // 5 minutes default
      emotionType = null,
      minConfidence = 0,
      limit = 100
    } = filters;

    const cutoffTime = new Date(Date.now() - timeRange);
    let filteredHistory = this.emotionHistory.filter(record => 
      record.timestamp >= cutoffTime && record.confidence >= minConfidence
    );

    if (emotionType) {
      filteredHistory = filteredHistory.filter(record => 
        record.emotions[emotionType] && record.emotions[emotionType].confidence > 0.3
      );
    }

    return filteredHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Stop emotion monitoring
   */
  async stopEmotionMonitoring() {
    try {
      this.isMonitoring = false;
      
      // Stop video stream
      if (this.videoElement && this.videoElement.srcObject) {
        this.videoElement.srcObject.getTracks().forEach(track => track.stop());
      }

      // End session in database
      const response = await fetch('/api/emotion-analysis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId: this.sessionId,
          finalStats: {
            totalRecords: this.emotionHistory.length,
            sessionDuration: this.emotionHistory.length > 0 ? 
              new Date() - this.emotionHistory[0].timestamp : 0
          }
        })
      });

      console.log('Emotion monitoring stopped');

      return {
        success: true,
        sessionId: this.sessionId,
        totalRecords: this.emotionHistory.length
      };

    } catch (error) {
      console.error('Error stopping emotion monitoring:', error);
      throw new Error(`Failed to stop emotion monitoring: ${error.message}`);
    }
  }
}

export default RealEmotionAnalysis;