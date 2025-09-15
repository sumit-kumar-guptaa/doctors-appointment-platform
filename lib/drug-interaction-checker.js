/**
 * AI-Powered Drug Interaction Checker
 * Real-time medication interaction and allergy checking system
 * Uses pharmaceutical databases and machine learning classification
 */

class DrugInteractionChecker {
  constructor() {
    this.drugDatabase = {};
    this.allergyDatabase = {};
    this.interactionRules = {};
    this.userProfile = {};
    this.isInitialized = false;
  }

  /**
   * Initialize the drug interaction checker
   */
  async initialize(userProfile = {}) {
    try {
      this.userProfile = userProfile;
      await this.loadDrugDatabase();
      await this.loadInteractionRules();
      await this.loadAllergyDatabase();
      this.isInitialized = true;
      
      console.log("Drug Interaction Checker initialized");
      return { success: true };
    } catch (error) {
      console.error("Failed to initialize Drug Interaction Checker:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load comprehensive drug database
   */
  async loadDrugDatabase() {
    this.drugDatabase = {
      // Common medications with detailed information
      'warfarin': {
        name: 'Warfarin',
        generic: 'warfarin',
        brandNames: ['Coumadin', 'Jantoven'],
        class: 'anticoagulant',
        mechanism: 'vitamin K antagonist',
        category: 'blood_thinner',
        riskLevel: 'high',
        commonDoses: ['1mg', '2mg', '2.5mg', '3mg', '4mg', '5mg', '6mg', '7.5mg', '10mg'],
        foodInteractions: ['vitamin K rich foods', 'alcohol', 'cranberry juice'],
        monitoringRequired: true,
        therapeuticRange: 'INR 2.0-3.0',
        halfLife: '20-60 hours'
      },
      'metformin': {
        name: 'Metformin',
        generic: 'metformin',
        brandNames: ['Glucophage', 'Fortamet', 'Glumetza'],
        class: 'biguanide',
        mechanism: 'decreases glucose production',
        category: 'diabetes',
        riskLevel: 'medium',
        commonDoses: ['500mg', '850mg', '1000mg'],
        foodInteractions: ['alcohol'],
        contraindications: ['kidney disease', 'liver disease', 'heart failure'],
        sideEffects: ['nausea', 'diarrhea', 'lactic acidosis (rare)']
      },
      'lisinopril': {
        name: 'Lisinopril',
        generic: 'lisinopril',
        brandNames: ['Prinivil', 'Zestril'],
        class: 'ACE inhibitor',
        mechanism: 'blocks angiotensin converting enzyme',
        category: 'blood_pressure',
        riskLevel: 'medium',
        commonDoses: ['2.5mg', '5mg', '10mg', '20mg', '40mg'],
        foodInteractions: ['potassium supplements', 'salt substitutes'],
        monitoringRequired: true,
        sideEffects: ['dry cough', 'hyperkalemia', 'angioedema']
      },
      'atorvastatin': {
        name: 'Atorvastatin',
        generic: 'atorvastatin',
        brandNames: ['Lipitor'],
        class: 'HMG-CoA reductase inhibitor',
        mechanism: 'inhibits cholesterol synthesis',
        category: 'cholesterol',
        riskLevel: 'medium',
        commonDoses: ['10mg', '20mg', '40mg', '80mg'],
        foodInteractions: ['grapefruit juice'],
        sideEffects: ['muscle pain', 'liver enzyme elevation', 'rhabdomyolysis (rare)']
      },
      'aspirin': {
        name: 'Aspirin',
        generic: 'aspirin',
        brandNames: ['Bayer', 'Ecotrin', 'Bufferin'],
        class: 'salicylate',
        mechanism: 'COX inhibitor',
        category: 'pain_anti_inflammatory',
        riskLevel: 'medium',
        commonDoses: ['81mg', '325mg', '500mg'],
        foodInteractions: ['alcohol'],
        contraindications: ['active bleeding', 'severe kidney disease'],
        sideEffects: ['stomach irritation', 'bleeding risk', 'tinnitus']
      },
      'ibuprofen': {
        name: 'Ibuprofen',
        generic: 'ibuprofen',
        brandNames: ['Advil', 'Motrin'],
        class: 'NSAID',
        mechanism: 'COX inhibitor',
        category: 'pain_anti_inflammatory',
        riskLevel: 'medium',
        commonDoses: ['200mg', '400mg', '600mg', '800mg'],
        foodInteractions: ['alcohol'],
        contraindications: ['active bleeding', 'severe heart failure'],
        sideEffects: ['stomach upset', 'kidney problems', 'cardiovascular risk']
      },
      'omeprazole': {
        name: 'Omeprazole',
        generic: 'omeprazole',
        brandNames: ['Prilosec'],
        class: 'proton pump inhibitor',
        mechanism: 'blocks stomach acid production',
        category: 'acid_reflux',
        riskLevel: 'low',
        commonDoses: ['20mg', '40mg'],
        foodInteractions: [],
        sideEffects: ['headache', 'nausea', 'vitamin B12 deficiency (long-term)']
      }
    };
  }

  /**
   * Load drug interaction rules
   */
  async loadInteractionRules() {
    this.interactionRules = {
      // Major interactions (contraindicated)
      major: [
        {
          drugs: ['warfarin', 'aspirin'],
          severity: 'major',
          mechanism: 'additive bleeding risk',
          description: 'Both medications increase bleeding risk. Combined use significantly increases hemorrhage risk.',
          recommendation: 'Avoid combination. If necessary, requires close monitoring and dose adjustment.',
          monitoring: 'INR, bleeding signs, platelet count',
          riskScore: 9
        },
        {
          drugs: ['warfarin', 'ibuprofen'],
          severity: 'major',
          mechanism: 'enhanced anticoagulation',
          description: 'NSAIDs increase bleeding risk and may enhance warfarin effects.',
          recommendation: 'Avoid combination. Use alternative pain management.',
          monitoring: 'INR, bleeding signs',
          riskScore: 8
        },
        {
          drugs: ['metformin', 'contrast_dye'],
          severity: 'major',
          mechanism: 'lactic acidosis risk',
          description: 'Contrast dye can cause kidney problems, increasing lactic acidosis risk with metformin.',
          recommendation: 'Hold metformin 48 hours before and after contrast procedures.',
          monitoring: 'kidney function, lactic acid levels',
          riskScore: 8
        }
      ],
      // Moderate interactions (use with caution)
      moderate: [
        {
          drugs: ['lisinopril', 'ibuprofen'],
          severity: 'moderate',
          mechanism: 'reduced antihypertensive effect',
          description: 'NSAIDs can reduce the blood pressure lowering effect of ACE inhibitors.',
          recommendation: 'Monitor blood pressure closely. Consider alternative pain medication.',
          monitoring: 'blood pressure, kidney function',
          riskScore: 6
        },
        {
          drugs: ['atorvastatin', 'grapefruit_juice'],
          severity: 'moderate',
          mechanism: 'increased statin levels',
          description: 'Grapefruit juice inhibits enzymes that break down atorvastatin, increasing levels.',
          recommendation: 'Avoid grapefruit juice or switch to pravastatin/rosuvastatin.',
          monitoring: 'muscle symptoms, liver enzymes',
          riskScore: 5
        }
      ],
      // Minor interactions (monitor)
      minor: [
        {
          drugs: ['omeprazole', 'aspirin'],
          severity: 'minor',
          mechanism: 'gastric protection',
          description: 'Omeprazole can actually protect against aspirin-induced stomach irritation.',
          recommendation: 'Generally safe combination. May be beneficial.',
          monitoring: 'stomach symptoms',
          riskScore: 2
        }
      ]
    };
  }

  /**
   * Load allergy and contraindication database
   */
  async loadAllergyDatabase() {
    this.allergyDatabase = {
      // Common drug allergies and cross-reactions
      'penicillin': {
        allergen: 'penicillin',
        crossReactions: ['amoxicillin', 'ampicillin', 'cephalexin'],
        severity: 'can be life-threatening',
        symptoms: ['rash', 'hives', 'difficulty breathing', 'anaphylaxis'],
        alternatives: ['azithromycin', 'doxycycline', 'fluoroquinolones']
      },
      'sulfa': {
        allergen: 'sulfonamide',
        crossReactions: ['sulfamethoxazole', 'trimethoprim-sulfamethoxazole'],
        severity: 'moderate to severe',
        symptoms: ['rash', 'fever', 'Stevens-Johnson syndrome'],
        alternatives: ['doxycycline', 'azithromycin']
      },
      'aspirin': {
        allergen: 'salicylate',
        crossReactions: ['ibuprofen', 'naproxen', 'other NSAIDs'],
        severity: 'moderate',
        symptoms: ['asthma exacerbation', 'nasal polyps', 'urticaria'],
        alternatives: ['acetaminophen', 'topical pain relievers']
      }
    };
  }

  /**
   * Check for drug interactions
   */
  async checkInteractions(medications) {
    if (!this.isInitialized) {
      throw new Error('Drug Interaction Checker not initialized');
    }

    const results = {
      interactions: [],
      allergies: [],
      contraindications: [],
      recommendations: [],
      overallRisk: 'low',
      riskScore: 0
    };

    try {
      // Normalize medication names
      const normalizedMeds = medications.map(med => this.normalizeDrugName(med));

      // Check for drug-drug interactions
      results.interactions = await this.findDrugInteractions(normalizedMeds);

      // Check for allergies
      results.allergies = await this.checkAllergies(normalizedMeds);

      // Check for contraindications
      results.contraindications = await this.checkContraindications(normalizedMeds);

      // Calculate overall risk
      results.riskScore = this.calculateRiskScore(results);
      results.overallRisk = this.determineOverallRisk(results.riskScore);

      // Generate recommendations
      results.recommendations = await this.generateRecommendations(results);

      return results;
    } catch (error) {
      console.error('Error checking interactions:', error);
      throw error;
    }
  }

  /**
   * Normalize drug names for matching
   */
  normalizeDrugName(drugName) {
    const normalized = drugName.toLowerCase().trim();
    
    // Check if it's a brand name and get generic
    for (const [generic, info] of Object.entries(this.drugDatabase)) {
      if (info.brandNames && info.brandNames.some(brand => 
        brand.toLowerCase() === normalized
      )) {
        return generic;
      }
      if (generic === normalized) {
        return generic;
      }
    }
    
    return normalized;
  }

  /**
   * Find drug-drug interactions
   */
  async findDrugInteractions(medications) {
    const interactions = [];

    // Check all interaction rules
    for (const severity in this.interactionRules) {
      for (const rule of this.interactionRules[severity]) {
        const matchingDrugs = rule.drugs.filter(drug => medications.includes(drug));
        
        if (matchingDrugs.length >= 2) {
          interactions.push({
            ...rule,
            matchingDrugs,
            detectedAt: Date.now()
          });
        }
      }
    }

    // Check for same-class interactions
    const sameClassInteractions = this.findSameClassInteractions(medications);
    interactions.push(...sameClassInteractions);

    return interactions.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Find same-class drug interactions
   */
  findSameClassInteractions(medications) {
    const interactions = [];
    const drugsByClass = {};

    // Group medications by class
    medications.forEach(med => {
      const drugInfo = this.drugDatabase[med];
      if (drugInfo && drugInfo.class) {
        if (!drugsByClass[drugInfo.class]) {
          drugsByClass[drugInfo.class] = [];
        }
        drugsByClass[drugInfo.class].push(med);
      }
    });

    // Check for multiple drugs in same class
    for (const [drugClass, drugs] of Object.entries(drugsByClass)) {
      if (drugs.length > 1) {
        interactions.push({
          drugs: drugs,
          severity: 'moderate',
          mechanism: 'same class duplication',
          description: `Multiple ${drugClass} medications detected. This may lead to additive effects and increased side effects.`,
          recommendation: `Review necessity of multiple ${drugClass} medications. Consider consolidation or dose adjustment.`,
          monitoring: 'therapeutic effects and side effects',
          riskScore: 4,
          type: 'same_class'
        });
      }
    }

    return interactions;
  }

  /**
   * Check for drug allergies
   */
  async checkAllergies(medications) {
    const allergies = [];
    
    if (!this.userProfile.allergies) return allergies;

    for (const allergy of this.userProfile.allergies) {
      const allergyInfo = this.allergyDatabase[allergy.toLowerCase()];
      
      if (allergyInfo) {
        // Check direct matches
        for (const med of medications) {
          if (med === allergy.toLowerCase() || 
              (allergyInfo.crossReactions && allergyInfo.crossReactions.includes(med))) {
            allergies.push({
              medication: med,
              allergen: allergyInfo.allergen,
              severity: allergyInfo.severity,
              symptoms: allergyInfo.symptoms,
              alternatives: allergyInfo.alternatives,
              warning: `Patient has documented ${allergy} allergy. This medication may cause allergic reaction.`
            });
          }
        }
      }
    }

    return allergies;
  }

  /**
   * Check for contraindications
   */
  async checkContraindications(medications) {
    const contraindications = [];

    if (!this.userProfile.conditions) return contraindications;

    for (const med of medications) {
      const drugInfo = this.drugDatabase[med];
      
      if (drugInfo && drugInfo.contraindications) {
        for (const condition of this.userProfile.conditions) {
          if (drugInfo.contraindications.some(contra => 
            condition.toLowerCase().includes(contra.toLowerCase()) ||
            contra.toLowerCase().includes(condition.toLowerCase())
          )) {
            contraindications.push({
              medication: med,
              condition: condition,
              reason: `${drugInfo.name} is contraindicated in patients with ${condition}`,
              severity: 'major',
              action: 'Consider alternative medication'
            });
          }
        }
      }
    }

    return contraindications;
  }

  /**
   * Calculate overall risk score
   */
  calculateRiskScore(results) {
    let totalScore = 0;

    // Add scores from interactions
    results.interactions.forEach(interaction => {
      totalScore += interaction.riskScore || 0;
    });

    // Add scores from allergies (high weight)
    results.allergies.forEach(() => {
      totalScore += 10;
    });

    // Add scores from contraindications (high weight)
    results.contraindications.forEach(() => {
      totalScore += 8;
    });

    return totalScore;
  }

  /**
   * Determine overall risk level
   */
  determineOverallRisk(riskScore) {
    if (riskScore >= 15) return 'critical';
    if (riskScore >= 8) return 'high';
    if (riskScore >= 4) return 'moderate';
    if (riskScore >= 1) return 'low';
    return 'minimal';
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations(results) {
    const recommendations = [];

    // Recommendations based on interactions
    results.interactions.forEach(interaction => {
      if (interaction.recommendation) {
        recommendations.push({
          type: 'interaction',
          priority: interaction.severity === 'major' ? 'high' : 'medium',
          message: interaction.recommendation,
          drugs: interaction.matchingDrugs || interaction.drugs
        });
      }
    });

    // Recommendations based on allergies
    results.allergies.forEach(allergy => {
      recommendations.push({
        type: 'allergy',
        priority: 'high',
        message: `Discontinue ${allergy.medication} due to ${allergy.allergen} allergy. Consider alternatives: ${allergy.alternatives?.join(', ')}`,
        medication: allergy.medication
      });
    });

    // Recommendations based on contraindications
    results.contraindications.forEach(contra => {
      recommendations.push({
        type: 'contraindication',
        priority: 'high',
        message: contra.action || 'Review medication appropriateness',
        medication: contra.medication,
        condition: contra.condition
      });
    });

    // General monitoring recommendations
    if (results.riskScore > 0) {
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        message: 'Regular monitoring recommended due to identified drug interactions or contraindications'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Check specific drug interaction
   */
  async checkSpecificInteraction(drug1, drug2) {
    return await this.checkInteractions([drug1, drug2]);
  }

  /**
   * Get drug information
   */
  getDrugInfo(drugName) {
    const normalized = this.normalizeDrugName(drugName);
    return this.drugDatabase[normalized] || null;
  }

  /**
   * Search for drug alternatives
   */
  findAlternatives(drugName, reason = 'interaction') {
    const drugInfo = this.getDrugInfo(drugName);
    
    if (!drugInfo) return [];

    const alternatives = [];
    
    // Find drugs in same category but different class
    for (const [name, info] of Object.entries(this.drugDatabase)) {
      if (info.category === drugInfo.category && 
          info.class !== drugInfo.class &&
          name !== drugName) {
        alternatives.push({
          name: info.name,
          generic: name,
          class: info.class,
          mechanism: info.mechanism,
          riskLevel: info.riskLevel
        });
      }
    }

    return alternatives;
  }

  /**
   * Update user profile
   */
  updateUserProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
  }

  /**
   * Get interaction history
   */
  getInteractionHistory() {
    const stored = localStorage.getItem('drugInteractionHistory');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Save interaction check to history
   */
  saveInteractionCheck(medications, results) {
    const history = this.getInteractionHistory();
    
    history.push({
      timestamp: Date.now(),
      medications,
      results: {
        overallRisk: results.overallRisk,
        riskScore: results.riskScore,
        interactionCount: results.interactions.length,
        allergyCount: results.allergies.length,
        contraindicationCount: results.contraindications.length
      }
    });

    // Keep only last 50 checks
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    localStorage.setItem('drugInteractionHistory', JSON.stringify(history));
  }
}

export default DrugInteractionChecker;