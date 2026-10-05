const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Inbox: messages sent TO me, or broadcasts (receiver_id IS NULL) in my org
router.get('/', requireAuth, (req, res) => {
  const messages = db
    .prepare(
      `SELECT m.*, u.name as sender_name FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.organization_id = ? AND (m.receiver_id = ? OR m.receiver_id IS NULL OR m.sender_id = ?)
       ORDER BY m.created_at DESC`
    )
    .all(req.user.organization_id, req.user.id, req.user.id);
  res.json({ messages });
});

// Member -> org admin, or Org admin -> a member / broadcast (receiver_id null)
router.post('/', requireAuth, (req, res) => {
  const { content, receiver_id } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Contenu requis' });

  const isAdmin = req.user.role === 'org_admin' || req.user.role === 'super_admin';
  let targetReceiver = receiver_id ?? null;

  if (!isAdmin) {
    // Members can only message their org admin -> we store with receiver_id = null
    // consumed by admins as an inbound member message; keep target null but tag via content is fine.
    targetReceiver = null;
  }

  const info = db
    .prepare(
      `INSERT INTO messages (organization_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`
    )
    .run(req.user.organization_id, req.user.id, targetReceiver, content.trim());

  if (targetReceiver) {
    db.prepare(`INSERT INTO notifications (user_id, organization_id, content) VALUES (?, ?, ?)`).run(
      targetReceiver,
      req.user.organization_id,
      `Nouveau message de ${req.user.name}`
    );
  }

  const message = db
    .prepare('SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json({ message });
});

module.exports = router;
