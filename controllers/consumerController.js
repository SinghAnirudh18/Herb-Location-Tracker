const Collection = require('../models/Collection');
const ProcessingStep = require('../models/ProcessingStep');
const QualityTest = require('../models/QualityTest');
const User = require('../models/User');

// Verify product by batch ID
const verifyProduct = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be batch ID or QR code data
    
    // Find the collection by batch ID
    const collection = await Collection.findOne({ batchId: identifier })
      .populate('farmerId', 'name organization location')
      .populate('processorId', 'name organization')
      .populate('labId', 'name organization');
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Product not found in our database'
      });
    }
    
    // Get processing steps for this batch
    const processingSteps = await ProcessingStep.find({ 
      collectionId: collection._id 
    }).sort({ createdAt: 1 });
    
    // Get quality tests for this batch
    const qualityTests = await QualityTest.find({ 
      collectionId: collection._id 
    }).sort({ testDate: -1 });
    
    // Determine verification status
    const verified = collection.status !== 'rejected';
    const hasQualityTest = qualityTests.length > 0;
    const qualityPassed = hasQualityTest && qualityTests[0].overallResult === 'passed';
    
    res.json({
      success: true,
      verified,
      product: {
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        quantity: collection.quantity,
        location: collection.location,
        qualityGrade: collection.qualityGrade,
        collectionDate: collection.collectionDate,
        status: collection.status,
        organicCertified: collection.organicCertified,
        farmerName: collection.farmerName,
        farmerAddress: collection.farmerAddress,
        processingCompleted: collection.processingCompleted,
        qualityTestDate: collection.qualityTestDate,
        qualityTestPassed: collection.qualityTestPassed,
        farmer: collection.farmerId ? {
          name: collection.farmerId.name,
          organization: collection.farmerId.organization,
          location: collection.farmerId.location
        } : null,
        processor: collection.processorId ? {
          name: collection.processorId.name,
          organization: collection.processorId.organization
        } : null,
        lab: collection.labId ? {
          name: collection.labId.name,
          organization: collection.labId.organization
        } : null
      },
      traceability: {
        collection: {
          date: collection.collectionDate,
          location: collection.location,
          farmer: collection.farmerName,
          quantity: collection.quantity,
          qualityGrade: collection.qualityGrade,
          organicCertified: collection.organicCertified,
          harvestMethod: collection.harvestMethod,
          weatherConditions: collection.weatherConditions,
          soilType: collection.soilType
        },
        processing: processingSteps.map(step => ({
          processType: step.processType,
          processor: step.processorName,
          startTime: step.startTime,
          endTime: step.endTime,
          parameters: step.parameters,
          inputQuantity: step.inputQuantity,
          outputQuantity: step.outputQuantity,
          equipment: step.equipment,
          status: step.status
        })),
        qualityTests: qualityTests.map(test => ({
          testDate: test.testDate,
          lab: test.labName,
          overallResult: test.overallResult,
          overallScore: test.overallScore,
          certificateNumber: test.certificateNumber,
          tests: test.tests,
          recommendations: test.recommendations,
          testedBy: test.testedBy
        }))
      },
      verification: {
        verified,
        hasQualityTest,
        qualityPassed,
        completionStatus: collection.status,
        verificationDate: new Date(),
        blockchainVerified: false // Will be true when blockchain is integrated
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      verified: false,
      message: error.message 
    });
  }
};

// Get complete traceability for a product
const getTraceability = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Find the collection
    const collection = await Collection.findOne({ batchId })
      .populate('farmerId', 'name organization location email')
      .populate('processorId', 'name organization location email')
      .populate('labId', 'name organization location email');
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get all related data
    const processingSteps = await ProcessingStep.find({ 
      collectionId: collection._id 
    }).sort({ createdAt: 1 });
    
    const qualityTests = await QualityTest.find({ 
      collectionId: collection._id 
    }).sort({ testDate: -1 });
    
    // Build complete timeline
    const timeline = [
      {
        stage: 'Collection',
        date: collection.collectionDate,
        actor: collection.farmerName,
        location: collection.location,
        details: {
          herbSpecies: collection.herbSpecies,
          quantity: collection.quantity,
          qualityGrade: collection.qualityGrade,
          harvestMethod: collection.harvestMethod,
          organicCertified: collection.organicCertified,
          weatherConditions: collection.weatherConditions,
          soilType: collection.soilType,
          notes: collection.notes
        },
        status: 'completed'
      },
      ...processingSteps.map(step => ({
        stage: 'Processing',
        substage: step.processType,
        date: step.startTime,
        endDate: step.endTime,
        actor: step.processorName,
        details: {
          processType: step.processType,
          parameters: step.parameters,
          inputQuantity: step.inputQuantity,
          outputQuantity: step.outputQuantity,
          equipment: step.equipment,
          notes: step.notes
        },
        status: step.status
      })),
      ...qualityTests.map(test => ({
        stage: 'Quality Testing',
        date: test.testDate,
        actor: test.labName,
        details: {
          overallResult: test.overallResult,
          overallScore: test.overallScore,
          certificateNumber: test.certificateNumber,
          tests: test.tests,
          recommendations: test.recommendations,
          testedBy: test.testedBy,
          reviewedBy: test.reviewedBy
        },
        status: test.status
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      product: {
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        currentStatus: collection.status,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      },
      participants: {
        farmer: collection.farmerId,
        processor: collection.processorId,
        lab: collection.labId
      },
      timeline,
      summary: {
        totalSteps: timeline.length,
        completedSteps: timeline.filter(t => t.status === 'completed').length,
        currentStage: collection.status,
        qualityStatus: qualityTests.length > 0 ? qualityTests[0].overallResult : 'pending',
        verified: collection.status !== 'rejected' && qualityTests.some(t => t.overallResult === 'passed')
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get public statistics (no authentication required)
const getPublicStats = async (req, res) => {
  try {
    // Get public statistics
    const totalBatches = await Collection.countDocuments();
    const verifiedBatches = await Collection.countDocuments({ 
      status: { $in: ['tested', 'completed'] } 
    });
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalProcessors = await User.countDocuments({ role: 'processor' });
    const totalLabs = await User.countDocuments({ role: 'lab' });
    
    // Get quality test statistics
    const passedTests = await QualityTest.countDocuments({ overallResult: 'passed' });
    const totalTests = await QualityTest.countDocuments();
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBatches = await Collection.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      statistics: {
        totalBatches,
        verifiedBatches,
        verificationRate: totalBatches > 0 ? Math.round((verifiedBatches / totalBatches) * 100) : 0,
        totalParticipants: totalFarmers + totalProcessors + totalLabs,
        breakdown: {
          farmers: totalFarmers,
          processors: totalProcessors,
          labs: totalLabs
        },
        qualityMetrics: {
          totalTests,
          passedTests,
          passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
        },
        recentActivity: {
          newBatches: recentBatches,
          period: '30 days'
        }
      },
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { 
  verifyProduct,
  getTraceability,
  getPublicStats
};