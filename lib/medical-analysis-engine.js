// Enhanced Medical Analysis Engine
// Provides comprehensive medical report analysis with multiple AI systems integration

class MedicalAnalysisEngine {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.analysisHistory = [];
  }

  // Main analysis function that coordinates all AI systems
  async analyzeReport(reportData) {
    const { extractedText, patientInfo, fileName, fileType } = reportData;
    
    try {
      // Parallel execution of different analysis methods
      const [
        aiAnalysis,
        riskAssessment,
        vitalsAnalysis,
        structuredData
      ] = await Promise.allSettled([
        this.performAIAnalysis(extractedText, patientInfo),
        this.assessHealthRisks(extractedText, patientInfo),
        this.analyzeVitalSigns(extractedText),
        this.extractStructuredData(extractedText)
      ]);

      // Combine all analyses
      const comprehensiveAnalysis = {
        aiAnalysis: aiAnalysis.status === 'fulfilled' ? aiAnalysis.value : { error: 'AI analysis failed' },
        riskAssessment: riskAssessment.status === 'fulfilled' ? riskAssessment.value : { error: 'Risk assessment failed' },
        vitalsAnalysis: vitalsAnalysis.status === 'fulfilled' ? vitalsAnalysis.value : { error: 'Vitals analysis failed' },
        structuredData: structuredData.status === 'fulfilled' ? structuredData.value : { error: 'Data extraction failed' },
        metadata: {
          analysisId: `analysis_${Date.now()}`,
          timestamp: new Date().toISOString(),
          fileName,
          fileType,
          patientInfo
        }
      };

      // Store in history
      this.analysisHistory.push(comprehensiveAnalysis);
      
      return comprehensiveAnalysis;
    } catch (error) {
      console.error('Medical Analysis Engine Error:', error);
      throw new Error('Comprehensive analysis failed');
    }
  }

  // AI-powered analysis using Gemini
  async performAIAnalysis(extractedText, patientInfo) {
    if (!this.geminiApiKey) {
      return this.fallbackAnalysis(extractedText, patientInfo);
    }

    const prompt = this.buildAnalysisPrompt(extractedText, patientInfo);
    
    try {
      const response = await fetch(`${this.geminiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return {
          success: true,
          analysis,
          source: 'gemini-pro',
          confidence: 0.85,
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error('Gemini API request failed');
    } catch (error) {
      console.error('Gemini AI Analysis Error:', error);
      return this.fallbackAnalysis(extractedText, patientInfo);
    }
  }

  // Build comprehensive analysis prompt
  buildAnalysisPrompt(extractedText, patientInfo) {
    return `As an expert medical AI assistant, perform a comprehensive analysis of this medical report.

PATIENT PROFILE:
- Name: ${patientInfo.name || 'Not provided'}
- Age: ${patientInfo.age || 'Not provided'}
- Gender: ${patientInfo.gender || 'Not provided'}
- Medical History: ${patientInfo.medicalHistory || 'Not provided'}

MEDICAL REPORT CONTENT:
${extractedText}

ANALYSIS REQUIREMENTS:
Please provide a structured medical analysis with the following sections:

1. EXECUTIVE SUMMARY
   - Overall health status assessment
   - Key findings summary
   - Urgency level (LOW/MODERATE/HIGH/CRITICAL)

2. DETAILED FINDINGS
   - Laboratory values analysis
   - Abnormal results identification
   - Clinical significance of each finding

3. RISK ASSESSMENT
   - Disease risk factors identified
   - Cardiovascular risk evaluation
   - Diabetes risk evaluation
   - Other health risks

4. CLINICAL RECOMMENDATIONS
   - Immediate actions needed
   - Follow-up requirements
   - Lifestyle modifications
   - Specialist referrals

5. PATIENT EDUCATION
   - Key points to understand
   - Warning signs to watch for
   - Preventive measures

Format your response in clear, professional medical language suitable for both healthcare providers and informed patients.`;
  }

  // Assess various health risks
  async assessHealthRisks(extractedText, patientInfo) {
    const risks = {
      cardiovascular: this.assessCardiovascularRisk(extractedText, patientInfo),
      diabetes: this.assessDiabetesRisk(extractedText, patientInfo),
      kidney: this.assessKidneyRisk(extractedText, patientInfo),
      liver: this.assessLiverRisk(extractedText, patientInfo),
      overall: 'LOW'
    };

    // Calculate overall risk
    const riskLevels = Object.values(risks).filter(r => typeof r === 'object').map(r => r.level);
    if (riskLevels.includes('HIGH')) risks.overall = 'HIGH';
    else if (riskLevels.includes('MODERATE')) risks.overall = 'MODERATE';

    return risks;
  }

  // Cardiovascular risk assessment
  assessCardiovascularRisk(extractedText, patientInfo) {
    const text = extractedText.toLowerCase();
    let riskScore = 0;
    const riskFactors = [];

    // Age and gender
    const age = parseInt(patientInfo.age) || 0;
    if ((patientInfo.gender === 'Male' && age > 45) || (patientInfo.gender === 'Female' && age > 55)) {
      riskScore += 2;
      riskFactors.push('Age-related risk');
    }

    // Blood pressure patterns
    const bpMatch = text.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      if (systolic > 140 || diastolic > 90) {
        riskScore += 3;
        riskFactors.push('Hypertension');
      }
    }

    // Cholesterol patterns
    if (text.includes('cholesterol') && (text.includes('high') || text.includes('elevated'))) {
      riskScore += 2;
      riskFactors.push('High cholesterol');
    }

    // Smoking history
    if (text.includes('smok')) {
      riskScore += 2;
      riskFactors.push('Smoking history');
    }

    // Diabetes
    if (text.includes('diabetes') || text.includes('glucose') && text.includes('high')) {
      riskScore += 2;
      riskFactors.push('Diabetes/Pre-diabetes');
    }

    let level = 'LOW';
    if (riskScore >= 6) level = 'HIGH';
    else if (riskScore >= 3) level = 'MODERATE';

    return {
      level,
      score: riskScore,
      factors: riskFactors,
      recommendation: this.getCardiovascularRecommendation(level)
    };
  }

  // Diabetes risk assessment
  assessDiabetesRisk(extractedText, patientInfo) {
    const text = extractedText.toLowerCase();
    let riskScore = 0;
    const riskFactors = [];

    // Age factor
    const age = parseInt(patientInfo.age) || 0;
    if (age > 45) {
      riskScore += 1;
      riskFactors.push('Age over 45');
    }

    // Glucose levels
    const glucoseMatch = text.match(/glucose[:\s]*(\d+)/i);
    if (glucoseMatch) {
      const glucose = parseInt(glucoseMatch[1]);
      if (glucose > 125) {
        riskScore += 3;
        riskFactors.push('Elevated fasting glucose');
      } else if (glucose > 100) {
        riskScore += 1;
        riskFactors.push('Impaired fasting glucose');
      }
    }

    // HbA1c levels
    const hba1cMatch = text.match(/hba1c[:\s]*(\d+\.?\d*)/i);
    if (hba1cMatch) {
      const hba1c = parseFloat(hba1cMatch[1]);
      if (hba1c >= 6.5) {
        riskScore += 3;
        riskFactors.push('Diabetic HbA1c level');
      } else if (hba1c >= 5.7) {
        riskScore += 2;
        riskFactors.push('Pre-diabetic HbA1c level');
      }
    }

    // Family history
    if (text.includes('family history') && text.includes('diabetes')) {
      riskScore += 1;
      riskFactors.push('Family history of diabetes');
    }

    let level = 'LOW';
    if (riskScore >= 5) level = 'HIGH';
    else if (riskScore >= 2) level = 'MODERATE';

    return {
      level,
      score: riskScore,
      factors: riskFactors,
      recommendation: this.getDiabetesRecommendation(level)
    };
  }

  // Kidney function assessment
  assessKidneyRisk(extractedText, patientInfo) {
    const text = extractedText.toLowerCase();
    let riskScore = 0;
    const riskFactors = [];

    // Creatinine levels
    const creatinineMatch = text.match(/creatinine[:\s]*(\d+\.?\d*)/i);
    if (creatinineMatch) {
      const creatinine = parseFloat(creatinineMatch[1]);
      if (creatinine > 1.2) {
        riskScore += 2;
        riskFactors.push('Elevated creatinine');
      }
    }

    // BUN levels
    const bunMatch = text.match(/bun[:\s]*(\d+)/i);
    if (bunMatch) {
      const bun = parseInt(bunMatch[1]);
      if (bun > 20) {
        riskScore += 1;
        riskFactors.push('Elevated BUN');
      }
    }

    // Protein in urine
    if (text.includes('protein') && text.includes('urine')) {
      riskScore += 2;
      riskFactors.push('Proteinuria');
    }

    let level = 'LOW';
    if (riskScore >= 3) level = 'HIGH';
    else if (riskScore >= 1) level = 'MODERATE';

    return {
      level,
      score: riskScore,
      factors: riskFactors,
      recommendation: this.getKidneyRecommendation(level)
    };
  }

  // Liver function assessment
  assessLiverRisk(extractedText, patientInfo) {
    const text = extractedText.toLowerCase();
    let riskScore = 0;
    const riskFactors = [];

    // ALT levels
    const altMatch = text.match(/alt[:\s]*(\d+)/i);
    if (altMatch) {
      const alt = parseInt(altMatch[1]);
      if (alt > 40) {
        riskScore += 2;
        riskFactors.push('Elevated ALT');
      }
    }

    // AST levels
    const astMatch = text.match(/ast[:\s]*(\d+)/i);
    if (astMatch) {
      const ast = parseInt(astMatch[1]);
      if (ast > 40) {
        riskScore += 2;
        riskFactors.push('Elevated AST');
      }
    }

    // Bilirubin
    if (text.includes('bilirubin') && (text.includes('high') || text.includes('elevated'))) {
      riskScore += 1;
      riskFactors.push('Elevated bilirubin');
    }

    let level = 'LOW';
    if (riskScore >= 3) level = 'HIGH';
    else if (riskScore >= 1) level = 'MODERATE';

    return {
      level,
      score: riskScore,
      factors: riskFactors,
      recommendation: this.getLiverRecommendation(level)
    };
  }

  // Analyze vital signs and measurements
  analyzeVitalSigns(extractedText) {
    const vitals = {};
    
    // Blood pressure
    const bpMatch = extractedText.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      vitals.bloodPressure = {
        systolic,
        diastolic,
        status: this.categorizeBP(systolic, diastolic)
      };
    }

    // Heart rate
    const hrMatch = extractedText.match(/heart rate[:\s]*(\d+)/i);
    if (hrMatch) {
      const hr = parseInt(hrMatch[1]);
      vitals.heartRate = {
        value: hr,
        status: hr < 60 ? 'LOW' : hr > 100 ? 'HIGH' : 'NORMAL'
      };
    }

    // Temperature
    const tempMatch = extractedText.match(/temperature[:\s]*(\d+\.?\d*)/i);
    if (tempMatch) {
      const temp = parseFloat(tempMatch[1]);
      vitals.temperature = {
        value: temp,
        status: temp < 97 ? 'LOW' : temp > 99.5 ? 'HIGH' : 'NORMAL'
      };
    }

    return vitals;
  }

  // Extract structured data from report
  extractStructuredData(extractedText) {
    const data = {
      labValues: {},
      measurements: {},
      observations: []
    };

    // Common lab value patterns
    const labPatterns = [
      { name: 'Hemoglobin', pattern: /hemoglobin[:\s]*(\d+\.?\d*)/i, unit: 'g/dL' },
      { name: 'White Blood Cells', pattern: /wbc[:\s]*(\d+,?\d*)/i, unit: '/μL' },
      { name: 'Platelets', pattern: /platelets?[:\s]*(\d+,?\d*)/i, unit: '/μL' },
      { name: 'Glucose', pattern: /glucose[:\s]*(\d+)/i, unit: 'mg/dL' },
      { name: 'Cholesterol', pattern: /cholesterol[:\s]*(\d+)/i, unit: 'mg/dL' },
      { name: 'Creatinine', pattern: /creatinine[:\s]*(\d+\.?\d*)/i, unit: 'mg/dL' }
    ];

    labPatterns.forEach(({ name, pattern, unit }) => {
      const match = extractedText.match(pattern);
      if (match) {
        data.labValues[name] = {
          value: parseFloat(match[1].replace(',', '')),
          unit,
          status: this.categorizeLabValue(name, parseFloat(match[1].replace(',', '')))
        };
      }
    });

    return data;
  }

  // Helper methods for recommendations
  getCardiovascularRecommendation(level) {
    switch (level) {
      case 'HIGH':
        return 'Urgent cardiology consultation recommended. Consider immediate lifestyle modifications and possible medication.';
      case 'MODERATE':
        return 'Regular monitoring advised. Implement heart-healthy lifestyle changes.';
      default:
        return 'Continue healthy lifestyle habits and regular check-ups.';
    }
  }

  getDiabetesRecommendation(level) {
    switch (level) {
      case 'HIGH':
        return 'Immediate endocrinology consultation recommended. Blood sugar management critical.';
      case 'MODERATE':
        return 'Regular glucose monitoring and lifestyle modifications advised.';
      default:
        return 'Continue healthy diet and exercise routine.';
    }
  }

  getKidneyRecommendation(level) {
    switch (level) {
      case 'HIGH':
        return 'Nephrology consultation recommended. Monitor kidney function closely.';
      case 'MODERATE':
        return 'Regular kidney function monitoring advised.';
      default:
        return 'Maintain adequate hydration and healthy lifestyle.';
    }
  }

  getLiverRecommendation(level) {
    switch (level) {
      case 'HIGH':
        return 'Hepatology consultation recommended. Avoid hepatotoxic substances.';
      case 'MODERATE':
        return 'Monitor liver enzymes regularly.';
      default:
        return 'Continue healthy liver habits.';
    }
  }

  // Helper methods for categorization
  categorizeBP(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 110) return 'CRISIS';
    if (systolic >= 140 || diastolic >= 90) return 'HIGH';
    if (systolic >= 120 || diastolic >= 80) return 'ELEVATED';
    return 'NORMAL';
  }

  categorizeLabValue(name, value) {
    const ranges = {
      'Hemoglobin': { low: 12, high: 16 },
      'White Blood Cells': { low: 4000, high: 11000 },
      'Platelets': { low: 150000, high: 450000 },
      'Glucose': { low: 70, high: 100 },
      'Cholesterol': { low: 0, high: 200 },
      'Creatinine': { low: 0.6, high: 1.2 }
    };

    const range = ranges[name];
    if (!range) return 'UNKNOWN';

    if (value < range.low) return 'LOW';
    if (value > range.high) return 'HIGH';
    return 'NORMAL';
  }

  // Fallback analysis when AI is unavailable
  fallbackAnalysis(extractedText, patientInfo) {
    return {
      success: true,
      analysis: `## Automated Medical Report Analysis

**Patient**: ${patientInfo.name || 'Not provided'}
**Analysis Date**: ${new Date().toLocaleDateString()}

### Summary
This report has been processed using automated analysis. Key values and patterns have been identified and assessed against standard medical reference ranges.

### Key Observations
- Medical report text successfully processed
- Standard pattern recognition applied
- Risk factors assessed using established criteria

### Important Note
This automated analysis is for informational purposes only. Please consult with a qualified healthcare professional for proper medical interpretation, diagnosis, and treatment recommendations.

### Next Steps
1. Review findings with your healthcare provider
2. Follow up as recommended by your physician
3. Maintain regular health monitoring
4. Consider specialist consultation if indicated

*Automated analysis completed at ${new Date().toISOString()}*`,
      source: 'fallback-engine',
      confidence: 0.65,
      timestamp: new Date().toISOString()
    };
  }

  // Get analysis history
  getAnalysisHistory(patientId = null) {
    if (patientId) {
      return this.analysisHistory.filter(analysis => 
        analysis.metadata.patientInfo.id === patientId
      );
    }
    return this.analysisHistory;
  }

  // Clear analysis history
  clearHistory() {
    this.analysisHistory = [];
  }
}

// Export singleton instance
const medicalAnalysisEngine = new MedicalAnalysisEngine();
export default medicalAnalysisEngine;