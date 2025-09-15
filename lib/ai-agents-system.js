// Multi-Agent AI Healthcare System
// Autonomous agents that collaborate to provide comprehensive healthcare services

class BaseAgent {
  constructor(name, specialization) {
    this.name = name;
    this.specialization = specialization;
    this.isActive = true;
    this.currentTasks = [];
    this.completedTasks = [];
    this.collaborationHistory = [];
  }

  async processTask(task) {
    console.log(`${this.name} processing task: ${task.type}`);
    this.currentTasks.push(task);
    
    try {
      const result = await this.execute(task);
      this.completeTask(task, result);
      return result;
    } catch (error) {
      console.error(`${this.name} failed to process task:`, error);
      throw error;
    }
  }

  completeTask(task, result) {
    this.currentTasks = this.currentTasks.filter(t => t.id !== task.id);
    this.completedTasks.push({ ...task, result, completedAt: new Date() });
  }

  async collaborate(otherAgent, taskType, data) {
    const collaborationId = `${this.name}-${otherAgent.name}-${Date.now()}`;
    console.log(`Collaboration started: ${collaborationId}`);
    
    this.collaborationHistory.push({
      id: collaborationId,
      with: otherAgent.name,
      taskType,
      timestamp: new Date()
    });

    return collaborationId;
  }
}

class DiagnosticAgent extends BaseAgent {
  constructor() {
    super('DiagnosticAgent', 'Medical Diagnosis & Analysis');
    this.medicalKnowledge = this.initializeMedicalKnowledge();
    this.diagnosisHistory = [];
  }

  initializeMedicalKnowledge() {
    return {
      symptoms: {
        fever: { severity: 'moderate', commonCauses: ['infection', 'inflammation'] },
        headache: { severity: 'mild', commonCauses: ['stress', 'tension', 'migraine'] },
        chest_pain: { severity: 'high', commonCauses: ['cardiac', 'respiratory', 'muscular'] },
        shortness_of_breath: { severity: 'high', commonCauses: ['respiratory', 'cardiac'] },
        fatigue: { severity: 'moderate', commonCauses: ['sleep', 'stress', 'medical'] }
      },
      diseases: {
        hypertension: { symptoms: ['headache', 'dizziness'], risk: 'moderate' },
        diabetes: { symptoms: ['fatigue', 'excessive_thirst'], risk: 'high' },
        covid19: { symptoms: ['fever', 'cough', 'fatigue'], risk: 'variable' }
      }
    };
  }

  async execute(task) {
    switch (task.type) {
      case 'analyze_symptoms':
        return await this.analyzeSymptoms(task.data);
      case 'generate_diagnosis':
        return await this.generateDiagnosis(task.data);
      case 'risk_assessment':
        return await this.assessRisk(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async analyzeSymptoms(symptoms) {
    const analysis = {
      symptoms: symptoms,
      severity: this.calculateSeverity(symptoms),
      possibleCauses: this.identifyPossibleCauses(symptoms),
      urgency: this.assessUrgency(symptoms),
      timestamp: new Date()
    };

    this.diagnosisHistory.push(analysis);
    return analysis;
  }

  calculateSeverity(symptoms) {
    let totalSeverity = 0;
    let count = 0;

    symptoms.forEach(symptom => {
      if (this.medicalKnowledge.symptoms[symptom.toLowerCase()]) {
        const severity = this.medicalKnowledge.symptoms[symptom.toLowerCase()].severity;
        totalSeverity += severity === 'high' ? 3 : severity === 'moderate' ? 2 : 1;
        count++;
      }
    });

    return count > 0 ? totalSeverity / count : 1;
  }

  identifyPossibleCauses(symptoms) {
    const causes = new Set();
    
    symptoms.forEach(symptom => {
      const symptomData = this.medicalKnowledge.symptoms[symptom.toLowerCase()];
      if (symptomData) {
        symptomData.commonCauses.forEach(cause => causes.add(cause));
      }
    });

    return Array.from(causes);
  }

  assessUrgency(symptoms) {
    const highPrioritySymptoms = ['chest_pain', 'shortness_of_breath', 'severe_headache'];
    const hasHighPriority = symptoms.some(s => 
      highPrioritySymptoms.includes(s.toLowerCase())
    );

    return hasHighPriority ? 'urgent' : 'routine';
  }

  async generateDiagnosis(data) {
    const { symptoms, patientHistory, vitalSigns } = data;
    
    // Simulate AI-powered diagnosis generation
    const diagnosis = {
      primaryDiagnosis: await this.getPrimaryDiagnosis(symptoms),
      differentialDiagnoses: await this.getDifferentialDiagnoses(symptoms),
      confidence: this.calculateConfidence(symptoms, patientHistory),
      recommendations: await this.generateRecommendations(symptoms, vitalSigns),
      timestamp: new Date()
    };

    return diagnosis;
  }

  async getPrimaryDiagnosis(symptoms) {
    // Simulate complex diagnostic reasoning
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const matchedDiseases = [];
    Object.entries(this.medicalKnowledge.diseases).forEach(([disease, info]) => {
      const matchCount = info.symptoms.filter(s => 
        symptoms.some(symptom => symptom.toLowerCase().includes(s))
      ).length;
      
      if (matchCount > 0) {
        matchedDiseases.push({ disease, matchCount, risk: info.risk });
      }
    });

    return matchedDiseases.length > 0 
      ? matchedDiseases.sort((a, b) => b.matchCount - a.matchCount)[0].disease
      : 'Further evaluation needed';
  }

  async getDifferentialDiagnoses(symptoms) {
    return [
      'Viral infection',
      'Stress-related symptoms',
      'Nutritional deficiency'
    ];
  }

  calculateConfidence(symptoms, patientHistory) {
    return Math.random() * 0.4 + 0.6; // Simulate 60-100% confidence
  }

  async generateRecommendations(symptoms, vitalSigns) {
    return [
      'Monitor symptoms for 24-48 hours',
      'Maintain adequate hydration',
      'Consider follow-up if symptoms persist',
      'Emergency care if symptoms worsen'
    ];
  }
}

class TreatmentAgent extends BaseAgent {
  constructor() {
    super('TreatmentAgent', 'Treatment Planning & Medication Management');
    this.treatmentDatabase = this.initializeTreatmentDatabase();
    this.treatmentHistory = [];
  }

  initializeTreatmentDatabase() {
    return {
      medications: {
        acetaminophen: { 
          indications: ['fever', 'pain'], 
          dosage: '500mg every 6 hours',
          contraindications: ['liver disease']
        },
        ibuprofen: { 
          indications: ['inflammation', 'pain'], 
          dosage: '400mg every 8 hours',
          contraindications: ['kidney disease', 'stomach ulcers']
        },
        lisinopril: { 
          indications: ['hypertension'], 
          dosage: '10mg daily',
          contraindications: ['pregnancy', 'kidney disease']
        }
      },
      treatments: {
        hypertension: ['lifestyle_modification', 'ace_inhibitors', 'monitoring'],
        diabetes: ['diet_control', 'exercise', 'medication', 'glucose_monitoring'],
        infection: ['rest', 'hydration', 'antibiotics_if_bacterial']
      }
    };
  }

  async execute(task) {
    switch (task.type) {
      case 'create_treatment_plan':
        return await this.createTreatmentPlan(task.data);
      case 'medication_recommendation':
        return await this.recommendMedication(task.data);
      case 'monitor_treatment':
        return await this.monitorTreatment(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async createTreatmentPlan(data) {
    const { diagnosis, patientProfile, symptoms } = data;
    
    const treatmentPlan = {
      diagnosis,
      patientId: patientProfile.id,
      medications: await this.selectMedications(diagnosis, patientProfile),
      lifestyle: await this.getLifestyleRecommendations(diagnosis),
      followUp: await this.scheduleFollowUp(diagnosis, symptoms),
      monitoring: await this.getMonitoringPlan(diagnosis),
      createdAt: new Date()
    };

    this.treatmentHistory.push(treatmentPlan);
    return treatmentPlan;
  }

  async selectMedications(diagnosis, patientProfile) {
    const selectedMeds = [];
    const treatmentOptions = this.treatmentDatabase.treatments[diagnosis.toLowerCase()];
    
    if (treatmentOptions) {
      for (const option of treatmentOptions) {
        if (option.includes('medication') || this.treatmentDatabase.medications[option]) {
          const medication = this.treatmentDatabase.medications[option] || 
                           await this.findBestMedication(diagnosis, patientProfile);
          
          if (medication && !this.hasContraindications(medication, patientProfile)) {
            selectedMeds.push({
              name: option,
              dosage: medication.dosage,
              duration: '7-14 days',
              instructions: 'Take with food'
            });
          }
        }
      }
    }

    return selectedMeds;
  }

  async findBestMedication(diagnosis, patientProfile) {
    // Simulate AI-powered medication selection
    const availableMeds = Object.entries(this.treatmentDatabase.medications);
    
    for (const [name, med] of availableMeds) {
      if (med.indications.some(indication => 
        diagnosis.toLowerCase().includes(indication)
      )) {
        return { ...med, name };
      }
    }

    return null;
  }

  hasContraindications(medication, patientProfile) {
    if (!patientProfile.medicalHistory) return false;
    
    return medication.contraindications.some(contraindication =>
      patientProfile.medicalHistory.includes(contraindication)
    );
  }

  async getLifestyleRecommendations(diagnosis) {
    const recommendations = {
      hypertension: [
        'Reduce sodium intake to <2300mg daily',
        'Regular aerobic exercise 30min 5x/week',
        'Maintain healthy weight',
        'Limit alcohol consumption'
      ],
      diabetes: [
        'Carbohydrate counting and portion control',
        'Regular blood glucose monitoring',
        'Daily physical activity',
        'Regular meal timing'
      ]
    };

    return recommendations[diagnosis.toLowerCase()] || [
      'Maintain balanced diet',
      'Regular exercise',
      'Adequate sleep',
      'Stress management'
    ];
  }

  async scheduleFollowUp(diagnosis, symptoms) {
    const urgency = symptoms.includes('severe') || symptoms.includes('urgent') ? 'urgent' : 'routine';
    
    return {
      urgency,
      timeframe: urgency === 'urgent' ? '24-48 hours' : '1-2 weeks',
      type: 'video_consultation',
      focus: 'Treatment response and symptom progression'
    };
  }

  async getMonitoringPlan(diagnosis) {
    return {
      parameters: ['symptoms', 'side_effects', 'vital_signs'],
      frequency: 'daily for first week, then weekly',
      alerts: ['worsening symptoms', 'new symptoms', 'medication side effects']
    };
  }
}

class MonitoringAgent extends BaseAgent {
  constructor() {
    super('MonitoringAgent', 'Patient Monitoring & Alert System');
    this.monitoringSessions = new Map();
    this.alertThresholds = this.initializeAlertThresholds();
  }

  initializeAlertThresholds() {
    return {
      vitalSigns: {
        heartRate: { min: 60, max: 100, critical: { min: 50, max: 120 } },
        bloodPressure: { 
          systolic: { max: 140, critical: 180 },
          diastolic: { max: 90, critical: 110 }
        },
        temperature: { min: 36.1, max: 37.2, critical: { min: 35, max: 39 } },
        oxygenSaturation: { min: 95, critical: 90 }
      }
    };
  }

  async execute(task) {
    switch (task.type) {
      case 'start_monitoring':
        return await this.startMonitoring(task.data);
      case 'process_vital_signs':
        return await this.processVitalSigns(task.data);
      case 'generate_alerts':
        return await this.generateAlerts(task.data);
      case 'create_report':
        return await this.createMonitoringReport(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async startMonitoring(data) {
    const { patientId, monitoringPlan, duration } = data;
    
    const session = {
      patientId,
      startTime: new Date(),
      duration,
      plan: monitoringPlan,
      readings: [],
      alerts: [],
      status: 'active'
    };

    this.monitoringSessions.set(patientId, session);
    return { sessionId: patientId, status: 'monitoring_started' };
  }

  async processVitalSigns(data) {
    const { patientId, vitalSigns, timestamp } = data;
    const session = this.monitoringSessions.get(patientId);
    
    if (!session) {
      throw new Error('No active monitoring session found');
    }

    const reading = {
      timestamp: timestamp || new Date(),
      vitalSigns,
      status: await this.assessVitalSigns(vitalSigns),
      alerts: await this.checkForAlerts(vitalSigns)
    };

    session.readings.push(reading);
    
    if (reading.alerts.length > 0) {
      session.alerts.push(...reading.alerts);
      await this.notifyHealthcareProviders(patientId, reading.alerts);
    }

    return reading;
  }

  async assessVitalSigns(vitalSigns) {
    const assessments = {};
    
    Object.entries(vitalSigns).forEach(([parameter, value]) => {
      const thresholds = this.alertThresholds.vitalSigns[parameter];
      if (thresholds) {
        assessments[parameter] = this.assessParameter(value, thresholds);
      }
    });

    return assessments;
  }

  assessParameter(value, thresholds) {
    if (thresholds.critical) {
      if (value < thresholds.critical.min || value > thresholds.critical.max) {
        return 'critical';
      }
    }
    
    if (thresholds.min && value < thresholds.min) return 'low';
    if (thresholds.max && value > thresholds.max) return 'high';
    
    return 'normal';
  }

  async checkForAlerts(vitalSigns) {
    const alerts = [];
    
    Object.entries(vitalSigns).forEach(([parameter, value]) => {
      const assessment = this.assessParameter(value, this.alertThresholds.vitalSigns[parameter]);
      
      if (assessment !== 'normal') {
        alerts.push({
          type: 'vital_signs_abnormal',
          parameter,
          value,
          status: assessment,
          severity: assessment === 'critical' ? 'high' : 'medium',
          timestamp: new Date()
        });
      }
    });

    return alerts;
  }

  async notifyHealthcareProviders(patientId, alerts) {
    const criticalAlerts = alerts.filter(alert => alert.severity === 'high');
    
    if (criticalAlerts.length > 0) {
      console.log(`URGENT: Critical alerts for patient ${patientId}:`, criticalAlerts);
      // In real implementation, send notifications via email, SMS, etc.
    }
  }

  async createMonitoringReport(data) {
    const { patientId, timeRange } = data;
    const session = this.monitoringSessions.get(patientId);
    
    if (!session) {
      throw new Error('No monitoring session found');
    }

    const report = {
      patientId,
      reportPeriod: timeRange,
      totalReadings: session.readings.length,
      alertsGenerated: session.alerts.length,
      vitalSignsTrends: await this.analyzeTrends(session.readings),
      recommendations: await this.generateRecommendations(session),
      generatedAt: new Date()
    };

    return report;
  }

  async analyzeTrends(readings) {
    const trends = {};
    
    if (readings.length < 2) return trends;

    const parameters = Object.keys(readings[0].vitalSigns);
    
    parameters.forEach(param => {
      const values = readings.map(r => r.vitalSigns[param]).filter(v => v != null);
      
      if (values.length > 1) {
        const trend = values[values.length - 1] > values[0] ? 'increasing' : 'decreasing';
        const stability = this.calculateStability(values);
        
        trends[param] = { trend, stability, latestValue: values[values.length - 1] };
      }
    });

    return trends;
  }

  calculateStability(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev < mean * 0.1 ? 'stable' : 'variable';
  }

  async generateRecommendations(session) {
    const recommendations = [];
    
    if (session.alerts.length > 0) {
      recommendations.push('Review recent alerts with healthcare provider');
    }
    
    if (session.readings.length > 10) {
      recommendations.push('Vital signs pattern analysis suggests good monitoring compliance');
    }

    return recommendations;
  }
}

class CoordinationAgent extends BaseAgent {
  constructor() {
    super('CoordinationAgent', 'Multi-Agent Coordination & Workflow Management');
    this.agents = new Map();
    this.workflows = [];
    this.activeWorkflows = new Map();
  }

  registerAgent(agent) {
    this.agents.set(agent.name, agent);
    console.log(`Agent ${agent.name} registered with coordination system`);
  }

  async execute(task) {
    switch (task.type) {
      case 'coordinate_diagnosis':
        return await this.coordinateDiagnosis(task.data);
      case 'manage_treatment_workflow':
        return await this.manageTreatmentWorkflow(task.data);
      case 'orchestrate_monitoring':
        return await this.orchestrateMonitoring(task.data);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  async coordinateDiagnosis(data) {
    const workflowId = `diagnosis-${Date.now()}`;
    const { symptoms, patientProfile, vitalSigns } = data;

    console.log(`Starting coordinated diagnosis workflow: ${workflowId}`);

    try {
      // Step 1: Diagnostic Agent analyzes symptoms
      const diagnosticAgent = this.agents.get('DiagnosticAgent');
      const symptomAnalysis = await diagnosticAgent.processTask({
        id: `${workflowId}-symptoms`,
        type: 'analyze_symptoms',
        data: symptoms
      });

      // Step 2: Generate comprehensive diagnosis
      const diagnosis = await diagnosticAgent.processTask({
        id: `${workflowId}-diagnosis`,
        type: 'generate_diagnosis',
        data: { symptoms, patientHistory: patientProfile.medicalHistory, vitalSigns }
      });

      // Step 3: Treatment Agent creates treatment plan
      const treatmentAgent = this.agents.get('TreatmentAgent');
      const treatmentPlan = await treatmentAgent.processTask({
        id: `${workflowId}-treatment`,
        type: 'create_treatment_plan',
        data: { diagnosis: diagnosis.primaryDiagnosis, patientProfile, symptoms }
      });

      // Step 4: Monitoring Agent sets up monitoring
      const monitoringAgent = this.agents.get('MonitoringAgent');
      const monitoringSetup = await monitoringAgent.processTask({
        id: `${workflowId}-monitoring`,
        type: 'start_monitoring',
        data: { 
          patientId: patientProfile.id, 
          monitoringPlan: treatmentPlan.monitoring,
          duration: '7 days'
        }
      });

      const workflow = {
        id: workflowId,
        type: 'coordinated_diagnosis',
        status: 'completed',
        results: {
          symptomAnalysis,
          diagnosis,
          treatmentPlan,
          monitoringSetup
        },
        completedAt: new Date()
      };

      this.workflows.push(workflow);
      return workflow;

    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error);
      throw error;
    }
  }

  async manageTreatmentWorkflow(data) {
    const workflowId = `treatment-${Date.now()}`;
    const { patientId, treatmentPlan } = data;

    const workflow = {
      id: workflowId,
      patientId,
      type: 'treatment_management',
      status: 'active',
      startedAt: new Date(),
      steps: []
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Coordinate between Treatment and Monitoring agents
    const treatmentAgent = this.agents.get('TreatmentAgent');
    const monitoringAgent = this.agents.get('MonitoringAgent');

    // Set up treatment monitoring
    const monitoringTask = await monitoringAgent.processTask({
      id: `${workflowId}-monitor`,
      type: 'start_monitoring',
      data: {
        patientId,
        monitoringPlan: treatmentPlan.monitoring,
        duration: treatmentPlan.duration || '14 days'
      }
    });

    workflow.steps.push({
      agent: 'MonitoringAgent',
      action: 'start_monitoring',
      result: monitoringTask,
      timestamp: new Date()
    });

    return workflow;
  }

  async orchestrateMonitoring(data) {
    const { patientId, vitalSigns } = data;
    
    // Process vital signs through monitoring agent
    const monitoringAgent = this.agents.get('MonitoringAgent');
    const vitalSignsResult = await monitoringAgent.processTask({
      id: `monitoring-${Date.now()}`,
      type: 'process_vital_signs',
      data: { patientId, vitalSigns }
    });

    // If alerts are generated, coordinate with treatment agent
    if (vitalSignsResult.alerts.length > 0) {
      const treatmentAgent = this.agents.get('TreatmentAgent');
      
      for (const alert of vitalSignsResult.alerts) {
        if (alert.severity === 'high') {
          // Request treatment modification
          await treatmentAgent.processTask({
            id: `alert-response-${Date.now()}`,
            type: 'monitor_treatment',
            data: { patientId, alert, currentVitals: vitalSigns }
          });
        }
      }
    }

    return vitalSignsResult;
  }

  async getWorkflowStatus(workflowId) {
    const activeWorkflow = this.activeWorkflows.get(workflowId);
    if (activeWorkflow) return activeWorkflow;

    return this.workflows.find(w => w.id === workflowId);
  }

  async getAgentStatus() {
    const status = {};
    
    this.agents.forEach((agent, name) => {
      status[name] = {
        active: agent.isActive,
        currentTasks: agent.currentTasks.length,
        completedTasks: agent.completedTasks.length,
        specialization: agent.specialization
      };
    });

    return status;
  }
}

// Multi-Agent System Manager
class AIAgentsSystem {
  constructor() {
    this.coordinationAgent = new CoordinationAgent();
    this.diagnosticAgent = new DiagnosticAgent();
    this.treatmentAgent = new TreatmentAgent();
    this.monitoringAgent = new MonitoringAgent();
    
    this.initializeSystem();
  }

  initializeSystem() {
    // Register all agents with coordination system
    this.coordinationAgent.registerAgent(this.diagnosticAgent);
    this.coordinationAgent.registerAgent(this.treatmentAgent);
    this.coordinationAgent.registerAgent(this.monitoringAgent);
    
    console.log('Multi-Agent AI Healthcare System initialized');
  }

  async processPatientCase(patientData) {
    const { symptoms, patientProfile, vitalSigns } = patientData;
    
    // Use coordination agent to orchestrate the entire process
    return await this.coordinationAgent.processTask({
      id: `case-${Date.now()}`,
      type: 'coordinate_diagnosis',
      data: { symptoms, patientProfile, vitalSigns }
    });
  }

  async monitorPatient(patientId, vitalSigns) {
    return await this.coordinationAgent.processTask({
      id: `monitor-${Date.now()}`,
      type: 'orchestrate_monitoring',
      data: { patientId, vitalSigns }
    });
  }

  async getSystemStatus() {
    return {
      system: 'Multi-Agent AI Healthcare System',
      status: 'active',
      agents: await this.coordinationAgent.getAgentStatus(),
      timestamp: new Date()
    };
  }

  // Emergency response coordination
  async handleEmergency(emergencyData) {
    const { patientId, emergencyType, vitalSigns, symptoms } = emergencyData;
    
    console.log(`EMERGENCY PROTOCOL ACTIVATED: ${emergencyType}`);
    
    // Fast-track diagnosis
    const urgentDiagnosis = await this.diagnosticAgent.processTask({
      id: `emergency-${Date.now()}`,
      type: 'generate_diagnosis',
      data: { 
        symptoms, 
        patientHistory: emergencyData.patientHistory, 
        vitalSigns,
        priority: 'urgent'
      }
    });

    // Immediate treatment recommendations
    const emergencyTreatment = await this.treatmentAgent.processTask({
      id: `emergency-treatment-${Date.now()}`,
      type: 'create_treatment_plan',
      data: { 
        diagnosis: urgentDiagnosis.primaryDiagnosis,
        patientProfile: emergencyData.patientProfile,
        symptoms,
        emergency: true
      }
    });

    // Continuous monitoring
    const intensiveMonitoring = await this.monitoringAgent.processTask({
      id: `emergency-monitoring-${Date.now()}`,
      type: 'start_monitoring',
      data: {
        patientId,
        monitoringPlan: { frequency: 'continuous', alertThresholds: 'sensitive' },
        duration: 'until_stable'
      }
    });

    return {
      emergencyResponse: {
        diagnosis: urgentDiagnosis,
        treatment: emergencyTreatment,
        monitoring: intensiveMonitoring,
        timestamp: new Date(),
        status: 'emergency_protocols_active'
      }
    };
  }
}

// Initialize and export the system
const aiAgentsSystem = new AIAgentsSystem();

export default aiAgentsSystem;
export { 
  AIAgentsSystem,
  DiagnosticAgent,
  TreatmentAgent,
  MonitoringAgent,
  CoordinationAgent
};