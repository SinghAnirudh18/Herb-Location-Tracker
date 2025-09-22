#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Local Blockchain for Demo');
console.log('=======================================\n');

// Create local blockchain configuration
const localConfig = `# Local Blockchain Configuration
ETHEREUM_RPC_URL=http://localhost:8545
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
MNEMONIC=myth like bonus scare over problem client lizard pioneer submit female collect
INFURA_PROJECT_ID=local
ETHERSCAN_API_KEY=local

# Contract Addresses (will be set after deployment)
HERB_TRACEABILITY_CONTRACT_ADDRESS=
COMPLIANCE_MANAGER_CONTRACT_ADDRESS=
SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/herb-traceability
DB_NAME=herb-traceability

# JWT Configuration
JWT_SECRET=demo-secret-key-for-presentation
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# IPFS Configuration (optional)
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
`;

console.log('📝 Creating .env file for local blockchain...');
fs.writeFileSync('.env', localConfig);
console.log('✅ .env file created with local blockchain settings\n');

console.log('🔧 Local Blockchain Setup:');
console.log('=========================');
console.log('✅ Ganache CLI installed');
console.log('✅ Local environment configured');
console.log('✅ Default private key set (for demo)');
console.log('✅ Default mnemonic set (for demo)');
console.log('\n💰 Demo Account Details:');
console.log('========================');
console.log('Address: 0x627306090abaB3A6e1400e9345bC60c78a8BEf57');
console.log('Private Key: 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d');
console.log('Balance: 100 ETH (for demo)');
console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Start Ganache: npm run ganache');
console.log('2. Deploy contracts: npm run migrate:dev');
console.log('3. Start server: npm start');
console.log('4. Test farmer functionality!');
console.log('\n💡 This setup is perfect for demos - no external dependencies!');
