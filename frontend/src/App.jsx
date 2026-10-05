import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Forum from './pages/Forum';
import Events from './pages/Events';
import Messages from './pages/Messages';

import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminTrainings from './pages/admin/AdminTrainings';
import AdminOrgProfile from './pages/admin/AdminOrgProfile';

import SuperDashboard from './pages/super/SuperDashboard';
import SuperOrganizations from './pages/super/SuperOrganizations';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'member') return <Navigate to="/member" replace />;
  if (user.role === 'org_admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/super" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />

      {/* Member */}
      <Route path="/member" element={<ProtectedRoute allow={['member']}><MemberDashboard /></ProtectedRoute>} />
      <Route path="/member/forum" element={<ProtectedRoute allow={['member']}><Forum /></ProtectedRoute>} />
      <Route path="/member/events" element={<ProtectedRoute allow={['member']}><Events /></ProtectedRoute>} />
      <Route path="/member/messages" element={<ProtectedRoute allow={['member']}><Messages /></ProtectedRoute>} />
      <Route path="/member/profile" element={<ProtectedRoute allow={['member']}><MemberProfile /></ProtectedRoute>} />

      {/* Org admin */}
      <Route path="/admin" element={<ProtectedRoute allow={['org_admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/members" element={<ProtectedRoute allow={['org_admin']}><AdminMembers /></ProtectedRoute>} />
      <Route path="/admin/forum" element={<ProtectedRoute allow={['org_admin']}><Forum /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute allow={['org_admin']}><Events /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute allow={['org_admin']}><Messages /></ProtectedRoute>} />
      <Route path="/admin/trainings" element={<ProtectedRoute allow={['org_admin']}><AdminTrainings /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allow={['org_admin']}><AdminOrgProfile /></ProtectedRoute>} />

      {/* Super admin */}
      <Route path="/super" element={<ProtectedRoute allow={['super_admin']}><SuperDashboard /></ProtectedRoute>} />
      <Route path="/super/organizations" element={<ProtectedRoute allow={['super_admin']}><SuperOrganizations /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
