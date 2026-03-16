/**
 * Auth service — handles credentials, tokens, and password management.
 * Admin data is stored in the `portfolio.admin_users` database table.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sql = require('../configs/database.config');

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_secret_key_2026';
const TOKEN_EXPIRY = '8h';
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function getAdmin() {
  const result = await sql`
    SELECT id, username, password_hash, email, reset_token, reset_token_expiry, last_login_at
    FROM portfolio.admin_users
    LIMIT 1
  `;
  return result[0] || null;
}

async function login({ username, password }) {
  const admin = await getAdmin();
  if (!admin) return null;

  if (username !== admin.username) return null;

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return null;

  // Update last login timestamp
  await sql`UPDATE portfolio.admin_users SET last_login_at = now() WHERE id = ${admin.id}`;

  const token = signToken({ username, role: 'admin' });
  return { token, username, role: 'admin' };
}

async function changePassword({ currentPassword, newPassword, newUsername }) {
  const admin = await getAdmin();
  if (!admin) return null;

  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid) return null;

  const newHash = await bcrypt.hash(newPassword, 10);
  const updatedUsername = (newUsername && newUsername.trim()) || admin.username;

  await sql`
    UPDATE portfolio.admin_users
    SET password_hash = ${newHash},
        username = ${updatedUsername}
    WHERE id = ${admin.id}
  `;

  const token = signToken({ username: updatedUsername, role: 'admin' });
  return { token, username: updatedUsername };
}

async function generateResetToken() {
  const admin = await getAdmin();
  if (!admin) throw new Error('No admin user found');

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await sql`
    UPDATE portfolio.admin_users
    SET reset_token = ${token},
        reset_token_expiry = ${expiry}
    WHERE id = ${admin.id}
  `;

  return { token, expiry: expiry.toISOString(), email: admin.email };
}

async function resetPassword({ token, newPassword }) {
  const admin = await getAdmin();
  if (!admin) return { error: 'No admin user found' };

  if (!admin.reset_token || admin.reset_token !== token) {
    return { error: 'Invalid or expired reset token' };
  }

  if (new Date(admin.reset_token_expiry) < new Date()) {
    return { error: 'Reset token has expired. Please request a new one.' };
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await sql`
    UPDATE portfolio.admin_users
    SET password_hash = ${newHash},
        reset_token = NULL,
        reset_token_expiry = NULL
    WHERE id = ${admin.id}
  `;

  return { success: true };
}

function isEmailConfigured() {
  return !!(process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'xxxx-xxxx-xxxx-xxxx');
}

module.exports = {
  login,
  changePassword,
  generateResetToken,
  resetPassword,
  isEmailConfigured,
};
