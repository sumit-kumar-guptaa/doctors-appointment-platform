"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Users,
  Clock,
  AlertTriangle,
  Camera,
  Settings,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const EmergencyVideoCall = ({ 
  isActive, 
  onCallEnd, 
  patientInfo, 
  emergencyLevel = "CRITICAL",
  doctorInfo 
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: '120 bpm',
    bloodPressure: '140/90',
    temperature: '99.2°F',
    oxygenSat: '95%'
  });

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Simulate connection establishment
      setTimeout(() => setConnectionStatus('connected'), 2000);
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Initialize video streams (mock)
      initializeVideoStreams();
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isActive]);

  const initializeVideoStreams = async () => {
    try {
      // Mock video stream initialization
      console.log('Initializing video streams for emergency call...');
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setConnectionStatus('disconnected');
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    onCallEnd();
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        text: newMessage,
        sender: 'patient',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewMessage('');
    }
  };

  const getEmergencyColor = () => {
    switch (emergencyLevel) {
      case 'CRITICAL': return 'text-red-600 bg-red-100 border-red-300';
      case 'URGENT': return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <Card className={`${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh]'} overflow-hidden border-red-500`}>
        {/* Call Header */}
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Emergency Call</span>
                <Badge className={`${getEmergencyColor()} text-xs`}>
                  {emergencyLevel}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-red-100">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatCallDuration(callDuration)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
                {connectionStatus}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
            {/* Video Call Area */}
            <div className="lg:col-span-3 relative bg-gray-900 flex flex-col">
              {/* Remote Video (Doctor) */}
              <div className="flex-1 relative">
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                {connectionStatus === 'connecting' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                      <p>Connecting to emergency doctor...</p>
                    </div>
                  </div>
                )}
                
                {/* Doctor Info Overlay */}
                {doctorInfo && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">{doctorInfo.name?.[0] || 'D'}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{doctorInfo.name || 'Dr. Emergency'}</p>
                        <p className="text-xs text-gray-300">{doctorInfo.specialty || 'Emergency Medicine'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video (Patient) - Picture in Picture */}
              <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  You
                </div>
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black bg-opacity-75 p-4 rounded-full">
                <Button
                  variant={isAudioOn ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className="rounded-full w-12 h-12"
                >
                  {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant={isVideoOn ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="rounded-full w-12 h-12"
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>

                <Button
                  variant={isMuted ? "destructive" : "default"}
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full w-12 h-12"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setShowChat(!showChat)}
                  className="rounded-full w-12 h-12"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Side Panel */}
            <div className="bg-white border-l border-gray-200 flex flex-col">
              {/* Patient Info */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
                {patientInfo && (
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {patientInfo.name}</p>
                    <p><strong>Age:</strong> {patientInfo.age}</p>
                    <p><strong>Emergency:</strong> {patientInfo.symptoms}</p>
                  </div>
                )}
              </div>

              {/* Vital Signs */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Vital Signs</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-red-600 font-medium">Heart Rate</p>
                    <p className="text-red-800">{vitalSigns.heartRate}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-blue-600 font-medium">BP</p>
                    <p className="text-blue-800">{vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <p className="text-yellow-600 font-medium">Temp</p>
                    <p className="text-yellow-800">{vitalSigns.temperature}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-green-600 font-medium">O2 Sat</p>
                    <p className="text-green-800">{vitalSigns.oxygenSat}</p>
                  </div>
                </div>
              </div>

              {/* Chat */}
              {showChat && (
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Chat</h3>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className="mb-2">
                        <div className={`p-2 rounded text-sm ${
                          msg.sender === 'patient' 
                            ? 'bg-blue-100 text-blue-900 ml-8' 
                            : 'bg-gray-100 text-gray-900 mr-8'
                        }`}>
                          <p>{msg.text}</p>
                          <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={sendMessage}>Send</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Actions */}
              {!showChat && (
                <div className="p-4 space-y-3">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Call Ambulance
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Add Specialist
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Call Settings
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyVideoCall;