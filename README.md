# 🌿 Herb Traceability System

A comprehensive blockchain-based traceability system for Ayurvedic herbs, ensuring transparency, authenticity, and compliance throughout the supply chain.

## 🚀 Features

- **Blockchain Integration**: Ethereum smart contracts on Sepolia testnet
- **Complete Traceability**: Track herbs from collection to final product
- **Quality Assurance**: Lab testing and certification management
- **Sustainability Tracking**: Environmental impact and fair trade monitoring
- **IPFS Storage**: Decentralized document and image storage
- **QR Code Generation**: Easy product verification for consumers
- **Compliance Management**: Regulatory compliance tracking

## 🏗️ Architecture

### Smart Contracts
- **HerbTraceability.sol**: Main traceability logic
- **ComplianceManager.sol**: Regulatory compliance management
- **SustainabilityTracker.sol**: Environmental and social impact tracking

### Backend Services
- **web3Service.js**: Blockchain interaction layer
- **ipfsService.js**: Decentralized storage management
- **verificationService.js**: Comprehensive verification logic

### Database
- **MongoDB**: Off-chain data storage for performance optimization

## 📋 Prerequisites

Before setting up the system, you'll need:

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or Atlas)
3. **MetaMask Wallet** with Sepolia ETH
4. **Infura Account** (for Ethereum RPC access)

## 🛠️ Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Update your `.env` file with the required values (see setup guide below).

### 3. Automated Setup

Run the automated setup script:

```bash
npm run setup
```

This script will:
- Check your environment configuration
- Verify wallet balance
- Compile smart contracts
- Deploy to Sepolia testnet
- Update environment variables with contract addresses

### 4. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:5000`

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run migrate:sepolia

# Start the server
npm start
```

## 📚 Required APIs and Services

### 1. 🦊 MetaMask Wallet Setup

1. Install [MetaMask browser extension](https://metamask.io/)
2. Create a new wallet or import existing one
3. Switch to **Sepolia testnet**
4. Get your private key: Account Details → Export Private Key
5. Get your seed phrase: Settings → Security & Privacy → Reveal Seed Phrase

### 2. 🌐 Infura Setup (Ethereum RPC Provider)

1. Go to [Infura.io](https://infura.io/)
2. Create a free account
3. Create a new project
4. Copy the **Project ID**
5. Your RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### 3. 💰 Get Sepolia ETH (Free Testnet ETH)

Get free Sepolia ETH from these faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [PK910 Faucet](https://sepolia-faucet.pk910.de/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

You'll need at least 0.1 ETH for contract deployment.

### 4. 📁 IPFS Setup (Optional)

**Option A: Local IPFS**
```bash
# Install IPFS Desktop
# Download from: https://ipfs.io/

# Or install via command line
npm install -g ipfs
ipfs init
ipfs daemon
```

**Option B: Remote IPFS Service**
- [Pinata](https://pinata.cloud/) - Easy to use, generous free tier
- [Infura IPFS](https://infura.io/product/ipfs) - Reliable infrastructure

### 5. 🗄️ MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string

## 🔐 Environment Variables

Update your `.env` file with these values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/herb_traceability
JWT_SECRET=your-super-secret-jwt-key-here

# Blockchain Configuration - SEPOLIA TESTNET
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key_here
MNEMONIC=your metamask seed phrase here

# Contract Addresses (will be set after deployment)
HERB_TRACEABILITY_CONTRACT_ADDRESS=
COMPLIANCE_MANAGER_CONTRACT_ADDRESS=
SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# API Keys
INFURA_PROJECT_ID=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🔗 API Endpoints

### Health Check
```
GET /api/health
```

### Blockchain Endpoints
```
GET /api/blockchain/                     # Get blockchain info
GET /api/blockchain/block/:index         # Get specific block
GET /api/blockchain/transactions/:id     # Get transaction history
```

### Verification Endpoints
```
POST /api/verification/batch/:batchId    # Verify a batch
GET /api/verification/report/:batchId    # Generate verification report
GET /api/verification/status/:batchId    # Get verification status
```

### Supply Chain Endpoints
```
POST /api/blockchain/collection          # Record herb collection
POST /api/blockchain/processing          # Record processing step
POST /api/blockchain/quality             # Record quality test
POST /api/blockchain/product             # Create final product
```

## 🧪 Testing

```bash
# Test smart contracts
npm run test

# Test API endpoints
npm run test:api
```

## 📊 Monitoring

Check system health:
```bash
curl http://localhost:5000/api/health
```

This will show:
- Server status
- Blockchain connection
- IPFS connection
- Contract deployment status

## 🔍 Troubleshooting

### Common Issues

1. **"Contract addresses not found"**
   - Run: `npm run setup` or `npm run migrate:sepolia`

2. **"Contract ABIs not found"**
   - Run: `npm run compile`

3. **"Insufficient funds for gas"**
   - Get more Sepolia ETH from faucets

4. **"IPFS connection failed"**
   - Start IPFS daemon: `ipfs daemon`
   - Or configure remote IPFS service

5. **"MongoDB connection failed"**
   - Start MongoDB service
   - Check connection string in `.env`

### Getting Help

1. Check the logs in console output
2. Verify all environment variables are set
3. Ensure you have sufficient Sepolia ETH
4. Check network connectivity

## 🏭 Production Deployment

For production deployment:

1. **Use Mainnet**: Update RPC URL to Ethereum mainnet
2. **Secure Keys**: Use hardware wallets and secure key management
3. **Scale IPFS**: Use enterprise IPFS solutions
4. **Monitor**: Set up comprehensive monitoring and alerting
5. **Audit**: Conduct security audits before mainnet deployment

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

**🌿 Building a transparent and sustainable future for Ayurvedic herbs! 🌿**
