// utils/blockchain.js
const crypto = require('crypto');

class Transaction {
  constructor(sender, receiver, data, type) {
    this.sender = sender;
    this.receiver = receiver;
    this.data = data;
    this.type = type;
    this.timestamp = Date.now();
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.sender +
        this.receiver +
        JSON.stringify(this.data) +
        this.type +
        this.timestamp
      )
      .digest('hex');
  }

  isValid() {
    if (this.sender === 'system') return true;
    return this.hash === this.calculateHash();
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    console.log(`Mining block with difficulty: ${difficulty}...`);
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 3;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(Date.now(), [
      new Transaction(
        'system',
        'genesis',
        { message: 'Genesis Block' },
        'genesis'
      )
    ], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.sender || !transaction.receiver) {
      throw new Error('Transaction must include sender and receiver');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      'system',
      miningRewardAddress,
      { amount: this.miningReward },
      'reward'
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    block.mineBlock(this.difficulty);
    
    console.log('Block successfully mined!');
    this.chain.push(block);
    
    this.pendingTransactions = [];
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.sender === address) {
          balance -= trans.data.amount || 0;
        }
        
        if (trans.receiver === address) {
          balance += trans.data.amount || 0;
        }
      }
    }
    
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
      
      for (const transaction of currentBlock.transactions) {
        if (!transaction.isValid()) {
          return false;
        }
      }
    }
    
    return true;
  }

  getAllTransactionsForEntity(entityId) {
    const transactions = [];
    
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (
          transaction.sender === entityId ||
          transaction.receiver === entityId ||
          transaction.data.collectorId === entityId ||
          transaction.data.processorId === entityId ||
          transaction.data.labId === entityId
        ) {
          transactions.push(transaction);
        }
      }
    }
    
    return transactions;
  }

  getTransactionHistory(entityId, type = null) {
    const transactions = this.getAllTransactionsForEntity(entityId);
    
    if (type) {
      return transactions.filter(trans => trans.type === type);
    }
    
    return transactions;
  }
}

// Create a singleton instance
const blockchain = new Blockchain();

// Export both the blockchain instance and the Transaction class
module.exports = {
  blockchain,
  Transaction
};