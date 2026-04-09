const express = require('express');
const router = express.Router();
const { processScan } = require('../controllers/scanController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only guards can process scans
router.post('/process', protect, authorize('guard'), processScan);

module.exports = router;