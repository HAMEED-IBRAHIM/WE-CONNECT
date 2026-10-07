import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase, MapPin, GraduationCap, Link2,
  CheckCircle, Clock, XCircle, Edit2, Upload, AlertCircle
} from 'lucide-react';
import { usersApi, postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';


const VERIFICATION_INFO = {
  NOT_SUBMITTED: { label: 'Not Verified', icon: <AlertCircle size={14} />, class: 'badge-muted' },
  PENDING: { label: 'Verification Pending', icon: <Clock size={14} />, class: 'badge-warning' },
  APPROVED: { label: 'Verified Alumni', icon: <CheckCircle size={14} />, class: 'badge-success' },
  REJECTED: { label: 'Verification Rejected', icon: <XCircle size={14} />, class: 'badge-danger' },
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(0);
  const [postsTotalPages, setPostsTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [docUrl, setDocUrl] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const isOwner = currentUser?.id === parseInt(id);

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await usersApi.getById(id);
      setProfile(data);
      setEditForm({
        bio: data.bio || '',
        graduationYear: data.graduationYear || '',
        degree: data.degree || '',
        department: data.department || '',
        company: data.company || '',
        jobTitle: data.jobTitle || '',
        linkedInUrl: data.linkedInUrl || '',
        location: data.location || '',
      });
    } catch {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadPosts = useCallback(async (page = 0) => {
    setPostsLoading(true);
    try {
      const { data } = await postsApi.getByUser(id, { page, size: 6 });
      setPosts(data.content || []);
      setPostsTotalPages(data.totalPages || 0);
      setPostsPage(page);
    } finally {
      setPostsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
    loadPosts(0);
  }, [id, loadProfile, loadPosts]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await usersApi.updateProfile(editForm);
      setProfile(prev => ({ ...prev, ...data }));
      setEditing(false);
      toast.success('Profile updated!');
      if (isOwner) refreshUser();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!docUrl.trim()) { toast.error('Please enter document URL'); return; }
    setSubmittingDoc(true);
    try {
      await usersApi.submitVerification(docUrl);
      toast.success('Verification submitted!');
      loadProfile();
      refreshUser();
    } catch {
      toast.error('Submission failed');
    } finally {
      setSubmittingDoc(false);
    }
  };

  if (loading) return <div className="loading-center" style={{ height: '60vh' }}><div className="spinner" /></div>;
  if (!profile) return <div className="container page-wrapper"><div className="empty-state">User not found</div></div>;

  const verInfo = VERIFICATION_INFO[profile.verificationStatus] || VERIFICATION_INFO.NOT_SUBMITTED;
  const roleLabel = profile.role === 'ROLE_ALUMNI' ? 'Alumni' : profile.role === 'ROLE_ADMIN' ? 'Admin' : 'Student';
  const roleBadgeClass = profile.role === 'ROLE_ALUMNI' ? 'badge-accent' : profile.role === 'ROLE_ADMIN' ? 'badge-warning' : 'badge-primary';

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Cover + Avatar */}
        <div style={{
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          height: 180,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', bottom: -40, left: 28,
            width: 96, height: 96,
            borderRadius: '50%',
            border: '4px solid var(--bg-base)',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
          }}>
            <AvatarInitials user={profile} size={88} />
          </div>
        </div>

        {/* Profile main card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
          padding: 'var(--space-xl)',
          paddingTop: 56,
          marginBottom: 'var(--space-xl)',
        }}>
          <div className="flex justify-between items-start flex-wrap gap-md">
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                {profile.verificationStatus === 'APPROVED' && (
                  <CheckCircle size={20} style={{ marginLeft: 8, color: 'var(--accent)', verticalAlign: 'middle' }} />
                )}
              </h1>
              <div className="flex items-center gap-sm flex-wrap mb-sm">
                <span className={`badge ${roleBadgeClass}`}>{roleLabel}</span>
                <span className={`badge ${verInfo.class}`}>
                  {verInfo.icon} {verInfo.label}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>@{profile.username}</div>
            </div>
            {isOwner && (
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(!editing)}
              >
                <Edit2 size={15} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing ? (
            <div style={{ marginTop: 24 }}>
              <div className="grid grid-2" style={{ gap: 12 }}>
                {[
                  { key: 'jobTitle', label: 'Job Title', placeholder: 'Software Engineer' },
                  { key: 'company', label: 'Company', placeholder: 'Google' },
                  { key: 'department', label: 'Department', placeholder: 'Computer Science' },
                  { key: 'graduationYear', label: 'Graduation Year', placeholder: '2022' },
                  { key: 'degree', label: 'Degree', placeholder: 'B.Sc. Computer Science' },
                  { key: 'location', label: 'Location', placeholder: 'New York, USA' },
                  { key: 'linkedInUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      className="form-input"
                      placeholder={f.placeholder}
                      value={editForm[f.key]}
                      onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Tell your story..."
                    value={editForm.bio}
                    onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-sm mt-md">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner spinner-sm" /> : 'Save Changes'}
                </button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              {profile.bio && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-md">
                {profile.jobTitle && (
                  <div className="flex items-center gap-xs text-secondary-color text-sm">
                    <Briefcase size={15} /> {profile.jobTitle}{profile.company && ` at ${profile.company}`}
                  </div>
                )}
                {profile.department && (
                  <div className="flex items-center gap-xs text-secondary-color text-sm">
                    <GraduationCap size={15} /> {profile.department}{profile.graduationYear && ` · ${profile.graduationYear}`}
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-xs text-secondary-color text-sm">
                    <MapPin size={15} /> {profile.location}
                  </div>
                )}
                {profile.linkedInUrl && (
                  <a
                    href={profile.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs text-sm"
                    style={{ color: '#0a66c2' }}
                  >
                    <Link2 size={15} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Verification submit (alumni who haven't submitted or been rejected) */}
          {isOwner && profile.role === 'ROLE_ALUMNI' &&
            ['NOT_SUBMITTED', 'REJECTED'].includes(profile.verificationStatus) && (
            <div className="alert alert-info mt-md">
              <div style={{ flex: 1 }}>
                <strong>Get Verified!</strong> Submit your graduation document to get the verified badge.
                <div className="flex gap-sm mt-sm">
                  <input
                    className="form-input"
                    placeholder="Link to graduation certificate / document"
                    value={docUrl}
                    onChange={e => setDocUrl(e.target.value)}
                    style={{ fontSize: 13, padding: '8px 12px' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSubmitVerification}
                    disabled={submittingDoc}
                  >
                    <Upload size={14} /> Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            Posts ({profile.postCount || 0})
          </button>
          <button className={`tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
            About
          </button>
        </div>

        {activeTab === 'posts' && (
          <div>
            {postsLoading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p style={{ color: 'var(--text-muted)' }}>No posts yet</p>
                {isOwner && (
                  <Link to="/create-post" className="btn btn-primary mt-md">
                    Create First Post
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {posts.map(p => (
                    <PostCard key={p.id} post={p} onDelete={(pid) => setPosts(prev => prev.filter(x => x.id !== pid))} />
                  ))}
                </div>
                {postsTotalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" disabled={postsPage === 0} onClick={() => loadPosts(postsPage - 1)}>‹</button>
                    <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: 14 }}>
                      {postsPage + 1} / {postsTotalPages}
                    </span>
                    <button className="pagination-btn" disabled={postsPage === postsTotalPages - 1} onClick={() => loadPosts(postsPage + 1)}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>Profile Information</h3>
              <div className="grid grid-2">
                {[
                  { label: 'Department', value: profile.department },
                  { label: 'Degree', value: profile.degree },
                  { label: 'Graduation Year', value: profile.graduationYear },
                  { label: 'Company', value: profile.company },
                  { label: 'Job Title', value: profile.jobTitle },
                  { label: 'Location', value: profile.location },
                  { label: 'Member Since', value: profile.createdAt && new Date(profile.createdAt).toLocaleDateString() },
                ].filter(i => i.value).map(i => (
                  <div key={i.label}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{i.label}</div>
                    <div style={{ color: 'var(--text-primary)' }}>{i.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
