# 🏥 Advanced Medical AI Platform

A comprehensive medical platform integrating **LangGraph + Gemini AI** with **Model Context Protocol (MCP)** for professional medical report analysis and healthcare services.

## 🧠 AI System Architecture

### Core Components

1. **LangGraph Workflow Engine** (`AI-Part/langgraph_gemini_chat.py`)
   - Advanced conversation orchestration
   - Multi-step medical analysis workflow
   - Intent classification and routing

2. **Gemini AI Integration**
   - Google's Gemini 1.5 Flash model
   - Professional medical interpretation
   - Natural language medical insights

3. **MCP Medical Server** (`AI-Part/mcp_medical_server.py`)
   - Diabetes risk prediction
   - Cardiovascular assessment
   - Patient data management
   - Health insights generation

4. **Healthcare API Integrations**
   - WHO Global Health Observatory
   - Disease statistics (disease.sh)
   - FDA drug information
   - Real-time health data

## 🚀 Features

### AI-Powered Medical Analysis
- **OCR Text Extraction**: Extract text from medical reports (images/PDFs)
- **Professional Interpretation**: Gemini AI provides medical insights
- **Risk Assessment**: MCP predictions for diabetes and cardiovascular health
- **Healthcare Data**: WHO statistics, disease data, drug information

### Medical Platform Features
- **Emergency Services**: Professional video calling system
- **Doctor Appointments**: Comprehensive booking system
- **Patient Dashboard**: Medical history and AI diagnosis
- **Specialist Recommendations**: AI-driven doctor referrals

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL database (Neon DB configured)

### 1. Environment Configuration

Create `.env` files in both directories:

**Main Platform (.env):**
```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
CLERK_SECRET_KEY="your_clerk_secret"

# AI System
GEMINI_API_KEY="your_gemini_api_key"
AI_SYSTEM_URL="http://localhost:8000"
MCP_SERVER_URL="http://localhost:8005"

# Stripe (for payments)
STRIPE_SECRET_KEY="your_stripe_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_public"
```

**AI System (AI-Part/.env):**
```env
GEMINI_API_KEY="your_gemini_api_key"
MCP_SERVER_HOST="localhost"
MCP_SERVER_PORT="8005"
```

### 2. Install Dependencies

**Main Platform:**
```bash
npm install
```

**AI System:**
```bash
cd AI-Part
pip install -r requirements.txt
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

## 🎯 Quick Start

### Option 1: Automated Startup (Recommended)

**Windows:**
```bash
./start-medical-system.bat
```

**Linux/Mac:**
```bash
chmod +x start-medical-system.sh
./start-medical-system.sh
```

### Option 2: Manual Startup

**Terminal 1 - MCP Medical Server:**
```bash
cd AI-Part
python mcp_medical_server.py
```

**Terminal 2 - LangGraph Chat System:**
```bash
cd AI-Part  
python langgraph_gemini_chat.py
```

**Terminal 3 - Next.js Platform:**
```bash
npm run dev
```

## 🔗 Service URLs

- **Medical Platform**: http://localhost:3000
- **LangGraph AI Chat**: http://localhost:8000  
- **MCP Medical Server**: http://localhost:8005

## 📋 API Endpoints

### AI Diagnosis API
```
POST /api/ai-diagnosis
```
**Body:** FormData with medical report file
**Response:** Comprehensive AI analysis with OCR, predictions, and recommendations

### Chat API (LangGraph)
```
POST http://localhost:8000/chat
```
**Body:**
```json
{
  "message": "Analyze this medical condition...",
  "conversation_id": "optional_id"
}
```

### MCP Tools
```
POST http://localhost:8005/call_tool
```
**Available Tools:**
- `Get_Diabetes_Score`
- `Get_Cardiovascular_Score`
- `Get_Patient_Data`
- `Get_Health_Insights`

## 🧪 Testing the Integration

### 1. Upload Medical Report
1. Go to http://localhost:3000
2. Navigate to AI Diagnosis section
3. Upload a medical report image
4. Watch the AI analysis process

### 2. Test Direct AI Chat
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the symptoms of diabetes?"}'
```

### 3. Test MCP Predictions
```bash
curl -X POST http://localhost:8005/call_tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Get_Diabetes_Score",
    "arguments": {
      "age": 45,
      "gender": "Male",
      "bmi": 28.5,
      "HbA1c_level": 6.5,
      "blood_glucose_level": 140
    }
  }'
```

## 🏗️ System Workflow

1. **File Upload** → Medical report uploaded to platform
2. **OCR Processing** → Google Vision API extracts text
3. **LangGraph Analysis** → Multi-step AI workflow processes medical data
4. **MCP Predictions** → Specialized health risk assessments  
5. **Synthesis** → Combined results presented professionally
6. **Recommendations** → AI suggests specialists and actions

## 🔧 Customization

### Adding New Medical Tools
1. Add tool to `mcp_medical_server.py`
2. Update LangGraph workflow in `langgraph_gemini_chat.py`
3. Modify frontend components as needed

### Integrating New APIs
1. Add API configuration to `healthcare_apis`
2. Create new tool functions
3. Update workflow routing

## 🐛 Troubleshooting

### Common Issues

**AI System Not Responding:**
- Check if all services are running on correct ports
- Verify API keys in .env files
- Check console logs for errors

**OCR Not Working:**
- Ensure GEMINI_API_KEY has Vision API access
- Check file format (supported: JPG, PNG, PDF)
- Verify file size limits

**MCP Predictions Failing:**
- Confirm MCP server is running on port 8005
- Check parameter formats in requests
- Review server logs

### Logs & Debugging

**View AI System Logs:**
```bash
# LangGraph system
curl http://localhost:8000/health

# MCP server  
curl http://localhost:8005/health
```

**Next.js Development Logs:**
Check console output in terminal running `npm run dev`

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Update API URLs for production endpoints
4. Set up proper API key management

### Build & Deploy
```bash
npm run build
npm start
```

### AI System Deployment
```bash
cd AI-Part
python -m uvicorn langgraph_gemini_chat:app --host 0.0.0.0 --port 8000
python -m uvicorn mcp_medical_server:app --host 0.0.0.0 --port 8005
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test AI integration thoroughly
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues with:
- **Platform Features**: Check Next.js console and logs
- **AI System**: Review Python service logs  
- **Integrations**: Verify API keys and endpoints

---

Built with ❤️ using LangGraph, Gemini AI, and MCP for professional medical AI assistance.