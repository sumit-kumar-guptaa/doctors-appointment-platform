'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AIAgentsDashboard() {
  const [agentsSystem, setAgentsSystem] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('coordination');
  const [demoResults, setDemoResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      // Dynamic import to handle client-side only
      const { default: AIAgentsSystem } = await import('@/lib/ai-agents-system');
      const system = new AIAgentsSystem();
      
      setAgentsSystem(system);
      
      const status = await system.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to initialize AI Agents System:', error);
    }
  };

  const runDiagnosisDemo = async () => {
    if (!agentsSystem) return;
    
    setLoading(true);
    try {
      const demoPatientData = {
        symptoms: ['fever', 'headache', 'fatigue'],
        patientProfile: {
          id: 'demo-patient-001',
          age: 35,
          gender: 'female',
          medicalHistory: ['hypertension']
        },
        vitalSigns: {
          heartRate: 95,
          bloodPressure: { systolic: 145, diastolic: 92 },
          temperature: 38.2,
          oxygenSaturation: 97
        }
      };

      const result = await agentsSystem.processPatientCase(demoPatientData);
      setDemoResults(result);
    } catch (error) {
      console.error('Demo failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const runEmergencyDemo = async () => {
    if (!agentsSystem) return;
    
    setLoading(true);
    try {
      const emergencyData = {
        patientId: 'emergency-patient-001',
        emergencyType: 'cardiac_event',
        symptoms: ['chest_pain', 'shortness_of_breath'],
        vitalSigns: {
          heartRate: 125,
          bloodPressure: { systolic: 180, diastolic: 110 },
          oxygenSaturation: 89
        },
        patientProfile: {
          id: 'emergency-patient-001',
          age: 58,
          medicalHistory: ['diabetes', 'hypertension']
        }
      };

      const result = await agentsSystem.handleEmergency(emergencyData);
      setDemoResults(result);
    } catch (error) {
      console.error('Emergency demo failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const AgentStatusCard = ({ agentName, status }) => {
    const getStatusColor = (active) => active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{agentName}</CardTitle>
            <Badge className={getStatusColor(status.active)}>
              {status.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Specialization:</strong> {status.specialization}
            </p>
            <div className="flex justify-between text-sm">
              <span>Current Tasks: <span className="font-semibold">{status.currentTasks}</span></span>
              <span>Completed: <span className="font-semibold">{status.completedTasks}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const WorkflowVisualization = ({ workflow }) => {
    if (!workflow) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Workflow: {workflow.id}</CardTitle>
          <Badge>{workflow.status}</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.results && (
              <>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Symptom Analysis</h4>
                  <p className="text-sm">Severity: {workflow.results.symptomAnalysis.severity}</p>
                  <p className="text-sm">Urgency: {workflow.results.symptomAnalysis.urgency}</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Diagnosis</h4>
                  <p className="text-sm">Primary: {workflow.results.diagnosis.primaryDiagnosis}</p>
                  <p className="text-sm">Confidence: {(workflow.results.diagnosis.confidence * 100).toFixed(1)}%</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Treatment Plan</h4>
                  <p className="text-sm">Medications: {workflow.results.treatmentPlan.medications?.length || 0}</p>
                  <p className="text-sm">Follow-up: {workflow.results.treatmentPlan.followUp?.timeframe}</p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold">Monitoring</h4>
                  <p className="text-sm">Status: {workflow.results.monitoringSetup.status}</p>
                </div>
              </>
            )}
            
            {workflow.emergencyResponse && (
              <Alert className="border-red-500">
                <AlertDescription>
                  <strong>Emergency Response Activated</strong>
                  <br />
                  Diagnosis: {workflow.emergencyResponse.diagnosis.primaryDiagnosis}
                  <br />
                  Status: {workflow.emergencyResponse.status}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 Multi-Agent AI Healthcare System</h1>
        <p className="text-gray-600">
          Autonomous AI agents working together to provide comprehensive healthcare services
        </p>
      </div>

      {/* System Status Overview */}
      {systemStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(systemStatus.agents).filter(a => a.active).length}
                </div>
                <div className="text-sm text-gray-600">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(systemStatus.agents).reduce((sum, a) => sum + a.currentTasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Current Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(systemStatus.agents).reduce((sum, a) => sum + a.completedTasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Completed Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {activeWorkflows.length}
                </div>
                <div className="text-sm text-gray-600">Active Workflows</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
        </TabsList>

        {/* AI Agents Tab */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemStatus?.agents && Object.entries(systemStatus.agents).map(([name, status]) => (
              <AgentStatusCard key={name} agentName={name} status={status} />
            ))}
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Management</CardTitle>
              <p className="text-sm text-gray-600">
                Monitor and manage AI agent collaborations and workflows
              </p>
            </CardHeader>
            <CardContent>
              {demoResults ? (
                <WorkflowVisualization workflow={demoResults} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active workflows. Run a demo to see workflow visualization.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live AI Agents Demo</CardTitle>
                <p className="text-sm text-gray-600">
                  Experience the multi-agent system in action with realistic healthcare scenarios
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Button 
                    onClick={runDiagnosisDemo}
                    disabled={loading || !agentsSystem}
                    className="p-6 h-auto flex flex-col items-start"
                  >
                    <div className="text-lg font-semibold mb-2">🩺 Diagnosis Workflow</div>
                    <div className="text-sm text-left opacity-90">
                      Simulate a patient with fever, headache, and fatigue
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={runEmergencyDemo}
                    disabled={loading || !agentsSystem}
                    variant="destructive"
                    className="p-6 h-auto flex flex-col items-start"
                  >
                    <div className="text-lg font-semibold mb-2">🚨 Emergency Response</div>
                    <div className="text-sm text-left opacity-90">
                      Simulate a cardiac emergency scenario
                    </div>
                  </Button>
                </div>

                {loading && (
                  <Alert>
                    <AlertDescription>
                      AI agents are processing... Please wait while the multi-agent system collaborates.
                    </AlertDescription>
                  </Alert>
                )}

                {demoResults && <WorkflowVisualization workflow={demoResults} />}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Agent Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">🧠 Diagnostic Agent</h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Symptom analysis & pattern recognition</li>
                        <li>• Medical knowledge base integration</li>
                        <li>• Risk assessment & urgency classification</li>
                        <li>• Differential diagnosis generation</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">💊 Treatment Agent</h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Personalized treatment planning</li>
                        <li>• Medication selection & dosing</li>
                        <li>• Drug interaction checking</li>
                        <li>• Follow-up scheduling</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">📊 Monitoring Agent</h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Real-time vital signs monitoring</li>
                        <li>• Alert generation & escalation</li>
                        <li>• Trend analysis & reporting</li>
                        <li>• Healthcare provider notifications</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">🎭 Coordination Agent</h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Multi-agent workflow orchestration</li>
                        <li>• Task distribution & load balancing</li>
                        <li>• Inter-agent communication</li>
                        <li>• Emergency protocol activation</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">🚀 Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Autonomous Operation</h4>
                        <p className="text-sm text-blue-600">Agents work independently and collaboratively</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800">Real-time Collaboration</h4>
                        <p className="text-sm text-green-600">Seamless inter-agent communication</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-800">Scalable Architecture</h4>
                        <p className="text-sm text-purple-600">Easy to add new specialized agents</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}