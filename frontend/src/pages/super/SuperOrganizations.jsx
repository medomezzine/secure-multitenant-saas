import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function SuperOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Ordre', description: '', admin_name: '', admin_email: '', admin_password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => client.get('/organizations').then((res) => setOrgs(res.data.organizations));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await client.post('/organizations', form);
      setForm({ name: '', type: 'Ordre', description: '', admin_name: '', admin_email: '', admin_password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await client.delete(`/organizations/${id}`);
    load();
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Organisations</h1>
          <p>Créez et gérez les organisations professionnelles de la plateforme.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Annuler' : '+ Nouvelle organisation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ marginBottom: 24, maxWidth: 560 }}>
          {error && <div style={{ background: '#FBE9E6', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13.5, marginBottom: 16 }}>{error}</div>}
          <div className="field">
            <label className="label">Nom de l'organisation</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="Ordre">Ordre</option>
              <option value="Fédération">Fédération</option>
              <option value="Syndicat">Syndicat</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '18px 0' }} />
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 12 }}>Compte administrateur de l'organisation</div>
          <div className="field">
            <label className="label">Nom</label>
            <input className="input" required value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Mot de passe</label>
              <input className="input" type="password" required value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Création…' : 'Créer l\'organisation'}</button>
        </form>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Organisation</th><th>Type</th><th>Créée le</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>{o.name}</td>
                <td>{o.type}</td>
                <td style={{ color: 'var(--muted)' }}>{o.created_at?.slice(0, 10) || '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => remove(o.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
