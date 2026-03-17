require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthHandler = require('./middleware/health');
const rateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/logger');

const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const messagesRoutes = require('./routes/messages.routes');
const resumeRoutes = require('./routes/resume.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ─── CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['http://localhost:4200'];

app.use(
  cors({
    origin: (origin, callback) => {
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

// ─── Compression (gzip/brotli)
app.use(compression());

// ─── Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

app.use(requestLogger);

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

// ─── Cache-Control for public content (5 min, serve stale while revalidating)
app.use('/api/content', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  next();
});
app.use('/api/content', contentRoutes);
app.use('/api/messages', messagesRoutes); // rate-limit applied per-method inside route
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', healthHandler);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
