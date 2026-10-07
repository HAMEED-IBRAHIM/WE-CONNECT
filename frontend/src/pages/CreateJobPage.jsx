import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../services/api';
import toast from 'react-hot-toast';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    applyLink: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsApi.create(form);
      toast.success('Job posted successfully!');
      navigate('/jobs');
    } catch (err) {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-wrapper" style={{ maxWidth: 800 }}>
      <h1 className="text-3xl mb-lg">Post a Job</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="grid" style={{ gap: '20px' }}>
            <div className="form-group mb-0">
              <label className="form-label">Job Title *</label>
              <input required name="title" value={form.title} onChange={handleChange} className="form-input" placeholder="e.g. Senior Software Engineer" />
            </div>

            <div className="grid grid-2" style={{ gap: '20px' }}>
              <div className="form-group mb-0">
                <label className="form-label">Company *</label>
                <input required name="company" value={form.company} onChange={handleChange} className="form-input" placeholder="e.g. Google" />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="form-input" placeholder="e.g. Remote, Bangalore" />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Job Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="form-select">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Apply Link</label>
              <input name="applyLink" value={form.applyLink} onChange={handleChange} className="form-input" placeholder="https://..." />
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Job Description *</label>
              <textarea required name="description" value={form.description} onChange={handleChange} className="form-textarea" placeholder="Describe the role..." style={{ minHeight: 200 }} />
            </div>

            <div className="flex justify-between mt-sm">
              <button type="button" onClick={() => navigate('/jobs')} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
