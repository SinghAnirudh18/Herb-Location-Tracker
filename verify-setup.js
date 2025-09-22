#!/usr/bin/env node

/**
 * Setup Verification Script
 * Verifies that the blockchain setup is working correctly
 */

require('dotenv').config();
const { ethers } = require('ethers');

async function verifySetup() {
  console.log('🔍 Verifying Herb Traceability System Setup...\n');

  try {
    // 1. Check environment variables
    console.log('1. Checking environment variables...');
    const requiredVars = ['ETHEREUM_RPC_URL', 'PRIVATE_KEY', 'INFURA_PROJECT_ID'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.log('❌ Missing environment variables:', missing.join(', '));
      return false;
    }
    console.log('✅ Environment variables configured\n');

    // 2. Test blockchain connection
    console.log('2. Testing blockchain connection...');
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log(`✅ Connected to ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`✅ Latest block: ${blockNumber}\n`);

    // 3. Check wallet
    console.log('3. Checking wallet...');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`✅ Wallet address: ${wallet.address}`);
    console.log(`✅ Balance: ${balanceInEth} ETH\n`);

    if (parseFloat(balanceInEth) < 0.01) {
      console.log('⚠️  Low balance! Get Sepolia ETH from faucets.');
    }

    // 4. Check contract deployment
    console.log('4. Checking contract deployment...');
    const contractAddresses = {
      herbTraceability: process.env.HERB_TRACEABILITY_CONTRACT_ADDRESS,
      complianceManager: process.env.COMPLIANCE_MANAGER_CONTRACT_ADDRESS,
      sustainabilityTracker: process.env.SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS
    };

    let contractsDeployed = true;
    for (const [name, address] of Object.entries(contractAddresses)) {
      if (!address) {
        console.log(`❌ ${name} contract not deployed`);
        contractsDeployed = false;
      } else {
        const code = await provider.getCode(address);
        if (code === '0x') {
          console.log(`❌ ${name} contract not found at ${address}`);
          contractsDeployed = false;
        } else {
          console.log(`✅ ${name} deployed at ${address}`);
        }
      }
    }

    if (!contractsDeployed) {
      console.log('\n⚠️  Contracts not deployed. Run: npm run setup\n');
    }

    // 5. Test server health
    console.log('\n5. Testing server health...');
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
      console.log('✅ Server is running and healthy');
      console.log(`✅ Blockchain status: ${response.data.blockchain.connected ? 'Connected' : 'Disconnected'}`);
      console.log(`✅ IPFS status: ${response.data.ipfs.connected ? 'Connected' : 'Disconnected'}`);
    } catch (error) {
      console.log('❌ Server not running. Start with: npm start');
    }

    console.log('\n🎉 Setup verification completed!');
    
    if (contractsDeployed && parseFloat(balanceInEth) > 0.01) {
      console.log('✅ Your system is ready to use!');
      return true;
    } else {
      console.log('⚠️  Some issues found. Please address them before using the system.');
      return false;
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run verification if called directly
if (require.main === module) {
  verifySetup().catch(console.error);
}

module.exports = { verifySetup };
