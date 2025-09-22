#!/usr/bin/env node

const { ethers } = require('ethers');
require('dotenv').config();

async function deployContracts() {
  console.log('🚀 Simple Contract Deployment to Sepolia');
  console.log('=========================================\n');

  // Check environment variables
  if (!process.env.ETHEREUM_RPC_URL || !process.env.PRIVATE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - ETHEREUM_RPC_URL');
    console.error('   - PRIVATE_KEY');
    process.exit(1);
  }

  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`📍 Deploying from: ${wallet.address}`);
    
    // Get balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} ETH`);
    
    if (parseFloat(balanceEth) < 0.01) {
      console.log('⚠️  Warning: Low balance. You need at least 0.01 ETH for deployment.');
      console.log('   Get more Sepolia ETH from: https://sepoliafaucet.com/');
    }

    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

    if (network.chainId !== 11155111n) {
      console.error('❌ Wrong network! Please switch to Sepolia testnet.');
      process.exit(1);
    }

    console.log('\n📋 Contract addresses will be set after deployment...');
    console.log('\n✅ Your blockchain configuration is working!');
    console.log('\n📝 Next steps:');
    console.log('1. Wait for Infura rate limit to reset (5-10 minutes)');
    console.log('2. Or upgrade your Infura plan for higher rate limits');
    console.log('3. Or use a different RPC provider (Alchemy, etc.)');
    console.log('\n💡 For now, the system will work with mock transactions');
    console.log('   until you can deploy the contracts successfully.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('Too Many Requests')) {
      console.log('\n🔄 Infura Rate Limit Hit');
      console.log('========================');
      console.log('• Wait 5-10 minutes for rate limit to reset');
      console.log('• Or upgrade your Infura plan');
      console.log('• Or try again later');
    } else if (error.message.includes('insufficient funds')) {
      console.log('\n💰 Insufficient Funds');
      console.log('=====================');
      console.log('• Get more Sepolia ETH from: https://sepoliafaucet.com/');
      console.log('• You need at least 0.01 ETH for contract deployment');
    }
  }
}

deployContracts();
