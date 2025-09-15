/**
 * Smart Medical Assistant Chatbot
 * Advanced conversational AI for appointment scheduling, medication reminders,
 * and basic medical queries using LangGraph + RAG + Medical Knowledge Base
 */

class SmartMedicalAssistant {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
    this.medicalKnowledgeBase = {};
    this.appointments = [];
    this.medications = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the Smart Medical Assistant
   */
  async initialize(userProfile = {}) {
    try {
      this.userContext = userProfile;
      await this.loadMedicalKnowledgeBase();
      await this.loadUserData();
      this.isInitialized = true;
      
      console.log("Smart Medical Assistant initialized");
      return { success: true };
    } catch (error) {
      console.error("Failed to initialize Smart Medical Assistant:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load medical knowledge base for RAG
   */
  async loadMedicalKnowledgeBase() {
    this.medicalKnowledgeBase = {
      symptoms: {
        'fever': {
          description: 'Elevated body temperature above normal (98.6°F/37°C)',
          causes: ['infection', 'inflammation', 'medication reaction'],
          severity: {
            mild: '100.4-102°F',
            moderate: '102-104°F',
            severe: 'Above 104°F'
          },
          actions: {
            mild: ['rest', 'hydration', 'monitor temperature'],
            moderate: ['seek medical attention', 'fever reducers'],
            severe: ['emergency care', 'immediate medical attention']
          }
        },
        'headache': {
          description: 'Pain in the head or upper neck',
          types: ['tension', 'migraine', 'cluster', 'sinus'],
          triggers: ['stress', 'dehydration', 'lack of sleep'],
          redFlags: ['sudden severe headache', 'fever with headache', 'vision changes']
        },
        'chest pain': {
          description: 'Discomfort in chest area',
          types: ['cardiac', 'respiratory', 'gastrointestinal', 'musculoskeletal'],
          emergency: true,
          redFlags: ['crushing pain', 'radiating to arm/jaw', 'shortness of breath']
        }
      },
      medications: {
        dosage_guidelines: {
          'acetaminophen': '500-1000mg every 4-6 hours, max 4000mg/day',
          'ibuprofen': '200-400mg every 4-6 hours, max 1200mg/day'
        },
        interactions: {
          'warfarin': ['aspirin', 'ibuprofen', 'antibiotics'],
          'metformin': ['contrast dyes', 'alcohol']
        }
      },
      procedures: {
        'blood_test': {
          preparation: ['fasting 8-12 hours', 'avoid alcohol', 'list medications'],
          what_to_expect: 'Quick blood draw, minimal discomfort'
        },
        'mri': {
          preparation: ['remove metal objects', 'inform about implants', 'arrive early'],
          what_to_expect: 'Loud noises, stay still, 30-60 minutes'
        }
      }
    };
  }

  /**
   * Load user-specific data
   */
  async loadUserData() {
    // Load from localStorage for demo
    const storedData = localStorage.getItem('medicalAssistantData');
    if (storedData) {
      const data = JSON.parse(storedData);
      this.appointments = data.appointments || [];
      this.medications = data.medications || [];
      this.conversationHistory = data.conversationHistory || [];
    }
  }

  /**
   * Save user data
   */
  saveUserData() {
    const data = {
      appointments: this.appointments,
      medications: this.medications,
      conversationHistory: this.conversationHistory.slice(-50) // Keep last 50 messages
    };
    localStorage.setItem('medicalAssistantData', JSON.stringify(data));
  }

  /**
   * Process user message and generate response
   */
  async processMessage(message, context = {}) {
    try {
      // Add to conversation history
      this.conversationHistory.push({
        type: 'user',
        message,
        timestamp: Date.now(),
        context
      });

      // Analyze intent and generate response
      const response = await this.generateResponse(message, context);
      
      // Add response to history
      this.conversationHistory.push({
        type: 'assistant',
        message: response.text,
        data: response.data,
        timestamp: Date.now(),
        intent: response.intent
      });

      // Save data
      this.saveUserData();

      return response;
    } catch (error) {
      console.error("Error processing message:", error);
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team.",
        intent: 'error',
        error: error.message
      };
    }
  }

  /**
   * Generate intelligent response using NLP and medical knowledge
   */
  async generateResponse(message, context) {
    const intent = this.classifyIntent(message);
    
    switch (intent.category) {
      case 'appointment_scheduling':
        return await this.handleAppointmentScheduling(message, intent);
      
      case 'medication_inquiry':
        return await this.handleMedicationInquiry(message, intent);
      
      case 'symptom_check':
        return await this.handleSymptomCheck(message, intent);
      
      case 'medication_reminder':
        return await this.handleMedicationReminder(message, intent);
      
      case 'test_results':
        return await this.handleTestResults(message, intent);
      
      case 'emergency':
        return await this.handleEmergency(message, intent);
      
      case 'general_health':
        return await this.handleGeneralHealthQuery(message, intent);
      
      default:
        return await this.handleGeneralQuery(message, intent);
    }
  }

  /**
   * Classify user intent using NLP
   */
  classifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Emergency keywords
    const emergencyKeywords = ['emergency', 'urgent', 'chest pain', 'can\'t breathe', 'severe pain', 'bleeding', 'unconscious'];
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { category: 'emergency', confidence: 0.9, keywords: emergencyKeywords.filter(k => lowerMessage.includes(k)) };
    }

    // Appointment scheduling
    const appointmentKeywords = ['appointment', 'schedule', 'book', 'reschedule', 'cancel', 'available', 'doctor visit'];
    if (appointmentKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { category: 'appointment_scheduling', confidence: 0.8, keywords: appointmentKeywords.filter(k => lowerMessage.includes(k)) };
    }

    // Medication queries
    const medicationKeywords = ['medication', 'medicine', 'pill', 'dosage', 'side effects', 'prescription', 'drug interaction'];
    if (medicationKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { category: 'medication_inquiry', confidence: 0.8, keywords: medicationKeywords.filter(k => lowerMessage.includes(k)) };
    }

    // Symptom checking
    const symptomKeywords = ['symptoms', 'feeling', 'pain', 'headache', 'fever', 'cough', 'nausea', 'dizzy', 'tired'];
    if (symptomKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { category: 'symptom_check', confidence: 0.7, keywords: symptomKeywords.filter(k => lowerMessage.includes(k)) };
    }

    // Medication reminders
    const reminderKeywords = ['remind', 'reminder', 'when to take', 'forgot', 'missed dose'];
    if (reminderKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { category: 'medication_reminder', confidence: 0.8, keywords: reminderKeywords.filter(k => lowerMessage.includes(k)) };
    }

    // Test results
    const testKeywords = ['test results', 'lab results', 'blood work', 'x-ray', 'mri', 'ct scan'];
    if (testKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { category: 'test_results', confidence: 0.7, keywords: testKeywords.filter(k => lowerMessage.includes(k)) };
    }

    return { category: 'general_query', confidence: 0.5, keywords: [] };
  }

  /**
   * Handle appointment scheduling requests
   */
  async handleAppointmentScheduling(message, intent) {
    const lowerMessage = message.toLowerCase();
    
    // Check for scheduling action
    if (lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
      return {
        text: "I'd be happy to help you schedule an appointment! Here are the available options:\n\n" +
              "📅 **Available Time Slots:**\n" +
              "• Tomorrow at 2:00 PM\n" +
              "• Friday at 10:30 AM\n" +
              "• Monday at 3:15 PM\n\n" +
              "Which time works best for you? You can also specify if you need a particular type of consultation.",
        intent: 'appointment_scheduling',
        data: {
          action: 'show_available_slots',
          slots: [
            { time: 'Tomorrow 2:00 PM', available: true },
            { time: 'Friday 10:30 AM', available: true },
            { time: 'Monday 3:15 PM', available: true }
          ]
        }
      };
    }
    
    // Check for rescheduling
    if (lowerMessage.includes('reschedule') || lowerMessage.includes('change')) {
      return {
        text: "I can help you reschedule your appointment. Let me check your current bookings...\n\n" +
              "📋 **Current Appointments:**\n" +
              "• Dr. Smith - Thursday at 3:00 PM\n\n" +
              "Would you like to move this to a different time? I can show you available alternatives.",
        intent: 'appointment_rescheduling',
        data: {
          current_appointments: this.appointments
        }
      };
    }

    // Check for cancellation
    if (lowerMessage.includes('cancel')) {
      return {
        text: "I can help you cancel your appointment. Please note our cancellation policy:\n\n" +
              "⚠️ **Cancellation Policy:**\n" +
              "• 24+ hours advance notice: No fee\n" +
              "• Less than 24 hours: $25 fee\n" +
              "• No-show: $50 fee\n\n" +
              "Which appointment would you like to cancel?",
        intent: 'appointment_cancellation'
      };
    }

    return {
      text: "I can help you with appointment scheduling. You can:\n\n" +
            "📅 **Schedule** a new appointment\n" +
            "🔄 **Reschedule** an existing appointment\n" +
            "❌ **Cancel** an appointment\n" +
            "📋 **View** your upcoming appointments\n\n" +
            "What would you like to do?",
      intent: 'appointment_menu'
    };
  }

  /**
   * Handle medication inquiries
   */
  async handleMedicationInquiry(message, intent) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific medications
    const mentionedMeds = Object.keys(this.medicalKnowledgeBase.medications.dosage_guidelines)
      .filter(med => lowerMessage.includes(med));
    
    if (mentionedMeds.length > 0) {
      const med = mentionedMeds[0];
      const dosage = this.medicalKnowledgeBase.medications.dosage_guidelines[med];
      
      return {
        text: `💊 **${med.charAt(0).toUpperCase() + med.slice(1)} Information:**\n\n` +
              `**Recommended Dosage:** ${dosage}\n\n` +
              `**Important Safety Notes:**\n` +
              `• Take with food if stomach upset occurs\n` +
              `• Don't exceed maximum daily dose\n` +
              `• Consult your doctor if symptoms persist\n\n` +
              `⚠️ Always follow your doctor's specific instructions, which may differ from general guidelines.`,
        intent: 'medication_info',
        data: { medication: med, dosage }
      };
    }

    // Check for drug interactions
    if (lowerMessage.includes('interaction') || lowerMessage.includes('together')) {
      return {
        text: "🔍 **Drug Interaction Check**\n\n" +
              "I can help check for potential medication interactions. Please tell me:\n\n" +
              "1. What medications are you currently taking?\n" +
              "2. What new medication are you considering?\n\n" +
              "⚠️ **Important:** This is for informational purposes only. Always consult your pharmacist or doctor before combining medications.",
        intent: 'drug_interaction_check'
      };
    }

    return {
      text: "💊 I can help with medication questions including:\n\n" +
            "• **Dosage guidelines** for common medications\n" +
            "• **Drug interactions** and safety checks\n" +
            "• **Side effects** information\n" +
            "• **When to take** medications\n\n" +
            "What specific medication information do you need?",
      intent: 'medication_general'
    };
  }

  /**
   * Handle symptom checking
   */
  async handleSymptomCheck(message, intent) {
    const symptoms = this.extractSymptoms(message);
    
    if (symptoms.length > 0) {
      const primarySymptom = symptoms[0];
      const symptomInfo = this.medicalKnowledgeBase.symptoms[primarySymptom];
      
      if (symptomInfo) {
        let response = `🩺 **Symptom Assessment: ${primarySymptom.charAt(0).toUpperCase() + primarySymptom.slice(1)}**\n\n`;
        response += `**Description:** ${symptomInfo.description}\n\n`;
        
        if (symptomInfo.emergency) {
          response += `🚨 **IMPORTANT:** This symptom can be serious. `;
          response += `If you're experiencing severe symptoms, please seek immediate medical attention or call emergency services.\n\n`;
        }
        
        if (symptomInfo.redFlags) {
          response += `⚠️ **Seek immediate medical attention if you have:**\n`;
          symptomInfo.redFlags.forEach(flag => {
            response += `• ${flag}\n`;
          });
          response += `\n`;
        }
        
        if (symptomInfo.actions) {
          response += `**General Self-Care Recommendations:**\n`;
          const mildActions = symptomInfo.actions.mild || [];
          mildActions.forEach(action => {
            response += `• ${action}\n`;
          });
        }
        
        response += `\n💡 **Note:** This is general information only. Please consult a healthcare professional for proper diagnosis and treatment.`;
        
        return {
          text: response,
          intent: 'symptom_assessment',
          data: { symptom: primarySymptom, info: symptomInfo }
        };
      }
    }

    return {
      text: "🩺 I can help assess your symptoms. Please describe:\n\n" +
            "• What symptoms you're experiencing\n" +
            "• When they started\n" +
            "• How severe they are (1-10 scale)\n" +
            "• Any other relevant details\n\n" +
            "⚠️ **Emergency Warning:** If you're experiencing severe chest pain, difficulty breathing, or other emergency symptoms, please call 911 immediately.",
      intent: 'symptom_inquiry'
    };
  }

  /**
   * Handle medication reminders
   */
  async handleMedicationReminder(message, intent) {
    return {
      text: "⏰ **Medication Reminder Service**\n\n" +
            "I can help you set up medication reminders! Here's what I can do:\n\n" +
            "📱 **Reminder Options:**\n" +
            "• Daily medication alerts\n" +
            "• Custom timing for each medication\n" +
            "• Refill reminders\n" +
            "• Missed dose notifications\n\n" +
            "To set up reminders, please tell me:\n" +
            "1. Medication name\n" +
            "2. How often you take it\n" +
            "3. Preferred reminder times\n\n" +
            "Would you like to set up a reminder now?",
      intent: 'medication_reminder_setup',
      data: {
        available_features: ['daily_alerts', 'custom_timing', 'refill_reminders', 'missed_dose_alerts']
      }
    };
  }

  /**
   * Handle emergency situations
   */
  async handleEmergency(message, intent) {
    return {
      text: "🚨 **EMERGENCY ASSISTANCE**\n\n" +
            "If this is a life-threatening emergency:\n" +
            "📞 **CALL 911 IMMEDIATELY**\n\n" +
            "For urgent but non-emergency medical issues:\n" +
            "• Use our emergency consultation feature\n" +
            "• Contact your doctor's after-hours line\n" +
            "• Visit the nearest urgent care center\n\n" +
            "Common emergency symptoms that require 911:\n" +
            "• Chest pain or heart attack symptoms\n" +
            "• Severe difficulty breathing\n" +
            "• Stroke symptoms (FAST test)\n" +
            "• Severe allergic reactions\n" +
            "• Major trauma or bleeding\n\n" +
            "Would you like me to help you start an emergency video consultation?",
      intent: 'emergency_response',
      data: {
        emergency_actions: ['call_911', 'emergency_consultation', 'urgent_care']
      }
    };
  }

  /**
   * Handle general health queries
   */
  async handleGeneralHealthQuery(message, intent) {
    const lowerMessage = message.toLowerCase();
    
    // Health tips
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
      const healthTips = [
        "💧 Stay hydrated - aim for 8 glasses of water daily",
        "🏃‍♀️ Get at least 30 minutes of moderate exercise most days",
        "😴 Aim for 7-9 hours of quality sleep each night",
        "🥗 Eat a balanced diet rich in fruits and vegetables",
        "🧘‍♀️ Practice stress management through meditation or relaxation",
        "🚭 Avoid smoking and limit alcohol consumption",
        "👥 Maintain social connections and relationships",
        "📱 Limit screen time, especially before bed"
      ];
      
      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
      
      return {
        text: `💡 **Daily Health Tip:**\n\n${randomTip}\n\n` +
              "Would you like more personalized health recommendations or tips for a specific area?",
        intent: 'health_tip'
      };
    }

    // Preventive care
    if (lowerMessage.includes('prevent') || lowerMessage.includes('screening')) {
      return {
        text: "🛡️ **Preventive Care Recommendations:**\n\n" +
              "**Regular Screenings:**\n" +
              "• Annual physical exam\n" +
              "• Blood pressure check\n" +
              "• Cholesterol screening (every 5 years)\n" +
              "• Cancer screenings (age-appropriate)\n\n" +
              "**Vaccinations:**\n" +
              "• Annual flu shot\n" +
              "• COVID-19 boosters as recommended\n" +
              "• Other vaccines per CDC guidelines\n\n" +
              "Would you like specific recommendations based on your age and health history?",
        intent: 'preventive_care'
      };
    }

    return {
      text: "🏥 I'm here to help with your healthcare needs! I can assist with:\n\n" +
            "📅 **Appointment Management**\n" +
            "💊 **Medication Information**\n" +
            "🩺 **Symptom Assessment**\n" +
            "⏰ **Medication Reminders**\n" +
            "💡 **Health Tips & Education**\n" +
            "🚨 **Emergency Guidance**\n\n" +
            "What can I help you with today?",
      intent: 'general_menu'
    };
  }

  /**
   * Handle general queries
   */
  async handleGeneralQuery(message, intent) {
    return {
      text: "I'm your AI medical assistant, here to help with healthcare-related questions and tasks. " +
            "While I can provide general information and assistance, I'm not a replacement for professional medical advice.\n\n" +
            "I can help you with:\n" +
            "• Scheduling appointments\n" +
            "• Medication information\n" +
            "• General health questions\n" +
            "• Symptom guidance\n\n" +
            "What would you like assistance with?",
      intent: 'general_response'
    };
  }

  /**
   * Extract symptoms from message
   */
  extractSymptoms(message) {
    const symptoms = [];
    const lowerMessage = message.toLowerCase();
    
    Object.keys(this.medicalKnowledgeBase.symptoms).forEach(symptom => {
      if (lowerMessage.includes(symptom)) {
        symptoms.push(symptom);
      }
    });
    
    return symptoms;
  }

  /**
   * Get conversation history
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    this.saveUserData();
  }

  /**
   * Get user context and preferences
   */
  getUserContext() {
    return this.userContext;
  }

  /**
   * Update user context
   */
  updateUserContext(updates) {
    this.userContext = { ...this.userContext, ...updates };
    this.saveUserData();
  }
}

export default SmartMedicalAssistant;