import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrash2,
  FiHeart,
  FiVideo,
  FiImage,
  FiEye,
  FiMessageCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { postAPI } from '../services/api';
import toast from 'react-hot-toast';
import PostDetailView from './PostDetailView';
import { createPortal } from 'react-dom';

const PostCard = ({ post, onDelete, showActions = false, onView }) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [showMediaFullscreen, setShowMediaFullscreen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const mediaItems = post.media || [];
  const firstMedia = mediaItems.length > 0 ? mediaItems[0] : null;
  const hasMultipleMedia = mediaItems.length > 1;

  const handleView = async () => {
    setShowMediaFullscreen(true);
    try {
      await postAPI.view(post.id);
      if (onView) {
        onView(post);
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleCommentButton = () => {
    setShowDetailView(true);
  };

  const formattedDate = new Date(post.createdAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Media navigation in fullscreen
  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  // Swipe gesture handling
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e) => {
    touchEndX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (!hasMultipleMedia) return;
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        handleNextMedia();
      } else {
        // Swipe right - prev
        handlePrevMedia();
      }
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168,85,247,0.3)' }}
        className="glass-effect rounded-2xl overflow-hidden group cursor-pointer relative flex flex-col"
        style={{
          height: '100%',
          minHeight: '350px',
          backgroundColor: 'rgba(30,39,73,0.5)',
        }}
      >
        {/* Media container with 4:3 aspect ratio */}
        <div
          className="relative bg-gradient-to-br from-purple-900 to-blue-900"
          style={{ paddingTop: '75%', overflow: 'hidden' }}
        >
          {firstMedia?.type === 'image' ? (
            <img
              src={firstMedia.url}
              alt={post.title}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : firstMedia?.type === 'video' && firstMedia.thumbnailUrl ? (
            <img
              src={firstMedia.thumbnailUrl}
              alt={post.title}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 text-4xl">
              {firstMedia?.type === 'audio' ? <FiMessageCircle /> : <FiImage />}
            </div>
          )}

          {/* Eye icon overlay for full screen media */}
          {firstMedia && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <FiEye className="text-white text-3xl" />
              </div>
            </motion.div>
          )}

          {/* Media Indicators on bottom right if multiple media */}
          {hasMultipleMedia && (
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
              {/* Textual count badge */}
              <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-semibold">
                +{mediaItems.length}
              </div>
              {/* Dots below the count */}
              <div className="flex gap-1">
                {mediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(index);
                      handleView(); // Open fullscreen with selected index
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === 0
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to media ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Post Details */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="text-2xl font-bold text-white truncate mb-1"
            title={post.title}
          >
            {post.title}
          </h3>

          {/* Uploaded by and created date/time */}
          <div className="text-white/70 text-sm mb-2 flex flex-col space-y-0.5">
            <span>
              Uploaded by <strong>{post.owner}</strong>
            </span>
            <span>Created: {formattedDate}</span>
            <span>{post.plays || 0} views</span>
          </div>

          {/* Description */}
          {post.description && (
            <p
              className="text-gray-300 text-sm mb-4 line-clamp-3"
              title={post.description}
            >
              {post.description}
            </p>
          )}

          {/* Comment button */}
          <div className="mt-auto flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCommentButton();
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition"
              aria-label="Open comments"
            >
              <FiMessageCircle className="text-xl" />
              <span>Comment</span>
            </motion.button>

            {showActions && onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      'Are you sure you want to delete this post?'
                    )
                  ) {
                    onDelete(post.id);
                    toast.success('Post deleted successfully!');
                  }
                }}
                className="glass-effect p-3 rounded-full hover:bg-red-500/20 transition"
                aria-label="Delete post"
              >
                <FiTrash2 className="text-xl text-red-400" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Media Modal via portal - Updated for multiple media */}
      {showMediaFullscreen &&
        mediaItems.length > 0 &&
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]"
            onClick={() => setShowMediaFullscreen(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMediaFullscreen(false);
              }}
              aria-label="Close fullscreen media"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
              }}
            >
              <FiX style={{ color: 'white', fontSize: 24 }} />
            </button>

            {/* Current media */}
            <div
              className="relative flex justify-center items-center w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaItems[currentMediaIndex].type === 'video' ? (
                <video
                  src={mediaItems[currentMediaIndex].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-md"
                />
              ) : (
                <img
                  src={mediaItems[currentMediaIndex].url}
                  alt={`${post.title} - ${currentMediaIndex + 1}`}
                  className="max-w-full max-h-full rounded-md"
                />
              )}

              {/* Navigation Arrows for multiple media */}
              {hasMultipleMedia && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all"
                    aria-label="Previous media"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all"
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
                <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm">
                  {currentMediaIndex + 1} / {mediaItems.length}
                </div>
              )}
            </div>
          </motion.div>,
          document.body
        )}

      {/* Post Detail Modal via portal */}
      {showDetailView &&
        createPortal(
          <PostDetailView
            post={post}
            onClose={() => setShowDetailView(false)}
          />,
          document.body
        )}
    </>
  );
};

export default PostCard;
