import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Chargement…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <div className="app-shell">
      <Navbar />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
