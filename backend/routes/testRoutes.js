const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test route — checks server and DB are working
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ Server is running!',
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1
        ? '✅ MongoDB Connected'
        : '❌ MongoDB Disconnected',
  });
});

module.exports = router;