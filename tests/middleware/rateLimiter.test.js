const test = require('node:test');
const assert = require('node:assert/strict');

const rateLimiter = require('../../middleware/rateLimiter');

function makeResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    set(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

test('rateLimiter allows requests within maxHits window', () => {
  const middleware = rateLimiter(2, 1000);
  const req = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } };

  let nextCalls = 0;

  middleware(req, makeResponse(), () => {
    nextCalls += 1;
  });

  middleware(req, makeResponse(), () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
});

test('rateLimiter blocks requests over maxHits and adds retry metadata', () => {
  const middleware = rateLimiter(1, 1000, 'Limited');
  const req = { ip: '127.0.0.2', socket: { remoteAddress: '127.0.0.2' } };

  middleware(req, makeResponse(), () => {});

  const blockedRes = makeResponse();
  let nextCalled = false;

  middleware(req, blockedRes, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(blockedRes.statusCode, 429);
  assert.equal(blockedRes.body.message, 'Limited');
  assert.equal(typeof blockedRes.body.retryAfterSeconds, 'number');
  assert.ok(blockedRes.body.retryAfterSeconds >= 1);
  assert.ok(blockedRes.headers['Retry-After']);
});
