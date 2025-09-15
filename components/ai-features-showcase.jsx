// AI Features Showcase Component
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Brain, 
  Eye, 
  Pill, 
  Users, 
  Globe, 
  Camera, 
  Activity,
  Sparkles,
  ChevronRight,
  PlayCircle,
  CheckCircle
} from 'lucide-react';

const AIFeaturesShowcase = ({ isVisible = true }) => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [demoStatus, setDemoStatus] = useState({});

  const aiFeatures = [
    {
      id: 'health-monitoring',
      title: 'Real-time Health Monitoring',
      description: 'AI-powered vital signs detection using computer vision during video consultations',
      icon: Heart,
      status: 'active',
      capabilities: [
        'Heart Rate Detection',
        'Blood Pressure Estimation',
        'Stress Level Monitoring',
        'Anomaly Detection',
        'Real-time Alerts'
      ],
      demoAvailable: true,
      color: 'bg-red-500',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      id: 'multi-modal-diagnosis',
      title: 'Multi-Modal AI Diagnosis',
      description: 'Advanced medical assessment combining voice, image, and symptom analysis',
      icon: Brain,
      status: 'active',
      capabilities: [
        'Voice Pattern Analysis',
        'Medical Image Processing',
        'Symptom Classification',
        'Confidence Scoring',
        'Treatment Recommendations'
      ],
      demoAvailable: true,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'emotion-analysis',
      title: 'AI Emotion & Mental Health Analysis',
      description: 'Real-time psychological monitoring with facial recognition and voice sentiment',
      icon: Eye,
      status: 'active',
      capabilities: [
        'Facial Emotion Recognition',
        'Voice Sentiment Analysis',
        'Behavioral Pattern Recognition',
        'Mental Health Alerts',
        'Psychological Assessment'
      ],
      demoAvailable: true,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'drug-interaction',
      title: 'AI Drug Interaction Checker',
      description: 'Sophisticated pharmaceutical analysis with safety alerts and recommendations',
      icon: Pill,
      status: 'active',
      capabilities: [
        'Drug Interaction Detection',
        'Allergy Checking',
        'Dosage Recommendations',
        'Side Effect Warnings',
        'Alternative Suggestions'
      ],
      demoAvailable: true,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'multi-agent-system',
      title: 'Multi-Agent AI Healthcare System',
      description: '4 autonomous AI agents with collaborative intelligence and emergency protocols',
      icon: Users,
      status: 'active',
      capabilities: [
        'Diagnostic Agent',
        'Treatment Agent',
        'Monitoring Agent',
        'Coordination Agent',
        'Emergency Response'
      ],
      demoAvailable: true,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'medical-translation',
      title: 'Real-time Medical Translation',
      description: 'Comprehensive translation system supporting 50+ languages with medical accuracy',
      icon: Globe,
      status: 'active',
      capabilities: [
        '50+ Language Support',
        'Medical Terminology Accuracy',
        'Voice Translation',
        'Real-time Interpretation',
        'Medical Phrase Library'
      ],
      demoAvailable: true,
      color: 'bg-teal-500',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'arvr-visualization',
      title: 'AR/VR Medical Visualization',
      description: 'Immersive 3D medical experience with anatomical models and surgical simulation',
      icon: Camera,
      status: 'active',
      capabilities: [
        '3D Anatomical Models',
        'WebXR Support',
        'Surgical Simulation',
        'Patient Scan Integration',
        'Interactive Education'
      ],
      demoAvailable: true,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'smart-assistant',
      title: 'Smart Medical Assistant',
      description: 'Intelligent chatbot with medical knowledge base and conversation memory',
      icon: Activity,
      status: 'active',
      capabilities: [
        'Medical Knowledge Base',
        'Conversation Memory',
        'Multilingual Support',
        'RAG Technology',
        'Context Understanding'
      ],
      demoAvailable: true,
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  // Simulate demo status
  useEffect(() => {
    const initialStatus = {};
    aiFeatures.forEach(feature => {
      initialStatus[feature.id] = Math.random() > 0.3 ? 'ready' : 'initializing';
    });
    setDemoStatus(initialStatus);
  }, []);

  // Start feature demo
  const startDemo = (featureId) => {
    setDemoStatus(prev => ({
      ...prev,
      [featureId]: 'running'
    }));

    // Simulate demo completion
    setTimeout(() => {
      setDemoStatus(prev => ({
        ...prev,
        [featureId]: 'completed'
      }));
    }, 3000);
  };

  // Get status badge
  const getStatusBadge = (featureId) => {
    const status = demoStatus[featureId];
    
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-500 text-white text-xs">Ready</Badge>;
      case 'running':
        return <Badge className="bg-blue-500 text-white text-xs animate-pulse">Running Demo</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500 text-white text-xs">Demo Complete</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 text-xs">Initializing</Badge>;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Revolutionary AI Healthcare Platform</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Experience cutting-edge AI features that transform medical consultations
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>8 AI Systems Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>Real-time Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>Patient-Centered Care</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {aiFeatures.map((feature, index) => {
          const IconComponent = feature.icon;
          const isActive = activeFeature === feature.id;
          
          return (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => setActiveFeature(isActive ? null : feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  {getStatusBadge(feature.id)}
                </div>
                <CardTitle className="text-sm font-semibold text-gray-800 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                <p className="text-xs text-gray-600 line-clamp-2">
                  {feature.description}
                </p>

                {/* Feature Capabilities */}
                {isActive && (
                  <div className="space-y-3 animate-in slide-in-from-top duration-300">
                    <Separator />
                    
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Key Capabilities:</h4>
                      <ul className="space-y-1">
                        {feature.capabilities.slice(0, 3).map((capability, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                            {capability}
                          </li>
                        ))}
                        {feature.capabilities.length > 3 && (
                          <li className="text-xs text-gray-500 italic">
                            +{feature.capabilities.length - 3} more features...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Demo Button */}
                    {feature.demoAvailable && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          startDemo(feature.id);
                        }}
                        disabled={demoStatus[feature.id] === 'running'}
                        size="sm"
                        className={`w-full text-xs bg-gradient-to-r ${feature.gradient} hover:opacity-90`}
                      >
                        {demoStatus[feature.id] === 'running' ? (
                          <>
                            <Activity className="h-3 w-3 mr-1 animate-spin" />
                            Running Demo...
                          </>
                        ) : demoStatus[feature.id] === 'completed' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Demo Complete
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Try Demo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {/* Expand Indicator */}
                {!isActive && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {feature.capabilities.length} features
                    </span>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Details Panel */}
      {activeFeature && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            {(() => {
              const feature = aiFeatures.find(f => f.id === activeFeature);
              if (!feature) return null;
              
              const IconComponent = feature.icon;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">All Capabilities:</h4>
                          <ul className="space-y-2">
                            {feature.capabilities.map((capability, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                {capability}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Integration Status:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="text-sm">Video Consultations</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="text-sm">Mobile Responsive</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="text-sm">Real-time Processing</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="text-sm">HIPAA Compliant</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* System Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📊 AI System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-blue-600">&lt;100ms</div>
              <div className="text-xs text-gray-600">Response Time</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-purple-600">95.2%</div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-xs text-gray-600">Availability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFeaturesShowcase;