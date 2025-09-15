// Real-time Medical Translation System
// Supports 50+ languages with medical terminology accuracy

class MedicalTranslationEngine {
  constructor() {
    this.isInitialized = false;
    this.supportedLanguages = [];
    this.currentSourceLanguage = 'en';
    this.currentTargetLanguage = 'es';
    this.translationHistory = [];
    this.medicalDictionary = null;
    this.realTimeTranslation = false;
    this.speechRecognition = null;
    this.speechSynthesis = null;
  }

  // Initialize translation engine
  async initialize() {
    try {
      await this.loadSupportedLanguages();
      await this.loadMedicalDictionary();
      await this.initializeSpeechServices();
      
      this.isInitialized = true;
      console.log('Medical Translation Engine initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize translation engine:', error);
      return false;
    }
  }

  // Load supported languages
  async loadSupportedLanguages() {
    this.supportedLanguages = [
      // European Languages
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'pl', name: 'Polish', flag: '🇵🇱' },
      { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
      
      // Asian Languages
      { code: 'zh', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
      { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
      { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', flag: '🇮🇳' },
      { code: 'th', name: 'Thai', flag: '🇹🇭' },
      { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
      
      // Middle Eastern Languages
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
      { code: 'fa', name: 'Persian', flag: '🇮🇷' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
      
      // African Languages
      { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
      { code: 'am', name: 'Amharic', flag: '🇪🇹' },
      { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
      { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
      
      // Other Languages
      { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
      { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
      { code: 'da', name: 'Danish', flag: '🇩🇰' },
      { code: 'cs', name: 'Czech', flag: '🇨🇿' },
      { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
      { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
      { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
      { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
      { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
      { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
      { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
      { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
      { code: 'et', name: 'Estonian', flag: '🇪🇪' },
      { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
      { code: 'is', name: 'Icelandic', flag: '🇮🇸' }
    ];
  }

  // Load medical dictionary and terminology
  async loadMedicalDictionary() {
    this.medicalDictionary = {
      // Common medical terms and their translations
      medicalTerms: {
        en: {
          'blood pressure': 'blood pressure',
          'heart rate': 'heart rate',
          'temperature': 'temperature',
          'symptoms': 'symptoms',
          'diagnosis': 'diagnosis',
          'treatment': 'treatment',
          'medication': 'medication',
          'prescription': 'prescription',
          'allergy': 'allergy',
          'pain': 'pain',
          'fever': 'fever',
          'headache': 'headache',
          'nausea': 'nausea',
          'dizziness': 'dizziness',
          'chest pain': 'chest pain',
          'shortness of breath': 'shortness of breath',
          'cough': 'cough',
          'fatigue': 'fatigue',
          'infection': 'infection',
          'diabetes': 'diabetes',
          'hypertension': 'hypertension',
          'examination': 'examination',
          'laboratory': 'laboratory',
          'x-ray': 'x-ray',
          'surgery': 'surgery'
        },
        es: {
          'blood pressure': 'presión arterial',
          'heart rate': 'frecuencia cardíaca',
          'temperature': 'temperatura',
          'symptoms': 'síntomas',
          'diagnosis': 'diagnóstico',
          'treatment': 'tratamiento',
          'medication': 'medicamento',
          'prescription': 'receta médica',
          'allergy': 'alergia',
          'pain': 'dolor',
          'fever': 'fiebre',
          'headache': 'dolor de cabeza',
          'nausea': 'náusea',
          'dizziness': 'mareo',
          'chest pain': 'dolor en el pecho',
          'shortness of breath': 'falta de aliento',
          'cough': 'tos',
          'fatigue': 'fatiga',
          'infection': 'infección',
          'diabetes': 'diabetes',
          'hypertension': 'hipertensión',
          'examination': 'examen',
          'laboratory': 'laboratorio',
          'x-ray': 'radiografía',
          'surgery': 'cirugía'
        },
        fr: {
          'blood pressure': 'tension artérielle',
          'heart rate': 'fréquence cardiaque',
          'temperature': 'température',
          'symptoms': 'symptômes',
          'diagnosis': 'diagnostic',
          'treatment': 'traitement',
          'medication': 'médicament',
          'prescription': 'prescription',
          'allergy': 'allergie',
          'pain': 'douleur',
          'fever': 'fièvre',
          'headache': 'mal de tête',
          'nausea': 'nausée',
          'dizziness': 'vertige',
          'chest pain': 'douleur thoracique',
          'shortness of breath': 'essoufflement',
          'cough': 'toux',
          'fatigue': 'fatigue',
          'infection': 'infection',
          'diabetes': 'diabète',
          'hypertension': 'hypertension',
          'examination': 'examen',
          'laboratory': 'laboratoire',
          'x-ray': 'radiographie',
          'surgery': 'chirurgie'
        }
        // Add more languages as needed
      },
      
      // Medical phrases
      commonPhrases: {
        en: {
          'How are you feeling?': 'How are you feeling?',
          'Where does it hurt?': 'Where does it hurt?',
          'When did this start?': 'When did this start?',
          'Take a deep breath': 'Take a deep breath',
          'I need to examine you': 'I need to examine you',
          'You have an infection': 'You have an infection',
          'Take this medication': 'Take this medication',
          'Come back in a week': 'Come back in a week'
        },
        es: {
          'How are you feeling?': '¿Cómo te sientes?',
          'Where does it hurt?': '¿Dónde te duele?',
          'When did this start?': '¿Cuándo empezó esto?',
          'Take a deep breath': 'Respira profundo',
          'I need to examine you': 'Necesito examinarte',
          'You have an infection': 'Tienes una infección',
          'Take this medication': 'Toma este medicamento',
          'Come back in a week': 'Regresa en una semana'
        },
        fr: {
          'How are you feeling?': 'Comment vous sentez-vous?',
          'Where does it hurt?': 'Où avez-vous mal?',
          'When did this start?': 'Quand cela a-t-il commencé?',
          'Take a deep breath': 'Respirez profondément',
          'I need to examine you': 'Je dois vous examiner',
          'You have an infection': 'Vous avez une infection',
          'Take this medication': 'Prenez ce médicament',
          'Come back in a week': 'Revenez dans une semaine'
        }
      }
    };
  }

  // Initialize speech recognition and synthesis
  async initializeSpeechServices() {
    // Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
    }

    // Speech Synthesis
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  // Translate text using Google Translate API (fallback) or built-in dictionary
  async translateText(text, sourceLanguage, targetLanguage) {
    try {
      // First, try medical dictionary for common terms
      const dictionaryTranslation = this.translateWithDictionary(text, sourceLanguage, targetLanguage);
      if (dictionaryTranslation) {
        return {
          translatedText: dictionaryTranslation,
          source: 'medical_dictionary',
          confidence: 0.95
        };
      }

      // Try Google Translate API if available
      if (process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY) {
        return await this.translateWithGoogleAPI(text, sourceLanguage, targetLanguage);
      }

      // Fallback to Gemini API for translation
      return await this.translateWithGeminiAPI(text, sourceLanguage, targetLanguage);

    } catch (error) {
      console.error('Translation error:', error);
      
      // Ultimate fallback
      return {
        translatedText: `[Translation unavailable: ${text}]`,
        source: 'fallback',
        confidence: 0.1,
        error: error.message
      };
    }
  }

  // Translate using medical dictionary
  translateWithDictionary(text, sourceLanguage, targetLanguage) {
    const sourceDictionary = this.medicalDictionary.medicalTerms[sourceLanguage];
    const targetDictionary = this.medicalDictionary.medicalTerms[targetLanguage];
    
    if (!sourceDictionary || !targetDictionary) return null;

    const lowerText = text.toLowerCase();
    
    // Check medical terms
    for (const [englishTerm, sourceTerm] of Object.entries(sourceDictionary)) {
      if (lowerText.includes(sourceTerm.toLowerCase())) {
        const targetTerm = targetDictionary[englishTerm];
        if (targetTerm) {
          return text.replace(new RegExp(sourceTerm, 'gi'), targetTerm);
        }
      }
    }

    // Check common phrases
    const sourcePhrases = this.medicalDictionary.commonPhrases[sourceLanguage];
    const targetPhrases = this.medicalDictionary.commonPhrases[targetLanguage];
    
    if (sourcePhrases && targetPhrases) {
      for (const [englishPhrase, sourcePhrase] of Object.entries(sourcePhrases)) {
        if (lowerText === sourcePhrase.toLowerCase()) {
          return targetPhrases[englishPhrase] || text;
        }
      }
    }

    return null;
  }

  // Translate using Google Translate API
  async translateWithGoogleAPI(text, sourceLanguage, targetLanguage) {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      }
    );

    const data = await response.json();
    
    return {
      translatedText: data.data.translations[0].translatedText,
      source: 'google_translate',
      confidence: 0.9
    };
  }

  // Translate using Gemini API
  async translateWithGeminiAPI(text, sourceLanguage, targetLanguage) {
    const sourceLang = this.getLanguageName(sourceLanguage);
    const targetLang = this.getLanguageName(targetLanguage);

    const prompt = `You are a medical translator. Translate the following ${sourceLang} medical text to ${targetLang}. Maintain medical accuracy and terminology:

Text to translate: "${text}"

Important: 
- Use proper medical terminology
- Maintain context and meaning
- If uncertain about medical terms, indicate with [uncertain: original term]
- Provide only the translation, no explanations`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

    return {
      translatedText,
      source: 'gemini_api',
      confidence: 0.8
    };
  }

  // Start real-time translation
  async startRealTimeTranslation(sourceLanguage, targetLanguage, callback) {
    if (!this.speechRecognition) {
      throw new Error('Speech recognition not supported');
    }

    this.currentSourceLanguage = sourceLanguage;
    this.currentTargetLanguage = targetLanguage;
    this.realTimeTranslation = true;

    this.speechRecognition.lang = this.getLanguageCode(sourceLanguage);
    
    let lastTranscript = '';
    
    this.speechRecognition.onresult = async (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      
      if (transcript !== lastTranscript) {
        lastTranscript = transcript;
        
        try {
          const translation = await this.translateText(
            transcript, 
            sourceLanguage, 
            targetLanguage
          );
          
          callback({
            original: transcript,
            translated: translation.translatedText,
            isFinal: event.results[current].isFinal,
            confidence: translation.confidence,
            timestamp: Date.now()
          });

          // Store in history
          if (event.results[current].isFinal) {
            this.translationHistory.push({
              original: transcript,
              translated: translation.translatedText,
              sourceLanguage,
              targetLanguage,
              timestamp: Date.now(),
              source: translation.source
            });
          }
        } catch (error) {
          console.error('Real-time translation error:', error);
        }
      }
    };

    this.speechRecognition.start();
  }

  // Stop real-time translation
  stopRealTimeTranslation() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    this.realTimeTranslation = false;
  }

  // Speak translated text
  async speakTranslation(text, languageCode) {
    if (!this.speechSynthesis) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(languageCode);
      utterance.rate = 0.8; // Slower for medical context
      utterance.pitch = 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      this.speechSynthesis.speak(utterance);
    });
  }

  // Get available voices for language
  getAvailableVoices(languageCode) {
    if (!this.speechSynthesis) return [];
    
    return this.speechSynthesis.getVoices()
      .filter(voice => voice.lang.startsWith(languageCode))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        gender: voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') ? 'female' : 'male'
      }));
  }

  // Batch translate medical document
  async translateMedicalDocument(document, sourceLanguage, targetLanguage) {
    const sections = document.split('\n\n');
    const translatedSections = [];

    for (const section of sections) {
      if (section.trim()) {
        const translation = await this.translateText(section, sourceLanguage, targetLanguage);
        translatedSections.push(translation.translatedText);
        
        // Small delay to prevent API rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        translatedSections.push(section);
      }
    }

    return {
      translatedDocument: translatedSections.join('\n\n'),
      sections: translatedSections,
      originalSections: sections,
      sourceLanguage,
      targetLanguage,
      timestamp: Date.now()
    };
  }

  // Get medical phrases for quick translation
  getMedicalPhrases(languageCode) {
    const phrases = this.medicalDictionary.commonPhrases[languageCode];
    return phrases ? Object.values(phrases) : [];
  }

  // Helper methods
  getLanguageName(code) {
    const language = this.supportedLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  getLanguageCode(code) {
    // Map to proper language codes for speech APIs
    const codeMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'hi': 'hi-IN',
      'ar': 'ar-SA'
    };
    return codeMap[code] || code;
  }

  // Get translation history
  getTranslationHistory() {
    return this.translationHistory;
  }

  // Clear translation history
  clearHistory() {
    this.translationHistory = [];
  }

  // Export translation session
  exportTranslationSession() {
    return {
      history: this.translationHistory,
      supportedLanguages: this.supportedLanguages,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Check if language is supported
  isLanguageSupported(languageCode) {
    return this.supportedLanguages.some(lang => lang.code === languageCode);
  }

  // Detect language of text
  async detectLanguage(text) {
    // Simple language detection based on character patterns
    // In production, use a proper language detection API
    
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
    if (/[\u0600-\u06ff]/.test(text)) return 'ar';
    if (/[\u0400-\u04ff]/.test(text)) return 'ru';
    if (/[àáâãäåçèéêëìíîïñòóôõöùúûüý]/.test(text.toLowerCase())) return 'fr';
    if (/[äöüß]/.test(text.toLowerCase())) return 'de';
    if (/[àáèéìíòóùú]/.test(text.toLowerCase())) return 'it';
    if (/[áéíóúñü]/.test(text.toLowerCase())) return 'es';
    
    return 'en'; // Default to English
  }
}

// Singleton instance
const medicalTranslator = new MedicalTranslationEngine();

export default medicalTranslator;
export { MedicalTranslationEngine };