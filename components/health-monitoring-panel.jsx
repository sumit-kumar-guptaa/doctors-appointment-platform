"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Lung, 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import AIHealthMonitor from '@/lib/ai-health-monitor';

export default function HealthMonitoringPanel({ videoRef, isCallActive }) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: null,
    breathingRate: null,
    stressLevel: null,
    status: { level: 'normal', warnings: [] }
  });
  const [healthReport, setHealthReport] = useState(null);
  const [monitoringHistory, setMonitoringHistory] = useState([]);
  
  const healthMonitor = useRef(null);

  // Initialize health monitor
  useEffect(() => {
    healthMonitor.current = new AIHealthMonitor();
    
    // Setup event listeners
    healthMonitor.current.on('vitalSigns', (data) => {
      setVitalSigns(data);
      setMonitoringHistory(prev => [...prev.slice(-50), data]); // Keep last 50 readings
    });

    return () => {
      if (healthMonitor.current) {
        healthMonitor.current.stopMonitoring();
      }
    };
  }, []);

  // Auto-start monitoring when call becomes active
  useEffect(() => {
    if (isCallActive && videoRef?.current && !isMonitoring) {
      handleStartMonitoring();
    } else if (!isCallActive && isMonitoring) {
      handleStopMonitoring();
    }
  }, [isCallActive, videoRef, isMonitoring]);

  const handleStartMonitoring = async () => {
    if (!videoRef?.current || !healthMonitor.current) {
      console.error('Video reference or health monitor not available');
      return;
    }

    try {
      const result = await healthMonitor.current.initialize(videoRef.current);
      if (result.success) {
        healthMonitor.current.startMonitoring();
        setIsMonitoring(true);
      } else {
        console.error('Failed to start health monitoring:', result.error);
      }
    } catch (error) {
      console.error('Error starting health monitoring:', error);
    }
  };

  const handleStopMonitoring = () => {
    if (healthMonitor.current) {
      healthMonitor.current.stopMonitoring();
      setIsMonitoring(false);
      
      // Generate health report
      const report = healthMonitor.current.generateHealthReport();
      setHealthReport(report);
    }
  };

  const getStatusColor = (level) => {
    switch (level) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (level) => {
    switch (level) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-3 w-3 text-green-500" />;
      case 'stable': return <Minus className="h-3 w-3 text-gray-500" />;
      default: return null;
    }
  };

  const formatValue = (value, unit) => {
    return value ? `${Math.round(value)} ${unit}` : '--';
  };

  const getHeartRateStatus = (hr) => {
    if (!hr) return 'normal';
    if (hr < 60 || hr > 100) return 'warning';
    if (hr < 40 || hr > 120) return 'critical';
    return 'normal';
  };

  const getBreathingStatus = (br) => {
    if (!br) return 'normal';
    if (br < 12 || br > 25) return 'warning';
    if (br < 8 || br > 35) return 'critical';
    return 'normal';
  };

  const getStressStatus = (stress) => {
    if (!stress) return 'normal';
    if (stress > 70) return 'warning';
    if (stress > 85) return 'critical';
    return 'normal';
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI Health Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Active" : "Inactive"}
              </Badge>
              <Button
                onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                disabled={!isCallActive}
              >
                {isMonitoring ? "Stop" : "Start"} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
        {!isCallActive && (
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Health monitoring is only available during active video consultations.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Real-time Vital Signs */}
      {isMonitoring && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Heart Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Heart Rate
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(getHeartRateStatus(vitalSigns.heartRate))}`}>
                  {getStatusIcon(getHeartRateStatus(vitalSigns.heartRate))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(vitalSigns.heartRate, 'BPM')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Normal: 60-100 BPM
              </div>
            </CardContent>
          </Card>

          {/* Breathing Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lung className="h-4 w-4 text-blue-500" />
                  Breathing Rate
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(getBreathingStatus(vitalSigns.breathingRate))}`}>
                  {getStatusIcon(getBreathingStatus(vitalSigns.breathingRate))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(vitalSigns.breathingRate, 'BPM')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Normal: 12-25 BPM
              </div>
            </CardContent>
          </Card>

          {/* Stress Level */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  Stress Level
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(getStressStatus(vitalSigns.stressLevel))}`}>
                  {getStatusIcon(getStressStatus(vitalSigns.stressLevel))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vitalSigns.stressLevel ? `${Math.round(vitalSigns.stressLevel)}%` : '--'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Low: &lt;30%, High: &gt;70%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Warnings */}
      {isMonitoring && vitalSigns.status.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {vitalSigns.status.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-800">
                  • {warning}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Report (after monitoring session) */}
      {healthReport && !isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consultation Health Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Averages */}
            <div>
              <h4 className="font-semibold mb-2">Session Averages</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-500">
                    {healthReport.averages.heartRate ? Math.round(healthReport.averages.heartRate) : '--'} BPM
                  </div>
                  <div className="text-xs text-gray-500">Heart Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {healthReport.averages.breathingRate ? Math.round(healthReport.averages.breathingRate) : '--'} BPM
                  </div>
                  <div className="text-xs text-gray-500">Breathing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-500">
                    {healthReport.averages.stressLevel ? Math.round(healthReport.averages.stressLevel) : '--'}%
                  </div>
                  <div className="text-xs text-gray-500">Stress Level</div>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div>
              <h4 className="font-semibold mb-2">Trends During Session</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heart Rate</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(healthReport.trends.heartRate)}
                    <span className="text-sm capitalize">{healthReport.trends.heartRate.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Breathing Rate</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(healthReport.trends.breathingRate)}
                    <span className="text-sm capitalize">{healthReport.trends.breathingRate.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stress Level</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(healthReport.trends.stressLevel)}
                    <span className="text-sm capitalize">{healthReport.trends.stressLevel.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {healthReport.alerts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Session Alerts</h4>
                <div className="space-y-1">
                  {healthReport.alerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      {alert.message}
                    </div>
                  ))}
                  {healthReport.alerts.length > 5 && (
                    <div className="text-sm text-gray-500">
                      +{healthReport.alerts.length - 5} more alerts
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="text-sm text-gray-500 pt-2 border-t">
              Session Duration: {Math.round((healthReport.timeRange.end - healthReport.timeRange.start) / 60000)} minutes
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Panel */}
      {!isMonitoring && !healthReport && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">AI Health Monitoring</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Our advanced AI system monitors vital signs in real-time during video consultations using computer vision technology.
                </p>
                <div className="space-y-1 text-xs text-blue-700">
                  <div>• Heart rate monitoring via photoplethysmography (PPG)</div>
                  <div>• Breathing pattern analysis using chest movement</div>
                  <div>• Stress level detection through facial analysis</div>
                  <div>• Real-time health alerts and recommendations</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}