const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const notifications = db
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
    .all(req.user.id);
  res.json({ notifications });
});

router.patch('/:id/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.patch('/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ success: true });
});

// Org admin: broadcast a notification to all active members of their org
router.post('/broadcast', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Contenu requis' });

  const members = db
    .prepare(`SELECT id FROM users WHERE organization_id = ? AND role = 'member'`)
    .all(req.user.organization_id);

  const insert = db.prepare('INSERT INTO notifications (user_id, organization_id, content) VALUES (?, ?, ?)');
  const tx = db.transaction((rows) => {
    for (const m of rows) insert.run(m.id, req.user.organization_id, content.trim());
  });
  tx(members);

  res.status(201).json({ sent: members.length });
});

module.exports = router;
