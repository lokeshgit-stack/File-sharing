import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiCopy, FiEye, FiClock, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FileShareResult = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/files/shared-with-me');
        setFiles(response.data);
      } catch (err) {
        toast.error('Error fetching shared files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (fileId) => {
    try {
      const response = await api.get(`/files/download/${fileId}`);
      window.location.href = response.data.url;
      toast.success('Download started');
    } catch (err) {
      toast.error('Error starting download');
    }
  };

  const handleShare = async (file) => {
    try {
      // Create share link if not exists
      if (!file.shareId) {
        const response = await api.post(`/files/${file._id}/share`);
        const updatedFile = { ...file, ...response.data };
        setFiles(files.map(f => f._id === file._id ? updatedFile : f));
        setSelectedFile(updatedFile);
      } else {
        setSelectedFile(selectedFile?._id === file._id ? null : file);
      }
      setShowQR(false);
    } catch (err) {
      toast.error('Error creating share link');
    }
  };

  const handleCopyLink = async (file) => {
    try {
      const shareUrl = `${window.location.origin}/share/${file.shareId}`;
      const shareText = `
File: ${file.originalName}
Access Link: ${shareUrl}
${file.accessCode ? `Access Code: ${file.accessCode}` : ''}
${file.expiresAt ? `\nExpires on: ${new Date(file.expiresAt).toLocaleDateString()}` : ''}`;

      await navigator.clipboard.writeText(shareText.trim());
      setCopiedId(file._id);
      toast.success('Share link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy share link');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Shared Files</h1>
      
      {files.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>No files have been shared with you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map(file => (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg text-white font-medium">{file.originalName}</h3>
                  <p className="text-sm text-gray-400">
                    Shared by: {file.owner.username} • 
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB • 
                    Shared on: {new Date(file.sharedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleShare(file)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    title="Share file"
                  >
                    <FiShare2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDownload(file._id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FiDownload size={18} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {selectedFile?._id === file._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Share Link</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleCopyLink(file)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        {copiedId === file._id ? <FiCheck size={18} className="text-green-500" /> : <FiCopy size={18} />}
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={`${window.location.origin}/share/${file.shareId}`}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300"
                  />

                  {showQR && (
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG
                        value={`${window.location.origin}/share/${file.shareId}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileShareResult;