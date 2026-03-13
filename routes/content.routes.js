const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const router = express.Router();
const contentController = require('../controllers/content.controller');

const contentService = require('../services/content.service');

// Per-IP rate limiter for public endpoints (10 req/hour)
const _rl = new Map();
function publicRateLimit(req, res, next) {
  const key = req.ip || req.headers['x-forwarded-for'] || 'anon';
  const now = Date.now();
  const e = _rl.get(key) || { n: 0, t: now };
  if (now - e.t > 3600000) {
    e.n = 0;
    e.t = now;
  }
  e.n++;
  _rl.set(key, e);
  if (e.n > 10) return res.status(429).json({ message: 'Too many requests. Please wait a while.' });
  next();
}

const DATA_FILE = path.join(__dirname, '../data/content.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');
const UPLOADS_DIR = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const read = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

function write(d) {
  // Auto-backup before writing (keep last 3)
  try {
    if (fs.existsSync(DATA_FILE)) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      fs.copyFileSync(DATA_FILE, path.join(BACKUP_DIR, `content-${ts}.json`));
      const files = fs.readdirSync(BACKUP_DIR).sort();
      while (files.length > 3) fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
    }
  } catch (e) {
    console.warn('[BACKUP] Failed:', e.message);
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

// PUBLIC
router.get('/', async (_, res) => {
  try {
    const data = await contentService.getPag
    eContent();
    res.json(data);
  } catch (e) {
    console.error('Error reading content:', e);
    return res.status(500).json({ message: 'Error reading content.' });
  }
});

// ─── IMAGE UPLOAD (admin, saves to disk, returns /uploads/<file>) ──────────────
router.post('/upload-image', auth, (req, res) => {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData)
    return res.status(400).json({ message: 'fileName and fileData required.' });

  const ext = path.extname(fileName).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  if (!allowed.includes(ext))
    return res
      .status(400)
      .json({ message: 'Only image files allowed (jpg, png, webp, gif, svg).' });

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
  res.sendFile(filePath);
});
router.get('/hero', (_, res) => res.json(read().hero));
router.get('/skills', (_, res) => res.json(read().skills));
router.get('/companies', (_, res) => res.json(read().companies));
router.get('/personal-projects', (_, res) => res.json(read().personalProjects));
router.get('/experience', (_, res) => res.json(read().experience));
router.get('/stats', (_, res) => res.json(read().stats));

// // HERO
// router.put('/hero', auth, (req, res) => {
//   const d = read();
//   d.hero = { ...d.hero, ...req.body };
//   write(d);
//   res.json({ message: 'Hero updated', hero: d.hero });
// });

// SKILLS
router.put('/skills', auth, (req, res) => {
  const d = read();
  d.skills = req.body;
  write(d);
  res.json({ message: 'Skills updated' });
});
router.post('/skills', auth, (req, res) => {
  const d = read();
  d.skills.push(req.body);
  write(d);
  res.json({ message: 'Skill added' });
});
router.delete('/skills/:id', auth, (req, res) => {
  const d = read();
  d.skills = d.skills.filter((s) => s.id !== req.params.id);
  write(d);
  res.json({ message: 'Skill deleted' });
});

// COMPANIES
router.put('/companies', auth, (req, res) => {
  const d = read();
  d.companies = req.body;
  write(d);
  res.json({ message: 'Companies updated' });
});
router.post('/companies', auth, (req, res) => {
  const d = read();
  const company = { id: 'c_' + Date.now(), projects: [], ...req.body };
  d.companies.push(company);
  write(d);
  res.json({ message: 'Company added', company });
});
router.put('/companies/:id', auth, (req, res) => {
  const d = read();
  const idx = d.companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Company not found' });
  d.companies[idx] = { ...d.companies[idx], ...req.body };
  write(d);
  res.json({ message: 'Company updated', company: d.companies[idx] });
});
router.delete('/companies/:id', auth, (req, res) => {
  const d = read();
  d.companies = d.companies.filter((c) => c.id !== req.params.id);
  write(d);
  res.json({ message: 'Company deleted' });
});

// Company projects
router.post('/companies/:companyId/projects', auth, (req, res) => {
  const d = read();
  const co = d.companies.find((c) => c.id === req.params.companyId);
  if (!co) return res.status(404).json({ message: 'Company not found' });
  const project = {
    id: 'cp_' + Date.now(),
    number: String(co.projects.length + 1).padStart(2, '0'),
    ...req.body,
  };
  co.projects.push(project);
  write(d);
  res.json({ message: 'Project added', project });
});
router.put('/companies/:companyId/projects', auth, (req, res) => {
  const d = read();
  const co = d.companies.find((c) => c.id === req.params.companyId);
  if (!co) return res.status(404).json({ message: 'Company not found' });
  co.projects = req.body;
  write(d);
  res.json({ message: 'Projects updated' });
});
router.delete('/companies/:companyId/projects/:projectId', auth, (req, res) => {
  const d = read();
  const co = d.companies.find((c) => c.id === req.params.companyId);
  if (!co) return res.status(404).json({ message: 'Company not found' });
  co.projects = co.projects.filter((p) => p.id !== req.params.projectId);
  write(d);
  res.json({ message: 'Project deleted' });
});

// PERSONAL PROJECTS
router.put('/personal-projects', auth, (req, res) => {
  const d = read();
  d.personalProjects = req.body;
  write(d);
  res.json({ message: 'Personal projects updated' });
});
router.post('/personal-projects', auth, (req, res) => {
  const d = read();
  const project = { id: 'pp_' + Date.now(), ...req.body };
  d.personalProjects.push(project);
  write(d);
  res.json({ message: 'Personal project added', project });
});
router.put('/personal-projects/:id', auth, (req, res) => {
  const d = read();
  const idx = d.personalProjects.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  d.personalProjects[idx] = { ...d.personalProjects[idx], ...req.body };
  write(d);
  res.json({ message: 'Project updated' });
});
router.delete('/personal-projects/:id', auth, (req, res) => {
  const d = read();
  d.personalProjects = d.personalProjects.filter((p) => p.id !== req.params.id);
  write(d);
  res.json({ message: 'Project deleted' });
});

// EXPERIENCE
router.put('/experience', auth, (req, res) => {
  const d = read();
  d.experience = req.body;
  write(d);
  res.json({ message: 'Experience updated' });
});
router.post('/experience', auth, (req, res) => {
  const d = read();
  d.experience.push(req.body);
  write(d);
  res.json({ message: 'Experience added' });
});
router.delete('/experience/:id', auth, (req, res) => {
  const d = read();
  d.experience = d.experience.filter((e) => e.id !== req.params.id);
  write(d);
  res.json({ message: 'Experience deleted' });
});

// STATS
router.put('/stats', auth, (req, res) => {
  const d = read();
  d.stats = req.body;
  write(d);
  res.json({ message: 'Stats updated' });
});

// CERTIFICATIONS
router.get('/certifications', (_, res) => res.json(read().certifications || []));
router.put('/certifications', auth, (req, res) => {
  const d = read();
  d.certifications = req.body;
  write(d);
  res.json({ message: 'Certifications updated' });
});
router.post('/certifications', auth, (req, res) => {
  const d = read();
  if (!d.certifications) d.certifications = [];
  const cert = { id: 'cert_' + Date.now(), order: d.certifications.length, ...req.body };
  d.certifications.push(cert);
  write(d);
  res.json({ message: 'Certification added', cert });
});
router.put('/certifications/:id', auth, (req, res) => {
  const d = read();
  const idx = (d.certifications || []).findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  d.certifications[idx] = { ...d.certifications[idx], ...req.body };
  write(d);
  res.json({ message: 'Updated', cert: d.certifications[idx] });
});
router.delete('/certifications/:id', auth, (req, res) => {
  const d = read();
  d.certifications = (d.certifications || []).filter((c) => c.id !== req.params.id);
  write(d);
  res.json({ message: 'Deleted' });
});

// REORDER — accepts array of {id, order} pairs, reorders any section
router.put('/reorder/:section', auth, (req, res) => {
  const d = read();
  const section = req.params.section;
  const order = req.body; // [{id, order}, ...]

  const applyOrder = (arr) => {
    const map = {};
    order.forEach((o) => {
      map[o.id] = o.order;
    });
    return arr
      .map((item) => ({
        ...item,
        order: map[item.id] !== undefined ? map[item.id] : item.order,
      }))
      .sort((a, b) => a.order - b.order);
  };

  if (section === 'skills') d.skills = applyOrder(d.skills || []);
  else if (section === 'companies') d.companies = applyOrder(d.companies || []);
  else if (section === 'personalProjects')
    d.personalProjects = applyOrder(d.personalProjects || []);
  else if (section === 'experience') d.experience = applyOrder(d.experience || []);
  else if (section === 'certifications') d.certifications = applyOrder(d.certifications || []);
  else if (section === 'testimonials') d.testimonials = applyOrder(d.testimonials || []);
  else if (section === 'blogPosts') d.blogPosts = applyOrder(d.blogPosts || []);
  else if (section.startsWith('company-projects-')) {
    const companyId = section.replace('company-projects-', '');
    const co = d.companies.find((c) => c.id === companyId);
    if (co) co.projects = applyOrder(co.projects || []);
  } else {
    return res.status(400).json({ message: 'Unknown section: ' + section });
  }

  write(d);
  res.json({ message: 'Reordered: ' + section });
});

// SITE SETTINGS (feature flags + open-to-work)
router.get('/settings', (_, res) => res.json(read().siteSettings || {}));
router.put('/settings', auth, (req, res) => {
  const d = read();
  // Deep merge so nested objects (hero, about, ticker) are preserved correctly
  function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        out[key] = deepMerge(target[key], source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  }
  d.siteSettings = deepMerge(d.siteSettings || {}, req.body);
  write(d);
  res.json({ message: 'Settings updated', siteSettings: d.siteSettings });
});

// TESTIMONIALS
router.get('/testimonials', (_, res) => {
  // Public: only approved + visible
  const all = (read().testimonials || []).filter(
    (t) => t.status === 'approved' && t.visible !== false
  );
  res.json(all);
});
// Admin: all testimonials including pending/rejected
router.get('/testimonials/all', auth, (_, res) => {
  const d = read();
  res.json({ approved: d.testimonials || [], pending: d.pendingTestimonials || [] });
});
// Public submission (requires no auth) — lands in pendingTestimonials
router.post('/testimonials/submit', publicRateLimit, (req, res) => {
  const { name, role, company, quote, rating } = req.body;
  // Input validation
  if (!name || !quote)
    return res.status(400).json({ message: 'Name and testimonial are required.' });
  if ((name || '').length > 100)
    return res.status(400).json({ message: 'Name too long (max 100 chars).' });
  if ((quote || '').length > 1000)
    return res.status(400).json({ message: 'Testimonial too long (max 1000 chars).' });
  if ((company || '').length > 100)
    return res.status(400).json({ message: 'Company name too long.' });
  if ((role || '').length > 100) return res.status(400).json({ message: 'Role too long.' });
  const d = read();
  if (!d.pendingTestimonials) d.pendingTestimonials = [];
  const t = {
    id: 'pt_' + Date.now(),
    name: name.trim(),
    role: (role || '').trim(),
    company: (company || '').trim(),
    quote: quote.trim(),
    rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
    avatar: '',
    status: 'pending',
    visible: false,
    submittedAt: new Date().toISOString(),
  };
  d.pendingTestimonials.push(t);
  write(d);
  res.json({ message: 'Thank you! Your testimonial has been submitted for review.' });
});
// Admin: approve/reject a pending testimonial
router.put('/testimonials/pending/:id/approve', auth, (req, res) => {
  const d = read();
  const idx = (d.pendingTestimonials || []).findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  const t = {
    ...d.pendingTestimonials[idx],
    status: 'approved',
    visible: true,
    order: (d.testimonials || []).length,
  };
  d.testimonials = [...(d.testimonials || []), t];
  d.pendingTestimonials.splice(idx, 1);
  write(d);
  res.json({ message: 'Approved', testimonial: t });
});
router.put('/testimonials/pending/:id/reject', auth, (req, res) => {
  const d = read();
  const idx = (d.pendingTestimonials || []).findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  d.pendingTestimonials[idx].status = 'rejected';
  write(d);
  res.json({ message: 'Rejected' });
});
router.delete('/testimonials/pending/:id', auth, (req, res) => {
  const d = read();
  d.pendingTestimonials = (d.pendingTestimonials || []).filter((t) => t.id !== req.params.id);
  write(d);
  res.json({ message: 'Deleted' });
});
router.put('/testimonials', auth, (req, res) => {
  const d = read();
  d.testimonials = req.body;
  write(d);
  res.json({ message: 'Testimonials updated' });
});
router.post('/testimonials', auth, (req, res) => {
  const d = read();
  if (!d.testimonials) d.testimonials = [];
  const t = {
    id: 't_' + Date.now(),
    order: d.testimonials.length,
    visible: true,
    rating: 5,
    ...req.body,
  };
  d.testimonials.push(t);
  write(d);
  res.json({ message: 'Testimonial added', testimonial: t });
});
router.put('/testimonials/:id', auth, (req, res) => {
  const d = read();
  const idx = (d.testimonials || []).findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  d.testimonials[idx] = { ...d.testimonials[idx], ...req.body };
  write(d);
  res.json({ message: 'Updated', testimonial: d.testimonials[idx] });
});
router.delete('/testimonials/:id', auth, (req, res) => {
  const d = read();
  d.testimonials = (d.testimonials || []).filter((t) => t.id !== req.params.id);
  write(d);
  res.json({ message: 'Deleted' });
});

// BLOG POSTS
router.get('/blog', (_, res) => res.json(read().blogPosts || []));

// ─── Public: single blog post by slug ────────────────────────────────────────
router.get('/blog/slug/:slug', (req, res) => {
  const post = (read().blogPosts || []).find((p) => p.slug === req.params.slug && p.published);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  return res.json(post);
});
router.put('/blog', auth, (req, res) => {
  const d = read();
  d.blogPosts = req.body;
  write(d);
  res.json({ message: 'Blog updated' });
});
router.post('/blog', auth, (req, res) => {
  const d = read();
  if (!d.blogPosts) d.blogPosts = [];
  const post = {
    id: 'b_' + Date.now(),
    order: d.blogPosts.length,
    published: false,
    readingTime: 5,
    publishedAt: new Date().toISOString().split('T')[0],
    tags: [],
    ...req.body,
  };
  d.blogPosts.push(post);
  write(d);
  res.json({ message: 'Post added', post });
});
router.put('/blog/:id', auth, (req, res) => {
  const d = read();
  const idx = (d.blogPosts || []).findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  d.blogPosts[idx] = { ...d.blogPosts[idx], ...req.body };
  write(d);
  res.json({ message: 'Updated', post: d.blogPosts[idx] });
});
router.delete('/blog/:id', auth, (req, res) => {
  const d = read();
  d.blogPosts = (d.blogPosts || []).filter((p) => p.id !== req.params.id);
  write(d);
  res.json({ message: 'Deleted' });
});

// ANALYTICS — public track endpoint + admin read/reset
router.post('/analytics/track', (req, res) => {
  const d = read();
  if (!d.analytics)
    d.analytics = {
      resumeDownloads: 0,
      contactFormViews: 0,
      contactFormSubmissions: 0,
      projectClicks: {},
      pageViews: 0,
      lastReset: '',
    };
  const { event, projectId } = req.body;
  if (event === 'pageView') d.analytics.pageViews = (d.analytics.pageViews || 0) + 1;
  if (event === 'contactView')
    d.analytics.contactFormViews = (d.analytics.contactFormViews || 0) + 1;
  if (event === 'contactSubmit')
    d.analytics.contactFormSubmissions = (d.analytics.contactFormSubmissions || 0) + 1;
  if (event === 'resumeDownload')
    d.analytics.resumeDownloads = (d.analytics.resumeDownloads || 0) + 1;
  if (event === 'projectClick' && projectId) {
    if (!d.analytics.projectClicks) d.analytics.projectClicks = {};
    d.analytics.projectClicks[projectId] = (d.analytics.projectClicks[projectId] || 0) + 1;
  }
  write(d);
  res.json({ ok: true });
});
router.get('/analytics', auth, contentController.getAnalytics);
router.delete('/analytics/reset', auth, (req, res) => {
  const d = read();
  d.analytics = {
    resumeDownloads: 0,
    contactFormViews: 0,
    contactFormSubmissions: 0,
    projectClicks: {},
    pageViews: 0,
    lastReset: new Date().toISOString(),
  };
  write(d);
  res.json({ message: 'Analytics reset' });
});

// ---------------------------------------------------------------------------------------------------------------------------

router.get('/page-content', contentController.getContent)

// hero
router.put('/hero', contentController.updateHero);

// router.get('/hero', contentController.getHero);

module.exports = router;
