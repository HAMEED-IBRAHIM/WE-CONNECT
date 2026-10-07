import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { postsApi, likesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarInitials } from '../components/Navbar';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const loadPost = useCallback(async () => {
    try {
      const { data } = await postsApi.getById(id);
      setPost(data);
      setLiked(data.likedByCurrentUser);
      setLikeCount(data.likeCount);
    } catch {
      toast.error('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data } = await likesApi.togglePost(post.id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsApi.delete(post.id);
      toast.success('Post deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="loading-center" style={{ height: '60vh' }}><div className="spinner" /></div>;
  if (!post) return null;

  const isOwner = user?.id === post.author?.id;
  const tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Back button */}
        <button className="btn btn-ghost btn-sm mb-lg" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Post article */}
        <div className="card animate-fade">
          {/* Author header */}
          <div className="card-header">
            <div className="flex items-center gap-md flex-1">
              <Link to={`/profile/${post.author?.id}`}>
                <AvatarInitials user={post.author} size={48} />
              </Link>
              <div>
                <div className="flex items-center gap-sm">
                  <Link
                    to={`/profile/${post.author?.id}`}
                    style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', textDecoration: 'none' }}
                  >
                    {post.author?.fullName || `${post.author?.firstName} ${post.author?.lastName}`}
                  </Link>
                  {post.author?.verificationStatus === 'APPROVED' && (
                    <span className="verified-badge">✓ Verified</span>
                  )}
                  <span className={`badge ${post.author?.role === 'ROLE_ALUMNI' ? 'badge-accent' : 'badge-primary'}`}>
                    {post.author?.role === 'ROLE_ALUMNI' ? 'Alumni' : 'Student'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  {post.author?.jobTitle && ` · ${post.author.jobTitle}`}
                  {post.author?.company && ` at ${post.author.company}`}
                </div>
              </div>
            </div>
            {(isOwner || isAdmin) && (
              <div className="flex gap-sm">
                {isOwner && (
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/edit-post/${post.id}`)}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="card-body">
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
              {post.title}
            </h1>

            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{
                  width: '100%', borderRadius: 'var(--radius-lg)',
                  marginBottom: 20, maxHeight: 400, objectFit: 'cover',
                }}
              />
            )}

            <div style={{
              color: 'var(--text-secondary)', lineHeight: 1.85, fontSize: 16,
              whiteSpace: 'pre-wrap',
            }}>
              {post.content}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-xs mt-lg">
                {tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="card-footer">
            <div className="flex items-center gap-md">
              <button
                className={`action-btn ${liked ? 'liked' : ''}`}
                onClick={handleLike}
                style={{ fontSize: 15 }}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </button>
              <span className="action-btn" style={{ cursor: 'default' }}>
                <MessageCircle size={18} /> {post.commentCount} Comments
              </span>
              <button
                className="action-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-xl">
          <CommentSection postId={id} />
        </div>
      </div>
    </div>
  );
}
