// services/blockchainService.js
const { createHash } = require('../utils/hashing');

class BlockchainService {
  constructor() {
    this.blockchain = require('../utils/blockchain');
  }

  async processCollectionEvent(collectionEvent) {
    try {
      console.log('Processing collection event on blockchain...');
      
      // Get the latest block hash for chaining
      const latestBlock = this.blockchain.getLatestBlock();
      const previousBlockHash = latestBlock.hash;
      console.log('Latest block hash:', previousBlockHash);
      
      // Create collection event data for blockchain
      const collectionData = {
        collectorId: collectionEvent.collectorId.toString(),
        species: collectionEvent.species,
        location: collectionEvent.location,
        timestamp: collectionEvent.timestamp,
        quantity: collectionEvent.quantity,
        qualityMetrics: collectionEvent.qualityMetrics || {},
        sustainabilityCompliance: collectionEvent.sustainabilityCompliance || {},
        previousBlockHash,
      };

      console.log('Collection data prepared:', collectionData);

      // Create hash for the data
      const dataHash = createHash(collectionData);
      console.log('Data hash created:', dataHash);
      
      // Add to blockchain
      const Transaction = this.blockchain.Transaction;
      const transaction = new Transaction(
        collectionEvent.collectorId.toString(),
        'blockchain',
        collectionData,
        'collection'
      );
      
      console.log('Transaction created:', transaction);
      
      this.blockchain.addTransaction(transaction);
      console.log('Transaction added to blockchain');
      
      this.blockchain.minePendingTransactions('system');
      console.log('Block mined successfully');
      
      // Return blockchain information
      return {
        blockchainHash: dataHash,
        previousBlockHash: previousBlockHash,
        blockIndex: this.blockchain.chain.length - 1
      };
    } catch (error) {
      console.error('Error processing blockchain:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();