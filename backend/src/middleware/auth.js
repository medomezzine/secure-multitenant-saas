const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_ISSUER = 'verdanova-api';
const JWT_AUDIENCE = 'verdanova-web';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production');
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  try {
    req.user = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      organization_id: user.organization_id,
      email: user.email,
      name: user.name,
    },
    SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '7d',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }
  );
}

module.exports = { requireAuth, requireRole, signToken, SECRET };
