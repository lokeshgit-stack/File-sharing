import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiEye, FiCalendar, FiUser } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching post:', err);
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📄';
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!', {
      icon: isLiked ? '💔' : '❤️'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            😕
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {error ? 'Error Loading Post' : 'Post Not Found'}
          </h2>
          <p className="text-white/60 mb-8">
            {error || 'The post you\'re looking for doesn\'t exist.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-full text-white font-bold flex items-center space-x-2 mx-auto"
          >
            <FiArrowLeft />
            <span>Go Back</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentMedia = post.media && post.media[currentMediaIndex];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="glass-effect px-6 py-3 rounded-full flex items-center space-x-2 text-white mb-8 hover:bg-white/20"
        >
          <FiArrowLeft />
          <span>Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl overflow-hidden"
        >
          {/* Main Media Display */}
          <div className="bg-black">
            {currentMedia && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMediaIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {currentMedia.type === 'image' && (
                    <img
                      src={currentMedia.url}
                      alt={post.title}
                      className="w-full max-h-[70vh] object-contain mx-auto"
                    />
                  )}
                  {currentMedia.type === 'video' && (
                    <video
                      src={currentMedia.url}
                      controls
                      autoPlay
                      className="w-full max-h-[70vh] mx-auto"
                    />
                  )}
                  {currentMedia.type === 'audio' && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                      >
                        🎵
                      </motion.div>
                      <h3 className="text-white text-2xl font-bold mb-6">{post.title}</h3>
                      <audio
                        src={currentMedia.url}
                        controls
                        autoPlay
                        className="w-full max-w-2xl"
                      />
                    </div>
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-full flex items-center space-x-2">
                    <span className="text-2xl">{getMediaIcon(currentMedia.type)}</span>
                    <span className="text-white font-bold uppercase">{currentMedia.type}</span>
                  </div>

                  {/* Media Counter */}
                  {post.media.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-full text-white font-bold">
                      {currentMediaIndex + 1} / {post.media.length}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Media Navigation Thumbnails */}
          {post.media && post.media.length > 1 && (
            <div className="p-6 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {post.media.map((media, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      currentMediaIndex === index
                        ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="" className="w-full h-full object-cover" />
                    ) : media.type === 'video' && media.thumbnailUrl ? (
                      <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center text-2xl">
                        {getMediaIcon(media.type)}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="p-8">
            {/* Title and Actions */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  {post.title}
                </motion.h1>
                
                {post.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/80 text-lg leading-relaxed"
                  >
                    {post.description}
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.2, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex-shrink-0 ml-6"
              >
                <FiHeart
                  className={`text-4xl ${
                    isLiked ? 'fill-red-500 text-red-500' : 'text-white/60'
                  }`}
                />
              </motion.button>
            </div>

            {/* Post Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/70 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full"
              >
                <FiUser className="text-purple-400" />
                <span className="font-semibold">{post.owner}</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full"
              >
                <FiEye className="text-blue-400" />
                <span>{post.plays || 0} views</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full"
              >
                <FiCalendar className="text-green-400" />
                <span>{formatDate(post.createdAt)}</span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-full"
              >
                <span>📁</span>
                <span>{post.media?.length || 0} {post.media?.length === 1 ? 'item' : 'items'}</span>
              </motion.div>
            </div>

            {/* Media Info Grid */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {post.media.map((media, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-effect rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getMediaIcon(media.type)}</span>
                      <div>
                        <p className="text-white font-semibold capitalize">{media.type}</p>
                        {media.fileSize && (
                          <p className="text-white/60 text-sm">
                            {(media.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        )}
                        {media.duration && (
                          <p className="text-white/60 text-sm">
                            {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;
