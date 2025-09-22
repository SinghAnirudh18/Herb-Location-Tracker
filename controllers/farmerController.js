// controllers/farmerController.js
const Collection = require('../models/Collection');
const web3Service = require('../services/web3Service');
const ipfsService = require('../services/ipfsService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

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

    // Generate unique batch ID
    const timestamp = Date.now().toString().slice(-6);
    const herbCode = herbSpecies.slice(0, 3).toUpperCase();
    const batchId = `${herbCode}-2024-${timestamp}`;
    
    console.log('🆔 Generated batch ID:', batchId);
    
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
        blockchainRecorded = blockchainResult.transactionHash.startsWith('0x') && 
                           !blockchainResult.transactionHash.includes('mock');
        
        if (blockchainRecorded) {
          console.log('⛓️ Collection recorded on blockchain:', blockchainResult.transactionHash);
        } else {
          console.log('⛓️ Collection prepared for blockchain (mock mode):', blockchainResult.transactionHash);
        }
        
        // Update collection with blockchain info and change status
        await Collection.findByIdAndUpdate(savedCollection._id, {
          blockchainRecorded: blockchainRecorded,
          ipfsHash: ipfsHash,
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber,
          status: blockchainRecorded ? 'recorded' : 'pending' // Only change to recorded if real blockchain
        });
      }
    } catch (blockchainError) {
      console.error('⚠️ Blockchain/IPFS recording failed:', blockchainError);
      // Don't fail the entire request if blockchain recording fails
    }
    
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
        id: savedCollection.batchId,
        batchId: savedCollection.batchId,
        herbSpecies: savedCollection.herbSpecies,
        quantity: savedCollection.quantity,
        location: savedCollection.location,
        qualityGrade: savedCollection.qualityGrade,
        harvestMethod: savedCollection.harvestMethod,
        organicCertified: savedCollection.organicCertified,
        weatherConditions: savedCollection.weatherConditions,
        soilType: savedCollection.soilType,
        notes: savedCollection.notes,
        farmerId: savedCollection.farmerId,
        farmerName: savedCollection.farmerName,
        farmerAddress: savedCollection.farmerAddress,
        collectionDate: savedCollection.collectionDate,
        status: savedCollection.status,
        createdAt: savedCollection.createdAt,
        blockchainRecorded: blockchainRecorded,
        ipfsHash: ipfsHash,
        transactionHash: blockchainResult?.transactionHash || null,
        blockNumber: blockchainResult?.blockNumber || null
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

const uploadCollectionImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Find the collection to ensure it belongs to this farmer
    const collection = await Collection.findOne({ 
      batchId: id, 
      farmerId: req.user._id 
    });
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found or you do not have permission to upload images'
      });
    }

    const imageUrls = [];
    const ipfsHashes = [];

    // Process each uploaded image
    for (const file of req.files) {
      try {
        // Upload to IPFS
        const fileBuffer = await fs.readFile(file.path);
        const ipfsHash = await ipfsService.uploadFile(fileBuffer, file.originalname);
        
        ipfsHashes.push({
          filename: file.originalname,
          ipfsHash: ipfsHash,
          size: file.size,
          mimetype: file.mimetype
        });
        
        imageUrls.push(`/api/ipfs/${ipfsHash}`);
        
        // Clean up temporary file
        await fs.unlink(file.path);
      } catch (uploadError) {
        console.error('Error uploading file to IPFS:', uploadError);
        // Continue with other files even if one fails
      }
    }

    // Update collection with image information
    await Collection.findOneAndUpdate(
      { batchId: id, farmerId: req.user._id },
      { 
        $push: { 
          images: { $each: ipfsHashes },
          imageUrls: { $each: imageUrls }
        },
        updatedAt: new Date()
      }
    );

    // Record image upload on blockchain if available
    if (web3Service.isInitialized && ipfsHashes.length > 0) {
      try {
        const imageData = {
          batchId: id,
          imageHashes: ipfsHashes.map(img => img.ipfsHash),
          uploadedBy: req.user._id,
          timestamp: new Date().toISOString()
        };
        
        const metadataHash = await ipfsService.uploadJSON(imageData);
        // This would record the image upload event on blockchain
        console.log('Image metadata uploaded to IPFS:', metadataHash);
      } catch (blockchainError) {
        console.error('Failed to record images on blockchain:', blockchainError);
        // Don't fail the request if blockchain recording fails
      }
    }
    
    res.json({
      success: true,
      message: `${ipfsHashes.length} images uploaded successfully`,
      collectionId: id,
      images: ipfsHashes,
      imageUrls: imageUrls
    });
  } catch (error) {
    console.error('Error uploading collection images:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { 
  getMyCollections,
  createCollection,
  updateCollection,
  getMyStats,
  uploadCollectionImages
};