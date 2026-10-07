import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'ROLE_STUDENT', label: 'Student', desc: 'Currently enrolled or recent graduate' },
  { value: 'ROLE_ALUMNI', label: 'Alumni', desc: 'Graduated and in the workforce' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '',
    email: '', password: '', role: 'ROLE_STUDENT',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name required';
    if (!form.lastName.trim()) errs.lastName = 'Last name required';
    if (!form.username.trim()) errs.username = 'Username required';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Only letters, numbers, underscores';
    if (!form.email.trim()) errs.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) setErrors(errData.errors);
      else toast.error(errData?.message || 'Registration failed');
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
    }}>
      <div style={{
        position: 'fixed', top: '10%', right: '15%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 500 }} className="animate-slide">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', textDecoration: 'none',
          }}>
            <GraduationCap size={28} style={{ color: '#6366f1', WebkitTextFillColor: 'initial' }} />
            AlumniConnect
          </Link>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 15 }}>
            Create your account
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ROLES.map(r => (
                  <div
                    key={r.value}
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    style={{
                      padding: '12px 16px',
                      border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: form.role === r.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: form.role === r.value ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-input"
                  name="firstName"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  className="form-input"
                  name="username"
                  placeholder="john_doe"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  className="form-input"
                  name="email"
                  type="email"
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
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
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
              style={{ width: '100%', padding: 14, fontSize: 16, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
