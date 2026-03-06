const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_secret_key_2026';

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(403).json({ message: 'Token invalid or expired' });
  }
};
