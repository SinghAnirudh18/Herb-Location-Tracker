const express = require('express');
const { 
  getAssignedBatches,
  startProcessing,
  recordProcessingStep,
  completeProcessing,
  getProcessingHistory,
  getMyStats,
  lookupBatchById
} = require('../controllers/processorController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.use(authorize('processor'));

router.get('/assigned-batches', getAssignedBatches);
router.get('/batches/:batchId', lookupBatchById);
router.post('/batches/:batchId/start', startProcessing);
router.post('/processing-steps', recordProcessingStep);
router.post('/batches/:batchId/complete', completeProcessing);
router.get('/processing-history', getProcessingHistory);
router.get('/my-stats', getMyStats);

module.exports = router;