#!/usr/bin/env node

/**
 * Test web3Service directly
 */

const web3Service = require('./services/web3Service');

async function testWeb3Service() {
  try {
    console.log('🔍 Testing Web3Service directly...');
    
    // Initialize the service
    console.log('\n1. Initializing web3Service...');
    await web3Service.initialize();
    console.log('✅ Web3Service initialized');
    
    // Test basic methods
    console.log('\n2. Testing blockchain status...');
    const status = await web3Service.getBlockchainStatus();
    console.log('✅ Blockchain status:', status);
    
    console.log('\n3. Testing network info...');
    const networkInfo = await web3Service.getNetworkInfo();
    console.log('✅ Network info:', networkInfo);
    
    console.log('\n4. Testing batch verification...');
    try {
      const verified = await web3Service.isBatchVerified('TUL-2024-602929');
      console.log('✅ Batch verification:', verified);
    } catch (error) {
      console.log('❌ Batch verification error:', error.message);
    }
    
    console.log('\n5. Testing compliance check...');
    try {
      const compliant = await web3Service.checkCompliance('TUL-2024-602929');
      console.log('✅ Compliance check:', compliant);
    } catch (error) {
      console.log('❌ Compliance check error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWeb3Service();

