// AI Mental Health & Emotion Analysis System
// Advanced emotional intelligence for healthcare consultations

class AIEmotionAnalysisEngine {
  constructor() {
    this.isInitialized = false;
    this.emotionModels = null;
    this.analysisHistory = [];
    this.realTimeSession = null;
  }

  // Initialize emotion analysis models
  async initialize() {
    try {
      // Initialize facial emotion recognition
      await this.loadEmotionModels();
      
      // Initialize voice sentiment analysis
      await this.initializeVoiceAnalysis();
      
      // Initialize behavioral pattern recognition
      await this.initializeBehavioralAnalysis();
      
      this.isInitialized = true;
      console.log('AI Emotion Analysis Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize emotion analysis:', error);
    }
  }

  // Load facial emotion recognition models
  async loadEmotionModels() {
    // Using TensorFlow.js for client-side emotion recognition
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js';
    document.head.appendChild(script);

    return new Promise((resolve) => {
      script.onload = async () => {
        // Load pre-trained emotion recognition model
        try {
          // This would load a facial emotion recognition model
          this.emotionModels = {
            facial: await this.loadFacialEmotionModel(),
            voice: await this.loadVoiceEmotionModel(),
            behavioral: await this.loadBehavioralModel()
          };
          resolve();
        } catch (error) {
          console.warn('Using fallback emotion analysis');
          this.emotionModels = this.createFallbackModels();
          resolve();
        }
      };
    });
  }

  // Load facial emotion model (fallback implementation)
  async loadFacialEmotionModel() {
    // In production, this would load a real TensorFlow model
    return {
      predict: (imageData) => this.analyzeFacialExpressions(imageData)
    };
  }

  // Load voice emotion model
  async loadVoiceEmotionModel() {
    return {
      predict: (audioData) => this.analyzeVoiceSentiment(audioData)
    };
  }

  // Load behavioral analysis model
  async loadBehavioralModel() {
    return {
      predict: (behaviorData) => this.analyzeBehavioralPatterns(behaviorData)
    };
  }

  // Create fallback models for demo
  createFallbackModels() {
    return {
      facial: { predict: (data) => this.analyzeFacialExpressions(data) },
      voice: { predict: (data) => this.analyzeVoiceSentiment(data) },
      behavioral: { predict: (data) => this.analyzeBehavioralPatterns(data) }
    };
  }

  // Start real-time emotion analysis session
  async startEmotionAnalysis(videoElement, audioContext) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.realTimeSession = {
      startTime: Date.now(),
      emotionHistory: [],
      currentEmotion: null,
      mentalHealthIndicators: {
        stress: 0,
        anxiety: 0,
        depression: 0,
        engagement: 0
      }
    };

    // Start continuous analysis
    this.startContinuousAnalysis(videoElement, audioContext);
    
    return this.realTimeSession;
  }

  // Continuous analysis loop
  startContinuousAnalysis(videoElement, audioContext) {
    const analysisInterval = setInterval(async () => {
      if (!this.realTimeSession) {
        clearInterval(analysisInterval);
        return;
      }

      try {
        // Capture current frame for facial analysis
        const faceAnalysis = await this.captureFacialEmotion(videoElement);
        
        // Analyze voice if available
        const voiceAnalysis = audioContext ? await this.captureVoiceEmotion(audioContext) : null;
        
        // Analyze behavioral patterns
        const behaviorAnalysis = await this.captureBehavioralData();

        // Combine analyses
        const combinedAnalysis = this.combineEmotionAnalyses({
          facial: faceAnalysis,
          voice: voiceAnalysis,
          behavioral: behaviorAnalysis
        });

        // Update session
        this.updateEmotionSession(combinedAnalysis);

        // Trigger alerts if needed
        this.checkMentalHealthAlerts(combinedAnalysis);

      } catch (error) {
        console.warn('Emotion analysis iteration failed:', error);
      }
    }, 3000); // Analyze every 3 seconds

    // Store interval for cleanup
    this.realTimeSession.analysisInterval = analysisInterval;
  }

  // Capture facial emotion from video
  async captureFacialEmotion(videoElement) {
    try {
      // Create canvas to capture video frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Analyze emotions
      return await this.analyzeFacialExpressions(imageData);
    } catch (error) {
      console.warn('Facial emotion capture failed:', error);
      return this.getDefaultEmotionData();
    }
  }

  // Analyze facial expressions
  analyzeFacialExpressions(imageData) {
    // Simulated facial emotion analysis
    // In production, this would use a real computer vision model
    const emotions = {
      happy: Math.random() * 0.3 + (Math.sin(Date.now() / 10000) + 1) * 0.2,
      sad: Math.random() * 0.2 + (Math.cos(Date.now() / 15000) + 1) * 0.1,
      angry: Math.random() * 0.1,
      fearful: Math.random() * 0.15,
      surprised: Math.random() * 0.2,
      disgusted: Math.random() * 0.1,
      neutral: Math.random() * 0.4 + 0.3,
      anxious: Math.random() * 0.3 + (Math.sin(Date.now() / 8000) + 1) * 0.15,
      stressed: Math.random() * 0.25 + (Math.cos(Date.now() / 12000) + 1) * 0.2
    };

    // Normalize emotions to sum to 1
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    Object.keys(emotions).forEach(key => {
      emotions[key] = emotions[key] / total;
    });

    return {
      emotions,
      dominant: Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b),
      confidence: Math.random() * 0.3 + 0.7,
      timestamp: Date.now()
    };
  }

  // Capture and analyze voice emotion
  async captureVoiceEmotion(audioContext) {
    try {
      // Simulated voice emotion analysis
      return await this.analyzeVoiceSentiment(audioContext);
    } catch (error) {
      console.warn('Voice emotion capture failed:', error);
      return null;
    }
  }

  // Analyze voice sentiment and emotion
  analyzeVoiceSentiment(audioData) {
    // Simulated voice analysis
    // In production, this would analyze actual audio features
    const voiceMetrics = {
      tone: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'neutral',
      pitch: {
        average: Math.random() * 100 + 150, // Hz
        variance: Math.random() * 50 + 10
      },
      speed: {
        wordsPerMinute: Math.random() * 100 + 120,
        pauseFrequency: Math.random() * 0.3 + 0.1
      },
      volume: {
        average: Math.random() * 0.5 + 0.3,
        variance: Math.random() * 0.2
      },
      emotionalMarkers: {
        stress: Math.random() * 0.4,
        anxiety: Math.random() * 0.3,
        confidence: Math.random() * 0.6 + 0.4,
        fatigue: Math.random() * 0.3
      }
    };

    return {
      sentiment: voiceMetrics.tone,
      metrics: voiceMetrics,
      confidence: Math.random() * 0.25 + 0.75,
      timestamp: Date.now()
    };
  }

  // Capture behavioral data
  async captureBehavioralData() {
    // Analyze behavioral patterns like mouse movement, typing patterns, etc.
    const behaviorMetrics = {
      engagement: {
        eyeContact: Math.random() * 0.6 + 0.4, // Simulated eye tracking
        posture: Math.random() > 0.7 ? 'attentive' : 'relaxed',
        movementFrequency: Math.random() * 0.5
      },
      interaction: {
        responseTime: Math.random() * 2000 + 1000, // ms
        questionAsking: Math.random() > 0.3,
        activeListening: Math.random() > 0.6
      },
      physiological: {
        estimatedHeartRate: Math.random() * 20 + 70, // Estimated from video
        breathingPattern: Math.random() > 0.5 ? 'regular' : 'irregular'
      }
    };

    return {
      metrics: behaviorMetrics,
      timestamp: Date.now()
    };
  }

  // Analyze behavioral patterns
  analyzeBehavioralPatterns(behaviorData) {
    const patterns = {
      engagement_level: behaviorData.metrics.engagement.eyeContact * 0.4 + 
                      (behaviorData.metrics.engagement.posture === 'attentive' ? 0.3 : 0.1) +
                      (1 - behaviorData.metrics.engagement.movementFrequency) * 0.3,
      
      communication_style: behaviorData.metrics.interaction.questionAsking ? 'interactive' : 'passive',
      
      stress_indicators: {
        high_movement: behaviorData.metrics.engagement.movementFrequency > 0.3,
        irregular_breathing: behaviorData.metrics.physiological.breathingPattern === 'irregular',
        elevated_heart_rate: behaviorData.metrics.physiological.estimatedHeartRate > 90
      }
    };

    return patterns;
  }

  // Combine multiple emotion analyses
  combineEmotionAnalyses(analyses) {
    const { facial, voice, behavioral } = analyses;
    
    const combined = {
      primary_emotion: facial?.dominant || 'neutral',
      confidence: (facial?.confidence || 0.5),
      mental_health_indicators: {
        stress: 0,
        anxiety: 0,
        depression: 0,
        engagement: 0
      },
      recommendations: [],
      alerts: []
    };

    // Calculate stress level
    if (facial) {
      combined.mental_health_indicators.stress += facial.emotions.stressed * 0.4;
      combined.mental_health_indicators.anxiety += facial.emotions.anxious * 0.4;
    }

    if (voice) {
      combined.mental_health_indicators.stress += voice.metrics.emotionalMarkers.stress * 0.3;
      combined.mental_health_indicators.anxiety += voice.metrics.emotionalMarkers.anxiety * 0.3;
    }

    if (behavioral) {
      combined.mental_health_indicators.engagement = behavioral.engagement_level;
      
      // Add stress from behavioral indicators
      const stressCount = Object.values(behavioral.stress_indicators).filter(Boolean).length;
      combined.mental_health_indicators.stress += (stressCount / 3) * 0.3;
    }

    // Generate recommendations
    combined.recommendations = this.generateMentalHealthRecommendations(combined.mental_health_indicators);

    return combined;
  }

  // Generate mental health recommendations
  generateMentalHealthRecommendations(indicators) {
    const recommendations = [];

    if (indicators.stress > 0.6) {
      recommendations.push({
        type: 'stress_management',
        message: 'High stress levels detected. Consider stress reduction techniques.',
        priority: 'high',
        suggestions: [
          'Take deep breathing breaks',
          'Practice mindfulness meditation',
          'Consider shorter consultation sessions'
        ]
      });
    }

    if (indicators.anxiety > 0.5) {
      recommendations.push({
        type: 'anxiety_support',
        message: 'Anxiety indicators present. Extra reassurance may be beneficial.',
        priority: 'medium',
        suggestions: [
          'Provide clear explanations',
          'Allow extra time for questions',
          'Use calming communication techniques'
        ]
      });
    }

    if (indicators.engagement < 0.3) {
      recommendations.push({
        type: 'engagement',
        message: 'Low engagement detected. Consider interactive approaches.',
        priority: 'medium',
        suggestions: [
          'Ask more engaging questions',
          'Use visual aids or demonstrations',
          'Check for understanding frequently'
        ]
      });
    }

    return recommendations;
  }

  // Update emotion analysis session
  updateEmotionSession(analysis) {
    if (!this.realTimeSession) return;

    this.realTimeSession.emotionHistory.push(analysis);
    this.realTimeSession.currentEmotion = analysis;

    // Update mental health indicators (running average)
    const indicators = this.realTimeSession.mentalHealthIndicators;
    const newIndicators = analysis.mental_health_indicators;
    
    Object.keys(indicators).forEach(key => {
      indicators[key] = (indicators[key] * 0.8) + (newIndicators[key] * 0.2);
    });
  }

  // Check for mental health alerts
  checkMentalHealthAlerts(analysis) {
    const alerts = [];

    // High stress alert
    if (analysis.mental_health_indicators.stress > 0.8) {
      alerts.push({
        type: 'high_stress',
        severity: 'urgent',
        message: 'Patient showing signs of high stress',
        timestamp: Date.now(),
        recommendations: [
          'Consider pausing consultation',
          'Offer relaxation techniques',
          'Check patient comfort level'
        ]
      });
    }

    // Severe anxiety alert
    if (analysis.mental_health_indicators.anxiety > 0.8) {
      alerts.push({
        type: 'severe_anxiety',
        severity: 'urgent',
        message: 'Patient exhibiting severe anxiety symptoms',
        timestamp: Date.now(),
        recommendations: [
          'Use calming communication',
          'Provide reassurance',
          'Consider anxiety management referral'
        ]
      });
    }

    // Depression indicators
    if (analysis.primary_emotion === 'sad' && analysis.confidence > 0.7) {
      const sadnessHistory = this.realTimeSession?.emotionHistory
        ?.slice(-5)
        ?.filter(e => e.primary_emotion === 'sad').length || 0;
      
      if (sadnessHistory >= 3) {
        alerts.push({
          type: 'depression_indicators',
          severity: 'medium',
          message: 'Persistent sadness detected - consider mental health screening',
          timestamp: Date.now(),
          recommendations: [
            'Gentle inquiry about mood',
            'Consider mental health referral',
            'Provide emotional support resources'
          ]
        });
      }
    }

    // Fire alerts if any
    if (alerts.length > 0) {
      this.triggerMentalHealthAlerts(alerts);
    }
  }

  // Trigger mental health alerts
  triggerMentalHealthAlerts(alerts) {
    alerts.forEach(alert => {
      // Emit custom event for UI to handle
      window.dispatchEvent(new CustomEvent('mentalHealthAlert', {
        detail: alert
      }));

      console.warn('Mental Health Alert:', alert);
    });
  }

  // Stop emotion analysis
  stopEmotionAnalysis() {
    if (this.realTimeSession) {
      if (this.realTimeSession.analysisInterval) {
        clearInterval(this.realTimeSession.analysisInterval);
      }
      
      const sessionSummary = this.generateSessionSummary();
      this.analysisHistory.push({
        ...this.realTimeSession,
        endTime: Date.now(),
        summary: sessionSummary
      });
      
      this.realTimeSession = null;
      return sessionSummary;
    }
    return null;
  }

  // Generate session summary
  generateSessionSummary() {
    if (!this.realTimeSession) return null;

    const duration = Date.now() - this.realTimeSession.startTime;
    const emotionHistory = this.realTimeSession.emotionHistory;
    const indicators = this.realTimeSession.mentalHealthIndicators;

    // Calculate dominant emotions throughout session
    const emotionCounts = {};
    emotionHistory.forEach(analysis => {
      emotionCounts[analysis.primary_emotion] = (emotionCounts[analysis.primary_emotion] || 0) + 1;
    });

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    return {
      duration: Math.round(duration / 1000), // seconds
      dominantEmotion,
      averageStress: Math.round(indicators.stress * 100) / 100,
      averageAnxiety: Math.round(indicators.anxiety * 100) / 100,
      engagementLevel: Math.round(indicators.engagement * 100) / 100,
      emotionChanges: emotionHistory.length,
      mentalHealthRecommendations: this.generateSessionRecommendations(indicators),
      riskLevel: this.calculateMentalHealthRisk(indicators)
    };
  }

  // Generate session-level recommendations
  generateSessionRecommendations(indicators) {
    const recommendations = [];

    if (indicators.stress > 0.5) {
      recommendations.push('Consider stress management techniques and follow-up');
    }

    if (indicators.anxiety > 0.4) {
      recommendations.push('Provide anxiety management resources and support');
    }

    if (indicators.engagement < 0.4) {
      recommendations.push('Improve communication strategies for better patient engagement');
    }

    return recommendations;
  }

  // Calculate mental health risk level
  calculateMentalHealthRisk(indicators) {
    const riskScore = (indicators.stress * 0.4) + (indicators.anxiety * 0.3) + 
                     ((1 - indicators.engagement) * 0.3);

    if (riskScore > 0.7) return 'HIGH';
    if (riskScore > 0.4) return 'MEDIUM';
    return 'LOW';
  }

  // Get default emotion data
  getDefaultEmotionData() {
    return {
      emotions: {
        happy: 0.2, sad: 0.1, angry: 0.05, fearful: 0.05,
        surprised: 0.1, disgusted: 0.05, neutral: 0.4,
        anxious: 0.03, stressed: 0.02
      },
      dominant: 'neutral',
      confidence: 0.5,
      timestamp: Date.now()
    };
  }

  // Initialize voice analysis
  async initializeVoiceAnalysis() {
    // Initialize Web Audio API for voice analysis
    try {
      if (!window.AudioContext && !window.webkitAudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('Voice analysis initialized');
    } catch (error) {
      console.warn('Voice analysis initialization failed:', error);
    }
  }

  // Initialize behavioral analysis
  async initializeBehavioralAnalysis() {
    // Set up behavioral tracking
    this.behavioralData = {
      mouseMovements: [],
      keystrokes: [],
      scrollPatterns: [],
      windowFocus: true
    };

    // Track mouse movements
    document.addEventListener('mousemove', (e) => {
      this.behavioralData.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      });
      
      // Keep only last 100 movements
      if (this.behavioralData.mouseMovements.length > 100) {
        this.behavioralData.mouseMovements.shift();
      }
    });

    // Track window focus
    window.addEventListener('focus', () => {
      this.behavioralData.windowFocus = true;
    });

    window.addEventListener('blur', () => {
      this.behavioralData.windowFocus = false;
    });

    console.log('Behavioral analysis initialized');
  }

  // Get current session data
  getCurrentSession() {
    return this.realTimeSession;
  }

  // Get analysis history
  getAnalysisHistory() {
    return this.analysisHistory;
  }

  // Export session data
  exportSessionData(sessionId) {
    const session = this.analysisHistory.find(s => s.startTime === sessionId);
    if (session) {
      return {
        ...session,
        exportedAt: Date.now(),
        format: 'mental_health_analysis_v1'
      };
    }
    return null;
  }
}

// Singleton instance
const aiEmotionEngine = new AIEmotionAnalysisEngine();

export default aiEmotionEngine;
export { AIEmotionAnalysisEngine };