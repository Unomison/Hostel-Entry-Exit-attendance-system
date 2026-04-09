const express = require('express');
const router = express.Router();
const {
  registerStudent,
  login,
  getMe,
  changePassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes — no login required
router.post('/register', registerStudent);
router.post('/login', login);

// Private routes — login required
router.get('/me', protect, getMe);
router.post('/change-password', protect, authorize('student'), changePassword);

module.exports = router;