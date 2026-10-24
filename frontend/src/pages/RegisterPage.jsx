import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, KeyRound, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

// ─── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ─── Animated Logo (same as Login) ───────────────────────────────────────────
const titleContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};
const letterVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 10, stiffness: 200 } },
};
const iconVariant = {
  hidden: { opacity: 0, rotate: -20, scale: 0.5 },
  visible: { opacity: 1, rotate: 0, scale: 1, transition: { type: 'spring', damping: 8, stiffness: 160 } },
};

function AnimatedLogo() {
  const letters = Array.from('WE-CONNECT');
  return (
    <motion.div
      variants={titleContainer}
      initial="hidden"
      animate="visible"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'Outfit, sans-serif', fontSize: 30, fontWeight: 900,
        color: 'var(--primary)', letterSpacing: '-0.5px',
      }}
    >
      <motion.span variants={iconVariant} style={{ display: 'inline-flex' }}>🎓</motion.span>
      {letters.map((letter, i) => (
        <motion.span key={i} variants={letterVariant} style={{ display: 'inline-block', lineHeight: 1 }}>
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ─── Role Options ─────────────────────────────────────────────────────────────
const ROLES = [
  { value: 'ROLE_STUDENT', label: '🎓 Student', desc: 'Enrolled or recent graduate' },
  { value: 'ROLE_ALUMNI', label: '💼 Alumni', desc: 'Graduated & working' },
];

// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', role: 'ROLE_STUDENT',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [devOtp, setDevOtp] = useState('');   // shown when email not configured
  const [cooldown, setCooldown] = useState(0);

  const timerRef = useRef(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCooldown = (seconds = 60) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ─── Field Change ──────────────────────────────────────────────────────────
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    // Reset verification if email changes
    if (name === 'email') { setEmailVerified(false); setOtpSent(false); setOtpInput(''); setDevOtp(''); }
  };

  // ─── Send OTP ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const email = form.email.trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email address first' }));
      return;
    }
    setOtpSending(true);
    try {
      const { data } = await authApi.sendOtp(email);
      setOtpSent(true);
      startCooldown(60);
      if (data.otp) {
        setDevOtp(data.otp);
        toast.success(`📧 OTP sent! (Dev mode — code: ${data.otp})`, { duration: 10000 });
      } else {
        toast.success('📧 Verification code sent to your email!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Try again.';
      toast.error(msg);
      if (msg.includes('already exists')) {
        setErrors(prev => ({ ...prev, email: msg }));
      }
    } finally {
      setOtpSending(false);
    }
  };

  // ─── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setOtpVerifying(true);
    try {
      await authApi.verifyOtp(form.email.trim(), otpInput);
      setEmailVerified(true);
      toast.success('✅ Email verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP code');
    } finally {
      setOtpVerifying(false);
    }
  };

  // ─── Google Sign-Up ────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const gUser = await res.json();
      if (!gUser.email) { toast.error('Could not read Google email.'); return; }

      const { data } = await authApi.googleLogin({
        email: gUser.email,
        firstName: gUser.given_name || 'User',
        lastName: gUser.family_name || '',
        picture: gUser.picture || '',
        role: form.role,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(`🎓 Welcome to WE-CONNECT, ${data.firstName}!`);
      window.location.href = '/';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-up failed. Try email registration.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleSignup = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-up was cancelled.'),
  });

  // ─── Submit Registration ───────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) errs.username = '3-20 chars, letters/numbers/underscore only';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!emailVerified) errs.email = (errs.email || '') + (errs.email ? ' — ' : '') + 'You must verify your email first';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('🎉 Account created! Welcome to WE-CONNECT!');
      window.location.href = '/';
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors(prev => ({ ...prev, email: msg }));
      if (msg.toLowerCase().includes('username')) setErrors(prev => ({ ...prev, username: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '40px var(--space-lg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,51,102,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '5%', left: '5%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: 28 }}
        >
          <Link to="/login" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <AnimatedLogo />
          </Link>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14 }}
          >
            Create your account — it's free!
          </motion.p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Google Sign-Up */}
          <button
            id="google-signup-btn"
            type="button"
            onClick={() => googleSignup()}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '12px 20px', background: 'white', border: '1.5px solid #dadce0',
              borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#3c4043',
              cursor: googleLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontFamily: 'Outfit, sans-serif',
              marginBottom: 18, opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!googleLoading) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
          >
            {googleLoading ? <span className="spinner spinner-sm" style={{ borderTopColor: '#4285f4' }} /> : <GoogleIcon />}
            {googleLoading ? 'Connecting…' : 'Sign up with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* ── Role Selector ── */}
          <div className="form-group">
            <label className="form-label">I am a…</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.role === r.value ? 'rgba(0,51,102,0.06)' : 'var(--bg-base)',
                    transition: 'all 0.18s', textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: form.role === r.value ? 'var(--primary)' : 'var(--text-primary)' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="input-wrapper">
                  <User size={15} className="input-icon" />
                  <input id="reg-firstName" className="form-input" name="firstName" placeholder="Priya" value={form.firstName} onChange={handleChange} autoComplete="given-name" style={{ borderColor: errors.firstName ? '#ef4444' : undefined }} />
                </div>
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="input-wrapper">
                  <User size={15} className="input-icon" />
                  <input id="reg-lastName" className="form-input" name="lastName" placeholder="Sharma" value={form.lastName} onChange={handleChange} autoComplete="family-name" style={{ borderColor: errors.lastName ? '#ef4444' : undefined }} />
                </div>
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}>@</span>
                <input id="reg-username" className="form-input" name="username" placeholder="priya_sharma" value={form.username} onChange={handleChange} autoComplete="username" style={{ paddingLeft: 32, borderColor: errors.username ? '#ef4444' : undefined }} />
              </div>
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>

            {/* Email + OTP */}
            <div className="form-group">
              <label className="form-label">
                Email Address
                {emailVerified && (
                  <span style={{ marginLeft: 8, color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                    ✅ Verified
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <Mail size={15} className="input-icon" />
                  <input
                    id="reg-email"
                    className="form-input"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={emailVerified}
                    autoComplete="email"
                    style={{ borderColor: errors.email ? '#ef4444' : emailVerified ? '#16a34a' : undefined }}
                  />
                </div>
                <button
                  type="button"
                  id="send-otp-btn"
                  onClick={handleSendOtp}
                  disabled={otpSending || emailVerified || cooldown > 0}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--primary)',
                    background: emailVerified ? '#dcfce7' : 'var(--primary)', color: emailVerified ? '#16a34a' : 'white',
                    fontWeight: 700, fontSize: 12, cursor: (otpSending || emailVerified || cooldown > 0) ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap', transition: 'all 0.2s', opacity: (otpSending || cooldown > 0) ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                  }}
                >
                  {emailVerified ? <CheckCircle2 size={14} /> : otpSending ? <span className="spinner spinner-sm" /> : cooldown > 0 ? <RefreshCw size={12} /> : <KeyRound size={13} />}
                  {emailVerified ? 'Verified!' : otpSending ? 'Sending…' : cooldown > 0 ? `${cooldown}s` : 'Send OTP'}
                </button>
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}

              {/* OTP Input */}
              <AnimatePresence>
                {otpSent && !emailVerified && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: 10, overflow: 'hidden' }}
                  >
                    {devOtp && (
                      <div style={{
                        padding: '8px 12px', background: '#fffbeb', border: '1px solid #fbbf24',
                        borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 8,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <AlertCircle size={13} />
                        Dev mode: your OTP is <strong style={{ fontFamily: 'monospace', letterSpacing: 2 }}>{devOtp}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        id="otp-input"
                        className="form-input"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        style={{ letterSpacing: 6, fontFamily: 'monospace', fontSize: 18, textAlign: 'center', flex: 1 }}
                      />
                      <button
                        type="button"
                        id="verify-otp-btn"
                        onClick={handleVerifyOtp}
                        disabled={otpVerifying || otpInput.length !== 6}
                        style={{
                          padding: '10px 16px', borderRadius: 10, border: 'none',
                          background: '#003366', color: 'white', fontWeight: 700, fontSize: 13,
                          cursor: (otpVerifying || otpInput.length !== 6) ? 'not-allowed' : 'pointer',
                          opacity: (otpVerifying || otpInput.length !== 6) ? 0.6 : 1,
                          flexShrink: 0, transition: 'all 0.2s',
                        }}
                      >
                        {otpVerifying ? <span className="spinner spinner-sm" /> : '✓ Verify'}
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                      Check your inbox (and spam folder). Code expires in 10 minutes.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input
                  id="reg-password"
                  className="form-input"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  style={{ paddingRight: 44, borderColor: errors.password ? '#ef4444' : undefined }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
              {form.password && (
                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: form.password.length >= i * 2
                        ? (form.password.length >= 8 ? '#16a34a' : form.password.length >= 6 ? '#f59e0b' : '#ef4444')
                        : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 6, position: 'relative' }}
              disabled={loading || !emailVerified}
            >
              {loading ? <span className="spinner spinner-sm" /> : (
                <>
                  {!emailVerified && <span style={{ marginRight: 8 }}>🔒</span>}
                  {emailVerified ? '🚀 Create My Account' : 'Verify email to continue'}
                </>
              )}
            </button>
            {!emailVerified && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                You must verify your email with OTP to register
              </p>
            )}
          </form>

          <div style={{ marginTop: 18 }}>
            <div className="divider" style={{ margin: '0 0 14px' }} />
            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 700 }}>Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
