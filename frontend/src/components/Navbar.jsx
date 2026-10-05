import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  dashboard: '⬚',
  members: '☷',
  forum: '✦',
  events: '◆',
  messages: '✉',
  trainings: '◈',
  profile: '◯',
  orgs: '⬢',
};

function linksForRole(role) {
  if (role === 'member') {
    return [
      { to: '/member', label: 'Tableau de bord', icon: ICONS.dashboard },
      { to: '/member/forum', label: 'Forum', icon: ICONS.forum },
      { to: '/member/events', label: 'Calendrier', icon: ICONS.events },
      { to: '/member/messages', label: 'Messagerie', icon: ICONS.messages },
      { to: '/member/profile', label: 'Mon profil', icon: ICONS.profile },
    ];
  }
  if (role === 'org_admin') {
    return [
      { to: '/admin', label: 'Tableau de bord', icon: ICONS.dashboard },
      { to: '/admin/members', label: 'Adhérents', icon: ICONS.members },
      { to: '/admin/forum', label: 'Forum', icon: ICONS.forum },
      { to: '/admin/events', label: 'Calendrier', icon: ICONS.events },
      { to: '/admin/messages', label: 'Messagerie', icon: ICONS.messages },
      { to: '/admin/trainings', label: 'Formations', icon: ICONS.trainings },
      { to: '/admin/profile', label: 'Organisation', icon: ICONS.profile },
    ];
  }
  if (role === 'super_admin') {
    return [
      { to: '/super', label: 'Tableau de bord', icon: ICONS.dashboard },
      { to: '/super/organizations', label: 'Organisations', icon: ICONS.orgs },
    ];
  }
  return [];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linksForRole(user?.role);

  return (
    <aside style={sidebarStyle}>
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={logoMark}>V</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'white' }}>
              Verdanova
            </div>
            <div style={{ fontSize: 11, color: '#9FC4CB' }}>Digitalisation des Ordres</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/member' || l.to === '/admin' || l.to === '/super'}
            style={({ isActive }) => ({
              ...navItem,
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: isActive ? 'white' : '#B9D6DA',
            })}
          >
            <span style={{ width: 18, textAlign: 'center' }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{user?.name}</div>
        <div style={{ fontSize: 12, color: '#9FC4CB', marginBottom: 12 }}>
          {user?.role === 'member' ? 'Membre' : user?.role === 'org_admin' ? 'Administrateur' : 'Super Admin'}
        </div>
        <button
          className="btn btn-outline btn-sm"
          style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          onClick={() => { logout(); navigate('/login'); }}
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

const sidebarStyle = {
  width: 240,
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #0B6E7C 0%, #08505A 100%)',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const logoMark = {
  width: 34,
  height: 34,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.18)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
};

const navItem = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: 'none',
  marginBottom: 2,
  transition: 'background 0.12s ease',
};
