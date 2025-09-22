# 🚀 Real Blockchain Setup Guide

## Current Status
Your system is currently running with **mock blockchain functionality**. This guide will help you set up **real blockchain connectivity** using the Sepolia testnet.

## Prerequisites

### 1. 💰 Get Testnet ETH
- Go to [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Get free Sepolia ETH (needed for gas fees)

### 2. 🔗 Get Infura/Alchemy RPC URL
- Sign up at [Infura.io](https://infura.io) (free)
- Create a new project
- Copy the Sepolia endpoint URL

### 3. 📱 MetaMask Wallet
- Install [MetaMask](https://metamask.io/) browser extension
- Create wallet or import existing
- Switch to Sepolia Testnet
- Get your private key or mnemonic phrase

## Setup Steps

### Step 1: Configure Environment Variables

Create/update your `.env` file with these values:

```bash
# Blockchain Configuration
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your-private-key-from-metamask
MNEMONIC=your-mnemonic-phrase-from-metamask
INFURA_PROJECT_ID=your-infura-project-id
ETHERSCAN_API_KEY=your-etherscan-api-key

# Contract Addresses (will be set after deployment)
HERB_TRACEABILITY_CONTRACT_ADDRESS=
COMPLIANCE_MANAGER_CONTRACT_ADDRESS=
SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=
```

### Step 2: Install Dependencies

```bash
npm install @truffle/hdwallet-provider web3
```

### Step 3: Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run migrate:sepolia
```

### Step 4: Update Contract Addresses

After deployment, copy the contract addresses from the output and add them to your `.env` file.

### Step 5: Start the System

```bash
npm start
```

## Quick Setup Scripts

### Automated Setup
```bash
# Run the setup guide
node setup-blockchain-real.js

# Deploy contracts
node deploy-contracts-real.js
```

## Verification

### Check if Real Blockchain is Working

1. **Server Logs**: Look for:
   ```
   ✅ Smart contracts deployed successfully
   ✅ Contract addresses configured
   ```

2. **API Test**: 
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should show `blockchain: { connected: true }`

3. **Frontend Test**: 
   - Go to traceability flow
   - Try recording a processing step
   - Should get real transaction hash (not mock)

## Troubleshooting

### Common Issues

1. **"Contract addresses not found"**
   - Run: `npm run migrate:sepolia`
   - Update `.env` with contract addresses

2. **"Insufficient funds"**
   - Get more Sepolia ETH from faucet

3. **"Network error"**
   - Check your Infura RPC URL
   - Ensure MetaMask is on Sepolia testnet

4. **"Private key invalid"**
   - Get private key from MetaMask: Settings > Security & Privacy

### Debug Commands

```bash
# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.ETHEREUM_RPC_URL)"

# Test blockchain connection
node -e "
const Web3 = require('web3');
require('dotenv').config();
const web3 = new Web3(process.env.ETHEREUM_RPC_URL);
web3.eth.getBlockNumber().then(console.log);
"
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never share private keys** - they give full access to your wallet
2. **Use testnet only** - Sepolia ETH has no real value
3. **Keep .env file secure** - add it to .gitignore
4. **Test thoroughly** before mainnet deployment

## Cost Estimation

- **Contract Deployment**: ~0.01-0.05 ETH (free on testnet)
- **Transaction Fees**: ~0.001-0.01 ETH per transaction (free on testnet)
- **Total Setup Cost**: $0 (using free testnet)

## Next Steps

1. ✅ Set up real blockchain connectivity
2. ✅ Deploy smart contracts
3. ✅ Test processing step recording
4. ✅ Verify transactions on Etherscan
5. 🔄 Deploy to mainnet (when ready)

## Support

If you encounter issues:
1. Check the server logs
2. Verify environment variables
3. Ensure you have enough testnet ETH
4. Test blockchain connection independently

---

**Ready to go live with real blockchain! 🎉**
