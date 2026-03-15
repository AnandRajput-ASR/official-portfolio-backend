const messagesService = require('../services/messages.service');

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: 'Name, email, and message are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email',
      });
    }

    await messagesService.sendMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: 'Message sent successfully!',
    });
  } catch (err) {
    console.error('Error sending message:', err);

    return res.status(500).json({
      message: 'Failed to send message',
    });
  }
};

exports.getMessages = async (_, res) => {
  try {
    const result = await messagesService.getMessages();

    return res.json(result);
  } catch (err) {
    console.error('Error fetching messages:', err);

    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const msg = await messagesService.markRead(req.params.id);

    return res.json({
      message: 'Marked as read',
      msg,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: 'Failed to update message' });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const msg = await messagesService.toggleStar(req.params.id);

    return res.json({
      message: `Message ${msg.starred ? 'starred' : 'unstarred'}`,
      msg,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: 'Failed to update message' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await messagesService.deleteMessage(req.params.id);

    return res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: 'Failed to delete message' });
  }
};

exports.markAllRead = async (_, res) => {
  try {
    await messagesService.markAllRead();

    return res.json({
      message: 'All messages marked as read',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({ message: 'Failed to update messages' });
  }
};
