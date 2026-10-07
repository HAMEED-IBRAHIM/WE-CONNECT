import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
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

// Route guards
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-center" style={{ height: '100vh' }}><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<AnimatedPage><FeedPage /></AnimatedPage>} />
            <Route path="/alumni" element={<AnimatedPage><UsersListPage roleFilter="ROLE_ALUMNI" /></AnimatedPage>} />
            <Route path="/students" element={<AnimatedPage><UsersListPage roleFilter="ROLE_STUDENT" /></AnimatedPage>} />
            <Route path="/jobs" element={<AnimatedPage><JobsPage /></AnimatedPage>} />
            <Route path="/skill-arena" element={<AnimatedPage><SkillArenaPage /></AnimatedPage>} />
            <Route path="/post/:id" element={<AnimatedPage><PostDetailPage /></AnimatedPage>} />
            <Route path="/profile/:id" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />

            {/* Guest-only */}
            <Route path="/login" element={<GuestRoute><AnimatedPage><LoginPage /></AnimatedPage></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><AnimatedPage><RegisterPage /></AnimatedPage></GuestRoute>} />

            {/* Authenticated */}
            <Route path="/create-post" element={<PrivateRoute><AnimatedPage><CreateEditPostPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/edit-post/:id" element={<PrivateRoute><AnimatedPage><CreateEditPostPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/jobs/new" element={<PrivateRoute><AnimatedPage><CreateJobPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/resume" element={<PrivateRoute><AnimatedPage><ResumeBuilderPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/my-network" element={<PrivateRoute><AnimatedPage><MyNetworkPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><AnimatedPage><MessagesPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/messages/:userId" element={<PrivateRoute><AnimatedPage><MessagesPage /></AnimatedPage></PrivateRoute>} />
            <Route path="/invite" element={<PrivateRoute><AnimatedPage><InvitePage /></AnimatedPage></PrivateRoute>} />

            {/* Admin-only */}
            <Route path="/admin" element={<AdminRoute><AnimatedPage><AdminPage /></AnimatedPage></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-modal)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
            error: { iconTheme: { primary: '#b91c1c', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
