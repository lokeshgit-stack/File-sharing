import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { FiMaximize, FiMinimize, FiVolume2, FiVolumeX, FiPictureInPicture } from 'react-icons/fi';

const VideoPlayer = ({ url, title }) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef(null);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleToggleMute = () => {
    setMuted(!muted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handlePictureInPicture = async () => {
    try {
      const videoElement = playerRef.current.getInternalPlayer();
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoElement.readyState >= 2) { // Check if metadata is loaded
        await videoElement.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const handleReady = () => {
    setReady(true);
  };

   return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-900"
    >
      <div className={`relative ${fullscreen ? 'h-screen' : 'aspect-video'}`}>
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          controls={true}
          pip={false}
          stopOnUnmount={true}
          onReady={handleReady}
          className="react-player"
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                onContextMenu: e => e.preventDefault()
              }
            }
          }}
        />
        
        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleToggleMute}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  {muted || volume === 0 ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-purple-500"
                />
              </div>

              {/* PiP Button */}
              {ready && document.pictureInPictureEnabled && (
                <button
                  onClick={handlePictureInPicture}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  title="Picture in Picture"
                >
                  <FiMaximize2 size={20} />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Title */}
              <span className="text-sm font-medium truncate max-w-md">
                {title}
              </span>

              {/* Fullscreen Toggle */}
              <button 
                onClick={handleToggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                {fullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;