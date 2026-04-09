const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Guard = require('../models/Guard');
const Admin = require('../models/Admin');

// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on role stored in token
    if (decoded.role === 'student') {
      req.user = await Student.findById(decoded.id).select('-password');
    } else if (decoded.role === 'guard') {
      req.user = await Guard.findById(decoded.id).select('-password');
    } else if (decoded.role === 'admin') {
      req.user = await Admin.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.',
      });
    }

    req.user.role = decoded.role; // Attach role to user object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

// Only allow specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} cannot access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };