const express = require('express');
const auth = require('../middleware/auth');
const resumeRepo = require('../repositories/resume.repository');
const storageService = require('../services/storage.service');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

// ─── PUBLIC: Check if resume exists ─────────────────────────────────────────
router.get(
  '/info',
  asyncHandler(async (_req, res) => {
    const meta = await resumeRepo.getMeta();
    if (!meta) return res.json({ available: false });
    return res.json({
      available: true,
      fileName: meta.originalName,
      uploadedAt: meta.uploadedAt,
      size: meta.size,
    });
  })
);

// ─── PUBLIC: Download resume via short-lived signed URL ──────────────────────
router.get(
  '/download',
  asyncHandler(async (_req, res) => {
    const meta = await resumeRepo.getMeta();
    if (!meta) return res.status(404).json({ message: 'No resume uploaded yet.' });

    const signedUrl = await storageService.getSignedUrl(meta.storedName, meta.originalName);
    // Redirect — Supabase CDN serves the file with Content-Disposition: attachment
    return res.redirect(302, signedUrl);
  })
);

// ─── ADMIN: Upload resume ────────────────────────────────────────────────────
router.post(
  '/upload',
  auth,
  asyncHandler(async (req, res) => {
    const { fileName, fileData } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ message: 'fileName and fileData are required.' });
    }

    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }

    // 5 MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    const buffer = Buffer.from(fileData, 'base64');
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });
    }

    const storedName = `resume_${Date.now()}.pdf`;

    // Delete old file from bucket if one existed
    const oldMeta = await resumeRepo.getMeta();
    if (oldMeta?.storedName) {
      await storageService.deleteResume(oldMeta.storedName);
    }

    // Upload new file to Supabase Storage
    await storageService.uploadResume(buffer, storedName);

    // Persist metadata in DB
    await resumeRepo.upsertMeta({ originalName: fileName, storedName, size: buffer.length });

    console.log(`[RESUME] Uploaded to Supabase Storage: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return res.status(201).json({
      message: 'Resume uploaded successfully!',
      fileName,
      size: buffer.length,
    });
  })
);

// ─── ADMIN: Delete resume ─────────────────────────────────────────────────────
router.delete(
  '/',
  auth,
  asyncHandler(async (_req, res) => {
    const meta = await resumeRepo.getMeta();
    if (!meta) return res.status(404).json({ message: 'No resume to delete.' });

    await storageService.deleteResume(meta.storedName);
    await resumeRepo.deleteMeta();

    console.log(`[RESUME] Deleted from Supabase Storage: ${meta.storedName}`);
    return res.json({ message: 'Resume deleted.' });
  })
);

module.exports = router;


// ─── PUBLIC: Check if resume exists ─────────────────────────────────────────
router.get(
  '/info',
  asyncHandler(async (_req, res) => {
    const meta = await resumeRepo.getMeta();
    if (!meta) return res.json({ available: false });
    return res.json({
      available: true,
      fileName: meta.originalName,
      uploadedAt: meta.uploadedAt,
      size: meta.size,
    });
  })
);

// ─── PUBLIC: Download resume ─────────────────────────────────────────────────
router.get(
  '/download',
  asyncHandler(async (_req, res) => {
    const meta = await resumeRepo.getMeta();
    if (!meta) return res.status(404).json({ message: 'No resume uploaded yet.' });

    const filePath = path.join(RESUME_DIR, meta.storedName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Resume file not found.' });

    res.setHeader('Content-Disposition', `attachment; filename="${meta.originalName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    return res.sendFile(filePath);
  })
);

// ─── ADMIN: Upload resume (base64 in JSON body, no multer needed) ────────────
router.post(
  '/upload',
  auth,
  asyncHandler(async (req, res) => {
    const { fileName, fileData } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ message: 'fileName and fileData are required.' });
    }

    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }

    // 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024;
    const buffer = Buffer.from(fileData, 'base64');
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }

    const storedName = `resume_${Date.now()}.pdf`;
    const filePath = path.join(RESUME_DIR, storedName);

    // Remove old resume file if exists
    const oldMeta = await resumeRepo.getMeta();
    if (oldMeta) {
      const oldPath = path.join(RESUME_DIR, oldMeta.storedName);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    fs.writeFileSync(filePath, buffer);
    await resumeRepo.upsertMeta({ originalName: fileName, storedName, size: buffer.length });

    console.log(`[RESUME] Uploaded: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return res.status(201).json({
      message: 'Resume uploaded successfully!',
      fileName,
      size: buffer.length,
    });
  })
);

// ─── ADMIN: Delete resume ─────────────────────────────────────────────────────
router.delete(
  '/',
  auth,
  asyncHandler(async (_req, res) => {
    const meta = await resumeRepo.getMeta();
    if (!meta) return res.status(404).json({ message: 'No resume to delete.' });

    const filePath = path.join(RESUME_DIR, meta.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await resumeRepo.deleteMeta();

    return res.json({ message: 'Resume deleted.' });
  })
);

module.exports = router;
