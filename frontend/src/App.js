import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AnimatedPage from './components/AnimatedPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import CreateEditPostPage from './pages/CreateEditPostPage';
import UsersListPage from './pages/UsersListPage';
import AdminPage from './pages/AdminPage';
import JobsPage from './pages/JobsPage';
import CreateJobPage from './pages/CreateJobPage';
import SkillArenaPage from './pages/SkillArenaPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import MyNetworkPage from './pages/MyNetworkPage';
import MessagesPage from './pages/MessagesPage';
import InvitePage from './pages/InvitePage';
import { startKeepAlive } from './services/api';

// Start pinging the backend immediately to prevent Render cold starts
startKeepAlive();

// ─── Full spinner while auth loads ───────────────────────────────────────────
function AuthLoader() {
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, border: '4px solid var(--border)',
        borderTop: '4px solid var(--primary)',
        borderRadius: '50%', animation: 'spin 0.9s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Outfit,sans-serif' }}>
        Loading WE-CONNECT…
      </p>
    </div>
  );
}

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** All users must be authenticated — redirect to /login otherwise */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Admin-only routes */
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

/** Guest-only routes (login/register redirect authenticated users to feed) */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AuthLoader />;

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'main-content' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* ── Guest-only (unauthenticated) ─────────────────────────── */}
            <Route path="/login" element={
              <GuestRoute><AnimatedPage><LoginPage /></AnimatedPage></GuestRoute>
            } />
            <Route path="/register" element={
              <GuestRoute><AnimatedPage><RegisterPage /></AnimatedPage></GuestRoute>
            } />

            {/* ── All remaining routes require login ───────────────────── */}
            <Route path="/" element={
              <PrivateRoute><AnimatedPage><FeedPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/alumni" element={
              <PrivateRoute><AnimatedPage><UsersListPage roleFilter="ROLE_ALUMNI" /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/students" element={
              <PrivateRoute><AnimatedPage><UsersListPage roleFilter="ROLE_STUDENT" /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/jobs" element={
              <PrivateRoute><AnimatedPage><JobsPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/jobs/new" element={
              <PrivateRoute><AnimatedPage><CreateJobPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/skill-arena" element={
              <PrivateRoute><AnimatedPage><SkillArenaPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/post/:id" element={
              <PrivateRoute><AnimatedPage><PostDetailPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/profile/:id" element={
              <PrivateRoute><AnimatedPage><ProfilePage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/create-post" element={
              <PrivateRoute><AnimatedPage><CreateEditPostPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/edit-post/:id" element={
              <PrivateRoute><AnimatedPage><CreateEditPostPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/resume" element={
              <PrivateRoute><AnimatedPage><ResumeBuilderPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/my-network" element={
              <PrivateRoute><AnimatedPage><MyNetworkPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/messages" element={
              <PrivateRoute><AnimatedPage><MessagesPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/messages/:userId" element={
              <PrivateRoute><AnimatedPage><MessagesPage /></AnimatedPage></PrivateRoute>
            } />
            <Route path="/invite" element={
              <PrivateRoute><AnimatedPage><InvitePage /></AnimatedPage></PrivateRoute>
            } />

            {/* ── Admin-only ───────────────────────────────────────────── */}
            <Route path="/admin" element={
              <AdminRoute><AnimatedPage><AdminPage /></AnimatedPage></AdminRoute>
            } />

            {/* ── Fallback: unauthenticated → /login, auth → / ─────────── */}
            <Route path="*" element={
              isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
            } />

          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Google OAuth Client ID ───────────────────────────────────────────────────
// Steps to get one:
// 1. Go to https://console.cloud.google.com
// 2. Create a project → APIs & Services → Credentials
// 3. Create OAuth 2.0 Client ID (Web application)
// 4. Add authorized origin: http://localhost:3000
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '215142261502-9a1g4ar4m8bdr68ru0v8u4ks6bagbp2e.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-modal)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'Outfit, sans-serif',
              },
              success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
              error: { iconTheme: { primary: '#b91c1c', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
