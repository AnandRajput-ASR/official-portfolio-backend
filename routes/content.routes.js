const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const router = express.Router();
const contentController = require('../controllers/content.controller');

const UPLOADS_DIR = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── PUBLIC: Full page content from DB ─────────────────────────────────────────
router.get('/page-content', contentController.getContent);

// ─── PUBLIC: Individual sections from DB ───────────────────────────────────────
router.get('/hero', contentController.getHero);
router.get('/skills', contentController.getSkills);
router.get('/companies', contentController.getCompanies);
router.get('/personal-projects', contentController.getPersonalProjects);
router.get('/experience', contentController.getExperience);
router.get('/stats', contentController.getStats);
router.get('/certifications', contentController.getCertification);
router.get('/testimonials', contentController.getTestimonials);
router.get('/blog', contentController.getBlogPosts);
router.get('/analytics', auth, contentController.getAnalytics);
router.get('/testimonials/pending', contentController.getPendingTestimonials);
router.get('/settings', contentController.getSettings);

// ─── PUBLIC: Analytics tracking ────────────────────────────────────────────────
router.post('/analytics/track', contentController.trackAnalyticsEvent);

// ─── PUBLIC: Visitor count (for public hero/footer widget) ─────────────────────
router.get('/analytics/visitor-count', contentController.getVisitorCount);

// ─── PUBLIC: Resume lead capture ───────────────────────────────────────────────
router.post('/resume-lead', contentController.trackResumeLead);

// ─── ADMIN: Reorder any section ────────────────────────────────────────────────
router.put('/reorder/:section', auth, contentController.reorderSection);

// ─── ADMIN: IMAGE UPLOAD (saves to disk, returns /uploads/<file>) ──────────────
router.post('/upload-image', auth, (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData) return res.status(400).json({ message: 'fileName and fileData required.' });

  const ext = path.extname(fileName).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  if (!allowed.includes(ext)) return res.status(400).json({ message: 'Only image files allowed (jpg, png, webp, gif, svg).' });

  const MAX = 2 * 1024 * 1024; // 2 MB
  const buf = Buffer.from(fileData, 'base64');
  if (buf.length > MAX) return res.status(400).json({ message: 'Image too large (max 2 MB).' });

  const safeName = Date.now() + '-' + path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buf);

  return res.json({ url: '/uploads/' + safeName });
});

// ─── SERVE uploaded images ─────────────────────────────────────────────────────
router.get('/uploads/:file', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, path.basename(req.params.file));
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Not found.' });
  return res.sendFile(filePath);
});

module.exports = router;
