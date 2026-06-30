const test = require('node:test');
const assert = require('node:assert/strict');

const servicePath = require.resolve('../../services/blogSocial.service');
const repositoryPath = require.resolve('../../repositories/blogSocial.repository');

function loadServiceWithRepoMock(repoMock) {
  delete require.cache[servicePath];
  delete require.cache[repositoryPath];

  require.cache[repositoryPath] = {
    id: repositoryPath,
    filename: repositoryPath,
    loaded: true,
    exports: repoMock,
  };

  return require('../../services/blogSocial.service');
}

test('getSocialState excludes hidden and deleted comments from public payload', async () => {
  const blogSocialService = loadServiceWithRepoMock({
    getSocialStateBySlug: async () => ({
      slug: 'post-a',
      likes: 10,
      shares: 3,
      viewerLiked: true,
      comments: [
        { id: '1', name: 'A', message: 'Visible', moderationStatus: 'visible' },
        { id: '2', name: 'B', message: 'Hidden', moderationStatus: 'hidden' },
        { id: '3', name: 'C', message: 'Deleted', moderationStatus: 'deleted' },
      ],
    }),
  });

  const state = await blogSocialService.getSocialState('post-a', 'visitor-1');

  assert.equal(state.comments.length, 1);
  assert.equal(state.comments[0].id, '1');
});
