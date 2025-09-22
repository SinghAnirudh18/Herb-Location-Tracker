# 🚀 Quick Start Guide

Get your Herb Traceability System running in 5 minutes!

## ⚡ Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] MetaMask wallet with Sepolia ETH
- [ ] Infura account and project ID

## 🎯 Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Update your `.env` file with these required values:

```env
# Get from Infura.io
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
INFURA_PROJECT_ID=your_infura_project_id

# Get from MetaMask
PRIVATE_KEY=your_metamask_private_key
MNEMONIC=your metamask seed phrase

# Database (use default for local MongoDB)
MONGODB_URI=mongodb://localhost:27017/herb_traceability
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Get Sepolia ETH (Free)
Visit any of these faucets and paste your MetaMask address:
- https://sepoliafaucet.com/
- https://sepolia-faucet.pk910.de/
- https://www.alchemy.com/faucets/ethereum-sepolia

### 4. Run Automated Setup
```bash
npm run setup
```

This will:
- ✅ Check your configuration
- ✅ Verify wallet balance
- ✅ Compile smart contracts
- ✅ Deploy to Sepolia testnet
- ✅ Update contract addresses

### 5. Start the Server
```bash
npm start
```

### 6. Verify Everything Works
```bash
npm run verify
```

## 🎉 You're Ready!

- **API Health**: http://localhost:5000/api/health
- **Blockchain**: Connected to Sepolia testnet
- **Contracts**: Deployed and ready

## 🆘 Need Help?

**Common Issues:**

1. **"Insufficient funds"** → Get more Sepolia ETH from faucets
2. **"Contract not found"** → Run `npm run setup` again
3. **"Connection failed"** → Check your Infura project ID

**Get Support:**
- Check the full README.md for detailed instructions
- Review the troubleshooting section
- Verify your .env configuration

---
**🌿 Happy tracing! 🌿**
