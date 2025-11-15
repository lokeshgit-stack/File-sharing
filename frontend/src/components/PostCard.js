import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiTrash2, FiEye, FiHeart, FiVideo, FiMusic, FiImage } from 'react-icons/fi';
import { BsSoundwave } from 'react-icons/bs';
import { postAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete, showActions = false }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleView = async () => {
    setShowMediaViewer(true);
    try {
      await postAPI.view(post.id);
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
      toast.success('Post deleted successfully!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!', {
      icon: isLiked ? '💔' : '❤️'
    });
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <FiImage className="text-white" />;
      case 'video': return <FiVideo className="text-white" />;
      case 'audio': return <FiMusic className="text-white" />;
      default: return <FiImage className="text-white" />;
    }
  };

  const getMediaBadgeColor = (type) => {
    switch (type) {
      case 'image': return 'bg-green-600';
      case 'video': return 'bg-purple-600';
      case 'audio': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  // Get first media item for thumbnail
  const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
        className="glass-effect rounded-2xl overflow-hidden group cursor-pointer relative"
      >
        {/* Thumbnail / Preview */}
        <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-blue-900">
          {firstMedia?.type === 'image' ? (
            <img
              src={firstMedia.url}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : firstMedia?.type === 'video' && firstMedia.thumbnailUrl ? (
            <img
              src={firstMedia.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getMediaIcon(firstMedia?.type || 'image')}
            </div>
          )}

          {/* Play/View Overlay */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleView}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <FiEye className="text-white text-3xl" />
            </div>
          </motion.div>

          {/* Media Count Badge */}
          {post.media && post.media.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full">
              <span className="text-white text-xs font-bold">
                +{post.media.length} items
              </span>
            </div>
          )}

          {/* Media Type Badge */}
          <div className={`absolute top-3 left-3 ${getMediaBadgeColor(firstMedia?.type)} px-3 py-1 rounded-full flex items-center space-x-2`}>
            {getMediaIcon(firstMedia?.type)}
            <span className="text-white text-xs font-bold uppercase">
              {firstMedia?.type || 'media'}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Title / Description */}
          <div className="flex items-start justify-between mb-4">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }}>
              <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                {post.title}
              </h3>
              {post.description && (
                <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                  {post.description}
                </p>
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.2, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="ml-4"
            >
              <FiHeart
                className={`text-2xl ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/60'}`}
              />
            </motion.button>
          </div>

          {/* Info Bar */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center space-x-2 glass-effect px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80">by {post.owner}</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2 text-purple-300"
                whileHover={{ scale: 1.1 }}
              >
                <BsSoundwave className="animate-pulse" />
                <span>{post.plays || 0} views</span>
              </motion.div>
            </div>
          </div>

          {/* Media Preview Grid */}
          {post.media && post.media.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {post.media.slice(0, 3).map((media, index) => (
                <div key={index} className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                  {media.type === 'image' ? (
                    <img src={media.url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-3xl">
                      {getMediaIcon(media.type)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleView}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold"
            >
              <FiEye className="text-xl" />
              <span>View Post</span>
            </motion.button>
            {showActions && onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="glass-effect p-3 rounded-full hover:bg-red-500/20"
              >
                <FiTrash2 className="text-xl text-red-400" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Full-Screen Media Viewer Modal */}
      <AnimatePresence>
        {showMediaViewer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMediaViewer(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-full max-w-6xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{post.title}</h2>
                  {post.description && (
                    <p className="text-white/70 text-sm mt-1">{post.description}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMediaViewer(false)}
                  className="text-white text-3xl hover:text-red-400"
                >
                  ×
                </motion.button>
              </div>

              {/* Current Media Display */}
              <div className="bg-black rounded-2xl overflow-hidden mb-4">
                {post.media && post.media[currentMediaIndex] && (
                  <>
                    {post.media[currentMediaIndex].type === 'image' && (
                      <img
                        src={post.media[currentMediaIndex].url}
                        alt={post.title}
                        className="w-full max-h-[70vh] object-contain"
                      />
                    )}
                    {post.media[currentMediaIndex].type === 'video' && (
                      <video
                        src={post.media[currentMediaIndex].url}
                        controls
                        autoPlay
                        className="w-full max-h-[70vh]"
                      />
                    )}
                    {post.media[currentMediaIndex].type === 'audio' && (
                      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <FiMusic className="text-8xl text-purple-400 mb-6" />
                        <audio
                          src={post.media[currentMediaIndex].url}
                          controls
                          autoPlay
                          className="w-full max-w-xl"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Media Navigation */}
              {post.media && post.media.length > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  {post.media.map((media, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        currentMediaIndex === index
                          ? 'border-purple-500'
                          : 'border-white/20'
                      }`}
                    >
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      ) : media.type === 'video' && media.thumbnailUrl ? (
                        <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center">
                          {getMediaIcon(media.type)}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Post Info */}
              <div className="mt-4 text-white/70 text-sm flex items-center justify-between">
                <span>Posted by {post.owner}</span>
                <span>{post.plays || 0} views</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostCard;
