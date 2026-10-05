import { useEffect, useState } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function MemberProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', profession: user?.profession || '' });
  const [certs, setCerts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get('/trainings/certifications/mine').then((res) => setCerts(res.data.certifications));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await client.put('/users/me', form);
    setUser(res.data.user);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Mon profil</h1>
          <p>Gérez vos informations personnelles.</p>
        </div>
      </div>

      <div className="grid-2">
        <form onSubmit={submit} className="card">
          <div className="field">
            <label className="label">Nom complet</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" value={user?.email} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="field">
            <label className="label">Téléphone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label className="label">Profession</label>
            <input className="input" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </form>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Mes certifications</h3>
          {certs.length === 0 && <div className="empty-state">Aucune certification pour le moment.</div>}
          {certs.map((c) => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{c.credits} crédit(s) · obtenu le {c.issued_at}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
