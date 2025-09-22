const mongoose = require('mongoose');

const qualityTestSchema = new mongoose.Schema({
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labName: {
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
  testDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  tests: {
    moistureContent: {
      value: Number,
      unit: { type: String, default: '%' },
      passed: Boolean,
      standard: { type: Number, default: 12 }
    },
    pesticideResidue: {
      value: Number,
      unit: { type: String, default: 'ppm' },
      passed: Boolean,
      limit: { type: Number, default: 0.1 }
    },
    heavyMetals: {
      lead: { value: Number, passed: Boolean },
      mercury: { value: Number, passed: Boolean },
      cadmium: { value: Number, passed: Boolean },
      arsenic: { value: Number, passed: Boolean },
      unit: { type: String, default: 'ppm' }
    },
    microbialContamination: {
      totalBacterialCount: { value: Number, passed: Boolean },
      yeastMold: { value: Number, passed: Boolean },
      ecoli: { value: Number, passed: Boolean },
      salmonella: { detected: Boolean, passed: Boolean },
      unit: { type: String, default: 'CFU/g' }
    },
    DNABarcode: {
      speciesIdentified: String,
      matchConfidence: Number,
      passed: Boolean,
      expectedSpecies: String
    },
    activeCompounds: {
      primaryCompound: { name: String, value: Number, unit: String },
      secondaryCompounds: [{ name: String, value: Number, unit: String }],
      potency: { value: Number, grade: String }
    }
  },
  overallResult: {
    type: String,
    enum: ['passed', 'failed', 'conditional'],
    required: true,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  recommendations: {
    type: String,
    default: ''
  },
  certificateNumber: {
    type: String,
    unique: true
  },
  certificateUrl: String,
  testingEquipment: [{
    name: String,
    model: String,
    calibrationDate: Date
  }],
  testedBy: {
    name: String,
    qualification: String,
    signature: String
  },
  reviewedBy: {
    name: String,
    qualification: String,
    signature: String,
    reviewDate: Date
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
qualityTestSchema.index({ labId: 1 });
qualityTestSchema.index({ collectionId: 1 });
qualityTestSchema.index({ batchId: 1 });
qualityTestSchema.index({ status: 1 });
qualityTestSchema.index({ certificateNumber: 1 });

module.exports = mongoose.model('QualityTest', qualityTestSchema);