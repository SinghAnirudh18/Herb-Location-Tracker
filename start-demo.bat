@echo off
echo 🚀 Starting Herb Traceability System Demo
echo =========================================
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Setting up local blockchain...
call node setup-local-blockchain.js

echo.
echo ⛓️  Starting Ganache local blockchain...
start "Ganache" cmd /k "npm run ganache"

echo.
echo ⏳ Waiting for Ganache to start...
timeout /t 5 /nobreak > nul

echo.
echo 📄 Deploying smart contracts...
call npm run migrate:dev

echo.
echo 🗄️  Starting MongoDB (make sure it's installed and running)...
echo    If MongoDB is not running, start it manually:
echo    mongod --dbpath C:\data\db

echo.
echo 🔧 Starting backend server...
start "Backend" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Starting frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ⏳ Waiting for frontend to start...
timeout /t 10 /nobreak > nul

echo.
echo 🧪 Running demo test...
call node quick-demo.js

echo.
echo 🎉 Demo System Started!
echo ======================
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔗 Backend:  http://localhost:5000
echo ⛓️  Ganache:  http://localhost:8545
echo.
echo 👤 Demo Farmer Credentials:
echo    Email: farmer@demo.com
echo    Password: demo123
echo.
echo 🎯 Ready for presentation!
echo.
pause
