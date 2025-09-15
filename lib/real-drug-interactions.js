/**
 * Production Drug Interaction System
 * Real medication safety analysis using pharmaceutical databases and APIs
 */

import axios from 'axios';

class RealDrugInteractionSystem {
  constructor() {
    this.apiEndpoints = {
      rxnorm: 'https://rxnav.nlm.nih.gov/REST',
      drugbank: process.env.DRUGBANK_API_URL,
      fda: 'https://api.fda.gov/drug',
      interaction: 'https://rxnav.nlm.nih.gov/REST/interaction'
    };
    this.sessionId = null;
    this.patientId = null;
    this.currentMedications = [];
    this.interactionCache = new Map();
    this.severityLevels = {
      'contraindicated': { level: 5, color: 'red', action: 'STOP_IMMEDIATELY' },
      'major': { level: 4, color: 'orange', action: 'AVOID_COMBINATION' },
      'moderate': { level: 3, color: 'yellow', action: 'MONITOR_CLOSELY' },
      'minor': { level: 2, color: 'lightblue', action: 'MONITOR_THERAPY' },
      'unknown': { level: 1, color: 'gray', action: 'ASSESS_RISK' }
    };
  }

  /**
   * Initialize drug interaction checking session
   * @param {Object} config - Session configuration
   */
  async initializeSession(config) {
    try {
      const {
        sessionId,
        patientId,
        doctorId,
        currentMedications = [],
        patientProfile = {}
      } = config;

      this.sessionId = sessionId;
      this.patientId = patientId;
      this.doctorId = doctorId;
      this.patientProfile = patientProfile;

      // Load current patient medications
      await this.loadPatientMedications(currentMedications);

      // Initialize session in database
      await this.initializeDrugSession();

      console.log('Drug interaction system initialized');

      return {
        success: true,
        sessionId,
        currentMedications: this.currentMedications.length,
        systemReady: true
      };

    } catch (error) {
      console.error('Drug interaction initialization failed:', error);
      throw new Error(`Failed to initialize drug system: ${error.message}`);
    }
  }

  /**
   * Load and validate patient's current medications
   * @param {Array} medications - List of current medications
   */
  async loadPatientMedications(medications) {
    try {
      this.currentMedications = [];

      for (const medication of medications) {
        const validatedMed = await this.validateMedication(medication);
        if (validatedMed) {
          this.currentMedications.push(validatedMed);
        }
      }

      console.log(`Loaded ${this.currentMedications.length} validated medications`);
    } catch (error) {
      console.error('Error loading patient medications:', error);
    }
  }

  /**
   * Validate medication using RxNorm API
   * @param {Object} medication - Medication to validate
   */
  async validateMedication(medication) {
    try {
      const { name, dosage, frequency, route = 'oral' } = medication;

      // Search for medication in RxNorm
      const searchUrl = `${this.apiEndpoints.rxnorm}/drugs.json?name=${encodeURIComponent(name)}`;
      const response = await axios.get(searchUrl);

      if (response.data.drugGroup?.conceptGroup) {
        const concepts = response.data.drugGroup.conceptGroup[0]?.conceptProperties;
        
        if (concepts && concepts.length > 0) {
          const rxcui = concepts[0].rxcui;
          
          // Get detailed drug information
          const drugDetails = await this.getDrugDetails(rxcui);

          return {
            originalName: name,
            rxcui,
            name: concepts[0].name,
            dosage,
            frequency,
            route,
            drugDetails,
            validated: true,
            addedDate: new Date()
          };
        }
      }

      // If not found in RxNorm, create unvalidated entry
      return {
        originalName: name,
        rxcui: null,
        name,
        dosage,
        frequency,
        route,
        validated: false,
        warning: 'Medication not found in standard database',
        addedDate: new Date()
      };

    } catch (error) {
      console.error(`Error validating medication ${medication.name}:`, error);
      
      return {
        originalName: medication.name,
        rxcui: null,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        route: medication.route || 'oral',
        validated: false,
        error: error.message,
        addedDate: new Date()
      };
    }
  }

  /**
   * Get detailed drug information
   * @param {string} rxcui - RxNorm concept unique identifier
   */
  async getDrugDetails(rxcui) {
    try {
      const detailsUrl = `${this.apiEndpoints.rxnorm}/rxcui/${rxcui}/properties.json`;
      const response = await axios.get(detailsUrl);
      
      return response.data.properties || {};
    } catch (error) {
      console.error(`Error getting drug details for ${rxcui}:`, error);
      return {};
    }
  }

  /**
   * Check drug interactions for new medication
   * @param {Object} newMedication - New medication to check
   */
  async checkDrugInteractions(newMedication) {
    try {
      const validatedMed = await this.validateMedication(newMedication);
      
      if (!validatedMed.rxcui) {
        return {
          success: true,
          medication: validatedMed,
          interactions: [],
          warnings: ['Cannot check interactions - medication not in standard database'],
          riskLevel: 'unknown'
        };
      }

      // Check interactions with current medications
      const interactions = await this.findInteractions(validatedMed);

      // Analyze interaction severity
      const riskAnalysis = this.analyzeInteractionRisk(interactions);

      // Store interaction check
      await this.storeInteractionCheck({
        newMedication: validatedMed,
        interactions,
        riskAnalysis,
        timestamp: new Date()
      });

      return {
        success: true,
        medication: validatedMed,
        interactions,
        riskAnalysis,
        totalInteractions: interactions.length,
        highRiskInteractions: interactions.filter(i => ['contraindicated', 'major'].includes(i.severity)).length
      };

    } catch (error) {
      console.error('Drug interaction check failed:', error);
      throw new Error(`Interaction check failed: ${error.message}`);
    }
  }

  /**
   * Find interactions between new medication and current medications
   * @param {Object} newMedication - New medication to check
   */
  async findInteractions(newMedication) {
    const interactions = [];

    for (const currentMed of this.currentMedications) {
      if (!currentMed.rxcui || !currentMed.validated) continue;

      try {
        // Check cache first
        const cacheKey = `${newMedication.rxcui}-${currentMed.rxcui}`;
        if (this.interactionCache.has(cacheKey)) {
          const cachedResult = this.interactionCache.get(cacheKey);
          if (cachedResult.interactions.length > 0) {
            interactions.push(...cachedResult.interactions);
          }
          continue;
        }

        // Query RxNav interaction API
        const interactionUrl = `${this.apiEndpoints.interaction}/list.json?rxcuis=${newMedication.rxcui}+${currentMed.rxcui}`;
        const response = await axios.get(interactionUrl);

        if (response.data.fullInteractionTypeGroup) {
          const interactionGroups = response.data.fullInteractionTypeGroup;
          
          for (const group of interactionGroups) {
            if (group.fullInteractionType) {
              for (const interactionType of group.fullInteractionType) {
                const interactionPairs = interactionType.interactionPair;
                
                for (const pair of interactionPairs) {
                  const interaction = {
                    drug1: {
                      name: pair.interactionConcept[0]?.minConceptItem?.name || newMedication.name,
                      rxcui: pair.interactionConcept[0]?.minConceptItem?.rxcui
                    },
                    drug2: {
                      name: pair.interactionConcept[1]?.minConceptItem?.name || currentMed.name,
                      rxcui: pair.interactionConcept[1]?.minConceptItem?.rxcui
                    },
                    description: pair.description,
                    severity: this.determineSeverity(pair.description),
                    source: 'RxNav',
                    timestamp: new Date()
                  };

                  interactions.push(interaction);
                }
              }
            }
          }
        }

        // Cache result
        this.interactionCache.set(cacheKey, { interactions: interactions.slice(), timestamp: new Date() });

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error checking interaction between ${newMedication.name} and ${currentMed.name}:`, error);
        
        // Add error interaction record
        interactions.push({
          drug1: { name: newMedication.name, rxcui: newMedication.rxcui },
          drug2: { name: currentMed.name, rxcui: currentMed.rxcui },
          description: `Error checking interaction: ${error.message}`,
          severity: 'unknown',
          source: 'Error',
          timestamp: new Date()
        });
      }
    }

    return interactions;
  }

  /**
   * Determine interaction severity from description
   * @param {string} description - Interaction description
   */
  determineSeverity(description) {
    const desc = description.toLowerCase();

    // Critical interactions
    if (desc.includes('contraindicated') || desc.includes('avoid') || desc.includes('do not')) {
      return 'contraindicated';
    }

    // Major interactions
    if (desc.includes('major') || desc.includes('serious') || desc.includes('significant')) {
      return 'major';
    }

    // Moderate interactions
    if (desc.includes('moderate') || desc.includes('caution') || desc.includes('monitor')) {
      return 'moderate';
    }

    // Minor interactions
    if (desc.includes('minor') || desc.includes('mild')) {
      return 'minor';
    }

    return 'unknown';
  }

  /**
   * Analyze overall interaction risk
   * @param {Array} interactions - List of drug interactions
   */
  analyzeInteractionRisk(interactions) {
    const riskFactors = {
      contraindicated: 0,
      major: 0,
      moderate: 0,
      minor: 0,
      unknown: 0
    };

    // Count interactions by severity
    interactions.forEach(interaction => {
      riskFactors[interaction.severity]++;
    });

    // Calculate overall risk score
    let riskScore = 0;
    riskScore += riskFactors.contraindicated * 5;
    riskScore += riskFactors.major * 4;
    riskScore += riskFactors.moderate * 3;
    riskScore += riskFactors.minor * 2;
    riskScore += riskFactors.unknown * 1;

    // Determine risk level
    let riskLevel = 'low';
    let recommendation = 'Safe to prescribe with standard monitoring';

    if (riskFactors.contraindicated > 0) {
      riskLevel = 'critical';
      recommendation = 'DO NOT PRESCRIBE - Contraindicated drug interaction';
    } else if (riskFactors.major > 0) {
      riskLevel = 'high';
      recommendation = 'Avoid combination or use alternative medication';
    } else if (riskFactors.moderate > 2) {
      riskLevel = 'moderate';
      recommendation = 'Monitor patient closely for adverse effects';
    } else if (riskFactors.moderate > 0 || riskFactors.minor > 3) {
      riskLevel = 'low-moderate';
      recommendation = 'Monitor therapy and patient response';
    }

    return {
      riskLevel,
      riskScore,
      riskFactors,
      totalInteractions: interactions.length,
      recommendation,
      criticalInteractions: interactions.filter(i => i.severity === 'contraindicated'),
      majorInteractions: interactions.filter(i => i.severity === 'major'),
      requiresAction: riskFactors.contraindicated > 0 || riskFactors.major > 0
    };
  }

  /**
   * Add medication to patient's current list
   * @param {Object} medication - Medication to add
   */
  async addMedication(medication) {
    try {
      // Check interactions first
      const interactionResult = await this.checkDrugInteractions(medication);

      if (interactionResult.riskAnalysis.requiresAction) {
        return {
          success: false,
          error: 'High-risk drug interaction detected',
          interactions: interactionResult.interactions,
          riskAnalysis: interactionResult.riskAnalysis,
          cannotAdd: true
        };
      }

      // Add to current medications
      this.currentMedications.push(interactionResult.medication);

      // Store in database
      await this.storeMedicationChange({
        action: 'add',
        medication: interactionResult.medication,
        interactions: interactionResult.interactions,
        riskAnalysis: interactionResult.riskAnalysis
      });

      return {
        success: true,
        medication: interactionResult.medication,
        interactions: interactionResult.interactions,
        riskAnalysis: interactionResult.riskAnalysis,
        currentMedicationCount: this.currentMedications.length
      };

    } catch (error) {
      console.error('Error adding medication:', error);
      throw new Error(`Failed to add medication: ${error.message}`);
    }
  }

  /**
   * Remove medication from patient's current list
   * @param {string} medicationId - ID or name of medication to remove
   */
  async removeMedication(medicationId) {
    try {
      const index = this.currentMedications.findIndex(med => 
        med.rxcui === medicationId || med.name === medicationId || med.originalName === medicationId
      );

      if (index === -1) {
        return {
          success: false,
          error: 'Medication not found in current list'
        };
      }

      const removedMedication = this.currentMedications.splice(index, 1)[0];

      // Store medication removal
      await this.storeMedicationChange({
        action: 'remove',
        medication: removedMedication
      });

      return {
        success: true,
        removedMedication,
        currentMedicationCount: this.currentMedications.length
      };

    } catch (error) {
      console.error('Error removing medication:', error);
      throw new Error(`Failed to remove medication: ${error.message}`);
    }
  }

  /**
   * Get comprehensive medication profile
   */
  getMedicationProfile() {
    return {
      sessionId: this.sessionId,
      patientId: this.patientId,
      currentMedications: this.currentMedications,
      totalMedications: this.currentMedications.length,
      validatedMedications: this.currentMedications.filter(med => med.validated).length,
      lastUpdated: new Date(),
      cacheSize: this.interactionCache.size
    };
  }

  /**
   * Store interaction check result
   * @param {Object} checkData - Interaction check data
   */
  async storeInteractionCheck(checkData) {
    try {
      const response = await fetch('/api/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store_check',
          sessionId: this.sessionId,
          patientId: this.patientId,
          checkData
        })
      });

      if (!response.ok) {
        console.error('Failed to store interaction check');
      }
    } catch (error) {
      console.error('Error storing interaction check:', error);
    }
  }

  /**
   * Store medication change
   * @param {Object} changeData - Medication change data
   */
  async storeMedicationChange(changeData) {
    try {
      const response = await fetch('/api/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store_change',
          sessionId: this.sessionId,
          patientId: this.patientId,
          changeData
        })
      });

      if (!response.ok) {
        console.error('Failed to store medication change');
      }
    } catch (error) {
      console.error('Error storing medication change:', error);
    }
  }

  /**
   * Initialize drug session in database
   */
  async initializeDrugSession() {
    try {
      const response = await fetch('/api/drug-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          sessionId: this.sessionId,
          patientId: this.patientId,
          doctorId: this.doctorId,
          initialMedications: this.currentMedications
        })
      });

      if (!response.ok) {
        console.error('Failed to initialize drug session');
      }
    } catch (error) {
      console.error('Error initializing drug session:', error);
    }
  }

  /**
   * Get interaction history
   * @param {Object} filters - History filters
   */
  getInteractionHistory(filters = {}) {
    // This would typically query the database
    // For now, return cached data
    const history = Array.from(this.interactionCache.entries()).map(([key, value]) => ({
      drugPair: key,
      interactions: value.interactions,
      timestamp: value.timestamp
    }));

    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * End drug interaction session
   */
  async endSession() {
    try {
      const sessionStats = {
        totalMedications: this.currentMedications.length,
        validatedMedications: this.currentMedications.filter(m => m.validated).length,
        totalInteractionChecks: this.interactionCache.size
      };

      const response = await fetch('/api/drug-interactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          sessionId: this.sessionId,
          stats: sessionStats
        })
      });

      // Clear session data
      this.currentMedications = [];
      this.interactionCache.clear();

      console.log('Drug interaction session ended');

      return {
        success: true,
        finalStats: sessionStats
      };

    } catch (error) {
      console.error('Error ending drug session:', error);
      throw new Error(`Failed to end drug session: ${error.message}`);
    }
  }
}

export default RealDrugInteractionSystem;