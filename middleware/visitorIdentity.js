const crypto = require('crypto');
const env = require('../configs/env.config');

const COOKIE_NAME = 'portfolio_vid';
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;
const TOKEN_PREFIX = 'v1';
const VISITOR_ID_REGEX = /^[a-f0-9]{32}$/;

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signVisitorId(visitorId) {
  return base64UrlEncode(
    crypto
      .createHmac('sha256', env.visitorTokenSecret)
      .update(visitorId)
      .digest(),
  );
}

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== 'string') return {};

  const cookies = {};
  for (const chunk of cookieHeader.split(';')) {
    const index = chunk.indexOf('=');
    if (index === -1) continue;

    const key = chunk.slice(0, index).trim();
    const value = chunk.slice(index + 1).trim();
    if (!key) continue;

    try {
      cookies[key] = decodeURIComponent(value);
    } catch (_err) {
      cookies[key] = value;
    }
  }

  return cookies;
}

function generateVisitorId() {
  return crypto.randomBytes(16).toString('hex');
}

function parseToken(rawToken) {
  if (!rawToken) return null;

  const parts = String(rawToken).split('.');
  if (parts.length !== 3) return null;

  const [version, visitorId, signature] = parts;
  if (version !== TOKEN_PREFIX || !visitorId || !signature) return null;
  if (!VISITOR_ID_REGEX.test(visitorId)) return null;

  return { visitorId, signature };
}

function verifyToken(rawToken) {
  const parsed = parseToken(rawToken);
  if (!parsed) return null;

  const expectedSignature = signVisitorId(parsed.visitorId);
  const actualBuffer = Buffer.from(parsed.signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  return parsed.visitorId;
}

function buildToken(visitorId) {
  return `${TOKEN_PREFIX}.${visitorId}.${signVisitorId(visitorId)}`;
}

function attachVisitorIdentity(req, res, next) {
  const cookies = parseCookieHeader(req.headers.cookie);
  const currentToken = cookies[COOKIE_NAME];
  const verifiedVisitorId = verifyToken(currentToken);

  if (verifiedVisitorId) {
    req.visitorId = verifiedVisitorId;
    return next();
  }

  const visitorId = generateVisitorId();
  const token = buildToken(visitorId);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });

  req.visitorId = visitorId;
  return next();
}

module.exports = { attachVisitorIdentity, COOKIE_NAME };
