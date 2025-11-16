import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { podcastAPI, postAPI } from '../services/api';
import PodcastCard from '../components/PodcastCard';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const Home = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'podcasts', 'posts'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterAndSortContent();
  }, [searchTerm, sortBy, podcasts, posts]);

  const loadContent = async () => {
    try {
      setLoading(true);
      console.log('Fetching all content...');
      
      const [podcastsData, postsData] = await Promise.all([
        podcastAPI.getAll(),
        postAPI.getAll()
      ]);
      
      console.log('Fetched podcasts:', podcastsData.data);
      console.log('Fetched posts:', postsData.data);
      
      setPodcasts(podcastsData.data || []);
      setPosts(postsData.data || []);
      setFilteredPodcasts(podcastsData.data || []);
      setFilteredPosts(postsData.data || []);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      setPodcasts([]);
      setPosts([]);
      setFilteredPodcasts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      console.log('Fetching all podcasts...');
      
      const { data } = await podcastAPI.getAll();
      
      console.log('Fetched podcasts:', data);
      setPodcasts(data || []);
      setFilteredPodcasts(data || []);
      
      if (data.length > 0) {
        // toast.success(`Loaded ${data.length} podcasts!`);
      }
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast.error('Failed to load podcasts');
      setPodcasts([]);
      setFilteredPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContent = () => {
    // Filter and sort podcasts
    let filteredP = [...podcasts];
    
    if (searchTerm) {
      filteredP = filteredP.filter(podcast =>
        podcast.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        podcast.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        podcast.owner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter and sort posts
    let filteredPo = [...posts];
    
    if (searchTerm) {
      filteredPo = filteredPo.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.owner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sortFunction = (a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.plays || 0) - (a.plays || 0);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    };

    filteredP.sort(sortFunction);
    filteredPo.sort(sortFunction);

    setFilteredPodcasts(filteredP);
    setFilteredPosts(filteredPo);
  };

  const filterAndSortPodcasts = () => {
    let filtered = [...podcasts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(podcast =>
        podcast.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        podcast.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        podcast.owner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.plays || 0) - (a.plays || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    setFilteredPodcasts(filtered);
  };

  const handleRefresh = () => {
    toast.loading('Refreshing...');
    loadContent();
  };

  // Get content based on active tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case 'podcasts':
        return filteredPodcasts;
      case 'posts':
        return filteredPosts;
      case 'all':
      default:
        return [...filteredPosts, ...filteredPodcasts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const currentContent = getCurrentContent();
  const totalCount = filteredPodcasts.length + filteredPosts.length;

  // Inline Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
      position: 'relative',
      overflow: 'hidden',
    },
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? '#0a0e27' : '#ffffff',
    },
    loadingIcon: {
      fontSize: '6rem',
    },
    heroSection: {
      position: 'relative',
      overflow: 'hidden',
      padding: '5rem 1rem',
    },
    heroContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center',
      position: 'relative',
      zIndex: 10,
    },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      fontWeight: '900',
      marginBottom: '1.5rem',
      lineHeight: '1.2',
    },
    gradientText: {
      background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSubtitle: {
      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      marginBottom: '2rem',
      maxWidth: '700px',
      margin: '0 auto 2rem',
    },
    searchContainer: {
      maxWidth: '48rem',
      margin: '0 auto',
    },
    searchBar: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '50px',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
        : '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
    },
    searchIcon: {
      color: isDark ? '#ffffff' : '#1a1a1a',
      fontSize: '1.5rem',
      marginLeft: '1rem',
    },
    searchInput: {
      flex: 1,
      background: 'transparent',
      color: isDark ? '#ffffff' : '#1a1a1a',
      padding: '0.75rem 1rem',
      border: 'none',
      outline: 'none',
      fontSize: '1rem',
    },
    contentSection: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1rem',
    },
    filterBar: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      gap: '1rem',
    },
    filterLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    trendingIcon: {
      color: isDark ? '#7c4dff' : '#2196f3',
      fontSize: '1.5rem',
    },
    tabContainer: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '50px',
      padding: '0.25rem',
      display: 'flex',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
    },
    tabButton: (isActive) => ({
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      background: isActive 
        ? 'linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)' 
        : 'transparent',
      color: isActive ? '#ffffff' : isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    }),
    filterRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    refreshButton: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      padding: '0.75rem',
      borderRadius: '50%',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    filterIcon: {
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    selectBox: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      color: isDark ? '#ffffff' : '#1a1a1a',
      padding: '0.5rem 1rem',
      borderRadius: '12px',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      outline: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '2rem',
    },
    emptyState: {
      textAlign: 'center',
      padding: '5rem 1rem',
    },
    emptyIcon: {
      fontSize: '5rem',
      marginBottom: '1.5rem',
    },
    emptyTitle: {
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1a1a1a',
      marginBottom: '1rem',
    },
    emptyText: {
      fontSize: 'clamp(1rem, 2vw, 1.125rem)',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.loadingIcon}
        >
          🚀
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.heroSection}
      >
        <div style={styles.heroContainer}>
          <motion.h1 
            style={styles.heroTitle}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span style={styles.gradientText}>Discover Amazing</span>
            <br />
            <span style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}>Content</span>
          </motion.h1>
          
          <motion.p 
            style={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Share your voice, discover new perspectives
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            style={styles.searchContainer}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div style={styles.searchBar}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search posts and content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '16rem',
                height: '16rem',
                background: isDark ? 'rgba(124, 77, 255, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                borderRadius: '50%',
                filter: 'blur(60px)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Content Section */}
      <div style={styles.contentSection}>
        {/* Filter Bar with Tabs */}
        <motion.div 
          style={styles.filterBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={styles.filterLeft}>
            <FiTrendingUp style={styles.trendingIcon} />
            
            {/* Tab Switcher */}
            <div style={styles.tabContainer}>
              {/* <button
                onClick={() => setActiveTab('all')}
                style={styles.tabButton(activeTab === 'all')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'all') {
                    e.target.style.color = isDark ? '#ffffff' : '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'all') {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
                  }
                }}
              >
                All ({totalCount})
              </button> */}
              <button
                onClick={() => setActiveTab('posts')}
                style={styles.tabButton(activeTab === 'posts')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'posts') {
                    e.target.style.color = isDark ? '#ffffff' : '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'posts') {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
                  }
                }}
              >
                Posts ({filteredPosts.length})
              </button>
              {/* <button
                onClick={() => setActiveTab('podcasts')}
                style={styles.tabButton(activeTab === 'podcasts')}
                onMouseEnter={(e) => {
                  if (activeTab !== 'podcasts') {
                    e.target.style.color = isDark ? '#ffffff' : '#1a1a1a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'podcasts') {
                    e.target.style.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
                  }
                }}
              >
                Podcasts ({filteredPodcasts.length})
              </button> */}
            </div>
          </div>

          <div style={styles.filterRight}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              style={styles.refreshButton}
            >
              <FiRefreshCw style={{ color: isDark ? '#ffffff' : '#1a1a1a' }} />
            </motion.button>

            <FiFilter style={styles.filterIcon} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.selectBox}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </motion.div>

        {/* Content Grid with Horizontal Swipe */}
<AnimatePresence mode="wait">
  {currentContent.length > 0 ? (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Section Title */}
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: isDark ? '#ffffff' : '#1a1a1a',
        marginBottom: '1.5rem',
        paddingLeft: '0.5rem',
      }}>
        {activeTab === 'posts' ? '📝 Recent Posts' : activeTab === 'podcasts' ? '🚀 Podcasts' : '🌟 All Content'}
      </h2>

      {/* Horizontal Scroll Container */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollBehavior: 'smooth',
        padding: '1rem 0.5rem 2rem 0.5rem',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: isDark ? '#7c4dff #1e2749' : '#2196f3 #f0f2f5',
        msOverflowStyle: 'auto',
        marginBottom: '1rem',
      }}>
        {currentContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              minWidth: '320px',
              maxWidth: '320px',
              height: '450px',
              flexShrink: 0,
            }}
          >
            {/* Same Size Card Wrapper */}
            <div style={{
              width: '100%',
              height: '100%',
              background: isDark 
                ? 'rgba(30, 39, 73, 0.6)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isDark 
                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                : '0 4px 20px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = isDark
                ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.3)'
                : '0 12px 32px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.5)' : 'rgba(33, 150, 243, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDark
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 4px 20px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
            }}
            >
              {/* Gradient Border on Hover */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #00e5ff 0%, #7c4dff 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              />

              {/* Card Content */}
              <div style={{ 
                flex: 1, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {item.media ? (
                  <PostCard post={item} showActions={false} />
                ) : (
                  <PodcastCard podcast={item} showActions={false} />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll Indicator */}
      {currentContent.length > 3 && (
        <div style={{
          textAlign: 'center',
          marginTop: '0.5rem',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '1.2rem' }}>👉</span>
          <span style={{ fontWeight: '500' }}>Swipe to see more</span>
          <span style={{ fontSize: '1.2rem' }}>👈</span>
        </div>
      )}
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.emptyState}
    >
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={styles.emptyIcon}
      >
        {activeTab === 'posts' ? '📝' : activeTab === 'podcasts' ? '🚀' : '🌟'}
      </motion.div>
      <h3 style={styles.emptyTitle}>
        {searchTerm ? 'No results found' : `No ${activeTab === 'all' ? 'content' : activeTab} yet`}
      </h3>
      <p style={styles.emptyText}>
        {searchTerm ? 'Try different search terms' : 'Be the first to share!'}
      </p>
    </motion.div>
  )}
</AnimatePresence>

{/* Custom Scrollbar Styles */}
<style>{`
  /* Pulse animation for scroll hint */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Horizontal scrollbar styling */
  div::-webkit-scrollbar {
    height: 8px;
  }
  
  div::-webkit-scrollbar-track {
    background: ${isDark ? '#1e2749' : '#f0f2f5'};
    border-radius: 10px;
    margin: 0 0.5rem;
  }
  
  div::-webkit-scrollbar-thumb {
    background: ${isDark 
      ? 'linear-gradient(90deg, #7c4dff, #00e5ff)' 
      : 'linear-gradient(90deg, #2196f3, #00bcd4)'};
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  div::-webkit-scrollbar-thumb:hover {
    background: ${isDark 
      ? 'linear-gradient(90deg, #9d6fff, #00ffff)' 
      : 'linear-gradient(90deg, #1976d2, #0097a7)'};
  }
  
  /* Smooth scrolling on all devices */
  * {
    -webkit-overflow-scrolling: touch;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    div::-webkit-scrollbar {
      height: 4px;
    }
  }
  
  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    div::-webkit-scrollbar {
      display: none;
    }
  }
`}</style>
</div>


      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          ${styles.filterBar} {
            flex-direction: column;
            align-items: stretch;
          }
          ${styles.filterLeft},
          ${styles.filterRight} {
            width: 100%;
            justify-content: center;
          }
          ${styles.grid} {
            grid-template-columns: 1fr;
          }
        }
        
        input::placeholder {
          color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
        }
        
        option {
          background: ${isDark ? '#1e2749' : '#ffffff'};
          color: ${isDark ? '#ffffff' : '#1a1a1a'};
        }
      `}</style>
    </div>
  );
};

export default Home;
