const test = require('node:test');
const assert = require('node:assert/strict');

const servicePath = require.resolve('../../services/settings.service');
const repositoryPath = require.resolve('../../repositories/settings.repository');

function loadServiceWithRepoMock(repoMock) {
  delete require.cache[servicePath];
  delete require.cache[repositoryPath];

  require.cache[repositoryPath] = {
    id: repositoryPath,
    filename: repositoryPath,
    loaded: true,
    exports: repoMock,
  };

  return require('../../services/settings.service');
}

test('updateSiteSettings persists canonical about.companyBadge', async () => {
  let persisted = null;

  const settingsService = loadServiceWithRepoMock({
    updateSiteSettings: async (settings) => {
      persisted = settings;
      return settings;
    },
  });

  const input = {
    about: {
      heading: 'About',
      companyBadge: {
        company: 'Acme',
        role: 'Engineer',
        period: '2020-2024',
        award: 'Top Performer',
      },
    },
  };

  const result = await settingsService.updateSiteSettings(input);

  assert.deepEqual(persisted.about.companyBadge, input.about.companyBadge);
  assert.equal(Object.prototype.hasOwnProperty.call(persisted.about, 'accentureBadge'), false);
  assert.deepEqual(result.about.companyBadge, input.about.companyBadge);
});

test('updateSiteSettings maps legacy about.accentureBadge to about.companyBadge', async () => {
  let persisted = null;

  const settingsService = loadServiceWithRepoMock({
    updateSiteSettings: async (settings) => {
      persisted = settings;
      return settings;
    },
  });

  const legacyInput = {
    about: {
      heading: 'About',
      accentureBadge: {
        company: 'Accenture',
        role: 'ASE',
        period: '2019-2022',
        award: 'Spot Award',
      },
    },
  };

  const result = await settingsService.updateSiteSettings(legacyInput);

  assert.deepEqual(persisted.about.companyBadge, legacyInput.about.accentureBadge);
  assert.equal(Object.prototype.hasOwnProperty.call(persisted.about, 'accentureBadge'), false);
  assert.deepEqual(result.about.companyBadge, legacyInput.about.accentureBadge);
});

test('updateSiteSettings rejects invalid badge shape', async () => {
  const settingsService = loadServiceWithRepoMock({
    updateSiteSettings: async (settings) => settings,
  });

  await assert.rejects(
    settingsService.updateSiteSettings({
      about: {
        companyBadge: {
          company: 'Acme',
          role: 'Engineer',
          period: '2020-2024',
          award: 101,
        },
      },
    }),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /about\.companyBadge\.award must be a string\./);
      return true;
    },
  );
});
