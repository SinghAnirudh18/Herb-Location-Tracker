// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const web3Service = require('./services/web3Service');
const ipfsService = require('./services/ipfsService');
const verificationService = require('./services/verificationService');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/processors', require('./routes/processors'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/consumers', require('./routes/consumers'));

// Blockchain routes
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/blockchain/collection', require('./routes/blockchain-collection'));
app.use('/api/blockchain/processing', require('./routes/blockchain-processing'));
app.use('/api/blockchain/quality', require('./routes/blockchain-quality'));
app.use('/api/blockchain/product', require('./routes/blockchain-product'));
app.use('/api/verification', require('./routes/verification'));

// Basic route for health check
app.get('/api/health', async (req, res) => {
  try {
    const blockchainStatus = await web3Service.getBlockchainStatus();
    const ipfsStatus = await ipfsService.getNodeInfo();
    
    res.json({ 
      message: 'Herb Traceability System API is running!',
      version: '1.0.0',
      blockchain: blockchainStatus,
      ipfs: {
        connected: !!ipfsStatus,
        nodeId: ipfsStatus?.id || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      message: 'Herb Traceability System API is running!',
      version: '1.0.0',
      blockchain: { connected: false, error: error.message },
      ipfs: { connected: false, error: error.message },
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize blockchain services
async function initializeServices() {
  try {
    console.log('Initializing blockchain services...');
    
    if (process.env.NODE_ENV !== 'test') {
      await web3Service.initialize();
      console.log('✅ Web3 service initialized');
      
      await ipfsService.initialize();
      console.log('✅ IPFS service initialized');
      
      await verificationService.initialize();
      console.log('✅ Verification service initialized');
    }
    
    console.log('🚀 All blockchain services initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing blockchain services:', error.message);
    console.log('⚠️  Server will continue without blockchain services');
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize blockchain services
  await initializeServices();
  
  console.log(`🎯 Herb Traceability System ready!`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api/health`);
});