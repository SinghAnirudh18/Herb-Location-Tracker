// Test farmer input storage
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testFarmerInput() {
  try {
    console.log('🧪 Testing Farmer Input Storage...\n');

    // Step 1: Login as farmer
    console.log('1️⃣ Logging in as farmer...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testfarmer@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Farmer logged in successfully');

    // Step 2: Create a collection with detailed input
    console.log('\n2️⃣ Creating collection with detailed input...');
    const collectionData = {
      herbSpecies: 'Ashwagandha',
      quantity: 150,
      location: 'Field B-2, Kerala, India',
      qualityGrade: 'Premium',
      harvestMethod: 'Hand-picked',
      organicCertified: true,
      weatherConditions: 'Sunny, 26°C, Low humidity',
      soilType: 'Red laterite soil with organic compost',
      notes: 'Harvested at dawn for optimal potency. Plants were 18 months old.'
    };

    console.log('📝 Input data:', JSON.stringify(collectionData, null, 2));

    const createResponse = await axios.post(`${BASE_URL}/farmers/collections`, collectionData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Collection created successfully!');
    console.log('🆔 Batch ID:', createResponse.data.collection.batchId);

    // Step 3: Retrieve the collection to verify storage
    console.log('\n3️⃣ Retrieving collections to verify storage...');
    const getResponse = await axios.get(`${BASE_URL}/farmers/my-collections`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const collections = getResponse.data.collections;
    console.log('📊 Total collections found:', collections.length);

    if (collections.length > 0) {
      const latestCollection = collections[0];
      console.log('\n✅ Latest collection data stored in MongoDB:');
      console.log('   - Batch ID:', latestCollection.batchId);
      console.log('   - Herb Species:', latestCollection.herbSpecies);
      console.log('   - Quantity:', latestCollection.quantity);
      console.log('   - Location:', latestCollection.location);
      console.log('   - Quality Grade:', latestCollection.qualityGrade);
      console.log('   - Harvest Method:', latestCollection.harvestMethod);
      console.log('   - Organic Certified:', latestCollection.organicCertified);
      console.log('   - Weather Conditions:', latestCollection.weatherConditions);
      console.log('   - Soil Type:', latestCollection.soilType);
      console.log('   - Notes:', latestCollection.notes);
      console.log('   - Farmer Name:', latestCollection.farmerName);
      console.log('   - Status:', latestCollection.status);
      console.log('   - Created At:', latestCollection.createdAt);

      // Step 4: Check if processor can see this batch
      console.log('\n4️⃣ Checking if processor can see this batch...');
      
      // Register a processor
      const processorResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test Processor',
        email: 'testprocessor@example.com',
        password: 'password123',
        role: 'processor',
        organization: 'Processing Co',
        location: 'Mumbai, India'
      });

      const processorToken = processorResponse.data.token;
      console.log('✅ Processor registered');

      // Check available batches for processor
      const processorBatches = await axios.get(`${BASE_URL}/processors/assigned-batches`, {
        headers: { Authorization: `Bearer ${processorToken}` }
      });

      console.log('📋 Batches available to processor:', processorBatches.data.batches.length);
      
      const targetBatch = processorBatches.data.batches.find(b => b.batchId === latestCollection.batchId);
      if (targetBatch) {
        console.log('✅ SUCCESS: Processor can see the farmer\'s batch!');
        console.log('   - Batch ID:', targetBatch.batchId);
        console.log('   - Status:', targetBatch.status);
        console.log('   - Farmer:', targetBatch.farmer.name);
      } else {
        console.log('❌ ISSUE: Processor cannot see the farmer\'s batch');
      }

    } else {
      console.log('❌ No collections found - input may not be storing properly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the test
testFarmerInput();
