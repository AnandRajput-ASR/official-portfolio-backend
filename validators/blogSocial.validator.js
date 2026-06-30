const { escapeHtml } = require('../utils/sanitize');

const MAX_NAME_LENGTH = 48;
const MAX_MESSAGE_LENGTH = 600;

function normaliseOptionalName(name) {
  if (typeof name !== 'string') return 'Anonymous';

  const trimmed = name.trim();
  if (!trimmed) return 'Anonymous';

  return escapeHtml(trimmed.slice(0, MAX_NAME_LENGTH));
}

function validateBlogComment(data = {}) {
  const messageInput = typeof data.message === 'string' ? data.message : '';
  const message = messageInput.trim();

  if (!message) {
    return { error: 'Message is required.' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` };
  }

  const nameInput = typeof data.name === 'string' ? data.name.trim() : '';
  if (nameInput.length > MAX_NAME_LENGTH) {
    return { error: `Name is too long (max ${MAX_NAME_LENGTH} characters).` };
  }

  return {
    value: {
      name: normaliseOptionalName(data.name),
      message: escapeHtml(message),
    },
  };
}

module.exports = {
  validateBlogComment,
  MAX_NAME_LENGTH,
  MAX_MESSAGE_LENGTH,
};
