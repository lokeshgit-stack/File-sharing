import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { podcastAPI, postAPI } from '../services/api';
import PodcastCard from '../components/PodcastCard';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import SeeAllModal from '../components/SeeAllModal';

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
  const contentRowRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user._id) {
      setCurrentUser(user);
    }
  }, []);

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
      const [podcastsData, postsData] = await Promise.all([
        podcastAPI.getAll(),
        postAPI.getAll(),
      ]);
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

  const scrollLeft = () => {
    if (contentRowRef.current) {
      contentRowRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (contentRowRef.current) {
      contentRowRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const filterAndSortContent = () => {
    let filteredP = [...podcasts];
    if (searchTerm) {
      filteredP = filteredP.filter(
        (podcast) =>
          podcast.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          podcast.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          podcast.owner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    let filteredPo = [...posts];
    if (searchTerm) {
      filteredPo = filteredPo.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.owner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const { data } = await podcastAPI.getAll();
      setPodcasts(data || []);
      setFilteredPodcasts(data || []);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast.error('Failed to load podcasts');
      setPodcasts([]);
      setFilteredPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.loading('Refreshing...');
    loadContent();
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'podcasts':
        return filteredPodcasts;
      case 'posts':
        return filteredPosts;
      case 'all':
      default:
        return [...filteredPosts, ...filteredPodcasts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const currentContent = getCurrentContent();
  const totalCount = filteredPodcasts.length + filteredPosts.length;

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
      border: `1px solid ${
        isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'
      }`,
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
      border: `1px solid ${
        isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'
      }`,
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
      color: isActive
        ? '#ffffff'
        : isDark
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(0, 0, 0, 0.6)',
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
      border: `1px solid ${
        isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'
      }`,
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
      border: `1px solid ${
        isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'
      }`,
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
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
            <span style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}>
              Content
            </span>
          </motion.h1>

          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Share your Content, discover new perspectives
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '16rem',
                height: '16rem',
                background: isDark
                  ? 'rgba(124, 77, 255, 0.1)'
                  : 'rgba(33, 150, 243, 0.1)',
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

            <div style={styles.tabContainer}>
              <button
                onClick={() => setActiveTab('posts')}
                style={styles.tabButton(activeTab === 'posts')}
              >
                Posts ({filteredPosts.length})
              </button>
            </div>
          </div>

          <div style={styles.filterRight}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              style={styles.refreshButton}
            >
              <FiRefreshCw
                style={{ color: isDark ? '#ffffff' : '#1a1a1a' }}
              />
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

        {/* Posts Horizontal Scroll with arrow navigation */}
        <AnimatePresence mode="wait">
          {filteredPosts.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  marginBottom: '1.5rem',
                  paddingLeft: '0.5rem',
                }}
              >
                📝 Recent Posts
              </h2>

              <div
                style={{
                  position: 'relative',
                  maxWidth: '100%',
                  margin: '1rem 0',
                }}
              >
                <button
                  onClick={scrollLeft}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '40%',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Scroll left"
                >
                  <FiChevronLeft size={24} />
                </button>

                <div
                  ref={contentRowRef}
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    gap: '1rem',
                    padding: '1rem 2rem',
                    // scrollbarWidth: 'thin',
                    scrollBehavior: 'smooth',
                  }}
                >
                  {filteredPosts.slice(0, 7).map((item) => (
                    <motion.div
                      key={item._id || item.id}
                      style={{
                        flex: '0 0 240px',
                        aspectRatio: '4 /8 ',
                        scrollSnapAlign: 'start',
                        borderRadius: '14px',
                        boxShadow: isDark
                          ? '0 5px 15px rgba(124, 77, 255, 0.3)'
                          : '0 5px 15px rgba(33, 150, 243, 0.3)',
                        overflow: 'hidden', // keep card content clipped so long text can't break layout
                        cursor: 'pointer',
                        position: 'relative',
                        background: isDark ? '#121212' : '#ffffff',
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PostCard
                        post={item}
                        showActions={false}
                        currentUser={currentUser}
                      />
                    </motion.div>
                  ))}

                  {/* Inline "See all" card right after 5th post */}
                  {filteredPosts.length > 7 && (
                    <motion.div
                      key="see-all-card"
                      style={{
                        flex: '0 0 240px',
                        aspectRatio: '4 / 3',
                        scrollSnapAlign: 'start',
                        borderRadius: '14px',
                        border: '1px dashed rgba(124,77,255,0.5)',
                        background: isDark
                          ? 'rgba(18,18,18,0.9)'
                          : 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                      }}
                      whileHover={{ scale: 1.04 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setModalOpen(true)}
                    >
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: isDark ? '#ffffff' : '#1a1a1a',
                          marginBottom: '0.5rem',
                          textAlign: 'center',
                        }}
                      >
                        View all posts
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: isDark
                            ? 'rgba(255,255,255,0.7)'
                            : 'rgba(0,0,0,0.7)',
                          textAlign: 'center',
                        }}
                      >
                        Scroll or click to open full screen list
                      </span>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={scrollRight}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '40%',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  aria-label="Scroll right"
                >
                  <FiChevronRight size={24} />
                </button>
              </div>

              {/* Existing See All Posts Button (kept) */}
              {filteredPosts.length > 5 && (
                <div
                  style={{ textAlign: 'center', marginTop: '0.5rem' }}
                >
                  <button
                    onClick={() => setModalOpen(true)}
                    style={{
                      background:
                        'linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      color: 'white',
                      borderRadius: '24px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    See All Posts
                  </button>
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
                📝
              </motion.div>
              <h3 style={styles.emptyTitle}>
                {searchTerm ? 'No results found' : 'No posts yet'}
              </h3>
              <p style={styles.emptyText}>
                {searchTerm
                  ? 'Try different search terms'
                  : 'Be the first to share!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal for All Posts */}
        {modalOpen && (
          <SeeAllModal
            posts={filteredPosts}
            onClose={() => setModalOpen(false)}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
