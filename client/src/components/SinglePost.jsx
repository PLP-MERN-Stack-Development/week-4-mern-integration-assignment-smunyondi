import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Register from './Register';

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const { user, setUser } = useAuth();

  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [editingReply, setEditingReply] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setError('Post not found');
      }
    }
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      const res = await api.post(`/posts/${id}/comments`, { content: commentContent });
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data.comment],
      }));
      setCommentContent('');
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    try {
      const res = await api.put(`/posts/${id}/comments/${commentId}`, { content: editingContent });
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? res.data.comment : c
        ),
      }));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      setError('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/${id}/comments/${commentId}`);
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();
    const content = replyContent[commentId];
    if (!content || !content.trim()) return;
    try {
      const res = await api.post(`/posts/${id}/comments/${commentId}/replies`, { content });
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), res.data.reply] }
            : c
        ),
      }));
      setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
    } catch (err) {
      setError('Failed to add reply');
    }
  };

  const handleEditReply = (reply, commentId) => {
    setEditingReply({ [reply._id]: reply.content, commentId });
  };

  const handleSaveEditReply = async (commentId, replyId) => {
    try {
      const res = await api.put(`/posts/${id}/comments/${commentId}/replies/${replyId}`, {
        content: editingReply[replyId],
      });
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r._id === replyId ? res.data.reply : r
                ),
              }
            : c
        ),
      }));
      setEditingReply({});
    } catch (err) {
      setError('Failed to edit reply');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await api.delete(`/posts/${id}/comments/${commentId}/replies/${replyId}`);
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        ),
      }));
    } catch (err) {
      setError('Failed to delete reply');
    }
  };

  const canEditOrDeleteComment = (comment) =>
    user &&
    (user.isAdmin || user.id === comment.user || user.userId === comment.user);

  const canEditOrDeleteReply = (reply) =>
    user &&
    (user.isAdmin || user.id === reply.user || user.userId === reply.user);

  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!post) return <div className="text-center mt-8">Loading...</div>;

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : 'Unknown';

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const imageUrl = post.image
    ? `${apiBase}/uploads/${post.image}`
    : null;

  const canEditOrDelete =
    user &&
    (user.isAdmin ||
      user.id === post.author?._id ||
      user.userId === post.author?._id);

  const handleAuthSuccess = () => {
    setUser(JSON.parse(localStorage.getItem('user')));
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mt-8">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full rounded-lg mb-6"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <h2 className="text-3xl font-bold mb-2 text-potasq dark:text-potasq-light">{post.title}</h2>
        <div className="text-gray-600 dark:text-gray-300 mb-4">
          <span>By {post.author?.username || 'Unknown'}</span>
          <span className="mx-2">•</span>
          <span>{date}</span>
          <span className="mx-2">•</span>
          <span className="bg-potasq-light dark:bg-gray-700 text-potasq px-2 py-1 rounded text-xs">
            {post.category?.name || 'Uncategorized'}
          </span>
        </div>
        <div className="prose prose-lg mb-8 text-gray-900 dark:text-gray-100">{post.content}</div>
        {canEditOrDelete && (
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 transition mb-8"
        >
          Back
        </button>

        {/* --- Comments Section --- */}
        <h3 className="text-2xl font-bold mt-8 mb-4 text-potasq dark:text-potasq-light">Comments</h3>
        {user ? (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              required
              className="w-full border border-potasq rounded p-2 mb-2 bg-white dark:bg-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-potasq text-white rounded hover:bg-potasq-dark transition"
            >
              Add Comment
            </button>
          </form>
        ) : (
          <div className="text-gray-500 mb-6">
            <button
              className="text-potasq underline hover:text-potasq-dark"
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
            >
              Log in to comment
            </button>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="flex justify-center mb-4 gap-4">
                <button
                  className={`px-4 py-2 rounded-t ${authMode === 'login' ? 'bg-potasq text-white' : 'bg-potasq-light text-potasq'}`}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  className={`px-4 py-2 rounded-t ${authMode === 'register' ? 'bg-potasq text-white' : 'bg-potasq-light text-potasq'}`}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>
              {authMode === 'login' ? (
                <Login
                  onSuccess={handleAuthSuccess}
                  hideRedirect
                />
              ) : (
                <Register
                  onSuccess={() => setAuthMode('login')}
                  hideRedirect
                />
              )}
            </div>
          </div>
        )}

        <div>
          {(post.comments || []).length === 0 && (
            <div className="text-gray-500">No comments yet.</div>
          )}
          {(post.comments || []).map((comment) => (
            <div
              key={comment._id}
              className="border-b border-gray-100 dark:border-gray-700 mb-6 pb-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 dark:text-gray-100">{comment.username}</span>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              {editingCommentId === comment._id ? (
                <div className="mb-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    required
                    className="w-full border border-potasq rounded p-2 mb-2 bg-white dark:bg-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => handleSaveEdit(comment._id)}
                    className="px-3 py-1 bg-potasq text-white rounded hover:bg-potasq-dark transition mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-gray-700 dark:text-gray-200 mb-2">{comment.content}</div>
              )}
              {canEditOrDeleteComment(comment) && editingCommentId !== comment._id && (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* --- Replies Section --- */}
              <div className="ml-6 mt-2">
                {(comment.replies || []).map((reply) => (
                  <div
                    key={reply._id}
                    className="border-l-2 border-potasq-light dark:border-gray-700 pl-4 mb-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-potasq dark:text-potasq-light">{reply.username}</span>
                      <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                    {editingReply[reply._id] !== undefined ? (
                      <div className="mb-2">
                        <textarea
                          value={editingReply[reply._id]}
                          onChange={e =>
                            setEditingReply((prev) => ({
                              ...prev,
                              [reply._id]: e.target.value,
                            }))
                          }
                          required
                          className="w-full border border-potasq rounded p-2 mb-2 bg-white dark:bg-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={() => handleSaveEditReply(comment._id, reply._id)}
                          className="px-3 py-1 bg-potasq text-white rounded hover:bg-potasq-dark transition mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingReply({})}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-700 dark:text-gray-200 mb-2">{reply.content}</div>
                    )}
                    {canEditOrDeleteReply(reply) && editingReply[reply._id] === undefined && (
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => handleEditReply(reply, comment._id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReply(comment._id, reply._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {user && (
                  <form
                    onSubmit={e => handleAddReply(e, comment._id)}
                    className="flex gap-2 mt-2"
                  >
                    <input
                      type="text"
                      value={replyContent[comment._id] || ''}
                      onChange={e =>
                        setReplyContent((prev) => ({
                          ...prev,
                          [comment._id]: e.target.value,
                        }))
                      }
                      placeholder="Reply..."
                      required
                      className="flex-1 border border-potasq rounded p-2 bg-white dark:bg-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-potasq text-white rounded hover:bg-potasq-dark transition"
                    >
                      Reply
                    </button>
                  </form>
                )}
              </div>
              {/* --- End Replies Section --- */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
