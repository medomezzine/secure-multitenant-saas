import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const load = () => client.get('/forum').then((res) => setPosts(res.data.posts));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    await client.post('/forum', { content });
    setContent('');
    setPosting(false);
    load();
  };

  const remove = async (id) => {
    await client.delete(`/forum/${id}`);
    load();
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Forum de discussion</h1>
          <p>Échangez avec les autres membres de votre organisation.</p>
        </div>
      </div>

      <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
        <textarea
          className="input"
          rows={3}
          placeholder="Partagez quelque chose avec la communauté…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ resize: 'vertical', marginBottom: 12 }}
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={posting}>
          {posting ? 'Publication…' : 'Publier'}
        </button>
      </form>

      {posts.length === 0 && <div className="empty-state">Aucune publication pour le moment. Soyez le premier à écrire !</div>}

      {posts.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: p.author_color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
              }}>
                {p.author_name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.author_name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.created_at}</div>
              </div>
            </div>
            {(user.role !== 'member' || p.user_id === user.id) && (
              <button className="btn btn-outline btn-sm" onClick={() => remove(p.id)}>Supprimer</button>
            )}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{p.content}</p>
        </div>
      ))}
    </div>
  );
}
