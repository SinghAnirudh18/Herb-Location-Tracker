// Test script to verify the complete workflow
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing Complete Workflow: Farmer → Processor → Lab → Consumer\n');

    // Step 1: Register users
    console.log('1️⃣ Registering users...');
    
    const farmer = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'John Farmer',
      email: 'john.farmer@test.com',
      password: 'password123',
      role: 'farmer',
      organization: 'Green Herbs Farm',
      location: 'Kerala, India'
    });
    console.log('✅ Farmer registered:', farmer.data.user.name);

    const processor = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Processing Corp',
      email: 'processor@test.com',
      password: 'password123',
      role: 'processor',
      organization: 'Herb Processors Ltd',
      location: 'Mumbai, India'
    });
    console.log('✅ Processor registered:', processor.data.user.name);

    const lab = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Quality Lab',
      email: 'lab@test.com',
      password: 'password123',
      role: 'lab',
      organization: 'Ayurveda Testing Lab',
      location: 'Bangalore, India'
    });
    console.log('✅ Lab registered:', lab.data.user.name);

    // Step 2: Farmer creates a batch
    console.log('\n2️⃣ Farmer creating a batch...');
    const farmerToken = farmer.data.token;
    
    const batch = await axios.post(`${BASE_URL}/farmers/collections`, {
      herbSpecies: 'Ashwagandha',
      quantity: 100,
      location: 'Field A-1, Kerala',
      qualityGrade: 'Premium',
      harvestMethod: 'Hand-picked',
      organicCertified: true,
      weatherConditions: 'Sunny, 28°C',
      soilType: 'Red laterite soil',
      notes: 'Harvested at optimal maturity'
    }, {
      headers: { Authorization: `Bearer ${farmerToken}` }
    });
    
    const batchId = batch.data.collection.batchId;
    console.log('✅ Batch created:', batchId);

    // Step 3: Processor sees available batches
    console.log('\n3️⃣ Processor checking available batches...');
    const processorToken = processor.data.token;
    
    const availableBatches = await axios.get(`${BASE_URL}/processors/assigned-batches`, {
      headers: { Authorization: `Bearer ${processorToken}` }
    });
    
    console.log('✅ Available batches for processor:', availableBatches.data.batches.length);
    const targetBatch = availableBatches.data.batches.find(b => b.batchId === batchId);
    
    if (targetBatch) {
      console.log('✅ Target batch found:', targetBatch.batchId, '- Status:', targetBatch.status);
    } else {
      console.log('❌ Target batch not found in processor list');
      return;
    }

    // Step 4: Processor starts processing
    console.log('\n4️⃣ Processor starting processing...');
    const startProcessing = await axios.post(`${BASE_URL}/processors/batches/${batchId}/start`, {}, {
      headers: { Authorization: `Bearer ${processorToken}` }
    });
    console.log('✅ Processing started:', startProcessing.data.message);

    // Step 5: Processor records processing steps
    console.log('\n5️⃣ Processor recording processing steps...');
    const processingStep = await axios.post(`${BASE_URL}/processors/processing-steps`, {
      batchId: batchId,
      processType: 'drying',
      parameters: {
        temperature: 45,
        duration: 24,
        method: 'Solar drying'
      },
      inputQuantity: 100,
      outputQuantity: 85,
      equipment: {
        name: 'Solar Dryer Model X1',
        id: 'SD-001',
        calibrationDate: new Date()
      },
      notes: 'Dried to optimal moisture content'
    }, {
      headers: { Authorization: `Bearer ${processorToken}` }
    });
    console.log('✅ Processing step recorded:', processingStep.data.processingStep.processType);

    // Step 6: Processor completes processing
    console.log('\n6️⃣ Processor completing processing...');
    const completeProcessing = await axios.post(`${BASE_URL}/processors/batches/${batchId}/complete`, {}, {
      headers: { Authorization: `Bearer ${processorToken}` }
    });
    console.log('✅ Processing completed:', completeProcessing.data.message);

    // Step 7: Lab sees available batches for testing
    console.log('\n7️⃣ Lab checking batches ready for testing...');
    const labToken = lab.data.token;
    
    const batchesForTesting = await axios.get(`${BASE_URL}/labs/assigned-batches`, {
      headers: { Authorization: `Bearer ${labToken}` }
    });
    
    console.log('✅ Batches ready for testing:', batchesForTesting.data.batches.length);
    const testBatch = batchesForTesting.data.batches.find(b => b.batchId === batchId);
    
    if (testBatch) {
      console.log('✅ Target batch ready for testing:', testBatch.batchId, '- Status:', testBatch.status);
    } else {
      console.log('❌ Target batch not ready for testing');
      return;
    }

    // Step 8: Lab starts testing
    console.log('\n8️⃣ Lab starting testing...');
    const startTesting = await axios.post(`${BASE_URL}/labs/batches/${batchId}/start`, {}, {
      headers: { Authorization: `Bearer ${labToken}` }
    });
    console.log('✅ Testing started:', startTesting.data.message);

    // Step 9: Lab records test results
    console.log('\n9️⃣ Lab recording test results...');
    const qualityTest = await axios.post(`${BASE_URL}/labs/quality-tests`, {
      batchId: batchId,
      tests: {
        moistureContent: { value: 8.5, passed: true },
        pesticideResidue: { value: 0.05, passed: true },
        heavyMetals: {
          lead: { value: 0.1, passed: true },
          mercury: { value: 0.01, passed: true }
        },
        microbialContamination: {
          totalBacterialCount: { value: 100, passed: true },
          yeastMold: { value: 50, passed: true }
        },
        DNABarcode: {
          speciesIdentified: 'Withania somnifera',
          matchConfidence: 99.8,
          passed: true
        }
      },
      overallResult: 'passed',
      overallScore: 95,
      recommendations: 'Excellent quality batch. Suitable for premium products.',
      testedBy: { name: 'Dr. Quality Tester', qualification: 'PhD in Pharmacognosy' }
    }, {
      headers: { Authorization: `Bearer ${labToken}` }
    });
    console.log('✅ Quality test completed:', qualityTest.data.qualityTest.certificateNumber);

    // Step 10: Consumer verifies product
    console.log('\n🔟 Consumer verifying product...');
    const verification = await axios.get(`${BASE_URL}/consumers/verify/${batchId}`);
    
    console.log('✅ Product verification result:');
    console.log('   - Verified:', verification.data.verified);
    console.log('   - Herb Species:', verification.data.product.herbSpecies);
    console.log('   - Quality Grade:', verification.data.product.qualityGrade);
    console.log('   - Farmer:', verification.data.product.farmerName);
    console.log('   - Quality Test Passed:', verification.data.verification.qualityPassed);

    // Step 11: Get complete traceability
    console.log('\n1️⃣1️⃣ Getting complete traceability...');
    const traceability = await axios.get(`${BASE_URL}/consumers/traceability/${batchId}`);
    
    console.log('✅ Complete traceability timeline:');
    traceability.data.timeline.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.stage} by ${step.actor} on ${new Date(step.date).toLocaleDateString()}`);
    });

    console.log('\n🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ All systems working: Farmer → Processor → Lab → Consumer');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCompleteWorkflow();
