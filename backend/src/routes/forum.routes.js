const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const orgId = req.user.role === 'super_admin' ? req.query.organization_id : req.user.organization_id;
  if (!orgId) return res.status(400).json({ error: 'organization_id requis' });

  const isAdmin = req.user.role === 'org_admin' || req.user.role === 'super_admin';
  let sql = `SELECT p.*, u.name as author_name, u.avatar_color as author_color
             FROM forum_posts p JOIN users u ON u.id = p.user_id
             WHERE p.organization_id = ?`;
  if (!isAdmin) sql += ' AND p.is_hidden = 0';
  sql += ' ORDER BY p.created_at DESC';
  res.json({ posts: db.prepare(sql).all(orgId) });
});

router.post('/', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Contenu requis' });
  const info = db
    .prepare(`INSERT INTO forum_posts (organization_id, user_id, content) VALUES (?, ?, ?)`)
    .run(req.user.organization_id, req.user.id, content.trim());
  const post = db
    .prepare(
      `SELECT p.*, u.name as author_name, u.avatar_color as author_color
       FROM forum_posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`
    )
    .get(info.lastInsertRowid);
  res.status(201).json({ post });
});

// Admin: hide/show a post
router.patch('/:id', requireAuth, requireRole('org_admin', 'super_admin'), (req, res) => {
  const { is_hidden } = req.body;
  const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Publication introuvable' });
  if (req.user.role !== 'super_admin' && post.organization_id !== req.user.organization_id) {
    return res.status(403).json({ error: 'Accès inter-organisation refusé' });
  }
  db.prepare('UPDATE forum_posts SET is_hidden = ? WHERE id = ?').run(is_hidden ? 1 : 0, req.params.id);
  res.json({ post: db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id) });
});

router.delete('/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Publication introuvable' });
  const isAdmin = req.user.role === 'org_admin' || req.user.role === 'super_admin';
  if (!isAdmin && post.user_id !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });
  if (isAdmin && req.user.role !== 'super_admin' && post.organization_id !== req.user.organization_id) {
    return res.status(403).json({ error: 'Accès inter-organisation refusé' });
  }
  db.prepare('DELETE FROM forum_posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
