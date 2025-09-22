#!/usr/bin/env node

/**
 * Setup script to enable real blockchain functionality
 * This script configures the environment and starts the system with real blockchain
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Real Blockchain Environment...');
console.log('==============================================');

// Read contract addresses
const contractAddresses = JSON.parse(fs.readFileSync('contract-addresses.json', 'utf8'));

console.log('📋 Contract Addresses:');
console.log(`   HerbTraceability: ${contractAddresses.HerbTraceability}`);
console.log(`   ComplianceManager: ${contractAddresses.ComplianceManager}`);
console.log(`   SustainabilityTracker: ${contractAddresses.SustainabilityTracker}`);

// Create environment configuration
const envConfig = `
# Real Blockchain Configuration
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=0xc86F42FF411936Bcb9eC7b9fA8c693E9d6014FA8

# Contract Addresses (deployed to local blockchain)
HERB_TRACEABILITY_CONTRACT_ADDRESS=${contractAddresses.HerbTraceability}
COMPLIANCE_MANAGER_CONTRACT_ADDRESS=${contractAddresses.ComplianceManager}
SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=${contractAddresses.SustainabilityTracker}

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/herb-traceability
DB_NAME=herb-traceability

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# IPFS Configuration (Optional)
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http
`;

// Write environment file
fs.writeFileSync('.env.real', envConfig);
console.log('✅ Environment configuration created: .env.real');

// Create startup script
const startupScript = `
@echo off
echo Starting Herb Traceability System with Real Blockchain...
echo.
echo Contract Addresses:
echo   HerbTraceability: ${contractAddresses.HerbTraceability}
echo   ComplianceManager: ${contractAddresses.ComplianceManager}
echo   SustainabilityTracker: ${contractAddresses.SustainabilityTracker}
echo.

REM Set environment variables
set ETHEREUM_RPC_URL=http://localhost:8545
set HERB_TRACEABILITY_CONTRACT_ADDRESS=${contractAddresses.HerbTraceability}
set COMPLIANCE_MANAGER_CONTRACT_ADDRESS=${contractAddresses.ComplianceManager}
set SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=${contractAddresses.SustainabilityTracker}
set PRIVATE_KEY=0xc86F42FF411936Bcb9eC7b9fA8c693E9d6014FA8

REM Start the server
npm start
`;

fs.writeFileSync('start-with-real-blockchain.bat', startupScript);
console.log('✅ Startup script created: start-with-real-blockchain.bat');

console.log('\n🎯 Setup Complete!');
console.log('==================');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Make sure Ganache is running: ganache-cli --port 8545');
console.log('2. Start the system with real blockchain:');
console.log('   - Windows: start-with-real-blockchain.bat');
console.log('   - Or manually set env vars and run: npm start');
console.log('');
console.log('🔗 Blockchain Info:');
console.log(`   Network: Local Development (Ganache)`);
console.log(`   RPC URL: http://localhost:8545`);
console.log(`   Chain ID: 5777`);
console.log('');
console.log('✅ Your collections will now be recorded on real blockchain!');
console.log('   Status will show "recorded" instead of "pending"');
