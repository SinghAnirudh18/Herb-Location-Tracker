// Simple test script to create a user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple user schema without geospatial index
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  organization: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('TestUser', userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('Connected to MongoDB');

    // Drop existing collection to avoid conflicts
    await User.collection.drop().catch(() => {});
    
    const user = new User({
      name: 'Test Farmer',
      email: 'farmer@test.com',
      password: 'password123',
      role: 'farmer',
      organization: 'Test Farm',
      location: 'Test Location'
    });

    await user.save();
    console.log('✅ Test user created successfully:', user.email);
    
    // Test login
    const loginUser = await User.findOne({ email: 'farmer@test.com' });
    const isMatch = await loginUser.matchPassword('password123');
    console.log('✅ Password match test:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
