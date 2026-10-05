require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { securityHeaders } = require('./middleware/security');

require('./db'); // ensures schema is created on boot

const authRoutes = require('./routes/auth.routes');
const organizationsRoutes = require('./routes/organizations.routes');
const membershipsRoutes = require('./routes/memberships.routes');
const usersRoutes = require('./routes/users.routes');
const eventsRoutes = require('./routes/events.routes');
const forumRoutes = require('./routes/forum.routes');
const messagesRoutes = require('./routes/messages.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const trainingsRoutes = require('./routes/trainings.routes');

const app = express();
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/memberships', membershipsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/trainings', trainingsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.use((err, req, res, next) => {
  console.error(`[${res.getHeader('X-Request-Id')}]`, err);
  res.status(500).json({ error: 'Erreur interne du serveur', request_id: res.getHeader('X-Request-Id') });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Verdanova API en écoute sur le port ${PORT}`));
