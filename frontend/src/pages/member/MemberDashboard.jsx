import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const statusLabel = { pending: 'En attente', paid: 'Paiement reçu', active: 'Actif', rejected: 'Refusé' };
const statusClass = { pending: 'badge-pending', paid: 'badge-paid', active: 'badge-active', rejected: 'badge-rejected' };

export default function MemberDashboard() {
  const { user } = useAuth();
  const [membership, setMembership] = useState(null);
  const [events, setEvents] = useState([]);
  const [certs, setCerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paying, setPaying] = useState(false);

  const load = () => {
    client.get('/memberships/mine').then((res) => setMembership(res.data.membership));
    client.get('/events').then((res) => setEvents(res.data.events.slice(0, 4)));
    client.get('/trainings/certifications/mine').then((res) => setCerts(res.data.certifications));
    client.get('/notifications').then((res) => setNotifications(res.data.notifications.slice(0, 5)));
  };

  useEffect(load, []);

  const pay = async () => {
    setPaying(true);
    await client.post('/memberships', { payment_ref: `PAY-${Date.now()}` });
    setPaying(false);
    load();
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Bonjour, {user?.name?.split(' ')[0]}</h1>
          <p>Voici un aperçu de votre espace membre.</p>
        </div>
        {membership && (
          <span className={`badge ${statusClass[membership.status]}`}>{statusLabel[membership.status]}</span>
        )}
      </div>

      {membership?.status === 'pending' && (
        <div className="card" style={{ marginBottom: 24, background: '#FCEFE3', borderColor: '#EACBA8' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Votre adhésion est en attente de paiement</div>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
            Réglez votre cotisation pour activer votre compte auprès de l'organisation.
          </p>
          <button className="btn btn-primary btn-sm" onClick={pay} disabled={paying}>
            {paying ? 'Traitement…' : 'Payer la cotisation (démo)'}
          </button>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="num">{events.length}</div>
          <div className="lbl">Événements à venir</div>
        </div>
        <div className="stat-card">
          <div className="num">{certs.length}</div>
          <div className="lbl">Certifications obtenues</div>
        </div>
        <div className="stat-card">
          <div className="num">{notifications.filter((n) => !n.is_read).length}</div>
          <div className="lbl">Notifications non lues</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Prochains événements</h3>
          {events.length === 0 && <div className="empty-state">Aucun événement prévu.</div>}
          {events.map((e) => (
            <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{e.event_date} · {e.type}</div>
            </div>
          ))}
          <Link to="/member/events" style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
            Voir le calendrier →
          </Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Notifications récentes</h3>
          {notifications.length === 0 && <div className="empty-state">Aucune notification.</div>}
          {notifications.map((n) => (
            <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5 }}>
              {n.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
