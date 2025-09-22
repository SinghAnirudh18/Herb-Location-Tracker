// routes/farmers.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getMyCollections,
  createCollection,
  updateCollection,
  getMyStats,
  uploadCollectionImages
} = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/') // Temporary storage before IPFS upload
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.use(protect);
router.use(authorize('farmer'));

router.get('/my-collections', getMyCollections);
router.post('/collections', createCollection);
router.put('/collections/:id', updateCollection);
router.get('/my-stats', getMyStats);
router.post('/collections/:id/images', upload.array('images', 5), uploadCollectionImages);

module.exports = router;