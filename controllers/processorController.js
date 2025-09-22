const web3Service = require('../services/web3Service');
const Collection = require('../models/Collection');
const ProcessingStep = require('../models/ProcessingStep');

const getAssignedBatches = async (req, res) => {
  try {
    // Get ALL batches available for processing (any processor can access any batch)
    const collections = await Collection.find({
      status: { $in: ['pending', 'processing', 'recorded'] } // All available statuses
    })
    .populate('farmerId', 'name organization location')
    .sort({ collectionDate: -1 });
    
    res.json({
      success: true,
      batches: collections.map(collection => ({
        id: collection.batchId,
        _id: collection._id,
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        quantity: collection.quantity,
        location: collection.location,
        qualityGrade: collection.qualityGrade,
        collectionDate: collection.collectionDate,
        status: collection.status,
        farmer: {
          name: collection.farmerId?.name || 'Unknown',
          organization: collection.farmerId?.organization || 'Unknown',
          location: collection.farmerId?.location || 'Unknown'
        },
        processingStarted: collection.processingStarted,
        assignedToMe: collection.processorId && collection.processorId.toString() === req.user._id.toString(),
        blockchainRecorded: collection.blockchainRecorded,
        transactionHash: collection.transactionHash
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const startProcessing = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log('🔧 Starting processing for batch:', batchId);
    console.log('👤 Processor:', { id: req.user._id, name: req.user.name });

    // Find the collection and assign it to this processor
    const collection = await Collection.findOneAndUpdate(
      { batchId, status: { $in: ['pending', 'recorded'] } }, // More flexible status check
      { 
        processorId: req.user._id,
        status: 'processing',
        processingStarted: new Date()
      },
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or already being processed'
      });
    }

    console.log('✅ Processing started for batch:', collection.batchId);
    
    res.json({
      success: true,
      message: 'Processing started successfully',
      batch: {
        id: collection.batchId,
        _id: collection._id,
        batchId: collection.batchId,
        status: collection.status,
        processingStarted: collection.processingStarted,
        processorId: collection.processorId
      }
    });
  } catch (error) {
    console.error('❌ Error starting processing:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const recordProcessingStep = async (req, res) => {
  try {
    const {
      batchId,
      processType,
      parameters,
      inputQuantity,
      outputQuantity,
      equipment,
      notes
    } = req.body;
    const existingStep = await ProcessingStep.findOne({
      batchId,
      processType,
      processorId: req.user._id,
      'parameters.temperature': parameters?.temperature, // Match specific parameters
      'parameters.duration': parameters?.duration
    });

    if (existingStep) {
      return res.status(400).json({
        success: false,
        message: 'This processing step has already been recorded for this batch',
        existingStep: {
          id: existingStep._id,
          processType: existingStep.processType,
          createdAt: existingStep.createdAt
        }
      });
    }
    console.log('📝 Recording processing step for batch:', batchId);
    console.log('🔧 Process type:', processType);

    // FIXED: Any processor can access any batch - removed processorId check
    const collection = await Collection.findOne({ 
      batchId
    });
    
    if (!collection) {
      return res.status(404).json({ 
        success: false,
        message: 'Batch not found' 
      });
    }

    // If batch isn't assigned to anyone, assign it to current processor
    if (!collection.processorId) {
      collection.processorId = req.user._id;
      collection.status = 'processing';
      if (!collection.processingStarted) {
        collection.processingStarted = new Date();
      }
      await collection.save();
      console.log('✅ Batch assigned to processor:', req.user.name);
    }

    // Validate required fields
    if (!processType || !inputQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: processType and inputQuantity are required'
      });
    }

    // Create processing step
    const processingStep = new ProcessingStep({
      processorId: req.user._id,
      processorName: req.user.name,
      collectionId: collection._id,
      batchId,
      processType,
      parameters: parameters || {},
      inputQuantity: parseFloat(inputQuantity),
      outputQuantity: outputQuantity ? parseFloat(outputQuantity) : parseFloat(inputQuantity),
      equipment: equipment || {},
      notes: notes || '',
      status: 'completed',
      startTime: new Date()
    });

    await processingStep.save();
    console.log('✅ Processing step saved:', processingStep._id);

    // Record on blockchain
    let blockchainResult = null;
    let blockchainRecorded = false;
    
    try {
      blockchainResult = await web3Service.recordProcessingOnBlockchain({
        batchId: batchId,
        stepType: processType
      });

      // Check if this is a real blockchain transaction
      blockchainRecorded = blockchainResult.transactionHash && 
                         blockchainResult.transactionHash.startsWith('0x');
      
      if (blockchainRecorded) {
        console.log('⛓️ Processing step recorded on blockchain:', blockchainResult.transactionHash);
      } else {
        console.log('⛓️ Processing step recorded (mock mode):', blockchainResult.transactionHash);
      }

      // Update processing step with blockchain info
      await ProcessingStep.findByIdAndUpdate(processingStep._id, {
        blockchainRecorded: blockchainRecorded,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber
      });
    } catch (blockchainError) {
      console.error('⚠️ Blockchain recording failed:', blockchainError.message);
      // Don't fail the request if blockchain recording fails
    }

    res.status(201).json({
      success: true,
      message: 'Processing step recorded successfully',
      processingStep: {
        id: processingStep._id,
        _id: processingStep._id,
        batchId: processingStep.batchId,
        processType: processingStep.processType,
        parameters: processingStep.parameters,
        inputQuantity: processingStep.inputQuantity,
        outputQuantity: processingStep.outputQuantity,
        equipment: processingStep.equipment,
        notes: processingStep.notes,
        status: processingStep.status,
        startTime: processingStep.startTime,
        createdAt: processingStep.createdAt,
        blockchainRecorded: blockchainRecorded,
        transactionHash: blockchainResult?.transactionHash || null
      },
      blockchain: {
        recorded: blockchainRecorded,
        transactionHash: blockchainResult?.transactionHash || null
      }
    });
  } catch (error) {
    console.error('❌ Error recording processing step:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const completeProcessing = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log('🏁 Completing processing for batch:', batchId);

    // FIXED: Any processor can complete any batch they're working on
    const collection = await Collection.findOneAndUpdate(
      { batchId, processorId: req.user._id, status: 'processing' },
      { 
        status: 'processed',
        processingCompleted: new Date()
      },
      { new: true }
    );
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or not being processed by you'
      });
    }

    console.log('✅ Processing completed for batch:', collection.batchId);
    
    res.json({
      success: true,
      message: 'Processing completed successfully',
      batch: {
        id: collection.batchId,
        _id: collection._id,
        batchId: collection.batchId,
        status: collection.status,
        processingStarted: collection.processingStarted,
        processingCompleted: collection.processingCompleted
      }
    });
  } catch (error) {
    console.error('❌ Error completing processing:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getProcessingHistory = async (req, res) => {
  try {
    const processingSteps = await ProcessingStep.find({ processorId: req.user._id })
      .populate('collectionId', 'batchId herbSpecies farmerId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      processingSteps: processingSteps.map(step => ({
        id: step._id,
        _id: step._id,
        batchId: step.batchId,
        processType: step.processType,
        parameters: step.parameters,
        inputQuantity: step.inputQuantity,
        outputQuantity: step.outputQuantity,
        equipment: step.equipment,
        notes: step.notes,
        status: step.status,
        startTime: step.startTime,
        endTime: step.endTime,
        blockchainRecorded: step.blockchainRecorded,
        transactionHash: step.transactionHash,
        collection: step.collectionId ? {
          batchId: step.collectionId.batchId,
          herbSpecies: step.collectionId.herbSpecies
        } : null,
        createdAt: step.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const lookupBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log('🔍 Looking up batch:', batchId);

    // Any processor can look up any batch
    const collection = await Collection.findOne({ batchId })
      .populate('farmerId', 'name organization location phone email')
      .populate('processorId', 'name organization location')
      .populate('labId', 'name organization location');
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Get processing steps for this batch
    const processingSteps = await ProcessingStep.find({ batchId })
      .sort({ createdAt: -1 });
    
    // Get blockchain verification status
    let blockchainVerified = false;
    try {
      blockchainVerified = await web3Service.isBatchVerified(batchId);
    } catch (blockchainError) {
      console.error('Error checking blockchain verification:', blockchainError.message);
    }
    
    res.json({
      success: true,
      batch: {
        id: collection._id,
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        quantity: collection.quantity,
        unit: collection.unit,
        location: collection.location,
        qualityGrade: collection.qualityGrade,
        collectionDate: collection.collectionDate,
        status: collection.status,
        blockchainRecorded: collection.blockchainRecorded,
        blockchainVerified: blockchainVerified,
        transactionHash: collection.transactionHash,
        ipfsHash: collection.ipfsHash,
        processingStarted: collection.processingStarted,
        processingCompleted: collection.processingCompleted,
        qualityTestDate: collection.qualityTestDate,
        qualityTestPassed: collection.qualityTestPassed,
        farmer: collection.farmerId ? {
          name: collection.farmerId.name,
          organization: collection.farmerId.organization,
          location: collection.farmerId.location,
          phone: collection.farmerId.phone,
          email: collection.farmerId.email
        } : null,
        processor: collection.processorId ? {
          name: collection.processorId.name,
          organization: collection.processorId.organization,
          location: collection.processorId.location
        } : null,
        lab: collection.labId ? {
          name: collection.labId.name,
          organization: collection.labId.organization,
          location: collection.labId.location
        } : null,
        processingSteps: processingSteps.map(step => ({
          id: step._id,
          _id: step._id,
          processType: step.processType,
          parameters: step.parameters,
          inputQuantity: step.inputQuantity,
          outputQuantity: step.outputQuantity,
          equipment: step.equipment,
          notes: step.notes,
          status: step.status,
          startTime: step.startTime,
          endTime: step.endTime,
          blockchainRecorded: step.blockchainRecorded,
          transactionHash: step.transactionHash,
          createdAt: step.createdAt
        })),
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error looking up batch:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getMyStats = async (req, res) => {
  try {
    const processorId = req.user._id;
    
    // Get total batches processed by this processor
    const totalProcessed = await Collection.countDocuments({ processorId });
    
    // Get currently processing batches
    const currentlyProcessing = await Collection.countDocuments({
      processorId,
      status: 'processing'
    });
    
    // Get completed batches
    const completed = await Collection.countDocuments({
      processorId,
      status: { $in: ['processed', 'tested', 'completed'] }
    });
    
    // Get this month's processing
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonth = await Collection.countDocuments({
      processorId,
      processingStarted: { $gte: startOfMonth }
    });
    
    // Get total processing steps
    const totalSteps = await ProcessingStep.countDocuments({ processorId });
    
    // Calculate efficiency
    const efficiency = totalProcessed > 0 ? Math.round((completed / totalProcessed) * 100) : 0;
    
    res.json({
      success: true,
      totalProcessed,
      currentlyProcessing,
      completed,
      thisMonth,
      totalSteps,
      efficiency,
      trends: {
        processing: thisMonth > 0 ? 15.2 : 0,
        efficiency: efficiency > 90 ? 5.1 : efficiency > 70 ? 2.3 : -1.2,
        quality: 94.7,
        throughput: 12.8
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const recordGrindingStep = async (req, res) => {
  try {
    const {
      batchId,
      inputBatchId,
      outputBatchId,
      grindingType,
      inputQuantity,
      outputQuantity,
      grindingParameters,
      equipment,
      qualityCheck,
      notes
    } = req.body;

    console.log('⚙️ Recording grinding step for batch:', batchId);

    // FIXED: Any processor can access any batch
    const collection = await Collection.findOne({
      batchId: inputBatchId || batchId
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // If batch isn't assigned to anyone, assign it to current processor
    if (!collection.processorId) {
      collection.processorId = req.user._id;
      collection.status = 'processing';
      if (!collection.processingStarted) {
        collection.processingStarted = new Date();
      }
      await collection.save();
    }

    // Validate required fields
    if (!grindingType || !inputQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: grindingType and inputQuantity are required'
      });
    }

    // Calculate efficiency
    const efficiency = outputQuantity ? (outputQuantity / inputQuantity) * 100 : 100;

    // Create processing step
    const processingStep = new ProcessingStep({
      processorId: req.user._id,
      processorName: req.user.name,
      collectionId: collection._id,
      batchId: batchId,
      inputBatchId: inputBatchId || batchId,
      outputBatchId: outputBatchId || batchId,
      processType: 'grinding',
      parameters: {
        grindingType,
        inputQuantity: parseFloat(inputQuantity),
        outputQuantity: outputQuantity ? parseFloat(outputQuantity) : parseFloat(inputQuantity),
        efficiency,
        grindingParameters: grindingParameters || {},
        equipment: equipment || {},
        qualityCheck: qualityCheck || {}
      },
      inputQuantity: parseFloat(inputQuantity),
      outputQuantity: outputQuantity ? parseFloat(outputQuantity) : parseFloat(inputQuantity),
      equipment: equipment || {},
      notes: notes || '',
      status: 'completed',
      startTime: new Date()
    });

    await processingStep.save();
    console.log('✅ Grinding step saved:', processingStep._id);

    // Record on blockchain
    let blockchainResult = null;
    let blockchainRecorded = false;
    
    try {
      blockchainResult = await web3Service.recordProcessingOnBlockchain({
        batchId: batchId,
        stepType: 'grinding'
      });

      blockchainRecorded = blockchainResult.transactionHash && 
                         blockchainResult.transactionHash.startsWith('0x');
      
      if (blockchainRecorded) {
        console.log('⛓️ Grinding step recorded on blockchain:', blockchainResult.transactionHash);
      }

      await ProcessingStep.findByIdAndUpdate(processingStep._id, {
        blockchainRecorded: blockchainRecorded,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber
      });
    } catch (blockchainError) {
      console.error('⚠️ Blockchain recording failed:', blockchainError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Grinding step recorded successfully',
      processingStep: {
        id: processingStep._id,
        _id: processingStep._id,
        batchId: processingStep.batchId,
        inputBatchId: processingStep.inputBatchId,
        outputBatchId: processingStep.outputBatchId,
        processType: processingStep.processType,
        parameters: processingStep.parameters,
        inputQuantity: processingStep.inputQuantity,
        outputQuantity: processingStep.outputQuantity,
        equipment: processingStep.equipment,
        notes: processingStep.notes,
        status: processingStep.status,
        startTime: processingStep.startTime,
        createdAt: processingStep.createdAt,
        blockchainRecorded: blockchainRecorded,
        transactionHash: blockchainResult?.transactionHash || null
      },
      blockchain: {
        recorded: blockchainRecorded,
        transactionHash: blockchainResult?.transactionHash || null
      }
    });
  } catch (error) {
    console.error('❌ Error recording grinding step:', error);
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
    
    const collection = await Collection.findOne({ batchId });
    
    let blockchainStatus = 'not_checked';
    try {
      const verified = await web3Service.isBatchVerified(batchId);
      blockchainStatus = verified ? 'verified' : 'not_verified';
    } catch (blockchainError) {
      blockchainStatus = 'blockchain_error: ' + blockchainError.message;
    }
    
    res.json({
      batchId,
      existsInDatabase: !!collection,
      databaseStatus: collection?.status,
      assignedTo: collection?.processorId,
      blockchainStatus,
      collectionData: collection
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAssignedBatches,
  startProcessing,
  recordProcessingStep,
  recordGrindingStep,
  completeProcessing,
  getProcessingHistory,
  getMyStats,
  lookupBatchById,
  debugBatch
};