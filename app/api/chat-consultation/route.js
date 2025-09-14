import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Chat Consultation API - Integrates with LangGraph MCP System
export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { message, emergencyId, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process message through LangGraph MCP system
    const chatResponse = await processMedicalChat(message, {
      userId,
      emergencyId,
      sessionId
    });

    return NextResponse.json({
      success: true,
      response: chatResponse.response,
      recommendations: chatResponse.recommendations,
      urgencyLevel: chatResponse.urgencyLevel,
      requiresDoctorConsultation: chatResponse.requiresDoctorConsultation,
      followUpQuestions: chatResponse.followUpQuestions
    });

  } catch (error) {
    console.error('Chat consultation error:', error);
    return NextResponse.json(
      { error: 'Chat consultation failed' },
      { status: 500 }
    );
  }
}

// Process Medical Chat through LangGraph MCP System
async function processMedicalChat(message, context) {
  try {
    // This would connect to your existing LangGraph + MCP system
    const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:8000';
    
    const response = await fetch(`${mcpServerUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context: {
          patient_id: context.userId,
          emergency_id: context.emergencyId,
          session_id: context.sessionId,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error('MCP server communication failed');
    }

    const mcpResponse = await response.json();
    
    // Process and enhance the MCP response
    return await enhanceMedicalResponse(mcpResponse, message);

  } catch (error) {
    console.error('MCP processing error:', error);
    
    // Fallback to basic medical chat response
    return await generateFallbackResponse(message);
  }
}

// Enhance Medical Response with Additional Intelligence
async function enhanceMedicalResponse(mcpResponse, originalMessage) {
  try {
    // Analyze urgency level
    const urgencyLevel = assessUrgencyLevel(originalMessage, mcpResponse);
    
    // Generate recommendations
    const recommendations = generateMedicalRecommendations(mcpResponse, urgencyLevel);
    
    // Determine if doctor consultation is needed
    const requiresDoctorConsultation = shouldRecommendDoctorConsultation(urgencyLevel, mcpResponse);
    
    // Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(mcpResponse);

    return {
      response: mcpResponse.response || mcpResponse.message,
      urgencyLevel,
      recommendations,
      requiresDoctorConsultation,
      followUpQuestions,
      medicalAnalysis: mcpResponse.analysis,
      riskFactors: mcpResponse.risk_factors || [],
      possibleConditions: mcpResponse.possible_conditions || []
    };

  } catch (error) {
    console.error('Response enhancement error:', error);
    return {
      response: mcpResponse.response || 'I understand your concern. Please provide more details about your symptoms.',
      urgencyLevel: 'moderate',
      recommendations: ['Please provide more specific information about your symptoms'],
      requiresDoctorConsultation: false,
      followUpQuestions: ['Can you describe the intensity of your symptoms?']
    };
  }
}

// Assess Urgency Level
function assessUrgencyLevel(message, mcpResponse) {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing',
    'stroke', 'unconscious', 'severe pain', 'heavy bleeding', 'overdose',
    'allergic reaction', 'accident', 'emergency'
  ];
  
  const urgentKeywords = [
    'pain', 'fever', 'nausea', 'vomiting', 'headache', 'dizzy',
    'shortness of breath', 'rash', 'swelling'
  ];

  const lowerMessage = message.toLowerCase();
  
  // Check emergency keywords
  for (const keyword of emergencyKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'critical';
    }
  }
  
  // Check MCP response for emergency indicators
  if (mcpResponse.urgency === 'high' || mcpResponse.emergency_score > 7) {
    return 'critical';
  }
  
  // Check urgent keywords
  for (const keyword of urgentKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'urgent';
    }
  }
  
  return 'moderate';
}

// Generate Medical Recommendations
function generateMedicalRecommendations(mcpResponse, urgencyLevel) {
  const baseRecommendations = mcpResponse.recommendations || [];
  
  const urgencyRecommendations = {
    critical: [
      'Seek immediate emergency medical attention',
      'Call emergency services if symptoms worsen',
      'Do not delay professional medical care'
    ],
    urgent: [
      'Consider scheduling a same-day doctor appointment',
      'Monitor symptoms closely',
      'Seek medical attention if symptoms persist or worsen'
    ],
    moderate: [
      'Consider scheduling a routine appointment with your doctor',
      'Monitor symptoms and track any changes',
      'Maintain a healthy lifestyle'
    ]
  };
  
  return [
    ...baseRecommendations,
    ...urgencyRecommendations[urgencyLevel] || urgencyRecommendations.moderate
  ];
}

// Determine if Doctor Consultation is Needed
function shouldRecommendDoctorConsultation(urgencyLevel, mcpResponse) {
  if (urgencyLevel === 'critical') return true;
  if (urgencyLevel === 'urgent') return true;
  if (mcpResponse.requires_consultation === true) return true;
  if (mcpResponse.confidence_score < 0.7) return true;
  
  return false;
}

// Generate Follow-up Questions
function generateFollowUpQuestions(mcpResponse) {
  const questions = mcpResponse.follow_up_questions || [];
  
  const defaultQuestions = [
    'How long have you been experiencing these symptoms?',
    'Have you taken any medications for this?',
    'Do you have any relevant medical history?',
    'Are there any other symptoms you\'re experiencing?'
  ];
  
  return questions.length > 0 ? questions : defaultQuestions.slice(0, 2);
}

// Fallback Response Generator
async function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Simple keyword-based responses for fallback
  if (lowerMessage.includes('pain')) {
    return {
      response: 'I understand you\'re experiencing pain. Pain can have many causes, and the location, intensity, and duration are important factors. Can you describe where you feel the pain and how severe it is on a scale of 1-10?',
      urgencyLevel: 'moderate',
      recommendations: [
        'Describe the exact location and intensity of your pain',
        'Note any activities that make it better or worse',
        'Consider over-the-counter pain relief if appropriate'
      ],
      requiresDoctorConsultation: true,
      followUpQuestions: [
        'Where exactly is the pain located?',
        'How would you rate the pain intensity from 1-10?'
      ]
    };
  }
  
  if (lowerMessage.includes('fever')) {
    return {
      response: 'Fever can indicate your body is fighting an infection. Have you taken your temperature? A fever is generally considered 100.4°F (38°C) or higher.',
      urgencyLevel: 'urgent',
      recommendations: [
        'Take your temperature regularly',
        'Stay hydrated with plenty of fluids',
        'Rest and monitor other symptoms',
        'Seek medical attention if fever persists or worsens'
      ],
      requiresDoctorConsultation: true,
      followUpQuestions: [
        'What is your current temperature?',
        'How long have you had the fever?'
      ]
    };
  }
  
  return {
    response: 'I\'m here to help with your medical concerns. Please describe your symptoms in detail so I can provide you with appropriate guidance.',
    urgencyLevel: 'moderate',
    recommendations: [
      'Provide detailed information about your symptoms',
      'Include timing, location, and severity of symptoms',
      'Mention any relevant medical history'
    ],
    requiresDoctorConsultation: false,
    followUpQuestions: [
      'Can you describe your main symptoms?',
      'When did these symptoms start?'
    ]
  };
}