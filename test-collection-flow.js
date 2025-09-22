#!/usr/bin/env node

/**
 * Test script to verify the collection creation flow
 * This script tests the complete flow from database to blockchain
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Collection = require('./models/Collection');
const User = require('./models/User');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Test data
const testCollectionData = {
  herbSpecies: 'Turmeric',
  quantity: 5.5,
  location: 'Field A-1, Kottayam, Kerala',
  qualityGrade: 'Premium',
  harvestMethod: 'Hand-picked',
  organicCertified: true,
  weatherConditions: 'Sunny, 28°C, Low humidity',
  soilType: 'Red laterite',
  notes: 'Test collection for verification'
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function getTestUserToken() {
  try {
    // Try to find existing test user
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('Creating test user...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      user = await User.create({
        name: 'Test Farmer',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'farmer',
        organization: 'Test Farms',
        location: 'Kerala, India'
      });
      console.log('✅ Test user created');
    }

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '30d' });
    
    return { token, user };
  } catch (error) {
    console.error('❌ Error getting test user token:', error.message);
    throw error;
  }
}

async function testCollectionCreation() {
  console.log('\n🧪 Testing Collection Creation Flow...');
  console.log('=====================================');

  try {
    // Get authentication token
    const { token, user } = await getTestUserToken();
    
    // Test collection creation via API
    console.log('\n1. Creating collection via API...');
    const response = await axios.post(`${API_BASE_URL}/farmers/collections`, testCollectionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Collection created successfully via API');
      console.log(`   Batch ID: ${response.data.collection.batchId}`);
      console.log(`   Status: ${response.data.collection.status}`);
      
      // Check blockchain status
      if (response.data.blockchain) {
        console.log('\n2. Blockchain Integration Status:');
        console.log(`   Blockchain Recorded: ${response.data.blockchain.recorded}`);
        console.log(`   Transaction Hash: ${response.data.blockchain.transactionHash || 'N/A'}`);
        console.log(`   IPFS Hash: ${response.data.blockchain.ipfsHash || 'N/A'}`);
        console.log(`   Services Status:`);
        console.log(`     - Blockchain: ${response.data.blockchain.services?.blockchain ? 'Available' : 'Not Available'}`);
        console.log(`     - IPFS: ${response.data.blockchain.services?.ipfs ? 'Available' : 'Not Available'}`);
      }
      
      // Verify in database
      console.log('\n3. Verifying in database...');
      const savedCollection = await Collection.findOne({ batchId: response.data.collection.batchId });
      
      if (savedCollection) {
        console.log('✅ Collection found in database');
        console.log(`   Database ID: ${savedCollection._id}`);
        console.log(`   Blockchain Recorded: ${savedCollection.blockchainRecorded}`);
        console.log(`   IPFS Hash: ${savedCollection.ipfsHash || 'N/A'}`);
        console.log(`   Transaction Hash: ${savedCollection.transactionHash || 'N/A'}`);
      } else {
        console.log('❌ Collection not found in database');
      }
      
      // Test retrieval
      console.log('\n4. Testing collection retrieval...');
      const getResponse = await axios.get(`${API_BASE_URL}/farmers/my-collections`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (getResponse.data.success && getResponse.data.collections.length > 0) {
        console.log('✅ Collections retrieved successfully');
        console.log(`   Total collections: ${getResponse.data.collections.length}`);
        
        const testCollection = getResponse.data.collections.find(c => c.batchId === response.data.collection.batchId);
        if (testCollection) {
          console.log('✅ Test collection found in retrieved list');
        } else {
          console.log('❌ Test collection not found in retrieved list');
        }
      } else {
        console.log('❌ Failed to retrieve collections');
      }
      
      // Test stats
      console.log('\n5. Testing stats calculation...');
      const statsResponse = await axios.get(`${API_BASE_URL}/farmers/my-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.data.success) {
        console.log('✅ Stats retrieved successfully');
        console.log(`   Total Collections: ${statsResponse.data.totalCollections}`);
        console.log(`   This Month: ${statsResponse.data.thisMonth}`);
        console.log(`   Total Quantity: ${statsResponse.data.totalQuantity} kg`);
        console.log(`   Average Quality: ${statsResponse.data.averageQuality}%`);
      } else {
        console.log('❌ Failed to retrieve stats');
      }
      
    } else {
      console.log('❌ Collection creation failed');
      console.log(`   Error: ${response.data.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

async function cleanup() {
  try {
    // Clean up test collections
    await Collection.deleteMany({ farmerName: 'Test Farmer' });
    console.log('\n🧹 Cleaned up test data');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Collection Flow Tests');
  console.log('==================================');
  
  await connectDB();
  
  try {
    await testCollectionCreation();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await cleanup();
    await mongoose.disconnect();
    console.log('\n✅ Tests completed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCollectionCreation, getTestUserToken };
