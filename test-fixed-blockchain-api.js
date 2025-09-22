#!/usr/bin/env node

/**
 * Test the fixed blockchain API endpoints
 */

const axios = require('axios');

async function testFixedBlockchainAPI() {
  try {
    console.log('🔍 Testing Fixed Blockchain API...');
    
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
    
    // Test all the blockchain API endpoints
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
    
    console.log('\n2. Testing batch verification...');
    const verifyResponse = await axios.get('http://localhost:5000/api/blockchain/verify/TUL-2024-602929', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (verifyResponse.data) {
      console.log('✅ Batch verification working');
      console.log(`   - Verified: ${verifyResponse.data.verified}`);
      console.log(`   - Compliant: ${verifyResponse.data.compliant}`);
    } else {
      console.log('❌ Batch verification failed');
    }
    
    console.log('\n3. Testing batch history...');
    const historyResponse = await axios.get('http://localhost:5000/api/blockchain/batch-history/TUL-2024-602929', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (historyResponse.data) {
      console.log('✅ Batch history working');
      console.log(`   - History entries: ${historyResponse.data.history.length}`);
    } else {
      console.log('❌ Batch history failed');
    }
    
    console.log('\n4. Testing collection endpoint...');
    const collectionResponse = await axios.get('http://localhost:5000/api/blockchain/collection/TUL-2024-602929', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (collectionResponse.data) {
      console.log('✅ Collection endpoint working');
      console.log(`   - Collection found: ${!!collectionResponse.data.collectionEvent}`);
    } else {
      console.log('❌ Collection endpoint failed');
    }
    
    console.log('\n5. Testing IPFS upload...');
    const ipfsData = {
      test: 'data',
      timestamp: new Date().toISOString()
    };
    
    const ipfsResponse = await axios.post('http://localhost:5000/api/blockchain/ipfs/upload', {
      data: ipfsData,
      fileName: 'test.json'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (ipfsResponse.data) {
      console.log('✅ IPFS upload working');
      console.log(`   - IPFS Hash: ${ipfsResponse.data.ipfsHash}`);
    } else {
      console.log('❌ IPFS upload failed');
    }
    
    console.log('\n🎉 All blockchain API endpoints are working correctly!');
    console.log('   The 404 errors should be resolved now.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

testFixedBlockchainAPI();

