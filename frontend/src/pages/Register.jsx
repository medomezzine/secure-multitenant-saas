import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', organization_id: '', phone: '', profession: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/organizations').then((res) => {
      setOrgs(res.data.organizations);
      if (res.data.organizations.length) {
        setForm((f) => ({ ...f, organization_id: res.data.organizations[0].id }));
      }
    });
  }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, organization_id: Number(form.organization_id) });
      navigate('/member');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={panel}>
        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Créer un compte membre</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          Rejoignez votre organisation professionnelle.
        </p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Organisation</label>
            <select className="input" value={form.organization_id} onChange={update('organization_id')} required>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Nom complet</label>
            <input className="input" required value={form.name} onChange={update('name')} placeholder="Votre nom" />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={update('email')} placeholder="vous@exemple.tn" />
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="label">Téléphone</label>
              <input className="input" value={form.phone} onChange={update('phone')} placeholder="+216 ..." />
            </div>
            <div className="field">
              <label className="label">Profession</label>
              <input className="input" value={form.profession} onChange={update('profession')} placeholder="Ex: Ingénieur" />
            </div>
          </div>
          <div className="field">
            <label className="label">Mot de passe</label>
            <input className="input" type="password" required value={form.password} onChange={update('password')} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--muted)', textAlign: 'center' }}>
          Déjà membre ? <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--paper)',
  padding: 20,
};

const panel = {
  width: 460,
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 14,
  padding: 36,
};

const errorBox = {
  background: '#FBE9E6',
  color: 'var(--danger)',
  padding: '10px 14px',
  borderRadius: 8,
  fontSize: 13.5,
  marginBottom: 16,
};
