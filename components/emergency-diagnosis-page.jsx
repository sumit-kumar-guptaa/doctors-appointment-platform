"use client";
import React, { useState } from 'react';
import {
  AlertTriangle,
  Heart,
  Stethoscope,
  Brain,
  Phone,
  Video,
  Upload,
  Scan,
  Activity,
  Timer,
  Clock,
  ArrowRight,
  FileText,
  Star,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MedicalReportDiagnosis from '@/components/medical-report-diagnosis';
import EmergencyVideoCall from '@/components/emergency-video-call';

const EmergencyDiagnosisPage = ({ user }) => {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeMode, setActiveMode] = useState('diagnosis'); // 'diagnosis' or 'call'
  const [emergencyType, setEmergencyType] = useState(null);

  const emergencyCategories = [
    {
      id: 'chest-pain',
      title: 'Chest Pain',
      description: 'Heart-related symptoms',
      icon: Heart,
      color: 'red',
      severity: 'HIGH',
      avgWaitTime: '<2 min'
    },
    {
      id: 'breathing',
      title: 'Breathing Issues',
      description: 'Respiratory problems',
      icon: Activity,
      color: 'orange',
      severity: 'HIGH',
      avgWaitTime: '<2 min'
    },
    {
      id: 'neurological',
      title: 'Neurological',
      description: 'Brain/nervous system',
      icon: Brain,
      color: 'purple',
      severity: 'HIGH',
      avgWaitTime: '<3 min'
    },
    {
      id: 'general',
      title: 'General Emergency',
      description: 'Other urgent symptoms',
      icon: AlertTriangle,
      color: 'yellow',
      severity: 'MEDIUM',
      avgWaitTime: '<5 min'
    }
  ];

  const handleEmergencyCall = (category) => {
    setEmergencyType(category);
    setShowVideoCall(true);
  };

  if (showVideoCall) {
    return (
      <EmergencyVideoCall
        user={user}
        emergencyType={emergencyType}
        onEndCall={() => {
          setShowVideoCall(false);
          setEmergencyType(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-full mb-4 shadow-lg">
            <Zap className="h-6 w-6 animate-pulse" />
            <h1 className="text-xl font-bold">Emergency Medical Assistant</h1>
          </div>
          <p className="text-gray-700 text-lg">
            Get instant medical help with AI-powered report analysis and emergency doctor calls
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg border">
            <button
              onClick={() => setActiveMode('diagnosis')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeMode === 'diagnosis'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Scan className="h-5 w-5 inline mr-2" />
              Report Analysis
            </button>
            <button
              onClick={() => setActiveMode('call')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeMode === 'call'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Phone className="h-5 w-5 inline mr-2" />
              Emergency Call
            </button>
          </div>
        </div>

        {activeMode === 'diagnosis' && (
          <div className="max-w-6xl mx-auto">
            {/* Emergency Alert */}
            <Alert className="mb-6 border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Emergency Diagnosis:</strong> Upload your medical reports for immediate AI analysis. 
                For life-threatening emergencies, switch to Emergency Call mode or dial 911.
              </AlertDescription>
            </Alert>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-blue-300 bg-blue-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">Upload Report</h3>
                  <p className="text-sm text-blue-700">Scan & analyze immediately</p>
                </CardContent>
              </Card>
              
              <Card className="border-green-300 bg-green-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Scan className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">AI Analysis</h3>
                  <p className="text-sm text-green-700">Instant disease detection</p>
                </CardContent>
              </Card>
              
              <Card className="border-purple-300 bg-purple-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Stethoscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Doctor Match</h3>
                  <p className="text-sm text-purple-700">Find right specialist</p>
                </CardContent>
              </Card>
            </div>

            {/* Medical Report Diagnosis Component */}
            <MedicalReportDiagnosis user={user} />
          </div>
        )}

        {activeMode === 'call' && (
          <div className="max-w-4xl mx-auto">
            {/* Emergency Alert */}
            <Alert className="mb-6 border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Emergency Call Mode:</strong> Connect with emergency doctors instantly. 
                Select your emergency type below for fastest routing.
              </AlertDescription>
            </Alert>

            {/* Emergency Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4 text-center">
                  <Timer className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">24/7</div>
                  <p className="text-sm opacity-90">Available</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">&lt;30s</div>
                  <p className="text-sm opacity-90">Connection Time</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">4.9/5</div>
                  <p className="text-sm opacity-90">Doctor Rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.id} 
                    className={`border-2 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-${category.color}-300 bg-${category.color}-50`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                          <IconComponent className={`h-8 w-8 text-${category.color}-600`} />
                        </div>
                        <div className="text-right">
                          <Badge className={`bg-${category.color}-600 text-white mb-2`}>
                            {category.severity}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {category.avgWaitTime}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 text-${category.color}-900`}>
                        {category.title}
                      </h3>
                      <p className="text-gray-700 mb-4">{category.description}</p>
                      
                      <Button
                        onClick={() => handleEmergencyCall(category)}
                        className={`w-full bg-${category.color}-600 hover:bg-${category.color}-700 text-white`}
                        size="lg"
                      >
                        <Video className="h-5 w-5 mr-2" />
                        CALL EMERGENCY DOCTOR
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Emergency Instructions */}
            <Card className="mt-8 border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>For immediate life-threatening emergencies, call 911 or go to nearest ER</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Our emergency doctors can provide immediate consultation and guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Have your medical history and current symptoms ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Video calls connect you with licensed emergency physicians</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyDiagnosisPage;