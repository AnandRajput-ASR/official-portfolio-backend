const messagesService = require('../services/messages.service');
const asyncHandler = require('../utils/asyncHandler');
const { validateContact } = require('../validators/contact.validator');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  const validationError = validateContact({ name, email, message });
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
  return res.json({ message: 'Marked as read', msg });
});

exports.toggleStar = asyncHandler(async (req, res) => {
  const msg = await messagesService.toggleStar(req.params.id);
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
