import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { postsApi, likesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarInitials } from './Navbar';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showMenu, setShowMenu] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user?.id === post.author?.id;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const { data } = await likesApi.togglePost(post.id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      toast.error('Failed to like post');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsApi.delete(post.id);
      toast.success('Post deleted');
      onDelete?.(post.id);
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const tags = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="post-card animate-fade" onClick={() => navigate(`/post/${post.id}`)}>
      {/* Header */}
      <div className="post-card-header">
        <Link
          to={`/profile/${post.author?.id}`}
          onClick={e => e.stopPropagation()}
        >
          <AvatarInitials user={post.author} size={40} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-sm">
            <Link
              to={`/profile/${post.author?.id}`}
              onClick={e => e.stopPropagation()}
              style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textDecoration: 'none' }}
            >
              {post.author?.fullName || `${post.author?.firstName} ${post.author?.lastName}`}
            </Link>
            {post.author?.verificationStatus === 'APPROVED' && (
              <span className="verified-badge">✓ Verified</span>
            )}
            {post.author?.role && (
              <span className={`badge badge-${post.author.role === 'ROLE_ALUMNI' ? 'accent' : 'primary'}`}>
                {post.author.role === 'ROLE_ALUMNI' ? 'Alumni' : post.author.role === 'ROLE_ADMIN' ? 'Admin' : 'Student'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            {post.author?.company && ` · ${post.author.company}`}
          </div>
        </div>

        {/* Actions menu */}
        {(isOwner || isAdmin) && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%',
                background: 'var(--bg-modal)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: 8, zIndex: 10,
                minWidth: 140, boxShadow: 'var(--shadow-lg)',
              }}
                onClick={e => e.stopPropagation()}
              >
                {isOwner && (
                  <button
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 8, fontSize: 13 }}
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/edit-post/${post.id}`); }}
                  >
                    <Edit2 size={14} /> Edit Post
                  </button>
                )}
                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 8, fontSize: 13, color: 'var(--danger)' }}
                  onClick={handleDelete}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="post-card-body">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">
          {post.content?.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-xs mt-sm">
            {tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="post-card-image" />
      )}

      {/* Footer */}
      <div className="post-card-footer">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          {likeCount}
        </button>
        <button
          className="action-btn"
          onClick={e => { e.stopPropagation(); setShowComments(!showComments); }}
        >
          <MessageCircle size={16} />
          {post.commentCount}
        </button>
        <button
          className="action-btn"
          onClick={e => {
            e.stopPropagation();
            navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
            toast.success('Link copied!');
          }}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
      
      {/* Inline Comments */}
      {showComments && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}
