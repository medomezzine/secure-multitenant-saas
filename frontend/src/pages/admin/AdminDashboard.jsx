import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    client.get('/users').then((res) => setMembers(res.data.users));
    client.get('/memberships').then((res) => setMemberships(res.data.memberships));
    client.get('/events').then((res) => setEvents(res.data.events));
  }, []);

  const pendingCount = memberships.filter((m) => m.status === 'pending' || m.status === 'paid').length;
  const activeCount = memberships.filter((m) => m.status === 'active').length;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de votre organisation.</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="num">{members.length}</div>
          <div className="lbl">Adhérents inscrits</div>
        </div>
        <div className="stat-card">
          <div className="num">{activeCount}</div>
          <div className="lbl">Adhésions actives</div>
        </div>
        <div className="stat-card">
          <div className="num">{pendingCount}</div>
          <div className="lbl">Demandes en attente</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Demandes récentes</h3>
          {memberships.slice(0, 5).map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.user_name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{m.user_email}</div>
              </div>
              <span className={`badge badge-${m.status}`}>{m.status}</span>
            </div>
          ))}
          <Link to="/admin/members" style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
            Gérer les adhérents →
          </Link>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Prochains événements</h3>
          {events.length === 0 && <div className="empty-state">Aucun événement prévu.</div>}
          {events.slice(0, 5).map((e) => (
            <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{e.event_date}</div>
            </div>
          ))}
          <Link to="/admin/events" style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
            Gérer le calendrier →
          </Link>
        </div>
      </div>
    </div>
  );
}
