const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// Public: list organizations (so a new member can pick one to join)
router.get('/', (req, res) => {
  const orgs = db.prepare('SELECT id, name, type, description, logo_color FROM organizations ORDER BY name').all();
  res.json({ organizations: orgs });
});

router.get('/:id', (req, res) => {
  const org = db.prepare('SELECT id, name, type, description, logo_color, created_at FROM organizations WHERE id = ?').get(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organisation introuvable' });
  res.json({ organization: org });
});

// Super admin: create an organization + its first org_admin account
router.post('/', requireAuth, requireRole('super_admin'), (req, res) => {
  const { name, type, description, admin_name, admin_password } = req.body;
  const admin_email = normalizeEmail(req.body.admin_email);
  if (!name || !admin_name || !admin_email || !admin_password) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  if (String(admin_password).length < 8 || String(admin_password).length > 128) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir entre 8 et 128 caractères' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(admin_email);
  if (existing) return res.status(409).json({ error: 'Cet email admin est déjà utilisé' });

  const createOrganization = db.transaction(() => {
    const orgInfo = db
      .prepare('INSERT INTO organizations (name, type, description) VALUES (?, ?, ?)')
      .run(String(name).trim(), type || 'Ordre', description || '');
    const hash = bcrypt.hashSync(admin_password, 12);
    db.prepare(
      `INSERT INTO users (organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'org_admin')`
    ).run(orgInfo.lastInsertRowid, String(admin_name).trim(), admin_email, hash);
    return orgInfo.lastInsertRowid;
  });

  const organizationId = createOrganization();
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(organizationId);
  res.status(201).json({ organization: org });
});

router.put('/:id', requireAuth, requireRole('super_admin', 'org_admin'), (req, res) => {
  if (req.user.role === 'org_admin' && Number(req.params.id) !== req.user.organization_id) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const { name, type, description, logo_color } = req.body;
  const org = db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id);
  if (!org) return res.status(404).json({ error: 'Organisation introuvable' });

  db.prepare(
    `UPDATE organizations SET name = ?, type = ?, description = ?, logo_color = ? WHERE id = ?`
  ).run(name ?? org.name, type ?? org.type, description ?? org.description, logo_color ?? org.logo_color, req.params.id);

  res.json({ organization: db.prepare('SELECT * FROM organizations WHERE id = ?').get(req.params.id) });
});

router.delete('/:id', requireAuth, requireRole('super_admin'), (req, res) => {
  const info = db.prepare('DELETE FROM organizations WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Organisation introuvable' });
  res.json({ success: true });
});

module.exports = router;
