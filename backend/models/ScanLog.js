const mongoose = require('mongoose');

const ScanLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    guardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guard',
      required: true,
    },
    tokenUsed: {
      type: String,
      required: true,
    },
    // What action happened — IN means entered hostel, OUT means exited
    action: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
    },
    previousStatus: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
    },
    newStatus: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
    },
    gate: {
      type: String,
      default: 'Main Gate',
    },
    studentDeviceInfo: {
      type: String,
      default: null,
    },
    guardDeviceInfo: {
      type: String,
      default: null,
    },
    // Flag suspicious scans (e.g. different device)
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: null,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ScanLogSchema.index({ studentId: 1, scannedAt: -1 });
ScanLogSchema.index({ guardId: 1, scannedAt: -1 });
ScanLogSchema.index({ scannedAt: -1 });
ScanLogSchema.index({ isFlagged: 1 });

module.exports = mongoose.model('ScanLog', ScanLogSchema);