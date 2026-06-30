const test = require('node:test');
const assert = require('node:assert/strict');

const auth = require('../../middleware/auth');

test('auth middleware blocks unauthorized admin moderation requests', () => {
  const req = {
    method: 'PATCH',
    path: '/api/admin/blog/post-a/comments/c1/moderation',
    headers: {},
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  let nextCalled = false;
  auth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /No token provided/i);
});
