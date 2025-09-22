const express = require('express');
const { 
  getAssignedBatches,
  startTesting,
  recordQualityTest,
  getTestHistory,
  getMyStats,
  getCertificate
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.use(authorize('lab'));

router.get('/assigned-batches', getAssignedBatches);
router.post('/batches/:batchId/start', startTesting);
router.post('/quality-tests', recordQualityTest);
router.get('/test-history', getTestHistory);
router.get('/my-stats', getMyStats);
router.get('/certificates/:certificateNumber', getCertificate);

module.exports = router;