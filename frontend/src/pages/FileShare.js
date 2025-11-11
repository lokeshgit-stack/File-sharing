import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiLock, FiCalendar, FiDownload, FiX } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FileShareResult from './FileShareResult';

const FileShare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    isPublic: false,
    isPasswordProtected: false,
    password: '',
    expiryDays: '',
    maxDownloads: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        toast.error('File size must be less than 200MB');
        return;
      }
      setFormData({ ...formData, file, title: formData.title || file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', formData.file);
    data.append('isPublic', formData.isPublic);
    data.append('isPasswordProtected', formData.isPasswordProtected);
    if (formData.isPasswordProtected) {
      data.append('password', formData.password);
    }
    if (formData.expiryDays) {
      data.append('expiryDays', formData.expiryDays);
    }
    if (formData.maxDownloads) {
      data.append('maxDownloads', formData.maxDownloads);
    }

    try {
      const token = localStorage.getItem('token');
      const { data: result } = await axios.post('http://localhost:5000/api/files', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setUploadedFile(result);
      toast.success('File uploaded successfully!');
      setTimeout(() => navigate('/my-files'), 10);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (uploadedFile) {
    return <FileShareResult file={uploadedFile} onClose={() => {
      setUploadedFile(null);
      setFormData({
        title: '',
        description: '',
        file: null,
        isPublic: false,
        isPasswordProtected: false,
        password: '',
        expiryDays: '',
        maxDownloads: ''
      });
    }} />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl font-bold mb-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <span className="gradient-text">Secure File</span>
              <br />
              <span className="text-white">Sharing</span>
            </motion.h1>
            <p className="text-white/70 text-lg">
              Upload and share files securely with QR codes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-effect rounded-3xl p-8">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-3">File (Max 200MB) *</label>
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center ${formData.file ? 'border-green-500' : 'border-white/30'}`}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  {formData.file ? (
                    <div>
                      <FiFile className="text-6xl text-green-400 mx-auto mb-4" />
                      <p className="text-white">{formData.file.name}</p>
                      <p className="text-white/60 text-sm">{(formData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <FiUpload className="text-6xl text-purple-400 mx-auto mb-4" />
                      <p className="text-white">Click to select file</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-3">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass-effect text-white px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter file title"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-3">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full glass-effect text-white px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows="3"
                placeholder="Optional description"
              />
            </div>

            {/* Security Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Password Protection */}
              <div>
                <label className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.isPasswordProtected}
                    onChange={(e) => setFormData({ ...formData, isPasswordProtected: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white font-bold flex items-center">
                    <FiLock className="mr-2" /> Password Protect
                  </span>
                </label>
                {formData.isPasswordProtected && (
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full glass-effect text-white px-4 py-3 rounded-xl outline-none"
                    placeholder="Enter password"
                    required={formData.isPasswordProtected}
                  />
                )}
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-white font-bold mb-3 flex items-center">
                  <FiCalendar className="mr-2" /> Expires In (Days)
                </label>
                <input
                  type="number"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                  className="w-full glass-effect text-white px-4 py-3 rounded-xl outline-none"
                  placeholder="Leave empty for never"
                  min="1"
                />
              </div>
            </div>

            {/* Max Downloads */}
            <div className="mb-6">
              <label className="block text-white font-bold mb-3 flex items-center">
                <FiDownload className="mr-2" /> Max Downloads (0 = Unlimited)
              </label>
              <input
                type="number"
                value={formData.maxDownloads}
                onChange={(e) => setFormData({ ...formData, maxDownloads: e.target.value })}
                className="w-full glass-effect text-white px-4 py-3 rounded-xl outline-none"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="mb-6">
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-white/80 mt-2">{uploadProgress}%</p>
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={uploading || !formData.file}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload & Generate Share Link'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default FileShare;
