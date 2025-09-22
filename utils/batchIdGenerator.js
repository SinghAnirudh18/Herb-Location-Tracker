/**
 * Batch ID Generation Utility
 * Generates unique batch IDs for herb collections
 */

const crypto = require('crypto');

/**
 * Generate a unique batch ID for herb collection
 * @param {string} herbSpecies - The species of herb being collected
 * @param {string} farmerId - The farmer's unique identifier
 * @param {Date} collectionDate - The date of collection
 * @returns {string} - Generated batch ID
 */
const generateBatchId = (herbSpecies, farmerId, collectionDate = new Date()) => {
  try {
    // Create herb species code (first 3 letters, uppercase)
    const herbCode = herbSpecies.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();

    // Create farmer code (first 4 characters of hash)
    const farmerHash = crypto.createHash('sha256').update(farmerId.toString()).digest('hex').slice(0, 4).toUpperCase();

    // Get year and month
    const year = collectionDate.getFullYear();
    const month = String(collectionDate.getMonth() + 1).padStart(2, '0');

    // Generate unique sequence based on timestamp and random component
    const timestamp = collectionDate.getTime().toString().slice(-6);
    const randomComponent = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    // Combine all components
    const batchId = `${herbCode}-${farmerHash}-${year}${month}-${timestamp}${randomComponent}`;

    return batchId;
  } catch (error) {
    console.error('Error generating batch ID:', error);
    // Fallback batch ID
    return `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
};

/**
 * Validate batch ID format
 * @param {string} batchId - The batch ID to validate
 * @returns {boolean} - True if valid format
 */
const validateBatchId = (batchId) => {
  const batchIdRegex = /^[A-Z]{3}-[A-F0-9]{4}-\d{6}-\d{9}$/;
  return batchIdRegex.test(batchId);
};

/**
 * Parse batch ID to extract components
 * @param {string} batchId - The batch ID to parse
 * @returns {object|null} - Parsed components or null if invalid
 */
const parseBatchId = (batchId) => {
  if (!validateBatchId(batchId)) {
    return null;
  }

  const parts = batchId.split('-');
  return {
    herbCode: parts[0],
    farmerCode: parts[1],
    dateCode: parts[2],
    sequence: parts[3]
  };
};

/**
 * Generate batch ID for farmer (simplified version)
 * @param {string} herbSpecies - The species of herb
 * @returns {string} - Generated batch ID
 */
const generateFarmerBatchId = (herbSpecies) => {
  const herbCode = herbSpecies.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `${herbCode}-2024-${timestamp}-${randomSuffix}`;
};

module.exports = {
  generateBatchId,
  validateBatchId,
  parseBatchId,
  generateFarmerBatchId
};
