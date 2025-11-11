import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiCopy, FiEye, FiClock, FiTrash2, FiKey } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FileShareResult = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrFileId, setQrFileId] = useState(null); // ID of file whose QR is shown
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      const response = await api.get('/files');
      setFiles(response.data || []);
    } catch (error) {
      toast.error('Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = async (file) => {
    try {
      const shareUrl = file.shareUrl || `${window.location.origin}/share/${file.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyCode = async (file) => {
    try {
      await navigator.clipboard.writeText(file.accessCode);
      toast.success('Access code copied!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  // Download uses access code (user must input it; for demo, pre-fill/access code for owner)
  const handleDownload = async (file) => {
    try {
      const code = file.accessCode;
      const res = await api.post(`/files/download/${file.shareId}`, { accessCode: code });
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        toast.success('Download started');
      } else {
        toast.error('Unable to download');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        'Failed to start download'
      );
    }
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
        <h1 className="text-3xl font-bold text-white mb-8">My Files</h1>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No files uploaded yet.</p>
            <button
              onClick={() => navigate('/file-share')}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
            >
              Upload a File
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 shadow-xl rounded-xl border border-gray-700/40 p-6 flex flex-col relative"
              >
                {/* File Actions */}
                <button
                  onClick={() => handleDelete(file._id)}
                  title="Delete file"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition z-10"
                >
                  <FiTrash2 size={20} />
                </button>
                {/* File Header */}
                <h2 className="text-xl text-white break-all font-semibold mb-3">{file.title}</h2>
                <p className="mb-3 text-gray-300 text-sm break-all">{file.originalName}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-900/60 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Size</p>
                    <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Views</p>
                    <span>
                      <FiEye className="inline-block mr-1" />
                      {file.views || 0}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-900/60 p-3 rounded-lg text-white/90">
                    <p className="text-xs uppercase font-bold text-gray-400 mb-1">Access Code</p>
                    <span className="flex items-center gap-2 font-mono text-base">
                      {file.accessCode}{' '}
                      <button
                        title="Copy code"
                        onClick={() => handleCopyCode(file)}
                        className="ml-1 text-purple-400 hover:text-purple-200"
                      >
                        <FiCopy size={16} />
                      </button>
                    </span>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded-lg text-white/90 flex flex-col items-start">
                    <span className="text-xs uppercase font-bold text-gray-400 mb-1 flex items-center">
                      <FiClock className="mr-1" /> 
                      Expires
                    </span>
                    <span>
                      {file.expiresAt
                        ? new Date(file.expiresAt).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                </div>

                {/* QR Code (toggle display) */}
                {qrFileId === file._id && (
                  <div className="text-center my-4">
                    <QRCodeSVG
                      value={file.shareUrl || `${window.location.origin}/share/${file.shareId}`}
                      size={180}
                      level="H"
                      className="inline-block bg-white rounded-lg p-2"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-between mt-auto pt-4">
                  <button
                    onClick={() => handleDownload(file)}
                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:from-blue-700 hover:to-green-700 transition"
                  >
                    <FiDownload size={18} /> Download
                  </button>
                  <button
                    onClick={() =>
                      setQrFileId(qrFileId === file._id ? null : file._id)
                    }
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    <FiShare2 size={18} /> {qrFileId === file._id ? 'Hide QR' : 'Show QR'}
                  </button>
                  <button
                    onClick={() => handleCopyShareLink(file)}
                    className="bg-gray-700/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-600 transition"
                  >
                    <FiCopy size={18} /> Copy Link
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
