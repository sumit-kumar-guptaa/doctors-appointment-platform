"use client";
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Heart, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Zap,
  FileCheck,
  Upload,
  User,
  CheckCircle,
  XCircle,
  Activity,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmergencyVideoCall from './emergency-video-call';

const PatientEmergencyDashboard = ({ user }) => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [kycMode, setKycMode] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(user?.kycVerified || false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [connectedDoctor, setConnectedDoctor] = useState(null);
  const [emergencyAssessment, setEmergencyAssessment] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [kycData, setKycData] = useState({
    aadhaar: '',
    pan: '',
    phone: '',
    address: ''
  });

  // Hardcoded emergency doctors data
  const emergencyDoctors = [
    {
      id: 'emergency-1',
      name: 'Dr. Priya Sharma',
      specialty: 'Emergency Medicine',
      experience: 12,
      hospital: 'All India Institute of Medical Sciences',
      isOnline: true,
      responseTime: '< 2 min',
      rating: 4.9,
      emergencyFee: 500
    },
    {
      id: 'emergency-2', 
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      experience: 15,
      hospital: 'Fortis Hospital',
      isOnline: true,
      responseTime: '< 3 min',
      rating: 4.8,
      emergencyFee: 700
    },
    {
      id: 'emergency-3',
      name: 'Dr. Anjali Gupta',
      specialty: 'Critical Care',
      experience: 10,
      hospital: 'Apollo Hospital',
      isOnline: true,
      responseTime: '< 2 min',
      rating: 4.9,
      emergencyFee: 600
    }
  ];

  // AI Emergency Assessment (hardcoded for demo)
  const assessEmergencySymptoms = (symptoms) => {
    const criticalKeywords = [
      'chest pain', 'heart attack', 'stroke', 'breathing difficulty', 
      'severe bleeding', 'unconscious', 'choking', 'allergic reaction',
      'severe burns', 'broken bones', 'head injury', 'poisoning'
    ];
    
    const urgentKeywords = [
      'fever', 'vomiting', 'severe pain', 'headache', 'dizziness',
      'infection', 'rash', 'stomach pain', 'back pain'
    ];

    const lowerSymptoms = symptoms.toLowerCase();
    const isCritical = criticalKeywords.some(keyword => lowerSymptoms.includes(keyword));
    const isUrgent = urgentKeywords.some(keyword => lowerSymptoms.includes(keyword));

    if (isCritical) {
      return {
        level: 'CRITICAL',
        score: 9,
        message: 'This appears to be a medical emergency requiring immediate attention.',
        action: 'CALL_EMERGENCY_DOCTOR',
        color: 'red'
      };
    } else if (isUrgent) {
      return {
        level: 'URGENT',
        score: 6,
        message: 'Your symptoms need medical attention but may not be life-threatening.',
        action: 'SCHEDULE_URGENT_APPOINTMENT',
        color: 'orange'
      };
    } else {
      return {
        level: 'MODERATE',
        score: 3,
        message: 'Your symptoms can likely be managed with a regular consultation.',
        action: 'SCHEDULE_APPOINTMENT',
        color: 'yellow'
      };
    }
  };

  const handleEmergencyAssessment = () => {
    if (!symptoms.trim()) return;
    
    const assessment = assessEmergencySymptoms(symptoms);
    setEmergencyAssessment(assessment);
  };

  const handleEmergencyCall = (doctorId) => {
    if (!isKycVerified) {
      setKycMode(true);
      return;
    }
    
    // Find the doctor being called
    const doctor = mockEmergencyDoctors.find(d => d.id === doctorId);
    setConnectedDoctor(doctor);
    
    setEmergencyMode(true);
    // Start video call after a brief delay (simulating connection)
    setTimeout(() => {
      setIsVideoCallActive(true);
    }, 3000);
    
    console.log('Connecting to emergency doctor:', doctorId);
  };

  const handleKycSubmit = () => {
    // Simulate KYC verification
    setTimeout(() => {
      setIsKycVerified(true);
      setKycMode(false);
      alert('KYC verification successful! ₹1 charged. Emergency calling now available.');
    }, 2000);
  };

  const handleCallEnd = () => {
    setIsVideoCallActive(false);
    setEmergencyMode(false);
    setConnectedDoctor(null);
    // Show call summary or redirect to follow-up
    alert('Emergency call ended. Follow-up instructions have been sent to your email.');
  };

  if (!user || user.role !== 'PATIENT') {
    return null; // Don't show to non-patients
  }

  return (
    <div className="mb-6">
      {/* Main Emergency Banner */}
      <Card className="bg-gradient-to-r from-red-950/30 to-orange-950/20 border-red-500/30 mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-red-400">
            <AlertTriangle className="h-6 w-6 mr-3 animate-pulse" />
            24/7 Emergency Medical Support
            <Badge className="ml-auto bg-green-600 text-white">
              <Activity className="h-3 w-3 mr-1" />
              {emergencyDoctors.filter(d => d.isOnline).length} Doctors Online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Emergency Assessment Chat */}
            <Card className="lg:col-span-2 bg-gray-900/50 border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  AI Emergency Assessment
                  <Badge variant="outline" className="ml-auto text-xs">Always Available</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe your symptoms:
                  </label>
                  <Textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="E.g., chest pain, difficulty breathing, severe headache..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleEmergencyAssessment}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!symptoms.trim()}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Assess Emergency Level
                </Button>

                {/* Assessment Result */}
                {emergencyAssessment && (
                  <Alert className={`border-${emergencyAssessment.color}-500/50 bg-${emergencyAssessment.color}-900/20`}>
                    <AlertTriangle className={`h-4 w-4 text-${emergencyAssessment.color}-400`} />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-${emergencyAssessment.color}-400`}>
                            {emergencyAssessment.level} - Emergency Score: {emergencyAssessment.score}/10
                          </span>
                        </div>
                        <p className={`text-${emergencyAssessment.color}-200`}>
                          {emergencyAssessment.message}
                        </p>
                        
                        {emergencyAssessment.level === 'CRITICAL' && (
                          <div className="mt-3">
                            <Alert className="border-red-500/50 bg-red-900/30">
                              <Phone className="h-4 w-4 text-red-400" />
                              <AlertDescription className="text-red-200">
                                <strong>CRITICAL EMERGENCY DETECTED!</strong><br />
                                For life-threatening symptoms, you can also call 108 immediately.
                                Our emergency doctors are standing by for immediate consultation.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* KYC Status */}
            <Card className="bg-gray-900/50 border-emerald-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-emerald-400 text-lg flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Emergency Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">KYC Status</span>
                  {isKycVerified ? (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Emergency Verification Fee:</span>
                    <span className="text-green-400 font-medium">₹1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Consultation:</span>
                    <span className="text-blue-400 font-medium">₹500-700</span>
                  </div>
                  <div className="text-xs text-yellow-400">
                    EMI options available for emergency consultations
                  </div>
                </div>

                {!isKycVerified ? (
                  <Button 
                    onClick={() => setKycMode(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Complete KYC (₹1)
                  </Button>
                ) : (
                  <div className="text-center py-2">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-green-400">Emergency calls enabled!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Available Emergency Doctors */}
      {(emergencyAssessment?.level === 'CRITICAL' || isKycVerified) && (
        <Card className="bg-gray-900/30 border-red-500/30 mb-4">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Emergency Doctors Available Now
              <Badge className="ml-auto bg-red-600 text-white animate-pulse">
                LIVE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {emergencyDoctors.map((doctor) => (
                <Card key={doctor.id} className="bg-gray-800/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{doctor.name}</h4>
                        <p className="text-sm text-gray-400">{doctor.specialty}</p>
                        <p className="text-xs text-gray-500">{doctor.hospital}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-600 text-xs">
                          Online
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">{doctor.responseTime}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-white">{doctor.experience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Emergency Fee:</span>
                        <span className="text-green-400">₹{doctor.emergencyFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rating:</span>
                        <span className="text-yellow-400">⭐ {doctor.rating}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleEmergencyCall(doctor.id)}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700"
                      disabled={!isKycVerified && emergencyAssessment?.level !== 'CRITICAL'}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Emergency Call Now
                    </Button>
                    
                    <p className="text-xs text-center text-gray-400 mt-2">
                      EMI: ₹{Math.ceil(doctor.emergencyFee/3)}/month for 3 months
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KYC Modal */}
      {kycMode && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-900 border-emerald-500/50">
            <CardHeader>
              <CardTitle className="text-emerald-400 text-center">
                <ShieldCheck className="h-6 w-6 mx-auto mb-2" />
                Emergency KYC Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-500/50 bg-blue-900/20">
                <AlertDescription className="text-blue-200">
                  Quick verification required for emergency access. ₹1 will be charged for identity verification.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Aadhaar Number
                  </label>
                  <Input
                    value={kycData.aadhaar}
                    onChange={(e) => setKycData({...kycData, aadhaar: e.target.value})}
                    placeholder="1234 5678 9012"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    PAN Number
                  </label>
                  <Input
                    value={kycData.pan}
                    onChange={(e) => setKycData({...kycData, pan: e.target.value})}
                    placeholder="ABCDE1234F"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <Input
                    value={kycData.phone}
                    onChange={(e) => setKycData({...kycData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleKycSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!kycData.aadhaar || !kycData.pan || !kycData.phone}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Verify & Pay ₹1
                </Button>
                <Button 
                  onClick={() => setKycMode(false)}
                  variant="outline"
                  className="border-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Call Modal */}
      {emergencyMode && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-red-950/90 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-3 animate-pulse" />
                Connecting to Emergency Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="animate-pulse">
                <div className="h-16 w-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <p className="text-white text-lg">Connecting to nearest available doctor...</p>
                <p className="text-red-300">Estimated wait time: {"<"} 2 minutes</p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">While you wait:</h4>
                <ul className="text-sm text-gray-300 space-y-1 text-left">
                  <li>• Stay calm and breathe steadily</li>
                  <li>• Have your medical history ready</li>
                  <li>• Note down current symptoms</li>
                  <li>• Keep emergency contacts handy</li>
                </ul>
              </div>

              <Button 
                onClick={() => setEmergencyMode(false)}
                variant="outline"
                className="border-gray-500"
              >
                Cancel Call
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Emergency Video Call Component */}
      <EmergencyVideoCall
        isActive={isVideoCallActive}
        onCallEnd={handleCallEnd}
        patientInfo={{
          name: user?.name || 'Patient',
          age: '35',
          symptoms: emergencyAssessment?.symptoms || 'Emergency situation'
        }}
        emergencyLevel={emergencyAssessment?.level || 'CRITICAL'}
        doctorInfo={connectedDoctor}
      />
    </div>
  );
};

export default PatientEmergencyDashboard;