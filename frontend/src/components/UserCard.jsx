import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, GraduationCap, CheckCircle, Clock, UserPlus, Check, Sparkles } from 'lucide-react';
import { AvatarInitials } from './Navbar';
import { connectionsApi, aiApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function UserCard({ user }) {
  const { user: currentUser } = useAuth();
  const [connStatus, setConnStatus] = useState('NONE');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isRequester, setIsRequester] = useState(false);
  const [connId, setConnId] = useState(null);

  useEffect(() => {
    if (currentUser?.id === user.id) {
      setLoading(false);
      return;
    }
    connectionsApi.getStatus(user.id).then(res => {
      setConnStatus(res.data.status);
      setIsRequester(res.data.isRequester);
      setConnId(res.data.connectionId);
      setLoading(false);
    }).catch(err => {
      setLoading(false);
    });
  }, [user.id, currentUser]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (connStatus === 'NONE') {
      try {
        setLoading(true);
        await connectionsApi.sendRequest(user.id);
        setConnStatus('PENDING');
        setIsRequester(true);
        toast.success('Connection request sent!');
      } catch (err) {
        toast.error('Failed to send request');
      } finally {
        setLoading(false);
      }
    } else if (connStatus === 'PENDING' && !isRequester) {
      try {
        setLoading(true);
        await connectionsApi.acceptRequest(connId);
        setConnStatus('ACCEPTED');
        toast.success('Connection accepted!');
      } catch (err) {
        toast.error('Failed to accept request');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAiIcebreaker = async (e) => {
    e.preventDefault();
    try {
      setAiLoading(true);
      const res = await aiApi.getIcebreaker(user.id);
      toast.success(res.data.message, { duration: 6000, icon: '✨' });
    } catch (err) {
      toast.error('Failed to generate AI icebreaker');
    } finally {
      setAiLoading(false);
    }
  };

  const roleLabel = user.role === 'ROLE_ALUMNI'
    ? 'Alumni'
    : user.role === 'ROLE_ADMIN'
    ? 'Admin'
    : 'Student';

  const badgeClass = user.role === 'ROLE_ALUMNI'
    ? 'badge-accent'
    : user.role === 'ROLE_ADMIN'
    ? 'badge-warning'
    : 'badge-primary';

  const gradientColors = {
    ROLE_ALUMNI: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
    ROLE_ADMIN: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    ROLE_STUDENT: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  };

  return (
    <Link to={`/profile/${user.id}`} style={{ textDecoration: 'none' }}>
      <div className="profile-card glow-card">
        <div
          className="profile-card-cover"
          style={{ background: gradientColors[user.role] || gradientColors.ROLE_STUDENT }}
        />
        <div className="profile-card-body">
          <div className="profile-card-avatar">
            <AvatarInitials user={user} size={64} />
          </div>

          <div className="flex items-center gap-xs mb-xs flex-wrap">
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </span>
            {user.verificationStatus === 'APPROVED' && (
              <CheckCircle size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            )}
          </div>

          <div className="flex items-center gap-xs mb-sm flex-wrap">
            <span className={`badge ${badgeClass}`}>{roleLabel}</span>
            {user.verificationStatus === 'PENDING' && (
              <span className="badge badge-warning">
                <Clock size={10} /> Pending
              </span>
            )}
          </div>

          {user.jobTitle && (
            <div className="flex items-center gap-xs text-sm text-secondary-color mb-xs">
              <Briefcase size={13} />
              <span className="truncate">{user.jobTitle}{user.company ? ` at ${user.company}` : ''}</span>
            </div>
          )}

          {user.department && (
            <div className="flex items-center gap-xs text-sm text-secondary-color mb-xs">
              <GraduationCap size={13} />
              <span className="truncate">{user.department}{user.graduationYear ? ` · ${user.graduationYear}` : ''}</span>
            </div>
          )}

          {user.location && (
            <div className="flex items-center gap-xs text-sm text-muted">
              <MapPin size={13} />
              <span className="truncate">{user.location}</span>
            </div>
          )}

          {user.bio && (
            <p style={{
              marginTop: 12, fontSize: 13, color: 'var(--text-secondary)',
              lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {user.bio}
            </p>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: '8px' }}>
            {currentUser?.id !== user.id && !loading && (
              <>
                <button 
                  className={`btn ${connStatus === 'ACCEPTED' ? 'btn-secondary' : connStatus === 'PENDING' ? 'btn-secondary' : 'btn-primary'}`} 
                  style={{ 
                    flex: 1, padding: '6px 0', fontSize: 14, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}
                  onClick={handleConnect}
                  disabled={loading || (connStatus === 'PENDING' && isRequester) || connStatus === 'ACCEPTED'}
                >
                  {connStatus === 'ACCEPTED' ? (
                    <><Check size={16} style={{marginRight: 6}}/> Connected</>
                  ) : connStatus === 'PENDING' ? (
                    isRequester ? 'Pending' : 'Accept'
                  ) : (
                    <><UserPlus size={16} style={{marginRight: 6}}/> Connect</>
                  )}
                </button>

                {connStatus === 'NONE' && (
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 14, display: 'flex', alignItems: 'center' }}
                    onClick={handleAiIcebreaker}
                    disabled={aiLoading}
                    title="Generate AI Icebreaker Message"
                  >
                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
