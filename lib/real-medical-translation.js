/**
 * Production Medical Translation System
 * Real-time translation for medical consultations using Google Translate API
 */

import { Translate } from '@google-cloud/translate/build/src/v2';

// Initialize Google Translate API
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

// Medical translation context and terminology
const MEDICAL_TERMINOLOGY = {
  'heart rate': 'نبض القلب',
  'blood pressure': 'ضغط الدم', 
  'temperature': 'درجة الحرارة',
  'symptoms': 'الأعراض',
  'diagnosis': 'التشخيص',
  'prescription': 'الوصفة الطبية',
  'medication': 'الدواء',
  'dosage': 'الجرعة',
  'pain': 'ألم',
  'fever': 'حمى',
  'cough': 'سعال',
  'headache': 'صداع',
  'nausea': 'غثيان',
  'dizziness': 'دوخة',
  'fatigue': 'تعب',
  'chest pain': 'ألم في الصدر',
  'shortness of breath': 'ضيق في التنفس',
  'emergency': 'طوارئ',
  'urgent': 'عاجل',
  'critical': 'حرج',
  'stable': 'مستقر',
  'improving': 'يتحسن',
  'worsening': 'يتدهور'
};

// Supported languages for medical consultations
const SUPPORTED_LANGUAGES = {
  'ar': 'Arabic - العربية',
  'es': 'Spanish - Español', 
  'fr': 'French - Français',
  'de': 'German - Deutsch',
  'it': 'Italian - Italiano',
  'pt': 'Portuguese - Português',
  'ru': 'Russian - Русский',
  'zh': 'Chinese - 中文',
  'ja': 'Japanese - 日本語',
  'ko': 'Korean - 한국어',
  'hi': 'Hindi - हिंदी',
  'ur': 'Urdu - اردو',
  'fa': 'Persian - فارسی',
  'tr': 'Turkish - Türkçe',
  'nl': 'Dutch - Nederlands',
  'sv': 'Swedish - Svenska',
  'no': 'Norwegian - Norsk',
  'da': 'Danish - Dansk',
  'fi': 'Finnish - Suomi',
  'pl': 'Polish - Polski',
  'en': 'English'
};

class RealMedicalTranslation {
  constructor() {
    this.activeTranslations = new Map();
    this.translationHistory = [];
    this.medicalContext = '';
    this.currentLanguages = { source: 'en', target: 'ar' };
    this.realTimeMode = false;
    this.translationQueue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize translation session for medical consultation
   * @param {Object} config - Translation configuration
   */
  async initializeSession(config) {
    try {
      const {
        sessionId,
        sourceLanguage = 'en',
        targetLanguage = 'ar',
        patientId,
        doctorId,
        medicalContext = '',
        realTime = true
      } = config;

      // Validate supported languages
      if (!SUPPORTED_LANGUAGES[sourceLanguage] || !SUPPORTED_LANGUAGES[targetLanguage]) {
        throw new Error('Unsupported language pair');
      }

      this.sessionId = sessionId;
      this.currentLanguages = { source: sourceLanguage, target: targetLanguage };
      this.medicalContext = medicalContext;
      this.realTimeMode = realTime;
      this.patientId = patientId;
      this.doctorId = doctorId;

      // Test API connectivity
      await this.testTranslationAPI();

      // Initialize translation history storage
      await this.initializeTranslationStorage();

      console.log(`Medical translation session initialized: ${sourceLanguage} → ${targetLanguage}`);
      
      return {
        success: true,
        sessionId,
        supportedLanguages: SUPPORTED_LANGUAGES,
        currentLanguages: this.currentLanguages,
        realTimeEnabled: this.realTimeMode
      };

    } catch (error) {
      console.error('Translation session initialization failed:', error);
      throw new Error(`Failed to initialize translation: ${error.message}`);
    }
  }

  /**
   * Test Google Translate API connectivity
   */
  async testTranslationAPI() {
    try {
      const [translation] = await translate.translate('Hello', this.currentLanguages.target);
      console.log('Translation API test successful');
      return true;
    } catch (error) {
      console.error('Translation API test failed:', error);
      throw new Error('Google Translate API not accessible');
    }
  }

  /**
   * Translate medical text with context awareness
   * @param {string} text - Text to translate
   * @param {Object} options - Translation options
   */
  async translateMedicalText(text, options = {}) {
    try {
      const {
        sourceLanguage = this.currentLanguages.source,
        targetLanguage = this.currentLanguages.target,
        isUrgent = false,
        speaker = 'unknown',
        medicalTerms = true
      } = options;

      // Pre-process medical terminology
      let processedText = text;
      if (medicalTerms) {
        processedText = this.enhanceMedicalTerminology(text);
      }

      // Add medical context for better translation
      const contextualText = this.addMedicalContext(processedText);

      // Perform translation
      const [translation] = await translate.translate(contextualText, {
        from: sourceLanguage,
        to: targetLanguage
      });

      // Post-process translation
      const finalTranslation = this.refineMedicalTranslation(translation, targetLanguage);

      // Store translation
      const translationRecord = {
        id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: this.sessionId,
        originalText: text,
        translatedText: finalTranslation,
        sourceLanguage,
        targetLanguage,
        speaker,
        isUrgent,
        confidence: this.calculateTranslationConfidence(text, finalTranslation),
        timestamp: new Date(),
        medicalTermsDetected: this.detectMedicalTerms(text)
      };

      await this.storeTranslation(translationRecord);
      this.translationHistory.push(translationRecord);

      return {
        success: true,
        translation: finalTranslation,
        original: text,
        confidence: translationRecord.confidence,
        medicalTerms: translationRecord.medicalTermsDetected,
        languages: { source: sourceLanguage, target: targetLanguage },
        id: translationRecord.id
      };

    } catch (error) {
      console.error('Medical translation failed:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Real-time translation for live conversations
   * @param {string} text - Text to translate in real-time
   * @param {Object} options - Real-time options
   */
  async realTimeTranslate(text, options = {}) {
    if (!this.realTimeMode) {
      throw new Error('Real-time mode not enabled');
    }

    try {
      const {
        speaker = 'unknown',
        isDoctor = false,
        priority = 'normal'
      } = options;

      // Add to translation queue for processing
      const translationTask = {
        id: `rt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        text,
        speaker,
        isDoctor,
        priority,
        timestamp: new Date(),
        status: 'queued'
      };

      this.translationQueue.push(translationTask);

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processTranslationQueue();
      }

      return {
        success: true,
        taskId: translationTask.id,
        queuePosition: this.translationQueue.length,
        estimatedWait: this.translationQueue.length * 0.5 // seconds
      };

    } catch (error) {
      console.error('Real-time translation error:', error);
      throw new Error(`Real-time translation failed: ${error.message}`);
    }
  }

  /**
   * Process translation queue for real-time translations
   */
  async processTranslationQueue() {
    this.isProcessing = true;

    while (this.translationQueue.length > 0) {
      // Sort by priority (urgent first)
      this.translationQueue.sort((a, b) => {
        const priorityOrder = { 'urgent': 0, 'high': 1, 'normal': 2, 'low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      const task = this.translationQueue.shift();
      
      try {
        task.status = 'processing';
        
        const result = await this.translateMedicalText(task.text, {
          speaker: task.speaker,
          isUrgent: task.priority === 'urgent'
        });

        task.status = 'completed';
        task.result = result;

        // Emit real-time translation result
        await this.emitRealTimeTranslation(task);

      } catch (error) {
        console.error(`Translation task ${task.id} failed:`, error);
        task.status = 'failed';
        task.error = error.message;
      }
    }

    this.isProcessing = false;
  }

  /**
   * Enhance text with medical terminology context
   * @param {string} text - Original text
   */
  enhanceMedicalTerminology(text) {
    let enhancedText = text;
    
    // Replace medical abbreviations with full terms
    const medicalAbbreviations = {
      'BP': 'blood pressure',
      'HR': 'heart rate',
      'RR': 'respiratory rate',
      'O2': 'oxygen',
      'CO2': 'carbon dioxide',
      'ECG': 'electrocardiogram',
      'EKG': 'electrocardiogram',
      'CBC': 'complete blood count',
      'UTI': 'urinary tract infection',
      'URI': 'upper respiratory infection',
      'MI': 'myocardial infarction',
      'CHF': 'congestive heart failure',
      'COPD': 'chronic obstructive pulmonary disease',
      'DM': 'diabetes mellitus',
      'HTN': 'hypertension'
    };

    Object.entries(medicalAbbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, full);
    });

    return enhancedText;
  }

  /**
   * Add medical context to improve translation accuracy
   * @param {string} text - Text to contextualize
   */
  addMedicalContext(text) {
    const contextPrefix = this.medicalContext ? `[Medical Context: ${this.medicalContext}] ` : '';
    return contextPrefix + text;
  }

  /**
   * Refine translation with medical-specific post-processing
   * @param {string} translation - Raw translation
   * @param {string} targetLanguage - Target language
   */
  refineMedicalTranslation(translation, targetLanguage) {
    let refinedTranslation = translation;

    // Remove context prefix if added
    if (refinedTranslation.startsWith('[Medical Context:')) {
      const contextEndIndex = refinedTranslation.indexOf('] ') + 2;
      refinedTranslation = refinedTranslation.substring(contextEndIndex);
    }

    // Apply language-specific medical refinements
    if (targetLanguage === 'ar') {
      refinedTranslation = this.refineArabicMedicalTerms(refinedTranslation);
    }

    return refinedTranslation.trim();
  }

  /**
   * Refine Arabic medical terminology
   * @param {string} text - Arabic text to refine
   */
  refineArabicMedicalTerms(text) {
    const arabicMedicalTerms = {
      'نبضة القلب': 'نبض القلب',
      'ضغط دم': 'ضغط الدم',
      'درجة حرارة': 'درجة الحرارة',
      'وصفة طبية': 'الوصفة الطبية'
    };

    let refinedText = text;
    Object.entries(arabicMedicalTerms).forEach(([incorrect, correct]) => {
      const regex = new RegExp(incorrect, 'g');
      refinedText = refinedText.replace(regex, correct);
    });

    return refinedText;
  }

  /**
   * Detect medical terms in text
   * @param {string} text - Text to analyze
   */
  detectMedicalTerms(text) {
    const medicalTermsList = Object.keys(MEDICAL_TERMINOLOGY);
    const detectedTerms = [];

    medicalTermsList.forEach(term => {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        detectedTerms.push(term);
      }
    });

    // Add additional medical term detection
    const medicalKeywords = [
      'pain', 'ache', 'symptom', 'diagnosis', 'treatment', 'medication',
      'dose', 'pill', 'tablet', 'injection', 'surgery', 'operation',
      'infection', 'virus', 'bacteria', 'disease', 'condition', 'syndrome',
      'allergy', 'reaction', 'side effect', 'complication'
    ];

    medicalKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword) && !detectedTerms.includes(keyword)) {
        detectedTerms.push(keyword);
      }
    });

    return detectedTerms;
  }

  /**
   * Calculate translation confidence score
   * @param {string} original - Original text
   * @param {string} translation - Translated text
   */
  calculateTranslationConfidence(original, translation) {
    // Basic confidence calculation based on text properties
    let confidence = 0.8; // Base confidence

    // Increase confidence for medical terms
    const medicalTermsCount = this.detectMedicalTerms(original).length;
    confidence += medicalTermsCount * 0.02;

    // Decrease confidence for very short texts
    if (original.length < 10) {
      confidence -= 0.1;
    }

    // Decrease confidence for very long texts
    if (original.length > 500) {
      confidence -= 0.05;
    }

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Initialize translation storage
   */
  async initializeTranslationStorage() {
    try {
      // Create translation session record
      const response = await fetch('/api/medical-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          sessionId: this.sessionId,
          patientId: this.patientId,
          doctorId: this.doctorId,
          languages: this.currentLanguages,
          medicalContext: this.medicalContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize translation storage');
      }

      console.log('Translation storage initialized');
    } catch (error) {
      console.error('Translation storage initialization error:', error);
    }
  }

  /**
   * Store translation record
   * @param {Object} translationRecord - Translation data to store
   */
  async storeTranslation(translationRecord) {
    try {
      const response = await fetch('/api/medical-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store',
          translation: translationRecord
        })
      });

      if (!response.ok) {
        console.error('Failed to store translation');
      }
    } catch (error) {
      console.error('Translation storage error:', error);
    }
  }

  /**
   * Emit real-time translation result
   * @param {Object} task - Completed translation task
   */
  async emitRealTimeTranslation(task) {
    try {
      // Send real-time translation via WebSocket or Server-Sent Events
      const response = await fetch('/api/medical-translation/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          taskId: task.id,
          result: task.result,
          speaker: task.speaker,
          timestamp: task.timestamp
        })
      });

      if (!response.ok) {
        console.error('Failed to emit real-time translation');
      }
    } catch (error) {
      console.error('Real-time translation emit error:', error);
    }
  }

  /**
   * Switch translation languages
   * @param {string} sourceLanguage - New source language
   * @param {string} targetLanguage - New target language
   */
  switchLanguages(sourceLanguage, targetLanguage) {
    if (!SUPPORTED_LANGUAGES[sourceLanguage] || !SUPPORTED_LANGUAGES[targetLanguage]) {
      throw new Error('Unsupported language pair');
    }

    this.currentLanguages = { source: sourceLanguage, target: targetLanguage };
    
    console.log(`Language switched: ${sourceLanguage} → ${targetLanguage}`);
    
    return {
      success: true,
      currentLanguages: this.currentLanguages,
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }

  /**
   * Get translation history
   * @param {Object} filters - History filters
   */
  getTranslationHistory(filters = {}) {
    const {
      speaker = null,
      startDate = null,
      endDate = null,
      medicalTermsOnly = false,
      limit = 50
    } = filters;

    let filteredHistory = [...this.translationHistory];

    if (speaker) {
      filteredHistory = filteredHistory.filter(t => t.speaker === speaker);
    }

    if (startDate) {
      filteredHistory = filteredHistory.filter(t => t.timestamp >= startDate);
    }

    if (endDate) {
      filteredHistory = filteredHistory.filter(t => t.timestamp <= endDate);
    }

    if (medicalTermsOnly) {
      filteredHistory = filteredHistory.filter(t => t.medicalTermsDetected.length > 0);
    }

    return filteredHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get supported languages list
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      totalTranslations: this.translationHistory.length,
      averageConfidence: this.translationHistory.reduce((sum, t) => sum + t.confidence, 0) / this.translationHistory.length || 0,
      medicalTermsTranslated: this.translationHistory.reduce((sum, t) => sum + t.medicalTermsDetected.length, 0),
      languagePair: this.currentLanguages,
      realTimeMode: this.realTimeMode,
      queuedTranslations: this.translationQueue.length
    };
  }

  /**
   * End translation session
   */
  async endSession() {
    try {
      // Save final session data
      const sessionStats = this.getSessionStats();
      
      const response = await fetch('/api/medical-translation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId: this.sessionId,
          stats: sessionStats
        })
      });

      // Clear session data
      this.translationHistory = [];
      this.translationQueue = [];
      this.activeTranslations.clear();
      this.isProcessing = false;

      console.log('Medical translation session ended');
      
      return {
        success: true,
        finalStats: sessionStats
      };

    } catch (error) {
      console.error('Error ending translation session:', error);
      throw new Error(`Failed to end translation session: ${error.message}`);
    }
  }
}

export default RealMedicalTranslation;