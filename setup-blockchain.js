#!/usr/bin/env node

/**
 * Blockchain Setup Script for Herb Traceability System
 * This script helps set up the blockchain environment for Sepolia testnet
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌿 Herb Traceability System - Blockchain Setup');
console.log('================================================\n');

// Check if required directories exist
function ensureDirectories() {
  const dirs = ['build', 'build/contracts'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Check environment variables
function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  
  const requiredVars = [
    'ETHEREUM_RPC_URL',
    'PRIVATE_KEY',
    'MNEMONIC',
    'INFURA_PROJECT_ID'
  ];
  
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n❌ Missing environment variables:');
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    
    console.log('\n📝 Please update your .env file with the missing variables.');
    console.log('See the setup guide below for how to get these values.\n');
    return false;
  }
  
  console.log('\n✅ All environment variables are set!\n');
  return true;
}

// Check if wallet has Sepolia ETH
async function checkWalletBalance() {
  try {
    const { ethers } = require('ethers');
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`💰 Wallet Address: ${wallet.address}`);
    console.log(`💰 Sepolia ETH Balance: ${balanceInEth} ETH`);
    
    if (parseFloat(balanceInEth) < 0.1) {
      console.log('\n⚠️  Low balance! You need Sepolia ETH to deploy contracts.');
      console.log('Get free Sepolia ETH from these faucets:');
      console.log('   - https://sepoliafaucet.com/');
      console.log('   - https://sepolia-faucet.pk910.de/');
      console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia\n');
      return false;
    }
    
    console.log('✅ Sufficient balance for deployment!\n');
    return true;
  } catch (error) {
    console.log('❌ Error checking wallet balance:', error.message);
    return false;
  }
}

// Compile contracts
function compileContracts() {
  console.log('🔨 Compiling smart contracts...\n');
  
  try {
    execSync('npx truffle compile', { stdio: 'inherit' });
    console.log('\n✅ Contracts compiled successfully!\n');
    return true;
  } catch (error) {
    console.log('❌ Error compiling contracts:', error.message);
    return false;
  }
}

// Deploy contracts
async function deployContracts() {
  console.log('🚀 Deploying contracts to Sepolia testnet...\n');
  
  try {
    // Try truffle migrate first
    console.log('📦 Attempting deployment with Truffle...');
    execSync('npx truffle migrate --network sepolia', { stdio: 'inherit' });
    console.log('\n✅ Contracts deployed successfully with Truffle!\n');
    
    // Update .env file with contract addresses
    if (fs.existsSync('contract-addresses.json')) {
      const addresses = JSON.parse(fs.readFileSync('contract-addresses.json', 'utf8'));
      updateEnvFile(addresses);
    }
    
    return true;
  } catch (error) {
    console.log('⚠️  Truffle deployment failed, trying alternative method...\n');
    
    try {
      // Use alternative deployment script
      const { deployContracts: altDeploy } = require('./deploy-sepolia.js');
      await altDeploy();
      return true;
    } catch (altError) {
      console.log('❌ Alternative deployment also failed:', altError.message);
      return false;
    }
  }
}

// Update .env file with contract addresses
function updateEnvFile(addresses) {
  console.log('📝 Updating .env file with contract addresses...\n');
  
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // Update contract addresses
  envContent = envContent.replace(
    /HERB_TRACEABILITY_CONTRACT_ADDRESS=.*/,
    `HERB_TRACEABILITY_CONTRACT_ADDRESS=${addresses.HerbTraceability}`
  );
  envContent = envContent.replace(
    /COMPLIANCE_MANAGER_CONTRACT_ADDRESS=.*/,
    `COMPLIANCE_MANAGER_CONTRACT_ADDRESS=${addresses.ComplianceManager}`
  );
  envContent = envContent.replace(
    /SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=.*/,
    `SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=${addresses.SustainabilityTracker}`
  );
  
  fs.writeFileSync('.env', envContent);
  
  console.log('✅ Contract addresses updated in .env file');
  console.log(`   - HerbTraceability: ${addresses.HerbTraceability}`);
  console.log(`   - ComplianceManager: ${addresses.ComplianceManager}`);
  console.log(`   - SustainabilityTracker: ${addresses.SustainabilityTracker}\n`);
}

// Print setup guide
function printSetupGuide() {
  console.log('📚 SETUP GUIDE - How to get required APIs and services:\n');
  
  console.log('1. 🦊 MetaMask Wallet Setup:');
  console.log('   - Install MetaMask browser extension');
  console.log('   - Create a new wallet or import existing one');
  console.log('   - Switch to Sepolia testnet');
  console.log('   - Copy your private key (Account Details > Export Private Key)');
  console.log('   - Copy your seed phrase (Settings > Security & Privacy > Reveal Seed Phrase)\n');
  
  console.log('2. 🌐 Infura Setup (Ethereum RPC Provider):');
  console.log('   - Go to https://infura.io/');
  console.log('   - Create a free account');
  console.log('   - Create a new project');
  console.log('   - Copy the Project ID');
  console.log('   - Use: https://sepolia.infura.io/v3/YOUR_PROJECT_ID\n');
  
  console.log('3. 💰 Get Sepolia ETH (Free):');
  console.log('   - https://sepoliafaucet.com/');
  console.log('   - https://sepolia-faucet.pk910.de/');
  console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia');
  console.log('   - Paste your wallet address and request ETH\n');
  
  console.log('4. 📁 IPFS Setup (Optional - for file storage):');
  console.log('   - Local: Install IPFS Desktop from https://ipfs.io/');
  console.log('   - Remote: Use Pinata (https://pinata.cloud/) or Infura IPFS\n');
  
  console.log('5. 🗄️  MongoDB Setup:');
  console.log('   - Local: Install MongoDB Community Server');
  console.log('   - Cloud: Use MongoDB Atlas (https://www.mongodb.com/atlas)\n');
  
  console.log('📝 Update your .env file with these values:');
  console.log('   ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
  console.log('   PRIVATE_KEY=your_metamask_private_key');
  console.log('   MNEMONIC=your_metamask_seed_phrase');
  console.log('   INFURA_PROJECT_ID=your_infura_project_id');
  console.log('   MONGODB_URI=mongodb://localhost:27017/herb_traceability\n');
}

// Main setup function
async function main() {
  // Load environment variables
  require('dotenv').config();
  
  // Ensure directories exist
  ensureDirectories();
  
  // Check environment
  if (!checkEnvironment()) {
    printSetupGuide();
    process.exit(1);
  }
  
  // Check wallet balance
  if (!(await checkWalletBalance())) {
    process.exit(1);
  }
  
  // Compile contracts
  if (!compileContracts()) {
    process.exit(1);
  }
  
  // Deploy contracts
  if (!deployContracts()) {
    process.exit(1);
  }
  
  console.log('🎉 Blockchain setup completed successfully!');
  console.log('\n🚀 You can now start the server with: npm start');
  console.log('📊 Check API health at: http://localhost:5000/api/health\n');
}

// Run setup if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkEnvironment,
  checkWalletBalance,
  compileContracts,
  deployContracts,
  printSetupGuide
};
