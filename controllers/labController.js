const QualityTest = require('../models/QualityTest');
const Collection = require('../models/Collection');
const CollectionEvent = require('../models/CollectionEvent');
const blockchain = require('../utils/blockchain');
const { createHash } = require('../utils/hashing');

const recordQualityTest = async (req, res) => {
  try {
    const {
      collectionEventId,
      tests,
      overallResult,
      certificateUrl,
    } = req.body;

    // Verify the collection event exists
    const collectionEvent = await CollectionEvent.findById(collectionEventId);
    if (!collectionEvent) {
      return res.status(404).json({ message: 'Collection event not found' });
    }

    // Get the latest block hash for chaining
    const latestBlock = blockchain.getLatestBlock();
    const previousBlockHash = latestBlock.hash;

    // Create quality test data for blockchain
    const qualityTestData = {
      labId: req.user._id.toString(),
      collectionEventId,
      timestamp: new Date(),
      tests,
      overallResult,
      certificateUrl,
      previousBlockHash,
    };

    // Create hash for the data
    const dataHash = createHash(qualityTestData);

    // Add to blockchain
    blockchain.addTransaction(qualityTestData);
    blockchain.minePendingTransactions();

    // Save to MongoDB
    const qualityTest = await QualityTest.create({
      labId: req.user._id,
      collectionEventId,
      tests,
      overallResult,
      certificateUrl,
      blockchainHash: dataHash,
      previousBlockHash,
    });

    res.status(201).json({
      message: 'Quality test recorded successfully',
      qualityTest,
      blockchainConfirmation: {
        blockIndex: blockchain.chain.length - 1,
        blockHash: blockchain.getLatestBlock().hash,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTestHistory = async (req, res) => {
  try {
    const qualityTests = await QualityTest.find({ labId: req.user._id })
      .populate('collectionEventId')
      .sort({ timestamp: -1 });
    
    res.json(qualityTests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssignedBatches = async (req, res) => {
  try {
    // Get collections that are ready for testing (status: processed) or already assigned to this lab
    const collections = await Collection.find({
      $or: [
        { status: 'processed' }, // Available for testing
        { labId: req.user._id, status: 'testing' } // Already assigned to this lab
      ]
    })
    .populate('farmerId', 'name organization location')
    .populate('processorId', 'name organization')
    .sort({ processingCompleted: -1 });
    
    res.json({
      success: true,
      batches: collections.map(collection => ({
        id: collection.batchId,
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        quantity: collection.quantity,
        location: collection.location,
        qualityGrade: collection.qualityGrade,
        collectionDate: collection.collectionDate,
        processingCompleted: collection.processingCompleted,
        status: collection.status,
        farmer: {
          name: collection.farmerId.name,
          organization: collection.farmerId.organization,
          location: collection.farmerId.location
        },
        processor: collection.processorId ? {
          name: collection.processorId.name,
          organization: collection.processorId.organization
        } : null,
        assignedToMe: collection.labId && collection.labId.toString() === req.user._id.toString()
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const startTesting = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Find the collection and assign it to this lab
    const collection = await Collection.findOneAndUpdate(
      { batchId, status: 'processed' },
      { 
        labId: req.user._id,
        status: 'testing'
      },
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or not ready for testing'
      });
    }
    
    res.json({
      success: true,
      message: 'Testing started successfully',
      batch: {
        batchId: collection.batchId,
        status: collection.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const recordQualityTestNew = async (req, res) => {
  try {
    const {
      batchId,
      tests,
      overallResult,
      overallScore,
      recommendations,
      testingEquipment,
      testedBy,
      reviewedBy
    } = req.body;

    // Verify the collection exists and is assigned to this lab
    const collection = await Collection.findOne({ 
      batchId, 
      labId: req.user._id,
      status: 'testing'
    });
    
    if (!collection) {
      return res.status(404).json({ 
        success: false,
        message: 'Batch not found or not assigned to you for testing' 
      });
    }

    // Generate certificate number
    const certificateNumber = `QC-${Date.now()}-${batchId}`;

    // Create quality test
    const qualityTest = new QualityTest({
      labId: req.user._id,
      labName: req.user.name,
      collectionId: collection._id,
      batchId,
      tests: tests || {},
      overallResult,
      overallScore: overallScore || 0,
      recommendations: recommendations || '',
      certificateNumber,
      testingEquipment: testingEquipment || [],
      testedBy: testedBy || { name: req.user.name },
      reviewedBy: reviewedBy || {},
      status: 'completed'
    });

    await qualityTest.save();

    // Update collection status
    await Collection.findByIdAndUpdate(collection._id, {
      status: 'tested',
      qualityTestDate: new Date(),
      qualityTestPassed: overallResult === 'passed'
    });

    res.status(201).json({
      success: true,
      message: 'Quality test recorded successfully',
      qualityTest: {
        id: qualityTest._id,
        batchId: qualityTest.batchId,
        certificateNumber: qualityTest.certificateNumber,
        overallResult: qualityTest.overallResult,
        overallScore: qualityTest.overallScore,
        tests: qualityTest.tests,
        recommendations: qualityTest.recommendations,
        testDate: qualityTest.testDate,
        status: qualityTest.status,
        createdAt: qualityTest.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getTestHistoryNew = async (req, res) => {
  try {
    const qualityTests = await QualityTest.find({ labId: req.user._id })
      .populate('collectionId', 'batchId herbSpecies farmerId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      qualityTests: qualityTests.map(test => ({
        id: test._id,
        batchId: test.batchId,
        certificateNumber: test.certificateNumber,
        overallResult: test.overallResult,
        overallScore: test.overallScore,
        testDate: test.testDate,
        status: test.status,
        tests: test.tests,
        recommendations: test.recommendations,
        collection: test.collectionId ? {
          batchId: test.collectionId.batchId,
          herbSpecies: test.collectionId.herbSpecies
        } : null,
        createdAt: test.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getMyStats = async (req, res) => {
  try {
    const labId = req.user._id;
    
    // Get total tests conducted
    const totalTests = await QualityTest.countDocuments({ labId });
    
    // Get currently testing batches
    const currentlyTesting = await Collection.countDocuments({
      labId,
      status: 'testing'
    });
    
    // Get passed tests
    const passedTests = await QualityTest.countDocuments({
      labId,
      overallResult: 'passed'
    });
    
    // Get failed tests
    const failedTests = await QualityTest.countDocuments({
      labId,
      overallResult: 'failed'
    });
    
    // Get this month's tests
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = await QualityTest.countDocuments({
      labId,
      testDate: { $gte: startOfMonth }
    });
    
    // Calculate average score
    const scoreResult = await QualityTest.aggregate([
      { $match: { labId: req.user._id } },
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } }
    ]);
    const averageScore = scoreResult.length > 0 ? Math.round(scoreResult[0].avgScore * 100) / 100 : 0;
    
    // Calculate pass rate
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    res.json({
      success: true,
      totalTests,
      currentlyTesting,
      passedTests,
      failedTests,
      thisMonth,
      averageScore,
      passRate,
      trends: {
        tests: thisMonth > 0 ? 8.7 : 0,
        passRate: passRate > 90 ? 2.1 : passRate > 80 ? 1.2 : -0.8,
        accuracy: 98.5,
        efficiency: 94.2
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    
    const qualityTest = await QualityTest.findOne({ certificateNumber })
      .populate('collectionId');
    
    if (!qualityTest) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    res.json({
      success: true,
      certificate: {
        certificateNumber: qualityTest.certificateNumber,
        batchId: qualityTest.batchId,
        testDate: qualityTest.testDate,
        overallResult: qualityTest.overallResult,
        overallScore: qualityTest.overallScore,
        tests: qualityTest.tests,
        recommendations: qualityTest.recommendations,
        labName: qualityTest.labName,
        testedBy: qualityTest.testedBy,
        reviewedBy: qualityTest.reviewedBy,
        collection: qualityTest.collectionId
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { 
  getAssignedBatches,
  startTesting,
  recordQualityTest: recordQualityTestNew,
  getTestHistory: getTestHistoryNew,
  getMyStats,
  getCertificate
};