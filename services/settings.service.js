const settingsRepository = require('../repositories/settings.repository');
const { normaliseCompanyBadge, validateCompanyBadge } = require('../utils/siteSettings');

async function updateSiteSettings(settings) {
  const badgeValidationError = validateCompanyBadge(settings);
  if (badgeValidationError) {
    const error = new Error(badgeValidationError);
    error.statusCode = 400;
    throw error;
  }

  const normalisedSettings = normaliseCompanyBadge(settings, { stripLegacy: true });
  const saved = await settingsRepository.updateSiteSettings(normalisedSettings);
  return normaliseCompanyBadge(saved, { stripLegacy: true });
}

module.exports = {
  updateSiteSettings,
};
