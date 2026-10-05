const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const orgId = req.user.role === 'super_admin' ? req.query.organization_id : req.user.organization_id;
  if (!orgId) return res.status(400).json({ error: 'organization_id requis' });
  const trainings = db.prepare('SELECT * FROM trainings WHERE organization_id = ? ORDER BY created_at DESC').all(orgId);
  res.json({ trainings });
});

router.post('/', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const { title, description, credits } = req.body;
  if (!title) return res.status(400).json({ error: 'Titre requis' });
  const info = db
    .prepare(`INSERT INTO trainings (organization_id, title, description, credits) VALUES (?, ?, ?, ?)`)
    .run(req.user.organization_id, title, description || '', credits || 1);
  res.status(201).json({ training: db.prepare('SELECT * FROM trainings WHERE id = ?').get(info.lastInsertRowid) });
});

// Mark a member as certified for a training (admin action)
router.post('/:id/certify', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const { user_id } = req.body;
  const training = db.prepare('SELECT * FROM trainings WHERE id = ?').get(req.params.id);
  if (!training) return res.status(404).json({ error: 'Formation introuvable' });

  const info = db
    .prepare('INSERT INTO certifications (user_id, training_id) VALUES (?, ?)')
    .run(user_id, req.params.id);

  db.prepare(`INSERT INTO notifications (user_id, organization_id, content) VALUES (?, ?, ?)`).run(
    user_id,
    training.organization_id,
    `Certification obtenue: ${training.title}`
  );

  res.status(201).json({ certification: db.prepare('SELECT * FROM certifications WHERE id = ?').get(info.lastInsertRowid) });
});

// My certifications
router.get('/certifications/mine', requireAuth, (req, res) => {
  const certs = db
    .prepare(
      `SELECT c.*, t.title, t.credits FROM certifications c
       JOIN trainings t ON t.id = c.training_id WHERE c.user_id = ?
       ORDER BY c.issued_at DESC`
    )
    .all(req.user.id);
  res.json({ certifications: certs });
});

module.exports = router;
