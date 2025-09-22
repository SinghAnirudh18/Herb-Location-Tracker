#!/usr/bin/env node

/**
 * Setup blockchain environment variables and test blockchain recording
 */

const axios = require('axios');

// Set environment variables for local blockchain
process.env.ETHEREUM_RPC_URL = 'http://localhost:8545';
process.env.PRIVATE_KEY = '0xcf14f4f2d31089111e15e793505621221929e58e211734f9c52445ce63c3b8de';
process.env.HERB_TRACEABILITY_CONTRACT_ADDRESS = '0x8663a5D3b58cF4BD11452134209aB8Ed03bAF6B5';
process.env.COMPLIANCE_MANAGER_CONTRACT_ADDRESS = '0x41D97c2154ff8B7aE331Ffe848E59858742d12Ac';
process.env.SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS = '0x8D850034ACbeC0B2F8C911b699aE5c5dEfBa48B5';

async function testBlockchainRecording() {
  try {
    console.log('🔍 Testing Blockchain Recording with Local Contracts...');
    
    // Login as farmer
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testfarmer@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test blockchain status
    console.log('\n1. Testing blockchain status...');
    const statusResponse = await axios.get('http://localhost:5000/api/blockchain/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (statusResponse.data) {
      console.log('✅ Blockchain status working');
      console.log(`   - Connected: ${statusResponse.data.status.connected}`);
      console.log(`   - Network: ${statusResponse.data.status.network}`);
    } else {
      console.log('❌ Blockchain status failed');
    }
    
    // Test collection creation with blockchain recording
    console.log('\n2. Testing collection creation with blockchain recording...');
    
    const collectionData = {
      herbSpecies: 'Ashwagandha',
      quantity: 10,
      unit: 'kg',
      location: 'Test Location',
      qualityGrade: 'Premium',
      harvestMethod: 'Hand-picked',
      organicCertified: true,
      weatherConditions: 'Sunny',
      soilType: 'Loamy',
      notes: 'Test collection for blockchain recording'
    };
    
    const response = await axios.post('http://localhost:5000/api/farmers/collections', collectionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Collection created successfully');
      console.log(`   - Batch ID: ${response.data.collection.batchId}`);
      console.log(`   - Blockchain Recorded: ${response.data.collection.blockchainRecorded}`);
      console.log(`   - Transaction Hash: ${response.data.collection.transactionHash}`);
      console.log(`   - IPFS Hash: ${response.data.collection.ipfsHash}`);
      console.log(`   - Status: ${response.data.collection.status}`);
    } else {
      console.log('❌ Collection creation failed:', response.data.message);
    }
    
    // Test batch verification
    console.log('\n3. Testing batch verification...');
    const verifyResponse = await axios.get(`http://localhost:5000/api/blockchain/verify/${response.data.collection.batchId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (verifyResponse.data) {
      console.log('✅ Batch verification working');
      console.log(`   - Verified: ${verifyResponse.data.verified}`);
      console.log(`   - Compliant: ${verifyResponse.data.compliant}`);
    } else {
      console.log('❌ Batch verification failed');
    }
    
    console.log('\n🎉 Blockchain recording test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

testBlockchainRecording();
