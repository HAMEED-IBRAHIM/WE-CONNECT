import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserCheck, Clock, Send, Check, X, MessageCircle, 
  UserPlus, CheckCircle, Sparkles 
} from 'lucide-react';
import { connectionsApi, usersApi } from '../services/api';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';

export default function MyNetworkPage() {
  const [tab, setTab] = useState('connections');
  const [accepted, setAccepted] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedIds, setConnectedIds] = useState(new Set());

  useEffect(() => { 
    loadAll(); 
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a, p, s, rec] = await Promise.all([
        connectionsApi.getAccepted(),
        connectionsApi.getPending(),
        connectionsApi.getSent(),
        usersApi.search({ size: 8, role: 'ROLE_ALUMNI' }),
      ]);
      setAccepted(a.data || []);
      setPending(p.data || []);
      setSent(s.data || []);
      setRecommended(rec.data?.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await connectionsApi.acceptRequest(connectionId);
      toast.success('Connection accepted! You can now message each other.');
      loadAll();
    } catch { 
      toast.error('Failed to accept'); 
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await connectionsApi.rejectRequest(connectionId);
      toast.success('Request declined');
      loadAll();
    } catch { 
      toast.error('Failed to decline'); 
    }
  };

  const handleConnectRecommended = async (userId) => {
    try {
      await connectionsApi.sendRequest(userId);
      setConnectedIds(prev => new Set(prev).add(userId));
      toast.success('Connection request sent!');
      loadAll();
    } catch {
      toast.error('Could not send request');
    }
  };

  const tabs = [
    { key: 'connections', label: 'My Connections', icon: UserCheck, count: accepted.length },
    { key: 'pending', label: 'Pending Invitations', icon: Clock, count: pending.length },
    { key: 'sent', label: 'Sent Requests', icon: Send, count: sent.length },
  ];

  const PersonCard = ({ person, actions }) => {
    const avatarUser = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      profilePicture: person.profilePicture,
    };

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        gap: 16
      }}>
        <Link to={`/profile/${person.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <AvatarInitials user={avatarUser} size={48} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 15, fontWeight: 700 }} className="truncate">
                {person.fullName || `${person.firstName} ${person.lastName}`}
              </h4>
              {person.verificationStatus === 'APPROVED' && (
                <CheckCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              )}
            </div>
            <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: 13 }} className="truncate">
              {person.jobTitle}{person.company ? ` at ${person.company}` : ''}
            </p>
            {person.department && (
              <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: 12 }} className="truncate">
                {person.department} {person.graduationYear ? `· '${person.graduationYear.slice(-2)}` : ''}
              </p>
            )}
          </div>
        </Link>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {actions}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Users size={28} style={{ color: 'var(--primary)' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>My Professional Network</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              Manage connections, pending alumni invitations, and grow your network
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: 0, background: 'var(--bg-card)', borderRadius: 12,
        border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24
      }}>
        {tabs.map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)} 
            style={{
              flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, transition: 'all 0.2s',
            }}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
            {t.count > 0 && (
              <span style={{
                background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'var(--primary)',
                color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 11,
                fontWeight: 700, minWidth: 20, textAlign: 'center'
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Connections List Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 36 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" /></div>
        ) : tab === 'connections' ? (
          accepted.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <UserCheck size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, margin: '0 0 6px', color: 'var(--text-primary)' }}>No connections yet</h3>
              <p style={{ fontSize: 13, margin: 0 }}>Connect with alumni below to start chatting and unlocking referrals!</p>
            </div>
          ) : accepted.map(c => (
            <PersonCard key={c.connectionId} person={c.user} actions={
              <Link to={`/messages/${c.user.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <MessageCircle size={14} /> Message
              </Link>
            } />
          ))
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, margin: '0 0 6px', color: 'var(--text-primary)' }}>No pending invitations</h3>
              <p style={{ fontSize: 13, margin: 0 }}>You're all caught up!</p>
            </div>
          ) : pending.map(c => (
            <PersonCard key={c.connectionId} person={c.user} actions={
              <>
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                  onClick={() => handleAccept(c.connectionId)}
                >
                  <Check size={14} /> Accept
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                  onClick={() => handleReject(c.connectionId)}
                >
                  <X size={14} /> Decline
                </button>
              </>
            } />
          ))
        ) : (
          sent.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Send size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, margin: '0 0 6px', color: 'var(--text-primary)' }}>No sent requests</h3>
              <p style={{ fontSize: 13, margin: 0 }}>You have no pending requests awaiting responses.</p>
            </div>
          ) : sent.map(c => (
            <PersonCard key={c.connectionId} person={c.user} actions={
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 12px', background: 'var(--bg-hover)', borderRadius: 6 }}>
                Awaiting response...
              </span>
            } />
          ))
        )}
      </div>

      {/* People You May Know / Suggested Alumni Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
              People You May Know in Tech & Engineering
            </h2>
          </div>
          <Link to="/alumni" style={{ fontSize: 13, color: 'var(--primary-light)', fontWeight: 600 }}>
            See All Alumni →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16
        }}>
          {recommended.map(person => {
            const isSent = connectedIds.has(person.id);
            const isConnected = accepted.some(a => a.user?.id === person.id);

            return (
              <div key={person.id} className="card" style={{
                padding: '16px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', borderRadius: 12
              }}>
                <Link to={`/profile/${person.id}`} style={{ textDecoration: 'none' }}>
                  <AvatarInitials user={person} size={58} />
                </Link>
                <Link to={`/profile/${person.id}`} style={{ textDecoration: 'none', marginTop: 10 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                    {person.fullName || `${person.firstName} ${person.lastName}`}
                  </h4>
                </Link>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }} className="truncate">
                  {person.jobTitle}
                </p>
                <span className="badge badge-accent" style={{ fontSize: 10, margin: '6px 0 14px' }}>
                  {person.company || 'Alumni'}
                </span>

                <div style={{ marginTop: 'auto', width: '100%' }}>
                  {isConnected ? (
                    <Link to={`/messages/${person.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                      <MessageCircle size={13} /> Message
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`btn ${isSent ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                      disabled={isSent}
                      onClick={() => handleConnectRecommended(person.id)}
                    >
                      {isSent ? (
                        <><Check size={13} /> Pending</>
                      ) : (
                        <><UserPlus size={13} /> Connect</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
