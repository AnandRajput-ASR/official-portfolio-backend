const test = require('node:test');
const assert = require('node:assert/strict');

const controllerPath = require.resolve('../../controllers/content.controller');
const servicePath = require.resolve('../../services/content.service');

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

  require.cache[servicePath] = {
    id: servicePath,
    filename: servicePath,
    loaded: true,
    exports: serviceMock,
  };

  return require('../../controllers/content.controller');
}

test('getPublicLiveBlogs returns wrapped posts payload', async () => {
  const controller = loadControllerWithServiceMock({
    getPublicLiveBlogPosts: async () => ([
      {
        id: '1',
        title: 'Live Post',
        slug: 'live-post',
        excerpt: 'Quick summary',
        content: 'Long content',
        tags: ['api'],
        coverImage: '/cover.jpg',
        published: true,
        publishedAt: '2026-06-01T00:00:00.000Z',
        unpublishedAt: null,
        readingTime: 5,
        displayOrder: 0,
      },
    ]),
  });

  const res = createResponseCollector();
  await controller.getPublicLiveBlogs({}, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(Array.isArray(res.payload.data.posts), true);
  assert.equal(res.payload.data.posts.length, 1);
});

test('getPublicLiveBlogBySlug returns 404 for missing or non-live post', async () => {
  const controller = loadControllerWithServiceMock({
    getPublicLiveBlogPostBySlug: async () => null,
  });

  const req = { params: { slug: 'missing-post' } };
  const res = createResponseCollector();

  await controller.getPublicLiveBlogBySlug(req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.payload.success, false);
  assert.match(res.payload.message, /not found/i);
});
