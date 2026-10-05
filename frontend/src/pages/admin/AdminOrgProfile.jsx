import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminOrgProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', type: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get(`/organizations/${user.organization_id}`).then((res) => {
      const o = res.data.organization;
      setForm({ name: o.name, type: o.type, description: o.description });
    });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await client.put(`/organizations/${user.organization_id}`, form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Profil de l'organisation</h1>
          <p>Informations affichées aux membres et visiteurs.</p>
        </div>
      </div>

      <form onSubmit={submit} className="card" style={{ maxWidth: 560 }}>
        <div className="field">
          <label className="label">Nom de l'organisation</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
          <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
          {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
}
