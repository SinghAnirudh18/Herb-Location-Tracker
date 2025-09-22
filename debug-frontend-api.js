#!/usr/bin/env node

/**
 * Debug frontend API calls
 */

const axios = require('axios');

// Simulate the frontend API call
async function debugFrontendAPI() {
  try {
    console.log('🔍 Testing frontend API simulation...');
    
    // First login as processor (like frontend would)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'processor@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    
    // Test the exact API call that frontend makes
    const batchId = 'TUL-2024-602929';
    console.log(`\n🔍 Making API call: GET /api/processors/batches/${batchId}`);
    
    const response = await axios.get(`http://localhost:5000/api/processors/batches/${batchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response received:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    
    if (response.data.success) {
      const batch = response.data.batch;
      console.log('\n📋 Batch Data:');
      console.log(`   - Batch ID: ${batch.batchId}`);
      console.log(`   - Herb Species: ${batch.herbSpecies}`);
      console.log(`   - Status: ${batch.status}`);
      console.log(`   - Blockchain Recorded: ${batch.blockchainRecorded}`);
      console.log(`   - Farmer: ${batch.farmer?.name || 'None'}`);
      console.log(`   - Processor: ${batch.processor?.name || 'None'}`);
      console.log(`   - Processing Steps: ${batch.processingSteps?.length || 0}`);
    } else {
      console.log('❌ API returned success: false');
      console.log(`   Message: ${response.data.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    console.error(`   Data:`, error.response?.data);
  }
}

debugFrontendAPI();
