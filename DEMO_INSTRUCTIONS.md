# 🎯 Herb Traceability System - Demo Instructions

## 🚀 Quick Start for Demo

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated demo script
start-demo.bat
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup local blockchain
node setup-local-blockchain.js

# 3. Start Ganache (in separate terminal)
npm run ganache

# 4. Deploy contracts
npm run migrate:dev

# 5. Start backend (in separate terminal)
npm start

# 6. Start frontend (in separate terminal)
cd frontend && npm start
```

## 🔗 System URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Ganache**: http://localhost:8545

## 👤 Demo Credentials

### Farmer Account
- **Email**: farmer@demo.com
- **Password**: demo123
- **Role**: farmer
- **Organization**: Demo Farm

## 🎯 Demo Features to Show

### 1. System Overview
- ✅ Local blockchain running (Ganache)
- ✅ Smart contracts deployed
- ✅ Real-time blockchain recording
- ✅ Database integration
- ✅ Decimal quantity support (fixed!)

### 2. Farmer Workflow
- ✅ Farmer login/registration
- ✅ Herb collection recording (including decimal quantities like 5.8 kg)
- ✅ Blockchain transaction recording
- ✅ Batch ID generation
- ✅ Quality metrics tracking

### 3. Traceability Workflow
- ✅ Processing step recording on blockchain
- ✅ Quality testing workflow
- ✅ Complete supply chain tracking
- ✅ Batch assignment and workflow
- ✅ Multi-role user system

### 4. Blockchain Features
- ✅ Real transactions on local blockchain
- ✅ Transaction hashes
- ✅ Block numbers
- ✅ Immutable records
- ✅ Proper decimal number handling
- ✅ Processing step recording

## 🧪 Testing Commands

```bash
# Test system health
node quick-demo.js

# Test farmer functionality
node test-farmer-login.js

# Test complete traceability flow
node traceability-demo.js

# Full system test
node demo-ready.js
```

## 📊 Demo Data

The system includes:
- **Herb Species**: Ashwagandha
- **Quantity**: 50 kg
- **Quality Grade**: Premium
- **Location**: Demo Farm
- **Organic Certified**: Yes
- **Harvest Method**: Traditional

## 🔧 Troubleshooting

### If Ganache fails to start:
```bash
# Install Ganache globally
npm install -g ganache-cli

# Start manually
ganache --port 8545 --accounts 10 --defaultBalanceEther 100
```

### If contracts fail to deploy:
```bash
# Reset and redeploy
truffle migrate --reset --network development
```

### If server fails to start:
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod --dbpath C:\data\db
```

## 🎉 Demo Success Indicators

- ✅ Server responds at http://localhost:5000/api/health
- ✅ Blockchain shows connected: true
- ✅ Farmer can login successfully
- ✅ Collection creation works
- ✅ Blockchain recording shows transaction hash
- ✅ Frontend loads at http://localhost:3000

## 💡 Demo Tips

1. **Start with health check**: Show the API health endpoint
2. **Show blockchain connection**: Point out the block number and chain ID
3. **Demo farmer login**: Use the provided credentials
4. **Show existing batches**: Display available batches for traceability
5. **Add processing step**: Show blockchain recording of processing
6. **Demonstrate traceability**: Show complete supply chain flow
7. **Show frontend**: Navigate through the farmer dashboard
8. **Highlight blockchain**: Point out transaction hashes and immutability

## 🚀 Perfect for Tomorrow's Presentation!

The system is fully functional with:
- Local blockchain (no external dependencies)
- Real smart contracts deployed
- Working farmer functionality
- Blockchain recording
- Complete traceability workflow
- Processing step recording
- Supply chain tracking
- Multi-role user system
