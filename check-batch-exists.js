#!/usr/bin/env node

/**
 * Check if a specific batch exists in the database
 */

const mongoose = require('mongoose');
const Collection = require('./models/Collection');
const User = require('./models/User');
require('dotenv').config();

async function checkBatchExists() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('✅ Connected to MongoDB');

    const batchId = 'TUL-2024-602929';
    
    // Check if batch exists
    const batch = await Collection.findOne({ batchId })
      .populate('farmerId', 'name organization location')
      .populate('processorId', 'name organization location');
    
    if (batch) {
      console.log(`✅ Batch ${batchId} found:`);
      console.log(`   - Herb Species: ${batch.herbSpecies}`);
      console.log(`   - Quantity: ${batch.quantity} ${batch.unit}`);
      console.log(`   - Status: ${batch.status}`);
      console.log(`   - Location: ${batch.location}`);
      console.log(`   - Farmer: ${batch.farmerId?.name || 'Not assigned'}`);
      console.log(`   - Processor: ${batch.processorId?.name || 'Not assigned'}`);
      console.log(`   - Created: ${batch.createdAt}`);
    } else {
      console.log(`❌ Batch ${batchId} not found`);
      
      // Let's see what batches do exist
      console.log('\n📋 Available batches:');
      const allBatches = await Collection.find({}, 'batchId herbSpecies status').limit(10);
      allBatches.forEach(b => {
        console.log(`   - ${b.batchId}: ${b.herbSpecies} (${b.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkBatchExists();
