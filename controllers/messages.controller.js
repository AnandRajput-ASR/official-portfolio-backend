const messagesService = require('../services/messages.service');
const asyncHandler = require('../utils/asyncHandler');
const { validateContact } = require('../validators/contact.validator');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { name, email, message, _hp } = req.body;

  const validationError = validateContact({ name, email, message, _hp });
  // Honeypot triggered: silently succeed so bots don't know they were caught
  if (validationError === '__honeypot__') {
    return res.status(201).json({ message: 'Message sent successfully!' });
  }
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  await messagesService.sendMessage({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  return res.status(201).json({
    message: 'Message sent successfully!',
  });
});

exports.getMessages = asyncHandler(async (_, res) => {
  const result = await messagesService.getMessages();
  return res.json(result);
});

exports.markRead = asyncHandler(async (req, res) => {
  const msg = await messagesService.markRead(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  return res.json({ message: 'Marked as read', msg });
});

exports.toggleStar = asyncHandler(async (req, res) => {
  const msg = await messagesService.toggleStar(req.params.id);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  return res.json({
    message: `Message ${msg.starred ? 'starred' : 'unstarred'}`,
    msg,
  });
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  await messagesService.deleteMessage(req.params.id);
  return res.json({ message: 'Message deleted' });
});

exports.markAllRead = asyncHandler(async (_, res) => {
  await messagesService.markAllRead();
  return res.json({ message: 'All messages marked as read' });
});

exports.updateLabels = asyncHandler(async (req, res) => {
  const { labels } = req.body;

  if (!Array.isArray(labels)) {
    return res.status(400).json({ message: 'Labels must be an array' });
  }

  if (labels.length > 10) {
    return res.status(400).json({ message: 'Maximum 10 labels allowed' });
  }

  for (const label of labels) {
    if (typeof label !== 'string') {
      return res.status(400).json({ message: 'Each label must be a string' });
    }
    if (label.length > 50) {
      return res.status(400).json({ message: 'Each label must be max 50 characters' });
    }
  }

  const msg = await messagesService.updateLabels(req.params.id, labels);
  if (!msg) return res.status(404).json({ message: 'Message not found' });

  return res.json({ success: true, message: 'Labels updated' });
});

exports.updateArchived = asyncHandler(async (req, res) => {
  const { archived } = req.body;

  if (typeof archived !== 'boolean') {
    return res.status(400).json({ message: 'Archived must be a boolean' });
  }

  const msg = await messagesService.updateArchived(req.params.id, archived);
  if (!msg) return res.status(404).json({ message: 'Message not found' });

  const statusMessage = archived ? 'Message archived' : 'Message moved to inbox';
  return res.json({ success: true, message: statusMessage });
});

exports.updateReplied = asyncHandler(async (req, res) => {
  const { repliedAt } = req.body;

  if (!repliedAt || typeof repliedAt !== 'string') {
    return res.status(400).json({ message: 'repliedAt must be a valid ISO 8601 datetime string' });
  }

  try {
    const date = new Date(repliedAt);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'repliedAt must be a valid ISO 8601 datetime string' });
    }
  } catch (e) {
    return res.status(400).json({ message: 'repliedAt must be a valid ISO 8601 datetime string' });
  }

  const msg = await messagesService.updateReplied(req.params.id, repliedAt);
  if (!msg) return res.status(404).json({ message: 'Message not found' });

  return res.json({ success: true, message: 'Marked as replied' });
});
