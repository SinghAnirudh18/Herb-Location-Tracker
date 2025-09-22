# Herb Traceability System - Setup Guide

## Overview
This guide will help you set up the complete Ayurvedic herb traceability system with blockchain integration.

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
2. **MongoDB** (v6 or higher)
3. **Git**
4. **MetaMask** browser extension
5. **IPFS Desktop** (optional, for decentralized storage)

### Required Accounts/Services
1. **Infura Account** - For Ethereum blockchain access
2. **MongoDB Atlas** (optional, for cloud database)
3. **Sepolia Testnet ETH** - For blockchain transactions

## Installation Steps

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd herb-traceability-system
npm install
cd frontend && npm install && cd ..
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

#### Essential Configuration
```env
# Database
MONGODB_URI=mongodb://localhost:27017/herb-traceability

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Blockchain (Sepolia Testnet)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your-ethereum-private-key-here
```

### 3. Database Setup
```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas connection string in .env
```

### 4. Blockchain Setup (Optional but Recommended)

#### Get Sepolia Testnet ETH
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH

#### Deploy Smart Contracts (Advanced)
```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run migrate:sepolia
```

### 5. IPFS Setup (Optional)
```bash
# Install IPFS Desktop or run daemon
ipfs daemon

# Or the system will work with mock IPFS hashes
```

## Running the Application

### Development Mode
```bash
# Backend only
npm run dev

# Full stack (backend + frontend)
npm run dev:full
```

### Production Mode
```bash
npm start
```

## Features Available Without Full Blockchain Setup

The system is designed to work gracefully even without complete blockchain setup:

### ✅ Available Features
- **User Authentication** - Register farmers, processors, labs
- **Collection Management** - Record herb collections
- **Image Uploads** - Upload collection photos
- **Dashboard Analytics** - View statistics and trends
- **Quality Tracking** - Track quality grades and conditions
- **Traceability Flow** - Follow herb journey

### 🔄 Blockchain Features (Graceful Fallbacks)
- **Smart Contract Integration** - Uses mock transactions if contracts not deployed
- **IPFS Storage** - Uses mock hashes if IPFS not available
- **MetaMask Integration** - Optional, system works without wallet connection

## User Roles and Permissions

### Farmer
- Record herb collections
- Upload collection images
- View personal dashboard and statistics
- Track collection status

### Processor
- View available collections for processing
- Start and manage processing workflows
- Update processing status

### Lab
- Conduct quality tests
- Generate certificates
- Update test results

### Consumer
- Verify product authenticity
- View traceability information
- Report issues

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Farmer Operations
- `GET /api/farmers/my-collections` - Get farmer's collections
- `POST /api/farmers/collections` - Create new collection
- `POST /api/farmers/collections/:id/images` - Upload images

### Blockchain Operations
- `POST /api/blockchain/record-collection` - Record on blockchain
- `GET /api/blockchain/status` - Check blockchain status
- `GET /api/blockchain/verify/:batchId` - Verify batch

## Troubleshooting

### Common Issues

#### "Web3 service not initialized"
- Check your `ETHEREUM_RPC_URL` in `.env`
- Ensure Infura project ID is correct
- Verify network connectivity

#### "IPFS service not available"
- Install IPFS Desktop or start daemon
- System will use mock hashes as fallback

#### "Smart contracts not deployed"
- Deploy contracts using `npm run migrate:sepolia`
- Or system will use mock transactions

#### Database connection issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify database permissions

### Getting Help
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all required services are running
4. Check network connectivity for external services

## Security Notes

### Production Deployment
1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (32+ characters)
3. **Secure your private keys** (consider hardware wallets)
4. **Enable HTTPS** in production
5. **Use MongoDB authentication** in production
6. **Implement rate limiting** (already included)
7. **Regular security updates** for dependencies

### Blockchain Security
1. **Test thoroughly** on testnets before mainnet
2. **Audit smart contracts** before production deployment
3. **Use multi-signature wallets** for contract ownership
4. **Monitor gas prices** and set appropriate limits

## Next Steps

1. **Test the system** with sample data
2. **Deploy smart contracts** for full blockchain functionality
3. **Set up IPFS** for decentralized storage
4. **Configure production environment**
5. **Train users** on the system features

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review the API documentation
- Check console logs for error details
- Ensure all dependencies are properly installed
