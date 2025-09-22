# HerbTrace Windows PowerShell Startup Script

Write-Host "🌿 Starting HerbTrace System on Windows..." -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Node.js and npm found" -ForegroundColor Green
Write-Host ""

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file with required configuration" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Configuration file found" -ForegroundColor Green
Write-Host ""

# Install backend dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Install frontend dependencies if needed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location ..
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🚀 Starting HerbTrace System..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will start on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will start on: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 5

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm start" -WindowStyle Normal

Write-Host "✅ Both services are starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "🎉 HerbTrace System is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 System URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend API: http://localhost:5000/api"
Write-Host "   Health Check: http://localhost:5000/api/health"
Write-Host ""
Write-Host "🔧 System Features:" -ForegroundColor Cyan
Write-Host "   ✅ Real-time WebSocket updates"
Write-Host "   ✅ Role-based access control"
Write-Host "   ✅ Blockchain integration (Sepolia)"
Write-Host "   ✅ QR code scanning"
Write-Host "   ✅ Complete traceability workflow"
Write-Host ""
Write-Host "👥 User Roles:" -ForegroundColor Cyan
Write-Host "   🌱 Farmer: Track your own collections"
Write-Host "   🏭 Processor: Process assigned batches"
Write-Host "   🔬 Lab: Test assigned batches"
Write-Host "   👤 Consumer: Verify any product"
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Wait for both services to fully start (check the new windows)"
Write-Host "   2. Open http://localhost:3000 in your browser"
Write-Host "   3. Register as a farmer, processor, or lab"
Write-Host "   4. Connect your MetaMask wallet"
Write-Host "   5. Start creating and tracking herb batches!"
Write-Host ""
Write-Host "📚 Documentation: Check frontend/README.md for detailed setup" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to close this window (services will continue running)"
