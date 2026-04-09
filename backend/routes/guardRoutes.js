const express = require('express');
const router = express.Router();
const { getOutsideStudents, getRecentScans } = require('../controllers/guardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require guard login
router.get('/outside-list', protect, authorize('guard'), getOutsideStudents);
router.get('/recent-scans', protect, authorize('guard'), getRecentScans);

module.exports = router;