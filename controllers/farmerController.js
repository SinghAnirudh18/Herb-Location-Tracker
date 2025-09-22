const { generateFarmerBatchId } = require('../utils/batchIdGenerator');
const Collection = require('../models/Collection');
const web3Service = require('../services/web3Service');
const ipfsService = require('../services/ipfsService');

const getMyCollections = async (req, res) => {
  try {
    // Get real collections from database for this farmer
    const collections = await Collection.find({ farmerId: req.user._id })
      .sort({ collectionDate: -1 })
      .populate('processorId', 'name organization')
      .populate('labId', 'name organization');
    
    res.json({
      success: true,
      collections: collections.map(collection => ({
        id: collection.batchId,
        _id: collection._id, // Add _id for frontend compatibility
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        quantity: collection.quantity,
        location: collection.location,
        collectionDate: collection.collectionDate,
        status: collection.status,
        qualityGrade: collection.qualityGrade,
        farmerId: collection.farmerId,
        farmerName: collection.farmerName,
        harvestMethod: collection.harvestMethod,
        organicCertified: collection.organicCertified,
        weatherConditions: collection.weatherConditions,
        soilType: collection.soilType,
        notes: collection.notes,
        processingStarted: collection.processingStarted,
        processingCompleted: collection.processingCompleted,
        qualityTestDate: collection.qualityTestDate,
        qualityTestPassed: collection.qualityTestPassed,
        processor: collection.processorId ? {
          name: collection.processorId.name,
          organization: collection.processorId.organization
        } : null,
        lab: collection.labId ? {
          name: collection.labId.name,
          organization: collection.labId.organization
        } : null,
        blockchainRecorded: collection.blockchainRecorded,
        ipfsHash: collection.ipfsHash,
        transactionHash: collection.transactionHash,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const createCollection = async (req, res) => {
  try {
    console.log('📝 Creating collection with data:', req.body);
    console.log('👤 User info:', { id: req.user._id, name: req.user.name, location: req.user.location });

    const {
      herbSpecies,
      quantity,
      location,
      qualityGrade,
      harvestMethod,
      organicCertified,
      weatherConditions,
      soilType,
      notes
    } = req.body;

    // Validate required fields
    if (!herbSpecies || !quantity || !location || !qualityGrade) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: herbSpecies, quantity, location, qualityGrade are required'
      });
    }

    // Generate unique batch ID using the new utility
    const batchId = generateFarmerBatchId(herbSpecies);
    
    console.log('🆔 Generated batch ID:', batchId);
    
    // Validate batch ID format
    if (!batchId || batchId.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID generated'
      });
    }
    
    // Check if batch ID already exists
    const existingBatch = await Collection.findOne({ batchId });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID already exists. Please try again.'
      });
    }

    // Create collection data object with proper type conversion
    const collectionData = {
      batchId,
      herbSpecies: String(herbSpecies).trim(),
      quantity: parseFloat(quantity),
      location: String(location).trim(),
      qualityGrade: String(qualityGrade),
      harvestMethod: harvestMethod ? String(harvestMethod) : 'Hand-picked',
      organicCertified: Boolean(organicCertified),
      weatherConditions: weatherConditions ? String(weatherConditions) : '',
      soilType: soilType ? String(soilType) : '',
      notes: notes ? String(notes) : '',
      farmerId: req.user._id,
      farmerName: req.user.name,
      farmerAddress: req.user.location || 'Not specified',
      status: 'pending',
      blockchainRecorded: false,
      ipfsHash: null,
      transactionHash: null
    };

    console.log('💾 Collection data to save:', collectionData);
    
    // Validate data types before creating collection
    console.log('🔍 Data types check:', {
      herbSpecies: typeof collectionData.herbSpecies,
      quantity: typeof collectionData.quantity,
      qualityGrade: typeof collectionData.qualityGrade,
      organicCertified: typeof collectionData.organicCertified
    });
    
    // Create real collection in database
    const collection = new Collection(collectionData);

    // Save to database
    const savedCollection = await collection.save();
    console.log('✅ Collection saved successfully:', savedCollection._id);

    // Record on blockchain and IPFS if services are available
    let blockchainResult = null;
    let ipfsHash = null;
    let blockchainRecorded = false;
    let ipfsRecorded = false;
    
    try {
      // Upload detailed data to IPFS
      if (ipfsService.isInitialized) {
        const ipfsData = {
          ...collectionData,
          farmer: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            location: req.user.location
          },
          coordinates: req.user.coordinates || null,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        ipfsHash = await ipfsService.uploadJSON(ipfsData);
        ipfsRecorded = ipfsService.isAvailable; // Check if real IPFS or mock
        
        if (ipfsService.isAvailable) {
          console.log('📦 Collection data uploaded to IPFS:', ipfsHash);
        } else {
          console.log('📦 Collection data prepared for IPFS (mock mode):', ipfsHash);
        }
      }

      // Record on blockchain
      if (web3Service.isInitialized) {
        const blockchainData = {
          batchId,
          species: herbSpecies,
          latitude: req.user.coordinates?.latitude || 0,
          longitude: req.user.coordinates?.longitude || 0,
          quantity: parseFloat(quantity),
          qualityMetrics: {
            grade: qualityGrade,
            organicCertified,
            harvestMethod
          },
          sustainabilityCompliance: {
            environmentallyFriendly: organicCertified,
            fairTrade: true,
            sustainableHarvesting: harvestMethod === 'Hand-picked'
          },
          ipfsHash
        };
        
        blockchainResult = await web3Service.recordCollectionOnBlockchain(blockchainData);
        
        // Check if this is a real blockchain transaction or mock
        blockchainRecorded = blockchainResult.transactionHash && 
                           blockchainResult.transactionHash.startsWith('0x') && 
                           !blockchainResult.transactionHash.includes('mock');
        
        if (blockchainRecorded) {
          console.log('⛓️ Collection recorded on blockchain:', blockchainResult.transactionHash);
        } else {
          console.log('⛓️ Collection prepared for blockchain (mock mode):', blockchainResult.transactionHash);
        }
        
        // Update collection with blockchain info - keep status consistent
        await Collection.findByIdAndUpdate(savedCollection._id, {
          blockchainRecorded: blockchainRecorded,
          ipfsHash: ipfsHash,
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber,
          status: blockchainRecorded ? 'recorded' : 'pending' // Only change if real blockchain
        });
      }
    } catch (blockchainError) {
      console.error('⚠️ Blockchain/IPFS recording failed:', blockchainError);
      // Don't fail the entire request if blockchain recording fails
    }
    
    // Refresh the collection data after updates
    const updatedCollection = await Collection.findById(savedCollection._id);
    
    // Determine the final status message
    let statusMessage = 'Collection created successfully';
    let blockchainStatus = {
      recorded: blockchainRecorded,
      transactionHash: blockchainResult?.transactionHash || null,
      ipfsHash: ipfsHash || null,
      services: {
        blockchain: web3Service.isInitialized,
        ipfs: ipfsService.isInitialized && ipfsService.isAvailable
      }
    };

    if (blockchainRecorded && ipfsRecorded) {
      statusMessage = 'Collection created and recorded on blockchain & IPFS successfully';
    } else if (blockchainRecorded) {
      statusMessage = 'Collection created and recorded on blockchain successfully';
    } else if (ipfsRecorded) {
      statusMessage = 'Collection created and stored on IPFS successfully';
    } else if (web3Service.isInitialized || ipfsService.isInitialized) {
      statusMessage = 'Collection created successfully (blockchain services in mock mode)';
    }

    res.status(201).json({
      success: true,
      message: statusMessage,
      collection: {
        id: updatedCollection.batchId,
        _id: updatedCollection._id, // Important: Add _id for frontend
        batchId: updatedCollection.batchId,
        herbSpecies: updatedCollection.herbSpecies,
        quantity: updatedCollection.quantity,
        location: updatedCollection.location,
        qualityGrade: updatedCollection.qualityGrade,
        harvestMethod: updatedCollection.harvestMethod,
        organicCertified: updatedCollection.organicCertified,
        weatherConditions: updatedCollection.weatherConditions,
        soilType: updatedCollection.soilType,
        notes: updatedCollection.notes,
        farmerId: updatedCollection.farmerId,
        farmerName: updatedCollection.farmerName,
        farmerAddress: updatedCollection.farmerAddress,
        collectionDate: updatedCollection.collectionDate,
        status: updatedCollection.status,
        blockchainRecorded: updatedCollection.blockchainRecorded,
        ipfsHash: updatedCollection.ipfsHash,
        transactionHash: updatedCollection.transactionHash,
        createdAt: updatedCollection.createdAt,
        updatedAt: updatedCollection.updatedAt
      },
      blockchain: blockchainStatus
    });
  } catch (error) {
    console.error('❌ Error creating collection:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.error('📋 Validation Error Details:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => {
        console.error(`Field: ${err.path}, Value: ${err.value}, Error: ${err.message}`);
        return `${err.path}: ${err.message}`;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle cast errors specifically
    if (error.name === 'CastError') {
      console.error('🔄 Cast Error Details:', {
        path: error.path,
        value: error.value,
        kind: error.kind
      });
      return res.status(400).json({
        success: false,
        message: `Invalid data type for field '${error.path}': expected ${error.kind} but got '${error.value}'`,
        errors: [`${error.path}: Invalid data type`]
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID already exists. Please try again.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find and update the collection (only if it belongs to this farmer)
    const collection = await Collection.findOneAndUpdate(
      { batchId: id, farmerId: req.user._id },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found or you do not have permission to update it'
      });
    }
    
    res.json({
      success: true,
      message: 'Collection updated successfully',
      collection: {
        id: collection.batchId,
        _id: collection._id,
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
        status: collection.status,
        updatedAt: collection.updatedAt
      }
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
    // Get real stats from database for this farmer
    const farmerId = req.user._id;
    
    // Get total collections count
    const totalCollections = await Collection.countDocuments({ farmerId });
    
    // Get this month's collections
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = await Collection.countDocuments({
      farmerId,
      collectionDate: { $gte: startOfMonth }
    });
    
    // Get verified collections (completed or tested)
    const verified = await Collection.countDocuments({
      farmerId,
      status: { $in: ['completed', 'tested'] }
    });
    
    // Get pending collections
    const pending = await Collection.countDocuments({
      farmerId,
      status: 'pending'
    });
    
    // Get total quantity
    const quantityResult = await Collection.aggregate([
      { $match: { farmerId: req.user._id } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
    ]);
    const totalQuantity = quantityResult.length > 0 ? quantityResult[0].totalQuantity : 0;
    
    // Calculate average quality score (based on quality grades)
    const qualityGrades = await Collection.aggregate([
      { $match: { farmerId: req.user._id } },
      { $group: { _id: '$qualityGrade', count: { $sum: 1 } } }
    ]);
    
    let averageQuality = 0;
    if (qualityGrades.length > 0) {
      const qualityPoints = qualityGrades.reduce((total, grade) => {
        const points = grade._id === 'Premium' ? 100 : 
                     grade._id === 'Standard' ? 80 : 60;
        return total + (points * grade.count);
      }, 0);
      averageQuality = Math.round((qualityPoints / totalCollections) * 100) / 100;
    }
    
    // Calculate trends (comparing with previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    
    const lastMonthEnd = new Date(startOfMonth);
    lastMonthEnd.setSeconds(-1);
    
    const lastMonthCollections = await Collection.countDocuments({
      farmerId,
      collectionDate: { $gte: lastMonth, $lte: lastMonthEnd }
    });
    
    const batchesTrend = lastMonthCollections > 0 ? 
      ((thisMonth - lastMonthCollections) / lastMonthCollections * 100) : 0;
    
    const stats = {
      totalCollections,
      thisMonth,
      verified,
      pending,
      totalQuantity,
      averageQuality,
      trends: {
        batches: Math.round(batchesTrend * 100) / 100,
        verified: verified > 0 ? Math.round((verified / totalCollections * 100) * 100) / 100 : 0,
        users: 0, // This would need user activity tracking
        compliance: averageQuality > 90 ? 5.2 : averageQuality > 80 ? 2.1 : -1.5
      }
    };
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const debugBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log('🔍 Debugging batch:', batchId);
    
    // Check if batch exists in database
    const collection = await Collection.findOne({ batchId });
    console.log('📊 Database result:', collection);
    
    // Check blockchain status
    let blockchainStatus = 'not_checked';
    try {
      if (web3Service.isInitialized) {
        const verified = await web3Service.isBatchVerified(batchId);
        blockchainStatus = verified ? 'verified' : 'not_verified';
      }
    } catch (blockchainError) {
      blockchainStatus = 'blockchain_error: ' + blockchainError.message;
    }
    
    res.json({
      batchId,
      existsInDatabase: !!collection,
      databaseStatus: collection?.status,
      blockchainStatus,
      collectionData: collection
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getMyCollections,
  createCollection,
  updateCollection,
  getMyStats,
  debugBatch
};