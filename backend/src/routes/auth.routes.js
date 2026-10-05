const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

const PALETTE = ['#0B6E7C', '#D97B45', '#3E7C59', '#8E4585', '#2E5C8A'];
const randomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];
const loginFailures = new Map();
const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

function sanitize(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

function isLocked(email) {
  const attempt = loginFailures.get(email);
  if (!attempt) return false;
  if (Date.now() - attempt.startedAt > LOCKOUT_MS) {
    loginFailures.delete(email);
    return false;
  }
  return attempt.count >= MAX_LOGIN_FAILURES;
}

function recordFailure(email) {
  const current = loginFailures.get(email) || { count: 0, startedAt: Date.now() };
  current.count += 1;
  loginFailures.set(email, current);
}

function clearFailures(email) {
  loginFailures.delete(email);
}

// Register a new MEMBER account (org admins & super admin are provisioned by super admin)
router.post('/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const organizationId = Number(req.body.organization_id);
  const phone = String(req.body.phone || '').trim().slice(0, 40);
  const profession = String(req.body.profession || '').trim().slice(0, 100);

  if (!name || !email || !password || !Number.isInteger(organizationId)) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }
  if (name.length > 120 || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Informations de profil invalides' });
  }
  if (!validPassword(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir entre 8 et 128 caractères' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Cet email est déjà utilisé' });

  const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(organizationId);
  if (!org) return res.status(404).json({ error: 'Organisation introuvable' });

  const hash = bcrypt.hashSync(password, 12);
  const createMember = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO users (organization_id, name, email, password_hash, role, phone, profession, avatar_color)
         VALUES (?, ?, ?, ?, 'member', ?, ?, ?)`
      )
      .run(organizationId, name, email, hash, phone, profession, randomColor());
    db.prepare('INSERT INTO memberships (user_id, organization_id, status) VALUES (?, ?, \'pending\')')
      .run(info.lastInsertRowid, organizationId);
    return info.lastInsertRowid;
  });

  const userId = createMember();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.status(201).json({ token: signToken(user), user: sanitize(user) });
});

router.post('/login', (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  if (isLocked(email)) return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    recordFailure(email);
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  clearFailures(email);
  res.json({ token: signToken(user), user: sanitize(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ user: sanitize(user) });
});

module.exports = router;
