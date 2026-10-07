import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Animation variants for letters
const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 * i },
  }),
};

const child = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email or username is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const titleText = 'AlumniConnect';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: 'var(--space-lg)',
    }}>
      {/* Background glow - updated for professional light theme */}
      <div style={{
        position: 'fixed', top: '20%', left: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,51,102,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', right: '20%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440 }} className="animate-slide">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800,
                color: 'var(--primary)',
              }}
              variants={container}
              initial="hidden"
              animate="visible"
            >
              <GraduationCap size={32} style={{ color: 'var(--secondary)' }} />
              <span style={{ display: 'flex' }}>
                {Array.from(titleText).map((letter, index) => (
                  <motion.span key={index} variants={child} style={{ display: 'inline-block' }}>
                    {letter}
                  </motion.span>
                ))}
              </span>
            </motion.div>
          </Link>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 16 }}
          >
            Sign in to your account
          </motion.p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  className="form-input"
                  name="email"
                  type="text"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input
                  className="form-input"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: 4,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }} />

          {/* Demo credentials hint */}
          <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
            <strong>Demo:</strong> Register a new account to explore all features
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
