@echo off
echo 🌿 Starting HerbTrace System on Windows...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and npm found
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found
    echo Please create .env file with required configuration
    pause
    exit /b 1
)

echo ✅ Configuration file found
echo.

REM Install backend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
    echo.
)

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Frontend dependencies installed
    echo.
)

echo 🚀 Starting HerbTrace System...
echo.
echo Backend will start on: http://localhost:5000
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start both backend and frontend
start "HerbTrace Backend" cmd /k "npm start"
timeout /t 5 /nobreak >nul
start "HerbTrace Frontend" cmd /k "cd frontend && npm start"

echo ✅ Both services are starting...
echo.
echo 🎉 HerbTrace System is now running!
echo.
echo 📊 System URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000/api
echo    Health Check: http://localhost:5000/api/health
echo.
echo 💡 Next Steps:
echo    1. Wait for both services to fully start
echo    2. Open http://localhost:3000 in your browser
echo    3. Register as a farmer, processor, or lab
echo    4. Connect your MetaMask wallet
echo    5. Start creating and tracking herb batches!
echo.

pause
