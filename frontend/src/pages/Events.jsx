import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const TYPE_LABELS = { formation: 'Formation', seminaire: 'Séminaire', foire: 'Foire', conference: 'Conférence' };

export default function Events() {
  const { user } = useAuth();
  const isAdmin = user.role === 'org_admin' || user.role === 'super_admin';
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'formation', description: '', event_date: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => client.get('/events').then((res) => setEvents(res.data.events));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await client.post('/events', form);
    setForm({ title: '', type: 'formation', description: '', event_date: '' });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const remove = async (id) => {
    await client.delete(`/events/${id}`);
    load();
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Calendrier des événements</h1>
          <p>Formations, séminaires, foires et conférences de l'organisation.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Annuler' : '+ Nouvel événement'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
          <div className="grid-2">
            <div className="field">
              <label className="label">Titre</label>
              <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Date</label>
            <input className="input" type="date" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Ajout…' : 'Ajouter l\'événement'}</button>
        </form>
      )}

      {events.length === 0 && <div className="empty-state">Aucun événement pour le moment.</div>}

      {events.map((e) => (
        <div key={e.id} className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="badge badge-paid" style={{ marginBottom: 6 }}>{TYPE_LABELS[e.type] || e.type}</span>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 6 }}>{e.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{e.event_date}</div>
            {e.description && <p style={{ fontSize: 13.5, marginTop: 6, marginBottom: 0 }}>{e.description}</p>}
          </div>
          {isAdmin && <button className="btn btn-outline btn-sm" onClick={() => remove(e.id)}>Supprimer</button>}
        </div>
      ))}
    </div>
  );
}
