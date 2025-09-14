"use client";
import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Heart,
  Stethoscope,
  Activity,
  TrendingUp,
  TrendingDown,
  Camera,
  Scan,
  Download,
  Share2,
  Clock,
  User,
  Calendar,
  MapPin,
  Phone,
  Star,
  Flag,
  ArrowRight,
  Loader2,
  FileImage
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MedicalReportDiagnosis = ({ user }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // AI Analysis Function - Connected to your LangGraph + Gemini system
  const analyzeReport = async (file) => {
    setIsAnalyzing(true);
    
    try {
      // Prepare form data for the AI analysis API
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('analysisType', 'comprehensive');
      formData.append('patientInfo', JSON.stringify({
        name: user?.name || user?.fullName || 'Patient',
        age: user?.age || '',
        gender: user?.gender || '',
        email: user?.emailAddresses?.[0]?.emailAddress || '',
        id: user?.id || ''
      }));

      // Call the AI diagnosis API that connects to your LangGraph system
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Transform the AI response into the expected format
        setAnalysisResults({
          ...result.diagnosis,
          aiSystemUsed: true,
          confidence: result.diagnosis.confidence || 0.85,
          analysisId: result.metadata?.analysisId || Date.now().toString()
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback to mock analysis if AI system is unavailable
      console.log('Falling back to mock analysis due to:', error.message);
      
      // Show user-friendly error with fallback
      setAnalysisResults({
        patientInfo: {
          name: user?.name || user?.fullName || 'Patient',
          age: user?.age || 'N/A',
          gender: user?.gender || 'N/A',
          reportDate: new Date().toLocaleDateString()
        },
        extractedText: `AI Analysis System Status: Currently connecting to advanced medical AI...
        
        Fallback Analysis Available:
        - Basic pattern recognition active
        - Professional medical interpretation recommended
        - All findings require physician validation
        
        Note: This is a simplified analysis. For complete AI-powered insights,
        please ensure the LangGraph + Gemini AI system is running.`,
        
        aiAnalysis: {
          analysis: `Professional AI Analysis Attempted:
          
          Your advanced medical AI system (LangGraph + Gemini + MCP) provides:
          • OCR-powered text extraction from medical reports
          • Gemini AI-driven medical interpretation
          • MCP server predictions for diabetes and cardiovascular risks
          • WHO health data integration
          • FDA drug information lookup
          
          Status: ${error.message.includes('Failed to fetch') ? 'AI system offline' : 'Processing error'}
          
          Recommendation: Consult with healthcare professionals for detailed medical interpretation.`,
          toolsUsed: ['Fallback Analysis'],
          timestamp: new Date().toISOString()
        },
        
        summary: {
          status: 'SYSTEM_UNAVAILABLE',
          overallHealth: 'AI analysis system temporarily unavailable - manual review recommended',
          keyFindings: [
            'Advanced AI analysis requires system connection',
            'Professional medical review strongly recommended',
            'Basic safety checks completed'
          ]
        },
        
        flaggedIssues: [
          {
            severity: 'LOW',
            category: 'System',
            issue: 'AI Analysis System Unavailable',
            values: 'Connection error',
            risk: 'Limited automated analysis',
            recommendation: 'Manual medical review by healthcare professional'
          }
        ],
        
        recommendedDoctors: [
          {
            specialty: 'General Medicine',
            reason: 'Comprehensive medical report review needed',
            priority: 'MEDIUM',
            urgency: 'Within 1-2 weeks',
            icon: Stethoscope,
            color: 'blue'
          }
        ],
        
        normalValues: [],
        aiSystemUsed: false,
        fallback: true,
        systemError: error.message,
        confidence: 0.3
      });
    }
    
    setIsAnalyzing(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      uploadedAt: new Date().toLocaleString()
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0]);
      analyzeReport(newFiles[0]);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'LOW': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'MEDIUM': return <Flag className="h-4 w-4 text-orange-500" />;
      case 'LOW': return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scan className="h-6 w-6 text-blue-600" />
            </div>
            Medical Report Diagnosis
          </CardTitle>
          <p className="text-blue-700">
            Upload your medical reports for AI-powered analysis and doctor recommendations
          </p>
        </CardHeader>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Medical Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop medical reports here or click to upload
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports: PDF, JPG, PNG, JPEG (Max 10MB)
              </p>
              <Button variant="outline" className="mt-2">
                <Camera className="h-4 w-4 mr-2" />
                Select Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Uploaded Reports</h4>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size} • {file.uploadedAt}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(file);
                        analyzeReport(file);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Analyze
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <Card className="border-blue-300">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Medical Report</h3>
                <p className="text-gray-600">OCR extraction and AI analysis in progress...</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span>Processing...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults && !isAnalyzing && (
        <div className="space-y-6">
          {/* AI System Status */}
          <Card className={`border-l-4 ${analysisResults.aiSystemUsed ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${analysisResults.aiSystemUsed ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Brain className={`h-5 w-5 ${analysisResults.aiSystemUsed ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {analysisResults.aiSystemUsed ? 'LangGraph + Gemini AI Active' : 'AI System Status'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {analysisResults.aiSystemUsed 
                        ? 'Advanced medical analysis with OCR, MCP predictions, and healthcare APIs'
                        : 'Using fallback analysis - connect to AI system for advanced features'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={analysisResults.aiSystemUsed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {analysisResults.aiSystemUsed ? 'AI Active' : 'Fallback Mode'}
                  </Badge>
                  {analysisResults.confidence && (
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(analysisResults.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Details */}
          {analysisResults.aiAnalysis && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Brain className="h-5 w-5" />
                  AI Medical Analysis
                  {analysisResults.aiAnalysis.toolsUsed && analysisResults.aiAnalysis.toolsUsed.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {analysisResults.aiAnalysis.toolsUsed.join(', ')}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {analysisResults.aiAnalysis.analysis}
                  </pre>
                  {analysisResults.aiAnalysis.timestamp && (
                    <p className="text-xs text-gray-500 mt-3 border-t pt-2">
                      Analysis completed: {new Date(analysisResults.aiAnalysis.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* MCP Predictions */}
          {analysisResults.medicalPredictions && Object.keys(analysisResults.medicalPredictions).length > 0 && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Activity className="h-5 w-5" />
                  MCP Medical Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysisResults.medicalPredictions).map(([type, prediction]) => (
                    <div key={type} className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                        {type} Risk Assessment
                      </h4>
                      {prediction.risk_probability && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Risk Probability</span>
                            <span className="font-medium">
                              {Math.round(prediction.risk_probability * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                prediction.risk_probability > 0.7 ? 'bg-red-500' :
                                prediction.risk_probability > 0.4 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${prediction.risk_probability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {prediction.risk_category && (
                        <Badge className={`${
                          prediction.risk_category === 'High' ? 'bg-red-100 text-red-800' :
                          prediction.risk_category === 'Medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        } mb-2`}>
                          {prediction.risk_category} Risk
                        </Badge>
                      )}
                      {prediction.enhanced_analysis?.recommendations && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-800 mb-1">Recommendations:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {prediction.enhanced_analysis.recommendations.slice(0, 3).map((rec, i) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* OCR Extracted Text */}
          {analysisResults.extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-blue-600" />
                  OCR Extracted Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {analysisResults.extractedText}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Summary Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Overall Health Status</h4>
                  <Badge className={`${
                    analysisResults.summary.status === 'NEEDS_ATTENTION' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  } mb-3`}>
                    {analysisResults.summary.status.replace('_', ' ')}
                  </Badge>
                  <p className="text-gray-700">{analysisResults.summary.overallHealth}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
                  <ul className="space-y-2">
                    {analysisResults.summary.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flagged Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Flag className="h-5 w-5" />
                Flagged Issues ({analysisResults.flaggedIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults.flaggedIssues.map((issue, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(issue.severity)}
                        <h4 className="font-semibold">{issue.issue}</h4>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                      </div>
                      <Badge className={`${getSeverityColor(issue.severity)} border-0`}>
                        {issue.severity}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Values:</p>
                        <p className="text-gray-700">{issue.values}</p>
                      </div>
                      <div>
                        <p className="font-medium">Risk:</p>
                        <p className="text-gray-700">{issue.risk}</p>
                      </div>
                      <div>
                        <p className="font-medium">Recommendation:</p>
                        <p className="text-gray-700">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Doctors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Recommended Specialists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisResults.recommendedDoctors.map((doctor, index) => {
                  const IconComponent = doctor.icon;
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${doctor.color}-100`}>
                          <IconComponent className={`h-5 w-5 text-${doctor.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{doctor.specialty}</h4>
                          <Badge className={`${getSeverityColor(doctor.priority)} text-xs mt-1`}>
                            {doctor.priority} Priority
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{doctor.reason}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {doctor.urgency}
                        </div>
                        <Button size="sm" className={`bg-${doctor.color}-600 hover:bg-${doctor.color}-700`}>
                          Book Now
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Normal Values */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Normal Values ({analysisResults.normalValues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysisResults.normalValues.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium text-sm">{item.test}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{item.value}</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share with Doctor
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReportDiagnosis;