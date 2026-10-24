import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Send, Inbox } from 'lucide-react';
import { messagesApi, usersApi } from '../services/api';
import { AvatarInitials } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadInbox();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (userId) {
      loadConversation(userId);
      pollRef.current = setInterval(() => loadConversation(userId, true), 4000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadInbox = async () => {
    try {
      const res = await messagesApi.getInbox();
      const list = res.data || [];
      setInbox(list);
      if (currentUser && (!userId || String(userId) === String(currentUser.id)) && list.length > 0) {
        navigate(`/messages/${list[0].userId}`, { replace: true });
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const loadConversation = async (id, silent = false) => {
    try {
      const [msgRes, userRes] = await Promise.all([
        messagesApi.getConversation(id),
        usersApi.getById(id),
      ]);
      setMessages(msgRes.data || []);
      setChatUser(userRes.data);
      if (!silent) loadInbox();
    } catch (err) { console.error(err); }
  };

  const isSelf = currentUser && String(userId) === String(currentUser.id);

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSelf) {
      toast.error('Cannot message yourself');
      return;
    }
    const content = (newMessage || '').trim();
    if (!content || !userId) return;
    setSending(true);
    try {
      await messagesApi.send(userId, content);
      setNewMessage('');
      loadConversation(userId, true);
      loadInbox();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const makeAvatarUser = (data) => ({
    id: data.userId || data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    profilePicture: data.profilePicture,
  });

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px', height: 'calc(100vh - 85px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', flex: 1, minHeight: 0, background: 'var(--bg-card)',
        borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden'
      }}>
        {/* Sidebar - Inbox */}
        <div style={{
          width: 320, borderRight: '1px solid var(--border)', display: 'flex',
          flexDirection: 'column', flexShrink: 0
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageCircle size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Messaging</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 30, textAlign: 'center' }}><div className="spinner" /></div>
            ) : inbox.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ fontSize: 14 }}>No conversations yet</p>
                <p style={{ fontSize: 12 }}>Connect with people to start messaging</p>
              </div>
            ) : inbox.map(item => (
              <Link key={item.userId} to={`/messages/${item.userId}`} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                textDecoration: 'none', borderBottom: '1px solid var(--border)',
                background: String(userId) === String(item.userId) ? 'var(--bg-hover)' : 'transparent',
                transition: 'background 0.2s'
              }}>
                <AvatarInitials user={makeAvatarUser(item)} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {item.firstName} {item.lastName}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatTime(item.lastMessageTime)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{
                      margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160
                    }}>
                      {item.lastMessage}
                    </p>
                    {item.unreadCount > 0 && (
                      <span style={{
                        background: 'var(--accent)', color: '#fff', borderRadius: 10,
                        padding: '1px 7px', fontSize: 11, fontWeight: 700
                      }}>{item.unreadCount}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {!userId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <MessageCircle size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p style={{ fontSize: 18, fontWeight: 600 }}>Select a conversation</p>
              <p style={{ fontSize: 14 }}>or start a new one from someone's profile</p>
            </div>
          ) : isSelf ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>This is your own profile</h3>
              <p style={{ fontSize: 14, maxWidth: 380, lineHeight: 1.5, margin: 0 }}>
                You cannot message yourself. Connect with alumni in the Alumni directory or click <strong>Ask Referral</strong> on any job post to start chatting!
              </p>
              <Link to="/alumni" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                Browse Alumni Directory
              </Link>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              {chatUser && (
                <div style={{
                  padding: '12px 20px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
                }}>
                  <Link to={`/profile/${chatUser.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <AvatarInitials user={chatUser} size={38} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {chatUser.firstName} {chatUser.lastName}
                      </h4>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                        {chatUser.jobTitle}{chatUser.company ? ` at ${chatUser.company}` : ''}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <p>Start a conversation with {chatUser?.firstName}!</p>
                  </div>
                ) : messages.map(msg => {
                  const isMine = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: 16,
                        background: isMine ? 'var(--accent)' : 'var(--bg-hover)',
                        color: isMine ? '#fff' : 'var(--text-primary)',
                        borderBottomRightRadius: isMine ? 4 : 16,
                        borderBottomLeftRadius: isMine ? 16 : 4,
                      }}>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                        <p style={{
                          margin: '4px 0 0', fontSize: 10,
                          color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                          textAlign: 'right'
                        }}>{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Icebreakers */}
              <div style={{
                padding: '8px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
                display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center'
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>💡 Quick icebreakers:</span>
                {[
                  "Hi! Would love to connect and learn about your role.",
                  "Great seeing you here! Open for a quick coffee chat?",
                  "Could you share any advice for breaking into your company?",
                  "Congratulations on your recent achievements!"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewMessage(prompt);
                    }}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 12, padding: '4px 10px', fontSize: 11, color: 'var(--text-secondary)',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} style={{
                padding: '12px 16px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: 8, flexShrink: 0, background: 'var(--bg-card)'
              }}>
                <input
                  id="chat-message-input"
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="Type a message or pick an icebreaker..."
                  style={{
                    flex: 1, padding: '10px 16px', border: '1px solid var(--border)',
                    borderRadius: 24, fontSize: 14, background: 'var(--bg-primary)',
                    color: 'var(--text-primary)', outline: 'none'
                  }}
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || !newMessage.trim()}
                  style={{ borderRadius: 24, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
