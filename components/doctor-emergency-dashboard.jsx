"use client";
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Activity,
  Heart,
  Stethoscope,
  FileText,
  MessageSquare,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import EmergencyVideoCall from './emergency-video-call';

const DoctorEmergencyDashboard = ({ user }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  // Hardcoded emergency calls data
  const mockEmergencyCalls = [
    {
      id: 'emergency-call-1',
      patientName: 'Rajesh Kumar',
      age: 45,
      symptoms: 'Severe chest pain, difficulty breathing, sweating',
      emergencyLevel: 'CRITICAL',
      location: 'New Delhi',
      waitTime: '2 min',
      kycVerified: true,
      vitalSigns: {
        heartRate: 95,
        bloodPressure: '140/90',
        oxygenLevel: 94
      }
    },
    {
      id: 'emergency-call-2', 
      patientName: 'Priya Sharma',
      age: 32,
      symptoms: 'Severe allergic reaction, facial swelling, rash',
      emergencyLevel: 'CRITICAL',
      location: 'Mumbai',
      waitTime: '1 min',
      kycVerified: true,
      vitalSigns: {
        heartRate: 110,
        bloodPressure: '120/80',
        oxygenLevel: 96
      }
    },
    {
      id: 'emergency-call-3',
      patientName: 'Amit Patel',
      age: 28,
      symptoms: 'High fever, severe headache, neck stiffness',
      emergencyLevel: 'URGENT',
      location: 'Bangalore',
      waitTime: '5 min',
      kycVerified: true,
      vitalSigns: {
        heartRate: 88,
        bloodPressure: '130/85',
        oxygenLevel: 98
      }
    }
  ];

  const mockCallHistory = [
    {
      id: 'hist-1',
      patientName: 'Anita Singh',
      duration: '15 min',
      outcome: 'Referred to hospital',
      timestamp: '2 hours ago',
      emergencyLevel: 'CRITICAL'
    },
    {
      id: 'hist-2',
      patientName: 'Vikram Mehta', 
      duration: '8 min',
      outcome: 'Prescribed medication',
      timestamp: '4 hours ago',
      emergencyLevel: 'URGENT'
    }
  ];

  useEffect(() => {
    // Simulate incoming calls when online
    if (isOnline && incomingCalls.length === 0) {
      setIncomingCalls(mockEmergencyCalls);
    }
    
    if (!isOnline) {
      setIncomingCalls([]);
    }
  }, [isOnline]);

  const handleGoOnline = () => {
    setIsOnline(true);
    setCallHistory(mockCallHistory);
  };

  const handleGoOffline = () => {
    setIsOnline(false);
    setActiveCall(null);
    setIncomingCalls([]);
  };

  const handleAcceptCall = (call) => {
    setActiveCall(call);
    setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
    setConsultationNotes('');
    setDiagnosis('');
    setPrescription('');
    // Start video call
    setIsVideoCallActive(true);
  };

  const handleEndCall = () => {
    if (activeCall) {
      // Add to call history
      const completedCall = {
        id: Date.now(),
        patientName: activeCall.patientName,
        duration: '12 min', // Mock duration
        outcome: diagnosis || 'Consultation completed',
        timestamp: 'Just now',
        emergencyLevel: activeCall.emergencyLevel
      };
      
      setCallHistory(prev => [completedCall, ...prev]);
      setActiveCall(null);
      setConsultationNotes('');
      setDiagnosis('');
      setPrescription('');
      // End video call
      setIsVideoCallActive(false);
    }
  };

  const handleRejectCall = (callId) => {
    setIncomingCalls(prev => prev.filter(c => c.id !== callId));
  };

  if (!user || user.role !== 'DOCTOR') {
    return null; // Don't show to non-doctors
  }

  return (
    <div className="space-y-6">
      {/* Emergency Status Panel */}
      <Card className="bg-gradient-to-r from-emerald-950/30 to-blue-950/20 border-emerald-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-emerald-400">
            <div className="flex items-center">
              <Stethoscope className="h-6 w-6 mr-3" />
              Emergency Response Center
            </div>
            <Badge className={isOnline ? "bg-green-600" : "bg-gray-600"}>
              <Activity className="h-3 w-3 mr-1" />
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
              <div className="text-2xl font-bold text-red-400">
                {incomingCalls.filter(c => c.emergencyLevel === 'CRITICAL').length}
              </div>
              <div className="text-sm text-gray-300">Critical Emergencies</div>
            </div>
            <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
              <div className="text-2xl font-bold text-orange-400">
                {incomingCalls.filter(c => c.emergencyLevel === 'URGENT').length}
              </div>
              <div className="text-sm text-gray-300">Urgent Cases</div>
            </div>
            <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">
                {callHistory.length}
              </div>
              <div className="text-sm text-gray-300">Completed Today</div>
            </div>
          </div>

          <div className="flex justify-center">
            {!isOnline ? (
              <Button onClick={handleGoOnline} className="bg-green-600 hover:bg-green-700">
                <Activity className="h-4 w-4 mr-2" />
                Go Online for Emergency Calls
              </Button>
            ) : (
              <Button onClick={handleGoOffline} variant="outline" className="border-red-500 text-red-400">
                <PhoneOff className="h-4 w-4 mr-2" />
                Go Offline
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Call Interface */}
      {activeCall && (
        <Card className="bg-red-950/20 border-red-500/50">
          <CardHeader className="bg-red-950/30">
            <CardTitle className="text-red-400 flex items-center">
              <PhoneCall className="h-5 w-5 mr-2 animate-pulse" />
              Emergency Call in Progress - {activeCall.patientName}
              <Badge className="ml-auto bg-red-600">
                {activeCall.emergencyLevel}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Patient Info */}
              <Card className="bg-gray-900/50 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-medium">{activeCall.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Age:</span>
                    <span className="text-white">{activeCall.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{activeCall.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">KYC Status:</span>
                    <Badge className="bg-green-600">Verified</Badge>
                  </div>
                  
                  <div className="mt-4 p-3 bg-red-900/20 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Reported Symptoms:</h4>
                    <p className="text-gray-300 text-sm">{activeCall.symptoms}</p>
                  </div>

                  <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
                    <h4 className="text-blue-400 font-medium mb-2">Vital Signs:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Heart Rate:</span>
                        <span className="text-white">{activeCall.vitalSigns.heartRate} bpm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Blood Pressure:</span>
                        <span className="text-white">{activeCall.vitalSigns.bloodPressure} mmHg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Oxygen Level:</span>
                        <span className="text-white">{activeCall.vitalSigns.oxygenLevel}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Video Call Interface */}
              <Card className="bg-gray-900/50 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Video Call</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-800 rounded-lg h-48 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <User className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Patient Video Feed</p>
                      <p className="text-sm text-green-400">Connected</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-2">
                    <Button size="sm" className="bg-blue-600">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-green-600">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleEndCall}>
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Notes */}
              <Card className="bg-gray-900/50 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Consultation Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Notes
                    </label>
                    <Textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      placeholder="Patient assessment, observations..."
                      className="bg-gray-800 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Diagnosis
                    </label>
                    <Input
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Emergency diagnosis..."
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Prescription/Action
                    </label>
                    <Textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="Immediate treatment, medications, follow-up..."
                      className="bg-gray-800 border-gray-600 text-white"
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={handleEndCall}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Emergency Calls */}
      {isOnline && incomingCalls.length > 0 && !activeCall && (
        <Card className="bg-red-950/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" />
              Incoming Emergency Calls ({incomingCalls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incomingCalls.map((call) => (
                <Card key={call.id} className="bg-gray-900/30 border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={call.emergencyLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'}>
                            {call.emergencyLevel}
                          </Badge>
                          <h3 className="font-medium text-white">{call.patientName}</h3>
                          <span className="text-gray-400">• {call.age} years</span>
                          <span className="text-gray-400">• {call.location}</span>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Symptoms:</strong> {call.symptoms}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Waiting: {call.waitTime}</span>
                          <span>KYC: {call.kycVerified ? '✓ Verified' : '✗ Pending'}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleAcceptCall(call)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          onClick={() => handleRejectCall(call.id)}
                          variant="outline" 
                          className="border-red-500 text-red-400"
                        >
                          <PhoneOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call History */}
      {isOnline && callHistory.length > 0 && (
        <Card className="bg-gray-900/20 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Emergency Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {callHistory.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">{call.patientName}</h4>
                    <p className="text-sm text-gray-400">
                      {call.duration} • {call.outcome} • {call.timestamp}
                    </p>
                  </div>
                  <Badge className={call.emergencyLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'}>
                    {call.emergencyLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline State */}
      {!isOnline && (
        <Card className="bg-gray-900/20 border-gray-600">
          <CardContent className="text-center py-12">
            <PhoneOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Emergency Response Offline</h3>
            <p className="text-gray-400 mb-6">
              Click "Go Online" to start receiving emergency calls from patients
            </p>
            <Button onClick={handleGoOnline} className="bg-green-600 hover:bg-green-700">
              <Activity className="h-4 w-4 mr-2" />
              Go Online for Emergency Calls
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Emergency Video Call Component for Doctor */}
      <EmergencyVideoCall
        isActive={isVideoCallActive}
        onCallEnd={handleEndCall}
        patientInfo={activeCall ? {
          name: activeCall.patientName,
          age: activeCall.age || '35',
          symptoms: activeCall.symptoms
        } : null}
        emergencyLevel={activeCall?.emergencyLevel || 'CRITICAL'}
        doctorInfo={{
          name: user?.name || 'Dr. Emergency',
          specialty: user?.specialty || 'Emergency Medicine'
        }}
      />
    </div>
  );
};

export default DoctorEmergencyDashboard;