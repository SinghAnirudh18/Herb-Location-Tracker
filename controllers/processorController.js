const ProcessingStep = require('../models/ProcessingStep');
const Collection = require('../models/Collection');
const CollectionEvent = require('../models/CollectionEvent');
const blockchain = require('../utils/blockchain');
const { createHash } = require('../utils/hashing');

const getAssignedBatches = async (req, res) => {
  try {
    // Get collections that are ready for processing (status: pending) or already assigned to this processor
    const collections = await Collection.find({
      $or: [
        { status: 'pending' }, // Available for assignment
        { processorId: req.user._id, status: 'processing' } // Already assigned to this processor
      ]
    })
    .populate('farmerId', 'name organization location')
    .sort({ collectionDate: -1 });
    
    res.json({
      success: true,
      batches: collections.map(collection => ({
        id: collection.batchId,
        batchId: collection.batchId,
        herbSpecies: collection.herbSpecies,
        quantity: collection.quantity,
        location: collection.location,
        qualityGrade: collection.qualityGrade,
        collectionDate: collection.collectionDate,
        status: collection.status,
        farmer: {
          name: collection.farmerId.name,
          organization: collection.farmerId.organization,
          location: collection.farmerId.location
        },
        processingStarted: collection.processingStarted,
        assignedToMe: collection.processorId && collection.processorId.toString() === req.user._id.toString()
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
    
    // Find the collection and assign it to this processor
    const collection = await Collection.findOneAndUpdate(
      { batchId, status: 'pending' },
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
    
    res.json({
      success: true,
      message: 'Processing started successfully',
      batch: {
        batchId: collection.batchId,
        status: collection.status,
        processingStarted: collection.processingStarted
      }
    });
  } catch (error) {
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

    // Verify the collection exists and is assigned to this processor
    const collection = await Collection.findOne({ 
      batchId, 
      processorId: req.user._id,
      status: 'processing'
    });
    
    if (!collection) {
      return res.status(404).json({ 
        success: false,
        message: 'Batch not found or not assigned to you' 
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
      inputQuantity,
      outputQuantity,
      equipment: equipment || {},
      notes: notes || '',
      status: 'completed'
    });

    await processingStep.save();

    res.status(201).json({
      success: true,
      message: 'Processing step recorded successfully',
      processingStep: {
        id: processingStep._id,
        batchId: processingStep.batchId,
        processType: processingStep.processType,
        parameters: processingStep.parameters,
        inputQuantity: processingStep.inputQuantity,
        outputQuantity: processingStep.outputQuantity,
        equipment: processingStep.equipment,
        notes: processingStep.notes,
        status: processingStep.status,
        startTime: processingStep.startTime,
        createdAt: processingStep.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const completeProcessing = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Update collection status to completed processing
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
        message: 'Batch not found or not assigned to you'
      });
    }
    
    res.json({
      success: true,
      message: 'Processing completed successfully',
      batch: {
        batchId: collection.batchId,
        status: collection.status,
        processingCompleted: collection.processingCompleted
      }
    });
  } catch (error) {
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
    
    // Find collection by batch ID with full details
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
    
    // Get collection events
    const events = await CollectionEvent.find({ collectionId: collection._id })
      .sort({ timestamp: -1 });
    
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
          processType: step.processType,
          parameters: step.parameters,
          inputQuantity: step.inputQuantity,
          outputQuantity: step.outputQuantity,
          equipment: step.equipment,
          notes: step.notes,
          status: step.status,
          startTime: step.startTime,
          endTime: step.endTime,
          createdAt: step.createdAt
        })),
        events: events.map(event => ({
          id: event._id,
          type: event.type,
          description: event.description,
          timestamp: event.timestamp,
          userId: event.userId
        })),
        createdAt: collection.createdAt,
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
    const processorId = req.user._id;
    
    // Get total batches processed
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
    
    // Calculate efficiency (completed vs started)
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

module.exports = { 
  getAssignedBatches,
  startProcessing,
  recordProcessingStep,
  completeProcessing,
  getProcessingHistory,
  getMyStats,
  lookupBatchById
};