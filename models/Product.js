const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  collectionEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollectionEvent',
    required: true,
  },
  processingSteps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingStep',
  }],
  qualityTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityTest',
  }],
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  formulation: {
    ingredients: [{
      name: String,
      percentage: Number,
    }],
    dosageForm: String,
    batchSize: Number,
  },
  qrCode: {
    type: String,
    required: true,
  },
  blockchainHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);