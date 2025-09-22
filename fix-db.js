// Fix database by dropping problematic collections
const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('Connected to MongoDB');

    // Drop the users collection to remove any problematic indexes
    try {
      await mongoose.connection.db.collection('users').drop();
      console.log('✅ Dropped users collection');
    } catch (error) {
      console.log('ℹ️  Users collection does not exist or already dropped');
    }

    // Drop test users collection
    try {
      await mongoose.connection.db.collection('testusers').drop();
      console.log('✅ Dropped testusers collection');
    } catch (error) {
      console.log('ℹ️  TestUsers collection does not exist');
    }

    console.log('✅ Database cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDatabase();
