// routes/blockchain-processing.js
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

// Record processing step on blockchain
router.post('/record', protect, async (req, res) => {
  try {
    const {
      batchId,
      stepType,
      inputBatchId,
      outputBatchId,
      processDetails,
      images,
      documents,
      qualityMetrics
    } = req.body;

    // Validate required fields
    if (!batchId || !stepType || !inputBatchId || !outputBatchId) {
      return res.status(400).json({ 
        message: 'Missing required fields: batchId, stepType, inputBatchId, outputBatchId' 
      });
    }

    // Upload detailed data to IPFS
    const processingData = {
      batchId,
      stepType,
      inputBatchId,
      outputBatchId,
      processDetails: processDetails || {},
      images: images || [],
      documents: documents || [],
      qualityMetrics: qualityMetrics || {},
      processedBy: req.user._id,
      timestamp: new Date().toISOString()
    };

    const ipfsHash = await ipfsService.uploadJSON(processingData);

    // Record on blockchain
    const blockchainResult = await web3Service.recordProcessingOnBlockchain({
      batchId,
      stepType,
      inputBatchId,
      outputBatchId,
      processDetails,
      ipfsHash
    });

    res.status(201).json({
      message: 'Processing step recorded successfully on blockchain',
      batchId,
      blockchainResult,
      ipfsHash,
      processingData
    });
  } catch (error) {
    console.error('Error recording processing on blockchain:', error);
    res.status(500).json({ 
      message: 'Error recording processing on blockchain', 
      error: error.message 
    });
  }
});

// Get processing step from blockchain
router.get('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const processingStep = await web3Service.getProcessingStep(batchId);
    
    // Get detailed data from IPFS if available
    let detailedData = null;
    if (processingStep.ipfsHash) {
      try {
        detailedData = await ipfsService.getFileContent(processingStep.ipfsHash);
        detailedData = JSON.parse(detailedData);
      } catch (ipfsError) {
        console.warn('Could not fetch IPFS data:', ipfsError.message);
      }
    }
    
    res.json({
      message: 'Processing step retrieved from blockchain',
      batchId,
      processingStep,
      detailedData
    });
  } catch (error) {
    console.error('Error getting processing step:', error);
    res.status(500).json({ 
      message: 'Error getting processing step', 
      error: error.message 
    });
  }
});

// Get processing chain for a batch
router.get('/chain/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const processingChain = await web3Service.getProcessingChain(batchId);
    
    res.json({
      message: 'Processing chain retrieved',
      batchId,
      processingChain
    });
  } catch (error) {
    console.error('Error getting processing chain:', error);
    res.status(500).json({ 
      message: 'Error getting processing chain', 
      error: error.message 
    });
  }
});

// Get processing steps by processor
router.get('/processor/:processorAddress', protect, async (req, res) => {
  try {
    const { processorAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await web3Service.getEntityTransactions(processorAddress, 'processing');
    
    res.json({
      message: 'Processor processing history',
      processorAddress,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting processor history:', error);
    res.status(500).json({ 
      message: 'Error getting processor history', 
      error: error.message 
    });
  }
});

// Get processing steps by type
router.get('/type/:stepType', protect, async (req, res) => {
  try {
    const { stepType } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await web3Service.getProcessingStepsByType(stepType);
    
    res.json({
      message: 'Processing steps by type',
      stepType,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting processing steps by type:', error);
    res.status(500).json({ 
      message: 'Error getting processing steps by type', 
      error: error.message 
    });
  }
});

// Verify processing step
router.get('/:batchId/verify', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const processingStep = await web3Service.getProcessingStep(batchId);
    const verified = await web3Service.isBatchVerified(batchId);
    
    // Check if processing step exists
    const exists = processingStep.processor !== '0x0000000000000000000000000000000000000000';
    
    res.json({
      message: 'Processing verification result',
      batchId,
      exists,
      verified,
      processingStep: exists ? processingStep : null
    });
  } catch (error) {
    console.error('Error verifying processing step:', error);
    res.status(500).json({ 
      message: 'Error verifying processing step', 
      error: error.message 
    });
  }
});

// Update processing step (only if not verified)
router.put('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const updateData = req.body;
    
    // Check if processing step exists and is not verified
    const processingStep = await web3Service.getProcessingStep(batchId);
    if (processingStep.processor === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json({ message: 'Processing step not found' });
    }
    
    if (processingStep.verified) {
      return res.status(400).json({ message: 'Cannot update verified processing step' });
    }
    
    // Update IPFS data
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user._id
    };
    
    const ipfsHash = await ipfsService.uploadJSON(updatedData);
    
    res.json({
      message: 'Processing step updated',
      batchId,
      ipfsHash,
      updatedData
    });
  } catch (error) {
    console.error('Error updating processing step:', error);
    res.status(500).json({ 
      message: 'Error updating processing step', 
      error: error.message 
    });
  }
});

// Get processing statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = {
      totalProcessingSteps: await web3Service.getTotalProcessingSteps(),
      totalProcessors: await web3Service.getTotalProcessors(),
      processingTypes: await web3Service.getProcessingTypes(),
      verifiedSteps: await web3Service.getVerifiedProcessingSteps(),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      message: 'Processing statistics',
      stats
    });
  } catch (error) {
    console.error('Error getting processing stats:', error);
    res.status(500).json({ 
      message: 'Error getting processing stats', 
      error: error.message 
    });
  }
});

// Get processing timeline for a batch
router.get('/timeline/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const timeline = await web3Service.getProcessingTimeline(batchId);
    
    res.json({
      message: 'Processing timeline',
      batchId,
      timeline
    });
  } catch (error) {
    console.error('Error getting processing timeline:', error);
    res.status(500).json({ 
      message: 'Error getting processing timeline', 
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
