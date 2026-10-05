import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', credits: 1 });
  const [showForm, setShowForm] = useState(false);
  const [certifyFor, setCertifyFor] = useState({});

  const load = () => {
    client.get('/trainings').then((res) => setTrainings(res.data.trainings));
    client.get('/users').then((res) => setMembers(res.data.users));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    await client.post('/trainings', form);
    setForm({ title: '', description: '', credits: 1 });
    setShowForm(false);
    load();
  };

  const certify = async (trainingId) => {
    const userId = certifyFor[trainingId];
    if (!userId) return;
    await client.post(`/trainings/${trainingId}/certify`, { user_id: Number(userId) });
    setCertifyFor({ ...certifyFor, [trainingId]: '' });
    load();
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Formations & certifications</h1>
          <p>Créez des formations et certifiez vos adhérents.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Nouvelle formation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
          <div className="field">
            <label className="label">Titre</label>
            <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Crédits</label>
              <input className="input" type="number" min="1" value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" type="submit">Créer la formation</button>
        </form>
      )}

      {trainings.length === 0 && <div className="empty-state">Aucune formation créée.</div>}

      {trainings.map((t) => (
        <div key={t.id} className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{t.description} · {t.credits} crédit(s)</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="input"
              style={{ maxWidth: 240 }}
              value={certifyFor[t.id] || ''}
              onChange={(e) => setCertifyFor({ ...certifyFor, [t.id]: e.target.value })}
            >
              <option value="">Sélectionner un membre…</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => certify(t.id)}>Certifier</button>
          </div>
        </div>
      ))}
    </div>
  );
}
