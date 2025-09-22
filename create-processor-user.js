#!/usr/bin/env node

/**
 * Create a test processor user for testing
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createProcessorUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('✅ Connected to MongoDB');

    // Check if processor already exists
    const existingProcessor = await User.findOne({ email: 'processor@example.com' });
    
    if (existingProcessor) {
      console.log('✅ Processor user already exists');
      console.log(`   Email: ${existingProcessor.email}`);
      console.log(`   Role: ${existingProcessor.role}`);
      console.log(`   ID: ${existingProcessor._id}`);
      return;
    }

    // Create processor user
    const processor = new User({
      name: 'John Processor',
      email: 'processor@example.com',
      password: 'password123',
      role: 'processor',
      organization: 'Herb Processing Co.',
      location: 'Mumbai, India',
      phone: '+91-9876543210',
      isActive: true
    });

    await processor.save();
    console.log('✅ Processor user created successfully');
    console.log(`   Email: ${processor.email}`);
    console.log(`   Role: ${processor.role}`);
    console.log(`   ID: ${processor._id}`);

  } catch (error) {
    console.error('❌ Error creating processor user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createProcessorUser();
