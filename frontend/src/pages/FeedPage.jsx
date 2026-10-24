import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, TrendingUp, Users, BookOpen, Briefcase, 
  Sparkles, CheckCircle, ExternalLink, UserPlus, 
  Send, FileText, ArrowRight, Check
} from 'lucide-react';
import { postsApi, usersApi, jobsApi, connectionsApi } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';

const DEMO_PERSONAS = [
  { name: 'Ibrahim Hameed', role: 'Founder (Admin)', email: 'admin@weconnect.com', company: 'WE-CONNECT' },
  { name: 'Priya Sharma', role: 'Senior SDE', email: 'priya.sharma@gmail.com', company: 'Google' },
  { name: 'Rahul Verma', role: 'Lead PM', email: 'rahul.verma@gmail.com', company: 'Microsoft' },
  { name: 'Aisha Khan', role: 'Data Scientist', email: 'aisha.khan@gmail.com', company: 'Netflix' },
  { name: 'Vikram Patel', role: 'CTO & Co-Founder', email: 'vikram.patel@gmail.com', company: 'HealthTech AI' },
  { name: 'Ananya Gupta', role: 'Student Intern', email: 'ananya.gupta@gmail.com', company: 'Razorpay' },
];

export default function FeedPage() {
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Sidebar widgets state
  const [suggestedAlumni, setSuggestedAlumni] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [switchingUser, setSwitchingUser] = useState(false);

  // In-feed quick post creator
  const [showComposer, setShowComposer] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('interview,career');
  const [submittingPost, setSubmittingPost] = useState(false);

  const fetchPosts = useCallback(async (p = 0, q = '') => {
    setLoading(true);
    try {
      const { data } = await postsApi.getAll({ page: p, size: 10, query: q || undefined });
      setPosts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch suggested alumni & jobs for sidebars
  useEffect(() => {
    fetchPosts(0, search);

    usersApi.search({ size: 4, role: 'ROLE_ALUMNI' }).then(res => {
      setSuggestedAlumni(res.data?.content || []);
    }).catch(() => {});

    jobsApi.getAll({ size: 3 }).then(res => {
      setFeaturedJobs(res.data?.content || []);
    }).catch(() => {});
  }, [search, fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleFilterCategory = (category, tagKeyword) => {
    setActiveCategory(category);
    setSearch(tagKeyword || '');
    setSearchInput(tagKeyword || '');
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setTotalElements(prev => prev - 1);
  };

  // Quick connect from sidebar
  const handleQuickConnect = async (alumniId) => {
    if (!isAuthenticated) {
      toast('Please sign in to connect', { icon: '🔒' });
      navigate('/login');
      return;
    }
    try {
      await connectionsApi.sendRequest(alumniId);
      setConnectedIds(prev => new Set(prev).add(alumniId));
      toast.success('Connection request sent!');
    } catch {
      toast.error('Could not send request');
    }
  };

  // Switch demo account
  const handleSwitchPersona = async (e) => {
    const email = e.target.value;
    if (!email) return;
    setSwitchingUser(true);
    try {
      await login({ email, password: 'password' });
      toast.success(`Switched account to ${DEMO_PERSONAS.find(p => p.email === email)?.name}!`);
      fetchPosts(0, search);
    } catch {
      // If admin password was admin123
      if (email === 'admin@weconnect.com') {
        try {
          await login({ email, password: 'admin123' });
          toast.success('Switched to Ibrahim Hameed (Admin)!');
          fetchPosts(0, search);
        } catch {
          toast.error('Switch failed');
        }
      } else {
        toast.error('Switch failed');
      }
    } finally {
      setSwitchingUser(false);
    }
  };

  // In-Feed Post Creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('Please add both a title and content');
      return;
    }
    setSubmittingPost(true);
    try {
      const { data } = await postsApi.create({
        title: postTitle,
        content: postContent,
        tags: postTags,
        published: true,
      });
      toast.success('Post published successfully! 🎉');
      setPosts(prev => [data, ...prev]);
      setTotalElements(prev => prev + 1);
      setPostTitle('');
      setPostContent('');
      setShowComposer(false);
    } catch {
      toast.error('Failed to create post');
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: 1280, margin: '0 auto', padding: '16px' }}>
      
      {/* 3-Column LinkedIn Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 280px) 1fr minmax(280px, 320px)',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* ================= LEFT COLUMN ================= */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* User Mini Profile Card */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{
              height: 72,
              background: 'var(--gradient-primary)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', bottom: -28, left: 20,
                borderRadius: '50%', border: '3px solid var(--bg-card)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <AvatarInitials user={user} size={56} />
              </div>
            </div>

            <div style={{ padding: '36px 18px 18px' }}>
              {isAuthenticated ? (
                <>
                  <Link to={`/profile/${user?.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                    </h3>
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                    {user?.jobTitle ? `${user.jobTitle} at ${user.company || ''}` : 'Alumni & Student Community Member'}
                  </p>
                  {user?.department && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {user.department} {user.graduationYear ? `· Class of '${user.graduationYear.slice(-2)}` : ''}
                    </p>
                  )}

                  <div style={{ margin: '16px 0', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Network Connections</span>
                      <strong style={{ color: 'var(--primary)' }}>5+</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Profile Views</span>
                      <strong style={{ color: 'var(--accent)' }}>142</strong>
                    </div>
                  </div>

                  <Link to={`/profile/${user?.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View My Profile
                  </Link>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>Welcome to WE-CONNECT</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Connect with verified graduates at Google, Microsoft, Netflix, and top startups.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link to="/register" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
                      Join Network
                    </Link>
                    <Link to="/login" className="btn btn-ghost btn-sm" style={{ justifyContent: 'center' }}>
                      Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Quick Navigation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link to="/my-network" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'background 0.2s'
              }} className="hover-nav-item">
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <span>My Network</span>
                <span className="badge badge-accent" style={{ marginLeft: 'auto', fontSize: 11 }}>Active</span>
              </Link>

              <Link to="/jobs" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'background 0.2s'
              }} className="hover-nav-item">
                <Briefcase size={16} style={{ color: 'var(--success)' }} />
                <span>Jobs & Hiring</span>
                <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: 11 }}>8 New</span>
              </Link>

              <Link to="/resume" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'background 0.2s'
              }} className="hover-nav-item">
                <FileText size={16} style={{ color: '#06b6d4' }} />
                <span>ATS Resume Builder</span>
              </Link>

              <Link to="/invite" style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'background 0.2s'
              }} className="hover-nav-item">
                <Send size={16} style={{ color: 'var(--accent)' }} />
                <span>Invite & Referral Links</span>
              </Link>
            </div>
          </div>

          {/* Quick Demo Persona Switcher (For Reviewers & Recruiters) */}
          <div className="card" style={{
            padding: '16px', background: 'linear-gradient(145deg, var(--bg-card), var(--bg-hover))',
            border: '1px solid rgba(212, 175, 55, 0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Test Persona Switcher
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
              Switch accounts instantly to test 2-way messaging, job posting, and connection requests:
            </p>
            <select
              className="form-select"
              style={{ fontSize: 12, padding: '8px 10px', width: '100%' }}
              disabled={switchingUser}
              onChange={handleSwitchPersona}
              value={user?.email || ''}
            >
              <option value="" disabled>Select Persona...</option>
              {DEMO_PERSONAS.map(p => (
                <option key={p.email} value={p.email}>
                  {p.name} ({p.company} · {p.role})
                </option>
              ))}
            </select>
          </div>

        </aside>

        {/* ================= CENTER COLUMN (MAIN FEED) ================= */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* In-Feed Post Creator */}
          {isAuthenticated && (
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AvatarInitials user={user} size={42} />
                <button
                  type="button"
                  onClick={() => setShowComposer(!showComposer)}
                  style={{
                    flex: 1, textAlign: 'left', padding: '12px 18px',
                    borderRadius: 999, border: '1px solid var(--border)',
                    background: 'var(--bg-hover)', color: 'var(--text-muted)',
                    fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  Start a post, share a hiring update, or ask for guidance...
                </button>
              </div>

              {/* Quick action buttons under prompt */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setShowComposer(true); setPostTags('hiring,jobs'); }}
                  style={{ gap: 6, fontSize: 13 }}
                >
                  <Briefcase size={16} style={{ color: 'var(--success)' }} />
                  Share Job / Hiring
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setShowComposer(true); setPostTags('interview,advice'); }}
                  style={{ gap: 6, fontSize: 13 }}
                >
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                  Career Advice
                </button>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setShowComposer(true); setPostTags('study-group,tech'); }}
                  style={{ gap: 6, fontSize: 13 }}
                >
                  <BookOpen size={16} style={{ color: '#06b6d4' }} />
                  Study Circle
                </button>
              </div>

              {/* Expandable Composer Form */}
              {showComposer && (
                <form onSubmit={handleCreatePost} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 12 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Post Headline / Title (e.g. Tips for Landing SDE Internships)"
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      style={{ fontSize: 14, fontWeight: 600 }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <textarea
                      className="form-textarea"
                      placeholder="Share your thoughts, experiences, milestones, or questions with alumni..."
                      rows={4}
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      style={{ fontSize: 14 }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tags:</span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="hiring, google, advice"
                        value={postTags}
                        onChange={e => setPostTags(e.target.value)}
                        style={{ fontSize: 12, padding: '6px 10px', width: 220 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowComposer(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={submittingPost}
                      >
                        {submittingPost ? 'Publishing...' : 'Publish Post'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Search & Topic Filters */}
          <div className="card" style={{ padding: '14px 18px' }}>
            <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
              <div className="search-bar" style={{ margin: 0, width: '100%' }}>
                <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  placeholder="Search posts, topics, #tags, alumni..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setSearchInput(''); setSearch(''); }}
                  >
                    Clear
                  </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
              </div>
            </form>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { key: 'ALL', label: 'All Updates', tag: '' },
                { key: 'HIRING', label: '💼 Hiring & Jobs', tag: 'hiring' },
                { key: 'ADVICE', label: '💡 Career & Mentorship', tag: 'interview' },
                { key: 'TECH', label: '🤖 AI & Machine Learning', tag: 'machine-learning' },
              ].map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleFilterCategory(cat.key, cat.tag)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, border: '1px solid',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    borderColor: activeCategory === cat.key ? 'var(--primary)' : 'var(--border)',
                    background: activeCategory === cat.key ? 'var(--primary)' : 'transparent',
                    color: activeCategory === cat.key ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Count Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {search ? (
                <>Filtering by <strong style={{ color: 'var(--text-primary)' }}>"{search}"</strong> ({totalElements} posts)</>
              ) : (
                <><TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Top Discussions from Verified Alumni</>
              )}
            </span>
          </div>

          {/* Post Stream */}
          {loading ? (
            <div className="card loading-center" style={{ minHeight: 240 }}>
              <div className="spinner" />
            </div>
          ) : posts.length === 0 ? (
            <div className="card empty-state" style={{ padding: '48px 24px' }}>
              <div className="empty-state-icon">
                <BookOpen size={36} />
              </div>
              <h3 style={{ marginBottom: 8 }}>No posts found</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                {search ? 'Try adjusting your search terms or filters' : 'Be the first to share an insight!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => fetchPosts(page - 1, search)}
                disabled={page === 0}
              >
                ‹
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => fetchPosts(page + 1, search)}
                disabled={page >= totalPages - 1}
              >
                ›
              </button>
            </div>
          )}
        </main>

        {/* ================= RIGHT COLUMN (RECOMMENDED & OPPORTUNITIES) ================= */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Recommended Alumni */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Alumni You May Know
              </h3>
              <Link to="/alumni" style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {suggestedAlumni.slice(0, 4).map(alumni => {
                const isSent = connectedIds.has(alumni.id);
                return (
                  <div key={alumni.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Link to={`/profile/${alumni.id}`}>
                      <AvatarInitials user={alumni} size={42} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/profile/${alumni.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                            {alumni.fullName || `${alumni.firstName} ${alumni.lastName}`}
                          </span>
                          {alumni.verificationStatus === 'APPROVED' && (
                            <CheckCircle size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          )}
                        </div>
                      </Link>
                      <p style={{ margin: '1px 0 6px', fontSize: 11, color: 'var(--text-secondary)' }} className="truncate">
                        {alumni.jobTitle} at {alumni.company}
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => handleQuickConnect(alumni.id)}
                        disabled={isSent}
                        className={`btn ${isSent ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                        style={{ padding: '4px 10px', fontSize: 11, height: 26, gap: 4 }}
                      >
                        {isSent ? (
                          <><Check size={12} /> Pending</>
                        ) : (
                          <><UserPlus size={12} /> Connect</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Opportunities Widget */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={16} style={{ color: 'var(--success)' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Featured Opportunities
                </h3>
              </div>
              <Link to="/jobs" style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>
                See All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {featuredJobs.map(job => (
                <div key={job.id} style={{
                  padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg-hover)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                    {job.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {job.company} · {job.location?.split(',')[0]}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span className="badge badge-accent" style={{ fontSize: 10, padding: '2px 6px' }}>
                      {job.type}
                    </span>
                    {job.applyLink && (
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: '3px 8px', height: 24, gap: 4 }}
                      >
                        Apply <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alumni Community Guidelines & Pulse */}
          <div className="card" style={{ padding: '16px', background: 'var(--bg-elevated)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              Alumni Pulse
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span><strong>50+</strong> active mentoring sessions this week</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--success)' }}>•</span>
                <span><strong>8</strong> direct referral links open at Google & Netflix</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--primary-light)' }}>•</span>
                <span>Cohort 3 ML Study Group kickoff on Saturday</span>
              </li>
            </ul>
          </div>

        </aside>

      </div>
    </div>
  );
}
