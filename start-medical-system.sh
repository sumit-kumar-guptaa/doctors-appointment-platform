#!/bin/bash

# Medical AI System Startup Script
# This script starts both the Next.js app and the AI system components

echo "🏥 Starting Medical AI System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start a service in background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local directory=$4
    
    echo -e "${BLUE}Starting $name...${NC}"
    
    if [ -n "$directory" ]; then
        cd "$directory"
    fi
    
    if check_port $port; then
        echo -e "${RED}Port $port is already in use. $name may already be running.${NC}"
    else
        eval "$command" &
        echo -e "${GREEN}$name started on port $port${NC}"
    fi
}

# Check dependencies
echo -e "${BLUE}Checking system dependencies...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo -e "${RED}Python is not installed. Please install Python first.${NC}"
    exit 1
fi

echo -e "${GREEN}Dependencies check passed!${NC}"

# Start AI System Components
echo -e "\n${BLUE}Starting AI System Components...${NC}"

# Start MCP Medical Server
echo -e "${BLUE}1. Starting MCP Medical Server...${NC}"
start_service "MCP Medical Server" "python mcp_medical_server.py" 8005 "../AI-Part"

# Wait a bit for MCP server to start
sleep 2

# Start LangGraph Chat System
echo -e "${BLUE}2. Starting LangGraph Chat System...${NC}"
start_service "LangGraph Chat System" "python langgraph_gemini_chat.py" 8000 "../AI-Part"

# Wait a bit for LangGraph system to start
sleep 3

# Start Next.js Application
echo -e "\n${BLUE}Starting Next.js Medical Platform...${NC}"
start_service "Next.js Medical Platform" "npm run dev" 3000 "."

echo -e "\n${GREEN}🎉 Medical AI System Started Successfully!${NC}"
echo -e "\n${BLUE}Service URLs:${NC}"
echo -e "• Medical Platform: ${GREEN}http://localhost:3000${NC}"
echo -e "• LangGraph AI Chat: ${GREEN}http://localhost:8000${NC}"
echo -e "• MCP Medical Server: ${GREEN}http://localhost:8005${NC}"

echo -e "\n${BLUE}Features Available:${NC}"
echo -e "• 🧠 AI-Powered Medical Report Analysis"
echo -e "• 🔍 OCR Text Extraction from Medical Reports"
echo -e "• 📊 MCP Medical Predictions (Diabetes, Cardiovascular)"
echo -e "• 🌍 WHO Health Data Integration"
echo -e "• 💊 FDA Drug Information Lookup"
echo -e "• 🏥 Professional Medical Platform"

echo -e "\n${BLUE}To stop all services:${NC}"
echo -e "Press Ctrl+C or run: pkill -f 'python.*medical' && pkill -f 'npm.*dev'"

# Keep script running
wait