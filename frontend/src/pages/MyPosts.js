import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiPlus } from 'react-icons/fi';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadMyPosts();
    }
    // eslint-disable-next-line
  }, [user?.id]);

  const loadMyPosts = async () => {
    if (!user?.id) {
      console.error('User ID not found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await postAPI.getUserPosts(user.id);
      setPosts(data || []);
      if (data.length === 0) toast.info('No posts yet');
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyPosts();
    setRefreshing(false);
    toast.success('Posts refreshed!');
  };

  const handleDelete = async (id) => {
    try {
      await postAPI.delete(id);
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  // Responsive and theming styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
      padding: '3rem 1rem 2rem 1rem',
      position: 'relative',
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '2rem',
    },
    title: {
      fontSize: 'clamp(2rem, 6vw, 3rem)',
      fontWeight: 900,
      background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: 0,
    },
    btn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      border: 'none',
      borderRadius: '9999px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
    },
    refreshBtn: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      color: isDark ? '#fff' : '#1a1a1a',
      padding: '0.75rem 1.5rem',
      marginRight: '0.5rem',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.25)' : 'rgba(33, 150, 243, 0.25)'}`,
      boxShadow: isDark 
        ? '0 4px 20px rgba(0, 229, 255, 0.1)' 
        : '0 2px 8px rgba(33,150,243,0.08)',
    },
    newBtn: {
      background: 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#fff',
      padding: '0.75rem 2rem',
      boxShadow: '0 6px 24px rgba(124,77,255,0.20)',
    },
    loadingWrap: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark 
        ? '#0a0e27' 
        : '#f8f9fa',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
    },
    emptyWrap: {
      padding: '5rem 1rem',
      textAlign: 'center',
    },
    emptyIcon: {
      fontSize: '5rem',
      marginBottom: '1.5rem',
    },
    emptyText: {
      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
      fontSize: '1.1rem',
      marginBottom: '2rem',
    },
    emptyBtn: {
      background: 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#fff',
      padding: '1rem 2rem',
      borderRadius: '9999px',
      border: 'none',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 24px rgba(124,77,255,0.20)',
      cursor: 'pointer',
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '4rem' }}
        >
          📝
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .posts-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .posts-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <motion.h1
              style={styles.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              My Posts
            </motion.h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ ...styles.btn, ...styles.refreshBtn, opacity: refreshing ? 0.8 : 1 }}
              >
                <FiRefreshCw className={refreshing ? 'spin' : ''} />
                <span>Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/new-post')}
                style={{ ...styles.btn, ...styles.newBtn }}
              >
                <FiPlus />
                <span>New Post</span>
              </motion.button>
            </div>
          </div>
          {/* Posts Grid */}
          <AnimatePresence>
            {posts.length > 0 ? (
              <motion.div
                className="posts-grid"
                style={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      minWidth: '320px',
                      maxWidth: '420px',
                      width: '100%',
                      margin: '0 auto',
                    }}
                  >
                    <PostCard
                      post={post}
                      onDelete={handleDelete}
                      showActions={true}
                      cardSize="fixed"
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.emptyWrap}
              >
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={styles.emptyIcon}
                >
                  📝
                </motion.div>
                <h3 style={{
                  color: isDark ? '#fff' : '#1a1a1a', 
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  No Posts Yet
                </h3>
                <p style={styles.emptyText}>
                  Start sharing your thoughts with the world!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/new-post')}
                  style={styles.emptyBtn}
                >
                  Create Your First Post
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`
        .spin {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default MyPosts;
