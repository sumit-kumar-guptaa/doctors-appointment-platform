"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function AIDiagnosisPage() {
  const [patientData, setPatientData] = useState({
    age: '',
    gender: '',
    chiefComplaint: '',
    symptoms: '',
    duration: '',
    vitals: '',
    medicalHistory: ''
  });
  
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDiagnosis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData })
      });
      
      const result = await response.json();
      setDiagnosis(result);
    } catch (error) {
      console.error('Diagnosis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧠 AI Medical Diagnosis</h1>
        <p className="text-gray-600">Real AI-powered medical analysis using Gemini API</p>
        <Badge className="mt-2 bg-green-500">✅ REAL AI - NOT DEMO</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={patientData.age}
                  onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                  placeholder="35"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={patientData.gender}
                  onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                  placeholder="Male/Female"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complaint">Chief Complaint</Label>
              <Input
                id="complaint"
                value={patientData.chiefComplaint}
                onChange={(e) => setPatientData({...patientData, chiefComplaint: e.target.value})}
                placeholder="Severe headache, fever"
              />
            </div>

            <div>
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                value={patientData.symptoms}
                onChange={(e) => setPatientData({...patientData, symptoms: e.target.value})}
                placeholder="Neck stiffness, photophobia, nausea, confusion"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={patientData.duration}
                onChange={(e) => setPatientData({...patientData, duration: e.target.value})}
                placeholder="6 hours, worsening"
              />
            </div>

            <div>
              <Label htmlFor="vitals">Vital Signs</Label>
              <Input
                id="vitals"
                value={patientData.vitals}
                onChange={(e) => setPatientData({...patientData, vitals: e.target.value})}
                placeholder="BP 140/90, HR 110, Temp 101°F"
              />
            </div>

            <div>
              <Label htmlFor="history">Medical History</Label>
              <Textarea
                id="history"
                value={patientData.medicalHistory}
                onChange={(e) => setPatientData({...patientData, medicalHistory: e.target.value})}
                placeholder="Previous conditions, medications, allergies"
                rows={2}
              />
            </div>

            <Button 
              onClick={handleDiagnosis}
              disabled={loading || !patientData.chiefComplaint}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '🧠 AI Analyzing...' : '🔬 Get AI Diagnosis'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Medical Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {!diagnosis && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-6xl mb-4">🩺</div>
                <p>Fill in patient information and click "Get AI Diagnosis" to see real AI medical analysis</p>
                <Badge className="mt-4 bg-green-500">Powered by Gemini AI</Badge>
              </div>
            )}

            {diagnosis && diagnosis.success && (
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-bold text-lg text-red-600">Primary Diagnosis</h3>
                  <p className="mt-2">{diagnosis.primaryDiagnosis}</p>
                </div>

                {diagnosis.urgencyLevel && (
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg text-orange-600">Urgency Level</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={diagnosis.urgencyLevel >= 8 ? "bg-red-500" : diagnosis.urgencyLevel >= 6 ? "bg-orange-500" : "bg-yellow-500"}>
                        {diagnosis.urgencyLevel}/10
                      </Badge>
                      <span>{diagnosis.urgencyLevel >= 8 ? "Critical" : diagnosis.urgencyLevel >= 6 ? "Urgent" : "Moderate"}</span>
                    </div>
                  </div>
                )}

                {diagnosis.differentialDiagnoses && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg text-blue-600">Differential Diagnoses</h3>
                    <ul className="mt-2 space-y-1">
                      {diagnosis.differentialDiagnoses.map((diff, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          {diff}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosis.immediateActions && (
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg text-green-600">Immediate Actions</h3>
                    <ul className="mt-2 space-y-1">
                      {diagnosis.immediateActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosis.redFlags && (
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg text-red-600">Red Flags</h3>
                    <ul className="mt-2 space-y-1">
                      {diagnosis.redFlags.map((flag, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-red-500">⚠️</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Disclaimer:</strong> This AI analysis is for educational purposes only. 
                    Always consult with qualified healthcare professionals for actual medical decisions.
                  </p>
                  <Badge className="mt-2 bg-green-500">✅ Generated by Real Gemini AI</Badge>
                </div>
              </div>
            )}

            {diagnosis && !diagnosis.success && (
              <div className="text-red-500 text-center py-8">
                <div className="text-4xl mb-4">❌</div>
                <p>Error: {diagnosis.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}