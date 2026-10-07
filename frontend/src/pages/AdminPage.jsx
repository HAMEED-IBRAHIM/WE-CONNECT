import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckCircle, XCircle,
  Shield, Trash2, RefreshCw, Eye, ChevronRight,
  GraduationCap, BookOpen, AlertTriangle
} from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewNote, setReviewNote] = useState({});
  const [processing, setProcessing] = useState({});
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadStats();
    loadPending(0);
    loadUsers(0);
  }, [isAdmin, navigate]);

  const loadStats = async () => {
    try {
      const { data } = await adminApi.getStats();
      setStats(data);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async (p = 0) => {
    try {
      const { data } = await adminApi.getPendingVerifications({ page: p, size: 10 });
      setPending(data.content || []);
      setPendingTotalPages(data.totalPages || 0);
      setPendingPage(p);
    } catch {
      toast.error('Failed to load verifications');
    }
  };

  const loadUsers = async (p = 0, query = '') => {
    try {
      const { data } = await adminApi.getAllUsers({ page: p, size: 10, query: query || undefined });
      setAllUsers(data.content || []);
      setUsersTotalPages(data.totalPages || 0);
      setUsersPage(p);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const handleReview = async (userId, approved) => {
    const note = reviewNote[userId] || '';
    setProcessing(p => ({ ...p, [userId]: true }));
    try {
      await adminApi.reviewVerification(userId, { approved, note });
      toast.success(`Verification ${approved ? 'approved' : 'rejected'}`);
      loadPending(pendingPage);
      loadStats();
    } catch {
      toast.error('Review failed');
    } finally {
      setProcessing(p => ({ ...p, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user @${username}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted');
      loadUsers(usersPage, userSearch);
      loadStats();
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="loading-center" style={{ height: '60vh' }}><div className="spinner" /></div>;

  const roleColor = {
    ROLE_STUDENT: '#6366f1',
    ROLE_ALUMNI: '#06b6d4',
    ROLE_ADMIN: '#f59e0b',
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="flex items-center gap-md mb-xl">
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'rgba(245,158,11,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Manage users, verify alumni, monitor platform activity
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { loadStats(); loadPending(0); }} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-4 mb-xl">
            <StatCard icon={<Users size={22} />} label="Total Users" value={stats.totalUsers} color="#6366f1" />
            <StatCard icon={<GraduationCap size={22} />} label="Alumni" value={stats.totalAlumni} color="#06b6d4" subtitle={`${stats.approvedAlumni} verified`} />
            <StatCard icon={<BookOpen size={22} />} label="Students" value={stats.totalStudents} color="#8b5cf6" />
            <StatCard icon={<AlertTriangle size={22} />} label="Pending Reviews" value={stats.pendingVerifications} color="#f59e0b" />
          </div>
        )}

        {/* More stats row */}
        {stats && (
          <div className="grid grid-3 mb-xl">
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>TOTAL POSTS</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary-light)' }}>{stats.totalPosts}</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>APPROVED ALUMNI</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>{stats.approvedAlumni}</div>
            </div>
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>REJECTED VERIFICATIONS</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--danger)' }}>{stats.rejectedVerifications}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Pending Verifications {stats?.pendingVerifications > 0 && (
              <span className="badge badge-warning" style={{ marginLeft: 8 }}>{stats.pendingVerifications}</span>
            )}
          </button>
          <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            All Users
          </button>
        </div>

        {/* Pending Verifications Tab */}
        {activeTab === 'overview' && (
          <div>
            {pending.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <CheckCircle size={36} style={{ color: 'var(--success)' }} />
                </div>
                <h3>All caught up!</h3>
                <p style={{ color: 'var(--text-muted)' }}>No pending verifications</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(u => (
                  <div key={u.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start gap-md">
                        <AvatarInitials user={u} size={48} />
                        <div className="flex-1">
                          <div className="flex items-center gap-sm flex-wrap mb-xs">
                            <span style={{ fontWeight: 700, fontSize: 16 }}>{u.fullName}</span>
                            <span className="badge badge-accent">Alumni</span>
                            <span className="badge badge-warning">
                              <Clock size={11} /> Pending
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                            @{u.username} · {u.email}
                          </div>
                          {u.department && (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                              {u.department} {u.graduationYear && `· Class of ${u.graduationYear}`}
                            </div>
                          )}
                          {u.verificationSubmittedAt && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              Submitted {formatDistanceToNow(new Date(u.verificationSubmittedAt), { addSuffix: true })}
                            </div>
                          )}
                          {u.verificationDocument && (
                            <a
                              href={u.verificationDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-sm mt-sm"
                              style={{ display: 'inline-flex', fontSize: 12 }}
                            >
                              <Eye size={13} /> View Document
                            </a>
                          )}
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/profile/${u.id}`)}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Note input */}
                      <div className="mt-md">
                        <input
                          className="form-input"
                          placeholder="Add a note (optional)..."
                          value={reviewNote[u.id] || ''}
                          onChange={e => setReviewNote(p => ({ ...p, [u.id]: e.target.value }))}
                          style={{ fontSize: 13 }}
                        />
                      </div>

                      {/* Approve/Reject buttons */}
                      <div className="flex gap-sm mt-md">
                        <button
                          className="btn btn-success"
                          onClick={() => handleReview(u.id, true)}
                          disabled={processing[u.id]}
                        >
                          {processing[u.id] ? <span className="spinner spinner-sm" /> : <><CheckCircle size={15} /> Approve</>}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReview(u.id, false)}
                          disabled={processing[u.id]}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingTotalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" disabled={pendingPage === 0} onClick={() => loadPending(pendingPage - 1)}>‹</button>
                    <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: 14 }}>
                      {pendingPage + 1} / {pendingTotalPages}
                    </span>
                    <button className="pagination-btn" disabled={pendingPage === pendingTotalPages - 1} onClick={() => loadPending(pendingPage + 1)}>›</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Search users */}
            <div className="flex gap-md mb-lg">
              <div className="search-bar" style={{ flex: 1 }}>
                <input
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers(0, userSearch)}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => loadUsers(0, userSearch)}
                >Search</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allUsers.map(u => (
                <div key={u.id} className="card">
                  <div className="card-body" style={{ padding: 'var(--space-md)' }}>
                    <div className="flex items-center gap-md">
                      <AvatarInitials user={u} size={40} />
                      <div className="flex-1">
                        <div className="flex items-center gap-sm">
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</span>
                          <span className="badge" style={{
                            background: `${roleColor[u.role]}20`,
                            color: roleColor[u.role],
                            border: `1px solid ${roleColor[u.role]}40`,
                          }}>
                            {u.role === 'ROLE_ALUMNI' ? 'Alumni' : u.role === 'ROLE_ADMIN' ? 'Admin' : 'Student'}
                          </span>
                          {u.verificationStatus === 'APPROVED' && (
                            <span className="badge badge-success">✓ Verified</span>
                          )}
                          {u.verificationStatus === 'PENDING' && (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          @{u.username} · {u.email}
                          {u.department && ` · ${u.department}`}
                        </div>
                      </div>
                      <div className="flex gap-sm">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/profile/${u.id}`)}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(u.id, u.username)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {usersTotalPages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" disabled={usersPage === 0} onClick={() => loadUsers(usersPage - 1, userSearch)}>‹</button>
                <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: 14 }}>
                  {usersPage + 1} / {usersTotalPages}
                </span>
                <button className="pagination-btn" disabled={usersPage === usersTotalPages - 1} onClick={() => loadUsers(usersPage + 1, userSearch)}>›</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
