require('dotenv').config();
const bcrypt = require('bcryptjs');

const requiredPasswords = [
  'SEED_SUPER_ADMIN_PASSWORD',
  'SEED_ORG1_ADMIN_PASSWORD',
  'SEED_MEMBER1_PASSWORD',
  'SEED_MEMBER2_PASSWORD',
  'SEED_ORG2_ADMIN_PASSWORD',
];

const seedPasswords = Object.fromEntries(
  requiredPasswords.map((name) => {
    const password = process.env[name];
    if (!password || password.length < 16) {
      throw new Error(`${name} must be set to a password of at least 16 characters in backend/.env before seeding.`);
    }
    return [name, password];
  })
);

if (new Set(Object.values(seedPasswords)).size !== requiredPasswords.length) {
  throw new Error('Each seeded account must use a different password.');
}

const db = require('./index');

console.log('Seeding database...');

// Wipe existing data (dev convenience), but only after required passwords validate.
db.exec(`
DELETE FROM certifications; DELETE FROM trainings; DELETE FROM notifications;
DELETE FROM messages; DELETE FROM forum_posts; DELETE FROM events;
DELETE FROM memberships; DELETE FROM users; DELETE FROM organizations;
`);

const hash = (password) => bcrypt.hashSync(password, 12);

// --- Super admin (Verdanova) ---
db.prepare(
  `INSERT INTO users (organization_id, name, email, password_hash, role) VALUES (NULL, 'Super Admin', 'admin@verdanova.tn', ?, 'super_admin')`
).run(hash(seedPasswords.SEED_SUPER_ADMIN_PASSWORD));

// --- Organization 1: Ordre des Ingénieurs ---
const org1 = db
  .prepare(`INSERT INTO organizations (name, type, description) VALUES (?, ?, ?)`)
  .run('Ordre des Ingénieurs Tunisiens', 'Ordre', 'Organisation professionnelle regroupant les ingénieurs de Tunisie.');

const org1Admin = db
  .prepare(
    `INSERT INTO users (organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'org_admin')`
  )
  .run(org1.lastInsertRowid, 'Amine Belhadj', 'admin@oit.tn', hash(seedPasswords.SEED_ORG1_ADMIN_PASSWORD));

// A couple of demo members
const member1 = db
  .prepare(
    `INSERT INTO users (organization_id, name, email, password_hash, role, phone, profession) VALUES (?, ?, ?, ?, 'member', ?, ?)`
  )
  .run(org1.lastInsertRowid, 'Sarra Jendoubi', 'sarra@example.com', hash(seedPasswords.SEED_MEMBER1_PASSWORD), '+216 20 000 000', 'Ingénieure logiciel');

db.prepare(`INSERT INTO memberships (user_id, organization_id, status) VALUES (?, ?, 'active')`).run(
  member1.lastInsertRowid,
  org1.lastInsertRowid
);

const member2 = db
  .prepare(
    `INSERT INTO users (organization_id, name, email, password_hash, role, phone, profession) VALUES (?, ?, ?, ?, 'member', ?, ?)`
  )
  .run(org1.lastInsertRowid, 'Karim Ben Ali', 'karim@example.com', hash(seedPasswords.SEED_MEMBER2_PASSWORD), '+216 22 111 111', 'Ingénieur civil');

db.prepare(`INSERT INTO memberships (user_id, organization_id, status) VALUES (?, ?, 'pending')`).run(
  member2.lastInsertRowid,
  org1.lastInsertRowid
);

// Events
db.prepare(
  `INSERT INTO events (organization_id, title, type, description, event_date) VALUES (?, ?, ?, ?, ?)`
).run(org1.lastInsertRowid, 'Formation: Cybersécurité pour ingénieurs', 'formation', 'Session de sensibilisation à la cybersécurité.', '2026-09-15');

db.prepare(
  `INSERT INTO events (organization_id, title, type, description, event_date) VALUES (?, ?, ?, ?, ?)`
).run(org1.lastInsertRowid, 'Assemblée générale annuelle', 'conference', 'Réunion annuelle des membres.', '2026-10-02');

// Forum post
db.prepare(`INSERT INTO forum_posts (organization_id, user_id, content) VALUES (?, ?, ?)`).run(
  org1.lastInsertRowid,
  member1.lastInsertRowid,
  'Bonjour à tous, est-ce que quelqu\'un a des recommandations de certifications en cybersécurité ?'
);

// Training
const training = db
  .prepare(`INSERT INTO trainings (organization_id, title, description, credits) VALUES (?, ?, ?, ?)`)
  .run(org1.lastInsertRowid, 'Cybersécurité niveau 1', 'Formation de base en cybersécurité.', 2);

db.prepare('INSERT INTO certifications (user_id, training_id) VALUES (?, ?)').run(
  member1.lastInsertRowid,
  training.lastInsertRowid
);

// --- Organization 2: Fédération des Architectes ---
const org2 = db
  .prepare(`INSERT INTO organizations (name, type, description, logo_color) VALUES (?, ?, ?, ?)`)
  .run('Fédération Tunisienne des Architectes', 'Fédération', 'Fédération regroupant les architectes indépendants.', '#D97B45');

db.prepare(
  `INSERT INTO users (organization_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'org_admin')`
).run(org2.lastInsertRowid, 'Leila Trabelsi', 'admin@fta.tn', hash(seedPasswords.SEED_ORG2_ADMIN_PASSWORD));

console.log('Seed complete. Demo account emails:');
console.log('- Super admin: admin@verdanova.tn');
console.log('- Org1 admin: admin@oit.tn');
console.log('- Org1 active member: sarra@example.com');
console.log('- Org1 pending member: karim@example.com');
console.log('- Org2 admin: admin@fta.tn');
console.log('Passwords are read from backend/.env and are not printed.');
