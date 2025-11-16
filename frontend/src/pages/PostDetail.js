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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

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

  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
      padding: '3rem 1rem',
      position: 'relative',
    },
    backgroundGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: isDark
        ? 'linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)'
        : 'linear-gradient(rgba(33, 150, 243, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(33, 150, 243, 0.03) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      pointerEvents: 'none',
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    backButton: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      padding: '0.75rem 1.5rem',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isDark ? '#ffffff' : '#1a1a1a',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      cursor: 'pointer',
      fontWeight: '600',
      marginBottom: '2rem',
      transition: 'all 0.3s ease',
    },
    card: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.8)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: isDark 
        ? '0 20px 60px rgba(0, 0, 0, 0.6)' 
        : '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
    },
    mediaContainer: {
      background: '#000000',
      position: 'relative',
    },
    mediaBadge: {
      position: 'absolute',
      top: '1rem',
      left: '1rem',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      zIndex: 10,
    },
    mediaCounter: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(10px)',
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      color: '#ffffff',
      fontWeight: '700',
      zIndex: 10,
    },
    thumbnailContainer: {
      padding: '1.5rem',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent)',
    },
    thumbnailScroll: {
      display: 'flex',
      gap: '0.75rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      scrollbarWidth: 'thin',
      scrollbarColor: isDark ? '#7c4dff #1e2749' : '#2196f3 #f0f2f5',
    },
    thumbnail: (isActive) => ({
      flexShrink: 0,
      width: '80px',
      height: '80px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: `2px solid ${isActive 
        ? '#7c4dff' 
        : 'rgba(255, 255, 255, 0.2)'}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: isActive ? '0 4px 20px rgba(124, 77, 255, 0.5)' : 'none',
    }),
    content: {
      padding: '2rem',
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      gap: '1.5rem',
      flexWrap: 'wrap',
    },
    title: {
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: '800',
      color: isDark ? '#ffffff' : '#1a1a1a',
      marginBottom: '1rem',
      lineHeight: '1.2',
    },
    description: {
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      fontSize: '1.125rem',
      lineHeight: '1.7',
    },
    likeButton: {
      flexShrink: 0,
      cursor: 'pointer',
      fontSize: '2.5rem',
      transition: 'all 0.3s ease',
    },
    metaContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    metaBadge: {
      background: isDark 
        ? 'rgba(10, 14, 39, 0.5)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      fontWeight: '600',
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
    },
    mediaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
    },
    mediaInfoCard: {
      background: isDark 
        ? 'rgba(10, 14, 39, 0.5)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '1rem',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      transition: 'all 0.3s ease',
    },
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? '#0a0e27' : '#f8f9fa',
    },
    errorContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
    },
    errorContent: {
      textAlign: 'center',
    },
    errorTitle: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1a1a1a',
      marginBottom: '1rem',
    },
    errorText: {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      marginBottom: '2rem',
      fontSize: '1rem',
    },
    errorButton: {
      background: 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#ffffff',
      padding: '0.75rem 2rem',
      borderRadius: '50px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(124, 77, 255, 0.4)',
    },
    audioContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '2rem',
    },
    audioTitle: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '4rem' }}
        >
          🚀
        </motion.div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={styles.errorContainer}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.errorContent}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
          >
            😕
          </motion.div>
          <h2 style={styles.errorTitle}>
            {error ? 'Error Loading Post' : 'Post Not Found'}
          </h2>
          <p style={styles.errorText}>
            {error || 'The post you\'re looking for doesn\'t exist.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(124, 77, 255, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            style={styles.errorButton}
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
    <>
      <style>{`
        audio, video {
          width: 100%;
          max-width: 800px;
          border-radius: 12px;
          outline: none;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        @media (max-width: 768px) {
          video, img {
            max-height: 50vh !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.backgroundGrid}></div>

        <div style={styles.maxWidth}>
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(33, 150, 243, 0.1)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            <FiArrowLeft />
            <span>Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.card}
          >
            {/* Main Media Display */}
            <div style={styles.mediaContainer}>
              {currentMedia && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ position: 'relative' }}
                  >
                    {currentMedia.type === 'image' && (
                      <img
                        src={currentMedia.url}
                        alt={post.title}
                        style={{
                          width: '100%',
                          maxHeight: '70vh',
                          objectFit: 'contain',
                          margin: '0 auto',
                          display: 'block',
                        }}
                      />
                    )}
                    {currentMedia.type === 'video' && (
                      <video
                        src={currentMedia.url}
                        controls
                        autoPlay
                        style={{
                          width: '100%',
                          maxHeight: '70vh',
                          margin: '0 auto',
                          display: 'block',
                        }}
                      />
                    )}
                    {currentMedia.type === 'audio' && (
                      <div style={styles.audioContainer}>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ fontSize: '5rem', marginBottom: '1.5rem' }}
                        >
                          🎵
                        </motion.div>
                        <h3 style={styles.audioTitle}>{post.title}</h3>
                        <audio
                          src={currentMedia.url}
                          controls
                          autoPlay
                        />
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div style={styles.mediaBadge}>
                      <span style={{ fontSize: '1.5rem' }}>{getMediaIcon(currentMedia.type)}</span>
                      <span style={{ color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                        {currentMedia.type}
                      </span>
                    </div>

                    {/* Media Counter */}
                    {post.media.length > 1 && (
                      <div style={styles.mediaCounter}>
                        {currentMediaIndex + 1} / {post.media.length}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Media Navigation Thumbnails */}
            {post.media && post.media.length > 1 && (
              <div style={styles.thumbnailContainer}>
                <div style={styles.thumbnailScroll}>
                  {post.media.map((media, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentMediaIndex(index)}
                      style={styles.thumbnail(currentMediaIndex === index)}
                    >
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : media.type === 'video' && media.thumbnailUrl ? (
                        <img src={media.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                        }}>
                          {getMediaIcon(media.type)}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Post Content */}
            <div style={styles.content}>
              {/* Title and Actions */}
              <div style={styles.header}>
                <div style={{ flex: 1 }}>
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.title}
                  >
                    {post.title}
                  </motion.h1>
                  
                  {post.description && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      style={styles.description}
                    >
                      {post.description}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  style={styles.likeButton}
                >
                  <FiHeart
                    style={{
                      fill: isLiked ? '#ef4444' : 'none',
                      color: isLiked ? '#ef4444' : isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)',
                    }}
                  />
                </motion.button>
              </div>

              {/* Post Meta Info */}
              <div style={styles.metaContainer}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={styles.metaBadge}
                >
                  <FiUser style={{ color: isDark ? '#7c4dff' : '#2196f3' }} />
                  <span>{post.owner}</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={styles.metaBadge}
                >
                  <FiEye style={{ color: '#3b82f6' }} />
                  <span>{post.plays || 0} views</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={styles.metaBadge}
                >
                  <FiCalendar style={{ color: '#10b981' }} />
                  <span>{formatDate(post.createdAt)}</span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={styles.metaBadge}
                >
                  <span>📁</span>
                  <span>{post.media?.length || 0} {post.media?.length === 1 ? 'item' : 'items'}</span>
                </motion.div>
              </div>

              {/* Media Info Grid */}
              {post.media && post.media.length > 0 && (
                <div style={styles.mediaGrid}>
                  {post.media.map((media, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      style={styles.mediaInfoCard}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '2rem' }}>{getMediaIcon(media.type)}</span>
                        <div>
                          <p style={{ 
                            color: isDark ? '#ffffff' : '#1a1a1a',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            marginBottom: '0.25rem',
                          }}>
                            {media.type}
                          </p>
                          {media.fileSize && (
                            <p style={{ 
                              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                              fontSize: '0.875rem',
                            }}>
                              {(media.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          )}
                          {media.duration && (
                            <p style={{ 
                              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                              fontSize: '0.875rem',
                            }}>
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
    </>
  );
};

export default PostDetail;
