/**
 * Auth controller — login, verify, password change, reset.
 */
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');
const { fail } = require('../utils/response');

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return fail(res, 'Username and password required', 400);
  }

  const result = await authService.login({ username, password });
  if (!result) {
    return fail(res, 'Invalid credentials', 401);
  }

  return res.json(result);
});

exports.verify = (req, res) => {
  return res.json({ valid: true, user: req.user });
};

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;

  if (!currentPassword || !newPassword) {
    return fail(res, 'Current and new password required', 400);
  }
  if (newPassword.length < 8) {
    return fail(res, 'New password must be at least 8 characters', 400);
  }

  const result = await authService.changePassword({ currentPassword, newPassword, newUsername });
  if (!result) {
    return fail(res, 'Current password is incorrect', 401);
  }

  return res.json({
    message: 'Credentials updated successfully',
    token: result.token,
    username: result.username,
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { token, expiry, email } = await authService.generateResetToken();

  if (authService.isEmailConfigured()) {
    try {
      await emailService.sendResetEmail(email, token);
      return res.json({ message: `Reset link sent to ${email}`, emailSent: true });
    } catch (err) {
      console.error('[AUTH] Email send failed:', err.message);
    }
  }

  // Dev fallback: NEVER expose token in production
  if (process.env.NODE_ENV === 'production') {
    return res.json({ message: 'Email is not configured on this server. Contact the administrator.', emailSent: false });
  }

  return res.json({
    message: 'Reset token generated (email not configured — use token directly in dev only)',
    resetToken: token,
    expiresAt: expiry,
    emailSent: false,
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return fail(res, 'Token and new password required', 400);
  }
  if (newPassword.length < 8) {
    return fail(res, 'Password must be at least 8 characters', 400);
  }

  const result = await authService.resetPassword({ token, newPassword });
  if (result.error) {
    return fail(res, result.error, 400);
  }

  return res.json({ message: 'Password reset successfully. You can now log in.' });
});
