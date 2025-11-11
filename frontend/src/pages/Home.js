import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { podcastAPI } from '../services/api';
import PodcastCard from '../components/PodcastCard';
import toast from 'react-hot-toast';

const Home = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadPodcasts();
  }, []); // ← Load on mount

  useEffect(() => {
    filterAndSortPodcasts();
  }, [searchTerm, sortBy, podcasts]); // ← Update when filters change

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
    loadPodcasts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎙️
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden py-20 px-4"
      >
        <div className="container mx-auto text-center relative z-10">
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <span className="gradient-text">Discover Amazing</span>
            <br />
            <span className="text-white">Podcasts</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Share your voice, discover new perspectives
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass-effect rounded-full p-2 flex items-center shadow-2xl">
              <FiSearch className="text-white text-2xl ml-4" />
              <input
                type="text"
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-white/50"
              />
            </div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
              style={{
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
      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <motion.div 
          className="flex flex-wrap items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center space-x-4">
            <FiTrendingUp className="text-purple-400 text-2xl" />
            <h2 className="text-2xl font-bold text-white">
              {searchTerm ? 'Search Results' : 'Featured Podcasts'}
            </h2>
            <motion.span 
              className="glass-effect px-4 py-1 rounded-full text-white/80"
              whileHover={{ scale: 1.05 }}
            >
              {filteredPodcasts.length} episodes
            </motion.span>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="glass-effect p-3 rounded-full"
            >
              <FiRefreshCw className="text-white" />
            </motion.button>

            <FiFilter className="text-white/60" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-effect text-white px-4 py-2 rounded-lg outline-none cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </motion.div>

        {/* Podcasts Grid */}
        <AnimatePresence>
          {filteredPodcasts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredPodcasts.map((podcast, index) => (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PodcastCard podcast={podcast} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🎙️
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {searchTerm ? 'No podcasts found' : 'No podcasts yet'}
              </h3>
              <p className="text-white/60 text-lg">
                {searchTerm ? 'Try different search terms' : 'Be the first to upload!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
