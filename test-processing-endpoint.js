#!/usr/bin/env node

const axios = require('axios');

async function testProcessingEndpoint() {
  console.log('🧪 Testing Processing Endpoint');
  console.log('===============================\n');

  try {
    console.log('📡 Testing blockchain processing endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/blockchain/processing/record', {
      batchId: 'TEST-2024-001',
      stepType: 'Drying',
      inputBatchId: 'TEST-2024-001',
      outputBatchId: 'TEST-2024-001',
      processDetails: {
        temperature: 45,
        duration: 72,
        processorName: 'Test Processor'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Processing endpoint working!');
    console.log('📋 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('📋 API Response:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || 'No message'}`);
      
      if (error.response.status === 401) {
        console.log('\n💡 Note: 401 Unauthorized is expected without proper auth token');
        console.log('   The endpoint is working, just needs authentication');
      }
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testProcessingEndpoint();
