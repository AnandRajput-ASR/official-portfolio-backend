const BADGE_FIELDS = ['company', 'role', 'period', 'award'];

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normaliseBadge(rawBadge) {
  const badge = isPlainObject(rawBadge) ? rawBadge : {};

  return {
    company: typeof badge.company === 'string' ? badge.company : '',
    role: typeof badge.role === 'string' ? badge.role : '',
    period: typeof badge.period === 'string' ? badge.period : '',
    award: typeof badge.award === 'string' ? badge.award : '',
  };
}

function cloneSettings(settings) {
  if (!isPlainObject(settings)) return settings;
  return JSON.parse(JSON.stringify(settings));
}

function normaliseCompanyBadge(settings, { stripLegacy = true } = {}) {
  const cloned = cloneSettings(settings);
  if (!isPlainObject(cloned)) return cloned;

  if (!isPlainObject(cloned.about)) {
    return cloned;
  }

  const hasCompanyBadge = Object.prototype.hasOwnProperty.call(cloned.about, 'companyBadge');
  const hasLegacyBadge = Object.prototype.hasOwnProperty.call(cloned.about, 'accentureBadge');

  if (hasCompanyBadge && isPlainObject(cloned.about.companyBadge)) {
    cloned.about.companyBadge = normaliseBadge(cloned.about.companyBadge);
  } else if (hasLegacyBadge && isPlainObject(cloned.about.accentureBadge)) {
    cloned.about.companyBadge = normaliseBadge(cloned.about.accentureBadge);
  }

  if (stripLegacy) {
    delete cloned.about.accentureBadge;
  }

  return cloned;
}

function validateCompanyBadge(settings) {
  if (!isPlainObject(settings) || !isPlainObject(settings.about)) {
    return null;
  }

  const about = settings.about;
  const hasCompanyBadge = Object.prototype.hasOwnProperty.call(about, 'companyBadge');
  const hasLegacyBadge = Object.prototype.hasOwnProperty.call(about, 'accentureBadge');

  if (!hasCompanyBadge && !hasLegacyBadge) {
    return null;
  }

  const badge = hasCompanyBadge ? about.companyBadge : about.accentureBadge;

  if (!isPlainObject(badge)) {
    return 'about.companyBadge must be an object with company, role, period, and award.';
  }

  const unsupportedKeys = Object.keys(badge).filter((key) => !BADGE_FIELDS.includes(key));
  if (unsupportedKeys.length) {
    return `about.companyBadge contains unsupported fields: ${unsupportedKeys.join(', ')}`;
  }

  for (const field of BADGE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(badge, field)) {
      return `about.companyBadge.${field} is required.`;
    }

    if (typeof badge[field] !== 'string') {
      return `about.companyBadge.${field} must be a string.`;
    }
  }

  return null;
}

module.exports = {
  BADGE_FIELDS,
  normaliseCompanyBadge,
  validateCompanyBadge,
};
