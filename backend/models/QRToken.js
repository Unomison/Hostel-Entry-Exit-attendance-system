const mongoose = require('mongoose');

const QRTokenSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    // The token string encoded inside the QR code
    token: {
      type: String,
      required: true,
      unique: true,
    },
    // Expires 30 seconds from creation
    expiresAt: {
      type: Date,
      required: true,
    },
    // Once scanned, marked as used — cannot be reused
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guard',
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-delete expired tokens after 5 minutes (keeps DB clean)
QRTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });


module.exports = mongoose.model('QRToken', QRTokenSchema);