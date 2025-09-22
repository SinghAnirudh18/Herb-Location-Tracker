// routes/blockchain.js
const express = require('express');
const web3Service = require('../services/web3Service');
const ipfsService = require('../services/ipfsService');
const { protect } = require('../middleware/auth');
const Collection = require('../models/Collection');
const ProcessingStep = require('../models/ProcessingStep');
const QualityTest = require('../models/QualityTest');
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

// Get blockchain network information
router.get('/network', protect, async (req, res) => {
  try {
    const networkInfo = await web3Service.getNetworkInfo();
    res.json({
      message: 'Blockchain network information',
      network: networkInfo
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting network info', error: error.message });
  }
});

// Get blockchain status and health
router.get('/status', protect, async (req, res) => {
  try {
    const status = await web3Service.getBlockchainStatus();
    res.json({
      message: 'Blockchain status',
      status
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting blockchain status', error: error.message });
  }
});

// Get specific block by number
router.get('/block/:blockNumber', protect, async (req, res) => {
  try {
    const blockNumber = parseInt(req.params.blockNumber);
    const block = await web3Service.getBlock(blockNumber);
    
    res.json({
      message: 'Block information',
      block
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting block', error: error.message });
  }
});

// Get latest block
router.get('/latest-block', protect, async (req, res) => {
  try {
    const latestBlock = await web3Service.getLatestBlock();
    res.json({
      message: 'Latest block information',
      block: latestBlock
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting latest block', error: error.message });
  }
});

// Get transaction by hash
router.get('/transaction/:txHash', protect, async (req, res) => {
  try {
    const { txHash } = req.params;
    const transaction = await web3Service.getTransaction(txHash);
    
    res.json({
      message: 'Transaction information',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting transaction', error: error.message });
  }
});

// Get transactions for a specific entity (batch ID)
router.get('/transactions/:entityId', protect, async (req, res) => {
  try {
    const { entityId } = req.params;
    const { type } = req.query;
    
    const transactions = await web3Service.getEntityTransactions(entityId, type);
    
    res.json({
      message: 'Entity transactions',
      entityId,
      transactionCount: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting entity transactions', error: error.message });
  }
});

// Get batch history from blockchain
router.get('/batch-history/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const history = await web3Service.getBatchHistory(batchId);
    
    res.json({
      message: 'Batch history from blockchain',
      batchId,
      history
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting batch history', error: error.message });
  }
});

// Get collection event from blockchain
router.get('/collection/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const collectionEvent = await web3Service.getCollectionEvent(batchId);
    
    res.json({
      message: 'Collection event from blockchain',
      batchId,
      collectionEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting collection event', error: error.message });
  }
});

// Get quality test from blockchain
router.get('/quality-test/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const qualityTest = await web3Service.getQualityTest(batchId);
    
    res.json({
      message: 'Quality test from blockchain',
      batchId,
      qualityTest
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting quality test', error: error.message });
  }
});

// Get product from blockchain
router.get('/product/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const product = await web3Service.getProduct(batchId);
    
    res.json({
      message: 'Product from blockchain',
      batchId,
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting product', error: error.message });
  }
});

// Check if batch is verified on blockchain
router.get('/verify/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const verified = await web3Service.isBatchVerified(batchId);
    const compliant = await web3Service.checkCompliance(batchId);
    
    res.json({
      message: 'Batch verification status',
      batchId,
      verified,
      compliant
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking batch verification', error: error.message });
  }
});

// Get balance of an address
router.get('/balance/:address', protect, async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await web3Service.getBalance(address);
    
    res.json({
      message: 'Address balance',
      address,
      balance: balance + ' ETH'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting balance', error: error.message });
  }
});

// Get gas price information
router.get('/gas-price', protect, async (req, res) => {
  try {
    const gasPrice = await web3Service.getGasPrice();
    
    res.json({
      message: 'Gas price information',
      gasPrice
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting gas price', error: error.message });
  }
});

// Get contract addresses
router.get('/contracts', protect, async (req, res) => {
  try {
    const contracts = await web3Service.getContractAddresses();
    
    res.json({
      message: 'Smart contract addresses',
      contracts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting contract addresses', error: error.message });
  }
});

// Get IPFS node information
router.get('/ipfs/info', protect, async (req, res) => {
  try {
    const info = await ipfsService.getNodeInfo();
    const stats = await ipfsService.getStats();
    
    res.json({
      message: 'IPFS node information',
      nodeInfo: info,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting IPFS info', error: error.message });
  }
});

// Get pinned files on IPFS
router.get('/ipfs/pinned', protect, async (req, res) => {
  try {
    const pinnedFiles = await ipfsService.getPinnedFiles();
    
    res.json({
      message: 'Pinned files on IPFS',
      pinnedFiles
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting pinned files', error: error.message });
  }
});

// Upload file to IPFS
router.post('/ipfs/upload', protect, async (req, res) => {
  try {
    const { data, fileName } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'Data is required for upload' });
    }
    
    const ipfsHash = await ipfsService.uploadJSON(data);
    
    res.json({
      message: 'File uploaded to IPFS',
      ipfsHash,
      fileName: fileName || 'data.json'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading to IPFS', error: error.message });
  }
});

// Get file from IPFS
router.get('/ipfs/file/:hash', protect, async (req, res) => {
  try {
    const { hash } = req.params;
    const content = await ipfsService.getFileContent(hash);
    
    res.json({
      message: 'File content from IPFS',
      hash,
      content
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting file from IPFS', error: error.message });
  }
});

// Record collection on blockchain (called by frontend)
router.post('/record-collection', protect, async (req, res) => {
  try {
    const {
      batchId,
      herbSpecies,
      quantity,
      location,
      qualityGrade,
      harvestMethod,
      organicCertified,
      weatherConditions,
      soilType,
      notes,
      walletAddress
    } = req.body;

    // Validate required fields
    if (!batchId || !herbSpecies || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: batchId, herbSpecies, quantity' 
      });
    }

    // Prepare data for blockchain
    const blockchainData = {
      batchId,
      species: herbSpecies,
      latitude: req.user.coordinates?.latitude || 0,
      longitude: req.user.coordinates?.longitude || 0,
      quantity: parseFloat(quantity),
      qualityMetrics: {
        grade: qualityGrade,
        organicCertified: Boolean(organicCertified),
        harvestMethod: harvestMethod || 'Hand-picked'
      },
      sustainabilityCompliance: {
        environmentallyFriendly: Boolean(organicCertified),
        fairTrade: true,
        sustainableHarvesting: harvestMethod === 'Hand-picked'
      }
    };

    // Upload detailed data to IPFS first
    const ipfsData = {
      ...blockchainData,
      location,
      weatherConditions,
      soilType,
      notes,
      farmer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        location: req.user.location,
        walletAddress
      },
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const ipfsHash = await ipfsService.uploadJSON(ipfsData);
    blockchainData.ipfsHash = ipfsHash;

    // Record on blockchain
    const result = await web3Service.recordCollectionOnBlockchain(blockchainData);

    res.json({
      success: true,
      message: 'Collection recorded on blockchain successfully',
      txHash: result.transactionHash,
      blockNumber: result.blockNumber,
      ipfsHash: ipfsHash,
      gasUsed: result.gasUsed
    });
  } catch (error) {
    console.error('Error recording collection on blockchain:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to record collection on blockchain', 
      error: error.message 
    });
  }
});

// Record traceability step on blockchain (called by frontend for traceability flow)
router.post('/record-step', protect, async (req, res) => {
  try {
    const {
      batchId,
      step,
      data,
      walletAddress
    } = req.body;

    // Validate required fields
    if (!batchId || !step || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchId, step, data'
      });
    }

    // Prepare data for blockchain based on step type
    let blockchainData = {
      batchId,
      step,
      timestamp: new Date().toISOString(),
      walletAddress
    };

    // Add step-specific data
    switch (step) {
      case 'collection':
        blockchainData = {
          ...blockchainData,
          species: data.herbSpecies,
          quantity: parseFloat(data.quantity || 0),
          location: data.location,
          qualityGrade: data.qualityGrade,
          harvestMethod: data.harvestMethod
        };
        break;
      case 'processing':
        blockchainData = {
          ...blockchainData,
          processingType: data.processingType,
          processorName: data.processorName,
          temperature: parseFloat(data.temperature || 0),
          duration: parseFloat(data.duration || 0),
          yield: parseFloat(data.yield || 0)
        };
        break;
      case 'quality':
        blockchainData = {
          ...blockchainData,
          testType: data.testType,
          labName: data.labName,
          testResults: data.testResults,
          purityLevel: parseFloat(data.purityLevel || 0),
          certificateNumber: data.certificateNumber
        };
        break;
      case 'product':
        blockchainData = {
          ...blockchainData,
          productName: data.productName,
          packageDate: data.packageDate,
          manufacturer: data.manufacturer,
          batchSize: parseFloat(data.batchSize || 0),
          expiryDate: data.expiryDate
        };
        break;
      default:
        blockchainData = { ...blockchainData, ...data };
    }

    // Upload detailed data to IPFS first
    const ipfsData = {
      ...blockchainData,
      farmer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        location: req.user.location
      },
      version: '1.0'
    };

    const ipfsHash = await ipfsService.uploadJSON(ipfsData);
    blockchainData.ipfsHash = ipfsHash;

    // Record on blockchain
    const result = await web3Service.recordStepOnBlockchain(blockchainData);

    res.json({
      success: true,
      message: `${step} step recorded on blockchain successfully`,
      txHash: result.transactionHash,
      blockNumber: result.blockNumber,
      ipfsHash: ipfsHash,
      gasUsed: result.gasUsed
    });
  } catch (error) {
    console.error('Error recording step on blockchain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record step on blockchain',
      error: error.message
    });
  }
});

// Verify batch on blockchain
router.get('/verify-batch/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { walletAddress } = req.query;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    // Try to get batch verification from web3Service
    try {
      const isVerified = await web3Service.isBatchVerified(batchId);
      const batchHistory = await web3Service.getBatchHistory(batchId);

      if (isVerified || batchHistory.length > 0) {
        return res.json({
          success: true,
          verified: isVerified,
          batchId,
          history: batchHistory,
          message: isVerified ? 'Batch verified on blockchain' : 'Batch found on blockchain but not fully verified',
          txHash: batchHistory.length > 0 ? 'Mock transaction hash' : null,
          blockNumber: batchHistory.length > 0 ? Math.floor(Math.random() * 1000000) : null,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log('Batch not found in web3Service, continuing with fallback check');
    }

    // Fallback: check if batch exists in our records
    res.json({
      success: true,
      verified: false,
      batchId,
      message: 'Batch verification data not available on blockchain yet',
      note: 'This batch may need to be recorded first'
    });

  } catch (error) {
    console.error('Error verifying batch on blockchain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify batch on blockchain',
      error: error.message
    });
  }
});

// Search for batch by batchId and return complete traceability data
router.get('/search-batch/:batchId', protect, async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    console.log(`🔍 Searching for batch: ${batchId}`);

    // Search for collection
    const collection = await Collection.findOne({ batchId });
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
        batchId
      });
    }

    // Get processing steps for this batch
    const processingSteps = await ProcessingStep.find({ batchId });
    
    // Get quality tests for this batch
    const qualityTests = await QualityTest.find({ batchId });

    // Check blockchain verification
    let blockchainVerification = null;
    try {
      const isVerified = await web3Service.isBatchVerified(batchId);
      const batchHistory = await web3Service.getBatchHistory(batchId);
      blockchainVerification = {
        verified: isVerified,
        history: batchHistory,
        txHash: batchHistory.length > 0 ? 'Mock transaction hash' : null,
        blockNumber: batchHistory.length > 0 ? Math.floor(Math.random() * 1000000) : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.log('Blockchain verification failed:', error.message);
      blockchainVerification = {
        verified: false,
        history: [],
        error: 'Blockchain verification failed'
      };
    }

    // Transform data for frontend
    const batchData = {
      id: collection.batchId,
      batchId: collection.batchId,
      herbSpecies: collection.herbSpecies,
      quantity: collection.quantity,
      location: collection.location,
      qualityGrade: collection.qualityGrade,
      harvestMethod: collection.harvestMethod,
      organicCertified: collection.organicCertified,
      weatherConditions: collection.weatherConditions,
      soilType: collection.soilType,
      notes: collection.notes,
      farmerName: collection.farmerName,
      farmerAddress: collection.farmerAddress,
      collectionDate: collection.collectionDate,
      status: collection.status,
      blockchainRecorded: collection.blockchainRecorded,
      ipfsHash: collection.ipfsHash,
      transactionHash: collection.transactionHash,
      currentStep: processingSteps.length > 0 ? 2 : 1,
      steps: {
        collection: {
          completed: true,
          data: {
            farmerName: collection.farmerName,
            location: collection.location,
            quantity: collection.quantity,
            herbSpecies: collection.herbSpecies,
            qualityGrade: collection.qualityGrade,
            harvestMethod: collection.harvestMethod,
            organicCertified: collection.organicCertified,
            weatherConditions: collection.weatherConditions,
            soilType: collection.soilType,
            notes: collection.notes,
            collectionDate: collection.collectionDate
          }
        },
        processing: {
          completed: processingSteps.length > 0,
          data: processingSteps.map(step => ({
            processType: step.processType,
            processingDate: step.startTime,
            processorName: step.processorName,
            temperature: step.parameters?.temperature || '',
            duration: step.parameters?.duration || '',
            yield: step.outputQuantity || '',
            notes: step.notes || ''
          }))
        },
        quality: {
          completed: qualityTests.length > 0,
          data: qualityTests.map(test => ({
            testType: test.testType,
            testDate: test.testDate,
            labName: test.labName,
            passed: test.passed,
            testResults: test.testResults,
            certificateNumber: test.certificateNumber
          }))
        },
        product: {
          completed: false,
          data: {}
        }
      },
      blockchainVerification,
      verifiedOnBlockchain: blockchainVerification?.verified || false
    };

    res.json({
      success: true,
      batch: batchData,
      traceability: {
        collection,
        processingSteps,
        qualityTests
      },
      blockchainVerification,
      message: 'Batch found successfully'
    });

  } catch (error) {
    console.error('Error searching for batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search for batch',
      error: error.message
    });
  }
});

module.exports = router;