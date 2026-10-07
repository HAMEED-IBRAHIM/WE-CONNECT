import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Search, PlusCircle, Clock, ExternalLink, Trash2 } from 'lucide-react';
import { jobsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { AvatarInitials } from '../components/Navbar';

export default function JobsPage() {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  return (
    <div className="container page-wrapper">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h1 className="text-3xl mb-sm" style={{ color: 'var(--primary)' }}>Job Board</h1>
          <p className="text-secondary-color text-lg">Find opportunities shared by our alumni network</p>
        </div>
        {isAuthenticated && (user?.role === 'ROLE_ALUMNI' || isAdmin) && (
          <Link to="/jobs/new" className="btn btn-primary">
            <PlusCircle size={18} /> Post a Job
          </Link>
        )}
      </div>

      <div className="card mb-lg" style={{ padding: 'var(--space-md)' }}>
        <form onSubmit={handleSearch} className="search-bar" style={{ margin: 0, width: '100%' }}>
          <Search size={20} className="text-muted" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Briefcase size={32} /></div>
          <h3>No jobs found</h3>
          <p className="text-secondary-color mt-sm">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {jobs.map(job => (
            <div key={job.id} className="card flex-col">
              <div className="card-body flex-1">
                <div className="flex justify-between items-start mb-md">
                  <div>
                    <h3 className="text-xl mb-xs">{job.title}</h3>
                    <div className="flex items-center gap-sm text-secondary-color font-medium">
                      <Briefcase size={16} /> {job.company}
                    </div>
                  </div>
                  <span className="badge badge-accent">{job.type}</span>
                </div>

                <div className="flex items-center gap-lg text-sm text-muted mb-md">
                  {job.location && (
                    <div className="flex items-center gap-xs">
                      <MapPin size={14} /> {job.location}
                    </div>
                  )}
                  <div className="flex items-center gap-xs">
                    <Clock size={14} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <p className="text-secondary-color text-sm mb-md" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>

                <div className="divider" style={{ margin: '16px 0' }} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="avatar avatar-sm">
                      <AvatarInitials name={job.author.name} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{job.author.name}</div>
                      <div className="text-xs text-muted">{job.author.jobTitle}</div>
                    </div>
                  </div>

                  <div className="flex gap-sm">
                    {(isAdmin || user?.id === job.author.id) && (
                      <button onClick={() => handleDelete(job.id)} className="btn btn-icon btn-danger" title="Delete job">
                        <Trash2 size={16} />
                      </button>
                    )}
                    {job.applyLink && (
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        Apply <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            Prev
          </button>
          <span className="text-sm font-medium">Page {page + 1} of {totalPages}</span>
          <button
            className="pagination-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
