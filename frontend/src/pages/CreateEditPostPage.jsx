import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image, Tag, ArrowLeft, Send } from 'lucide-react';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CreateEditPostPage() {
  const { id } = useParams(); // if id present, editing mode
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    title: '', content: '', imageUrl: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isEdit) {
      postsApi.getById(id).then(({ data }) => {
        setForm({
          title: data.title || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
          tags: data.tags || '',
        });
        setFetchLoading(false);
      }).catch(() => {
        toast.error('Post not found');
        navigate('/');
      });
    }
  }, [id, isEdit, isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl.trim() || null,
        tags: form.tags.trim() || null,
      };
      if (isEdit) {
        await postsApi.update(id, payload);
        toast.success('Post updated!');
      } else {
        const { data } = await postsApi.create(payload);
        toast.success('Post published!');
        navigate(`/post/${data.id}`);
        return;
      }
      navigate(`/post/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading-center" style={{ height: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 760 }}>
        <button className="btn btn-ghost btn-sm mb-lg" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{isEdit ? 'Edit Post' : 'Create a Post'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
            {isEdit ? 'Update your post below' : 'Share knowledge, opportunities, or updates with the community'}
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  placeholder="What's this post about?"
                  value={form.title}
                  onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
                  maxLength={200}
                />
                <div className="flex justify-between mt-xs">
                  {errors.title ? <p className="form-error">{errors.title}</p> : <span />}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.title.length}/200</span>
                </div>
              </div>

              {/* Content */}
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your thoughts, insights, or updates..."
                  value={form.content}
                  onChange={e => { setForm(p => ({ ...p, content: e.target.value })); if (errors.content) setErrors(p => ({ ...p, content: '' })); }}
                  style={{ minHeight: 220, fontSize: 15, lineHeight: 1.7 }}
                />
                {errors.content && <p className="form-error">{errors.content}</p>}
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label className="form-label">
                  <Image size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Image URL (optional)
                </label>
                <input
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    style={{
                      marginTop: 8, borderRadius: 'var(--radius-md)',
                      maxHeight: 180, objectFit: 'cover', width: '100%',
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Tags */}
              <div className="form-group">
                <label className="form-label">
                  <Tag size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Tags (optional, comma-separated)
                </label>
                <input
                  className="form-input"
                  placeholder="networking, career, technology"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  maxLength={100}
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-xs mt-sm">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-sm justify-between items-center" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <span className="spinner spinner-sm" />
                  ) : (
                    <><Send size={16} /> {isEdit ? 'Update Post' : 'Publish Post'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
