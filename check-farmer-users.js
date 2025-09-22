#!/usr/bin/env node

/**
 * Check farmer users in database
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkFarmerUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('✅ Connected to MongoDB');

    // Find all farmer users
    const farmers = await User.find({ role: 'farmer' });
    
    if (farmers.length > 0) {
      console.log(`✅ Found ${farmers.length} farmer users:`);
      farmers.forEach(farmer => {
        console.log(`   - Email: ${farmer.email}`);
        console.log(`   - Name: ${farmer.name}`);
        console.log(`   - Organization: ${farmer.organization}`);
        console.log(`   - Location: ${farmer.location}`);
        console.log('');
      });
    } else {
      console.log('❌ No farmer users found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkFarmerUsers();

