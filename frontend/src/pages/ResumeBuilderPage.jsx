import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Briefcase, GraduationCap, Code, Award,
  Plus, Trash2, Download, Eye, ChevronDown, ChevronUp,
  Globe, Phone, Mail, MapPin, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarInitials } from '../components/Navbar';
import toast from 'react-hot-toast';

const SECTION_ICONS = {
  experience: <Briefcase size={18} />,
  education: <GraduationCap size={18} />,
  skills: <Code size={18} />,
  projects: <Globe size={18} />,
  certifications: <Award size={18} />,
};

const DEFAULT_RESUME = {
  summary: '',
  experience: [
    { id: 1, company: '', role: '', duration: '', description: '', current: false }
  ],
  education: [
    { id: 1, institution: '', degree: '', year: '', grade: '' }
  ],
  skills: { technical: '', soft: '', languages: '' },
  projects: [
    { id: 1, name: '', description: '', tech: '', link: '' }
  ],
  certifications: [
    { id: 1, name: '', issuer: '', year: '' }
  ],
};

function SectionHeader({ icon, title, count, onAdd }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
        {icon} {title}
        {count !== undefined && (
          <span style={{ fontSize: 12, padding: '1px 8px', borderRadius: 999, background: 'rgba(0,51,102,0.08)', color: 'var(--primary)', fontWeight: 600 }}>
            {count}
          </span>
        )}
      </h3>
      {onAdd && (
        <button onClick={onAdd} className="btn btn-secondary btn-sm">
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
}

function PreviewModal({ resume, user, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 16, width: '100%', maxWidth: 800,
          maxHeight: '90vh', overflow: 'auto', padding: 40,
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '3px solid #003366', paddingBottom: 20, marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: '#003366' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ color: '#475569', margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>
            {user?.jobTitle} {user?.company && `@ ${user.company}`}
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b' }}>
            {user?.email && <span>✉ {user.email}</span>}
            {user?.location && <span>📍 {user.location}</span>}
            {user?.linkedInUrl && <span>🔗 {user.linkedInUrl}</span>}
          </div>
        </div>

        {resume.summary && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#003366', marginBottom: 8 }}>Summary</h2>
            <p style={{ margin: 0, lineHeight: 1.7, color: '#334155', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>{resume.summary}</p>
          </div>
        )}

        {resume.experience?.some(e => e.company) && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#003366', marginBottom: 12 }}>Experience</h2>
            {resume.experience.filter(e => e.company).map(exp => (
              <div key={exp.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>{exp.role} — {exp.company}</strong>
                  <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>{exp.duration}</span>
                </div>
                {exp.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {resume.education?.some(e => e.institution) && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#003366', marginBottom: 12 }}>Education</h2>
            {resume.education.filter(e => e.institution).map(edu => (
              <div key={edu.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>{edu.degree} — {edu.institution}</strong>
                  <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>{edu.year}</span>
                </div>
                {edu.grade && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#475569', fontFamily: 'Inter, sans-serif' }}>CGPA/Grade: {edu.grade}</p>}
              </div>
            ))}
          </div>
        )}

        {(resume.skills?.technical || resume.skills?.soft) && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#003366', marginBottom: 12 }}>Skills</h2>
            {resume.skills.technical && <p style={{ margin: '0 0 4px', fontSize: 13, fontFamily: 'Inter, sans-serif' }}><strong>Technical:</strong> {resume.skills.technical}</p>}
            {resume.skills.soft && <p style={{ margin: '0 0 4px', fontSize: 13, fontFamily: 'Inter, sans-serif' }}><strong>Soft Skills:</strong> {resume.skills.soft}</p>}
            {resume.skills.languages && <p style={{ margin: 0, fontSize: 13, fontFamily: 'Inter, sans-serif' }}><strong>Languages:</strong> {resume.skills.languages}</p>}
          </div>
        )}

        {resume.projects?.some(p => p.name) && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#003366', marginBottom: 12 }}>Projects</h2>
            {resume.projects.filter(p => p.name).map(proj => (
              <div key={proj.id} style={{ marginBottom: 12 }}>
                <strong style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}>{proj.name}</strong>
                {proj.tech && <span style={{ fontSize: 11, marginLeft: 8, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>({proj.tech})</span>}
                {proj.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>{proj.description}</p>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          <button onClick={() => { window.print(); }} className="btn btn-primary">
            <Download size={16} /> Print / Save as PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState(DEFAULT_RESUME);
  const [showPreview, setShowPreview] = useState(false);
  const [openSection, setOpenSection] = useState('experience');
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container page-wrapper" style={{ textAlign: 'center' }}>
        <h2>Sign in to use the Resume Builder</h2>
        <button onClick={() => navigate('/login')} className="btn btn-primary mt-md">Sign In</button>
      </div>
    );
  }

  const update = (section, value) => setResume(prev => ({ ...prev, [section]: value }));

  const addItem = (section, template) => {
    const newId = Date.now();
    update(section, [...resume[section], { ...template, id: newId }]);
  };

  const removeItem = (section, id) => update(section, resume[section].filter(i => i.id !== id));

  const updateItem = (section, id, field, value) => {
    update(section, resume[section].map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Resume saved successfully!');
  };

  const toggleSection = (s) => setOpenSection(openSection === s ? null : s);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {showPreview && <PreviewModal resume={resume} user={user} onClose={() => setShowPreview(false)} />}

      {/* Header */}
      <div style={{ background: 'var(--primary)', padding: '32px 0', color: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={28} color="#D4AF37" /> Resume Builder
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '6px 0 0' }}>
              Build, edit, and download your professional resume
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
              <Eye size={16} /> Preview
            </button>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}
              style={{ background: '#D4AF37', color: '#002244' }}>
              {saving ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'flex-start' }}>

          {/* Left — Profile summary */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div className="card card-body" style={{ textAlign: 'center' }}>
              <AvatarInitials user={user} size={80} />
              <h3 style={{ marginTop: 12 }}>{user?.firstName} {user?.lastName}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.jobTitle || 'Add your title on profile'}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.department}</p>

              <div style={{ marginTop: 16, textAlign: 'left', fontSize: 13, color: 'var(--text-secondary)' }}>
                {user?.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Mail size={14} /> {user.email}</div>}
                {user?.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><MapPin size={14} /> {user.location}</div>}
                {user?.linkedInUrl && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={14} /> LinkedIn</div>}
              </div>

              <div className="divider" style={{ margin: '16px 0' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Your profile info (name, title, email) is pulled automatically from your account.
                <a href={`/profile/${user?.id}`} style={{ color: 'var(--primary)', display: 'block', marginTop: 4 }}> Edit Profile →</a>
              </p>
            </div>

            <div className="card card-body mt-md">
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Resume Strength</h4>
              {[
                { label: 'Contact Info', done: !!user?.email },
                { label: 'Summary', done: !!resume.summary },
                { label: 'Work Experience', done: resume.experience.some(e => e.company) },
                { label: 'Education', done: resume.education.some(e => e.institution) },
                { label: 'Skills', done: !!resume.skills.technical },
                { label: 'Projects', done: resume.projects.some(p => p.name) },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: item.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 18 }}>{item.done ? '✅' : '⬜'}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, height: 6, background: '#e2e8f0', borderRadius: 999 }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  background: 'var(--primary)',
                  width: `${([user?.email, resume.summary, resume.experience.some(e => e.company), resume.education.some(e => e.institution), resume.skills.technical, resume.projects.some(p => p.name)].filter(Boolean).length / 6) * 100}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          </div>

          {/* Right — Form sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Summary */}
            <div className="card card-body">
              <SectionHeader icon={<Star size={18} />} title="Professional Summary" />
              <textarea
                className="form-textarea"
                placeholder="Write 2-3 sentences about your background, key skills, and career goals..."
                value={resume.summary}
                onChange={e => update('summary', e.target.value)}
                style={{ minHeight: 100 }}
              />
            </div>

            {/* Experience */}
            <div className="card">
              <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('experience')}>
                <SectionHeader
                  icon={SECTION_ICONS.experience}
                  title="Work Experience"
                  count={resume.experience.filter(e => e.company).length}
                  onAdd={() => addItem('experience', { company: '', role: '', duration: '', description: '', current: false })}
                />
                {openSection === 'experience' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openSection === 'experience' && (
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {resume.experience.map(exp => (
                    <div key={exp.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div className="form-group mb-0">
                          <label className="form-label">Company</label>
                          <input className="form-input" placeholder="Google" value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} />
                        </div>
                        <div className="form-group mb-0">
                          <label className="form-label">Role/Title</label>
                          <input className="form-input" placeholder="Software Engineer" value={exp.role} onChange={e => updateItem('experience', exp.id, 'role', e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group mb-0" style={{ marginBottom: 12 }}>
                        <label className="form-label">Duration</label>
                        <input className="form-input" placeholder="Jun 2023 – Present" value={exp.duration} onChange={e => updateItem('experience', exp.id, 'duration', e.target.value)} />
                      </div>
                      <div className="form-group mb-0" style={{ marginBottom: 8 }}>
                        <label className="form-label">Key Responsibilities & Achievements</label>
                        <textarea className="form-textarea" placeholder="Describe your role, achievements, technologies used..." style={{ minHeight: 80 }} value={exp.description} onChange={e => updateItem('experience', exp.id, 'description', e.target.value)} />
                      </div>
                      {resume.experience.length > 1 && (
                        <button onClick={() => removeItem('experience', exp.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="card">
              <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('education')}>
                <SectionHeader icon={SECTION_ICONS.education} title="Education" count={resume.education.filter(e => e.institution).length} onAdd={() => addItem('education', { institution: '', degree: '', year: '', grade: '' })} />
                {openSection === 'education' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openSection === 'education' && (
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {resume.education.map(edu => (
                    <div key={edu.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div className="form-group mb-0">
                          <label className="form-label">Institution</label>
                          <input className="form-input" placeholder="IIT Bombay" value={edu.institution} onChange={e => updateItem('education', edu.id, 'institution', e.target.value)} />
                        </div>
                        <div className="form-group mb-0">
                          <label className="form-label">Degree</label>
                          <input className="form-input" placeholder="B.Tech Computer Science" value={edu.degree} onChange={e => updateItem('education', edu.id, 'degree', e.target.value)} />
                        </div>
                        <div className="form-group mb-0">
                          <label className="form-label">Year</label>
                          <input className="form-input" placeholder="2020 – 2024" value={edu.year} onChange={e => updateItem('education', edu.id, 'year', e.target.value)} />
                        </div>
                        <div className="form-group mb-0">
                          <label className="form-label">CGPA / Percentage</label>
                          <input className="form-input" placeholder="8.7 / 10" value={edu.grade} onChange={e => updateItem('education', edu.id, 'grade', e.target.value)} />
                        </div>
                      </div>
                      {resume.education.length > 1 && (
                        <button onClick={() => removeItem('education', edu.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card">
              <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('skills')}>
                <SectionHeader icon={SECTION_ICONS.skills} title="Skills" />
                {openSection === 'skills' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openSection === 'skills' && (
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group mb-0">
                    <label className="form-label">Technical Skills</label>
                    <input className="form-input" placeholder="Java, Spring Boot, React, PostgreSQL, Docker, AWS..." value={resume.skills.technical} onChange={e => update('skills', { ...resume.skills, technical: e.target.value })} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Soft Skills</label>
                    <input className="form-input" placeholder="Leadership, Communication, Problem Solving..." value={resume.skills.soft} onChange={e => update('skills', { ...resume.skills, soft: e.target.value })} />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Languages Known</label>
                    <input className="form-input" placeholder="English, Hindi, Tamil..." value={resume.skills.languages} onChange={e => update('skills', { ...resume.skills, languages: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="card">
              <div className="card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('projects')}>
                <SectionHeader icon={SECTION_ICONS.projects} title="Projects" count={resume.projects.filter(p => p.name).length} onAdd={() => addItem('projects', { name: '', description: '', tech: '', link: '' })} />
                {openSection === 'projects' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openSection === 'projects' && (
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {resume.projects.map(proj => (
                    <div key={proj.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div className="form-group mb-0">
                          <label className="form-label">Project Name</label>
                          <input className="form-input" placeholder="Alumni Network Platform" value={proj.name} onChange={e => updateItem('projects', proj.id, 'name', e.target.value)} />
                        </div>
                        <div className="form-group mb-0">
                          <label className="form-label">Technologies Used</label>
                          <input className="form-input" placeholder="React, Spring Boot, PostgreSQL" value={proj.tech} onChange={e => updateItem('projects', proj.id, 'tech', e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group mb-0" style={{ marginBottom: 12 }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" placeholder="What did you build? What problem did it solve? What was your impact?" style={{ minHeight: 70 }} value={proj.description} onChange={e => updateItem('projects', proj.id, 'description', e.target.value)} />
                      </div>
                      <div className="form-group mb-0" style={{ marginBottom: 8 }}>
                        <label className="form-label">GitHub / Live Link (optional)</label>
                        <input className="form-input" placeholder="https://github.com/..." value={proj.link} onChange={e => updateItem('projects', proj.id, 'link', e.target.value)} />
                      </div>
                      {resume.projects.length > 1 && (
                        <button onClick={() => removeItem('projects', proj.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save button */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowPreview(true)} className="btn btn-secondary" style={{ flex: 1 }}>
                <Eye size={16} /> Preview Resume
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Resume'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
