import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiLock, FiEye, FiClock, FiUser, FiFile, FiAlertCircle } from 'react-icons/fi';
import { fileAPI } from '../services/api';
import toast from 'react-hot-toast';

const PublicFileShare = () => {
  const { shareId } = useParams();
  const [fileShare, setFileShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');
  const [requiresAccessCode, setRequiresAccessCode] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileShare();
  }, [shareId]);

  const fetchFileShare = async (code = '') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await fileAPI.getShared(shareId, code);
      setFileShare(data);
      setRequiresAccessCode(false);
      setRequiresPassword(data.isPasswordProtected);
    } catch (err) {
      const errorData = err.response?.data;
      
      if (errorData?.requiresAccessCode) {
        setRequiresAccessCode(true);
        setError('Access code required');
      } else if (err.response?.status === 403) {
        toast.error('Invalid access code');
        setAccessCode('');
      } else if (err.response?.status === 410) {
        setError(errorData?.error || 'This share link has expired or reached download limit');
      } else if (err.response?.status === 404) {
        setError('Share link not found');
      } else {
        setError('Failed to load shared files');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error('Please enter access code');
      return;
    }
    fetchFileShare(accessCode);
  };

  const handleDownload = async () => {
    if (fileShare.isPasswordProtected && !password) {
      toast.error('Please enter password');
      return;
    }

    try {
      setDownloading(true);
      const payload = {
        accessCode: accessCode || null
      };

      if (fileShare.isPasswordProtected) {
        payload.password = password;
      }

      const { data } = await fileAPI.download(shareId, payload);

      if (data.downloads && data.downloads.length > 0) {
        // Download all files with staggered timing
        data.downloads.forEach((download, index) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = download.url;
            link.download = download.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, index * 500);
        });

        toast.success(`Downloading ${data.downloads.length} file(s)!`);
        
        // Refresh file info to update download count
        setTimeout(() => fetchFileShare(accessCode), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error;
      
      if (errorMsg === 'Invalid password') {
        toast.error('Incorrect password');
        setPassword('');
      } else if (errorMsg === 'Invalid access code') {
        toast.error('Invalid access code');
        setAccessCode('');
        setRequiresAccessCode(true);
      } else if (err.response?.status === 410) {
        toast.error(errorMsg || 'Download limit reached or link expired');
        setError(errorMsg);
      } else {
        toast.error('Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          📦
        </motion.div>
      </div>
    );
  }

  // Access code required
  if (requiresAccessCode && !fileShare) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-effect rounded-2xl p-8 max-w-md w-full"
        >
          <FiLock className="text-6xl text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Access Code Required
          </h2>
          <p className="text-white/70 text-center mb-6">
            This file requires an access code to view
          </p>
          <form onSubmit={handleAccessCodeSubmit}>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Enter access code"
              className="w-full glass-effect text-white px-4 py-3 rounded-lg mb-4 text-center text-lg font-mono uppercase placeholder-white/40"
              required
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition"
            >
              Access Files
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !fileShare) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">{error}</h2>
          <p className="text-white/60 mb-6">The link may be expired, invalid, or removed</p>
        </motion.div>
      </div>
    );
  }

  // File share loaded successfully
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              📦
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {fileShare?.title || 'Shared Files'}
            </h1>
            {fileShare?.description && (
              <p className="text-white/70 text-lg">{fileShare.description}</p>
            )}
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-effect rounded-lg p-4 text-center">
              <FiUser className="text-2xl text-purple-400 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Shared by</p>
              <p className="text-white font-semibold">{fileShare?.owner}</p>
            </div>
            <div className="glass-effect rounded-lg p-4 text-center">
              <FiFile className="text-2xl text-blue-400 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Files</p>
              <p className="text-white font-semibold">{fileShare?.files?.length || 0}</p>
            </div>
            <div className="glass-effect rounded-lg p-4 text-center">
              <FiEye className="text-2xl text-green-400 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Views</p>
              <p className="text-white font-semibold">{fileShare?.views || 0}</p>
            </div>
            <div className="glass-effect rounded-lg p-4 text-center">
              <FiDownload className="text-2xl text-pink-400 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Downloads</p>
              <p className="text-white font-semibold">
                {fileShare?.downloads || 0}
                {fileShare?.maxDownloads > 0 ? ` / ${fileShare.maxDownloads}` : ''}
              </p>
            </div>
          </div>

          {/* Files List */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Files</h3>
            <div className="space-y-3">
              {fileShare?.files?.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <FiFile className="text-2xl text-purple-400" />
                    <div>
                      <p className="text-white font-semibold">{file.originalName}</p>
                      <p className="text-white/60 text-sm">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Password Input */}
          {requiresPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <label className="block text-white font-bold mb-3 flex items-center">
                <FiLock className="mr-2" /> Password Required
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to download"
                className="w-full glass-effect text-white px-4 py-3 rounded-lg placeholder-white/40"
              />
            </motion.div>
          )}

          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={downloading || (requiresPassword && !password)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {downloading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <FiDownload />
                </motion.div>
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <FiDownload />
                <span>Download {fileShare?.files?.length > 1 ? 'All Files' : 'File'}</span>
              </>
            )}
          </motion.button>

          {/* Expiry Info */}
          {fileShare?.expiresAt && (
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm flex items-center justify-center">
                <FiClock className="mr-2" />
                Expires: {new Date(fileShare.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PublicFileShare;
