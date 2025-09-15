"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Calendar,
  Pills,
  Heart,
  AlertTriangle,
  Clock,
  Phone,
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import SmartMedicalAssistant from '@/lib/smart-medical-assistant';

export default function MedicalAssistantChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assistant, setAssistant] = useState(null);
  const [assistantReady, setAssistantReady] = useState(false);
  
  const messagesEndRef = useRef(null);
  const speechRecognition = useRef(null);

  // Initialize assistant
  useEffect(() => {
    const initAssistant = async () => {
      const medicalAssistant = new SmartMedicalAssistant();
      const result = await medicalAssistant.initialize({
        name: "User", // Would be dynamic in real app
        preferences: {
          language: "en",
          timezone: "local"
        }
      });
      
      if (result.success) {
        setAssistant(medicalAssistant);
        setAssistantReady(true);
        
        // Load conversation history
        const history = medicalAssistant.getConversationHistory();
        setMessages(history);
        
        // Welcome message if no history
        if (history.length === 0) {
          setMessages([{
            type: 'assistant',
            message: "👋 Hello! I'm your AI Medical Assistant. I can help you with:\n\n" +
                    "📅 Scheduling appointments\n" +
                    "💊 Medication information\n" +
                    "🩺 Symptom assessment\n" +
                    "⏰ Medication reminders\n" +
                    "🚨 Emergency guidance\n\n" +
                    "How can I assist you today?",
            timestamp: Date.now(),
            intent: 'welcome'
          }]);
        }
      } else {
        toast.error("Failed to initialize medical assistant");
      }
    };
    
    initAssistant();
  }, []);

  // Setup speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';
      
      speechRecognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      speechRecognition.current.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error. Please try again.");
      };
      
      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !assistant || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Add user message to chat
      const userMsg = {
        type: 'user',
        message: userMessage,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Process with AI assistant
      const response = await assistant.processMessage(userMessage);
      
      // Add assistant response
      const assistantMsg = {
        type: 'assistant',
        message: response.text,
        timestamp: Date.now(),
        intent: response.intent,
        data: response.data
      };
      setMessages(prev => [...prev, assistantMsg]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      
      const errorMsg = {
        type: 'assistant',
        message: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: Date.now(),
        intent: 'error'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (speechRecognition.current) {
      setIsListening(true);
      speechRecognition.current.start();
      toast.success("Listening... Speak now");
    } else {
      toast.error("Speech recognition not supported in this browser");
    }
  };

  const stopVoiceInput = () => {
    if (speechRecognition.current) {
      speechRecognition.current.stop();
      setIsListening(false);
    }
  };

  const clearChat = () => {
    if (assistant) {
      assistant.clearHistory();
      setMessages([{
        type: 'assistant',
        message: "Chat cleared! How can I help you today?",
        timestamp: Date.now(),
        intent: 'welcome'
      }]);
      toast.success("Chat history cleared");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getIntentIcon = (intent) => {
    switch (intent) {
      case 'appointment_scheduling':
      case 'appointment_rescheduling':
      case 'appointment_cancellation':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'medication_inquiry':
      case 'medication_reminder':
        return <Pills className="h-4 w-4 text-green-500" />;
      case 'symptom_check':
      case 'symptom_assessment':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIntentBadge = (intent) => {
    const intentLabels = {
      'appointment_scheduling': 'Appointment',
      'medication_inquiry': 'Medication',
      'symptom_check': 'Symptoms',
      'emergency': 'Emergency',
      'health_tip': 'Health Tips',
      'general_query': 'General'
    };
    
    if (intentLabels[intent]) {
      return <Badge variant="secondary" className="text-xs">{intentLabels[intent]}</Badge>;
    }
    return null;
  };

  const formatMessage = (text) => {
    // Convert markdown-like formatting to JSX
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-bold text-gray-900 mb-2">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 text-gray-700 mb-1">{line}</div>;
      }
      if (line.includes('🚨') || line.includes('⚠️')) {
        return <div key={index} className="text-red-600 font-medium mb-2">{line}</div>;
      }
      if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      return <div key={index} className="text-gray-800 mb-1">{line}</div>;
    });
  };

  const quickActions = [
    { icon: Calendar, label: "Schedule Appointment", message: "I'd like to schedule an appointment" },
    { icon: Pills, label: "Medication Info", message: "I have a question about my medication" },
    { icon: Heart, label: "Symptom Check", message: "I'm experiencing some symptoms" },
    { icon: Phone, label: "Emergency Help", message: "I need emergency assistance" }
  ];

  if (!assistantReady) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bot className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Initializing Medical Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-8 w-8" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Medical Assistant</h2>
              <p className="text-blue-100 text-sm">Here to help with your healthcare needs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={clearChat} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-last' : ''}`}>
              <div className={`rounded-lg p-3 shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white ml-auto' 
                  : 'bg-white text-gray-800 border'
              }`}>
                <div className="text-sm leading-relaxed">
                  {typeof msg.message === 'string' ? formatMessage(msg.message) : msg.message}
                </div>
                
                {msg.intent && msg.type === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    {getIntentIcon(msg.intent)}
                    {getIntentBadge(msg.intent)}
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-gray-500 mt-1 ${msg.type === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            {msg.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="p-4 bg-white border-t">
          <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={() => setInputMessage(action.message)}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your health, medications, or appointments..."
              className="pr-12 resize-none min-h-[44px]"
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            <Button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1 ${isListening ? 'text-red-500' : 'text-gray-400'}`}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Press Enter to send</span>
            {speechRecognition.current && (
              <span className="flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Voice input available
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>For emergencies, call 911</span>
          </div>
        </div>
      </div>
    </div>
  );
}