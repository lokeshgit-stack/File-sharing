import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiUpload } from 'react-icons/fi';
import { podcastAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PodcastCard from '../components/PodcastCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyPodcasts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadMyPodcasts();
    }
  }, [user?.id]); // ← Fixed dependency array

  const loadMyPodcasts = async () => {
    if (!user?.id) {
      console.error('User ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching podcasts for user:', user.id);
      
      const { data } = await podcastAPI.getUserPodcasts(user.id);
      
      console.log('Fetched podcasts:', data);
      setPodcasts(data || []); // ← Handle empty array
      
      if (data.length === 0) {
        toast.info('No podcasts uploaded yet');
      }
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast.error('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyPodcasts();
    setRefreshing(false);
    toast.success('Podcasts refreshed!');
  };

  const handleDelete = async (id) => {
    try {
      await podcastAPI.delete(id);
      setPodcasts(podcasts.filter(p => p.id !== id));
      toast.success('Podcast deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete podcast');
    }
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
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            className="text-5xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="gradient-text">My Podcasts</span>
          </motion.h1>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="glass-effect px-6 py-3 rounded-full flex items-center space-x-2 text-white hover:bg-white/20"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full flex items-center space-x-2 text-white font-bold"
            >
              <FiUpload />
              <span>Upload New</span>
            </motion.button>
          </div>
        </div>

        {/* Podcasts Grid */}
        <AnimatePresence>
          {podcasts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {podcasts.map((podcast, index) => (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PodcastCard 
                    podcast={podcast} 
                    onDelete={handleDelete}
                    showActions={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
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
                No Podcasts Yet
              </h3>
              <p className="text-white/60 text-lg mb-8">
                Start sharing your voice with the world!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-white font-bold text-lg"
              >
                Upload Your First Podcast
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyPodcasts;
