#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Herb Traceability System - Real Blockchain Setup');
console.log('==================================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created!\n');
} else {
  console.log('✅ .env file already exists\n');
}

console.log('🔧 BLOCKCHAIN SETUP REQUIRED:');
console.log('=============================\n');

console.log('1. 📱 METAMASK WALLET SETUP:');
console.log('   - Install MetaMask browser extension');
console.log('   - Create a new wallet or import existing');
console.log('   - Switch to Sepolia Testnet');
console.log('   - Get testnet ETH from: https://sepoliafaucet.com/\n');

console.log('2. 🔗 INFURA SETUP:');
console.log('   - Go to https://infura.io and create free account');
console.log('   - Create new project');
console.log('   - Copy Sepolia endpoint URL\n');

console.log('3. 🔑 GET YOUR WALLET CREDENTIALS:');
console.log('   - In MetaMask: Settings > Security & Privacy > Reveal Private Key');
console.log('   - Copy your private key (starts with 0x...)');
console.log('   - Or get your 12-word mnemonic phrase\n');

console.log('4. ✏️  UPDATE YOUR .env FILE:');
console.log('   Replace these values in .env:');
console.log('   - ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
console.log('   - PRIVATE_KEY=your-private-key-from-metamask');
console.log('   - MNEMONIC=your-mnemonic-phrase-from-metamask');
console.log('   - INFURA_PROJECT_ID=your-infura-project-id\n');

console.log('5. 📦 INSTALL DEPENDENCIES:');
console.log('   Run: npm install\n');

console.log('6. 🏗️  COMPILE & DEPLOY CONTRACTS:');
console.log('   Run: npm run compile');
console.log('   Run: npm run migrate:sepolia\n');

console.log('7. 🚀 START THE SYSTEM:');
console.log('   Run: npm start\n');

console.log('💡 TIPS:');
console.log('========');
console.log('• Keep your private keys SECURE - never share them');
console.log('• Sepolia ETH is free but has real value on mainnet');
console.log('• Test thoroughly on Sepolia before mainnet');
console.log('• Contract deployment costs gas fees (paid in ETH)\n');

console.log('❓ NEED HELP?');
console.log('=============');
console.log('• Check the logs when running the system');
console.log('• Ensure all environment variables are set');
console.log('• Make sure you have enough Sepolia ETH for gas\n');

// Check if dependencies are installed
console.log('🔍 CHECKING DEPENDENCIES...');
try {
  require('@truffle/hdwallet-provider');
  console.log('✅ Truffle HDWallet Provider: Installed');
} catch (e) {
  console.log('❌ Truffle HDWallet Provider: Missing');
  console.log('   Run: npm install @truffle/hdwallet-provider');
}

try {
  require('web3');
  console.log('✅ Web3: Installed');
} catch (e) {
  console.log('❌ Web3: Missing');
  console.log('   Run: npm install web3');
}

console.log('\n🎯 Ready to set up real blockchain connectivity!');
console.log('   Follow the steps above and then run: npm start');
