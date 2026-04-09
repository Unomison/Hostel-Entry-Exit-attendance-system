const Admin = require('../models/Admin');
const Guard = require('../models/Guard');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────
// @route   GET /api/admin/seed
// @desc    Create the first admin account (run ONCE only)
// @access  Public (but only works if no admin exists)
// ─────────────────────────────────────────────
const seedAdmin = async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Login with your existing admin credentials.',
      });
    }

    // Create first admin
    const admin = await Admin.create({
      name: 'Hostel Warden',
      email: 'admin@hostel.com',
      password: 'admin123456',
      role: 'superadmin',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: '✅ Admin account created successfully!',
      credentials: {
        email: 'admin@hostel.com',
        password: 'admin123456',
        warning: '⚠️ CHANGE THIS PASSWORD AFTER FIRST LOGIN',
      },
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin: ' + error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/admin/guards
// @desc    Create a new guard account
// @access  Private (admin only)
// ─────────────────────────────────────────────
const createGuard = async (req, res) => {
  try {
    const { name, email, password, phone, assignedGate } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password and phone are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian phone number',
      });
    }

    // Check if email already taken
    const exists = await Guard.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A guard with this email already exists',
      });
    }

    const guard = await Guard.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      assignedGate: assignedGate || 'Main Gate',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `Guard account created for ${guard.name}`,
      guard: {
        id: guard._id,
        name: guard.name,
        email: guard.email,
        phone: guard.phone,
        assignedGate: guard.assignedGate,
      },
    });
  } catch (error) {
    console.error('Create guard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create guard account',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/admin/guards
// @desc    Get all guard accounts
// @access  Private (admin only)
// ─────────────────────────────────────────────
const getAllGuards = async (req, res) => {
  try {
    const guards = await Guard.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: guards.length,
      guards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guards',
    });
  }
};

// ─────────────────────────────────────────────
// @route   PUT /api/admin/guards/:id/toggle
// @desc    Activate or deactivate a guard account
// @access  Private (admin only)
// ─────────────────────────────────────────────
const toggleGuardStatus = async (req, res) => {
  try {
    const guard = await Guard.findById(req.params.id);
    if (!guard) {
      return res.status(404).json({
        success: false,
        message: 'Guard not found',
      });
    }

    guard.isActive = !guard.isActive;
    await guard.save();

    res.status(200).json({
      success: true,
      message: `Guard ${guard.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: guard.isActive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update guard status',
    });
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (admin only)
// ─────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
    });
  }
};

module.exports = {
  seedAdmin,
  createGuard,
  getAllGuards,
  toggleGuardStatus,
  getAllStudents,
};