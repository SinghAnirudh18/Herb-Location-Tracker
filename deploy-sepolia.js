#!/usr/bin/env node

/**
 * Alternative Sepolia Deployment Script
 * Handles network connectivity issues better than truffle migrate
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract artifacts
const HerbTraceabilityArtifact = require('./build/contracts/HerbTraceability.json');
const ComplianceManagerArtifact = require('./build/contracts/ComplianceManager.json');
const SustainabilityTrackerArtifact = require('./build/contracts/SustainabilityTracker.json');

async function deployContracts() {
  console.log('🚀 Deploying contracts to Sepolia testnet...\n');

  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`📍 Deploying from: ${wallet.address}`);
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
      throw new Error('Insufficient balance for deployment');
    }

    // Deploy HerbTraceability contract
    console.log('📦 Deploying HerbTraceability contract...');
    const HerbTraceabilityFactory = new ethers.ContractFactory(
      HerbTraceabilityArtifact.abi,
      HerbTraceabilityArtifact.bytecode,
      wallet
    );

    const herbTraceability = await HerbTraceabilityFactory.deploy({
      gasLimit: 6000000,
      gasPrice: ethers.parseUnits('25', 'gwei')
    });
    
    await herbTraceability.waitForDeployment();
    const herbTraceabilityAddress = await herbTraceability.getAddress();
    console.log(`✅ HerbTraceability deployed at: ${herbTraceabilityAddress}`);

    // Deploy ComplianceManager contract
    console.log('\n📦 Deploying ComplianceManager contract...');
    const ComplianceManagerFactory = new ethers.ContractFactory(
      ComplianceManagerArtifact.abi,
      ComplianceManagerArtifact.bytecode,
      wallet
    );

    const complianceManager = await ComplianceManagerFactory.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits('25', 'gwei')
    });
    
    await complianceManager.waitForDeployment();
    const complianceManagerAddress = await complianceManager.getAddress();
    console.log(`✅ ComplianceManager deployed at: ${complianceManagerAddress}`);

    // Deploy SustainabilityTracker contract
    console.log('\n📦 Deploying SustainabilityTracker contract...');
    const SustainabilityTrackerFactory = new ethers.ContractFactory(
      SustainabilityTrackerArtifact.abi,
      SustainabilityTrackerArtifact.bytecode,
      wallet
    );

    const sustainabilityTracker = await SustainabilityTrackerFactory.deploy({
      gasLimit: 3500000,
      gasPrice: ethers.parseUnits('25', 'gwei')
    });
    
    await sustainabilityTracker.waitForDeployment();
    const sustainabilityTrackerAddress = await sustainabilityTracker.getAddress();
    console.log(`✅ SustainabilityTracker deployed at: ${sustainabilityTrackerAddress}`);

    // Set up initial configuration for development
    console.log('\n⚙️  Setting up initial configuration...');
    
    try {
      // Add authorized addresses (using deployer as initial authorized user)
      await herbTraceability.addAuthorizedCollector(wallet.address);
      await herbTraceability.addAuthorizedProcessor(wallet.address);
      await herbTraceability.addAuthorizedLab(wallet.address);
      await herbTraceability.addAuthorizedManufacturer(wallet.address);
      await herbTraceability.addAuthorizedRegulator(wallet.address);
      
      console.log('✅ Initial authorization setup completed');
    } catch (error) {
      console.log('⚠️  Initial setup failed (contracts still deployed):', error.message);
    }

    // Save contract addresses
    const contractAddresses = {
      HerbTraceability: herbTraceabilityAddress,
      ComplianceManager: complianceManagerAddress,
      SustainabilityTracker: sustainabilityTrackerAddress,
      network: network.name,
      chainId: network.chainId.toString(),
      deployedAt: new Date().toISOString(),
      deployedBy: wallet.address
    };

    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(contractAddresses, null, 2)
    );

    console.log('\n📄 Contract addresses saved to contract-addresses.json');

    // Update .env file
    updateEnvFile(contractAddresses);

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Contract Addresses:');
    console.log(`   HerbTraceability: ${herbTraceabilityAddress}`);
    console.log(`   ComplianceManager: ${complianceManagerAddress}`);
    console.log(`   SustainabilityTracker: ${sustainabilityTrackerAddress}`);

    return contractAddresses;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get more Sepolia ETH from:');
      console.log('   - https://sepoliafaucet.com/');
      console.log('   - https://sepolia-faucet.pk910.de/');
    }
    
    if (error.message.includes('network')) {
      console.log('\n💡 Check your network configuration:');
      console.log('   - Verify ETHEREUM_RPC_URL in .env');
      console.log('   - Check internet connectivity');
      console.log('   - Try again in a few minutes');
    }
    
    throw error;
  }
}

function updateEnvFile(addresses) {
  console.log('\n📝 Updating .env file with contract addresses...');
  
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
  console.log('✅ .env file updated with contract addresses');
}

// Run deployment if called directly
if (require.main === module) {
  deployContracts().catch(console.error);
}

module.exports = { deployContracts };
