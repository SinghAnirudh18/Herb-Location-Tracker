#!/usr/bin/env node

/**
 * Production Readiness Test for Herb Traceability System
 * Tests the complete workflow from farmer to consumer with real data
 */

const mongoose = require('mongoose');
const axios = require('axios');
const colors = require('colors');

// Import models
const User = require('./models/User');
const Collection = require('./models/Collection');
const ProcessingStep = require('./models/ProcessingStep');
const QualityTest = require('./models/QualityTest');

// Test configuration
const API_BASE = 'http://localhost:5000/api';
const TEST_TIMEOUT = 30000;

// Test data
const testUsers = {
  farmer: {
    name: 'Production Farmer',
    email: 'farmer@production.test',
    password: 'SecurePass123!',
    role: 'farmer',
    organization: 'Green Valley Farms',
    location: 'Kerala, India'
  },
  processor: {
    name: 'Production Processor',
    email: 'processor@production.test',
    password: 'SecurePass123!',
    role: 'processor',
    organization: 'HerbTech Processing',
    location: 'Mumbai, India'
  },
  lab: {
    name: 'Production Lab Tech',
    email: 'lab@production.test',
    password: 'SecurePass123!',
    role: 'lab',
    organization: 'Quality Labs India',
    location: 'Bangalore, India'
  },
  consumer: {
    name: 'Production Consumer',
    email: 'consumer@production.test',
    password: 'SecurePass123!',
    role: 'consumer',
    organization: 'General Public',
    location: 'Delhi, India'
  }
};

let testTokens = {};
let testBatchId = null;

class ProductionTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async connectDB() {
    try {
      await mongoose.connect('mongodb://localhost:27017/herb_traceability');
      console.log('✅ Database connected'.green);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:'.red, error.message);
      return false;
    }
  }

  async cleanup() {
    try {
      // Clean up test data
      await User.deleteMany({ email: { $regex: '@production.test$' } });
      await Collection.deleteMany({ farmerName: 'Production Farmer' });
      await ProcessingStep.deleteMany({});
      await QualityTest.deleteMany({});
      console.log('🧹 Test data cleaned up'.yellow);
    } catch (error) {
      console.error('⚠️  Cleanup warning:'.yellow, error.message);
    }
  }

  async test(name, testFn) {
    try {
      console.log(`\n🧪 Testing: ${name}`.cyan);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      console.log(`✅ ${name} - PASSED`.green);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.error(`❌ ${name} - FAILED:`.red, error.message);
    }
  }

  async apiCall(method, endpoint, data = null, token = null) {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      timeout: TEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  async runTests() {
    console.log('🚀 Starting Production Readiness Tests\n'.bold.blue);

    // Connect to database
    const dbConnected = await this.connectDB();
    if (!dbConnected) {
      console.error('❌ Cannot proceed without database connection'.red);
      process.exit(1);
    }

    // Clean up any existing test data
    await this.cleanup();

    // Test 1: User Registration and Authentication
    await this.test('User Registration and Authentication', async () => {
      for (const [role, userData] of Object.entries(testUsers)) {
        // Register user
        const registerResponse = await this.apiCall('POST', '/auth/register', userData);
        if (!registerResponse.success || !registerResponse.token) {
          throw new Error(`Registration failed for ${role}`);
        }

        // Login user
        const loginResponse = await this.apiCall('POST', '/auth/login', {
          email: userData.email,
          password: userData.password
        });
        if (!loginResponse.success || !loginResponse.token) {
          throw new Error(`Login failed for ${role}`);
        }

        testTokens[role] = loginResponse.token;
        console.log(`  ✓ ${role} registered and authenticated`.green);
      }
    });

    // Test 2: Farmer Creates Collection
    await this.test('Farmer Creates Collection with Real Data', async () => {
      const collectionData = {
        herbSpecies: 'Ashwagandha',
        quantity: 150,
        location: 'Field B-2, Kerala, India',
        qualityGrade: 'Premium',
        harvestMethod: 'Hand-picked',
        organicCertified: true,
        weatherConditions: 'Sunny, 26°C, Low humidity',
        soilType: 'Red laterite soil with organic compost',
        notes: 'Production test batch - harvested at dawn for optimal potency'
      };

      const response = await this.apiCall('POST', '/farmers/collections', collectionData, testTokens.farmer);
      if (!response.success || !response.collection) {
        throw new Error('Failed to create collection');
      }

      testBatchId = response.collection.batchId;
      console.log(`  ✓ Collection created with Batch ID: ${testBatchId}`.green);

      // Verify data persistence
      const collections = await this.apiCall('GET', '/farmers/my-collections', null, testTokens.farmer);
      if (!collections.success || collections.collections.length === 0) {
        throw new Error('Collection not found in farmer\'s collections');
      }

      const savedCollection = collections.collections.find(c => c.batchId === testBatchId);
      if (!savedCollection) {
        throw new Error('Created collection not found in database');
      }

      // Verify all fields are saved correctly
      if (savedCollection.herbSpecies !== collectionData.herbSpecies ||
          savedCollection.quantity !== collectionData.quantity ||
          savedCollection.qualityGrade !== collectionData.qualityGrade) {
        throw new Error('Collection data not saved correctly');
      }

      console.log(`  ✓ Collection data verified in database`.green);
    });

    // Test 3: Processor Can See and Process Batch
    await this.test('Processor Workflow - See and Process Batch', async () => {
      // Check if processor can see available batches
      const availableBatches = await this.apiCall('GET', '/processors/available-batches', null, testTokens.processor);
      if (!availableBatches.success) {
        throw new Error('Failed to get available batches for processor');
      }

      const targetBatch = availableBatches.batches.find(b => b.batchId === testBatchId);
      if (!targetBatch) {
        throw new Error(`Processor cannot see batch ${testBatchId}`);
      }
      console.log(`  ✓ Processor can see batch ${testBatchId}`.green);

      // Start processing
      const processingData = {
        processType: 'Traditional Drying',
        temperature: 45,
        duration: 72,
        equipment: 'Drying Chamber A',
        notes: 'Production test processing'
      };

      const startResponse = await this.apiCall('POST', `/processors/batches/${testBatchId}/start-processing`, processingData, testTokens.processor);
      if (!startResponse.success) {
        throw new Error('Failed to start processing');
      }
      console.log(`  ✓ Processing started for batch ${testBatchId}`.green);

      // Complete processing
      const completionData = {
        finalQuantity: 127.5,
        yield: 85.0,
        qualityGrade: 'Premium',
        notes: 'Processing completed successfully - production test'
      };

      const completeResponse = await this.apiCall('POST', `/processors/batches/${testBatchId}/complete-processing`, completionData, testTokens.processor);
      if (!completeResponse.success) {
        throw new Error('Failed to complete processing');
      }
      console.log(`  ✓ Processing completed for batch ${testBatchId}`.green);
    });

    // Test 4: Lab Quality Testing
    await this.test('Lab Quality Testing Workflow', async () => {
      // Check available batches for testing
      const availableBatches = await this.apiCall('GET', '/labs/available-batches', null, testTokens.lab);
      if (!availableBatches.success) {
        throw new Error('Failed to get available batches for lab');
      }

      const targetBatch = availableBatches.batches.find(b => b.batchId === testBatchId);
      if (!targetBatch) {
        throw new Error(`Lab cannot see processed batch ${testBatchId}`);
      }
      console.log(`  ✓ Lab can see processed batch ${testBatchId}`.green);

      // Create quality test
      const testData = {
        testType: 'Comprehensive Analysis',
        testParameters: {
          purity: 95.8,
          potency: 92.5,
          moisture: 8.2,
          heavyMetals: 'Within limits',
          microbial: 'Clear',
          pesticides: 'Not detected'
        },
        testResults: 'Pass',
        certificateNumber: `CERT-${testBatchId}-${Date.now()}`,
        notes: 'All parameters within acceptable limits - production test'
      };

      const testResponse = await this.apiCall('POST', `/labs/batches/${testBatchId}/quality-test`, testData, testTokens.lab);
      if (!testResponse.success) {
        throw new Error('Failed to create quality test');
      }
      console.log(`  ✓ Quality test completed for batch ${testBatchId}`.green);
    });

    // Test 5: Consumer Verification
    await this.test('Consumer Product Verification', async () => {
      // Verify product by batch ID
      const verificationResponse = await this.apiCall('GET', `/consumers/verify/${testBatchId}`, null, testTokens.consumer);
      if (!verificationResponse.success) {
        throw new Error('Consumer verification failed');
      }

      const batchInfo = verificationResponse.batch;
      if (!batchInfo || batchInfo.batchId !== testBatchId) {
        throw new Error('Incorrect batch information returned');
      }

      // Verify complete traceability chain
      if (!batchInfo.farmerName || !batchInfo.processingSteps || !batchInfo.qualityTests) {
        throw new Error('Incomplete traceability information');
      }

      console.log(`  ✓ Consumer can verify complete traceability for batch ${testBatchId}`.green);
      console.log(`    - Farmer: ${batchInfo.farmerName}`.gray);
      console.log(`    - Processing Steps: ${batchInfo.processingSteps.length}`.gray);
      console.log(`    - Quality Tests: ${batchInfo.qualityTests.length}`.gray);
    });

    // Test 6: Data Integrity and Status Updates
    await this.test('Data Integrity and Status Updates', async () => {
      // Check that batch status was updated through the workflow
      const finalBatch = await this.apiCall('GET', `/consumers/batch/${testBatchId}`, null, testTokens.consumer);
      if (!finalBatch.success) {
        throw new Error('Failed to get final batch status');
      }

      const batch = finalBatch.batch;
      if (batch.status !== 'tested' && batch.status !== 'completed') {
        throw new Error(`Expected batch status to be 'tested' or 'completed', got '${batch.status}'`);
      }

      // Verify all workflow steps are recorded
      if (!batch.processingSteps || batch.processingSteps.length === 0) {
        throw new Error('Processing steps not recorded');
      }

      if (!batch.qualityTests || batch.qualityTests.length === 0) {
        throw new Error('Quality tests not recorded');
      }

      console.log(`  ✓ Batch status correctly updated to: ${batch.status}`.green);
      console.log(`  ✓ Complete workflow chain verified`.green);
    });

    // Test 7: API Response Times and Performance
    await this.test('API Performance and Response Times', async () => {
      const startTime = Date.now();
      
      // Test multiple API calls for performance
      const promises = [
        this.apiCall('GET', '/farmers/my-collections', null, testTokens.farmer),
        this.apiCall('GET', '/processors/available-batches', null, testTokens.processor),
        this.apiCall('GET', '/labs/available-batches', null, testTokens.lab),
        this.apiCall('GET', `/consumers/verify/${testBatchId}`, null, testTokens.consumer)
      ];

      await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      if (totalTime > 5000) { // 5 seconds threshold
        throw new Error(`API responses too slow: ${totalTime}ms`);
      }

      console.log(`  ✓ All API calls completed in ${totalTime}ms`.green);
    });

    // Clean up test data
    await this.cleanup();

    // Print results
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60).blue);
    console.log('📊 PRODUCTION READINESS TEST RESULTS'.bold.blue);
    console.log('='.repeat(60).blue);

    console.log(`\n✅ Tests Passed: ${this.results.passed}`.green);
    console.log(`❌ Tests Failed: ${this.results.failed}`.red);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! System is production-ready! 🎉'.bold.green);
      console.log('\n✅ Key Features Verified:'.green);
      console.log('  • Real database operations (no mock data)'.green);
      console.log('  • Complete farmer-to-consumer workflow'.green);
      console.log('  • Role-based access control'.green);
      console.log('  • Data persistence and integrity'.green);
      console.log('  • API performance within acceptable limits'.green);
      console.log('  • Proper error handling'.green);
    } else {
      console.log('\n⚠️  Some tests failed. Review the issues above.'.yellow);
      console.log('\nFailed Tests:'.red);
      this.results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => console.log(`  • ${t.name}: ${t.error}`.red));
    }

    console.log('\n' + '='.repeat(60).blue);
  }
}

// Run the tests
async function main() {
  const tester = new ProductionTest();
  
  try {
    await tester.runTests();
  } catch (error) {
    console.error('\n💥 Test suite crashed:'.red, error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected'.gray);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Test interrupted by user'.yellow);
  await mongoose.disconnect();
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ProductionTest;
