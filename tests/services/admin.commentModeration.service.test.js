const test = require('node:test');
const assert = require('node:assert/strict');

const servicePath = require.resolve('../../services/admin.service');
const repositoryPath = require.resolve('../../repositories/admin.repository');
const sharedRepoPath = require.resolve('../../repositories/shared.repository');

function loadServiceWithMocks(repoMock) {
  delete require.cache[servicePath];
  delete require.cache[repositoryPath];
  delete require.cache[sharedRepoPath];

  require.cache[repositoryPath] = {
    id: repositoryPath,
    filename: repositoryPath,
    loaded: true,
    exports: repoMock,
  };

  require.cache[sharedRepoPath] = {
    id: sharedRepoPath,
    filename: sharedRepoPath,
    loaded: true,
    exports: {},
  };

  return require('../../services/admin.service');
}

test('moderateComment supports hide/unhide/delete/restore happy paths', async () => {
  const actions = [
    { action: 'hide', from: 'visible', to: 'hidden' },
    { action: 'unhide', from: 'hidden', to: 'visible' },
    { action: 'delete', from: 'visible', to: 'deleted' },
    { action: 'restore', from: 'deleted', to: 'visible' },
  ];

  for (const scenario of actions) {
    let nextStatusCaptured = null;
    const adminService = loadServiceWithMocks({
      getBlogCommentsBySlug: async () => ({
        comments: [{ id: 'c1', moderationStatus: scenario.from }],
        counts: { all: 1, visible: 1, hidden: 0, deleted: 0 },
      }),
      moderateBlogComment: async ({ nextStatus }) => {
        nextStatusCaptured = nextStatus;
        return {
          comment: {
            id: 'c1',
            moderationStatus: nextStatus,
            moderationReason: null,
            moderatedBy: 'admin',
            moderatedAt: new Date().toISOString(),
            hiddenAt: nextStatus === 'hidden' ? new Date().toISOString() : null,
            deletedAt: nextStatus === 'deleted' ? new Date().toISOString() : null,
          },
        };
      },
    });

    const result = await adminService.moderateComment('post-a', 'c1', scenario.action, { username: 'admin' }, null);

    assert.equal(nextStatusCaptured, scenario.to);
    assert.equal(result.moderationStatus, scenario.to);
  }
});

test('moderateComment returns 409 for invalid transition', async () => {
  const adminService = loadServiceWithMocks({
    getBlogCommentsBySlug: async () => ({
      comments: [{ id: 'c1', moderationStatus: 'visible' }],
      counts: { all: 1, visible: 1, hidden: 0, deleted: 0 },
    }),
    moderateBlogComment: async () => {
      throw new Error('should not be called');
    },
  });

  await assert.rejects(
    adminService.moderateComment('post-a', 'c1', 'restore', { username: 'admin' }, null),
    (err) => {
      assert.equal(err.statusCode, 409);
      return true;
    },
  );
});
