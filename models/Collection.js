const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  herbSpecies: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  qualityGrade: {
    type: String,
    enum: ['Premium', 'Standard', 'Basic'],
    required: true
  },
  harvestMethod: {
    type: String,
    enum: ['Hand-picked', 'Machine', 'Traditional'],
    default: 'Hand-picked'
  },
  organicCertified: {
    type: Boolean,
    default: false
  },
  weatherConditions: String,
  soilType: String,
  notes: String,
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerAddress: String,
  collectionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'recorded', 'processing', 'tested', 'completed', 'rejected'],
    default: 'pending'
  },
  // Processing and testing fields
  processorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processingStarted: Date,
  processingCompleted: Date,
  qualityTestDate: Date,
  qualityTestPassed: Boolean,
  // Blockchain fields
  blockchainRecorded: {
    type: Boolean,
    default: false
  },
  transactionHash: String,
  blockNumber: Number,
  ipfsHash: String
}, {
  timestamps: true
});

// Index for efficient queries
collectionSchema.index({ farmerId: 1 });
collectionSchema.index({ status: 1 });

module.exports = mongoose.model('Collection', collectionSchema);
