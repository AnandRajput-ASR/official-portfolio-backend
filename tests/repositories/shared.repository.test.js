const test = require('node:test');
const assert = require('node:assert/strict');

const sharedRepositoryPath = require.resolve('../../repositories/shared.repository');
const databaseConfigPath = require.resolve('../../configs/database.config');

function loadSharedRepositoryWithSqlResult(sqlResult) {
  delete require.cache[sharedRepositoryPath];
  delete require.cache[databaseConfigPath];

  const sqlMock = async () => sqlResult;

  require.cache[databaseConfigPath] = {
    id: databaseConfigPath,
    filename: databaseConfigPath,
    loaded: true,
    exports: sqlMock,
  };

  return require('../../repositories/shared.repository');
}

test('getSiteSettings returns companyBadge for legacy stored accentureBadge', async () => {
  const sharedRepository = loadSharedRepositoryWithSqlResult([
    {
      config: {
        about: {
          heading: 'About',
          accentureBadge: {
            company: 'Accenture',
            role: 'Consultant',
            period: '2018-2021',
            award: 'Rising Star',
          },
        },
      },
    },
  ]);

  const settings = await sharedRepository.getSiteSettings();

  assert.deepEqual(settings.about.companyBadge, {
    company: 'Accenture',
    role: 'Consultant',
    period: '2018-2021',
    award: 'Rising Star',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(settings.about, 'accentureBadge'), false);
});

test('getSiteSettings keeps canonical companyBadge and strips legacy key', async () => {
  const sharedRepository = loadSharedRepositoryWithSqlResult([
    {
      config: {
        about: {
          companyBadge: {
            company: 'Canonical Co',
            role: 'Architect',
            period: '2022-2025',
            award: 'Excellence',
          },
          accentureBadge: {
            company: 'Legacy Co',
            role: 'Legacy',
            period: 'Old',
            award: 'Old',
          },
        },
      },
    },
  ]);

  const settings = await sharedRepository.getSiteSettings();

  assert.deepEqual(settings.about.companyBadge, {
    company: 'Canonical Co',
    role: 'Architect',
    period: '2022-2025',
    award: 'Excellence',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(settings.about, 'accentureBadge'), false);
});
