const test = require('node:test');
const assert = require('node:assert/strict');

const sharedRepositoryPath = require.resolve('../../repositories/shared.repository');
const databaseConfigPath = require.resolve('../../configs/database.config');

function loadSharedRepositoryWithSqlMock(sqlMock) {
  delete require.cache[sharedRepositoryPath];
  delete require.cache[databaseConfigPath];

  require.cache[databaseConfigPath] = {
    id: databaseConfigPath,
    filename: databaseConfigPath,
    loaded: true,
    exports: sqlMock,
  };

  return require('../../repositories/shared.repository');
}

test('getPublicLiveBlogPosts uses live-visibility filters and sorting', async () => {
  const executedQueries = [];
  const sqlMock = async (strings) => {
    executedQueries.push(strings.join(' '));
    return [];
  };

  const sharedRepository = loadSharedRepositoryWithSqlMock(sqlMock);
  await sharedRepository.getPublicLiveBlogPosts();

  const query = executedQueries[0] || '';

  assert.match(query, /COALESCE\(is_deleted, false\) = false/i);
  assert.match(query, /published = true/i);
  assert.match(query, /\(published_at IS NULL OR published_at <= now\(\)\)/i);
  assert.match(query, /\(unpublished_at IS NULL OR unpublished_at > now\(\)\)/i);
  assert.match(query, /ORDER BY published_at DESC NULLS LAST, display_order ASC/i);
});

test('getPublicLiveBlogPostBySlug applies slug and live-visibility filters', async () => {
  const executedQueries = [];
  const sqlMock = async (strings) => {
    executedQueries.push(strings.join(' '));
    return [];
  };

  const sharedRepository = loadSharedRepositoryWithSqlMock(sqlMock);
  await sharedRepository.getPublicLiveBlogPostBySlug('post-a');

  const query = executedQueries[0] || '';

  assert.match(query, /WHERE slug =/i);
  assert.match(query, /COALESCE\(is_deleted, false\) = false/i);
  assert.match(query, /published = true/i);
  assert.match(query, /\(published_at IS NULL OR published_at <= now\(\)\)/i);
  assert.match(query, /\(unpublished_at IS NULL OR unpublished_at > now\(\)\)/i);
  assert.match(query, /LIMIT 1/i);
});
