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

test('auth middleware blocks unauthorized admin comments list requests', () => {
  const req = {
    method: 'GET',
    path: '/api/admin/blog/post-a/comments',
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

test('auth middleware returns 403 for invalid token on admin comments list', () => {
  const req = {
    method: 'GET',
    path: '/api/admin/blog/post-a/comments',
    headers: { authorization: 'Bearer definitely-invalid-token' },
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
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /Token invalid or expired/i);
});
