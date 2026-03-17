/**
 * Simple in-memory rate limiter (no extra deps).
 *
 * @param {number} maxHits  – max requests allowed in the window
 * @param {number} windowMs – time window in milliseconds
 * @param {string} [message] – custom 429 response message
 * @returns {Function} Express middleware
 */
function rateLimiter(maxHits, windowMs, message = 'Too many requests. Please wait a moment.') {
  const map = new Map();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of map) {
      if (now - entry.start > windowMs) {
        map.delete(key);
      }
    }
  }, windowMs);

  // Allow the timer to not keep the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || 'anon';
    const now = Date.now();
    const entry = map.get(key) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count++;
    map.set(key, entry);

    if (entry.count > maxHits) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.start + windowMs - now) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ message, retryAfterSeconds });
    }

    return next();
  };
}

module.exports = rateLimiter;
