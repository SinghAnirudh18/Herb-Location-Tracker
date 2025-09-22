#!/usr/bin/env node

/**
 * Test blockchain recording functionality
 */

const axios = require('axios');

async function testBlockchainRecording() {
  try {
    console.log('🔍 Testing Blockchain Recording...');
    
    // First login as farmer
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testfarmer@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test creating a collection (this should trigger blockchain recording)
    console.log('\n1. Testing collection creation with blockchain recording...');
    
    const collectionData = {
      herbSpecies: 'Tulsi',
      quantity: 5,
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
    
    // Test blockchain status endpoint
    console.log('\n2. Testing blockchain status endpoint...');
    const statusResponse = await axios.get('http://localhost:5000/api/blockchain/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (statusResponse.data) {
      console.log('✅ Blockchain status retrieved');
      console.log(`   - Connected: ${statusResponse.data.status.connected}`);
      console.log(`   - Network: ${statusResponse.data.status.network}`);
      console.log(`   - Chain ID: ${statusResponse.data.status.chainId}`);
    } else {
      console.log('❌ Failed to get blockchain status');
    }
    
    // Test blockchain recording endpoint directly
    console.log('\n3. Testing blockchain recording endpoint directly...');
    const blockchainData = {
      batchId: 'TEST-2024-999999',
      herbSpecies: 'Test Herb',
      quantity: 1,
      location: 'Test Location',
      qualityGrade: 'Test',
      harvestMethod: 'Hand-picked',
      organicCertified: true,
      walletAddress: '0x1234567890123456789012345678901234567890'
    };
    
    try {
      const blockchainResponse = await axios.post('http://localhost:5000/api/blockchain/record-collection', blockchainData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (blockchainResponse.data.success) {
        console.log('✅ Blockchain recording successful');
        console.log(`   - Transaction Hash: ${blockchainResponse.data.txHash}`);
        console.log(`   - Block Number: ${blockchainResponse.data.blockNumber}`);
        console.log(`   - IPFS Hash: ${blockchainResponse.data.ipfsHash}`);
      } else {
        console.log('❌ Blockchain recording failed:', blockchainResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Blockchain recording endpoint error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

testBlockchainRecording();
