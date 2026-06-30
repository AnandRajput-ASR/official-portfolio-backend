const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateBlogComment,
  MAX_NAME_LENGTH,
  MAX_MESSAGE_LENGTH,
} = require('../../validators/blogSocial.validator');

test('validateBlogComment rejects missing message', () => {
  const result = validateBlogComment({ name: 'A', message: '   ' });
  assert.equal(result.error, 'Message is required.');
});

test('validateBlogComment sanitizes and defaults name', () => {
  const result = validateBlogComment({
    name: '   ',
    message: '  <b>Hello</b> world  ',
  });

  assert.equal(result.error, undefined);
  assert.equal(result.value.name, 'Anonymous');
  assert.equal(result.value.message, '&lt;b&gt;Hello&lt;/b&gt; world');
});

test('validateBlogComment applies max lengths', () => {
  const tooLongName = 'n'.repeat(MAX_NAME_LENGTH + 1);
  const tooLongMessage = 'm'.repeat(MAX_MESSAGE_LENGTH + 1);

  const nameError = validateBlogComment({ name: tooLongName, message: 'valid message' });
  assert.match(nameError.error, /Name is too long/);

  const messageError = validateBlogComment({ name: 'valid', message: tooLongMessage });
  assert.match(messageError.error, /Message is too long/);
});
