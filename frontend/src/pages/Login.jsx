import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'member') navigate('/member');
      else if (user.role === 'org_admin') navigate('/admin');
      else navigate('/super');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={panel}>
        <div style={brandRow}>
          <div style={logoMark}>V</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20 }}>Verdanova</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Plateforme de digitalisation des organisations</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, marginBottom: 6 }}>Connexion</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          Accédez à l'espace de votre organisation.
        </p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.tn" />
          </div>
          <div className="field">
            <label className="label">Mot de passe</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--muted)', textAlign: 'center' }}>
          Pas encore membre ? <Link to="/register" style={{ color: 'var(--teal)', fontWeight: 600 }}>Créer un compte</Link>
        </p>

        <div style={demoBox}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Comptes de démonstration</div>
          <div>Les mots de passe sont définis dans `backend/.env` avant la création des comptes de démonstration.</div>
        </div>
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
  width: 420,
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 14,
  padding: 36,
};

const brandRow = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 };

const logoMark = {
  width: 40,
  height: 40,
  borderRadius: 9,
  background: 'var(--teal)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 18,
};

const errorBox = {
  background: '#FBE9E6',
  color: 'var(--danger)',
  padding: '10px 14px',
  borderRadius: 8,
  fontSize: 13.5,
  marginBottom: 16,
};

const demoBox = {
  marginTop: 24,
  padding: 14,
  background: 'var(--paper)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--muted)',
  lineHeight: 1.7,
};
