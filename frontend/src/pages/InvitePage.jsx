import React, { useState } from 'react';
import { Share2, Mail, Copy, Check, Link as LinkIcon, Users, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function InvitePage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const inviteLink = `${window.location.origin}/register?ref=${user?.id || 'invite'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hey! Join me on WE-CONNECT, an exclusive alumni networking platform. Sign up here: ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(inviteLink);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleSendInvites = async (e) => {
    e.preventDefault();
    const emailList = emails.split(/[,;\n]/).map(e => e.trim()).filter(e => e && e.includes('@'));
    if (emailList.length === 0) {
      toast.error('Please enter at least one valid email');
      return;
    }
    setSending(true);
    // Simulate sending (backend email service would go here)
    await new Promise(r => setTimeout(r, 1500));
    setSentCount(prev => prev + emailList.length);
    toast.success(`Invited ${emailList.length} people!`);
    setEmails('');
    setPersonalNote('');
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Share2 size={28} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Invite Your Network</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            Grow WE-CONNECT by inviting alumni, classmates, and colleagues
          </p>
        </div>
      </div>

      {/* Stats */}
      {sentCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <Users size={24} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            You have invited {sentCount} people this session!
          </span>
        </div>
      )}

      {/* Shareable Link */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
        padding: 24, marginBottom: 24
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <LinkIcon size={18} style={{ color: 'var(--accent)' }} />
          Your Personal Invite Link
        </h3>
        <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: 13 }}>
          Share this link on WhatsApp, Instagram, or anywhere!
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" readOnly value={inviteLink}
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 13, background: 'var(--bg-primary)',
              color: 'var(--text-primary)', fontFamily: 'monospace'
            }}
          />
          <button className="btn btn-primary" onClick={handleCopy}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button onClick={handleShareWhatsApp} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#25D366', color: '#fff', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            Share on WhatsApp
          </button>
          <button onClick={handleShareLinkedIn} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#0077B5', color: '#fff', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            Share on LinkedIn
          </button>
        </div>
      </div>

      {/* Email Invites */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
        padding: 24
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={18} style={{ color: 'var(--accent)' }} />
          Invite via Email
        </h3>
        <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
          Enter the email addresses of people you know (separated by commas)
        </p>
        <form onSubmit={handleSendInvites}>
          <textarea
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder="friend1@gmail.com, colleague@company.com, classmate@university.edu"
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)',
              color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          <textarea
            value={personalNote}
            onChange={e => setPersonalNote(e.target.value)}
            placeholder="Add a personal note (optional): Hey! Check out this amazing alumni platform..."
            rows={2}
            style={{
              width: '100%', padding: '12px 14px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 14, background: 'var(--bg-primary)',
              color: 'var(--text-primary)', resize: 'vertical', marginTop: 10,
              fontFamily: 'inherit', boxSizing: 'border-box'
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !emails.trim()}
            style={{ marginTop: 12, padding: '10px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            {sending ? 'Sending...' : <><Send size={16} /> Send Invitations</>}
          </button>
        </form>
      </div>
    </div>
  );
}
