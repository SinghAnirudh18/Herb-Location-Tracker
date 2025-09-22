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
  weatherConditions: {
    type: String,
    default: ''
  },
  soilType: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerAddress: {
    type: String,
    required: true
  },
  collectionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'recorded', 'processing', 'tested', 'completed', 'rejected'],
    default: 'pending'
  },
  processingStarted: {
    type: Date,
    default: null
  },
  processingCompleted: {
    type: Date,
    default: null
  },
  qualityTestDate: {
    type: Date,
    default: null
  },
  qualityTestPassed: {
    type: Boolean,
    default: null
  },
  processorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Blockchain integration fields
  blockchainRecorded: {
    type: Boolean,
    default: false
  },
  transactionHash: {
    type: String,
    default: null
  },
  blockNumber: {
    type: Number,
    default: null
  },
  ipfsHash: {
    type: String,
    default: null
  },
  blockchainHash: {
    type: String,
    default: null
  },
  // Image storage with IPFS support
  images: [{
    filename: String,
    ipfsHash: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  imageUrls: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
collectionSchema.index({ farmerId: 1 });
collectionSchema.index({ processorId: 1 });
collectionSchema.index({ labId: 1 });
collectionSchema.index({ batchId: 1 });
collectionSchema.index({ status: 1 });

module.exports = mongoose.model('Collection', collectionSchema);
