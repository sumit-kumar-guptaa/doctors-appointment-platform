"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pills, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Plus,
  Search,
  Shield,
  Clock,
  Info,
  UserCheck,
  Zap,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import DrugInteractionChecker from '@/lib/drug-interaction-checker';

export default function DrugInteractionInterface() {
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState('');
  const [interactionResults, setInteractionResults] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checker, setChecker] = useState(null);
  const [userProfile, setUserProfile] = useState({
    allergies: [],
    conditions: []
  });
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Initialize drug interaction checker
  useEffect(() => {
    const initChecker = async () => {
      const drugChecker = new DrugInteractionChecker();
      
      // Load user profile from localStorage
      const savedProfile = localStorage.getItem('userMedicalProfile');
      const profile = savedProfile ? JSON.parse(savedProfile) : userProfile;
      
      const result = await drugChecker.initialize(profile);
      
      if (result.success) {
        setChecker(drugChecker);
        setUserProfile(profile);
        toast.success("Drug Interaction Checker ready");
      } else {
        toast.error("Failed to initialize drug checker");
      }
    };
    
    initChecker();
  }, []);

  const addMedication = () => {
    if (!newMedication.trim()) {
      toast.error("Please enter a medication name");
      return;
    }

    const medication = newMedication.trim();
    
    if (medications.includes(medication.toLowerCase())) {
      toast.error("This medication is already in the list");
      return;
    }

    setMedications(prev => [...prev, medication]);
    setNewMedication('');
    
    // Clear previous results when medications change
    setInteractionResults(null);
    
    toast.success(`Added ${medication} to the list`);
  };

  const removeMedication = (medication) => {
    setMedications(prev => prev.filter(med => med !== medication));
    setInteractionResults(null);
    toast.success(`Removed ${medication} from the list`);
  };

  const checkInteractions = async () => {
    if (medications.length < 2) {
      toast.error("Please add at least 2 medications to check for interactions");
      return;
    }

    if (!checker) {
      toast.error("Drug checker not initialized");
      return;
    }

    setIsChecking(true);
    
    try {
      const results = await checker.checkInteractions(medications);
      setInteractionResults(results);
      
      // Save to history
      checker.saveInteractionCheck(medications, results);
      
      // Show appropriate toast based on results
      if (results.overallRisk === 'critical' || results.overallRisk === 'high') {
        toast.error(`High risk interactions detected! Please consult your healthcare provider.`);
      } else if (results.overallRisk === 'moderate') {
        toast.warning(`Moderate interactions found. Review recommendations carefully.`);
      } else {
        toast.success(`Interaction check complete. Overall risk: ${results.overallRisk}`);
      }
      
    } catch (error) {
      console.error("Error checking interactions:", error);
      toast.error("Failed to check interactions. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const updateUserProfile = (updates) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    
    // Update checker profile
    if (checker) {
      checker.updateUserProfile(newProfile);
    }
    
    // Save to localStorage
    localStorage.setItem('userMedicalProfile', JSON.stringify(newProfile));
    
    toast.success("Profile updated successfully");
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'major':
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-50';
      case 'minor':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          AI Drug Interaction Checker
        </h1>
        <p className="text-gray-600">
          Advanced pharmaceutical safety screening with real-time interaction analysis
        </p>
      </div>

      {/* User Profile Setup */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Medical Profile
            </CardTitle>
            <Button 
              onClick={() => setShowProfileSetup(!showProfileSetup)}
              variant="outline"
              size="sm"
            >
              {showProfileSetup ? 'Hide' : 'Setup'} Profile
            </Button>
          </div>
        </CardHeader>
        {showProfileSetup && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium mb-2">Known Allergies</label>
                <div className="space-y-2">
                  {userProfile.allergies?.map((allergy, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded border border-red-200">
                      <span className="text-red-700">{allergy}</span>
                      <Button
                        onClick={() => updateUserProfile({
                          allergies: userProfile.allergies.filter((_, i) => i !== index)
                        })}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Add allergy (e.g., penicillin, sulfa)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        updateUserProfile({
                          allergies: [...(userProfile.allergies || []), e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-medium mb-2">Medical Conditions</label>
                <div className="space-y-2">
                  {userProfile.conditions?.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                      <span className="text-yellow-700">{condition}</span>
                      <Button
                        onClick={() => updateUserProfile({
                          conditions: userProfile.conditions.filter((_, i) => i !== index)
                        })}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Input
                    placeholder="Add condition (e.g., diabetes, hypertension)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        updateUserProfile({
                          conditions: [...(userProfile.conditions || []), e.target.value.trim()]
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Medication Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pills className="h-5 w-5" />
            Current Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Medication */}
          <div className="flex gap-2">
            <Input
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              placeholder="Enter medication name (generic or brand name)"
              onKeyPress={(e) => e.key === 'Enter' && addMedication()}
            />
            <Button onClick={addMedication}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Medication List */}
          {medications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Medications to Check ({medications.length})</h4>
              <div className="grid gap-2">
                {medications.map((medication, index) => {
                  const drugInfo = checker?.getDrugInfo(medication);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="flex-1">
                        <div className="font-medium">{medication}</div>
                        {drugInfo && (
                          <div className="text-sm text-gray-600">
                            {drugInfo.class} • {drugInfo.category} • Risk: {drugInfo.riskLevel}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => removeMedication(medication)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Check Interactions Button */}
          <Button 
            onClick={checkInteractions}
            disabled={medications.length < 2 || isChecking}
            className="w-full"
            size="lg"
          >
            {isChecking ? (
              <>
                <Search className="h-5 w-5 animate-spin mr-2" />
                Checking Interactions...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Check for Interactions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {interactionResults && (
        <div className="space-y-6">
          {/* Overall Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold p-4 rounded-lg border ${getRiskColor(interactionResults.overallRisk)}`}>
                    {interactionResults.overallRisk.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Overall Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                    {interactionResults.interactions.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 bg-orange-50 p-4 rounded-lg border border-orange-200">
                    {interactionResults.allergies.length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Allergies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    {interactionResults.riskScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Risk Score</div>
                </div>
              </div>

              {interactionResults.overallRisk === 'critical' || interactionResults.overallRisk === 'high' && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>High Risk Detected:</strong> Serious drug interactions or contraindications found. 
                    Please consult your healthcare provider immediately before taking these medications together.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs defaultValue="interactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="interactions" className="flex items-center gap-2">
                <Pills className="h-4 w-4" />
                Drug Interactions ({interactionResults.interactions.length})
              </TabsTrigger>
              <TabsTrigger value="allergies" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Allergies ({interactionResults.allergies.length})
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Recommendations ({interactionResults.recommendations.length})
              </TabsTrigger>
            </TabsList>

            {/* Drug Interactions Tab */}
            <TabsContent value="interactions">
              <div className="space-y-4">
                {interactionResults.interactions.length > 0 ? (
                  interactionResults.interactions.map((interaction, index) => (
                    <Card key={index} className={`border-l-4 ${getSeverityColor(interaction.severity)}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {interaction.matchingDrugs?.join(' + ') || interaction.drugs?.join(' + ')}
                          </CardTitle>
                          <Badge variant={
                            interaction.severity === 'major' ? 'destructive' :
                            interaction.severity === 'moderate' ? 'default' : 'secondary'
                          }>
                            {interaction.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <strong>Mechanism:</strong> {interaction.mechanism}
                        </div>
                        <div>
                          <strong>Description:</strong> {interaction.description}
                        </div>
                        <div>
                          <strong>Recommendation:</strong> {interaction.recommendation}
                        </div>
                        {interaction.monitoring && (
                          <div>
                            <strong>Monitoring Required:</strong> {interaction.monitoring}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Risk Score:</span>
                            <Badge variant="outline">{interaction.riskScore}/10</Badge>
                          </div>
                          {interaction.type && (
                            <Badge variant="outline">{interaction.type.replace('_', ' ')}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">No Drug Interactions Found</h3>
                      <p className="text-green-600">Your current medications appear to be safe to take together.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Allergies Tab */}
            <TabsContent value="allergies">
              <div className="space-y-4">
                {interactionResults.allergies.length > 0 ? (
                  interactionResults.allergies.map((allergy, index) => (
                    <Card key={index} className="border-l-4 border-red-500 bg-red-50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-red-800">
                            {allergy.medication.toUpperCase()}
                          </CardTitle>
                          <Badge variant="destructive">ALLERGY WARNING</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Alert className="border-red-300 bg-red-100">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {allergy.warning}
                          </AlertDescription>
                        </Alert>
                        <div>
                          <strong>Allergen:</strong> {allergy.allergen}
                        </div>
                        <div>
                          <strong>Severity:</strong> {allergy.severity}
                        </div>
                        <div>
                          <strong>Possible Symptoms:</strong> {allergy.symptoms.join(', ')}
                        </div>
                        {allergy.alternatives && (
                          <div>
                            <strong>Alternative Medications:</strong> {allergy.alternatives.join(', ')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">No Allergy Conflicts</h3>
                      <p className="text-green-600">No medications conflict with your known allergies.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations">
              <div className="space-y-4">
                {interactionResults.recommendations.map((rec, index) => (
                  <Card key={index} className="border-l-4 border-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(rec.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rec.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <Badge variant="outline">{rec.type.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-gray-800">{rec.message}</p>
                          {rec.drugs && (
                            <p className="text-sm text-gray-600 mt-1">
                              Affects: {rec.drugs.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Quick Drug Info */}
      {!interactionResults && medications.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4 text-center">AI-Powered Drug Safety Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 mx-auto text-blue-600" />
                <h4 className="font-medium">Real-time Screening</h4>
                <p className="text-sm text-gray-600">
                  Advanced algorithms check 1000+ drug interactions instantly
                </p>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-12 w-12 mx-auto text-red-600" />
                <h4 className="font-medium">Allergy Protection</h4>
                <p className="text-sm text-gray-600">
                  Comprehensive allergy and contraindication checking
                </p>
              </div>
              <div className="text-center space-y-2">
                <Clock className="h-12 w-12 mx-auto text-green-600" />
                <h4 className="font-medium">24/7 Monitoring</h4>
                <p className="text-sm text-gray-600">
                  Continuous safety monitoring with smart recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Notice */}
      <Alert className="border-red-300 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Important:</strong> This tool provides general information only and is not a substitute for professional medical advice. 
          Always consult your healthcare provider or pharmacist before making any changes to your medications.
        </AlertDescription>
      </Alert>
    </div>
  );
}