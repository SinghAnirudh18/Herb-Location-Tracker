#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🏗️  Herb Traceability - Contract Deployment');
console.log('==========================================\n');

// Check required environment variables
const requiredVars = [
  'ETHEREUM_RPC_URL',
  'PRIVATE_KEY',
  'MNEMONIC'
];

console.log('🔍 Checking environment variables...');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  if (!process.env[varName] || process.env[varName].includes('your-') || process.env[varName].includes('YOUR_')) {
    console.log(`❌ ${varName}: Not configured`);
    allVarsPresent = false;
  } else {
    console.log(`✅ ${varName}: Configured`);
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Please configure all required environment variables first!');
  console.log('   Run: node setup-blockchain-real.js for setup instructions');
  process.exit(1);
}

console.log('\n🚀 Starting contract deployment...');

// Create deployment commands
const commands = [
  'npm run compile',
  'npm run migrate:sepolia'
];

async function runCommands() {
  for (const cmd of commands) {
    console.log(`\n📦 Running: ${cmd}`);
    try {
      const { execSync } = require('child_process');
      const output = execSync(cmd, { encoding: 'utf8', stdio: 'inherit' });
      console.log('✅ Command completed successfully');
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Check if contracts are already deployed
const contractAddresses = [
  'HERB_TRACEABILITY_CONTRACT_ADDRESS',
  'COMPLIANCE_MANAGER_CONTRACT_ADDRESS',
  'SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS'
];

const contractsDeployed = contractAddresses.every(addr => 
  process.env[addr] && process.env[addr].startsWith('0x')
);

if (contractsDeployed) {
  console.log('\n✅ Contracts appear to be already deployed!');
  console.log('   Contract addresses found in environment variables.');
  
  console.log('\n📋 Current Contract Addresses:');
  contractAddresses.forEach(addr => {
    console.log(`   ${addr}: ${process.env[addr]}`);
  });
  
  console.log('\n🚀 Starting server...');
  try {
    const { execSync } = require('child_process');
    execSync('node server.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
  }
} else {
  console.log('\n🏗️  Contracts need to be deployed...');
  runCommands().then(() => {
    console.log('\n✅ Deployment completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the contract addresses from the deployment output');
    console.log('2. Add them to your .env file');
    console.log('3. Restart the server: npm start');
  }).catch(error => {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  });
}
