import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Users, BookOpen, Zap } from 'lucide-react';
import { postsApi } from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

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

  useEffect(() => { fetchPosts(0, search); }, [search, fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setTotalElements(prev => prev - 1);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Hero */}
        {!isAuthenticated && (
          <div className="hero-section" style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: '99px',
              fontSize: 13, color: 'var(--primary-light)', marginBottom: 20,
              fontWeight: 500,
            }}>
              <Zap size={14} />
              The Alumni Network That Grows With You
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 900, marginBottom: 16 }}>
              Connect with <span className="grad-text">Alumni</span> &<br />
              <span className="grad-text-accent">Shape Your Future</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 32px' }}>
              Join thousands of students and alumni sharing knowledge, opportunities, and connections.
            </p>
            <div className="flex justify-center gap-md flex-wrap">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join for Free
              </Link>
              <Link to="/alumni" className="btn btn-secondary btn-lg">
                <Users size={18} /> Browse Alumni
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: 32, justifyContent: 'center',
              marginTop: 48, flexWrap: 'wrap',
            }}>
              {[
                { label: 'Alumni', value: '10K+', color: '#6366f1' },
                { label: 'Students', value: '25K+', color: '#8b5cf6' },
                { label: 'Posts', value: '50K+', color: '#06b6d4' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
          <div className="search-bar">
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder="Search posts, topics, #tags..."
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

        {/* Info bar */}
        <div className="flex items-center justify-between mb-md">
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {search ? (
              <>Showing results for <strong style={{ color: 'var(--text-primary)' }}>"{search}"</strong> — {totalElements} posts</>
            ) : (
              <><TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {totalElements} posts in the community</>
            )}
          </div>
          {isAuthenticated && (
            <Link to="/create-post" className="btn btn-primary btn-sm">
              + New Post
            </Link>
          )}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={36} />
            </div>
            <h3 style={{ marginBottom: 8 }}>
              {search ? 'No posts found' : 'No posts yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different search' : 'Be the first to share something!'}
            </p>
            {isAuthenticated && (
              <Link to="/create-post" className="btn btn-primary mt-md">
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </div>

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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      className={`pagination-btn ${p === page ? 'active' : ''}`}
                      onClick={() => fetchPosts(p, search)}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                <button
                  className="pagination-btn"
                  onClick={() => fetchPosts(page + 1, search)}
                  disabled={page === totalPages - 1}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
