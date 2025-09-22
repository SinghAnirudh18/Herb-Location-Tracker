// Clear MongoDB schema cache and problematic documents
const mongoose = require('mongoose');
require('dotenv').config();

async function clearSchemaCache() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/herb-traceability');
    console.log('Connected to MongoDB');

    // Clear mongoose model cache
    delete mongoose.models.Collection;
    delete mongoose.modelSchemas.Collection;
    
    // Get the collections collection
    const db = mongoose.connection.db;
    const collectionsCollection = db.collection('collections');
    
    // Remove any documents with the old qualityConditions structure
    const result = await collectionsCollection.updateMany(
      { qualityConditions: { $exists: true } },
      { $unset: { qualityConditions: "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} documents to remove qualityConditions field`);
    
    // Also remove any documents that might be causing issues
    const deleteResult = await collectionsCollection.deleteMany({
      $or: [
        { 'qualityConditions.canRegisterCrop': { $exists: true } },
        { herbSpecies: { $type: 'bool' } }, // Remove any with wrong data types
      ]
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} problematic documents`);
    
    console.log('Schema cache cleared successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error clearing schema cache:', error);
    process.exit(1);
  }
}

clearSchemaCache();
