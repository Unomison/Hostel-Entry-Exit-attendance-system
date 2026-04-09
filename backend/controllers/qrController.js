const QRToken = require('../models/QRToken');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ─────────────────────────────────────────────
// @route   POST /api/qr/generate
// @desc    Generate a new QR token for logged-in student
// @access  Private (student only)
// ─────────────────────────────────────────────
const generateQR = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Check if student is active
    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Student account is inactive',
      });
    }

    // Invalidate any existing unused tokens for this student
    // This ensures only ONE valid token exists at a time
    await QRToken.updateMany(
      { studentId, isUsed: false },
      { isUsed: true, usedAt: new Date() }
    );

    // Generate a secure unique token
    // Combines UUID + random bytes for extra security
    const rawToken = uuidv4() + '-' + crypto.randomBytes(16).toString('hex');

    // Token expires in 30 seconds from now
    const expiresAt = new Date(Date.now() + 30 * 1000);

    // Save token to database
    const qrToken = await QRToken.create({
      studentId,
      token: rawToken,
      expiresAt,
      isUsed: false,
    });

    // The QR code will encode this payload as JSON string
    // Guard's scanner will read this and send it to the scan API
    // Shorter payload = simpler QR = easier to scan
const qrPayload = `${rawToken}|${studentId.toString()}`;

    res.status(201).json({
      success: true,
      qrPayload,           // This string gets encoded into the QR image
      expiresAt,           // Frontend uses this to show countdown
      tokenId: qrToken._id,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/qr/status/:tokenId
// @desc    Check if a token has been scanned yet
// @access  Private (student only)
// Used by student dashboard to detect when their QR was scanned
// ─────────────────────────────────────────────
const checkTokenStatus = async (req, res) => {
  try {
    const token = await QRToken.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    // Make sure this token belongs to the requesting student
    if (token.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      isUsed: token.isUsed,
      usedAt: token.usedAt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check token status',
    });
  }
};

module.exports = { generateQR, checkTokenStatus };