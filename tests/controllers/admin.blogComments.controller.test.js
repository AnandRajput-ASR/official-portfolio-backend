const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../../controllers/admin.controller');
const servicePath = require.resolve('../../services/admin.service');
const settingsServicePath = require.resolve('../../services/settings.service');

function createResponseCollector() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

function loadControllerWithServiceMock(serviceMock) {
  delete require.cache[controllerPath];
  delete require.cache[servicePath];
  delete require.cache[settingsServicePath];

  require.cache[servicePath] = {
    id: servicePath,
    filename: servicePath,
    loaded: true,
    exports: serviceMock,
  };

  require.cache[settingsServicePath] = {
    id: settingsServicePath,
    filename: settingsServicePath,
    loaded: true,
    exports: {},
  };

  return require('../../controllers/admin.controller');
}

test('getBlogComments supports status filter and returns counts payload', async () => {
  const controller = loadControllerWithServiceMock({
    getBlogComments: async () => ({
      comments: [{ id: 'c1', moderationStatus: 'hidden' }],
      counts: { all: 5, visible: 2, hidden: 2, deleted: 1 },
    }),
  });

  const req = { params: { slug: 'post-a' }, query: { status: 'hidden' } };
  const res = createResponseCollector();

  await controller.getBlogComments(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.counts.hidden, 2);
});

test('DELETE compatibility endpoint maps to soft delete moderation action', async () => {
  let called = false;
  const controller = loadControllerWithServiceMock({
    softDeleteBlogComment: async (slug, commentId, user, reason) => {
      called = true;
      assert.equal(slug, 'post-a');
      assert.equal(commentId, 'c1');
      assert.equal(user.username, 'admin');
      assert.equal(reason, 'spam');
      return {
        id: 'c1',
        moderationStatus: 'deleted',
        moderationReason: 'spam',
        moderatedBy: 'admin',
        moderatedAt: new Date().toISOString(),
        hiddenAt: null,
        deletedAt: new Date().toISOString(),
      };
    },
  });

  const req = {
    params: { slug: 'post-a', commentId: 'c1' },
    body: { reason: 'spam' },
    user: { username: 'admin', role: 'admin' },
  };
  const res = createResponseCollector();

  await controller.deleteBlogComment(req, res, () => {});

  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.data.moderationStatus, 'deleted');
});
