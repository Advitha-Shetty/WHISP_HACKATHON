const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, req.app.get('jwtSecret'));
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function govOnly(req, res, next) {
  if (req.user?.role !== 'government' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Government access only' });
  }
  return next();
}

module.exports = { authMiddleware, govOnly };
