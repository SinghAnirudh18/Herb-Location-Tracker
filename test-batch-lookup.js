#!/usr/bin/env node

/**
 * Test batch lookup API endpoint
 */

const axios = require('axios');

async function testBatchLookup() {
  try {
    // First login as processor
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'processor@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Failed to login as processor');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully');
    
    // Test batch lookup
    const batchId = 'TUL-2024-602929';
    console.log(`\n🔍 Looking up batch: ${batchId}`);
    
    const response = await axios.get(`http://localhost:5000/api/processors/batches/${batchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      const batch = response.data.batch;
      console.log('✅ Batch lookup successful:');
      console.log(`   - Batch ID: ${batch.batchId}`);
      console.log(`   - Herb Species: ${batch.herbSpecies}`);
      console.log(`   - Quantity: ${batch.quantity} ${batch.unit}`);
      console.log(`   - Status: ${batch.status}`);
      console.log(`   - Blockchain Recorded: ${batch.blockchainRecorded ? 'Yes' : 'No'}`);
      console.log(`   - Farmer: ${batch.farmer?.name || 'Not found'}`);
      console.log(`   - Processor: ${batch.processor?.name || 'Not assigned'}`);
    } else {
      console.log('❌ Batch lookup failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

testBatchLookup();
