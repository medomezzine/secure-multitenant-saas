const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Org admin: list members of their org, with membership status + profile completeness
router.get('/', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const orgId = req.user.role === 'super_admin' ? req.query.organization_id : req.user.organization_id;
  if (!orgId) return res.status(400).json({ error: 'organization_id requis' });

  const users = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.profession, u.avatar_color, u.created_at,
              m.status as membership_status
       FROM users u
       LEFT JOIN memberships m ON m.user_id = u.id AND m.organization_id = u.organization_id
       WHERE u.organization_id = ? AND u.role = 'member'
       ORDER BY u.created_at DESC`
    )
    .all(orgId);
  res.json({ users });
});

// Update own profile
router.put('/me', requireAuth, (req, res) => {
  const { name, phone, profession } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  db.prepare(`UPDATE users SET name = ?, phone = ?, profession = ? WHERE id = ?`).run(
    name ?? user.name,
    phone ?? user.phone,
    profession ?? user.profession,
    req.user.id
  );
  const { password_hash, ...rest } = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: rest });
});

module.exports = router;
