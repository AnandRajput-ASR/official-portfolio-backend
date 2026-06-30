const test = require('node:test');
const assert = require('node:assert/strict');

const servicePath = require.resolve('../../services/content.service');
const repositoryPath = require.resolve('../../repositories/content.repository');

function loadServiceWithRepoMock(repoMock) {
  delete require.cache[servicePath];
  delete require.cache[repositoryPath];

  require.cache[repositoryPath] = {
    id: repositoryPath,
    filename: repositoryPath,
    loaded: true,
    exports: repoMock,
  };

  return require('../../services/content.service');
}

test('getPublicLiveBlogPosts returns only frontend-allowed fields', async () => {
  const contentService = loadServiceWithRepoMock({
    getPublicLiveBlogPosts: async () => ([
      {
        id: '1',
        title: 'Post A',
        slug: 'post-a',
        excerpt: 'Excerpt',
        content: 'Body',
        tags: ['node', 'express'],
        coverImage: '/a.jpg',
        published: true,
        publishedAt: '2026-06-01T00:00:00.000Z',
        unpublishedAt: null,
        readingTime: 7,
        displayOrder: 2,
        author: 'Private',
      },
    ]),
  });

  const posts = await contentService.getPublicLiveBlogPosts();

  assert.equal(posts.length, 1);
  assert.deepEqual(Object.keys(posts[0]).sort(), [
    'content',
    'coverImage',
    'displayOrder',
    'excerpt',
    'id',
    'published',
    'publishedAt',
    'readingTime',
    'slug',
    'tags',
    'title',
    'unpublishedAt',
  ].sort());
  assert.equal(posts[0].title, 'Post A');
  assert.equal(posts[0].slug, 'post-a');
  assert.equal(posts[0].published, true);
});

test('getPublicLiveBlogPosts returns only live posts and sorts by publishedAt DESC then displayOrder ASC', async () => {
  const contentService = loadServiceWithRepoMock({
    getPublicLiveBlogPosts: async () => ([
      {
        id: 'future',
        title: 'Future',
        slug: 'future',
        excerpt: null,
        content: 'future',
        tags: [],
        coverImage: null,
        published: true,
        publishedAt: '2099-01-01T00:00:00.000Z',
        unpublishedAt: null,
        readingTime: 2,
        displayOrder: 1,
      },
      {
        id: 'expired',
        title: 'Expired',
        slug: 'expired',
        excerpt: null,
        content: 'expired',
        tags: [],
        coverImage: null,
        published: true,
        publishedAt: '2025-01-01T00:00:00.000Z',
        unpublishedAt: '2025-06-01T00:00:00.000Z',
        readingTime: 3,
        displayOrder: 1,
      },
      {
        id: 'draft',
        title: 'Draft',
        slug: 'draft',
        excerpt: null,
        content: 'draft',
        tags: [],
        coverImage: null,
        published: false,
        publishedAt: null,
        unpublishedAt: null,
        readingTime: 1,
        displayOrder: 1,
      },
      {
        id: 'live-b',
        title: 'Live B',
        slug: 'live-b',
        excerpt: null,
        content: 'live-b',
        tags: [],
        coverImage: null,
        published: true,
        publishedAt: '2026-01-01T00:00:00.000Z',
        unpublishedAt: null,
        readingTime: 5,
        displayOrder: 2,
      },
      {
        id: 'live-a',
        title: 'Live A',
        slug: 'live-a',
        excerpt: null,
        content: 'live-a',
        tags: [],
        coverImage: null,
        published: true,
        publishedAt: '2026-01-01T00:00:00.000Z',
        unpublishedAt: null,
        readingTime: 4,
        displayOrder: 1,
      },
    ]),
  });

  const posts = await contentService.getPublicLiveBlogPosts();

  assert.deepEqual(posts.map((post) => post.slug), ['live-a', 'live-b']);
});

test('getPublicLiveBlogPostBySlug returns null when repository has no live row', async () => {
  const contentService = loadServiceWithRepoMock({
    getPublicLiveBlogPostBySlug: async () => null,
  });

  const post = await contentService.getPublicLiveBlogPostBySlug('missing-post');

  assert.equal(post, null);
});
