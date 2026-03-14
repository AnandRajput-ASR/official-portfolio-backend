const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const { sendContactNotification } = require('../services/email.service');
const router = express.Router();

// Rate limit for public contact form (10 messages/hour per IP)
const _rl = new Map();
function contactRateLimit(req, res, next) {
  const key = req.ip || req.headers['x-forwarded-for'] || 'anon';
  const now = Date.now();
  const e = _rl.get(key) || { n: 0, t: now };
  if (now - e.t > 3600000) {
    e.n = 0;
    e.t = now;
  }
  e.n++;
  _rl.set(key, e);
  if (e.n > 10) return res.status(429).json({ message: 'Too many messages. Please wait before sending again.' });
  return next();
}

const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

function readMessages() {
  return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
}
function writeMessages(data) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── PUBLIC: Submit contact form ──────────────────────────────────────────────
router.post('/', contactRateLimit, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }
  if ((name || '').length > 100) return res.status(400).json({ message: 'Name too long (max 100 chars).' });
  if ((message || '').length > 2000) return res.status(400).json({ message: 'Message too long (max 2000 chars).' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  const newMessage = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    read: false,
    starred: false,
    receivedAt: new Date().toISOString(),
  };

  const messages = readMessages();
  messages.unshift(newMessage);
  writeMessages(messages);

  // Fire email notification (non-blocking)
  await sendContactNotification(newMessage).catch(() => {});

  console.log(`[CONTACT] New message from ${newMessage.name} <${newMessage.email}>`);
  return res.status(201).json({ message: 'Message sent successfully!' });
});

// ─── ADMIN: Get all messages ──────────────────────────────────────────────────
router.get('/', auth, (req, res) => {
  const messages = readMessages();
  const unreadCount = messages.filter(m => !m.read).length;
  res.json({ messages, unreadCount });
});

// ─── ADMIN: Mark all as read (must be before /:id routes) ────────────────────
router.patch('/mark-all-read', auth, (req, res) => {
  const messages = readMessages();
  messages.forEach(m => (m.read = true));
  writeMessages(messages);
  res.json({ message: 'All messages marked as read' });
});

// ─── ADMIN: Mark as read ──────────────────────────────────────────────────────
router.patch('/:id/read', auth, (req, res) => {
  const messages = readMessages();
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  msg.read = true;
  writeMessages(messages);
  return res.json({ message: 'Marked as read', msg });
});

// ─── ADMIN: Toggle starred ────────────────────────────────────────────────────
router.patch('/:id/star', auth, (req, res) => {
  const messages = readMessages();
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  msg.starred = !msg.starred;
  writeMessages(messages);
  return res.json({ message: `Message ${msg.starred ? 'starred' : 'unstarred'}`, msg });
});

// ─── ADMIN: Delete message ────────────────────────────────────────────────────
router.delete('/:id', auth, (req, res) => {
  let messages = readMessages();
  const before = messages.length;
  messages = messages.filter(m => m.id !== req.params.id);
  if (messages.length === before) return res.status(404).json({ message: 'Message not found' });
  writeMessages(messages);
  return res.json({ message: 'Message deleted' });
});

module.exports = router;
