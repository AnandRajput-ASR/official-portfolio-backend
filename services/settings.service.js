const settingsRepository = require('../repositories/settings.repository');

async function updateSiteSettings(settings) {
  return await settingsRepository.updateSiteSettings(settings);
}

module.exports = {
  updateSiteSettings,
};
