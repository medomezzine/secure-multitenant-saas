const crypto = require('crypto');

function securityHeaders(req, res, next) {
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

function requireTenantAccess(getOrganizationId) {
  return (req, res, next) => {
    const organizationId = Number(getOrganizationId(req));
    if (!Number.isInteger(organizationId) || organizationId < 1) {
      return res.status(400).json({ error: 'organization_id requis' });
    }

    // Super admins may select a tenant explicitly; every other role is pinned
    // to the organization embedded in its verified JWT.
    if (req.user.role !== 'super_admin' && organizationId !== Number(req.user.organization_id)) {
      return res.status(403).json({ error: 'Accès inter-organisation refusé' });
    }

    req.organizationId = organizationId;
    next();
  };
}

module.exports = { securityHeaders, requireTenantAccess };
