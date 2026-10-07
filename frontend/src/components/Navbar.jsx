import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Home, Users, Shield,
  LogOut, Menu, X, PlusCircle, Briefcase, Zap, FileText, Share2, MessageCircle, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Feed', icon: <Home size={16} /> },
    { to: '/alumni', label: 'Alumni', icon: <Users size={16} /> },
    { to: '/jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
    { to: '/my-network', label: 'Network', icon: <UserCheck size={16} /> },
    { to: '/messages', label: 'Messages', icon: <MessageCircle size={16} /> },
    { to: '/invite', label: 'Invite', icon: <Share2 size={16} /> },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin', icon: <Shield size={16} /> });
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <GraduationCap size={26} />
            AlumniConnect
          </Link>

          <ul className="navbar-nav">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/create-post')}
                >
                  <PlusCircle size={15} />
                  Post
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/resume')}
                >
                  <FileText size={15} />
                  Resume
                </button>
                <Link
                  to={`/profile/${user?.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <AvatarInitials user={user} size={28} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.firstName}
                  </span>
                </Link>
                <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
            <button
              className="btn btn-ghost btn-icon"
              style={{ display: 'none' }}
              id="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
          padding: 'var(--space-md)', zIndex: 999,
        }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link"
              onClick={() => setMobileOpen(false)}
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 4 }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}

export function AvatarInitials({ user, size = 40 }) {
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';
  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
  ];
  const colorIndex = user?.id ? user.id % colors.length : 0;

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.firstName}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: colors[colorIndex],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 700,
      color: 'white',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
