@echo off
setlocal enabledelayedexpansion

echo.
echo 🏥 Starting Medical AI System...
echo.

REM Colors (using Windows color codes)
set "GREEN=[92m"
set "BLUE=[94m"
set "RED=[91m"
set "NC=[0m"

echo %BLUE%Checking system dependencies...%NC%

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Node.js is not installed. Please install Node.js first.%NC%
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo %RED%Python is not installed. Please install Python first.%NC%
    pause
    exit /b 1
)

echo %GREEN%Dependencies check passed!%NC%
echo.

echo %BLUE%Starting AI System Components...%NC%
echo.

REM Start MCP Medical Server
echo %BLUE%1. Starting MCP Medical Server...%NC%
cd /d "%~dp0..\AI-Part"
start "MCP Medical Server" cmd /k "python mcp_medical_server.py"

REM Wait for MCP server to start
timeout /t 3 >nul

REM Start LangGraph Chat System
echo %BLUE%2. Starting LangGraph Chat System...%NC%
start "LangGraph Chat System" cmd /k "python langgraph_gemini_chat.py"

REM Wait for LangGraph system to start
timeout /t 5 >nul

REM Start Next.js Application
echo %BLUE%3. Starting Next.js Medical Platform...%NC%
cd /d "%~dp0"
start "Next.js Medical Platform" cmd /k "npm run dev"

echo.
echo %GREEN%🎉 Medical AI System Started Successfully!%NC%
echo.
echo %BLUE%Service URLs:%NC%
echo • Medical Platform: %GREEN%http://localhost:3000%NC%
echo • LangGraph AI Chat: %GREEN%http://localhost:8000%NC%
echo • MCP Medical Server: %GREEN%http://localhost:8005%NC%
echo.
echo %BLUE%Features Available:%NC%
echo • 🧠 AI-Powered Medical Report Analysis
echo • 🔍 OCR Text Extraction from Medical Reports
echo • 📊 MCP Medical Predictions (Diabetes, Cardiovascular)
echo • 🌍 WHO Health Data Integration
echo • 💊 FDA Drug Information Lookup
echo • 🏥 Professional Medical Platform
echo.
echo %BLUE%All services are starting in separate windows.%NC%
echo %BLUE%Close the command windows to stop individual services.%NC%
echo.
pause