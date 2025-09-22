#!/usr/bin/env node

/**
 * HerbTrace System Startup Script
 * Starts both backend and frontend with proper configuration
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌿 Starting HerbTrace System...\n');

// Check if all required files exist
const requiredFiles = [
  '.env',
  'package.json',
  'server.js',
  'frontend/package.json',
  'frontend/src/App.js'
];

console.log('📋 Checking system requirements...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}
console.log('✅ All required files found\n');

// Check environment variables
console.log('🔧 Checking environment configuration...');
require('dotenv').config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ETHEREUM_RPC_URL',
  'PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  console.log('💡 Please check your .env file');
  process.exit(1);
}
console.log('✅ Environment configuration valid\n');

// Function to start a process with colored output
function startProcess(name, command, args, cwd, color) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting ${name}...`);
    
    const process = spawn(command, args, {
      cwd: cwd || __dirname,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`${color}[${name}]${'\x1b[0m'} ${output}`);
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning')) {
        console.log(`${color}[${name}]${'\x1b[0m'} ${output}`);
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} started successfully`);
        resolve();
      } else {
        console.error(`❌ ${name} failed with code ${code}`);
        reject(new Error(`${name} failed`));
      }
    });

    // Return the process for cleanup
    return process;
  });
}

// Install dependencies if needed
async function installDependencies() {
  console.log('📦 Checking dependencies...\n');
  
  // Check backend dependencies
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing backend dependencies...');
    await new Promise((resolve, reject) => {
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Backend dependencies installed\n');
          resolve();
        } else {
          reject(new Error('Backend dependency installation failed'));
        }
      });
    });
  }

  // Check frontend dependencies
  if (!fs.existsSync('frontend/node_modules')) {
    console.log('📦 Installing frontend dependencies...');
    await new Promise((resolve, reject) => {
      const install = spawn('npm', ['install'], { 
        cwd: 'frontend',
        stdio: 'inherit' 
      });
      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Frontend dependencies installed\n');
          resolve();
        } else {
          reject(new Error('Frontend dependency installation failed'));
        }
      });
    });
  }
}

// Main startup function
async function startSystem() {
  try {
    // Install dependencies if needed
    await installDependencies();

    console.log('🎯 Starting HerbTrace System Components...\n');

    // Start backend server
    const backendProcess = spawn('npm', ['start'], {
      stdio: 'pipe',
      shell: true
    });

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`\x1b[34m[Backend]\x1b[0m ${output}`);
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning')) {
        console.log(`\x1b[34m[Backend]\x1b[0m ${output}`);
      }
    });

    // Wait for backend to be ready
    await new Promise((resolve) => {
      const checkBackend = setInterval(() => {
        exec('curl -s http://localhost:5000/api/health', (error, stdout) => {
          if (!error && stdout.includes('ok')) {
            clearInterval(checkBackend);
            console.log('✅ Backend server is ready\n');
            resolve();
          }
        });
      }, 2000);
    });

    // Start frontend
    const frontendProcess = spawn('npm', ['start'], {
      cwd: 'frontend',
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, BROWSER: 'none' } // Prevent auto-opening browser
    });

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`\x1b[32m[Frontend]\x1b[0m ${output}`);
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning')) {
        console.log(`\x1b[32m[Frontend]\x1b[0m ${output}`);
      }
    });

    // Wait for frontend to be ready
    await new Promise((resolve) => {
      const checkFrontend = setInterval(() => {
        exec('curl -s http://localhost:3000', (error) => {
          if (!error) {
            clearInterval(checkFrontend);
            console.log('✅ Frontend server is ready\n');
            resolve();
          }
        });
      }, 2000);
    });

    // System ready
    console.log('\n🎉 HerbTrace System is now running!\n');
    console.log('📊 System URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000/api');
    console.log('   Health Check: http://localhost:5000/api/health');
    console.log('\n🔧 System Features:');
    console.log('   ✅ Real-time WebSocket updates');
    console.log('   ✅ Role-based access control');
    console.log('   ✅ Blockchain integration (Sepolia)');
    console.log('   ✅ QR code scanning');
    console.log('   ✅ Complete traceability workflow');
    console.log('\n👥 User Roles:');
    console.log('   🌱 Farmer: Track your own collections');
    console.log('   🏭 Processor: Process assigned batches');
    console.log('   🔬 Lab: Test assigned batches');
    console.log('   👤 Consumer: Verify any product');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Register as a farmer, processor, or lab');
    console.log('   3. Connect your MetaMask wallet');
    console.log('   4. Start creating and tracking herb batches!');
    console.log('\n📚 Documentation: Check frontend/README.md for detailed setup');
    console.log('\n⚠️  Press Ctrl+C to stop all services\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down HerbTrace System...');
      backendProcess.kill('SIGINT');
      frontendProcess.kill('SIGINT');
      setTimeout(() => {
        console.log('✅ System shutdown complete');
        process.exit(0);
      }, 2000);
    });

    // Keep the process running
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Failed to start system:', error.message);
    process.exit(1);
  }
}

// Run the startup
startSystem().catch(console.error);
