// Real AI Medical Diagnosis System
// Uses actual Gemini API for medical analysis

class RealMedicalDiagnosis {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash';
    this.medicalKnowledgeBase = null;
    this.patientHistory = new Map();
  }

  // Initialize with medical knowledge base
  async initialize() {
    try {
      // Load medical knowledge base
      this.medicalKnowledgeBase = await this.loadMedicalKnowledge();
      return true;
    } catch (error) {
      console.error('Failed to initialize medical diagnosis system:', error);
      return false;
    }
  }

  // Comprehensive medical analysis using real patient data
  async analyzeMedicalCase(patientData) {
    try {
      const medicalPrompt = this.buildMedicalPrompt(patientData);
      
      const response = await fetch(`${this.baseURL}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: medicalPrompt }] }],
          generationConfig: {
            temperature: 0.1, // Low temperature for medical accuracy
            topK: 32,
            topP: 0.8,
            maxOutputTokens: 2000
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_MEDICAL",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const diagnosisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!diagnosisText) {
        throw new Error('No diagnosis received from AI');
      }

      // Parse and structure the diagnosis
      const structuredDiagnosis = await this.parseAIDiagnosis(diagnosisText, patientData);
      
      // Store in patient history
      this.storePatientDiagnosis(patientData.patientId, structuredDiagnosis);
      
      // Save to database
      await this.saveDiagnosisToDatabase(structuredDiagnosis, patientData);
      
      return structuredDiagnosis;

    } catch (error) {
      console.error('Medical diagnosis error:', error);
      return {
        success: false,
        error: error.message,
        fallbackDiagnosis: this.getFallbackDiagnosis(patientData)
      };
    }
  }

  // Build comprehensive medical prompt
  buildMedicalPrompt(patientData) {
    const prompt = `You are an advanced medical AI assistant providing diagnostic analysis. Analyze the following patient case and provide a comprehensive medical assessment.

PATIENT INFORMATION:
- Age: ${patientData.age || 'Not specified'}
- Gender: ${patientData.gender || 'Not specified'}
- Chief Complaint: ${patientData.chiefComplaint || 'General consultation'}

CURRENT SYMPTOMS:
${this.formatSymptoms(patientData.symptoms)}

VITAL SIGNS (if available):
${this.formatVitalSigns(patientData.vitals)}

MEDICAL HISTORY:
- Previous Conditions: ${patientData.medicalHistory?.conditions?.join(', ') || 'None reported'}
- Current Medications: ${patientData.medications?.join(', ') || 'None reported'}
- Allergies: ${patientData.allergies?.join(', ') || 'None known'}
- Family History: ${patientData.familyHistory || 'Not provided'}

ADDITIONAL CONTEXT:
${patientData.additionalInfo || 'None provided'}

Please provide your analysis in the following structured format:

DIFFERENTIAL DIAGNOSIS:
1. [Most likely diagnosis with probability and reasoning]
2. [Second most likely diagnosis with probability and reasoning]
3. [Other possible diagnoses]

RECOMMENDED TESTS:
- [Laboratory tests needed]
- [Imaging studies if indicated]
- [Other diagnostic procedures]

IMMEDIATE TREATMENT RECOMMENDATIONS:
- [Immediate interventions needed]
- [Medications to consider]
- [Lifestyle modifications]

RED FLAGS / URGENT CONCERNS:
- [Any concerning symptoms requiring immediate attention]

FOLLOW-UP CARE:
- [Recommended follow-up timeline]
- [Specialist referrals if needed]

CONFIDENCE LEVEL: [Rate your confidence in this diagnosis from 1-10]

IMPORTANT: This is an AI-assisted analysis for healthcare provider reference only. All medical decisions should be made by qualified healthcare professionals based on direct patient examination and clinical judgment.`;

    return prompt;
  }

  // Format symptoms for the prompt
  formatSymptoms(symptoms) {
    if (!symptoms || symptoms.length === 0) return 'No specific symptoms reported';
    
    return symptoms.map(symptom => {
      let formatted = `- ${symptom.name}`;
      if (symptom.severity) formatted += ` (Severity: ${symptom.severity}/10)`;
      if (symptom.duration) formatted += ` (Duration: ${symptom.duration})`;
      if (symptom.description) formatted += ` - ${symptom.description}`;
      return formatted;
    }).join('\n');
  }

  // Format vital signs for the prompt
  formatVitalSigns(vitals) {
    if (!vitals) return 'No vital signs available';
    
    let formatted = [];
    if (vitals.heartRate) formatted.push(`Heart Rate: ${vitals.heartRate} bpm`);
    if (vitals.bloodPressure) formatted.push(`Blood Pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`);
    if (vitals.temperature) formatted.push(`Temperature: ${vitals.temperature}°F`);
    if (vitals.respiratoryRate) formatted.push(`Respiratory Rate: ${vitals.respiratoryRate} breaths/min`);
    if (vitals.oxygenSaturation) formatted.push(`Oxygen Saturation: ${vitals.oxygenSaturation}%`);
    if (vitals.stressLevel) formatted.push(`Stress Level: ${vitals.stressLevel}%`);
    
    return formatted.length > 0 ? formatted.join('\n') : 'No vital signs available';
  }

  // Parse AI diagnosis response into structured data
  async parseAIDiagnosis(diagnosisText, patientData) {
    const diagnosis = {
      patientId: patientData.patientId,
      sessionId: patientData.sessionId,
      timestamp: new Date().toISOString(),
      rawAnalysis: diagnosisText,
      structured: {}
    };

    // Extract different sections using regex patterns
    try {
      // Extract differential diagnosis
      const ddxMatch = diagnosisText.match(/DIFFERENTIAL DIAGNOSIS:(.*?)(?=RECOMMENDED TESTS:|$)/s);
      if (ddxMatch) {
        diagnosis.structured.differentialDiagnosis = this.parseDifferentialDiagnosis(ddxMatch[1]);
      }

      // Extract recommended tests
      const testsMatch = diagnosisText.match(/RECOMMENDED TESTS:(.*?)(?=IMMEDIATE TREATMENT|$)/s);
      if (testsMatch) {
        diagnosis.structured.recommendedTests = this.parseRecommendedTests(testsMatch[1]);
      }

      // Extract treatment recommendations
      const treatmentMatch = diagnosisText.match(/IMMEDIATE TREATMENT RECOMMENDATIONS:(.*?)(?=RED FLAGS|$)/s);
      if (treatmentMatch) {
        diagnosis.structured.treatment = this.parseTreatmentRecommendations(treatmentMatch[1]);
      }

      // Extract red flags
      const redFlagsMatch = diagnosisText.match(/RED FLAGS \/ URGENT CONCERNS:(.*?)(?=FOLLOW-UP|$)/s);
      if (redFlagsMatch) {
        diagnosis.structured.redFlags = this.parseRedFlags(redFlagsMatch[1]);
      }

      // Extract follow-up care
      const followUpMatch = diagnosisText.match(/FOLLOW-UP CARE:(.*?)(?=CONFIDENCE LEVEL|$)/s);
      if (followUpMatch) {
        diagnosis.structured.followUp = this.parseFollowUp(followUpMatch[1]);
      }

      // Extract confidence level
      const confidenceMatch = diagnosisText.match(/CONFIDENCE LEVEL:\s*(\d+)/);
      if (confidenceMatch) {
        diagnosis.structured.confidenceLevel = parseInt(confidenceMatch[1]);
      }

      // Calculate overall risk assessment
      diagnosis.structured.riskAssessment = this.calculateRiskAssessment(diagnosis.structured);
      
      return {
        success: true,
        diagnosis
      };

    } catch (error) {
      console.error('Error parsing diagnosis:', error);
      return {
        success: false,
        error: 'Failed to parse AI diagnosis',
        rawDiagnosis: diagnosisText
      };
    }
  }

  // Parse differential diagnosis section
  parseDifferentialDiagnosis(text) {
    const diagnoses = [];
    const lines = text.trim().split('\n');
    
    lines.forEach(line => {
      const match = line.match(/(\d+)\.\s*(.*?)(?:\(|$)/);
      if (match) {
        const probabilityMatch = line.match(/(\d+)%/);
        diagnoses.push({
          condition: match[2].trim(),
          probability: probabilityMatch ? parseInt(probabilityMatch[1]) : null,
          reasoning: line.includes('(') ? line.split('(')[1]?.replace(')', '') : null
        });
      }
    });
    
    return diagnoses;
  }

  // Parse recommended tests
  parseRecommendedTests(text) {
    const tests = {
      laboratory: [],
      imaging: [],
      other: []
    };
    
    const lines = text.trim().split('\n');
    let currentCategory = 'other';
    
    lines.forEach(line => {
      const cleanLine = line.replace(/^[-*]\s*/, '').trim();
      if (!cleanLine) return;
      
      if (cleanLine.toLowerCase().includes('laboratory') || cleanLine.toLowerCase().includes('blood')) {
        currentCategory = 'laboratory';
      } else if (cleanLine.toLowerCase().includes('imaging') || cleanLine.toLowerCase().includes('x-ray') || cleanLine.toLowerCase().includes('ct') || cleanLine.toLowerCase().includes('mri')) {
        currentCategory = 'imaging';
      }
      
      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        tests[currentCategory].push(cleanLine);
      }
    });
    
    return tests;
  }

  // Parse treatment recommendations
  parseTreatmentRecommendations(text) {
    const treatment = {
      immediate: [],
      medications: [],
      lifestyle: []
    };
    
    const lines = text.trim().split('\n');
    
    lines.forEach(line => {
      const cleanLine = line.replace(/^[-*]\s*/, '').trim();
      if (!cleanLine) return;
      
      if (cleanLine.toLowerCase().includes('medication') || cleanLine.toLowerCase().includes('prescri')) {
        treatment.medications.push(cleanLine);
      } else if (cleanLine.toLowerCase().includes('lifestyle') || cleanLine.toLowerCase().includes('diet') || cleanLine.toLowerCase().includes('exercise')) {
        treatment.lifestyle.push(cleanLine);
      } else {
        treatment.immediate.push(cleanLine);
      }
    });
    
    return treatment;
  }

  // Parse red flags
  parseRedFlags(text) {
    return text.trim()
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // Parse follow-up recommendations
  parseFollowUp(text) {
    const followUp = {
      timeline: null,
      specialists: [],
      instructions: []
    };
    
    const lines = text.trim().split('\n');
    
    lines.forEach(line => {
      const cleanLine = line.replace(/^[-*]\s*/, '').trim();
      if (!cleanLine) return;
      
      if (cleanLine.toLowerCase().includes('week') || cleanLine.toLowerCase().includes('month') || cleanLine.toLowerCase().includes('day')) {
        followUp.timeline = cleanLine;
      } else if (cleanLine.toLowerCase().includes('specialist') || cleanLine.toLowerCase().includes('referral')) {
        followUp.specialists.push(cleanLine);
      } else {
        followUp.instructions.push(cleanLine);
      }
    });
    
    return followUp;
  }

  // Calculate overall risk assessment
  calculateRiskAssessment(structuredDiagnosis) {
    let riskScore = 0;
    let riskLevel = 'low';
    
    // Check for red flags
    if (structuredDiagnosis.redFlags && structuredDiagnosis.redFlags.length > 0) {
      riskScore += structuredDiagnosis.redFlags.length * 20;
    }
    
    // Check confidence level
    if (structuredDiagnosis.confidenceLevel && structuredDiagnosis.confidenceLevel < 5) {
      riskScore += 15;
    }
    
    // Check for urgent treatment needs
    if (structuredDiagnosis.treatment?.immediate?.length > 2) {
      riskScore += 10;
    }
    
    // Determine risk level
    if (riskScore > 40) riskLevel = 'high';
    else if (riskScore > 20) riskLevel = 'medium';
    
    return {
      score: Math.min(riskScore, 100),
      level: riskLevel,
      requiresImmediateAttention: riskScore > 40 || (structuredDiagnosis.redFlags && structuredDiagnosis.redFlags.length > 2)
    };
  }

  // Save diagnosis to database
  async saveDiagnosisToDatabase(diagnosis, patientData) {
    try {
      const response = await fetch('/api/medical-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...diagnosis.diagnosis,
          patientData: {
            age: patientData.age,
            gender: patientData.gender,
            symptoms: patientData.symptoms,
            vitals: patientData.vitals
          }
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save diagnosis to database');
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  // Store diagnosis in patient history
  storePatientDiagnosis(patientId, diagnosis) {
    if (!this.patientHistory.has(patientId)) {
      this.patientHistory.set(patientId, []);
    }
    
    this.patientHistory.get(patientId).push(diagnosis);
    
    // Keep only last 10 diagnoses per patient
    if (this.patientHistory.get(patientId).length > 10) {
      this.patientHistory.get(patientId).shift();
    }
  }

  // Get patient diagnosis history
  getPatientHistory(patientId) {
    return this.patientHistory.get(patientId) || [];
  }

  // Load medical knowledge base (simplified version)
  async loadMedicalKnowledge() {
    // In production, this would load from a comprehensive medical database
    return {
      commonConditions: [
        'Hypertension', 'Diabetes', 'Common Cold', 'Flu', 'Allergies',
        'Anxiety', 'Depression', 'Headaches', 'Back Pain', 'Asthma'
      ],
      redFlagSymptoms: [
        'Chest pain', 'Severe headache', 'Difficulty breathing',
        'Severe abdominal pain', 'Signs of stroke', 'High fever'
      ],
      urgentConditions: [
        'Heart attack', 'Stroke', 'Severe allergic reaction',
        'Diabetic emergency', 'Severe trauma'
      ]
    };
  }

  // Get fallback diagnosis if AI fails
  getFallbackDiagnosis(patientData) {
    return {
      message: 'Unable to provide AI diagnosis at this time',
      recommendations: [
        'Please consult with a healthcare provider for proper evaluation',
        'Monitor symptoms and seek immediate care if they worsen',
        'Keep a record of symptoms for the healthcare provider'
      ],
      urgentCare: patientData.symptoms?.some(s => 
        s.name.toLowerCase().includes('chest pain') ||
        s.name.toLowerCase().includes('difficulty breathing') ||
        s.severity > 8
      )
    };
  }
}

// Export for production use
export default RealMedicalDiagnosis;
export { RealMedicalDiagnosis };