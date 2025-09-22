const crypto = require('crypto');

const createHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

module.exports = { createHash };