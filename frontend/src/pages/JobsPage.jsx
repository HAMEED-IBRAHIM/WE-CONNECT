import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, MapPin, Search, PlusCircle, Clock, 
  ExternalLink, Trash2, Send, CheckCircle, Sparkles, DollarSign
} from 'lucide-react';
import { jobsApi, messagesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { AvatarInitials } from '../components/Navbar';

const FILTER_TAGS = ['All', 'Google', 'Microsoft', 'Netflix', 'Amazon', 'Flipkart', 'Swiggy', 'Full-time', 'Internship'];

export default function JobsPage() {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [requestingReferral, setRequestingReferral] = useState(null);

  const fetchJobs = useCallback(async (p = 0, q = '') => {
    try {
      setLoading(true);
      const { data } = await jobsApi.getAll({
        query: q || undefined,
        page: p,
        size: 10,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(0, search);
  }, [search, fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleFilterClick = (tag) => {
    setActiveFilter(tag);
    const q = tag === 'All' ? '' : tag;
    setSearch(q);
    setSearchInput(q);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsApi.delete(id);
      toast.success('Job deleted successfully');
      fetchJobs(page, search);
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleRequestReferral = async (job) => {
    if (!isAuthenticated) {
      toast('Please sign in to request a referral', { icon: '🔒' });
      navigate('/login');
      return;
    }
    if (user?.id === job.author?.id) {
      toast('You are the author of this post!');
      return;
    }
    setRequestingReferral(job.id);
    try {
      const msg = `Hi ${job.author?.firstName || 'there'}! I saw your post for the "${job.title}" role at ${job.company}. I would love to connect and discuss if you could provide a referral!`;
      await messagesApi.send(job.author.id, msg);
      toast.success(`Referral request sent to ${job.author.firstName}! Check Messages.`, { duration: 4000 });
    } catch {
      toast.error('Could not send referral request');
    } finally {
      setRequestingReferral(null);
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-lg flex-wrap gap-md">
        <div>
          <h1 className="text-3xl mb-xs" style={{ color: 'var(--primary)', fontWeight: 800 }}>
            Alumni Career Hub & Job Board
          </h1>
          <p className="text-secondary-color text-md" style={{ margin: 0 }}>
            Verified hiring opportunities, direct internal referrals, and tech openings across India & Global
          </p>
        </div>
        {isAuthenticated && (user?.role === 'ROLE_ALUMNI' || isAdmin) && (
          <Link to="/jobs/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusCircle size={18} /> Post an Opening
          </Link>
        )}
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="card mb-lg" style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSearch} className="search-bar" style={{ margin: 0, width: '100%', marginBottom: 12 }}>
          <Search size={18} className="text-muted" />
          <input
            type="text"
            placeholder="Search by job title, company (Google, Netflix, Swiggy), or tech stack..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearchInput(''); setSearch(''); }}
            >
              ✕
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleFilterClick(tag)}
              style={{
                padding: '6px 14px', borderRadius: 999, border: '1px solid',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                borderColor: activeFilter === tag ? 'var(--primary)' : 'var(--border)',
                background: activeFilter === tag ? 'var(--primary)' : 'transparent',
                color: activeFilter === tag ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-center" style={{ minHeight: 300 }}>
          <div className="spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <div className="empty-state-icon"><Briefcase size={36} /></div>
          <h3 style={{ margin: '12px 0 6px' }}>No job listings found</h3>
          <p className="text-secondary-color">Try resetting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: 20 }}>
          {jobs.map(job => {
            // Extract salary from description if present
            const salaryMatch = job.description?.match(/💰[^\n]+/);
            const salaryText = salaryMatch ? salaryMatch[0].replace('💰', '').trim() : null;
            const cleanDesc = job.description ? job.description.replace(/💰[^\n]+\n*/, '').trim() : '';

            const authorName = job.author?.fullName || (job.author?.firstName ? `${job.author.firstName} ${job.author.lastName || ''}` : 'Alumni Member');

            return (
              <div key={job.id} className="card flex-col" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="card-body flex-1" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                  
                  {/* Top: Title & Type */}
                  <div className="flex justify-between items-start mb-sm" style={{ gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-xs text-secondary-color font-medium" style={{ fontSize: 14 }}>
                        <Briefcase size={15} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                      </div>
                    </div>
                    <span className="badge badge-accent" style={{ flexShrink: 0, fontSize: 11 }}>
                      {job.type}
                    </span>
                  </div>

                  {/* Salary Pill if available */}
                  {salaryText && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(21, 128, 61, 0.1)', color: 'var(--success)',
                      border: '1px solid rgba(21, 128, 61, 0.25)', borderRadius: 6,
                      padding: '4px 10px', fontSize: 12, fontWeight: 700,
                      margin: '6px 0 10px', width: 'fit-content'
                    }}>
                      <DollarSign size={13} />
                      {salaryText}
                    </div>
                  )}

                  {/* Location & Time */}
                  <div className="flex items-center gap-md text-xs text-muted mb-sm" style={{ flexWrap: 'wrap' }}>
                    {job.location && (
                      <div className="flex items-center gap-xs">
                        <MapPin size={13} /> {job.location}
                      </div>
                    )}
                    <div className="flex items-center gap-xs">
                      <Clock size={13} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p style={{
                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                    margin: '8px 0 16px', display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-line'
                  }}>
                    {cleanDesc}
                  </p>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div className="flex items-center justify-between flex-wrap gap-sm">
                      
                      {/* Author Info */}
                      <Link to={`/profile/${job.author?.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <AvatarInitials user={job.author} size={34} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {authorName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {job.author?.jobTitle || 'Verified Alumni'}
                          </div>
                        </div>
                      </Link>

                      {/* Actions */}
                      <div className="flex gap-xs items-center">
                        {(isAdmin || user?.id === job.author?.id) && (
                          <button onClick={() => handleDelete(job.id)} className="btn btn-icon btn-danger" title="Delete job" style={{ width: 30, height: 30 }}>
                            <Trash2 size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRequestReferral(job)}
                          disabled={requestingReferral === job.id}
                          style={{ fontSize: 12, padding: '5px 10px', height: 30, gap: 4 }}
                          title="Message alumni author for internal referral"
                        >
                          <Send size={12} />
                          {requestingReferral === job.id ? 'Sending...' : 'Ask Referral'}
                        </button>

                        {job.applyLink && (
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 12, padding: '5px 12px', height: 30, gap: 4 }}
                          >
                            Apply <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 24 }}>
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ‹
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page + 1} of {totalPages}</span>
          <button
            className="pagination-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
