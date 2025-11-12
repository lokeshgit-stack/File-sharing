import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiTrash2, FiEye, FiHeart, FiVideo, FiMusic } from 'react-icons/fi';
import { BsSoundwave } from 'react-icons/bs';
import { podcastAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import VideoPlayer from './VideoPlayer';

const PodcastCard = ({ podcast, onDelete, showActions = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const navigate = useNavigate();

  const isVideo = podcast.mediaType === 'video';

  useEffect(() => {
    if (!isVideo && audioRef.current) {
      const audio = audioRef.current;

      const updateProgress = () => {
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
    // Reset playback when the podcast changes
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [isVideo, podcast.id]);

  const handlePlay = async () => {
    if (isVideo) {
      setShowVideoPlayer(true);
      await podcastAPI.play(podcast.id);
    } else {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
      } else {
        try {
          await audio.play();
          await podcastAPI.play(podcast.id);
          toast.success('Playing podcast!', { icon: '🎵' });
        } catch (err) {
          toast.error('Failed to play audio.');
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoPlay = async () => {
    await podcastAPI.play(podcast.id);
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this?')) {
      onDelete(podcast.id);
      toast.success('Deleted successfully!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!', {
      icon: isLiked ? '💔' : '❤️'
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
        className="glass-effect rounded-2xl overflow-hidden group cursor-pointer relative"
      >
        {/* Thumbnail / Video Preview */}
        {isVideo ? (
          <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-blue-900">
            {podcast.thumbnailUrl ? (
              <img
                src={podcast.thumbnailUrl}
                alt={podcast.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiVideo className="text-white/50 text-6xl" />
              </div>
            )}

            {/* Play Overlay */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <FiPlay className="text-white text-3xl ml-1" />
              </div>
            </motion.div>

            {/* Media Type Badge */}
            <div className="absolute top-3 left-3 bg-purple-600 px-3 py-1 rounded-full flex items-center space-x-2">
              <FiVideo className="text-white" />
              <span className="text-white text-xs font-bold">VIDEO</span>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiMusic className="text-white/30 text-6xl" />
            </motion.div>
            <div className="absolute top-3 left-3 bg-pink-600 px-3 py-1 rounded-full flex items-center space-x-2">
              <FiMusic className="text-white" />
              <span className="text-white text-xs font-bold">AUDIO</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Title / Description */}
          <div className="flex items-start justify-between mb-4">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }}>
              <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                {podcast.title}
              </h3>
              <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                {podcast.description}
              </p>
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
                <span className="text-white/80">by {podcast.owner}</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-2 text-purple-300"
                whileHover={{ scale: 1.1 }}
              >
                <BsSoundwave className="animate-pulse" />
                <span>{podcast.plays} plays</span>
              </motion.div>
            </div>
            {podcast.fileSize && (
              <span className="text-white/60 text-xs">{formatFileSize(podcast.fileSize)}</span>
            )}
          </div>

          {/* Audio Element (only for audio) */}
          {!isVideo && (
            <>
              <audio
                ref={audioRef}
                src={podcast.s3Url}
                onEnded={() => setIsPlaying(false)}
                onError={() => toast.error('Audio failed to load!')}
              />
              <div className="mb-4">
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(podcast.duration || 0)}</span>
                </div>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold"
            >
              {isVideo ? (
                <>
                  <FiPlay className="text-xl ml-1" />
                  <span>Play Video</span>
                </>
              ) : (
                <>
                  {isPlaying ? <FiPause className="text-xl" /> : <FiPlay className="text-xl ml-1" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </>
              )}
            </motion.button>
            {/* <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(`/podcast/${podcast.id}`)}
              className="glass-effect p-3 rounded-full hover:bg-white/20"
            >
              <FiEye className="text-xl text-white" />
            </motion.button> */}

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

      {/* Full-Screen Video Player Modal */}
<AnimatePresence>
  {showVideoPlayer && isVideo && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={() => setShowVideoPlayer(false)}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="w-full max-w-6xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{podcast.title}</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowVideoPlayer(false)}
            className="text-white text-3xl hover:text-red-400"
          >
            ×
          </motion.button>
        </div>
        <video
        src={podcast.url || podcast.s3Url}
        controls
        autoPlay
        style={{ width: '100%', maxHeight: '600px', borderRadius: '1rem' }}
      />
        <div className="mt-4 text-white/70 text-sm">
          <p>{podcast.description}</p>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </>
  );
};

export default PodcastCard;
