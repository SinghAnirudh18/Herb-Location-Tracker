#!/usr/bin/env node

/**
 * Simple Deployment Script with Gas Estimation
 * Deploys contracts with proper gas estimation
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Contract artifacts
const HerbTraceabilityArtifact = require('./build/contracts/HerbTraceability.json');
const ComplianceManagerArtifact = require('./build/contracts/ComplianceManager.json');
const SustainabilityTrackerArtifact = require('./build/contracts/SustainabilityTracker.json');

async function deployWithEstimation() {
  console.log('🚀 Simple Deployment to Sepolia...\n');

  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`📍 Deploying from: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log(`⛽ Current gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei\n`);

    // Deploy HerbTraceability contract
    console.log('📦 Deploying HerbTraceability contract...');
    const HerbTraceabilityFactory = new ethers.ContractFactory(
      HerbTraceabilityArtifact.abi,
      HerbTraceabilityArtifact.bytecode,
      wallet
    );

    // Estimate gas for deployment
    const deploymentData = HerbTraceabilityFactory.getDeployTransaction();
    const estimatedGas = await provider.estimateGas(deploymentData);
    const gasLimit = estimatedGas + (estimatedGas * 20n / 100n); // Add 20% buffer
    
    console.log(`   Estimated gas: ${estimatedGas.toString()}`);
    console.log(`   Gas limit (with buffer): ${gasLimit.toString()}`);

    const herbTraceability = await HerbTraceabilityFactory.deploy({
      gasLimit: gasLimit,
      gasPrice: gasPrice
    });
    
    console.log(`   Transaction hash: ${herbTraceability.deploymentTransaction().hash}`);
    console.log('   Waiting for confirmation...');
    
    await herbTraceability.waitForDeployment();
    const herbTraceabilityAddress = await herbTraceability.getAddress();
    console.log(`✅ HerbTraceability deployed at: ${herbTraceabilityAddress}\n`);

    // Deploy ComplianceManager contract
    console.log('📦 Deploying ComplianceManager contract...');
    const ComplianceManagerFactory = new ethers.ContractFactory(
      ComplianceManagerArtifact.abi,
      ComplianceManagerArtifact.bytecode,
      wallet
    );

    const complianceManager = await ComplianceManagerFactory.deploy({
      gasPrice: gasPrice
    });
    
    console.log(`   Transaction hash: ${complianceManager.deploymentTransaction().hash}`);
    await complianceManager.waitForDeployment();
    const complianceManagerAddress = await complianceManager.getAddress();
    console.log(`✅ ComplianceManager deployed at: ${complianceManagerAddress}\n`);

    // Deploy SustainabilityTracker contract
    console.log('📦 Deploying SustainabilityTracker contract...');
    const SustainabilityTrackerFactory = new ethers.ContractFactory(
      SustainabilityTrackerArtifact.abi,
      SustainabilityTrackerArtifact.bytecode,
      wallet
    );

    const sustainabilityTracker = await SustainabilityTrackerFactory.deploy({
      gasPrice: gasPrice
    });
    
    console.log(`   Transaction hash: ${sustainabilityTracker.deploymentTransaction().hash}`);
    await sustainabilityTracker.waitForDeployment();
    const sustainabilityTrackerAddress = await sustainabilityTracker.getAddress();
    console.log(`✅ SustainabilityTracker deployed at: ${sustainabilityTrackerAddress}\n`);

    // Save contract addresses
    const contractAddresses = {
      HerbTraceability: herbTraceabilityAddress,
      ComplianceManager: complianceManagerAddress,
      SustainabilityTracker: sustainabilityTrackerAddress,
      network: 'sepolia',
      chainId: '11155111',
      deployedAt: new Date().toISOString(),
      deployedBy: wallet.address
    };

    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(contractAddresses, null, 2)
    );

    // Update .env file
    updateEnvFile(contractAddresses);

    console.log('🎉 All contracts deployed successfully!');
    console.log('\n📋 Contract Addresses:');
    console.log(`   HerbTraceability: ${herbTraceabilityAddress}`);
    console.log(`   ComplianceManager: ${complianceManagerAddress}`);
    console.log(`   SustainabilityTracker: ${sustainabilityTrackerAddress}`);
    
    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${herbTraceabilityAddress}`);
    console.log(`   https://sepolia.etherscan.io/address/${complianceManagerAddress}`);
    console.log(`   https://sepolia.etherscan.io/address/${sustainabilityTrackerAddress}`);

    return contractAddresses;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get more Sepolia ETH from faucets');
    }
    
    throw error;
  }
}

function updateEnvFile(addresses) {
  console.log('\n📝 Updating .env file...');
  
  let envContent = fs.readFileSync('.env', 'utf8');
  
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
  console.log('✅ .env file updated');
}

if (require.main === module) {
  deployWithEstimation().catch(console.error);
}

module.exports = { deployWithEstimation };
