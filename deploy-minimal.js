#!/usr/bin/env node

/**
 * Minimal Deployment Script
 * Deploys simplified contracts that will fit within gas limits
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const { execSync } = require('child_process');

async function deployMinimal() {
  console.log('🚀 Minimal Deployment to Sepolia...\n');

  try {
    // First compile the simplified contract
    console.log('🔨 Compiling simplified contracts...');
    execSync('npx truffle compile', { stdio: 'inherit' });
    console.log('✅ Compilation completed\n');

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`📍 Deploying from: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} ETH`);

    if (parseFloat(balanceEth) < 0.02) {
      console.log('\n⚠️  Low balance detected!');
      console.log('💡 Get more Sepolia ETH from:');
      console.log('   - https://sepoliafaucet.com/');
      console.log('   - https://sepolia-faucet.pk910.de/');
      console.log('   - https://www.alchemy.com/faucets/ethereum-sepolia');
      console.log('\n⏳ Continuing with deployment...\n');
    }

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log(`⛽ Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei\n`);

    // Try to load basic contract first, then simplified, then original
    let HerbTraceabilityArtifact;
    try {
      HerbTraceabilityArtifact = require('./build/contracts/HerbTraceabilityBasic.json');
      console.log('📦 Using basic HerbTraceability contract');
    } catch (error) {
      try {
        HerbTraceabilityArtifact = require('./build/contracts/HerbTraceabilitySimple.json');
        console.log('📦 Using simplified HerbTraceability contract');
      } catch (error2) {
        HerbTraceabilityArtifact = require('./build/contracts/HerbTraceability.json');
        console.log('📦 Using original HerbTraceability contract');
      }
    }

    const ComplianceManagerArtifact = require('./build/contracts/ComplianceManager.json');
    const SustainabilityTrackerArtifact = require('./build/contracts/SustainabilityTracker.json');

    // Deploy HerbTraceability contract
    console.log('\n📦 Deploying HerbTraceability contract...');
    const HerbTraceabilityFactory = new ethers.ContractFactory(
      HerbTraceabilityArtifact.abi,
      HerbTraceabilityArtifact.bytecode,
      wallet
    );

    // Use a conservative gas limit
    const herbTraceability = await HerbTraceabilityFactory.deploy({
      gasLimit: 3000000, // Conservative limit
      gasPrice: gasPrice
    });
    
    console.log(`   Transaction: ${herbTraceability.deploymentTransaction().hash}`);
    console.log('   Waiting for confirmation...');
    
    await herbTraceability.waitForDeployment();
    const herbTraceabilityAddress = await herbTraceability.getAddress();
    console.log(`✅ HerbTraceability deployed: ${herbTraceabilityAddress}`);

    // Deploy ComplianceManager contract
    console.log('\n📦 Deploying ComplianceManager contract...');
    const ComplianceManagerFactory = new ethers.ContractFactory(
      ComplianceManagerArtifact.abi,
      ComplianceManagerArtifact.bytecode,
      wallet
    );

    const complianceManager = await ComplianceManagerFactory.deploy({
      gasLimit: 2000000,
      gasPrice: gasPrice
    });
    
    await complianceManager.waitForDeployment();
    const complianceManagerAddress = await complianceManager.getAddress();
    console.log(`✅ ComplianceManager deployed: ${complianceManagerAddress}`);

    // Deploy SustainabilityTracker contract
    console.log('\n📦 Deploying SustainabilityTracker contract...');
    const SustainabilityTrackerFactory = new ethers.ContractFactory(
      SustainabilityTrackerArtifact.abi,
      SustainabilityTrackerArtifact.bytecode,
      wallet
    );

    const sustainabilityTracker = await SustainabilityTrackerFactory.deploy({
      gasLimit: 2500000,
      gasPrice: gasPrice
    });
    
    await sustainabilityTracker.waitForDeployment();
    const sustainabilityTrackerAddress = await sustainabilityTracker.getAddress();
    console.log(`✅ SustainabilityTracker deployed: ${sustainabilityTrackerAddress}`);

    // Save contract addresses
    const contractAddresses = {
      HerbTraceability: herbTraceabilityAddress,
      ComplianceManager: complianceManagerAddress,
      SustainabilityTracker: sustainabilityTrackerAddress,
      network: 'sepolia',
      chainId: '11155111',
      deployedAt: new Date().toISOString(),
      deployedBy: wallet.address,
      version: 'minimal'
    };

    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(contractAddresses, null, 2)
    );

    // Update .env file
    updateEnvFile(contractAddresses);

    // Check final balance
    const finalBalance = await provider.getBalance(wallet.address);
    const finalBalanceEth = ethers.formatEther(finalBalance);
    const used = parseFloat(balanceEth) - parseFloat(finalBalanceEth);

    console.log('\n🎉 All contracts deployed successfully!');
    console.log(`💰 Gas used: ~${used.toFixed(4)} ETH`);
    console.log(`💰 Remaining balance: ${finalBalanceEth} ETH`);
    
    console.log('\n📋 Contract Addresses:');
    console.log(`   HerbTraceability: ${herbTraceabilityAddress}`);
    console.log(`   ComplianceManager: ${complianceManagerAddress}`);
    console.log(`   SustainabilityTracker: ${sustainabilityTrackerAddress}`);
    
    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${herbTraceabilityAddress}`);
    console.log(`   https://sepolia.etherscan.io/address/${complianceManagerAddress}`);
    console.log(`   https://sepolia.etherscan.io/address/${sustainabilityTrackerAddress}`);

    console.log('\n🚀 Next steps:');
    console.log('   npm start    # Start the server');
    console.log('   npm run verify    # Verify setup');

    return contractAddresses;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get more Sepolia ETH from faucets listed above');
    }
    
    if (error.message.includes('gas')) {
      console.log('\n💡 Try waiting a few minutes and running again');
      console.log('   Gas prices fluctuate on the network');
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
  deployMinimal().catch(console.error);
}

module.exports = { deployMinimal };
