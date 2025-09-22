#!/usr/bin/env node

/**
 * Test script for Processor Workflow
 * This script demonstrates the complete processor workflow including batch lookup
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testProcessor = {
  email: 'processor@example.com',
  password: 'password123'
};

const testBatchId = 'TUR-2024-284168'; // Use a batch ID from the assigned batches list

async function testProcessorWorkflow() {
  console.log('🚀 Testing Processor Workflow');
  console.log('==============================');
  
  try {
    // Step 1: Login as processor
    console.log('\n1. Logging in as processor...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testProcessor);
    
    if (!loginResponse.data.success) {
      throw new Error('Failed to login as processor');
    }
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Successfully logged in as processor');
    
    // Step 2: Get processor stats
    console.log('\n2. Getting processor stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/processors/my-stats`, { headers });
    
    if (statsResponse.data.success) {
      console.log('✅ Processor stats retrieved:');
      console.log(`   - Total Processed: ${statsResponse.data.totalProcessed}`);
      console.log(`   - Currently Processing: ${statsResponse.data.currentlyProcessing}`);
      console.log(`   - Completed: ${statsResponse.data.completed}`);
      console.log(`   - Efficiency: ${statsResponse.data.efficiency}%`);
    }
    
    // Step 3: Get assigned batches
    console.log('\n3. Getting assigned batches...');
    const assignedResponse = await axios.get(`${API_BASE_URL}/processors/assigned-batches`, { headers });
    
    if (assignedResponse.data.success) {
      console.log(`✅ Found ${assignedResponse.data.batches.length} assigned batches`);
      assignedResponse.data.batches.forEach(batch => {
        console.log(`   - ${batch.batchId}: ${batch.herbSpecies} (${batch.status})`);
      });
    }
    
    // Step 4: Lookup specific batch by ID
    console.log(`\n4. Looking up batch: ${testBatchId}...`);
    const lookupResponse = await axios.get(`${API_BASE_URL}/processors/batches/${testBatchId}`, { headers });
    
    if (lookupResponse.data.success) {
      const batch = lookupResponse.data.batch;
      console.log('✅ Batch lookup successful:');
      console.log(`   - Batch ID: ${batch.batchId}`);
      console.log(`   - Herb Species: ${batch.herbSpecies}`);
      console.log(`   - Quantity: ${batch.quantity} ${batch.unit}`);
      console.log(`   - Status: ${batch.status}`);
      console.log(`   - Blockchain Recorded: ${batch.blockchainRecorded ? '✅ Yes' : '❌ No'}`);
      if (batch.transactionHash) {
        console.log(`   - Transaction Hash: ${batch.transactionHash.substring(0, 20)}...`);
      }
      if (batch.farmer) {
        console.log(`   - Farmer: ${batch.farmer.name} (${batch.farmer.organization})`);
      }
      if (batch.processor) {
        console.log(`   - Processor: ${batch.processor.name} (${batch.processor.organization})`);
      }
      if (batch.processingSteps && batch.processingSteps.length > 0) {
        console.log(`   - Processing Steps: ${batch.processingSteps.length} steps recorded`);
      }
      
      // Step 5: If batch is pending, start processing
      if (batch.status === 'pending') {
        console.log('\n5. Starting processing for pending batch...');
        const startResponse = await axios.post(`${API_BASE_URL}/processors/batches/${testBatchId}/start`, {}, { headers });
        
        if (startResponse.data.success) {
          console.log('✅ Processing started successfully');
          console.log(`   - Status: ${startResponse.data.batch.status}`);
          console.log(`   - Started: ${startResponse.data.batch.processingStarted}`);
        }
      } else if (batch.status === 'processing') {
        console.log('\n5. Batch is already being processed');
        console.log(`   - Started: ${batch.processingStarted}`);
      }
      
      // Step 6: Record a processing step
      console.log('\n6. Recording processing step...');
      const processingStepData = {
        batchId: testBatchId,
        processType: 'drying',
        parameters: {
          temperature: 45,
          humidity: 15,
          duration: 72
        },
        inputQuantity: batch.quantity,
        outputQuantity: batch.quantity * 0.85, // 15% weight loss
        equipment: {
          name: 'Drying Chamber A',
          model: 'DC-2024',
          temperature: 45
        },
        notes: 'Standard drying process with controlled temperature and humidity'
      };
      
      const stepResponse = await axios.post(`${API_BASE_URL}/processors/processing-steps`, processingStepData, { headers });
      
      if (stepResponse.data.success) {
        console.log('✅ Processing step recorded successfully');
        console.log(`   - Process Type: ${stepResponse.data.processingStep.processType}`);
        console.log(`   - Input: ${stepResponse.data.processingStep.inputQuantity} kg`);
        console.log(`   - Output: ${stepResponse.data.processingStep.outputQuantity} kg`);
        console.log(`   - Equipment: ${stepResponse.data.processingStep.equipment.name}`);
      }
      
    } else {
      console.log('❌ Batch not found or lookup failed');
      console.log(`   Error: ${lookupResponse.data.message}`);
    }
    
    // Step 7: Get processing history
    console.log('\n7. Getting processing history...');
    const historyResponse = await axios.get(`${API_BASE_URL}/processors/processing-history`, { headers });
    
    if (historyResponse.data.success) {
      console.log(`✅ Found ${historyResponse.data.processingSteps.length} processing steps`);
      historyResponse.data.processingSteps.slice(0, 3).forEach(step => {
        console.log(`   - ${step.batchId}: ${step.processType} (${step.status})`);
      });
    }
    
    console.log('\n🎉 Processor Workflow Test Completed Successfully!');
    console.log('==================================================');
    console.log('');
    console.log('✅ Key Features Tested:');
    console.log('   - Processor authentication');
    console.log('   - Batch lookup by batch ID');
    console.log('   - Batch status checking');
    console.log('   - Processing step recording');
    console.log('   - Blockchain integration status');
    console.log('   - Complete traceability information');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testProcessorWorkflow();
