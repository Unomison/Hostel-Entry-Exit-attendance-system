const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow any ngrok URL
    if (origin.includes('ngrok')) return callback(null, true);
    
    // Allow your specific frontend URL from .env
    if (origin === process.env.FRONTEND_URL) return callback(null, true);
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
// ── Body Parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiters (separate per use case) ─────────────────────

// Login — 20 attempts per 15 minutes per IP
// Prevents password brute force but won't block normal usage
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes and try again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// QR Scan — 120 scans per minute per IP
// Guards can scan rapidly without being blocked
const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 120,            // 2 scans per second max — more than enough
  message: {
    success: false,
    message: 'Scanning too fast. Please slow down slightly.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration — 5 per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in an hour.',
  },
});

// General API — very generous, only blocks actual abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.',
  },
});

// General limiter disabled during development
// Re-enable before production deployment
// app.use('/api', generalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/test', require('./routes/testRoutes'));

// Apply specific limiters to sensitive routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/scan/process', scanLimiter);

// Route registration
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/guard', require('./routes/guardRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});