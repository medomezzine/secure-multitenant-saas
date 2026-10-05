import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const isAdmin = user.role === 'org_admin' || user.role === 'super_admin';
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [content, setContent] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => client.get('/messages').then((res) => setMessages(res.data.messages));
  useEffect(() => {
    load();
    if (isAdmin) client.get('/users').then((res) => setMembers(res.data.users));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    await client.post('/messages', { content, receiver_id: receiverId ? Number(receiverId) : null });
    setContent('');
    setSending(false);
    load();
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Messagerie</h1>
          <p>{isAdmin ? 'Répondez aux membres ou diffusez un message à tous.' : "Contactez l'administration de votre organisation."}</p>
        </div>
      </div>

      <form onSubmit={submit} className="card" style={{ marginBottom: 24 }}>
        {isAdmin && (
          <div className="field">
            <label className="label">Destinataire</label>
            <select className="input" value={receiverId} onChange={(e) => setReceiverId(e.target.value)}>
              <option value="">Tous les membres (diffusion)</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}
        <textarea
          className="input"
          rows={3}
          placeholder="Votre message…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ resize: 'vertical', marginBottom: 12 }}
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={sending}>
          {sending ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>

      {messages.length === 0 && <div className="empty-state">Aucun message.</div>}

      {messages.map((m) => (
        <div key={m.id} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{m.sender_name}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{m.created_at}</span>
          </div>
          <p style={{ fontSize: 14, margin: 0 }}>{m.content}</p>
          {!m.receiver_id && <span className="badge badge-paid" style={{ marginTop: 8 }}>Diffusion</span>}
        </div>
      ))}
    </div>
  );
}
