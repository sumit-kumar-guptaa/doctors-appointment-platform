"use client";
import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  AlertTriangle,
  Clock,
  Heart,
  Zap,
  Shield,
  Video,
  MessageSquare,
  Users,
  CheckCircle,
  Activity,
  Stethoscope,
  UserCheck,
  MapPin,
  Star,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import EmergencyVideoCall from './emergency-video-call';

const EmergencyCallButton = ({ user }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDoctor, setConnectedDoctor] = useState(null);

  const handleEmergencyCall = () => {
    setIsConnecting(true);
    
    // Simulate finding an emergency doctor
    setTimeout(() => {
      const emergencyDoctor = {
        id: 'emergency-001',
        name: 'Dr. Sarah Emergency',
        specialty: 'Emergency Medicine',
        experience: '15 years',
        rating: 4.9,
        isOnline: true
      };
      
      setConnectedDoctor(emergencyDoctor);
      setIsConnecting(false);
      setIsCallActive(true);
    }, 3000);
  };

  const handleCallEnd = () => {
    setIsCallActive(false);
    setConnectedDoctor(null);
    setIsConnecting(false);
  };

  // Show video call if active
  if (isCallActive) {
    return (
      <EmergencyVideoCall
        isActive={isCallActive}
        onCallEnd={handleCallEnd}
        patientInfo={{
          name: user?.name || 'Patient',
          age: '35',
          symptoms: 'Emergency medical assistance needed'
        }}
        emergencyLevel="CRITICAL"
        doctorInfo={connectedDoctor}
      />
    );
  }

  // Show connecting screen
  if (isConnecting) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        <Card className="w-full max-w-md bg-red-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="flex flex-col items-center text-red-100">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 animate-pulse" />
              Connecting to Emergency Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-white animate-bounce" />
              </div>
              <p className="text-white text-lg">Finding nearest available doctor...</p>
              <p className="text-red-200">Estimated wait time: &lt; 30 seconds</p>
            </div>
            
            <div className="bg-red-800/50 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Please stay on the line:</h4>
              <ul className="text-sm text-red-200 space-y-1 text-left">
                <li>• Keep calm and breathe steadily</li>
                <li>• Have your location ready</li>
                <li>• Note current symptoms</li>
                <li>• Emergency services on standby</li>
              </ul>
            </div>

            <Button 
              onClick={() => {
                setIsConnecting(false);
                setIsCallActive(false);
              }}
              variant="outline"
              className="border-red-400 text-red-200 hover:bg-red-700"
            >
              Cancel Emergency Call
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Hospital-Grade Header */}
      <div className="bg-card border border-purple-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-orange-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Emergency Medical Services</h1>
                <p className="text-purple-100 text-sm">24/7 Critical Care Response Team</p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white border-0">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">27</div>
              <div className="text-xs text-purple-700 font-medium">Doctors Online</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">18s</div>
              <div className="text-xs text-orange-700 font-medium">Avg Response</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">99.7%</div>
              <div className="text-xs text-purple-700 font-medium">Success Rate</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">4.9</div>
              <div className="text-xs text-orange-700 font-medium">Patient Rating</div>
            </div>
          </div>

          <div className="text-center mb-6">
            <Button 
              onClick={handleEmergencyCall}
              className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              <Phone className="h-5 w-5 mr-3" />
              Connect to Emergency Doctor
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Instant connection • HD Video • Certified Emergency Physicians
            </p>
          </div>
        </div>
      </div>

      {/* Professional Emergency Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Emergency */}
        <Card className="border-purple-200 hover:border-purple-300 transition-colors shadow-md hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Emergency
              </CardTitle>
              <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                Priority 1
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Chest pain, heart attack symptoms
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Severe breathing difficulties
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Loss of consciousness
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Severe bleeding or trauma
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                &lt; 15 sec response
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Senior ER Doctors
              </span>
            </div>
            
            <Button 
              onClick={handleEmergencyCall}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              Emergency Call
            </Button>
          </CardContent>
        </Card>

        {/* Urgent Care */}
        <Card className="border-orange-200 hover:border-orange-300 transition-colors shadow-md hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Urgent Care
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                Priority 2
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Severe pain or discomfort
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                High fever or infection signs
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Persistent vomiting
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Sudden vision changes
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                &lt; 30 sec response
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Specialist Doctors
              </span>
            </div>
            
            <Button 
              onClick={handleEmergencyCall}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              Urgent Consultation
            </Button>
          </CardContent>
        </Card>

        {/* Medical Consultation */}
        <Card className="border-orange-200 hover:border-orange-300 transition-colors shadow-md hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Consultation
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                Standard
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Medical advice needed
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Prescription consultation
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Follow-up questions
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                General health concerns
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                &lt; 1 min response
              </span>
              <span className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Licensed Doctors
              </span>
            </div>
            
            <Button 
              onClick={handleEmergencyCall}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              Start Consultation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Professional Emergency Information */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Care Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-purple-500" />
                When to Call Emergency
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Life-threatening conditions requiring immediate medical attention</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Severe symptoms that cannot wait for regular appointment</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sudden onset of serious medical symptoms</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-500" />
                Our Emergency Team
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Board-certified emergency medicine physicians</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Average 15+ years of emergency care experience</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Connected to local emergency services network</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyCallButton;