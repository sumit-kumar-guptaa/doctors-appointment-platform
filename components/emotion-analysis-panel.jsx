'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Heart, 
  Eye, 
  Mic, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Smile,
  Frown
} from 'lucide-react';

export default function EmotionAnalysisPanel({ videoRef, isActive }) {
  const [emotionEngine, setEmotionEngine] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    initializeEmotionEngine();
    
    // Listen for mental health alerts
    const handleAlert = (event) => {
      setAlerts(prev => [...prev.slice(-4), event.detail]);
    };
    
    window.addEventListener('mentalHealthAlert', handleAlert);
    
    return () => {
      window.removeEventListener('mentalHealthAlert', handleAlert);
      if (currentSession) {
        stopAnalysis();
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && videoRef?.current && emotionEngine && !isAnalyzing) {
      startAnalysis();
    } else if (!isActive && isAnalyzing) {
      stopAnalysis();
    }
  }, [isActive, emotionEngine, videoRef?.current]);

  const initializeEmotionEngine = async () => {
    try {
      const { default: AIEmotionEngine } = await import('@/lib/ai-emotion-analysis');
      await AIEmotionEngine.initialize();
      setEmotionEngine(AIEmotionEngine);
    } catch (error) {
      console.error('Failed to initialize emotion engine:', error);
    }
  };

  const startAnalysis = async () => {
    if (!emotionEngine || !videoRef?.current) return;
    
    try {
      setIsAnalyzing(true);
      const session = await emotionEngine.startEmotionAnalysis(videoRef.current);
      setCurrentSession(session);
      
      // Start real-time updates
      const updateInterval = setInterval(() => {
        const sessionData = emotionEngine.getCurrentSession();
        if (sessionData) {
          setRealTimeData({
            currentEmotion: sessionData.currentEmotion,
            indicators: sessionData.mentalHealthIndicators,
            duration: Date.now() - sessionData.startTime
          });
        }
      }, 1000);
      
      session.updateInterval = updateInterval;
    } catch (error) {
      console.error('Failed to start emotion analysis:', error);
      setIsAnalyzing(false);
    }
  };

  const stopAnalysis = () => {
    if (emotionEngine && currentSession) {
      if (currentSession.updateInterval) {
        clearInterval(currentSession.updateInterval);
      }
      
      const summary = emotionEngine.stopEmotionAnalysis();
      console.log('Emotion analysis session summary:', summary);
    }
    
    setIsAnalyzing(false);
    setCurrentSession(null);
    setRealTimeData(null);
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      happy: <Smile className="h-5 w-5 text-green-500" />,
      sad: <Frown className="h-5 w-5 text-blue-500" />,
      angry: <AlertTriangle className="h-5 w-5 text-red-500" />,
      anxious: <Activity className="h-5 w-5 text-yellow-500" />,
      stressed: <TrendingUp className="h-5 w-5 text-orange-500" />,
      neutral: <Eye className="h-5 w-5 text-gray-500" />
    };
    return icons[emotion] || icons.neutral;
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-100 text-green-800',
      sad: 'bg-blue-100 text-blue-800',
      angry: 'bg-red-100 text-red-800',
      anxious: 'bg-yellow-100 text-yellow-800',
      stressed: 'bg-orange-100 text-orange-800',
      neutral: 'bg-gray-100 text-gray-800'
    };
    return colors[emotion] || colors.neutral;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      urgent: 'border-red-500 bg-red-50',
      high: 'border-orange-500 bg-orange-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-green-500 bg-green-50'
    };
    return colors[severity] || colors.medium;
  };

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Mental Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Emotion analysis will start automatically when video consultation begins.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real-time Emotion Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Real-time Emotion Analysis
            {isAnalyzing && (
              <Badge className="bg-green-600">
                <Activity className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {realTimeData ? (
            <div className="space-y-4">
              {/* Current Emotion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEmotionIcon(realTimeData.currentEmotion?.primary_emotion)}
                  <span className="font-medium">Current Emotion:</span>
                </div>
                <Badge className={getEmotionColor(realTimeData.currentEmotion?.primary_emotion)}>
                  {realTimeData.currentEmotion?.primary_emotion || 'neutral'}
                </Badge>
              </div>

              {/* Session Duration */}
              <div className="flex items-center justify-between text-sm">
                <span>Analysis Duration:</span>
                <span className="font-mono">{formatDuration(realTimeData.duration)}</span>
              </div>

              {/* Mental Health Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stress Level:</span>
                    <span className="font-medium">
                      {Math.round(realTimeData.indicators.stress * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${realTimeData.indicators.stress * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Anxiety Level:</span>
                    <span className="font-medium">
                      {Math.round(realTimeData.indicators.anxiety * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${realTimeData.indicators.anxiety * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Engagement:</span>
                    <span className="font-medium">
                      {Math.round(realTimeData.indicators.engagement * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${realTimeData.indicators.engagement * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence:</span>
                    <span className="font-medium">
                      {Math.round((realTimeData.currentEmotion?.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(realTimeData.currentEmotion?.confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
                <p className="text-sm text-gray-600">Initializing emotion analysis...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mental Health Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Mental Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(-3).map((alert, index) => (
                <Alert key={index} className={getSeverityColor(alert.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>{alert.message}</strong>
                        <Badge variant="outline" className={`${alert.severity === 'urgent' ? 'border-red-500 text-red-700' : 'border-yellow-500 text-yellow-700'}`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      {alert.recommendations && (
                        <div>
                          <p className="text-xs font-medium mb-1">Recommendations:</p>
                          <ul className="text-xs space-y-1">
                            {alert.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-current rounded-full" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Analysis Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Facial Expression Analysis</div>
                <div className="text-xs text-gray-600">Real-time emotion detection from video</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Mic className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Voice Sentiment Analysis</div>
                <div className="text-xs text-gray-600">Emotional markers from speech patterns</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm">Behavioral Pattern Recognition</div>
                <div className="text-xs text-gray-600">Engagement and interaction analysis</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {!isAnalyzing ? (
              <Button onClick={startAnalysis} className="flex-1">
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            ) : (
              <Button onClick={stopAnalysis} variant="destructive" className="flex-1">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stop Analysis
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}