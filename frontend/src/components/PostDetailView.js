import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiSend,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageCircle,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { commentAPI } from '../services/api';
import toast from 'react-hot-toast';

const PostDetailView = ({ post, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [post.id]);

  const getCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  };

  const fetchComments = async () => {
    setFetchingComments(true);
    try {
      const { data } = await commentAPI.getByPost(post.id);
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setFetchingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data } = await commentAPI.create(post.id, {
        content: newComment,
        parent: replyTo,
      });

      setComments((prev) => [data, ...prev]);
      setNewComment('');
      setReplyTo(null);
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (commentId, type) => {
    try {
      let data;
      if (type === 'upvote') {
        ({ data } = await commentAPI.upvote(commentId));
      } else {
        ({ data } = await commentAPI.downvote(commentId));
      }

      setComments((prev) => prev.map((c) => (c._id === commentId ? data : c)));
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await commentAPI.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const getUpvoteCount = (comment) => comment.upvotes?.length || 0;
  const getDownvoteCount = (comment) => comment.downvotes?.length || 0;

  const hasUserVoted = (comment, type) => {
    if (!currentUser?._id) return false;
    const votes = type === 'upvote' ? comment.upvotes : comment.downvotes;
    return votes?.some((id) => id.toString() === currentUser._id);
  };

  const organizeComments = () => {
    const rootComments = comments.filter((c) => !c.parent);
    const replies = comments.filter((c) => c.parent);

    return rootComments.map((root) => ({
      ...root,
      replies: replies.filter((r) => r.parent === root._id),
    }));
  };

  // Media navigation
  const mediaItems = post.media || [];
  const hasMultipleMedia = mediaItems.length > 1;

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const CommentItem = ({ comment, isReply = false }) => {
    // Ensure delete button is always visible for owner, independent of other states
    const showDelete = currentUser?._id === comment.userId?._id;
    
    return (
      <motion.div
        key={comment._id} // Add key for stable animation
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={`${isReply ? 'ml-12 mt-2' : 'mb-4'}`}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={
                  comment.userId?.avatar ||
                  `https://ui-avatars.com/api/?background=7c4dff&color=fff&name=${comment.username}`
                }
                alt={comment.username}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-white font-semibold block truncate">@{comment.username}</span>
                <span className="text-white/50 text-xs ml-0 block">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {showDelete && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-red-400 hover:text-red-300 p-1 transition-colors flex-shrink-0"
                aria-label="Delete comment"
              >
                <FiTrash2 size={14} />
              </button>
            )}
          </div>

          <p className="text-white/80 text-sm mb-3 leading-relaxed break-words">{comment.content}</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleVote(comment._id, 'upvote')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                hasUserVoted(comment, 'upvote')
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-white/60 hover:bg-white/10'
              }`}
              aria-label="Upvote"
            >
              <FiThumbsUp size={14} />
              <span className="text-xs font-semibold">{getUpvoteCount(comment)}</span>
            </button>

            <button
              onClick={() => handleVote(comment._id, 'downvote')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                hasUserVoted(comment, 'downvote')
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-white/60 hover:bg-white/10'
              }`}
              aria-label="Downvote"
            >
              <FiThumbsDown size={14} />
              <span className="text-xs font-semibold">{getDownvoteCount(comment)}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyTo(comment._id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-all"
                aria-label="Reply to comment"
              >
                <FiMessageCircle size={14} />
                <span className="text-xs">Reply</span>
              </button>
            )}
          </div>

          {replyTo === comment._id && (
            <motion.div
              key={`reply-${comment._id}`} // Stable key for reply form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Reply to @${comment.username}...`}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  <FiSend size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-white/60 hover:text-white px-2 transition-colors"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <motion.div
        key={post.id} // Stabilize modal to prevent re-animation on state changes
        layout // Add layout for smoother internal changes
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 500 }} // Smoother transition
        className="w-full max-w-4xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl border border-white/20 max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-6 border-b border-white/10 sticky top-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl z-20">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2
                className="text-2xl font-bold text-white mb-2 line-clamp-2"
                title={post.title}
              >
                {post.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-white/60 flex-wrap">
                <span>Posted by @{post.owner}</span>
                <span>•</span>
                <span>{post.plays || 0} views</span>
                <span>•</span>
                <span>{comments.length} comments</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all flex-shrink-0 ml-4"
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>
          </div>

          {post.description && (
            <div className="mt-3">
              <motion.p
                key={`desc-${showFullDescription ? 'full' : 'trunc'}`} // Key to trigger animation only on expand/collapse
                initial={false} // Disable initial animation for description
                className="text-white/70 text-sm whitespace-pre-wrap"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: showFullDescription ? undefined : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: showFullDescription ? 'visible' : 'hidden',
                  textOverflow: showFullDescription ? 'unset' : 'ellipsis',
                }}
                title={post.description}
              >
                {post.description}
              </motion.p>
              
              {!showFullDescription && post.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm mt-2 flex items-center gap-1 transition-colors"
                  aria-expanded="false"
                  aria-label="Expand full description"
                >
                  Read more <FiChevronRight size={12} />
                </button>
              )}
              
              {showFullDescription && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <button
                      onClick={() => setShowFullDescription(false)}
                      className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors mb-2"
                      aria-expanded="true"
                      aria-label="Collapse description"
                    >
                      Show less <FiChevronLeft size={12} />
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}
        </div>

        {/* Media Slider - Full size, no cropping */}
        {mediaItems.length > 0 && (
          <div className="relative flex justify-center items-center bg-black/50 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMediaIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center items-center"
              >
                {mediaItems[currentMediaIndex].type === 'video' ? (
                  <video
                    src={mediaItems[currentMediaIndex].url}
                    controls
                    className="max-w-full max-h-[60vh] rounded-lg"
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={mediaItems[currentMediaIndex].url}
                    alt={`${post.title} - ${currentMediaIndex + 1}`}
                    className="max-w-full max-h-[60vh] rounded-lg"
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {hasMultipleMedia && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all backdrop-blur-sm"
                  aria-label="Previous media"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all backdrop-blur-sm"
                  aria-label="Next media"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}

            {/* Media Indicators */}
            {hasMultipleMedia && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentMediaIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to media ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Media Counter */}
            {hasMultipleMedia && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                {currentMediaIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="p-6 flex-1">
          {/* New Comment Form - Stabilized to prevent flickering */}
          <form
            key="new-comment-form" // Stable key
            onSubmit={handleSubmitComment}
            className="mb-6"
          >
            <div className="flex gap-3">
              <img
                src={
                  currentUser?.avatar ||
                  `https://ui-avatars.com/api/?background=7c4dff&color=fff&name=${
                    currentUser?.username || 'User'
                  }`
                }
                alt="You"
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-purple-500 placeholder-white/40"
                  rows="3"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FiSend size={16} />
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {fetchingComments ? (
            <div className="text-center py-12 text-white/50">
              <motion.div
                initial={false} // Disable animation for loading
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <FiMessageCircle size={48} className="opacity-50" />
              </motion.div>
              <p className="mt-3">Loading comments...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {organizeComments().map((comment) => (
                  <div key={comment._id}>
                    <CommentItem comment={comment} />
                    {comment.replies?.map((reply) => (
                      <CommentItem key={reply._id} comment={reply} isReply />
                    ))}
                  </div>
                ))}
              </AnimatePresence>

              {comments.length === 0 && !fetchingComments && (
                <div className="text-center py-12 text-white/50">
                  <FiMessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostDetailView;
