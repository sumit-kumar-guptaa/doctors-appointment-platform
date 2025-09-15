"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  Mic,
  MicOff,
  Image,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Heart,
  Lung,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import MultiModalAIDiagnosis from "@/lib/multi-modal-ai-diagnosis";

export default function EnhancedMedicalDiagnosis() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [manualText, setManualText] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [audioData, setAudioData] = useState(null);
  
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const multiModalAI = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Initialize multi-modal AI system
  useState(() => {
    multiModalAI.current = new MultiModalAIDiagnosis();
    multiModalAI.current.initialize();
  }, []);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file,
            dataUrl: e.target.result,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioData(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started - describe your symptoms");
      
      // Start speech recognition if available
      if (multiModalAI.current.speechRecognition) {
        multiModalAI.current.speechRecognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setRecordedText(transcript);
        };
        
        multiModalAI.current.speechRecognition.start();
      }
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not start recording. Please check microphone permissions.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
      
      if (multiModalAI.current.speechRecognition) {
        multiModalAI.current.speechRecognition.stop();
      }
    }
  };

  const performComprehensiveAnalysis = async () => {
    if (!uploadedImages.length && !audioData && !manualText && !recordedText) {
      toast.error("Please provide at least one input (image, voice, or text)");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Prepare input data for multi-modal analysis
      const input = {
        textData: manualText || recordedText || "",
        imageData: uploadedImages.length > 0 ? uploadedImages[0].dataUrl : null,
        audioData: audioData
      };

      toast.success("Starting comprehensive multi-modal analysis...");
      
      // Perform multi-modal analysis
      const result = await multiModalAI.current.performComprehensiveAnalysis(input);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Also call the original AI diagnosis API
      const enhancedResult = await callEnhancedDiagnosisAPI(input, result);
      
      setAnalysisResult(enhancedResult);
      toast.success("Analysis completed successfully!");
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const callEnhancedDiagnosisAPI = async (input, multiModalResult) => {
    try {
      const formData = new FormData();
      
      // Add text data
      const textData = {
        symptoms: input.textData,
        multiModalFindings: multiModalResult
      };
      formData.append('text', JSON.stringify(textData));
      
      // Add image if available
      if (uploadedImages.length > 0) {
        formData.append('image', uploadedImages[0].file);
      }
      
      // Add audio if available
      if (audioData) {
        formData.append('audio', audioData, 'symptoms.wav');
      }
      
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Merge with multi-modal analysis
      return {
        ...result,
        multiModal: multiModalResult,
        enhancedAnalysis: true
      };
      
    } catch (error) {
      console.error("API call error:", error);
      // Return multi-modal result if API fails
      return {
        analysis: "Enhanced multi-modal analysis completed with local processing",
        diagnosis: multiModalResult.synthesis?.primaryConcerns || [],
        recommendations: multiModalResult.recommendations || {},
        multiModal: multiModalResult,
        enhancedAnalysis: true,
        confidence: multiModalResult.synthesis?.confidence || 0.7
      };
    }
  };

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setUploadedImages([]);
    setAudioData(null);
    setRecordedText("");
    setManualText("");
    setAnalysisResult(null);
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          Enhanced AI Medical Diagnosis
        </h1>
        <p className="text-gray-600">
          Advanced multi-modal AI analysis combining voice, vision, and text processing
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Multi-Modal Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Input
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Image Input
              </TabsTrigger>
            </TabsList>

            {/* Text Input Tab */}
            <TabsContent value="text" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe your symptoms in detail:
                </label>
                <Textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Please describe your symptoms, when they started, their severity, and any relevant medical history..."
                  className="min-h-32"
                />
              </div>
              {recordedText && (
                <Alert>
                  <Mic className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Voice Transcript:</strong> {recordedText}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Voice Input Tab */}
            <TabsContent value="voice" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    {isRecording ? "Stop Recording" : "Start Voice Recording"}
                  </Button>
                </div>
                
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                    Recording... Speak clearly about your symptoms
                  </div>
                )}
                
                {audioData && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Voice recording captured successfully. AI will analyze speech patterns, respiratory indicators, and vocal stress markers.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            {/* Image Input Tab */}
            <TabsContent value="image" className="space-y-4">
              <div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 hover:bg-gray-50"
                >
                  <div className="text-center">
                    <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm">
                      Upload medical images, test results, or photos of affected areas
                    </div>
                  </div>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative">
                      <img
                        src={img.dataUrl}
                        alt="Medical image"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        onClick={() => removeImage(img.id)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={performComprehensiveAnalysis}
              disabled={isAnalyzing}
              className="flex-1"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Start Enhanced Analysis
                </>
              )}
            </Button>
            <Button onClick={clearAll} variant="outline" size="lg">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Multi-Modal Analysis Summary */}
          {analysisResult.multiModal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Multi-Modal Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Urgency Level */}
                {analysisResult.multiModal.synthesis?.urgencyLevel && (
                  <Alert className={getUrgencyColor(analysisResult.multiModal.synthesis.urgencyLevel)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Urgency Level:</strong> {analysisResult.multiModal.synthesis.urgencyLevel.toUpperCase()}
                      {analysisResult.multiModal.synthesis.urgencyLevel === 'high' && 
                        " - Consider seeking immediate medical attention"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Modality Results */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Voice Analysis */}
                  {analysisResult.multiModal.modalities?.voice && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Mic className="h-4 w-4 text-blue-600" />
                          Voice Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysisResult.multiModal.modalities.voice.respiratory?.riskLevel && (
                          <div className="text-xs">
                            <strong>Respiratory Risk:</strong> {analysisResult.multiModal.modalities.voice.respiratory.riskLevel}
                          </div>
                        )}
                        {analysisResult.multiModal.modalities.voice.mentalHealth?.stress?.level && (
                          <div className="text-xs">
                            <strong>Stress Level:</strong> {Math.round(analysisResult.multiModal.modalities.voice.mentalHealth.stress.level * 100)}%
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Vision Analysis */}
                  {analysisResult.multiModal.modalities?.vision && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4 text-green-600" />
                          Vision Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysisResult.multiModal.modalities.vision.skinConditions?.lesions?.detected && (
                          <div className="text-xs">
                            <strong>Skin Issues:</strong> Detected
                          </div>
                        )}
                        {analysisResult.multiModal.modalities.vision.posturalAssessment && (
                          <div className="text-xs">
                            <strong>Posture:</strong> Analyzed
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* NLP Analysis */}
                  {analysisResult.multiModal.modalities?.nlp && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          NLP Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {analysisResult.multiModal.modalities.nlp.symptoms?.identified && (
                          <div className="text-xs">
                            <strong>Symptoms:</strong> {analysisResult.multiModal.modalities.nlp.symptoms.identified.length} identified
                          </div>
                        )}
                        {analysisResult.multiModal.modalities.nlp.riskAssessment && (
                          <div className="text-xs">
                            <strong>Risk Assessment:</strong> Completed
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Primary Concerns */}
                {analysisResult.multiModal.synthesis?.primaryConcerns?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Primary Concerns:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.multiModal.synthesis.primaryConcerns.map((concern, index) => (
                        <Badge key={index} variant="destructive">
                          {concern.replace('_', ' ').toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Score */}
                {analysisResult.multiModal.synthesis?.confidence && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Confidence:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${analysisResult.multiModal.synthesis.confidence * 100}%`}}
                        />
                      </div>
                      <span className="text-sm">{Math.round(analysisResult.multiModal.synthesis.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Recommendations */}
          {analysisResult.multiModal?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Comprehensive Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="immediate">
                  <TabsList>
                    <TabsTrigger value="immediate">Immediate</TabsTrigger>
                    <TabsTrigger value="short-term">Short Term</TabsTrigger>
                    <TabsTrigger value="preventive">Preventive</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="immediate" className="space-y-2">
                    {analysisResult.multiModal.recommendations.immediate?.map((rec, index) => (
                      <Alert key={index} className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="short-term" className="space-y-2">
                    {analysisResult.multiModal.recommendations.shortTerm?.map((rec, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-yellow-800">• {rec}</div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="preventive" className="space-y-2">
                    {analysisResult.multiModal.recommendations.preventive?.map((rec, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-green-800">• {rec}</div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Traditional AI Analysis */}
          {analysisResult.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Traditional AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{analysisResult.analysis}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Features Info */}
      {!analysisResult && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4 text-center">Enhanced AI Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Mic className="h-12 w-12 mx-auto text-blue-600" />
                <h4 className="font-medium">Voice Biomarkers</h4>
                <p className="text-sm text-gray-600">
                  Analyzes speech patterns, breathing sounds, cough characteristics, and vocal stress indicators
                </p>
              </div>
              <div className="text-center space-y-2">
                <Eye className="h-12 w-12 mx-auto text-green-600" />
                <h4 className="font-medium">Computer Vision</h4>
                <p className="text-sm text-gray-600">
                  Advanced image analysis for skin conditions, postural assessment, eye health, and vital signs
                </p>
              </div>
              <div className="text-center space-y-2">
                <Brain className="h-12 w-12 mx-auto text-purple-600" />
                <h4 className="font-medium">NLP Processing</h4>
                <p className="text-sm text-gray-600">
                  Intelligent text analysis with medical entity extraction, symptom correlation, and risk assessment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}