const QRToken = require('../models/QRToken');
const Student = require('../models/Student');
const ScanLog = require('../models/ScanLog');
const Guard = require('../models/Guard');

// Helper: get device fingerprint from request
const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.headers['x-forwarded-for'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown';
  return `${ip} | ${userAgent}`.substring(0, 300);
};

// Helper: check if student is in cooldown (2 minutes after last scan)
const isInCooldown = (lastScanTime) => {
  if (!lastScanTime) return false;
  const cooldownMs = 2 * 60 * 1000; // 2 minutes
  const timeSinceScan = Date.now() - new Date(lastScanTime).getTime();
  return timeSinceScan < cooldownMs;
};

// Helper: get remaining cooldown seconds
const getCooldownSeconds = (lastScanTime) => {
  if (!lastScanTime) return 0;
  const cooldownMs = 2 * 60 * 1000;
  const timeSinceScan = Date.now() - new Date(lastScanTime).getTime();
  const remaining = cooldownMs - timeSinceScan;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

// ─────────────────────────────────────────────
// @route   POST /api/scan/process
// @desc    Process a QR scan — the core of the system
// @access  Private (guard only)
// ─────────────────────────────────────────────
const processScan = async (req, res) => {
  try {
    const { qrPayload } = req.body;
    const guardId = req.user._id;

    if (!qrPayload) {
      return res.status(400).json({
        success: false,
        message: 'QR payload is required',
      });
    }

    // ── Parse QR payload ──────────────────────────────────
   // Parse the pipe-separated payload
const parts = qrPayload.split('|');
if (parts.length !== 2) {
  return res.status(400).json({
    success: false,
    errorType: 'INVALID_QR',
    message: 'Invalid QR code. Please ask student to show their app QR.',
  });
}

const token = parts[0];
const studentId = parts[1];

    if (!token || !studentId) {
      return res.status(400).json({
        success: false,
        errorType: 'INVALID_QR',
        message: 'Invalid QR code format.',
      });
    }

    // ── ANTI-PROXY LAYER 1: Find and validate token ───────
    const qrToken = await QRToken.findOne({ token });

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        errorType: 'INVALID_TOKEN',
        message: 'QR code not recognized. Ask student to refresh their QR.',
      });
    }

    // ── ANTI-PROXY LAYER 2: Check token expiry (30 seconds) ──
    if (new Date() > new Date(qrToken.expiresAt)) {
      return res.status(400).json({
        success: false,
        errorType: 'EXPIRED_TOKEN',
        message: '⏰ QR code has expired. Ask student to show the new QR.',
      });
    }

    // ── ANTI-PROXY LAYER 3: One-time use check ────────────
    if (qrToken.isUsed) {
      return res.status(400).json({
        success: false,
        errorType: 'USED_TOKEN',
        message: '🚫 This QR code has already been scanned. Ask student to refresh.',
      });
    }

    // ── Verify token belongs to claimed student ───────────
    if (qrToken.studentId.toString() !== studentId) {
      return res.status(400).json({
        success: false,
        errorType: 'TOKEN_MISMATCH',
        message: '⚠️ QR code mismatch. Possible tampering detected.',
      });
    }

    // ── Fetch student details ─────────────────────────────
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        errorType: 'STUDENT_NOT_FOUND',
        message: 'Student not found in system.',
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        errorType: 'INACTIVE_STUDENT',
        message: '🚫 This student account has been deactivated.',
      });
    }

    // ── ANTI-PROXY LAYER 4: 2-minute cooldown check ──────
    if (isInCooldown(student.lastScanTime)) {
      const remaining = getCooldownSeconds(student.lastScanTime);
      return res.status(429).json({
        success: false,
        errorType: 'COOLDOWN_ACTIVE',
        message: `⏳ Student was just scanned. Please wait ${remaining} seconds before scanning again.`,
        cooldownSeconds: remaining,
      });
    }

    // ── ANTI-PROXY LAYER 5: Device fingerprint logging ───
    const guardDeviceInfo = getDeviceInfo(req);

    // Check if student is being scanned from a different device than usual
    // Flag but don't block — guard's visual check is the human layer
    let isFlagged = false;
    let flagReason = null;

    if (student.deviceFingerprint &&
        !guardDeviceInfo.includes(student.deviceFingerprint.split('|')[0]?.trim())) {
      isFlagged = true;
      flagReason = 'Scan from different network than registration';
    }

    // ── Calculate new status ──────────────────────────────
    const previousStatus = student.currentStatus;
    const newStatus = previousStatus === 'IN' ? 'OUT' : 'IN';

    // ── Get guard info for gate ───────────────────────────
    const guard = await Guard.findById(guardId);

    // ── Mark token as used (ONE-TIME USE) ─────────────────
    await QRToken.findByIdAndUpdate(qrToken._id, {
      isUsed: true,
      usedAt: new Date(),
      scannedBy: guardId,
    });

    // ── Update student status ─────────────────────────────
    await Student.findByIdAndUpdate(studentId, {
      currentStatus: newStatus,
      lastScanTime: new Date(),
    });

    // ── Create scan log (full audit trail) ───────────────
    await ScanLog.create({
      studentId,
      guardId,
      tokenUsed: token,
      action: newStatus,
      previousStatus,
      newStatus,
      gate: guard?.assignedGate || 'Main Gate',
      guardDeviceInfo,
      isFlagged,
      flagReason,
      scannedAt: new Date(),
    });

    // ── Return success with student details for guard ─────
    // Guard sees this on their phone to visually verify
    res.status(200).json({
      success: true,
      message: `✅ Student marked ${newStatus} successfully`,
      action: newStatus,
      previousStatus,
      isFlagged,
      flagReason,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        phone: student.phone,
        hostelBlock: student.hostelBlock,
        roomNo: student.roomNo,
        photoUrl: student.photoUrl,
        previousStatus,
        newStatus,
      },
    });

  } catch (error) {
    console.error('Scan processing error:', error);
    res.status(500).json({
      success: false,
      errorType: 'SERVER_ERROR',
      message: 'Scan processing failed. Please try again.',
    });
  }
};

module.exports = { processScan };