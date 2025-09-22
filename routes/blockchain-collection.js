// routes/blockchain-collection.js
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

// Record collection event on blockchain
router.post('/record', protect, async (req, res) => {
  try {
    const {
      batchId,
      species,
      latitude,
      longitude,
      quantity,
      qualityMetrics,
      sustainabilityCompliance,
      images,
      documents
    } = req.body;

    // Validate required fields
    if (!batchId || !species || !latitude || !longitude || !quantity) {
      return res.status(400).json({ 
        message: 'Missing required fields: batchId, species, latitude, longitude, quantity' 
      });
    }

    // Upload detailed data to IPFS
    const collectionData = {
      batchId,
      species,
      location: { latitude, longitude },
      quantity,
      qualityMetrics: qualityMetrics || {},
      sustainabilityCompliance: sustainabilityCompliance || {},
      images: images || [],
      documents: documents || [],
      recordedBy: req.user._id,
      timestamp: new Date().toISOString()
    };

    const ipfsHash = await ipfsService.uploadCollectionEventData(collectionData);

    // Record on blockchain
    const blockchainResult = await web3Service.recordCollectionOnBlockchain({
      batchId,
      species,
      latitude,
      longitude,
      quantity,
      qualityMetrics: JSON.stringify(qualityMetrics || {}),
      sustainabilityCompliance: JSON.stringify(sustainabilityCompliance || {}),
      ipfsHash
    });

    res.status(201).json({
      message: 'Collection event recorded successfully on blockchain',
      batchId,
      blockchainResult,
      ipfsHash,
      collectionData
    });
  } catch (error) {
    console.error('Error recording collection on blockchain:', error);
    res.status(500).json({ 
      message: 'Error recording collection on blockchain', 
      error: error.message 
    });
  }
});

// Get collection event from blockchain
router.get('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const collectionEvent = await web3Service.getCollectionEvent(batchId);
    
    // Get detailed data from IPFS if available
    let detailedData = null;
    if (collectionEvent.ipfsHash) {
      try {
        detailedData = await ipfsService.getFileContent(collectionEvent.ipfsHash);
        detailedData = JSON.parse(detailedData);
      } catch (ipfsError) {
        console.warn('Could not fetch IPFS data:', ipfsError.message);
      }
    }
    
    res.json({
      message: 'Collection event retrieved from blockchain',
      batchId,
      collectionEvent,
      detailedData
    });
  } catch (error) {
    console.error('Error getting collection event:', error);
    res.status(500).json({ 
      message: 'Error getting collection event', 
      error: error.message 
    });
  }
});

// Verify collection event on blockchain
router.get('/:batchId/verify', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const collectionEvent = await web3Service.getCollectionEvent(batchId);
    const verified = await web3Service.isBatchVerified(batchId);
    
    // Check if collection exists
    const exists = collectionEvent.collector !== '0x0000000000000000000000000000000000000000';
    
    res.json({
      message: 'Collection verification result',
      batchId,
      exists,
      verified,
      collectionEvent: exists ? collectionEvent : null
    });
  } catch (error) {
    console.error('Error verifying collection:', error);
    res.status(500).json({ 
      message: 'Error verifying collection', 
      error: error.message 
    });
  }
});

// Get collection history for a collector
router.get('/collector/:collectorAddress', protect, async (req, res) => {
  try {
    const { collectorAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // This would typically query events from the blockchain
    // For now, we'll return a placeholder response
    const transactions = await web3Service.getEntityTransactions(collectorAddress, 'collection');
    
    res.json({
      message: 'Collector collection history',
      collectorAddress,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting collector history:', error);
    res.status(500).json({ 
      message: 'Error getting collector history', 
      error: error.message 
    });
  }
});

// Get collections by species
router.get('/species/:species', protect, async (req, res) => {
  try {
    const { species } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // This would typically query events filtered by species
    // For now, we'll return a placeholder response
    const transactions = await web3Service.getEntityTransactions(species, 'collection');
    
    res.json({
      message: 'Collections by species',
      species,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting collections by species:', error);
    res.status(500).json({ 
      message: 'Error getting collections by species', 
      error: error.message 
    });
  }
});

// Get collections by location (within radius)
router.get('/location/nearby', protect, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }
    
    // This would typically query collections within a geographic radius
    // For now, we'll return a placeholder response
    res.json({
      message: 'Collections near location',
      center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      radius: parseFloat(radius),
      collections: [] // Would be populated with actual nearby collections
    });
  } catch (error) {
    console.error('Error getting nearby collections:', error);
    res.status(500).json({ 
      message: 'Error getting nearby collections', 
      error: error.message 
    });
  }
});

// Update collection event (only if not verified)
router.put('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const updateData = req.body;
    
    // Check if collection exists and is not verified
    const collectionEvent = await web3Service.getCollectionEvent(batchId);
    if (collectionEvent.collector === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json({ message: 'Collection event not found' });
    }
    
    if (collectionEvent.verified) {
      return res.status(400).json({ message: 'Cannot update verified collection event' });
    }
    
    // Update IPFS data
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user._id
    };
    
    const ipfsHash = await ipfsService.uploadJSON(updatedData);
    
    res.json({
      message: 'Collection event updated',
      batchId,
      ipfsHash,
      updatedData
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ 
      message: 'Error updating collection', 
      error: error.message 
    });
  }
});

// Get collection statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = {
      totalCollections: await web3Service.getTotalCollections(),
      totalSpecies: await web3Service.getTotalSpecies(),
      totalCollectors: await web3Service.getTotalCollectors(),
      verifiedCollections: await web3Service.getVerifiedCollections(),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      message: 'Collection statistics',
      stats
    });
  } catch (error) {
    console.error('Error getting collection stats:', error);
    res.status(500).json({ 
      message: 'Error getting collection stats', 
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
