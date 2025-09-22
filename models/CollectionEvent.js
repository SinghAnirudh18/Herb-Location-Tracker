// models/CollectionEvent.js
const mongoose = require('mongoose');
const { createHash } = require('../utils/hashing');
const { blockchain, Transaction } = require('../utils/blockchain');

const collectionEventSchema = new mongoose.Schema({
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  species: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  quantity: {
    type: Number,
    required: true,
  },
  qualityMetrics: {
    moistureContent: Number,
    foreignMatter: Number,
    otherImpurities: Number,
  },
  sustainabilityCompliance: {
    isWithinApprovedZone: Boolean,
    isWithinSeason: Boolean,
    isWithinQuota: Boolean,
  },
  blockchainHash: {
    type: String,
    required: false, // Make optional
  },
  blockIndex: {
    type: Number,
    required: false, // Make optional
  },
  previousBlockHash: {
    type: String,
    required: false, // Make optional
  },
});

collectionEventSchema.index({ location: '2dsphere' });

// Method to process blockchain after saving
collectionEventSchema.methods.processBlockchain = async function() {
  try {
    console.log('Processing blockchain for collection event...');
    
    // Get the latest block hash for chaining
    const latestBlock = blockchain.getLatestBlock();
    const previousBlockHash = latestBlock.hash;
    console.log('Latest block hash:', previousBlockHash);
    
    // Create collection event data for blockchain
    const collectionData = {
      collectorId: this.collectorId.toString(),
      species: this.species,
      location: this.location,
      timestamp: this.timestamp,
      quantity: this.quantity,
      qualityMetrics: this.qualityMetrics || {},
      sustainabilityCompliance: this.sustainabilityCompliance || {},
      previousBlockHash,
    };

    console.log('Collection data prepared:', collectionData);

    // Create hash for the data
    const dataHash = createHash(collectionData);
    console.log('Data hash created:', dataHash);
    
    // Add to blockchain
    const transaction = new Transaction(
      this.collectorId.toString(),
      'blockchain',
      collectionData,
      'collection'
    );
    
    console.log('Transaction created:', transaction);
    
    blockchain.addTransaction(transaction);
    console.log('Transaction added to blockchain');
    
    blockchain.minePendingTransactions('system');
    console.log('Block mined successfully');
    
    // Update the document with blockchain info
    this.blockchainHash = dataHash;
    this.previousBlockHash = previousBlockHash;
    this.blockIndex = blockchain.chain.length - 1;
    
    // Save the updated document
    return await this.save();
  } catch (error) {
    console.error('Error processing blockchain:', error);
    throw error;
  }
};

module.exports = mongoose.model('CollectionEvent', collectionEventSchema);