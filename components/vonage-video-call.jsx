"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Settings,
  Users,
  Record,
  StopCircle,
  Screen,
  ScreenOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  CameraOff,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Load Vonage Video API SDK
const loadVonageSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.OT) {
      resolve(window.OT);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://static.opentok.com/v2/js/opentok.min.js';
    script.onload = () => resolve(window.OT);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const VonageVideoCall = ({ 
  appointmentId, 
  sessionId: propSessionId, 
  userRole = 'patient',
  onCallEnd,
  className = '' 
}) => {
  const { user } = useUser();
  
  // State management
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [sessionData, setSessionData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Call controls state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  
  // Refs
  const publisherRef = useRef(null);
  const subscribersRef = useRef({});
  const callStartTime = useRef(null);
  const durationInterval = useRef(null);

  // Initialize video session
  const initializeSession = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Load Vonage SDK
      const OT = await loadVonageSDK();

      // Get session data from API
      let endpoint = '/api/vonage-video';
      if (appointmentId) {
        endpoint += `?appointmentId=${appointmentId}`;
      } else if (propSessionId) {
        endpoint += `?sessionId=${propSessionId}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize session');
      }

      setSessionData(data.session);

      // Initialize session
      const otSession = OT.initSession(data.session.applicationId, data.session.sessionId);

      // Session event listeners
      otSession.on('streamCreated', (event) => {
        console.log('Stream created:', event.stream);
        const subscriber = otSession.subscribe(
          event.stream,
          null,
          {
            insertMode: 'append',
            width: '100%',
            height: '100%',
            style: {
              buttonDisplayMode: 'off'
            }
          },
          (error) => {
            if (error) {
              console.error('Subscribe error:', error);
            } else {
              setSubscribers(prev => [...prev, subscriber]);
              setParticipantCount(prev => prev + 1);
            }
          }
        );
      });

      otSession.on('streamDestroyed', (event) => {
        console.log('Stream destroyed:', event.stream);
        setSubscribers(prev => prev.filter(sub => sub.stream.streamId !== event.stream.streamId));
        setParticipantCount(prev => Math.max(0, prev - 1));
      });

      otSession.on('sessionConnected', (event) => {
        console.log('Session connected:', event);
        setIsConnected(true);
        setIsConnecting(false);
        callStartTime.current = Date.now();
        
        // Start call duration timer
        durationInterval.current = setInterval(() => {
          if (callStartTime.current) {
            setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
          }
        }, 1000);

        // Initialize publisher
        const pub = OT.initPublisher(
          publisherRef.current,
          {
            insertMode: 'replace',
            width: '100%',
            height: '100%',
            name: user?.name || 'User',
            publishAudio: isAudioEnabled,
            publishVideo: isVideoEnabled,
            style: {
              buttonDisplayMode: 'off'
            }
          },
          (error) => {
            if (error) {
              console.error('Publisher error:', error);
              setError('Failed to initialize camera/microphone');
            } else {
              setPublisher(pub);
              otSession.publish(pub, (publishError) => {
                if (publishError) {
                  console.error('Publish error:', publishError);
                  setError('Failed to publish video stream');
                }
              });
            }
          }
        );
      });

      otSession.on('sessionDisconnected', (event) => {
        console.log('Session disconnected:', event);
        setIsConnected(false);
        cleanup();
      });

      setSession(otSession);

      // Connect to session
      otSession.connect(data.session.token, (connectError) => {
        if (connectError) {
          console.error('Connect error:', connectError);
          setError(`Connection failed: ${connectError.message}`);
          setIsConnecting(false);
        }
      });

    } catch (err) {
      console.error('Session initialization error:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [appointmentId, propSessionId, user, isAudioEnabled, isVideoEnabled]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    if (publisher) {
      publisher.destroy();
      setPublisher(null);
    }
    
    subscribers.forEach(subscriber => subscriber.destroy());
    setSubscribers([]);
    
    if (session) {
      session.disconnect();
      setSession(null);
    }
    
    callStartTime.current = null;
    setCallDuration(0);
    setIsConnected(false);
    setParticipantCount(0);
  }, [session, publisher, subscribers]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (publisher) {
      const newState = !isVideoEnabled;
      publisher.publishVideo(newState);
      setIsVideoEnabled(newState);
    }
  }, [publisher, isVideoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (publisher) {
      const newState = !isAudioEnabled;
      publisher.publishAudio(newState);
      setIsAudioEnabled(newState);
    }
  }, [publisher, isAudioEnabled]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!session || !publisher) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const OT = window.OT;
        const screenPublisher = OT.initPublisher(
          null,
          {
            videoSource: 'screen',
            publishAudio: true,
            publishVideo: true,
            maxResolution: { width: 1920, height: 1080 },
            name: `${user?.name || 'User'} (Screen)`
          },
          (error) => {
            if (error) {
              console.error('Screen share error:', error);
              setError('Screen sharing failed. Please check permissions.');
            } else {
              session.publish(screenPublisher, (publishError) => {
                if (publishError) {
                  console.error('Screen share publish error:', publishError);
                } else {
                  setIsScreenSharing(true);
                }
              });
            }
          }
        );
      } else {
        // Stop screen sharing - implementation depends on how you track screen publisher
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Screen share toggle error:', err);
      setError('Failed to toggle screen sharing');
    }
  }, [session, publisher, isScreenSharing, user]);

  // Start/Stop recording
  const toggleRecording = useCallback(async () => {
    if (!sessionData || !appointmentId) return;

    try {
      const response = await fetch('/api/vonage-video', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          action: isRecording ? 'stop' : 'start',
          appointmentId: appointmentId
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsRecording(!isRecording);
      } else {
        setError('Recording control failed');
      }
    } catch (err) {
      console.error('Recording toggle error:', err);
      setError('Failed to control recording');
    }
  }, [sessionData, appointmentId, isRecording]);

  // End call
  const endCall = useCallback(() => {
    cleanup();
    if (onCallEnd) {
      onCallEnd();
    }
  }, [cleanup, onCallEnd]);

  // Format call duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize on mount
  useEffect(() => {
    if (user && (appointmentId || propSessionId)) {
      initializeSession();
    }

    return cleanup;
  }, [user, appointmentId, propSessionId, initializeSession, cleanup]);

  // Loading state
  if (isConnecting) {
    return (
      <Card className={`w-full h-96 flex items-center justify-center ${className}`}>
        <CardContent className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connecting to video call...</h3>
          <p className="text-gray-600">Please wait while we establish the connection</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold">Video Call Error</p>
                <p className="text-sm">{error}</p>
                <Button onClick={initializeSession} size="sm" className="w-full">
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`vonage-video-container ${className}`}>
      {/* Video Call Interface */}
      <Card className="w-full h-full min-h-[600px] bg-black relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Badge 
              className={`${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Connecting...
                </>
              )}
            </Badge>
            
            {isConnected && (
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(callDuration)}
              </Badge>
            )}
            
            <Badge variant="outline" className="bg-white/10 text-white border-white/30">
              <Users className="h-3 w-3 mr-1" />
              {participantCount + 1}
            </Badge>
          </div>

          {isRecording && (
            <Badge className="bg-red-600 text-white animate-pulse">
              <Record className="h-3 w-3 mr-1" />
              Recording
            </Badge>
          )}
        </div>

        {/* Main video area */}
        <div className="relative w-full h-full">
          {/* Subscribers (remote participants) */}
          <div className="subscribers-container absolute inset-0">
            {subscribers.map((subscriber, index) => (
              <div
                key={subscriber.stream.streamId}
                className="subscriber-video w-full h-full"
                ref={el => {
                  if (el && !subscribersRef.current[subscriber.stream.streamId]) {
                    subscribersRef.current[subscriber.stream.streamId] = el;
                    subscriber.element = el;
                  }
                }}
              />
            ))}
          </div>

          {/* Publisher (local video) - Picture in Picture */}
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20 z-10">
            <div
              ref={publisherRef}
              className="w-full h-full"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <CameraOff className="h-8 w-8 text-white/60" />
              </div>
            )}
          </div>

          {/* No participants message */}
          {subscribers.length === 0 && isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="h-16 w-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold mb-2">Waiting for participants</h3>
                <p className="text-white/60">Invite others to join this video call</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center space-x-3">
            {/* Audio toggle */}
            <Button
              onClick={toggleAudio}
              size="lg"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            {/* Video toggle */}
            <Button
              onClick={toggleVideo}
              size="lg"
              variant={isVideoEnabled ? "secondary" : "destructive"}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            {/* Screen share */}
            <Button
              onClick={toggleScreenShare}
              size="lg"
              variant={isScreenSharing ? "default" : "secondary"}
              className="rounded-full w-12 h-12 p-0"
            >
              {isScreenSharing ? (
                <ScreenOff className="h-5 w-5" />
              ) : (
                <Screen className="h-5 w-5" />
              )}
            </Button>

            {/* Recording (only for appointments) */}
            {appointmentId && (
              <Button
                onClick={toggleRecording}
                size="lg"
                variant={isRecording ? "destructive" : "secondary"}
                className="rounded-full w-12 h-12 p-0"
              >
                {isRecording ? (
                  <StopCircle className="h-5 w-5" />
                ) : (
                  <Record className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* End call */}
            <Button
              onClick={endCall}
              size="lg"
              variant="destructive"
              className="rounded-full w-12 h-12 p-0 ml-6"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VonageVideoCall;