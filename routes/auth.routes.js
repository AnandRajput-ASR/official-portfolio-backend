const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_secret_key_2026';
const ADMIN_FILE = path.join(__dirname, '../data/admin.json');

function readAdmin() {
  return JSON.parse(fs.readFileSync(ADMIN_FILE));
}
function writeAdmin(d) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(d, null, 2));
}

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

    const admin = readAdmin();
    if (username !== admin.username) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, username, role: 'admin' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/** GET /api/auth/verify */
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

/** PUT /api/auth/change-password — requires current password + new password */
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, newUsername } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });

    const admin = readAdmin();
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    if (newUsername && newUsername.trim()) admin.username = newUsername.trim();
    writeAdmin(admin);

    // Issue a new token with updated username
    const token = jwt.sign({ username: admin.username, role: 'admin' }, JWT_SECRET, {
      expiresIn: '8h',
    });
    return res.json({
      message: 'Credentials updated successfully',
      token,
      username: admin.username,
    });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/** POST /api/auth/forgot-password — generates reset token, returns it (email sending TBD) */
router.post('/forgot-password', async (req, res) => {
  try {
    const admin = readAdmin();
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    admin.resetToken = token;
    admin.resetTokenExpiry = expiry;
    writeAdmin(admin);

    // TODO: send email via email service when configured
    // For now, return the token in response (dev mode)
    const emailConfigured = !!(process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'xxxx-xxxx-xxxx-xxxx');
    if (emailConfigured) {
      try {
        const emailService = require('../services/email.service');
        await emailService.sendResetEmail(admin.email, token);
        return res.json({
          message: `Reset link sent to ${admin.email}`,
          emailSent: true,
        });
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }
    // Dev fallback: return token directly
    return res.json({
      message: 'Reset token generated (email not configured — use token directly)',
      resetToken: token,
      expiresAt: expiry,
      emailSent: false,
    });
  } catch (_err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

/** POST /api/auth/reset-password — use token to set new password */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const admin = readAdmin();
    if (!admin.resetToken || admin.resetToken !== token) return res.status(400).json({ message: 'Invalid or expired reset token' });
    if (new Date(admin.resetTokenExpiry) < new Date())
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    admin.resetToken = null;
    admin.resetTokenExpiry = null;
    writeAdmin(admin);

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (_err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
