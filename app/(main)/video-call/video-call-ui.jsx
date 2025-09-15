"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  Phone,
  Video,
  Clock,
  Heart,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import VonageVideoCall from "@/components/vonage-video-call";
import HealthMonitoringPanel from "@/components/health-monitoring-panel";
import TranslationPanel from "@/components/translation-panel";
import EmotionAnalysisPanel from "@/components/emotion-analysis-panel";

export default function EmergencyVideoCall({ sessionId, token, appointmentId }) {
  const [isEmergencyCall, setIsEmergencyCall] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [emergencyType, setEmergencyType] = useState('general');
  const [activePanel, setActivePanel] = useState('monitoring'); // 'monitoring', 'translation', 'emotion'
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [emotionAnalysisEnabled, setEmotionAnalysisEnabled] = useState(true);
  const videoRef = useRef(null);

  const router = useRouter();

  // Emergency call types
  const emergencyTypes = {
    general: {
      icon: AlertTriangle,
      label: 'General Emergency',
      color: 'text-red-500',
      bgColor: 'bg-red-50 border-red-200'
    },
    cardiac: {
      icon: Heart,
      label: 'Cardiac Emergency',
      color: 'text-red-600',
      bgColor: 'bg-red-100 border-red-300'
    },
    respiratory: {
      icon: Activity,
      label: 'Respiratory Emergency',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    }
  };

  const handleCallStart = () => {
    setCallStarted(true);
    toast.success("Connected to emergency medical consultation");
  };

  const handleCallEnd = () => {
    setCallStarted(false);
    toast.info("Emergency consultation ended");
    router.push("/appointments");
  };

  // If call hasn't started, show emergency pre-call interface
  if (!callStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              {/* Emergency header */}
              <div className="flex items-center justify-center space-x-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-red-800">
                    Emergency Video Consultation
                  </h1>
                  <p className="text-red-600">
                    Connecting you to medical assistance
                  </p>
                </div>
              </div>

              {/* Emergency type selection */}
              <div className="space-y-3">
                <p className="text-sm text-red-700 font-medium">
                  Select the type of emergency:
                </p>
                <div className="grid gap-3">
                  {Object.entries(emergencyTypes).map(([key, type]) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setEmergencyType(key)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          emergencyType === key
                            ? 'border-red-400 bg-red-100'
                            : 'border-red-200 bg-white hover:border-red-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 ${type.color}`} />
                          <span className="font-medium text-gray-800">
                            {type.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Important information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-amber-800">
                    <p className="font-medium mb-1">Before starting the call:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Ensure you have a stable internet connection</li>
                      <li>• Have your medical history or medications ready if possible</li>
                      <li>• Be in a quiet, well-lit environment</li>
                      <li>• If this is a life-threatening emergency, call 911 immediately</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Start call button */}
              <div className="space-y-4">
                <Button
                  onClick={handleCallStart}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Start Emergency Video Call
                </Button>
                
                <Button
                  onClick={() => router.push("/appointments")}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-red-600 bg-red-100 p-3 rounded-lg">
                This service provides medical consultation but is not a replacement 
                for emergency services. For life-threatening emergencies, call 911 immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the video call interface with emergency context
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Emergency header */}
      <div className="bg-red-600 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">Emergency Consultation</h1>
              <p className="text-sm opacity-90">
                {emergencyTypes[emergencyType].label}
              </p>
            </div>
          </div>
          <div className="text-sm text-right">
            <p className="opacity-90">Help is on the way</p>
            <p className="text-xs">Stay calm and follow instructions</p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 grid lg:grid-cols-4 gap-0">
        {/* Video call section */}
        <div className="lg:col-span-3">
          <VonageVideoCall
            sessionId={sessionId}
            appointmentId={appointmentId}
            userRole="patient"
            onCallEnd={handleCallEnd}
            className="h-screen"
            ref={videoRef}
          />
        </div>

        {/* AI Features Panel */}
        <div className="lg:col-span-1 bg-white overflow-y-auto max-h-screen">
          {/* Panel Navigation */}
          <div className="bg-gray-50 border-b p-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActivePanel('monitoring')}
                className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                  activePanel === 'monitoring'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                🏥 Health
              </button>
              <button
                onClick={() => setActivePanel('emotion')}
                className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                  activePanel === 'emotion'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                😊 Emotion
              </button>
              <button
                onClick={() => setActivePanel('translation')}
                className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                  activePanel === 'translation'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                🌍 Translate
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-4">
            {activePanel === 'monitoring' && (
              <HealthMonitoringPanel 
                videoRef={videoRef}
                isCallActive={callStarted}
              />
            )}
            
            {activePanel === 'emotion' && (
              <EmotionAnalysisPanel
                videoRef={videoRef}
                isCallActive={callStarted}
                isVisible={true}
              />
            )}
            
            {activePanel === 'translation' && (
              <TranslationPanel
                isVisible={true}
                onTranslationUpdate={(translation) => {
                  // Handle translation updates during call
                  console.log('Translation:', translation);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
