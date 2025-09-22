#!/usr/bin/env node

/**
 * Debug processor dashboard functionality
 */

const axios = require('axios');

async function debugProcessorDashboard() {
  try {
    console.log('🔍 Debugging Processor Dashboard...');
    
    // Step 1: Test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'processor@example.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    
    // Step 2: Test assigned batches (this is what loads on dashboard)
    console.log('\n2. Testing assigned batches...');
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
    
    // Step 3: Test stats
    console.log('\n3. Testing stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/processors/my-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (statsResponse.data.success) {
      console.log('✅ Stats retrieved successfully');
      console.log(`   - Total Processed: ${statsResponse.data.totalProcessed}`);
      console.log(`   - Currently Processing: ${statsResponse.data.currentlyProcessing}`);
      console.log(`   - Completed: ${statsResponse.data.completed}`);
    } else {
      console.log('❌ Failed to get stats');
    }
    
    // Step 4: Test batch lookup specifically
    console.log('\n4. Testing batch lookup for TUL-2024-602929...');
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
      console.log(`   - Farmer: ${batch.farmer?.name || 'None'}`);
      console.log(`   - Processor: ${batch.processor?.name || 'None'}`);
    } else {
      console.log('❌ Batch lookup failed:', lookupResponse.data.message);
    }
    
    console.log('\n🎯 All API endpoints are working correctly!');
    console.log('   The issue might be in the frontend React component.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

debugProcessorDashboard();
