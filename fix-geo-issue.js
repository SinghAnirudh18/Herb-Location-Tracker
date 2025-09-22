// Fix geospatial index issue completely
const mongoose = require('mongoose');
require('dotenv').config();

async function fixGeoIssue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));

    // Drop all collections to start fresh
    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop();
        console.log(`✅ Dropped collection: ${collection.name}`);
      } catch (error) {
        console.log(`ℹ️  Could not drop ${collection.name}:`, error.message);
      }
    }

    // Also drop any indexes that might exist
    try {
      await db.collection('users').dropIndexes();
      console.log('✅ Dropped all indexes from users collection');
    } catch (error) {
      console.log('ℹ️  No indexes to drop or collection does not exist');
    }

    console.log('✅ Complete database cleanup completed');
    console.log('🔄 Please restart the server now');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixGeoIssue();
