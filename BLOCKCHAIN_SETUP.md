# Herb Traceability System - Blockchain Integration Setup

## Overview

This guide will help you set up the complete blockchain integration for the Ayurvedic herb traceability system. The system uses Ethereum smart contracts, IPFS for decentralized storage, and comprehensive verification services.

## Prerequisites

### 1. System Requirements
- Node.js 16+ 
- npm or yarn
- MongoDB
- Git

### 2. Blockchain Requirements
- Ethereum wallet with test ETH (for testnet) or mainnet ETH
- Infura account (for RPC access)
- MetaMask or similar wallet

### 3. IPFS Requirements
- IPFS node (local or remote)

## Installation Steps

### Step 1: Install Dependencies

```bash
# Install blockchain-specific dependencies
npm install web3 ethers ipfs-http-client ipfs-core truffle @openzeppelin/contracts solc axios multer sharp geolib moment

# Install development dependencies
npm install --save-dev @truffle/hdwallet-provider ganache-cli
```

### Step 2: Environment Configuration

1. Copy the environment template:
```bash
cp env.example .env
```

2. Configure your `.env` file with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/herb-traceability
DB_NAME=herb-traceability

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Blockchain Configuration
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=your-private-key-here
MNEMONIC=your-mnemonic-phrase-here

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Infura Configuration (for testnet/mainnet)
INFURA_PROJECT_ID=your-infura-project-id
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### Step 3: IPFS Setup

#### Option A: Local IPFS Node
```bash
# Install IPFS
npm install -g ipfs

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

#### Option B: Use IPFS Service
- Use services like Pinata, Infura IPFS, or other IPFS providers
- Update IPFS configuration in `.env`

### Step 4: Blockchain Network Setup

#### For Development (Local)
```bash
# Install Ganache CLI
npm install -g ganache-cli

# Start local blockchain
ganache-cli --port 8545 --accounts 10 --defaultBalanceEther 100
```

#### For Testnet (Sepolia/Goerli)
1. Get test ETH from faucets
2. Configure Infura project ID
3. Update network configuration in `truffle-config.js`

### Step 5: Smart Contract Deployment

```bash
# Compile contracts
truffle compile

# Deploy to local network
truffle migrate --network development

# Deploy to testnet
truffle migrate --network sepolia
```

### Step 6: Update Contract Addresses

After deployment, update your `.env` file with the deployed contract addresses:

```env
HERB_TRACEABILITY_CONTRACT_ADDRESS=0x...
COMPLIANCE_MANAGER_CONTRACT_ADDRESS=0x...
SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=0x...
```

### Step 7: Initialize Services

Update your `server.js` to initialize blockchain services:

```javascript
const web3Service = require('./services/web3Service');
const ipfsService = require('./services/ipfsService');
const verificationService = require('./services/verificationService');

// Initialize services
async function initializeServices() {
  try {
    await web3Service.initialize();
    await ipfsService.initialize();
    await verificationService.initialize();
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}

// Call after server starts
initializeServices();
```

## API Endpoints

### Blockchain Endpoints
- `GET /api/blockchain/` - Get blockchain info
- `GET /api/blockchain/block/:index` - Get specific block
- `GET /api/blockchain/transactions/:entityId` - Get transaction history
- `GET /api/blockchain/validity` - Check blockchain validity

### Verification Endpoints
- `POST /api/verification/batch/:batchId` - Verify a batch
- `GET /api/verification/report/:batchId` - Generate verification report
- `GET /api/verification/status/:batchId` - Get verification status
- `POST /api/verification/compliance/:batchId` - Verify compliance
- `POST /api/verification/sustainability/:batchId` - Verify sustainability
- `POST /api/verification/quality/:batchId` - Verify quality

## Smart Contract Functions

### HerbTraceability Contract
- `recordCollection()` - Record herb collection
- `recordProcessing()` - Record processing steps
- `recordQualityTest()` - Record quality test results
- `createProduct()` - Create final product
- `verifyBatch()` - Verify batch compliance

### ComplianceManager Contract
- `addComplianceRule()` - Add compliance rules
- `performComplianceCheck()` - Perform compliance checks
- `issueCertification()` - Issue certifications

### SustainabilityTracker Contract
- `recordSustainabilityMetrics()` - Record sustainability data
- `recordFairTradePayment()` - Record fair trade payments
- `recordEnvironmentalImpact()` - Record environmental impact

## Testing

### Unit Tests
```bash
# Test smart contracts
truffle test

# Test Node.js services
npm test
```

### Integration Tests
```bash
# Test full workflow
npm run test:integration
```

## Deployment

### Production Deployment

1. **Mainnet Deployment**
```bash
truffle migrate --network mainnet
```

2. **Update Environment**
- Set production RPC URL
- Use production IPFS service
- Configure production database

3. **Security Considerations**
- Use hardware wallets for contract deployment
- Implement proper access controls
- Regular security audits

## Monitoring and Maintenance

### Blockchain Monitoring
- Monitor gas prices
- Track transaction costs
- Monitor contract events

### IPFS Monitoring
- Monitor storage usage
- Ensure file availability
- Regular backups

### System Monitoring
- Monitor API performance
- Track verification success rates
- Monitor compliance metrics

## Troubleshooting

### Common Issues

1. **IPFS Connection Issues**
   - Check IPFS daemon status
   - Verify network connectivity
   - Check firewall settings

2. **Blockchain Connection Issues**
   - Verify RPC URL
   - Check network status
   - Verify wallet balance

3. **Contract Deployment Issues**
   - Check gas limits
   - Verify contract compilation
   - Check network configuration

### Support

For technical support:
- Check logs in `./logs/`
- Review error messages
- Consult documentation

## Security Best Practices

1. **Private Key Management**
   - Use environment variables
   - Never commit private keys
   - Use hardware wallets for production

2. **Access Control**
   - Implement proper role-based access
   - Regular access reviews
   - Monitor unauthorized access

3. **Data Protection**
   - Encrypt sensitive data
   - Use secure communication
   - Regular security audits

## Cost Estimation

### Development Costs
- Gas fees for testnet: ~$50-100
- IPFS storage: ~$10-50/month
- Development tools: Free

### Production Costs
- Gas fees: Variable based on usage
- IPFS storage: ~$100-500/month
- Monitoring services: ~$50-200/month

## Next Steps

1. Deploy to testnet
2. Test all functionality
3. Security audit
4. Deploy to mainnet
5. Monitor and maintain

For more detailed information, refer to the individual service documentation and smart contract comments.
