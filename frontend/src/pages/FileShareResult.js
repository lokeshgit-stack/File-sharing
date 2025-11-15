import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiCopy, FiEye, FiClock, FiTrash2, FiFile, FiFolder } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FileShareResult = () => {
  const [fileShares, setFileShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrShareId, setQrShareId] = useState(null); // ID of share whose QR is shown
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      const response = await api.get('/files');
      setFileShares(response.data || []);
    } catch (error) {
      toast.error('Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = async (share) => {
    try {
      const shareUrl = share.shareUrl || `${window.location.origin}/share/${share.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyCode = async (accessCode) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      toast.success('Access code copied!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleDelete = async (shareId) => {
    if (!window.confirm('Are you sure you want to delete this share? All files will be deleted.')) return;
    try {
      await api.delete(`/files/${shareId}`);
      setFileShares(fileShares.filter(share => share._id !== shareId));
      toast.success('Share deleted');
    } catch (error) {
      toast.error('Failed to delete share');
    }
  };

  const handleDownload = async (share) => {
    try {
      const payload = {};
      
      // Add access code if present
      if (share.accessCode) {
        payload.accessCode = share.accessCode;
      }
      
      // Add password if needed (for owner, might not have password stored)
      // For owner viewing their own files, we'll just try without password first
      
      const res = await api.post(`/files/download/${share.shareId}`, payload);
      
      if (res.data?.downloads && res.data.downloads.length > 0) {
        // Download all files
        res.data.downloads.forEach((download, index) => {
          setTimeout(() => {
            window.open(download.url, '_blank');
          }, index * 500); // Stagger downloads by 500ms
        });
        toast.success(`Downloading ${res.data.downloads.length} file(s)`);
      } else {
        toast.error('Unable to download');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Failed to start download';
      toast.error(errorMsg);
      
      // If password required, prompt user
      if (errorMsg === 'Password required') {
        const password = prompt('Enter password to download:');
        if (password) {
          try {
            const res = await api.post(`/files/download/${share.shareId}`, {
              accessCode: share.accessCode,
              password
            });
            if (res.data?.downloads && res.data.downloads.length > 0) {
              res.data.downloads.forEach((download, index) => {
                setTimeout(() => {
                  window.open(download.url, '_blank');
                }, index * 500);
              });
              toast.success(`Downloading ${res.data.downloads.length} file(s)`);
            }
          } catch (err) {
            toast.error('Invalid password or download failed');
          }
        }
      }
    }
  };

  const getTotalSize = (files) => {
    const total = files.reduce((sum, file) => sum + (file.fileSize || 0), 0);
    return (total / 1024 / 1024).toFixed(2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-700/50 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Files</h1>
          <button
            onClick={() => navigate('/file-share')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Upload Files
          </button>
        </div>

        {fileShares.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl mb-4"
            >
              📁
            </motion.div>
            <p className="text-gray-400 text-lg mb-6">No files uploaded yet.</p>
            <button
              onClick={() => navigate('/file-share')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition font-semibold"
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {fileShares.map((share) => (
              <motion.div
                key={share._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl border border-white/10 p-6 flex flex-col relative hover:border-purple-500/50 transition"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(share._id)}
                  title="Delete share"
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition z-10"
                >
                  <FiTrash2 size={20} />
                </button>

                {/* Share Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiFolder className="text-purple-400 text-2xl" />
                    <h2 className="text-xl text-white font-semibold break-all">
                      {share.title || 'Untitled Share'}
                    </h2>
                  </div>
                  {share.description && (
                    <p className="text-gray-400 text-sm break-all">
                      {share.description}
                    </p>
                  )}
                </div>

                {/* Files List */}
                <div className="mb-4 bg-black/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-xs uppercase font-bold text-gray-400 mb-2">
                    Files ({share.files?.length || 0})
                  </p>
                  {share.files && share.files.length > 0 ? (
                    <ul className="space-y-1">
                      {share.files.map((file, idx) => (
                        <li key={idx} className="text-sm text-white/80 flex items-center gap-2">
                          <FiFile className="text-purple-400" />
                          <span className="truncate">{file.originalName}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No files</p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/30 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Total Size</p>
                    <span>{getTotalSize(share.files || [])} MB</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Views</p>
                    <span className="flex items-center gap-1">
                      <FiEye />
                      {share.views || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {share.hasAccessCode && share.accessCode && (
                    <div className="bg-black/30 p-3 rounded-lg text-white/90">
                      <p className="text-xs uppercase font-bold text-gray-400 mb-1">Access Code</p>
                      <span className="flex items-center gap-2 font-mono text-sm">
                        {share.accessCode}
                        <button
                          title="Copy code"
                          onClick={() => handleCopyCode(share.accessCode)}
                          className="text-purple-400 hover:text-purple-200"
                        >
                          <FiCopy size={14} />
                        </button>
                      </span>
                    </div>
                  )}
                  <div className="bg-black/30 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <FiClock />
                      Expires
                    </p>
                    <span className="text-xs">
                      {share.expiresAt
                        ? new Date(share.expiresAt).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Downloads</p>
                    <span>
                      {share.downloads || 0}
                      {share.maxDownloads > 0 ? ` / ${share.maxDownloads}` : ' / ∞'}
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                {qrShareId === share._id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center my-4"
                  >
                    <QRCodeSVG
                      value={share.shareUrl || `${window.location.origin}/share/${share.shareId}`}
                      size={180}
                      level="H"
                      className="inline-block bg-white rounded-lg p-3"
                    />
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                  <button
                    onClick={() => handleDownload(share)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:from-blue-700 hover:to-green-700 transition"
                  >
                    <FiDownload size={16} /> Download
                  </button>
                  <button
                    onClick={() => setQrShareId(qrShareId === share._id ? null : share._id)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    <FiShare2 size={16} /> {qrShareId === share._id ? 'Hide' : 'QR'}
                  </button>
                  <button
                    onClick={() => handleCopyShareLink(share)}
                    className="flex-1 bg-gray-700/80 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-gray-600 transition"
                  >
                    <FiCopy size={16} /> Link
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FileShareResult;
