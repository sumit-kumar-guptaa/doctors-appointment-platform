"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Phone, 
  MessageCircle, 
  AlertTriangle, 
  Heart, 
  Activity,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  User,
  FileText,
  Zap,
  Ambulance,
  Stethoscope
} from "lucide-react";

const EMERGENCY_SYMPTOMS = [
  { 
    id: 'chest_pain', 
    text: 'Chest Pain/Heart Attack',
    severity: 'critical',
    icon: <Heart className="h-4 w-4" />
  },
  { 
    id: 'breathing', 
    text: 'Difficulty Breathing',
    severity: 'critical',
    icon: <Activity className="h-4 w-4" />
  },
  { 
    id: 'stroke', 
    text: 'Stroke Symptoms',
    severity: 'critical',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  { 
    id: 'accident', 
    text: 'Accident/Injury',
    severity: 'urgent',
    icon: <Ambulance className="h-4 w-4" />
  },
  { 
    id: 'allergic', 
    text: 'Severe Allergic Reaction',
    severity: 'critical',
    icon: <AlertTriangle className="h-4 w-4" />
  },
  { 
    id: 'other', 
    text: 'Other Emergency',
    severity: 'urgent',
    icon: <Stethoscope className="h-4 w-4" />
  }
];

const VERIFICATION_DOCS = [
  { id: 'aadhar', label: 'Aadhar Card', required: true },
  { id: 'pan', label: 'PAN Card', required: true },
  { id: 'insurance', label: 'Health Insurance (Optional)', required: false }
];

export const PatientEmergencyDashboard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState('assessment');
  const [emergencyData, setEmergencyData] = useState({
    symptoms: [],
    severity: null,
    description: '',
    patientInfo: {
      name: '',
      age: '',
      gender: '',
      phone: '',
      address: '',
      emergencyContact: ''
    },
    verification: {
      aadhar: '',
      pan: '',
      insurance: ''
    },
    location: null,
    isEmergency: false
  });
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // AI-powered emergency assessment
  const assessEmergencyLevel = (symptoms, description) => {
    const criticalSymptoms = symptoms.filter(s => 
      EMERGENCY_SYMPTOMS.find(es => es.id === s)?.severity === 'critical'
    );
    
    const emergencyKeywords = [
      'heart attack', 'chest pain', 'can\'t breathe', 'stroke', 
      'unconscious', 'severe pain', 'bleeding', 'overdose'
    ];
    
    const hasEmergencyKeywords = emergencyKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );

    return criticalSymptoms.length > 0 || hasEmergencyKeywords;
  };

  // Handle symptom selection
  const handleSymptomSelect = (symptomId) => {
    setEmergencyData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
  };

  // Handle emergency assessment
  const handleAssessment = async () => {
    const isEmergency = assessEmergencyLevel(emergencyData.symptoms, emergencyData.description);
    
    setEmergencyData(prev => ({
      ...prev,
      isEmergency,
      severity: isEmergency ? 'critical' : 'normal'
    }));

    if (isEmergency) {
      // Skip verification for critical emergencies
      setCurrentStep('emergency_call');
      await fetchEmergencyDoctors();
    } else {
      // Redirect to chat for non-emergency cases
      setCurrentStep('chat_consultation');
    }
  };

  // Fetch available emergency doctors
  const fetchEmergencyDoctors = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to fetch emergency doctors
      const mockDoctors = [
        {
          id: 1,
          name: "Dr. Sarah Johnson",
          specialization: "Emergency Medicine",
          rating: 4.9,
          responseTime: "< 2 minutes",
          isOnline: true,
          image: "/api/placeholder/60/60"
        },
        {
          id: 2,
          name: "Dr. Michael Chen",
          specialization: "Cardiology",
          rating: 4.8,
          responseTime: "< 3 minutes",
          isOnline: true,
          image: "/api/placeholder/60/60"
        },
        {
          id: 3,
          name: "Dr. Emily Rodriguez",
          specialization: "Internal Medicine",
          rating: 4.7,
          responseTime: "< 5 minutes",
          isOnline: true,
          image: "/api/placeholder/60/60"
        }
      ];
      
      setAvailableDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching emergency doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle KYC verification
  const handleKYCVerification = async () => {
    setIsLoading(true);
    try {
      // Simulate KYC verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process ₹1 payment for verification
      await processVerificationPayment();
      
      setCurrentStep('doctor_selection');
      await fetchEmergencyDoctors();
    } catch (error) {
      console.error('KYC verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Process verification payment
  const processVerificationPayment = async () => {
    // Integrate with payment gateway for ₹1 verification
    console.log('Processing ₹1 verification payment...');
    return Promise.resolve();
  };

  // Handle emergency call initiation
  const initiateEmergencyCall = async (doctorId) => {
    setIsLoading(true);
    try {
      const doctor = availableDoctors.find(d => d.id === doctorId);
      setSelectedDoctor(doctor);
      
      // In real implementation, this would initiate a video/audio call
      console.log('Initiating emergency call with doctor:', doctor.name);
      
      setCurrentStep('call_active');
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start chat consultation
  const startChatConsultation = () => {
    setChatActive(true);
    setChatMessages([
      {
        type: 'system',
        message: 'Hello! I\'m here to help you with your medical concerns. Please describe your symptoms in detail.',
        timestamp: new Date()
      }
    ]);
  };

  // Handle chat message
  const handleChatMessage = async (message) => {
    const newMessage = {
      type: 'user',
      message,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response or doctor chat
    setTimeout(() => {
      const aiResponse = {
        type: 'ai',
        message: 'Based on your symptoms, I recommend scheduling a consultation with a specialist. Would you like me to help you book an appointment?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-4xl h-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Emergency Medical Assistant</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-red-700">
              ✕
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Step: Symptom Assessment */}
            {currentStep === 'assessment' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Emergency Assessment</h3>
                  <p className="text-muted-foreground">
                    Please select your symptoms and describe your situation
                  </p>
                </div>

                {/* Symptom Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Select Your Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {EMERGENCY_SYMPTOMS.map((symptom) => (
                        <Button
                          key={symptom.id}
                          variant={emergencyData.symptoms.includes(symptom.id) ? "default" : "outline"}
                          className={`justify-start gap-3 h-auto p-4 ${
                            symptom.severity === 'critical' 
                              ? 'border-red-300 hover:border-red-400' 
                              : 'border-orange-300 hover:border-orange-400'
                          }`}
                          onClick={() => handleSymptomSelect(symptom.id)}
                        >
                          {symptom.icon}
                          <span>{symptom.text}</span>
                          <Badge 
                            variant={symptom.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="ml-auto"
                          >
                            {symptom.severity}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Describe Your Situation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Please describe your symptoms, pain level, when it started, and any other relevant details..."
                      value={emergencyData.description}
                      onChange={(e) => setEmergencyData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleAssessment}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={emergencyData.symptoms.length === 0 || !emergencyData.description}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Assess Emergency Level
                </Button>
              </div>
            )}

            {/* Step: Emergency Call Interface */}
            {currentStep === 'emergency_call' && (
              <div className="space-y-6">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>EMERGENCY DETECTED</strong> - Connecting you directly to emergency doctors. 
                    KYC verification will be completed after your immediate care.
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Emergency Doctors Available</h3>
                  <p className="text-muted-foreground">Instant connection to certified emergency physicians</p>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Finding available emergency doctors...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableDoctors.map((doctor) => (
                      <Card key={doctor.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img 
                              src={doctor.image} 
                              alt={doctor.name}
                              className="w-16 h-16 rounded-full"
                            />
                            <div>
                              <h4 className="font-semibold">{doctor.name}</h4>
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  ⭐ {doctor.rating}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {doctor.responseTime}
                                </Badge>
                                {doctor.isOnline && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    Online
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => initiateEmergencyCall(doctor.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Emergency Call
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Chat Consultation for Non-Emergency */}
            {currentStep === 'chat_consultation' && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Based on your symptoms, we recommend starting with a chat consultation. 
                    This will help determine if immediate doctor attention is needed.
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Medical Chat Consultation</h3>
                  <p className="text-muted-foreground">
                    Get immediate guidance from our AI assistant and connect with doctors if needed
                  </p>
                </div>

                {!chatActive ? (
                  <Card className="p-6 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <h4 className="text-xl font-semibold mb-2">Start Medical Consultation</h4>
                    <p className="text-muted-foreground mb-4">
                      Our AI-powered medical assistant will help assess your symptoms and 
                      determine the best course of action.
                    </p>
                    <Button onClick={startChatConsultation} size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chat Consultation
                    </Button>
                  </Card>
                ) : (
                  <ChatInterface 
                    messages={chatMessages}
                    onSendMessage={handleChatMessage}
                  />
                )}
              </div>
            )}

            {/* Step: KYC Verification */}
            {currentStep === 'kyc_verification' && (
              <KYCVerificationForm 
                emergencyData={emergencyData}
                setEmergencyData={setEmergencyData}
                onVerify={handleKYCVerification}
                isLoading={isLoading}
              />
            )}

            {/* Step: Active Emergency Call */}
            {currentStep === 'call_active' && selectedDoctor && (
              <ActiveEmergencyCall 
                doctor={selectedDoctor}
                onEndCall={() => setCurrentStep('call_ended')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface = ({ messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Medical Chat Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-xs' 
                  : 'bg-gray-100 mr-auto max-w-xs'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your symptoms..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};

// KYC Verification Component
const KYCVerificationForm = ({ emergencyData, setEmergencyData, onVerify, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-16 w-16 mx-auto mb-4 text-green-600" />
        <h3 className="text-2xl font-bold mb-2">Identity Verification</h3>
        <p className="text-muted-foreground">
          Quick KYC verification required for emergency medical services
        </p>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name"
              value={emergencyData.patientInfo.name}
              onChange={(e) => setEmergencyData(prev => ({
                ...prev,
                patientInfo: { ...prev.patientInfo, name: e.target.value }
              }))}
            />
            <Input
              placeholder="Age"
              type="number"
              value={emergencyData.patientInfo.age}
              onChange={(e) => setEmergencyData(prev => ({
                ...prev,
                patientInfo: { ...prev.patientInfo, age: e.target.value }
              }))}
            />
            <Input
              placeholder="Phone Number"
              value={emergencyData.patientInfo.phone}
              onChange={(e) => setEmergencyData(prev => ({
                ...prev,
                patientInfo: { ...prev.patientInfo, phone: e.target.value }
              }))}
            />
            <Input
              placeholder="Emergency Contact"
              value={emergencyData.patientInfo.emergencyContact}
              onChange={(e) => setEmergencyData(prev => ({
                ...prev,
                patientInfo: { ...prev.patientInfo, emergencyContact: e.target.value }
              }))}
            />
          </div>
          <Textarea
            placeholder="Address"
            value={emergencyData.patientInfo.address}
            onChange={(e) => setEmergencyData(prev => ({
              ...prev,
              patientInfo: { ...prev.patientInfo, address: e.target.value }
            }))}
          />
        </CardContent>
      </Card>

      {/* Document Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {VERIFICATION_DOCS.map((doc) => (
            <div key={doc.id}>
              <label className="block text-sm font-medium mb-1">
                {doc.label} {doc.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                placeholder={`Enter ${doc.label} number`}
                value={emergencyData.verification[doc.id]}
                onChange={(e) => setEmergencyData(prev => ({
                  ...prev,
                  verification: { ...prev.verification, [doc.id]: e.target.value }
                }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Verification Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              A ₹1 verification charge will be applied to confirm your identity. 
              EMI options available for consultation fees.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            This helps us verify your identity and provide secure medical services. 
            The amount will be refunded if the consultation doesn't proceed.
          </p>
        </CardContent>
      </Card>

      <Button 
        onClick={onVerify}
        size="lg"
        className="w-full"
        disabled={isLoading || !emergencyData.verification.aadhar || !emergencyData.verification.pan}
      >
        {isLoading ? (
          <>
            <Activity className="h-4 w-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Complete Verification (₹1)
          </>
        )}
      </Button>
    </div>
  );
};

// Active Emergency Call Component
const ActiveEmergencyCall = ({ doctor, onEndCall }) => {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-6">
      <div className="bg-red-600 text-white p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-2">Emergency Call Active</h3>
        <p className="text-red-100">Connected to {doctor.name}</p>
        <div className="text-3xl font-mono mt-4">{formatTime(callDuration)}</div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src={doctor.image} 
              alt={doctor.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="text-left">
              <h4 className="text-xl font-semibold">{doctor.name}</h4>
              <p className="text-muted-foreground">{doctor.specialization}</p>
              <Badge variant="default" className="bg-green-600 mt-2">
                <Activity className="h-3 w-3 mr-1" />
                Live Call
              </Badge>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="destructive" size="lg" onClick={onEndCall}>
              <Phone className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This call is being recorded for quality and legal purposes. 
          Emergency services will be notified if required.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PatientEmergencyDashboard;