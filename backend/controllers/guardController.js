const Student = require('../models/Student');
const ScanLog = require('../models/ScanLog');

// ─────────────────────────────────────────────
// @route   GET /api/guard/outside-list
// @desc    Get all students currently outside (status = OUT)
// @access  Private (guard only)
// ─────────────────────────────────────────────
const getOutsideStudents = async (req, res) => {
  try {
    const { block } = req.query; // Optional filter by hostel block

    const query = { currentStatus: 'OUT', isActive: true };
    if (block && block !== 'ALL') {
      query.hostelBlock = block.toUpperCase();
    }

    const students = await Student.find(query)
      .sort({ lastScanTime: -1 }) // Most recently exited first
      .select('name rollNo phone hostelBlock roomNo photoUrl lastScanTime currentStatus');

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error('Outside list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outside students list',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/guard/recent-scans
// @desc    Get recent scans done by this guard
// @access  Private (guard only)
// ─────────────────────────────────────────────
const getRecentScans = async (req, res) => {
  try {
    const scans = await ScanLog.find({ guardId: req.user._id })
      .sort({ scannedAt: -1 })
      .limit(20)
      .populate('studentId', 'name rollNo hostelBlock roomNo photoUrl');

    res.status(200).json({
      success: true,
      scans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent scans',
    });
  }
};

module.exports = { getOutsideStudents, getRecentScans };