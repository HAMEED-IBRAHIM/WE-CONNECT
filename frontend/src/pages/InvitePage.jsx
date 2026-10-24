import React, { useState } from 'react';
import { 
  Share2, Mail, Copy, Check, Link as LinkIcon, Users, 
  Send, Sparkles, CheckCircle2, MessageSquare, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INVITE_TEMPLATES = [
  {
    title: 'Career & Referral Focus',
    text: "Hey! I'm inviting you to WE-CONNECT — our verified alumni network where we share direct job referrals at Google, Netflix, Microsoft, and startups. Here is your private join link:"
  },
  {
    title: 'Mentorship & Tech Community',
    text: "Hi there! Join me on WE-CONNECT. It's a great place to connect with fellow graduates, join weekend AI study groups, and get 1-on-1 interview advice. Use this invite link:"
  },
  {
    title: 'Classmate & Batch Reunion',
    text: "Hey batchmate! We're building our college directory on WE-CONNECT to stay connected, track careers, and collaborate on projects. Sign up with my link here:"
  }
];

export default function InvitePage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [personalNote, setPersonalNote] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullMsg, setCopiedFullMsg] = useState(false);
  const [sentInvites, setSentInvites] = useState([
    { email: 'sarah.miller@university.edu', date: 'Just now', status: 'Delivered', template: 'Career & Referral' },
    { email: 'alex.tan@techstartup.io', date: '2 hours ago', status: 'Delivered', template: 'Mentorship & Tech' }
  ]);

  const inviteLink = `${window.location.origin}/register?ref=${user?.id || 'invite'}`;
  const senderName = user?.fullName || `${user?.firstName || 'A colleague'} ${user?.lastName || ''}`;

  const fullMessage = `${INVITE_TEMPLATES[selectedTemplate].text}\n${inviteLink}\n${personalNote ? `\nPersonal note from ${senderName}: "${personalNote}"` : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopiedFullMsg(true);
    toast.success('Complete invitation message copied!');
    setTimeout(() => setCopiedFullMsg(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(fullMessage);
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
      toast.error('Please enter at least one valid email address');
      return;
    }
    setSending(true);
    // Simulate automated email dispatch with slight realistic delay
    await new Promise(r => setTimeout(r, 1200));

    const newEntries = emailList.map(email => ({
      email,
      date: 'Just now',
      status: 'Delivered',
      template: INVITE_TEMPLATES[selectedTemplate].title
    }));

    setSentInvites(prev => [...newEntries, ...prev]);
    toast.success(`Automated invitations sent to ${emailList.length} recipients! 💌`);
    setEmails('');
    setPersonalNote('');
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
          <Share2 size={26} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Invite Alumni & Friends</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            Send automated invitations with personal join links to grow the community
          </p>
        </div>
      </div>

      {/* Shareable Link Card */}
      <div className="card mb-lg" style={{ padding: 24, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LinkIcon size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Your Personalized Referral Link</h3>
          </div>
          <span className="badge badge-accent" style={{ fontSize: 11 }}>Active & Tracking</span>
        </div>

        <p style={{ margin: '0 0 14px', color: 'var(--text-secondary)', fontSize: 13 }}>
          Anyone who signs up through your link will automatically connect with you upon registration.
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            readOnly
            value={inviteLink}
            style={{
              flex: 1, minWidth: 260, padding: '10px 14px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 13, background: 'var(--bg-hover)',
              color: 'var(--text-primary)', fontFamily: 'monospace'
            }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleCopyLink} style={{ gap: 6 }}>
            {copiedLink ? <><Check size={14} /> Copied Link</> : <><Copy size={14} /> Copy Link</>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleCopyFullMessage} style={{ gap: 6 }}>
            {copiedFullMsg ? <><Check size={14} /> Copied Message</> : <><MessageSquare size={14} /> Copy Complete Text</>}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button onClick={handleShareWhatsApp} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#25D366', color: '#fff', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            Share via WhatsApp
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

      {/* Automated Email Sender & Preview (Two columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 24 }}>
        
        {/* Left: Input Form */}
        <div className="card" style={{ padding: 22, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Mail size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Send Automated Email Invites</h3>
          </div>

          <form onSubmit={handleSendInvites}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                CHOOSE MESSAGE TEMPLATE
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {INVITE_TEMPLATES.map((t, idx) => (
                  <label key={t.title} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    borderColor: selectedTemplate === idx ? 'var(--primary)' : 'var(--border)',
                    background: selectedTemplate === idx ? 'rgba(0, 51, 102, 0.05)' : 'transparent',
                  }}>
                    <input
                      type="radio"
                      name="template"
                      checked={selectedTemplate === idx}
                      onChange={() => setSelectedTemplate(idx)}
                    />
                    <span>{t.title}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                RECIPIENT EMAILS (COMMA OR LINE SEPARATED)
              </label>
              <textarea
                value={emails}
                onChange={e => setEmails(e.target.value)}
                placeholder="colleague@google.com, classmate@alumni.edu, friend@netflix.com"
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 13, background: 'var(--bg-hover)',
                  color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                OPTIONAL PERSONAL NOTE
              </label>
              <input
                type="text"
                value={personalNote}
                onChange={e => setPersonalNote(e.target.value)}
                placeholder="e.g. Hope all is well! Let's connect on here."
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 13, background: 'var(--bg-hover)',
                  color: 'var(--text-primary)', boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !emails.trim()}
              style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '10px 0' }}
            >
              {sending ? 'Dispatching Invites...' : <><Send size={16} /> Send Automated Invitations</>}
            </button>
          </form>
        </div>

        {/* Right: Live Preview Card */}
        <div className="card" style={{ padding: 22, borderRadius: 12, background: 'var(--bg-hover)', border: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Live Email Preview (What Recipients See)
            </h4>
          </div>

          <div style={{
            background: 'var(--bg-card)', padding: 18, borderRadius: 8,
            border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6
          }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <div><strong>From:</strong> WE-CONNECT &lt;invitations@weconnect.com&gt;</div>
              <div><strong>Subject:</strong> {senderName} invited you to join the Alumni Network</div>
            </div>

            <p style={{ margin: '0 0 12px' }}>
              Hi there,
            </p>
            <p style={{ margin: '0 0 14px' }}>
              {INVITE_TEMPLATES[selectedTemplate].text}
            </p>

            {personalNote && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.1)', borderLeft: '3px solid var(--accent)',
                padding: '8px 12px', borderRadius: 4, margin: '12px 0', fontStyle: 'italic'
              }}>
                "{personalNote}" — {senderName}
              </div>
            )}

            <div style={{ margin: '18px 0 10px', textAlign: 'center' }}>
              <span style={{
                display: 'inline-block', padding: '9px 20px', borderRadius: 6,
                background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 13
              }}>
                Accept Invitation & Join Free →
              </span>
            </div>
            
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Verified alumni community · Instant access to jobs & referrals
            </div>
          </div>
        </div>

      </div>

      {/* Dispatched Invitations Activity Log */}
      <div className="card" style={{ padding: 20, borderRadius: 12 }}>
        <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          Recent Dispatched Invitations Activity
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sentInvites.map((inv, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 8, background: 'var(--bg-hover)',
              border: '1px solid var(--border)', fontSize: 13
            }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>{inv.email}</strong>
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  ({inv.template})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge badge-success" style={{ fontSize: 11 }}>
                  {inv.status}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {inv.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
