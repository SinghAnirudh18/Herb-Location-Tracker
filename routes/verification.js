// routes/verification.js
const express = require('express');
const verificationService = require('../services/verificationService');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Initialize verification service
router.use(async (req, res, next) => {
  try {
    if (!verificationService.isInitialized) {
      await verificationService.initialize();
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize verification service', error: error.message });
  }
});

// Verify a batch
router.post('/batch/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const verification = await verificationService.verifyBatch(batchId);
    
    res.json({
      message: 'Batch verification completed',
      verification
    });
  } catch (error) {
    console.error('Error verifying batch:', error);
    res.status(500).json({ 
      message: 'Error verifying batch', 
      error: error.message 
    });
  }
});

// Generate verification report
router.get('/report/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const report = await verificationService.generateVerificationReport(batchId);
    
    res.json({
      message: 'Verification report generated',
      report
    });
  } catch (error) {
    console.error('Error generating verification report:', error);
    res.status(500).json({ 
      message: 'Error generating verification report', 
      error: error.message 
    });
  }
});

// Get verification status
router.get('/status/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const verification = await verificationService.verifyBatch(batchId);
    
    res.json({
      batchId,
      status: verification.overallStatus,
      blockchainVerified: verification.blockchainVerification.verified,
      compliant: verification.complianceVerification.overallCompliant,
      sustainable: verification.sustainabilityVerification.overallSustainable,
      qualityPassed: verification.qualityVerification.passed,
      verificationHash: verification.verificationHash
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({ 
      message: 'Error getting verification status', 
      error: error.message 
    });
  }
});

// Verify compliance
router.post('/compliance/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const compliance = await verificationService.verifyCompliance(batchId);
    
    res.json({
      message: 'Compliance verification completed',
      compliance
    });
  } catch (error) {
    console.error('Error verifying compliance:', error);
    res.status(500).json({ 
      message: 'Error verifying compliance', 
      error: error.message 
    });
  }
});

// Verify sustainability
router.post('/sustainability/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const sustainability = await verificationService.verifySustainability(batchId);
    
    res.json({
      message: 'Sustainability verification completed',
      sustainability
    });
  } catch (error) {
    console.error('Error verifying sustainability:', error);
    res.status(500).json({ 
      message: 'Error verifying sustainability', 
      error: error.message 
    });
  }
});

// Verify quality
router.post('/quality/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const quality = await verificationService.verifyQuality(batchId);
    
    res.json({
      message: 'Quality verification completed',
      quality
    });
  } catch (error) {
    console.error('Error verifying quality:', error);
    res.status(500).json({ 
      message: 'Error verifying quality', 
      error: error.message 
    });
  }
});

// Get verification history
router.get('/history/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // This would typically query a database for verification history
    // For now, we'll return the current verification
    const verification = await verificationService.verifyBatch(batchId);
    
    res.json({
      batchId,
      history: [verification]
    });
  } catch (error) {
    console.error('Error getting verification history:', error);
    res.status(500).json({ 
      message: 'Error getting verification history', 
      error: error.message 
    });
  }
});

// Bulk verification
router.post('/bulk', protect, async (req, res) => {
  try {
    const { batchIds } = req.body;
    
    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({ message: 'Batch IDs array is required' });
    }
    
    const results = [];
    
    for (const batchId of batchIds) {
      try {
        const verification = await verificationService.verifyBatch(batchId);
        results.push({
          batchId,
          status: verification.overallStatus,
          success: true
        });
      } catch (error) {
        results.push({
          batchId,
          status: 'error',
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
