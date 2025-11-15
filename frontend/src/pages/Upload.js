import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { podcastAPI } from '../services/api';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    duration: 0
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        setFormData({ ...formData, file, duration: Math.floor(audio.duration) });
        toast.success('File loaded successfully!', { icon: '📁' });
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error('Please select an audio file');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading to AWS S3...');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', formData.file);
    data.append('duration', formData.duration);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      await podcastAPI.upload(data);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success('Podcast uploaded successfully!', { id: toastId, icon: '🎉' });
      setTimeout(() => navigate('/my-podcasts'), 1000);
    } catch (error) {
      toast.error('Upload failed: ' + (error.response?.data?.error || 'Server error'), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl font-bold mb-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <span className="gradient-text">Upload Your</span>
              <br />
              <span className="text-white">Podcast</span>
            </motion.h1>
            <p className="text-white/70 text-lg">
              Share your Images, Videos and Voice with the world
            </p>
          </div>

          {/* Upload Form */}
          <motion.form 
            onSubmit={handleSubmit}
            className="glass-effect rounded-3xl p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Title Input */}
            <motion.div 
              className="mb-6"
              whileHover={{ scale: 1.01 }}
            >
              <label className="block text-white font-bold mb-3 text-lg">
                Post Title *
              </label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass-effect text-white px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-white/40"
                placeholder="Give your podcast an awesome title..."
              />
            </motion.div>

            {/* Description Input */}
            <motion.div 
              className="mb-6"
              whileHover={{ scale: 1.01 }}
            >
              <label className="block text-white font-bold mb-3 text-lg">
                Description
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full glass-effect text-white px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none placeholder-white/40"
                rows="4"
                placeholder="Tell listeners what your podcast is about..."
              />
            </motion.div>

            {/* File Upload Area */}
            <motion.div 
              className="mb-8"
              whileHover={{ scale: 1.01 }}
            >
              <label className="block text-white font-bold mb-3 text-lg">
                Audio File * (MP3, WAV, OGG, M4A)
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-500/20 scale-105' 
                    : formData.file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/30 hover:border-purple-500 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic,.mp3,.wav,.ogg,.m4a,.mp4,.mov,.avi,.mkv,.webm"
              onChange={handleFileChange}
              className="hidden"
            />

            <label className="block text-white font-bold mb-3 text-lg">
              Share Your Post 
            </label>
                <AnimatePresence mode="wait">
                  {formData.file ? (
                    <motion.div
                      key="file-selected"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <FiCheck className="text-6xl text-green-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-white font-bold text-xl mb-2">
                        {formData.file.name}
                      </p>
                      <p className="text-white/60">
                        {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, file: null });
                        }}
                        className="mt-4 text-red-400 hover:text-red-300 flex items-center space-x-2 mx-auto"
                      >
                        <FiX />
                        <span>Remove</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-file"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FiUpload className="text-6xl text-purple-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-white text-xl font-bold mb-2">
                        Drag & drop your audio file here
                      </p>
                      <p className="text-white/60 mb-4">or click to browse</p>
                      <p className="text-white/40 text-sm">Max file size: 100MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Upload Progress */}
            <AnimatePresence>
              {uploading && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                    <motion.div
                      className="absolute h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <p className="text-center text-white/80 text-sm mt-2">
                    Uploading to AWS S3... {uploadProgress}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button 
              type="submit"
              disabled={uploading || !formData.file}
              whileHover={{ scale: uploading ? 1 : 1.02, boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-[length:200%_auto]"
              style={{
                backgroundPosition: uploading ? '100% center' : '0% center',
                transition: 'background-position 0.3s ease'
              }}
            >
              {uploading ? (
                <span className="flex items-center justify-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiUpload />
                  </motion.div>
                  <span>Uploading...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <FiUpload />
                  <span>Upload Podcast</span>
                </span>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
