import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authApi, pingBackend, startKeepAlive } from '../services/api';
import toast from 'react-hot-toast';

// ─── Google SVG Icon ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ─── Animated WE-CONNECT Letters ─────────────────────────────────────────────
const titleContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};
const letterVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.8 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 10, stiffness: 200 },
  },
};
const iconVariant = {
  hidden: { opacity: 0, rotate: -20, scale: 0.5 },
  visible: {
    opacity: 1, rotate: 0, scale: 1,
    transition: { type: 'spring', damping: 8, stiffness: 160 },
  },
};

function AnimatedLogo({ size = 32, color = 'var(--primary)', subColor = 'var(--secondary)' }) {
  const letters = Array.from('WE-CONNECT');
  return (
    <motion.div
      variants={titleContainer}
      initial="hidden"
      animate="visible"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: 'Outfit, sans-serif', fontSize: size, fontWeight: 900, color,
        letterSpacing: '-0.5px',
      }}
    >
      <motion.span variants={iconVariant} style={{ display: 'inline-flex', color: subColor }}>
        🎓
      </motion.span>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariant}
          style={{ display: 'inline-block', lineHeight: 1 }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverWarm, setServerWarm] = useState(null); // null=checking, true=warm, false=cold

  // Pre-warm the backend as soon as the login page loads
  useEffect(() => {
    const t0 = Date.now();
    pingBackend().then(() => {
      const ms = Date.now() - t0;
      setServerWarm(ms < 4000); // >4 s = was cold
    }).catch(() => setServerWarm(false));
    startKeepAlive(); // keep pinging every 9 min from now on
  }, []);

  // ─── Google Sign-In ────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const gUser = await res.json();

      if (!gUser.email) {
        toast.error('Could not get your Google email. Please try again.');
        return;
      }

      const { data } = await authApi.googleLogin({
        email: gUser.email,
        firstName: gUser.given_name || 'User',
        lastName: gUser.family_name || '',
        picture: gUser.picture || '',
        role: 'ROLE_ALUMNI',
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`Welcome to WE-CONNECT, ${data.firstName}! 🎓`);
      window.location.href = '/';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in was cancelled or failed.'),
  });

  // ─── Email/Password Login ──────────────────────────────────────────────────
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 'var(--space-lg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'fixed', top: '15%', left: '10%',
        width: 480, height: 480,
        background: 'radial-gradient(circle, rgba(0,51,102,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '10%',
        width: 360, height: 360,
        background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        
        {/* ── Animated Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          <Link to="/login" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <AnimatedLogo />
          </Link>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 15 }}
          >
            Sign in to your account
          </motion.p>
        </motion.div>

        {/* ── Cold-start banner ── */}
        <AnimatePresence>
          {serverWarm === false && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(251,191,36,0.12)',
                border: '1px solid rgba(251,191,36,0.4)',
                borderRadius: 10, padding: '10px 14px',
                marginBottom: 14, fontSize: 13,
                color: '#92400e',
              }}
            >
              <Zap size={14} style={{ color: '#d97706', flexShrink: 0 }} />
              <span>
                <strong>Server waking up…</strong> The backend was asleep on Render's free tier.
                First request takes ~30 s — please wait a moment before signing in.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={() => googleLogin()}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 12, padding: '13px 20px',
              background: 'white', border: '1.5px solid #dadce0',
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              color: '#3c4043', cursor: googleLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              fontFamily: 'Outfit, sans-serif', marginBottom: 20,
              opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!googleLoading) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#bbb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              e.currentTarget.style.borderColor = '#dadce0';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {googleLoading
              ? <span className="spinner spinner-sm" style={{ borderTopColor: '#4285f4' }} />
              : <GoogleIcon />
            }
            {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              or sign in with email
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  className="form-input"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={{ borderColor: errors.email ? '#ef4444' : undefined }}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  className="form-input"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingRight: 44, borderColor: errors.password ? '#ef4444' : undefined }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : '🔐 Sign In'}
            </button>
          </form>

          {/* Admin notice */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            marginTop: 18, padding: '11px 14px',
            background: 'rgba(0,51,102,0.04)',
            border: '1px solid rgba(0,51,102,0.12)',
            borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)',
          }}>
            <Shield size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--primary)' }}>All routes are protected.</strong> You must be signed in to access WE-CONNECT.
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="divider" style={{ margin: '0 0 14px' }} />
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              New to WE-CONNECT?{' '}
              <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                Create a free account
              </Link>
            </p>
          </div>
        </motion.div>

        {/* ── Quick Demo Chips ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 22, textAlign: 'center' }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            👇 Quick demo accounts
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: '🛡️ Admin', email: 'admin@weconnect.com', password: 'admin123' },
              { label: '👩‍💻 Priya', email: 'priya.sharma@gmail.com', password: 'password' },
              { label: '📊 Aisha', email: 'aisha.khan@gmail.com', password: 'password' },
            ].map(({ label, email, password }) => (
              <button
                key={email}
                type="button"
                onClick={() => {
                  setForm({ email, password });
                  setTimeout(() => {
                    login({ email, password })
                      .then(() => { toast.success(`Signed in as ${label}!`); navigate('/'); })
                      .catch(() => toast.error('Demo login failed — is the backend running?'));
                  }, 80);
                }}
                style={{
                  padding: '7px 14px', fontSize: 12, fontWeight: 600,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
