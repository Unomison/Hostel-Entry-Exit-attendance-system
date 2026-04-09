const Student = require('../models/Student');
const Guard = require('../models/Guard');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const { uploadBase64Image } = require('../utils/uploadToCloudinary');

// ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
// ─────────────────────────────────────────────
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNo, phone, hostelBlock, roomNo, photo } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !rollNo || !phone || !hostelBlock || !roomNo || !photo) {
      return res.status(400).json({
        success: false,
        message: 'All fields including photo are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian phone number',
      });
    }

    // Check if email already exists
    const emailExists = await Student.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists',
      });
    }

    // Check if roll number already exists
    const rollExists = await Student.findOne({ rollNo: rollNo.toUpperCase() });
    if (rollExists) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists',
      });
    }

    // Upload photo to Cloudinary
    let photoUrl = '';
    let photoPublicId = '';
    try {
      const uploadResult = await uploadBase64Image(photo, 'hostel-students');
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'Photo upload failed. Check your Cloudinary credentials.',
      });
    }

    // Create the student
    // Password will be hashed automatically by the pre-save hook in model
    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      rollNo: rollNo.toUpperCase().trim(),
      phone: phone.trim(),
      hostelBlock: hostelBlock.toUpperCase().trim(),
      roomNo: roomNo.trim(),
      photoUrl,
      photoPublicId,
      currentStatus: 'IN',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login for student, guard, or admin
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and role are required',
      });
    }

    if (!['student', 'guard', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student, guard, or admin',
      });
    }

    let user = null;

    // Find user based on role
    if (role === 'student') {
      user = await Student.findOne({
        email: email.toLowerCase(),
        isActive: true,
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No active student found with this email',
        });
      }
    } else if (role === 'guard') {
      user = await Guard.findOne({
        email: email.toLowerCase(),
        isActive: true,
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No active guard found with this email',
        });
      }

      // Update last login time for guard
      await Guard.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    } else if (role === 'admin') {
      user = await Admin.findOne({
        email: email.toLowerCase(),
        isActive: true,
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No active admin found with this email',
        });
      }
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, role);

    // Build response data based on role
    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role,
    };

    if (role === 'student') {
      userData.rollNo = user.rollNo;
      userData.phone = user.phone;
      userData.hostelBlock = user.hostelBlock;
      userData.roomNo = user.roomNo;
      userData.photoUrl = user.photoUrl;
      userData.currentStatus = user.currentStatus;
    } else if (role === 'guard') {
      userData.phone = user.phone;
      userData.assignedGate = user.assignedGate;
    } else if (role === 'admin') {
      userData.adminRole = user.role;
    }

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged in user profile
// @access  Private (all roles)
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      user: {
        ...req.user._doc,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
    });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/change-password
// @desc    Change student password
// @access  Private (student only)
// ─────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // Get student with password field (normally excluded)
    const student = await Student.findById(req.user._id).select('+password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Verify current password
    const isMatch = await student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password — pre-save hook will hash it automatically
    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.',
    });
  }
};

module.exports = { registerStudent, login, getMe, changePassword };