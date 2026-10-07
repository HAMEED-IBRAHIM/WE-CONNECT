import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { usersApi } from '../services/api';
import UserCard from '../components/UserCard';

export default function UsersListPage({ roleFilter }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const isAlumniPage = roleFilter === 'ROLE_ALUMNI';

  const fetchUsers = useCallback(async (p = 0, q = '') => {
    setLoading(true);
    try {
      const { data } = await usersApi.search({
        query: q || undefined,
        role: roleFilter,
        page: p,
        size: 12,
        sortBy,
        sortDir: 'desc',
      });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, sortBy]);

  useEffect(() => { fetchUsers(0, search); }, [search, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            {isAlumniPage ? (
              <><span className="grad-text-accent">Alumni</span> Network</>
            ) : (
              <><span className="grad-text">Student</span> Community</>
            )}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            {isAlumniPage
              ? `Connect with ${totalElements.toLocaleString()} verified graduates across industries`
              : `Meet ${totalElements.toLocaleString()} students shaping the future`}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-md mb-xl flex-wrap items-center">
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 280 }}>
            <div className="search-bar">
              <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                placeholder={isAlumniPage
                  ? 'Search by name, company, department...'
                  : 'Search by name, department...'}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSearchInput(''); setSearch(''); }}
                >✕</button>
              )}
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </div>
          </form>

          <div className="flex gap-sm items-center">
            <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(0); }}
              style={{ padding: '10px 14px', width: 'auto', minWidth: 140 }}
            >
              <option value="createdAt">Newest First</option>
              <option value="firstName">Name (A-Z)</option>
              {isAlumniPage && <option value="graduationYear">Graduation Year</option>}
            </select>
          </div>
        </div>

        {/* Results info */}
        {search && (
          <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-muted)' }}>
            Showing results for <strong style={{ color: 'var(--text-primary)' }}>"{search}"</strong>
            {' '}— {totalElements} found
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="loading-center" style={{ height: 300 }}>
            <div className="spinner" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h3 style={{ marginBottom: 8 }}>No {isAlumniPage ? 'alumni' : 'students'} found</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {search ? 'Try a different search term' : 'No profiles yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-auto">
              {users.map(u => <UserCard key={u.id} user={u} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={page === 0}
                  onClick={() => fetchUsers(page - 1, search)}
                >‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      className={`pagination-btn ${p === page ? 'active' : ''}`}
                      onClick={() => fetchUsers(p, search)}
                    >{p + 1}</button>
                  );
                })}
                <button
                  className="pagination-btn"
                  disabled={page === totalPages - 1}
                  onClick={() => fetchUsers(page + 1, search)}
                >›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
