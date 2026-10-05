const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Org admin: list memberships for their org (optionally filter by status)
router.get('/', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const orgId = req.user.role === 'super_admin' ? req.query.organization_id : req.user.organization_id;
  if (!orgId) return res.status(400).json({ error: 'organization_id requis' });

  let sql = `SELECT m.*, u.name as user_name, u.email as user_email, u.phone, u.profession
             FROM memberships m JOIN users u ON u.id = m.user_id
             WHERE m.organization_id = ?`;
  const params = [orgId];
  if (req.query.status) {
    sql += ' AND m.status = ?';
    params.push(req.query.status);
  }
  sql += ' ORDER BY m.requested_at DESC';
  res.json({ memberships: db.prepare(sql).all(...params) });
});

// Member: my membership status
router.get('/mine', requireAuth, (req, res) => {
  const membership = db
    .prepare('SELECT * FROM memberships WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1')
    .get(req.user.id);
  res.json({ membership });
});

// Member: submit/pay for membership (simplified fake payment)
router.post('/', requireAuth, (req, res) => {
  const { payment_ref } = req.body;
  const existing = db
    .prepare(`SELECT * FROM memberships WHERE user_id = ? AND organization_id = ?`)
    .get(req.user.id, req.user.organization_id);

  if (existing) {
    db.prepare(`UPDATE memberships SET status = 'paid', payment_ref = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(payment_ref || `PAY-${Date.now()}`, existing.id);
  } else {
    db.prepare(
      `INSERT INTO memberships (user_id, organization_id, status, payment_ref) VALUES (?, ?, 'paid', ?)`
    ).run(req.user.id, req.user.organization_id, payment_ref || `PAY-${Date.now()}`);
  }
  const membership = db
    .prepare('SELECT * FROM memberships WHERE user_id = ? AND organization_id = ?')
    .get(req.user.id, req.user.organization_id);
  res.json({ membership });
});

// Org admin: approve/reject/activate a membership
router.patch('/:id', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const { status } = req.body; // pending | paid | active | rejected
  if (!['pending', 'paid', 'active', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Statut d’adhésion invalide' });
  }
  const membership = db.prepare('SELECT * FROM memberships WHERE id = ?').get(req.params.id);
  if (!membership) return res.status(404).json({ error: 'Adhésion introuvable' });
  if (req.user.role === 'org_admin' && membership.organization_id !== req.user.organization_id) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  db.prepare(`UPDATE memberships SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);

  if (status === 'active') {
    db.prepare(
      `INSERT INTO notifications (user_id, organization_id, content) VALUES (?, ?, ?)`
    ).run(membership.user_id, membership.organization_id, 'Votre adhésion a été activée.');
  } else if (status === 'rejected') {
    db.prepare(
      `INSERT INTO notifications (user_id, organization_id, content) VALUES (?, ?, ?)`
    ).run(membership.user_id, membership.organization_id, 'Votre demande d\'adhésion a été refusée.');
  }

  res.json({ membership: db.prepare('SELECT * FROM memberships WHERE id = ?').get(req.params.id) });
});

module.exports = router;
