// routes/blockchain-quality.js
const express = require('express');
const web3Service = require('../services/web3Service');
const ipfsService = require('../services/ipfsService');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Initialize blockchain services
router.use(async (req, res, next) => {
  try {
    if (!web3Service.isInitialized) {
      await web3Service.initialize();
    }
    if (!ipfsService.isInitialized) {
      await ipfsService.initialize();
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize blockchain services', error: error.message });
  }
});

// Record quality test on blockchain
router.post('/record', protect, async (req, res) => {
  try {
    const {
      batchId,
      testType,
      testResults,
      passed,
      certificateUrl,
      testImages,
      labReports
    } = req.body;

    // Validate required fields
    if (!batchId || !testType || !testResults || passed === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: batchId, testType, testResults, passed' 
      });
    }

    // Upload detailed data to IPFS
    const qualityTestData = {
      batchId,
      testType,
      testResults,
      passed,
      certificateUrl: certificateUrl || '',
      testImages: testImages || [],
      labReports: labReports || [],
      testedBy: req.user._id,
      timestamp: new Date().toISOString()
    };

    const ipfsHash = await ipfsService.uploadQualityTestData(qualityTestData);

    // Record on blockchain
    const blockchainResult = await web3Service.recordQualityTestOnBlockchain({
      batchId,
      testType,
      testResults,
      passed,
      certificateHash: ipfsHash
    });

    res.status(201).json({
      message: 'Quality test recorded successfully on blockchain',
      batchId,
      blockchainResult,
      ipfsHash,
      qualityTestData
    });
  } catch (error) {
    console.error('Error recording quality test on blockchain:', error);
    res.status(500).json({ 
      message: 'Error recording quality test on blockchain', 
      error: error.message 
    });
  }
});

// Get quality test from blockchain
router.get('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const qualityTest = await web3Service.getQualityTest(batchId);
    
    // Get detailed data from IPFS if available
    let detailedData = null;
    if (qualityTest.certificateHash) {
      try {
        detailedData = await ipfsService.getFileContent(qualityTest.certificateHash);
        detailedData = JSON.parse(detailedData);
      } catch (ipfsError) {
        console.warn('Could not fetch IPFS data:', ipfsError.message);
      }
    }
    
    res.json({
      message: 'Quality test retrieved from blockchain',
      batchId,
      qualityTest,
      detailedData
    });
  } catch (error) {
    console.error('Error getting quality test:', error);
    res.status(500).json({ 
      message: 'Error getting quality test', 
      error: error.message 
    });
  }
});

// Get quality tests by lab
router.get('/lab/:labAddress', protect, async (req, res) => {
  try {
    const { labAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await web3Service.getEntityTransactions(labAddress, 'quality');
    
    res.json({
      message: 'Lab quality test history',
      labAddress,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting lab history:', error);
    res.status(500).json({ 
      message: 'Error getting lab history', 
      error: error.message 
    });
  }
});

// Get quality tests by type
router.get('/type/:testType', protect, async (req, res) => {
  try {
    const { testType } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await web3Service.getQualityTestsByType(testType);
    
    res.json({
      message: 'Quality tests by type',
      testType,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting quality tests by type:', error);
    res.status(500).json({ 
      message: 'Error getting quality tests by type', 
      error: error.message 
    });
  }
});

// Get quality tests by result
router.get('/result/:passed', protect, async (req, res) => {
  try {
    const { passed } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const passedBool = passed === 'true';
    const transactions = await web3Service.getQualityTestsByResult(passedBool);
    
    res.json({
      message: 'Quality tests by result',
      passed: passedBool,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting quality tests by result:', error);
    res.status(500).json({ 
      message: 'Error getting quality tests by result', 
      error: error.message 
    });
  }
});

// Verify quality test
router.get('/:batchId/verify', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const qualityTest = await web3Service.getQualityTest(batchId);
    const verified = await web3Service.isBatchVerified(batchId);
    
    // Check if quality test exists
    const exists = qualityTest.lab !== '0x0000000000000000000000000000000000000000';
    
    res.json({
      message: 'Quality test verification result',
      batchId,
      exists,
      verified,
      qualityTest: exists ? qualityTest : null
    });
  } catch (error) {
    console.error('Error verifying quality test:', error);
    res.status(500).json({ 
      message: 'Error verifying quality test', 
      error: error.message 
    });
  }
});

// Get quality test certificate
router.get('/:batchId/certificate', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const qualityTest = await web3Service.getQualityTest(batchId);
    
    if (qualityTest.lab === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json({ message: 'Quality test not found' });
    }
    
    // Get certificate from IPFS
    let certificate = null;
    if (qualityTest.certificateHash) {
      try {
        certificate = await ipfsService.getFileContent(qualityTest.certificateHash);
        certificate = JSON.parse(certificate);
      } catch (ipfsError) {
        console.warn('Could not fetch certificate:', ipfsError.message);
      }
    }
    
    res.json({
      message: 'Quality test certificate',
      batchId,
      certificate,
      qualityTest
    });
  } catch (error) {
    console.error('Error getting quality test certificate:', error);
    res.status(500).json({ 
      message: 'Error getting quality test certificate', 
      error: error.message 
    });
  }
});

// Update quality test (only if not verified)
router.put('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const updateData = req.body;
    
    // Check if quality test exists and is not verified
    const qualityTest = await web3Service.getQualityTest(batchId);
    if (qualityTest.lab === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json({ message: 'Quality test not found' });
    }
    
    if (qualityTest.verified) {
      return res.status(400).json({ message: 'Cannot update verified quality test' });
    }
    
    // Update IPFS data
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user._id
    };
    
    const ipfsHash = await ipfsService.uploadJSON(updatedData);
    
    res.json({
      message: 'Quality test updated',
      batchId,
      ipfsHash,
      updatedData
    });
  } catch (error) {
    console.error('Error updating quality test:', error);
    res.status(500).json({ 
      message: 'Error updating quality test', 
      error: error.message 
    });
  }
});

// Get quality statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = {
      totalQualityTests: await web3Service.getTotalQualityTests(),
      totalLabs: await web3Service.getTotalLabs(),
      testTypes: await web3Service.getQualityTestTypes(),
      passedTests: await web3Service.getPassedQualityTests(),
      failedTests: await web3Service.getFailedQualityTests(),
      passRate: await web3Service.getQualityTestPassRate(),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      message: 'Quality test statistics',
      stats
    });
  } catch (error) {
    console.error('Error getting quality stats:', error);
    res.status(500).json({ 
      message: 'Error getting quality stats', 
      error: error.message 
    });
  }
});

// Get quality test timeline for a batch
router.get('/timeline/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const timeline = await web3Service.getQualityTestTimeline(batchId);
    
    res.json({
      message: 'Quality test timeline',
      batchId,
      timeline
    });
  } catch (error) {
    console.error('Error getting quality test timeline:', error);
    res.status(500).json({ 
      message: 'Error getting quality test timeline', 
      error: error.message 
    });
  }
});

// Bulk operations
router.post('/bulk/verify', protect, async (req, res) => {
  try {
    const { batchIds } = req.body;
    
    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({ message: 'Batch IDs array is required' });
    }
    
    const results = [];
    
    for (const batchId of batchIds) {
      try {
        const verified = await web3Service.isBatchVerified(batchId);
        results.push({
          batchId,
          verified,
          success: true
        });
      } catch (error) {
        results.push({
          batchId,
          verified: false,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      message: 'Bulk verification completed',
      results
    });
  } catch (error) {
    console.error('Error performing bulk verification:', error);
    res.status(500).json({ 
      message: 'Error performing bulk verification', 
      error: error.message 
    });
  }
});

module.exports = router;
