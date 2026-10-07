import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Reply, Trash2, Edit2, Send } from 'lucide-react';
import { commentsApi, likesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarInitials } from './Navbar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function Comment({ comment, postId, onDeleted, depth = 0 }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [liked, setLiked] = useState(comment.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwner = user?.id === comment.author?.id;

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Login to like'); return; }
    const { data } = await likesApi.toggleComment(comment.id);
    setLiked(data.liked);
    setLikeCount(data.likeCount);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      await commentsApi.add(postId, { content: replyContent, parentId: comment.id });
      setReplyContent('');
      setShowReply(false);
      toast.success('Reply added');
      onDeleted?.(); // refresh
    } catch {
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await commentsApi.update(comment.id, { content: editContent });
      comment.content = editContent;
      setEditing(false);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(comment.id);
      toast.success('Comment deleted');
      onDeleted?.();
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div className="comment-box" style={depth > 0 ? { borderLeft: '2px solid var(--border)', marginLeft: 44 } : {}}>
        <div className="flex items-start gap-sm">
          <Link to={`/profile/${comment.author?.id}`}>
            <AvatarInitials user={comment.author} size={32} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-sm flex-wrap mb-xs">
              <Link
                to={`/profile/${comment.author?.id}`}
                style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textDecoration: 'none' }}
              >
                {comment.author?.fullName || `${comment.author?.firstName} ${comment.author?.lastName}`}
              </Link>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            {editing ? (
              <form onSubmit={handleEdit}>
                <textarea
                  className="form-textarea"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  style={{ minHeight: 60, fontSize: 13, marginBottom: 8 }}
                />
                <div className="flex gap-sm">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>Save</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{comment.content}</p>
            )}

            {/* Actions */}
            {!editing && (
              <div className="flex items-center gap-xs mt-xs">
                <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
                  <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                  {likeCount > 0 && likeCount}
                </button>
                {depth === 0 && isAuthenticated && (
                  <button className="action-btn" onClick={() => setShowReply(!showReply)}>
                    <Reply size={13} /> Reply
                  </button>
                )}
                {isOwner && (
                  <button className="action-btn" onClick={() => setEditing(true)}>
                    <Edit2 size={13} /> Edit
                  </button>
                )}
                {(isOwner || isAdmin) && (
                  <button className="action-btn" style={{ color: 'var(--danger)' }} onClick={handleDelete}>
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            )}

            {/* Reply Input */}
            {showReply && (
              <form onSubmit={handleReply} className="flex gap-sm mt-sm">
                <input
                  className="form-input"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  style={{ fontSize: 13, padding: '8px 12px' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies?.map(reply => (
        <Comment key={reply.id} comment={reply} postId={postId} onDeleted={onDeleted} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const { data } = await commentsApi.getByPost(postId, { page: p, size: 10 });
      setComments(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => { loadComments(0); }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.add(postId, { content: newComment });
      setNewComment('');
      toast.success('Comment added!');
      loadComments(0);
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 18 }}>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* New comment input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-sm mb-lg items-start">
          <AvatarInitials user={user} size={36} />
          <div className="flex-1 flex gap-sm">
            <input
              className="form-input flex-1"
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={submitting || !newComment.trim()}>
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div className="alert alert-info mb-lg">
          <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>Sign in</Link> to join the conversation
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="loading-center"><div className="spinner spinner-sm" /></div>
      ) : comments.length === 0 ? (
        <div className="empty-state">
          <p style={{ color: 'var(--text-muted)' }}>Be the first to comment!</p>
        </div>
      ) : (
        <>
          {comments.map(c => (
            <Comment key={c.id} comment={c} postId={postId} onDeleted={() => loadComments(page)} />
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-sm mt-md">
              {page > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={() => loadComments(page - 1)}>
                  Previous
                </button>
              )}
              {page < totalPages - 1 && (
                <button className="btn btn-secondary btn-sm" onClick={() => loadComments(page + 1)}>
                  Load more
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
