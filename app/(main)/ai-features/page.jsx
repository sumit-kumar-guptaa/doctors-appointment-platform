import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Activity, 
  MessageCircle, 
  Shield, 
  Eye, 
  Mic,
  Heart,
  Zap,
  Sparkles
} from "lucide-react"

import EnhancedMedicalDiagnosis from "@/components/enhanced-medical-diagnosis"
import MedicalAssistantChat from "@/components/medical-assistant-chat"
import DrugInteractionInterface from "@/components/drug-interaction-checker"

export default function AIFeaturesPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-12 w-12 text-blue-600" />
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Healthcare Suite
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the future of healthcare with our cutting-edge AI technologies. 
          From real-time health monitoring to advanced drug interaction checking, 
          we're revolutionizing patient care with artificial intelligence.
        </p>
        
        {/* Feature Highlights */}
        <div className="grid md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Real-time Monitoring</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <Eye className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-green-800">Computer Vision</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Mic className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Voice Analysis</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <Shield className="h-6 w-6 text-red-600" />
            <span className="text-sm font-medium text-red-800">Drug Safety</span>
          </div>
        </div>
      </div>

      {/* AI Features Tabs */}
      <Tabs defaultValue="diagnosis" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-4xl grid-cols-4">
            <TabsTrigger value="diagnosis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Multi-Modal Diagnosis
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="drug-checker" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Drug Safety
            </TabsTrigger>
            <TabsTrigger value="ai-agents" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Agents
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Multi-Modal AI Diagnosis */}
        <TabsContent value="diagnosis">
          <div className="space-y-6">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Multi-Modal AI Diagnosis
                </CardTitle>
                <p className="text-gray-600">
                  Advanced AI that combines voice analysis, computer vision, and natural language processing 
                  for comprehensive health assessment
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge className="bg-blue-600">Voice Biomarkers</Badge>
                  <Badge className="bg-green-600">Computer Vision</Badge>
                  <Badge className="bg-purple-600">Advanced NLP</Badge>
                  <Badge className="bg-red-600">OCR Integration</Badge>
                </div>
              </CardHeader>
            </Card>
            <EnhancedMedicalDiagnosis />
          </div>
        </TabsContent>

        {/* AI Medical Assistant */}
        <TabsContent value="assistant">
          <div className="space-y-6">
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  Smart Medical Assistant
                </CardTitle>
                <p className="text-gray-600">
                  Intelligent conversational AI powered by LangGraph and medical knowledge graphs. 
                  Get instant help with appointments, medications, and health questions.
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge className="bg-green-600">24/7 Available</Badge>
                  <Badge className="bg-blue-600">Appointment Scheduling</Badge>
                  <Badge className="bg-purple-600">Medication Reminders</Badge>
                  <Badge className="bg-orange-600">Emergency Guidance</Badge>
                </div>
              </CardHeader>
            </Card>
            <MedicalAssistantChat />
          </div>
        </TabsContent>

        {/* Drug Interaction Checker */}
        <TabsContent value="drug-checker">
          <div className="space-y-6">
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  AI-Powered Drug Safety Checker
                </CardTitle>
                <p className="text-gray-600">
                  Real-time pharmaceutical safety screening using AI and comprehensive drug databases. 
                  Prevent dangerous interactions and allergic reactions.
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge className="bg-red-600">Real-time Screening</Badge>
                  <Badge className="bg-orange-600">Allergy Protection</Badge>
                  <Badge className="bg-yellow-600">Risk Assessment</Badge>
                  <Badge className="bg-green-600">Smart Alternatives</Badge>
                </div>
              </CardHeader>
            </Card>
            <DrugInteractionInterface />
          </div>
        </TabsContent>

        {/* AI Agents System */}
        <TabsContent value="ai-agents">
          <div className="space-y-6">
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Zap className="h-6 w-6 text-orange-600" />
                  Multi-Agent AI Healthcare System
                </CardTitle>
                <p className="text-gray-600">
                  Autonomous AI agents that collaborate to provide comprehensive healthcare services. 
                  Each agent specializes in different aspects of patient care and works together seamlessly.
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge className="bg-blue-600">Diagnostic Agent</Badge>
                  <Badge className="bg-green-600">Treatment Agent</Badge>
                  <Badge className="bg-purple-600">Monitoring Agent</Badge>
                  <Badge className="bg-orange-600">Coordination Agent</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
                    <Brain className="h-8 w-8 mx-auto text-blue-500" />
                    <h4 className="font-semibold">Diagnostic Agent</h4>
                    <p className="text-sm text-gray-600">Analyzes symptoms and generates diagnoses</p>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
                    <Heart className="h-8 w-8 mx-auto text-green-500" />
                    <h4 className="font-semibold">Treatment Agent</h4>
                    <p className="text-sm text-gray-600">Creates personalized treatment plans</p>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
                    <Activity className="h-8 w-8 mx-auto text-purple-500" />
                    <h4 className="font-semibold">Monitoring Agent</h4>
                    <p className="text-sm text-gray-600">Tracks patient health in real-time</p>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-white rounded-lg border">
                    <Zap className="h-8 w-8 mx-auto text-orange-500" />
                    <h4 className="font-semibold">Coordination Agent</h4>
                    <p className="text-sm text-gray-600">Orchestrates multi-agent workflows</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <a 
                    href="/ai-agents" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Zap className="h-5 w-5" />
                    Experience AI Agents System
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Technology Stack */}
      <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-center text-xl">Powered by Advanced AI Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <Zap className="h-8 w-8 mx-auto text-yellow-500" />
              <h4 className="font-semibold">LangGraph</h4>
              <p className="text-sm text-gray-600">Advanced conversational AI with medical reasoning</p>
            </div>
            <div className="space-y-2">
              <Eye className="h-8 w-8 mx-auto text-blue-500" />
              <h4 className="font-semibold">Computer Vision</h4>
              <p className="text-sm text-gray-600">TensorFlow.js for real-time image analysis</p>
            </div>
            <div className="space-y-2">
              <Mic className="h-8 w-8 mx-auto text-purple-500" />
              <h4 className="font-semibold">Voice Analysis</h4>
              <p className="text-sm text-gray-600">Biomarker detection from speech patterns</p>
            </div>
            <div className="space-y-2">
              <Brain className="h-8 w-8 mx-auto text-purple-500" />
              <h4 className="font-semibold">Multi-Agent AI</h4>
              <p className="text-sm text-gray-600">Autonomous collaborative agents</p>
            </div>
            <div className="space-y-2">
              <MessageCircle className="h-8 w-8 mx-auto text-orange-500" />
              <h4 className="font-semibold">LangGraph AI</h4>
              <p className="text-sm text-gray-600">Advanced conversational AI</p>
            </div>
            <div className="space-y-2">
              <Shield className="h-8 w-8 mx-auto text-red-500" />
              <h4 className="font-semibold">Drug Safety AI</h4>
              <p className="text-sm text-gray-600">Pharmaceutical interaction detection</p>
            </div>
            <div className="space-y-2">
              <Heart className="h-8 w-8 mx-auto text-red-500" />
              <h4 className="font-semibold">Real-time Monitoring</h4>
              <p className="text-sm text-gray-600">WebRTC for vital signs detection</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="border-blue-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Experience the Future of Healthcare</h3>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6">
            Our AI-powered platform represents the cutting edge of healthcare technology. 
            From autonomous AI agents to real-time health monitoring during video calls, 
            we're making healthcare safer, smarter, and more accessible.
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-100">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm">Ready for your next hackathon win!</span>
            <Sparkles className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}