const Student = require('../models/Student');
const Guard = require('../models/Guard');
const ScanLog = require('../models/ScanLog');

// ─────────────────────────────────────────────
// @route   GET /api/admin/stats
// @desc    Get summary statistics for admin dashboard
// @access  Private (admin only)
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    // Run all counts in parallel for speed
    const [
      totalStudents,
      studentsIN,
      studentsOUT,
      totalGuards,
      activeGuards,
      totalScans,
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Student.countDocuments({ isActive: true, currentStatus: 'IN' }),
      Student.countDocuments({ isActive: true, currentStatus: 'OUT' }),
      Guard.countDocuments({}),
      Guard.countDocuments({ isActive: true }),
      ScanLog.countDocuments({}),
    ]);

    // Scans today — from midnight to now
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const scansToday = await ScanLog.countDocuments({
      scannedAt: { $gte: todayStart },
    });

    // Recent 5 scans for activity feed
    const recentScans = await ScanLog.find({})
      .sort({ scannedAt: -1 })
      .limit(5)
      .populate('studentId', 'name rollNo photoUrl')
      .populate('guardId', 'name')
      .select('action scannedAt gate studentId guardId');

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        studentsIN,
        studentsOUT,
        totalGuards,
        activeGuards,
        totalScans,
        scansToday,
      },
      recentScans,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/admin/logs
// @desc    Get audit logs with filters and pagination
// @access  Private (admin only)
// ─────────────────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Build filter query
    const query = {};

    // Filter by action (IN or OUT)
    if (req.query.action && ['IN', 'OUT'].includes(req.query.action)) {
      query.action = req.query.action;
    }

    // Filter by date range
    if (req.query.date) {
      const filterDate = new Date(req.query.date);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.scannedAt = {
        $gte: filterDate,
        $lt: nextDay,
      };
    }

    // Filter by guard
    if (req.query.guardId) {
      query.guardId = req.query.guardId;
    }

    const total = await ScanLog.countDocuments(query);

    const logs = await ScanLog.find(query)
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name rollNo hostelBlock roomNo photoUrl')
      .populate('guardId', 'name assignedGate');

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
    });
  }
};

module.exports = { getStats, getAuditLogs };