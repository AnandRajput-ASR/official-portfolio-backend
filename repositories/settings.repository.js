/**
 * Settings repository — site config write + re-exports shared reads.
 */
const sql = require('../configs/database.config');
const sharedRepo = require('./shared.repository');

async function updateSiteSettings(settings) {
  const result = await sql`
    UPDATE portfolio.site_config
    SET config = ${settings},
        updated_at = now()
    WHERE key = 'site_settings'
    RETURNING config
  `;

  return result[0]?.config;
}

module.exports = {
  ...sharedRepo,
  updateSiteSettings,
};
