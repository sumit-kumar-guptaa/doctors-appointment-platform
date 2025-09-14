#!/usr/bin/env pwsh
# Start the Next.js application

# Ensure we're in the correct directory
Set-Location "D:\hakathonn\doctors-appointment-platform"

# Check if we're in the right place
if (Test-Path "package.json") {
    Write-Host "Starting Next.js application..." -ForegroundColor Green
    
    # Try to start on port 3001 first, then fallback to default
    $env:PORT = "3001"
    npm run dev
} else {
    Write-Host "Error: package.json not found in current directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
}