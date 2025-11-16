import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiLock, FiCalendar, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { fileAPI } from '../services/api'; // Use fileAPI instead of direct axios
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

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

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.isPasswordProtected && !formData.password.trim()) {
      toast.error('Password is required if enabled');
      return;
    }

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('file', formData.file);
    data.append('isPublic', formData.isPublic);
    data.append('isPasswordProtected', formData.isPasswordProtected);
    if (formData.isPasswordProtected) data.append('password', formData.password);
    if (formData.expiryDays) data.append('expiryDays', formData.expiryDays);
    if (formData.maxDownloads) data.append('maxDownloads', formData.maxDownloads);

    try {
      const { data: result } = await fileAPI.upload(data, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setUploadedFile(result);
      toast.success('File uploaded successfully!');
      setTimeout(() => navigate('/my-files'), 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Styles fixed and enhanced for alignment and appearance
  const styles = {
    container: {
      minHeight: '100vh',
      padding: '3rem 1rem',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    wrapper: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.8)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: isDark 
        ? '0 20px 60px rgba(0,0,0,0.6)' 
        : '0 10px 40px rgba(0,0,0,0.1)',
      border: `1px solid ${isDark ? 'rgba(0,229,255,0.2)' : 'rgba(33,150,243,0.2)'}`,
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    titleContainer: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.8rem',
      fontWeight: '900',
      color: isDark ? '#ffffff' : '#1a1a1a',
      userSelect: 'none',
      background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)',
      fontSize: '1rem',
      userSelect: 'none',
    },
    label: {
      display: 'block',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: isDark ? '#ffffff' : '#1a1a1a',
      cursor: 'pointer',
      userSelect: 'none',
    },
    input: {
      width: '100%',
      padding: '0.85rem 1rem',
      borderRadius: '12px',
      border: `1.5px solid ${isDark ? 'rgba(0,229,255,0.3)' : 'rgba(33,150,243,0.5)'}`,
      background: isDark ? 'rgba(10,14,39,0.7)' : 'rgba(255,255,255,0.9)',
      color: isDark ? '#fff' : '#1a1a1a',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      marginBottom: '1.5rem',
    },
    textarea: {
      resize: 'vertical',
      minHeight: '100px',
      width: '100%',
      padding: '0.85rem 1rem',
      borderRadius: '12px',
      border: `1.5px solid ${isDark ? 'rgba(0,229,255,0.3)' : 'rgba(33,150,243,0.5)'}`,
      background: isDark ? 'rgba(10,14,39,0.7)' : 'rgba(255,255,255,0.9)',
      color: isDark ? '#fff' : '#1a1a1a',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      marginBottom: '1.5rem',
    },
    fileUpload: {
      border: `2px dashed ${isDark ? 'rgba(0,229,255,0.4)' : 'rgba(33,150,243,0.5)'}`,
      borderRadius: '16px',
      padding: '3rem 1rem',
      textAlign: 'center',
      cursor: uploading ? 'not-allowed' : 'pointer',
      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)',
      marginBottom: '2rem',
      userSelect: 'none',
    },
    fileName: {
      marginTop: '1rem',
      color: isDark ? '#a5f3fc' : '#2563eb',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    removeFileBtn: {
      marginTop: '0.5rem',
      color: '#ef4444',
      fontWeight: '600',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      fontSize: '0.9rem',
      textDecoration: 'underline',
      userSelect: 'none',
    },
    submitBtn: {
      width: '100%',
      background: uploading ? 'rgba(124, 77, 255, 0.6)' : 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#fff',
      padding: '1rem',
      fontWeight: '700',
      fontSize: '1.125rem',
      borderRadius: '9999px',
      border: 'none',
      cursor: uploading ? 'not-allowed' : 'pointer',
      boxShadow: '0 4px 20px rgba(124, 77, 255, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
    },
    securityOptionsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem',
      alignItems: 'center',
    },
    checkboxLabel: {
      cursor: 'pointer',
      userSelect: 'none',
      color: isDark ? '#fff' : '#1a1a1a',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: '150px',
    },
    securityInput: {
      flex: '1 1 140px',
      minWidth: '140px',
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
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.wrapper}>
        <div style={styles.titleContainer}>
          <motion.h1 style={styles.title} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
            Secure File<br />Sharing
          </motion.h1>
          <p style={styles.subtitle}>Upload and share files securely with QR codes</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* File Upload */}
          <label htmlFor="file-upload" style={styles.label}>
            File (Max 200MB) *
          </label>
          <div style={styles.fileUpload} onClick={() => !uploading && document.getElementById('file-upload').click()}>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {formData.file ? (
              <>
                <FiFile size={72} color="#22c55e" style={{ display: 'block', margin: '0 auto 1rem' }} />
                <p style={styles.fileName} title={formData.file.name}>{formData.file.name}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData({ ...formData, file: null });
                  }}
                  style={styles.removeFileBtn}
                  disabled={uploading}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                {/* <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <FiUpload size={72} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} />
                </motion.div> */}
                <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '1rem' }}>
                  Click to select file
                </p>
                <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)', fontSize: '0.85rem' }}>
                  or drag and drop
                </p>
              </>
            )}
          </div>

          {/* Title */}
          <label htmlFor="title" style={styles.label}>Title *</label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={styles.input}
            placeholder="Enter file title"
            disabled={uploading}
          />

          {/* Description */}
          <label htmlFor="description" style={styles.label}>Description (Optional)</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            style={styles.textarea}
            placeholder="Add a description..."
            disabled={uploading}
          />

          {/* Security Options */}
          <div style={styles.securityOptionsContainer}>
            {/* Password Protect */}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isPasswordProtected}
                onChange={(e) => setFormData({ ...formData, isPasswordProtected: e.target.checked })}
                disabled={uploading}
              />
              <FiLock />
              Password Protect
            </label>

            {/* Password Input */}
            {formData.isPasswordProtected && (
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={styles.input}
                placeholder="Enter password"
                required
                disabled={uploading}
              />
            )}

            {/* Expiry Days */}
            <div style={styles.securityInput}>
              <label style={styles.label}>
                <FiCalendar style={{ marginRight: '0.4rem' }} />
                Expires In (Days)
              </label>
              <input
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
                style={styles.input}
                placeholder="Never expires"
                min="1"
                disabled={uploading}
              />
            </div>

            {/* Max Downloads */}
            <div style={styles.securityInput}>
              <label style={styles.label}>
                <FiDownload style={{ marginRight: '0.4rem' }} />
                Max Downloads (0 = Unlimited)
              </label>
              <input
                type="number"
                value={formData.maxDownloads}
                onChange={(e) => setFormData({ ...formData, maxDownloads: e.target.value })}
                style={styles.input}
                placeholder="Unlimited"
                min="0"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={uploading || !formData.file || !formData.title}
            whileHover={{ scale: uploading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={styles.submitBtn}
          >
            {uploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ marginRight: '0.5rem' }}
                >
                  <FiUpload />
                </motion.div>
                Uploading...
              </>
            ) : 'Upload & Generate Share Link'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default FileShare;
