const express = require('express');
const router = express.Router();
const {
  seedAdmin,
  createGuard,
  getAllGuards,
  toggleGuardStatus,
  getAllStudents,
} = require('../controllers/adminController');
const { getStats, getAuditLogs } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public — seed first admin (works only once)
router.get('/seed', seedAdmin);

// Stats and logs
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/logs', protect, authorize('admin'), getAuditLogs);

// Guard management
router.post('/guards', protect, authorize('admin'), createGuard);
router.get('/guards', protect, authorize('admin'), getAllGuards);
router.put('/guards/:id/toggle', protect, authorize('admin'), toggleGuardStatus);

// Student management
router.get('/students', protect, authorize('admin'), getAllStudents);

module.exports = router;