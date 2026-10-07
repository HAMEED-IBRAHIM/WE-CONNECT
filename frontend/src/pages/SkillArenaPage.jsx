import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Medal, Star, Zap, Target, TrendingUp,
  Crown, Award, Users, ChevronRight, Flame, Code2,
  Brain, Cpu, Globe, Lock, Play, Clock, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';

// ─── Mock data (replace with API calls once backend is ready) ─────────────────
const MOCK_LEADERBOARD = [
  { rank: 1, id: '1', firstName: 'Arjun', lastName: 'Mehta', jobTitle: 'Sr. Software Engineer', company: 'Google', department: 'Computer Science', score: 4850, badge: 'Grandmaster', streak: 14, skills: ['DSA', 'System Design', 'Java'] },
  { rank: 2, id: '2', firstName: 'Priya', lastName: 'Sharma', jobTitle: 'Product Manager', company: 'Microsoft', department: 'Information Technology', score: 4210, badge: 'Master', streak: 9, skills: ['Product', 'Strategy', 'Analytics'] },
  { rank: 3, id: '3', firstName: 'Rahul', lastName: 'Desai', jobTitle: 'Management Consultant', company: 'McKinsey', department: 'Mechanical Engineering', score: 3980, badge: 'Expert', streak: 7, skills: ['Consulting', 'Finance', 'Strategy'] },
  { rank: 4, id: '4', firstName: 'Vikram', lastName: 'Singh', jobTitle: 'Quant Analyst', company: 'Goldman Sachs', department: 'Electrical Engineering', score: 3640, badge: 'Expert', streak: 5, skills: ['Quant', 'ML', 'Python'] },
  { rank: 5, id: '5', firstName: 'Sneha', lastName: 'Reddy', jobTitle: 'SDE II', company: 'Amazon', department: 'Computer Science', score: 3420, badge: 'Advanced', streak: 4, skills: ['AWS', 'Backend', 'Distributed Systems'] },
  { rank: 6, id: '6', firstName: 'Kavya', lastName: 'Nair', jobTitle: 'Data Scientist', company: 'Meta', department: 'Statistics', score: 3100, badge: 'Advanced', streak: 3, skills: ['ML', 'Python', 'Statistics'] },
  { rank: 7, id: '7', firstName: 'Rohan', lastName: 'Gupta', jobTitle: 'Student', company: '', department: 'Mechanical Engineering', score: 2800, badge: 'Intermediate', streak: 6, skills: ['Robotics', 'CAD', 'C++'] },
  { rank: 8, id: '8', firstName: 'Ayesha', lastName: 'Khan', jobTitle: 'Student', company: '', department: 'Computer Science', score: 2650, badge: 'Intermediate', streak: 4, skills: ['React', 'Node.js', 'Python'] },
  { rank: 9, id: '9', firstName: 'Dev', lastName: 'Patel', jobTitle: 'Student', company: '', department: 'Electronics', score: 2100, badge: 'Beginner', streak: 2, skills: ['VLSI', 'Arduino', 'Python'] },
  { rank: 10, id: '10', firstName: 'Meera', lastName: 'Iyer', jobTitle: 'Student', company: '', department: 'Computer Science', score: 1900, badge: 'Beginner', streak: 1, skills: ['Python', 'ML Basics'] },
];

const TOURNAMENTS = [
  {
    id: 1,
    title: 'DSA Championship — Season 4',
    description: 'Compete in Data Structures & Algorithms challenges. 3 rounds, increasing difficulty.',
    category: 'DSA',
    icon: <Code2 size={24} />,
    participants: 142,
    maxParticipants: 200,
    startDate: '2026-10-12',
    duration: '3 days',
    prize: '₹10,000 + Certificate',
    status: 'upcoming',
    difficulty: 'Hard',
    color: '#003366',
  },
  {
    id: 2,
    title: 'System Design Showdown',
    description: 'Design scalable systems under time pressure. Judged by industry experts from top MNCs.',
    category: 'System Design',
    icon: <Cpu size={24} />,
    participants: 89,
    maxParticipants: 100,
    startDate: '2026-10-09',
    duration: '1 day',
    prize: 'Internship Fast-track at Zepto',
    status: 'live',
    difficulty: 'Expert',
    color: '#D4AF37',
  },
  {
    id: 3,
    title: 'ML & AI Hackathon',
    description: 'Build an AI-powered application in 48 hours. Recruiters from leading AI companies will judge.',
    category: 'Machine Learning',
    icon: <Brain size={24} />,
    participants: 67,
    maxParticipants: 150,
    startDate: '2026-10-19',
    duration: '48 hours',
    prize: '₹25,000 + Mentorship',
    status: 'upcoming',
    difficulty: 'Medium',
    color: '#15803d',
  },
  {
    id: 4,
    title: 'Web Dev Sprint',
    description: 'Build the most impressive full-stack app in 6 hours. Open to all skill levels.',
    category: 'Web Development',
    icon: <Globe size={24} />,
    participants: 203,
    maxParticipants: 500,
    startDate: '2026-10-08',
    duration: '6 hours',
    prize: 'Featured on AlumniConnect + Swag',
    status: 'live',
    difficulty: 'Beginner-friendly',
    color: '#7c3aed',
  },
];

const SKILL_GAMES = [
  {
    id: 1,
    title: 'Speed Coding Duel',
    description: 'Race head-to-head to solve coding problems faster than your opponent.',
    icon: '⚡',
    category: 'DSA',
    players: '1v1',
    avgTime: '8 min',
    playersOnline: 34,
    xpReward: 150,
    locked: false,
  },
  {
    id: 2,
    title: 'Algorithm Puzzle',
    description: 'Fill in the blanks in tricky algorithm implementations against the clock.',
    icon: '🧩',
    category: 'DSA',
    players: 'Solo',
    avgTime: '5 min',
    playersOnline: 78,
    xpReward: 80,
    locked: false,
  },
  {
    id: 3,
    title: 'System Design Quiz',
    description: 'Answer expert-level system design MCQs with timed rounds.',
    icon: '🏗️',
    category: 'System Design',
    players: 'Solo',
    avgTime: '10 min',
    playersOnline: 21,
    xpReward: 120,
    locked: false,
  },
  {
    id: 4,
    title: 'Debug the Code',
    description: 'Find and fix bugs in broken code snippets under time pressure.',
    icon: '🐛',
    category: 'General',
    players: 'Solo',
    avgTime: '7 min',
    playersOnline: 45,
    xpReward: 100,
    locked: false,
  },
  {
    id: 5,
    title: 'Team Capture the Flag',
    description: 'Cybersecurity challenge — solve security puzzles as a team.',
    icon: '🚩',
    category: 'Cybersecurity',
    players: '5v5',
    avgTime: '45 min',
    playersOnline: 12,
    xpReward: 500,
    locked: true,
  },
  {
    id: 6,
    title: 'ML Model Battle',
    description: 'Train a ML model on the same dataset. Best accuracy wins.',
    icon: '🤖',
    category: 'Machine Learning',
    players: '1v1',
    avgTime: '20 min',
    playersOnline: 8,
    xpReward: 300,
    locked: true,
  },
];

const BADGE_CONFIG = {
  Grandmaster: { color: '#ff6b35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)', icon: <Crown size={14} /> },
  Master: { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.3)', icon: <Medal size={14} /> },
  Expert: { color: '#003366', bg: 'rgba(0,51,102,0.1)', border: 'rgba(0,51,102,0.3)', icon: <Star size={14} /> },
  Advanced: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)', icon: <Trophy size={14} /> },
  Intermediate: { color: '#15803d', bg: 'rgba(21,128,61,0.1)', border: 'rgba(21,128,61,0.3)', icon: <Award size={14} /> },
  Beginner: { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', icon: <Target size={14} /> },
};

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

// ─── Components ───────────────────────────────────────────────────────────────
function BadgePill({ badge }) {
  const cfg = BADGE_CONFIG[badge] || BADGE_CONFIG['Beginner'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.icon} {badge}
    </span>
  );
}

function LeaderboardRow({ entry, currentUserId }) {
  const isTop3 = entry.rank <= 3;
  const isCurrentUser = entry.id === currentUserId;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: entry.rank * 0.04 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 20px',
        background: isCurrentUser ? 'rgba(0,51,102,0.05)' : isTop3 ? 'rgba(212,175,55,0.04)' : 'white',
        borderBottom: '1px solid var(--border)',
        borderLeft: isCurrentUser ? '3px solid var(--primary)' : '3px solid transparent',
        transition: 'background 0.2s',
      }}
      whileHover={{ backgroundColor: '#f8fafc' }}
    >
      {/* Rank */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: isTop3 ? 18 : 15,
        background: isTop3 ? rankColors[entry.rank - 1] : '#f1f5f9',
        color: isTop3 ? 'white' : 'var(--text-muted)',
        boxShadow: isTop3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
      }}>
        {isTop3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank}
      </div>

      {/* Avatar */}
      <AvatarInitials user={entry} size={40} />

      {/* Name & info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to={`/profile/${entry.id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>
            {entry.firstName} {entry.lastName}
          </Link>
          <BadgePill badge={entry.badge} />
          {isCurrentUser && <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>YOU</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {entry.jobTitle}{entry.company ? ` @ ${entry.company}` : ''} · {entry.department}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {entry.skills.map(s => (
            <span key={s} style={{ fontSize: 10, padding: '1px 8px', borderRadius: 999, background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 600 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{entry.score.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP Points</div>
        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, marginTop: 2 }}>
          <Flame size={12} style={{ verticalAlign: 'middle' }} /> {entry.streak} day streak
        </div>
      </div>
    </motion.div>
  );
}

function TournamentCard({ t }) {
  const [joined, setJoined] = useState(false);
  const { isAuthenticated } = useAuth();
  const pct = (t.participants / t.maxParticipants) * 100;

  const handleJoin = () => {
    if (!isAuthenticated) { toast.error('Sign in to join!'); return; }
    if (joined) { toast('Already registered!'); return; }
    setJoined(true);
    toast.success(`🏆 Registered for "${t.title}"!`);
  };

  return (
    <motion.div
      className="card"
      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
      style={{ overflow: 'visible', cursor: 'default' }}
    >
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${t.color}15`, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.color}30` }}>
            {t.icon}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge" style={{
                padding: '2px 10px', fontSize: 10, fontWeight: 700, borderRadius: 999,
                background: t.status === 'live' ? 'rgba(239,68,68,0.1)' : 'rgba(0,51,102,0.1)',
                color: t.status === 'live' ? '#dc2626' : 'var(--primary)',
                border: `1px solid ${t.status === 'live' ? 'rgba(239,68,68,0.3)' : 'rgba(0,51,102,0.3)'}`,
              }}>
                {t.status === 'live' ? '🔴 LIVE' : `📅 ${t.startDate}`}
              </span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: 'var(--text-muted)', fontWeight: 600 }}>
                {t.difficulty}
              </span>
            </div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={13} /> {t.duration}
        </span>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{t.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{t.description}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={13} /> {t.participants} / {t.maxParticipants}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>🎁 {t.prize}</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 999, marginBottom: 16 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: t.color, borderRadius: 999, transition: 'width 1s ease' }} />
        </div>

        <button
          onClick={handleJoin}
          className="btn btn-primary"
          style={{
            width: '100%', justifyContent: 'center',
            background: joined ? '#15803d' : undefined,
          }}
        >
          {joined ? <><CheckCircle size={16} /> Registered</> : t.status === 'live' ? <><Play size={16} /> Join Now</> : 'Register for Free'}
        </button>
      </div>
    </motion.div>
  );
}

function GameCard({ game }) {
  const { isAuthenticated } = useAuth();
  const handlePlay = () => {
    if (!isAuthenticated) { toast.error('Sign in to play!'); return; }
    if (game.locked) { toast.error('Unlock by reaching Expert rank!'); return; }
    toast.success(`🎮 Loading ${game.title}...`);
  };

  return (
    <motion.div
      className="card"
      whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
      onClick={handlePlay}
    >
      {game.locked && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, gap: 8,
        }}>
          <Lock size={28} color="var(--text-muted)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Reach Expert rank to unlock</span>
        </div>
      )}
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{game.icon}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{game.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{game.description}</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 600 }}>👥 {game.players}</span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 600 }}>⏱ ~{game.avgTime}</span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,51,102,0.08)', color: 'var(--primary)', fontWeight: 700 }}>+{game.xpReward} XP</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
            🟢 {game.playersOnline} online now
          </span>
          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); handlePlay(); }}>
            <Play size={14} /> Play
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SkillArenaPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('weekly');

  const myEntry = MOCK_LEADERBOARD.find(e => e.rank === 8); // Simulated current user

  const filteredBoard = filter === 'all'
    ? MOCK_LEADERBOARD
    : MOCK_LEADERBOARD.filter(e => e.department?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #003366 0%, #002244 60%, #001133 100%)',
        padding: '60px 0 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Zap size={32} color="#D4AF37" />
              <h1 style={{ color: 'white', fontSize: 36, fontWeight: 900, margin: 0 }}>Skill Arena</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, maxWidth: 600, lineHeight: 1.6 }}>
              Compete, rank up, and get noticed by top recruiters. The most advanced skill competition platform for alumni.
            </p>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'Active Competitors', value: '2,847', icon: <Users size={16} /> },
                { label: 'Live Tournaments', value: '2', icon: <Trophy size={16} /> },
                { label: 'Skill Games', value: '6+', icon: <Zap size={16} /> },
                { label: 'Recruiters Watching', value: '89', icon: <TrendingUp size={16} /> },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ color: '#D4AF37', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 24 }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 64, zIndex: 100 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { id: 'leaderboard', label: '🏆 Weekly Leaderboard', icon: <Trophy size={16} /> },
              { id: 'tournaments', label: '⚔️ Tournaments', icon: <Medal size={16} /> },
              { id: 'games', label: '🎮 Skill Games', icon: <Zap size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <AnimatePresence mode="wait">

          {/* LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <motion.div key="lb" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>Weekly Rankings</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['weekly', 'monthly', 'all-time'].map(t => (
                    <button key={t} onClick={() => setTimeframe(t)}
                      className={`btn btn-sm ${timeframe === t ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <select className="form-select" style={{ width: 200 }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Electrical">Electrical Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
              </div>

              {/* Current user banner */}
              {isAuthenticated && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,51,102,0.08), rgba(212,175,55,0.06))',
                    border: '1px solid rgba(0,51,102,0.15)',
                    borderRadius: 12, padding: '16px 20px', marginBottom: 24,
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}
                >
                  <AvatarInitials user={user || myEntry} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>Your Rank This Week</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Play skill games and win tournaments to move up!</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>#8</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#D4AF37' }}>2,650</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP Points</div>
                  </div>
                  <BadgePill badge="Intermediate" />
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('games')}>
                    <Zap size={14} /> Earn XP
                  </button>
                </motion.div>
              )}

              {/* Leaderboard list */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                  <span style={{ width: 36, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>#</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Competitor</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>XP / Streak</span>
                </div>
                {filteredBoard.map(entry => <LeaderboardRow key={entry.id} entry={entry} currentUserId={user?.id?.toString()} />)}
              </div>
            </motion.div>
          )}

          {/* TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <motion.div key="tournaments" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: 0 }}>Active Tournaments</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Win to earn XP, prizes, and recruiter attention</p>
                </div>
              </div>
              <div className="grid grid-2">
                {TOURNAMENTS.map(t => <TournamentCard key={t.id} t={t} />)}
              </div>
            </motion.div>
          )}

          {/* SKILL GAMES */}
          {activeTab === 'games' && (
            <motion.div key="games" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Skill Games</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Play daily to earn XP and climb the weekly leaderboard</p>
              </div>

              {/* XP how it works */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,51,102,0.05), rgba(212,175,55,0.05))',
                border: '1px solid rgba(0,51,102,0.12)',
                borderRadius: 12, padding: '16px 20px', marginBottom: 28,
                display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center',
              }}>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>How XP Works:</div>
                {[['Play a game', '+50-500 XP'], ['Win a tournament', '+1000+ XP'], ['Daily streak', '+25 XP/day'], ['Help others', '+10 XP']].map(([a, b]) => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#15803d" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a}</span>
                    <strong style={{ fontSize: 13, color: 'var(--primary)' }}>{b}</strong>
                  </div>
                ))}
              </div>

              <div className="grid grid-3">
                {SKILL_GAMES.map(g => <GameCard key={g.id} game={g} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
