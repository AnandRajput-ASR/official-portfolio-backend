const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(data) {
  if (!data.name || data.name.trim().length < 2) {
    return 'Name is required (min 2 characters).';
  }

  if (data.name.length > 100) {
    return 'Name too long (max 100 characters).';
  }

  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    return 'A valid email address is required.';
  }

  if (!data.message || data.message.trim().length < 5) {
    return 'Message must be at least 5 characters.';
  }

  if (data.message.length > 2000) {
    return 'Message too long (max 2000 characters).';
  }

  return null;
}

module.exports = { validateContact };
