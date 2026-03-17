require('dotenv').config();

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[ENV] Missing required environment variable: ${name}`);
  }
  return value;
}

function parseAllowedOrigins(raw) {
  if (!raw) return ['http://localhost:4200'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: Number(process.env.PORT) || 3000,
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  adminSecretSlug: getRequiredEnv('ADMIN_SECRET_SLUG'),
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  trustProxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production',
  siteUrl: (process.env.SITE_URL?.trim() || 'http://localhost:4200').replace(/\/$/, ''),
};

module.exports = env;