import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';

const VideoPlayer = ({ url, thumbnail, onPlay }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  console.log('🎬 VideoPlayer props:', { url, thumbnail });

  const handlePlayPause = () => {
    console.log('Play/Pause clicked, current state:', playing);
    setPlaying(!playing);
    if (!playing && onPlay) {
      onPlay();
    }
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    playerRef.current.seekTo(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReady = () => {
    console.log('✅ Video player ready');
  };

  const handleError = (error) => {
    console.error('❌ Video player error:', error);
  };

  const handleDuration = (duration) => {
    console.log('⏱️ Video duration:', duration);
    setDuration(duration);
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden bg-black">
      {/* Video Player */}
      <div className="relative" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onReady={handleReady}
          onError={handleError}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                crossOrigin: 'anonymous'
              }
            }
          }}
          light={thumbnail || false}
          playIcon={
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl"
            >
              <FiPlay className="text-white text-4xl ml-1" />
            </motion.div>
          }
        />
      </div>

      {/* Custom Controls */}
      {playing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4"
        >
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
              className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-white/80 mt-1">
              <span>{formatTime(played * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
                className="text-white text-2xl hover:text-purple-400 transition"
              >
                {playing ? <FiPause /> : <FiPlay />}
              </motion.button>

              {/* Time Display */}
              <span className="text-white text-sm font-mono">
                {formatTime(played * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Volume */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="text-white text-xl hover:text-purple-400 transition"
                >
                  {muted ? <FiVolumeX /> : <FiVolume2 />}
                </motion.button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>

              {/* Fullscreen */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="text-white text-xl hover:text-purple-400 transition"
              >
                {fullscreen ? <FiMinimize /> : <FiMaximize />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {!playing && !thumbnail && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayPause}
            className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl"
          >
            <FiPlay className="text-white text-4xl ml-1" />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
