require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthHandler = require('./middleware/health');
const rateLimiter = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/logger');
const asyncHandler = require('./utils/asyncHandler');
const sharedRepository = require('./repositories/shared.repository');

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

// ─── Cache-Control for individual content sections (5 min).
// Excludes /page-content — it aggregates all data so it must reflect
// admin updates immediately (no stale browser cache).
app.use('/api/content', (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/page-content')) {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  next();
});
app.use('/api/content', contentRoutes);
app.use('/api/messages', messagesRoutes); // rate-limit applied per-method inside route
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', healthHandler);

// ─── Dynamic SEO files ─────────────────────────────────────────────────────────────────
// siteUrl is stored in site_settings in the DB and editable from the admin dashboard.
// Changing it there instantly updates both files — no redeploy needed.

app.get('/robots.txt', asyncHandler(async (req, res) => {
  const settings = await sharedRepository.getSiteSettings();
  const siteUrl = (settings?.siteUrl || 'https://anandrajput.dev').replace(/\/$/, '');
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  );
}));

app.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const settings = await sharedRepository.getSiteSettings();
  const siteUrl = (settings?.siteUrl || 'https://anandrajput.dev').replace(/\/$/, '');
  const blogPosts = await sharedRepository.getBlogPosts();

  const blogEntries = (blogPosts || [])
    .filter((p) => p.published)
    .map(
      (p) =>
        `  <url>\n    <loc>${siteUrl}/blog/${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>${blogEntries ? '\n' + blogEntries : ''}\n</urlset>\n`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
}));

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
