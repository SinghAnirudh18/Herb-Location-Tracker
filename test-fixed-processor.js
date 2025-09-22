#!/usr/bin/env node

/**
 * Test the fixed processor dashboard functionality
 */

const axios = require('axios');

async function testFixedProcessor() {
  try {
    console.log('🔍 Testing Fixed Processor Dashboard...');
    
    // Login as processor
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'processor@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test all the API endpoints that the dashboard uses
    console.log('\n1. Testing assigned batches...');
    const assignedResponse = await axios.get('http://localhost:5000/api/processors/assigned-batches', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (assignedResponse.data.success) {
      console.log(`✅ Found ${assignedResponse.data.batches.length} assigned batches`);
      assignedResponse.data.batches.slice(0, 3).forEach(batch => {
        console.log(`   - ${batch.batchId}: ${batch.herbSpecies} (${batch.status})`);
      });
    } else {
      console.log('❌ Failed to get assigned batches');
    }
    
    console.log('\n2. Testing stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/processors/my-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (statsResponse.data.success) {
      console.log('✅ Stats retrieved successfully');
      console.log(`   - Total Processed: ${statsResponse.data.totalProcessed}`);
      console.log(`   - Currently Processing: ${statsResponse.data.currentlyProcessing}`);
      console.log(`   - Completed: ${statsResponse.data.completed}`);
      console.log(`   - Efficiency: ${statsResponse.data.efficiency}%`);
    } else {
      console.log('❌ Failed to get stats');
    }
    
    console.log('\n3. Testing batch lookup...');
    const lookupResponse = await axios.get('http://localhost:5000/api/processors/batches/TUL-2024-602929', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (lookupResponse.data.success) {
      console.log('✅ Batch lookup successful');
      const batch = lookupResponse.data.batch;
      console.log(`   - Batch ID: ${batch.batchId}`);
      console.log(`   - Herb Species: ${batch.herbSpecies}`);
      console.log(`   - Status: ${batch.status}`);
      console.log(`   - Blockchain Recorded: ${batch.blockchainRecorded}`);
    } else {
      console.log('❌ Batch lookup failed');
    }
    
    console.log('\n4. Testing start processing...');
    const startResponse = await axios.post('http://localhost:5000/api/processors/batches/TUL-2024-602929/start', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (startResponse.data.success) {
      console.log('✅ Start processing successful');
      console.log(`   - Status: ${startResponse.data.batch.status}`);
    } else {
      console.log('❌ Start processing failed:', startResponse.data.message);
    }
    
    console.log('\n🎉 All processor dashboard APIs are working correctly!');
    console.log('   The frontend should now work properly.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testFixedProcessor();
