const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },
    rollNo: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'],
    },
    hostelBlock: {
      type: String,
      required: [true, 'Hostel block is required'],
      trim: true,
      uppercase: true,
    },
    roomNo: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      required: [true, 'Profile photo is required'],
    },
    photoPublicId: {
      type: String, // Cloudinary public ID for deletion/replacement
    },
    currentStatus: {
      type: String,
      enum: ['IN', 'OUT'],
      default: 'IN',
    },
    lastScanTime: {
      type: Date,
      default: null,
    },
    deviceFingerprint: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    fcmToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
StudentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
StudentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('Student', StudentSchema);