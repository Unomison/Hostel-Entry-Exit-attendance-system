const express = require('express');
const router = express.Router();
const { generateQR, checkTokenStatus } = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only students can generate and check QR tokens
router.post('/generate', protect, authorize('student'), generateQR);
router.get('/status/:tokenId', protect, authorize('student'), checkTokenStatus);

module.exports = router;