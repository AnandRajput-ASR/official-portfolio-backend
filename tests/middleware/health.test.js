const test = require('node:test');
const assert = require('node:assert/strict');

const healthHandler = require('../../middleware/health');

test('health handler returns expected status payload', () => {
  let payload;

  const res = {
    json(data) {
      payload = data;
      return data;
    },
  };

  healthHandler({}, res);

  assert.equal(payload.status, 'ok');
  assert.equal(payload.node, process.version);
  assert.equal(typeof payload.timestamp, 'string');
  assert.equal(typeof payload.uptime, 'number');
});
