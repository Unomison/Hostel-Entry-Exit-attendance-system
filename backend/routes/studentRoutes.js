const express = require('express');
const router = express.Router();
const { getStudentStatus, getScanHistory } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require student login
router.get('/status', protect, authorize('student'), getStudentStatus);
router.get('/history', protect, authorize('student'), getScanHistory);

module.exports = router;