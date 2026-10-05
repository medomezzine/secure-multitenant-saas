import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

export default function SuperDashboard() {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    client.get('/organizations').then((res) => setOrgs(res.data.organizations));
  }, []);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Tableau de bord Verdanova</h1>
          <p>Vue d'ensemble de toutes les organisations sur la plateforme.</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="num">{orgs.length}</div>
          <div className="lbl">Organisations actives</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Organisations</h3>
        {orgs.map((o) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: o.logo_color, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13,
            }}>
              {o.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{o.type}</div>
            </div>
          </div>
        ))}
        <Link to="/super/organizations" style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600, display: 'inline-block', marginTop: 12 }}>
          Gérer les organisations →
        </Link>
      </div>
    </div>
  );
}
