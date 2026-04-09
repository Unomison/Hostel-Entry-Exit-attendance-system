const Student = require('../models/Student');
const ScanLog = require('../models/ScanLog');

// ─────────────────────────────────────────────
// @route   GET /api/student/status
// @desc    Get current student status (IN/OUT)
// @access  Private (student only)
// ─────────────────────────────────────────────
const getStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select(
      'name currentStatus lastScanTime hostelBlock roomNo photoUrl'
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      currentStatus: student.currentStatus,
      lastScanTime: student.lastScanTime,
      student: {
        name: student.name,
        hostelBlock: student.hostelBlock,
        roomNo: student.roomNo,
        photoUrl: student.photoUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get student status',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/student/history
// @desc    Get scan history for logged-in student
// @access  Private (student only)
// ─────────────────────────────────────────────
const getScanHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await ScanLog.countDocuments({ studentId: req.user._id });

    // Get scan logs, most recent first
    // Populate guard name and gate info
    const history = await ScanLog.find({ studentId: req.user._id })
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('guardId', 'name assignedGate')
      .select('action previousStatus newStatus gate scannedAt guardId');

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      history,
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan history',
    });
  }
};

module.exports = { getStudentStatus, getScanHistory };