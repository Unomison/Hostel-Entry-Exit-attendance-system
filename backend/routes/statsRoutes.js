const express = require('express');
const router = express.Router();
const { getStats, getAuditLogs } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/logs', protect, authorize('admin'), getAuditLogs);

module.exports = router;