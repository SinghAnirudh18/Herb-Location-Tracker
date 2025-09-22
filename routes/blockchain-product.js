// routes/blockchain-product.js
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

// Create product on blockchain
router.post('/create', protect, async (req, res) => {
  try {
    const {
      batchId,
      productName,
      formulation,
      qrCode,
      productImages,
      packagingImages,
      documentation
    } = req.body;

    // Validate required fields
    if (!batchId || !productName || !formulation || !qrCode) {
      return res.status(400).json({ 
        message: 'Missing required fields: batchId, productName, formulation, qrCode' 
      });
    }

    // Upload detailed data to IPFS
    const productData = {
      batchId,
      productName,
      formulation,
      qrCode,
      productImages: productImages || [],
      packagingImages: packagingImages || [],
      documentation: documentation || [],
      createdBy: req.user._id,
      timestamp: new Date().toISOString()
    };

    const ipfsHash = await ipfsService.uploadProductData(productData);

    // Create on blockchain
    const blockchainResult = await web3Service.createProductOnBlockchain({
      batchId,
      productName,
      formulation,
      qrCode,
      ipfsHash
    });

    res.status(201).json({
      message: 'Product created successfully on blockchain',
      batchId,
      blockchainResult,
      ipfsHash,
      productData
    });
  } catch (error) {
    console.error('Error creating product on blockchain:', error);
    res.status(500).json({ 
      message: 'Error creating product on blockchain', 
      error: error.message 
    });
  }
});

// Get product from blockchain
router.get('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const product = await web3Service.getProduct(batchId);
    
    // Get detailed data from IPFS if available
    let detailedData = null;
    if (product.ipfsHash) {
      try {
        detailedData = await ipfsService.getFileContent(product.ipfsHash);
        detailedData = JSON.parse(detailedData);
      } catch (ipfsError) {
        console.warn('Could not fetch IPFS data:', ipfsError.message);
      }
    }
    
    res.json({
      message: 'Product retrieved from blockchain',
      batchId,
      product,
      detailedData
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ 
      message: 'Error getting product', 
      error: error.message 
    });
  }
});

// Get product by QR code
router.get('/qr/:qrCode', protect, async (req, res) => {
  try {
    const { qrCode } = req.params;
    
    const product = await web3Service.getProductByQRCode(qrCode);
    
    if (!product || product.manufacturer === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get detailed data from IPFS if available
    let detailedData = null;
    if (product.ipfsHash) {
      try {
        detailedData = await ipfsService.getFileContent(product.ipfsHash);
        detailedData = JSON.parse(detailedData);
      } catch (ipfsError) {
        console.warn('Could not fetch IPFS data:', ipfsError.message);
      }
    }
    
    res.json({
      message: 'Product retrieved by QR code',
      qrCode,
      product,
      detailedData
    });
  } catch (error) {
    console.error('Error getting product by QR code:', error);
    res.status(500).json({ 
      message: 'Error getting product by QR code', 
      error: error.message 
    });
  }
});

// Get products by manufacturer
router.get('/manufacturer/:manufacturerAddress', protect, async (req, res) => {
  try {
    const { manufacturerAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await web3Service.getEntityTransactions(manufacturerAddress, 'product');
    
    res.json({
      message: 'Manufacturer product history',
      manufacturerAddress,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting manufacturer products:', error);
    res.status(500).json({ 
      message: 'Error getting manufacturer products', 
      error: error.message 
    });
  }
});

// Get products by name
router.get('/name/:productName', protect, async (req, res) => {
  try {
    const { productName } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const transactions = await web3Service.getProductsByName(productName);
    
    res.json({
      message: 'Products by name',
      productName,
      transactions: transactions.slice(offset, offset + parseInt(limit)),
      total: transactions.length
    });
  } catch (error) {
    console.error('Error getting products by name:', error);
    res.status(500).json({ 
      message: 'Error getting products by name', 
      error: error.message 
    });
  }
});

// Verify product
router.get('/:batchId/verify', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const product = await web3Service.getProduct(batchId);
    const verified = await web3Service.isBatchVerified(batchId);
    const compliant = await web3Service.checkCompliance(batchId);
    
    // Check if product exists
    const exists = product.manufacturer !== '0x0000000000000000000000000000000000000000';
    
    res.json({
      message: 'Product verification result',
      batchId,
      exists,
      verified,
      compliant,
      product: exists ? product : null
    });
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({ 
      message: 'Error verifying product', 
      error: error.message 
    });
  }
});

// Get product traceability chain
router.get('/:batchId/traceability', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const traceabilityChain = await web3Service.getProductTraceabilityChain(batchId);
    
    res.json({
      message: 'Product traceability chain',
      batchId,
      traceabilityChain
    });
  } catch (error) {
    console.error('Error getting product traceability:', error);
    res.status(500).json({ 
      message: 'Error getting product traceability', 
      error: error.message 
    });
  }
});

// Get product quality summary
router.get('/:batchId/quality-summary', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const qualitySummary = await web3Service.getProductQualitySummary(batchId);
    
    res.json({
      message: 'Product quality summary',
      batchId,
      qualitySummary
    });
  } catch (error) {
    console.error('Error getting product quality summary:', error);
    res.status(500).json({ 
      message: 'Error getting product quality summary', 
      error: error.message 
    });
  }
});

// Update product (only if not verified)
router.put('/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const updateData = req.body;
    
    // Check if product exists and is not verified
    const product = await web3Service.getProduct(batchId);
    if (product.manufacturer === '0x0000000000000000000000000000000000000000') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.verified) {
      return res.status(400).json({ message: 'Cannot update verified product' });
    }
    
    // Update IPFS data
    const updatedData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user._id
    };
    
    const ipfsHash = await ipfsService.uploadJSON(updatedData);
    
    res.json({
      message: 'Product updated',
      batchId,
      ipfsHash,
      updatedData
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product', 
      error: error.message 
    });
  }
});

// Get product statistics
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = {
      totalProducts: await web3Service.getTotalProducts(),
      totalManufacturers: await web3Service.getTotalManufacturers(),
      verifiedProducts: await web3Service.getVerifiedProducts(),
      compliantProducts: await web3Service.getCompliantProducts(),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      message: 'Product statistics',
      stats
    });
  } catch (error) {
    console.error('Error getting product stats:', error);
    res.status(500).json({ 
      message: 'Error getting product stats', 
      error: error.message 
    });
  }
});

// Get product timeline
router.get('/:batchId/timeline', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const timeline = await web3Service.getProductTimeline(batchId);
    
    res.json({
      message: 'Product timeline',
      batchId,
      timeline
    });
  } catch (error) {
    console.error('Error getting product timeline:', error);
    res.status(500).json({ 
      message: 'Error getting product timeline', 
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
        const compliant = await web3Service.checkCompliance(batchId);
        results.push({
          batchId,
          verified,
          compliant,
          success: true
        });
      } catch (error) {
        results.push({
          batchId,
          verified: false,
          compliant: false,
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
