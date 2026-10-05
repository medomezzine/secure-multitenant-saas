import { useEffect, useState } from 'react';
import client from '../../api/client';

const statusLabel = { pending: 'En attente', paid: 'Payé', active: 'Actif', rejected: 'Refusé' };

export default function AdminMembers() {
  const [memberships, setMemberships] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = () => client.get('/memberships').then((res) => setMemberships(res.data.memberships));
  useEffect(load, []);

  const setStatus = async (id, status) => {
    await client.patch(`/memberships/${id}`, { status });
    load();
  };

  const filtered = filter === 'all' ? memberships : memberships.filter((m) => m.status === filter);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Gestion des adhérents</h1>
          <p>Approuvez, refusez ou consultez le statut des membres.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['all', 'pending', 'paid', 'active', 'rejected'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tous' : statusLabel[f]}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Contact</th>
              <th>Profession</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600 }}>{m.user_name}</td>
                <td>
                  <div>{m.user_email}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{m.phone}</div>
                </td>
                <td>{m.profession || '—'}</td>
                <td><span className={`badge badge-${m.status}`}>{statusLabel[m.status]}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {m.status !== 'active' && (
                      <button className="btn btn-outline btn-sm" onClick={() => setStatus(m.id, 'active')}>Activer</button>
                    )}
                    {m.status !== 'rejected' && (
                      <button className="btn btn-danger btn-sm" onClick={() => setStatus(m.id, 'rejected')}>Refuser</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state">Aucun adhérent dans cette catégorie.</div>}
      </div>
    </div>
  );
}
