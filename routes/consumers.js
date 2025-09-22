const express = require('express');
const { 
  verifyProduct,
  getTraceability,
  getPublicStats
} = require('../controllers/consumerController');
const router = express.Router();

// Public routes (no authentication required)
router.get('/verify/:identifier', verifyProduct);
router.get('/traceability/:batchId', getTraceability);
router.get('/stats', getPublicStats);

module.exports = router;