const mongoose = require('mongoose');

const processingStepSchema = new mongoose.Schema({
  processorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  processorName: {
    type: String,
    required: true
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  batchId: {
    type: String,
    required: true
  },
  processType: {
    type: String,
    enum: ['drying', 'cleaning', 'grinding', 'packaging', 'sorting', 'washing'],
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'paused', 'failed'],
    default: 'in_progress'
  },
  parameters: {
    temperature: Number,
    duration: Number,
    method: String,
    humidity: Number,
    pressure: Number
  },
  inputQuantity: {
    type: Number,
    required: true,
  },
  outputQuantity: {
    type: Number,
    default: null
  },
  qualityCheck: {
    passed: Boolean,
    notes: String,
    checkedBy: String,
    checkedAt: Date
  },
  equipment: {
    name: String,
    id: String,
    calibrationDate: Date
  },
  notes: {
    type: String,
    default: ''
  },
  blockchainHash: {
    type: String,
    default: null
  },
  ipfsHash: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
processingStepSchema.index({ processorId: 1 });
processingStepSchema.index({ collectionId: 1 });
processingStepSchema.index({ batchId: 1 });
processingStepSchema.index({ status: 1 });

module.exports = mongoose.model('ProcessingStep', processingStepSchema);