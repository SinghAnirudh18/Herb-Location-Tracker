// get-fresh-token.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Get a fresh valid token
const getFreshToken = async () => {
  try {
    const User = require('./models/User');
    
    // Find or create test user
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('Creating test user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      user = await User.create({
        name: 'Test Farmer',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'farmer',
        organization: 'Test Farms',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        }
      });
      console.log('✅ Test user created');
    }
    
    // Generate fresh token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    console.log('✅ FRESH JWT TOKEN GENERATED:');
    console.log('=========================================');
    console.log(token);
    console.log('=========================================');
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Run the script
const runScript = async () => {
  console.log('Generating fresh JWT token...\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ MongoDB connection failed');
    process.exit(1);
  }
  
  // Get token
  const token = await getFreshToken();
  if (token) {
    console.log('\n📝 HOW TO USE IN POSTMAN:');
    console.log('1. Open your POST request to /api/farmers/collection-events');
    console.log('2. Go to Headers tab');
    console.log('3. Add these TWO headers:');
    console.log('   - Key: Content-Type, Value: application/json');
    console.log('   - Key: Authorization, Value: Bearer ' + token);
    console.log('4. Send your request!');
  }
  
  process.exit(0);
};

runScript();