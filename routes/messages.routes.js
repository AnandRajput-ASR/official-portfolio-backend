const express = require('express');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');

// Rate limit for public contact form (10 messages/hour per IP)
const contactRateLimit = rateLimiter(10, 3600000, 'Too many messages. Please wait before sending again.');

router.post('/', contactRateLimit, messagesController.sendMessage);

router.get('/', auth, messagesController.getMessages);
router.patch('/mark-all-read', auth, messagesController.markAllRead);
router.patch('/:id/read', auth, messagesController.markRead);
router.patch('/:id/star', auth, messagesController.toggleStar);
router.delete('/:id', auth, messagesController.deleteMessage);

module.exports = router;
