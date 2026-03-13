require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthHandler = require('./middleware/health');

const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const messagesRoutes = require('./routes/messages.routes');
const resumeRoutes = require('./routes/resume.routes');
const adminRoutes = require('./routes/admin.route');

const app = express();

// ─── Simple in-memory rate limiter (no extra deps) ────────────────────────────
function rateLimiter(maxHits, windowMs) {
  const map = new Map();
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'anon';
    const now = Date.now();
    const entry = map.get(key) || { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count++;
    map.set(key, entry);
    if (entry.count > maxHits) {
      return res.status(429).json({ message: 'Too many requests. Please wait a moment.' });
    }
    next();
  };
}

// ─── CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:4200'];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`CORS check for origin: ${origin}`);
      // allow requests without origin (like curl / postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.options('*', cors());

// ─── Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', require('express').static(require('path').join(__dirname, 'data', 'uploads')));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Secret admin slug verifier ───────────────────────────────────────────────
// Frontend calls this to verify the secret URL before showing the login page.
// The actual slug is stored server-side in .env — never exposed to the browser.
app.get('/api/admin/verify-slug/:slug', (req, res) => {
  const expected = process.env.ADMIN_SECRET_SLUG || 'secure-portal-ar2026';
  if (req.params.slug === expected) {
    return res.json({ valid: true });
  }
  return res.status(403).json({ valid: false });
});

app.use('/api/auth', rateLimiter(15, 15 * 60 * 1000), authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/messages', messagesRoutes); // rate-limit applied per-method inside route
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', healthHandler);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
