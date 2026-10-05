const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const orgId = req.user.role === 'super_admin' ? req.query.organization_id : req.user.organization_id;
  if (!orgId) return res.status(400).json({ error: 'organization_id requis' });
  const events = db
    .prepare('SELECT * FROM events WHERE organization_id = ? ORDER BY event_date ASC')
    .all(orgId);
  res.json({ events });
});

router.post('/', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const { title, type, description, event_date } = req.body;
  if (!title || !event_date) return res.status(400).json({ error: 'Titre et date requis' });
  const info = db
    .prepare(
      `INSERT INTO events (organization_id, title, type, description, event_date) VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.user.organization_id, title, type || 'formation', description || '', event_date);
  res.status(201).json({ event: db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid) });
});

router.put('/:id', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Événement introuvable' });
  if (event.organization_id !== req.user.organization_id) return res.status(403).json({ error: 'Accès refusé' });

  const { title, type, description, event_date } = req.body;
  db.prepare(`UPDATE events SET title = ?, type = ?, description = ?, event_date = ? WHERE id = ?`).run(
    title ?? event.title,
    type ?? event.type,
    description ?? event.description,
    event_date ?? event.event_date,
    req.params.id
  );
  res.json({ event: db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id) });
});

router.delete('/:id', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Événement introuvable' });
  if (event.organization_id !== req.user.organization_id) return res.status(403).json({ error: 'Accès refusé' });
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
