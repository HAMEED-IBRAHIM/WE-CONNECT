import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, Send, Check, X, MessageCircle } from 'lucide-react';
import { connectionsApi } from '../services/api';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';

export default function MyNetworkPage() {
  const [tab, setTab] = useState('connections');
  const [accepted, setAccepted] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a, p, s] = await Promise.all([
        connectionsApi.getAccepted(),
        connectionsApi.getPending(),
        connectionsApi.getSent(),
      ]);
      setAccepted(a.data);
      setPending(p.data);
      setSent(s.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await connectionsApi.acceptRequest(connectionId);
      toast.success('Connection accepted!');
      loadAll();
    } catch { toast.error('Failed to accept'); }
  };

  const handleReject = async (connectionId) => {
    try {
      await connectionsApi.rejectRequest(connectionId);
      toast.success('Request declined');
      loadAll();
    } catch { toast.error('Failed to decline'); }
  };

  const tabs = [
    { key: 'connections', label: 'Connections', icon: UserCheck, count: accepted.length },
    { key: 'pending', label: 'Pending', icon: Clock, count: pending.length },
    { key: 'sent', label: 'Sent', icon: Send, count: sent.length },
  ];

  const PersonCard = ({ person, actions }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderBottom: '1px solid var(--border)',
      transition: 'background 0.2s',
    }}>
      <Link to={`/profile/${person.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flex: 1 }}>
        <AvatarInitials firstName={person.firstName} lastName={person.lastName} size={48} />
        <div>
          <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>
            {person.firstName} {person.lastName}
          </h4>
          <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            {person.jobTitle}{person.company ? ` at ${person.company}` : ''}
          </p>
          {person.department && (
            <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
              {person.department}
            </p>
          )}
        </div>
      </Link>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {actions}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Users size={28} style={{ color: 'var(--accent)' }} />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>My Network</h1>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 0, background: 'var(--bg-card)', borderRadius: 12,
        border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer',
            background: tab === t.key ? 'var(--accent)' : 'transparent',
            color: tab === t.key ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, transition: 'all 0.2s',
          }}>
            <t.icon size={16} />
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.key ? 'rgba(255,255,255,0.3)' : 'var(--accent)',
                color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 12,
                fontWeight: 700, minWidth: 20, textAlign: 'center'
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : tab === 'connections' ? (
          accepted.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <UserCheck size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 16 }}>No connections yet</p>
              <p style={{ fontSize: 13 }}>Start networking by visiting the Alumni directory!</p>
            </div>
          ) : accepted.map(c => (
            <PersonCard key={c.connectionId} person={c.user} actions={
              <Link to={`/messages/${c.user.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={14} /> Message
              </Link>
            } />
          ))
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 16 }}>No pending requests</p>
            </div>
          ) : pending.map(c => (
            <PersonCard key={c.connectionId} person={c.user} actions={<>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => handleAccept(c.connectionId)}>
                <Check size={14} /> Accept
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => handleReject(c.connectionId)}>
                <X size={14} /> Decline
              </button>
            </>} />
          ))
        ) : (
          sent.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Send size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 16 }}>No sent requests</p>
            </div>
          ) : sent.map(c => (
            <PersonCard key={c.connectionId} person={c.user} actions={
              <span style={{ padding: '8px 16px', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Awaiting response...
              </span>
            } />
          ))
        )}
      </div>
    </div>
  );
}
