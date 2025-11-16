import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    
    if (selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setFiles(selectedFiles);

    // Generate previews
    const newPreviews = selectedFiles.map(file => ({
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'audio',
      url: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      files.forEach(file => {
        formData.append('files', file);
      });

      await postAPI.create(formData);
      
      toast.success('Post created successfully!');
      navigate('/my-posts');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

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
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '900',
      marginBottom: '1rem',
      color: isDark ? '#fff' : '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    gradientText: {
      background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      fontSize: '1rem',
      marginBottom: '2rem',
      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    label: {
      display: 'block',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: isDark ? '#fff' : '#1a1a1a',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      border: `1.5px solid ${isDark ? 'rgba(0,229,255,0.3)' : 'rgba(33,150,243,0.5)'}`,
      background: isDark ? 'rgba(10,14,39,0.7)' : 'rgba(255,255,255,0.9)',
      color: isDark ? '#fff' : '#1a1a1a',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      marginBottom: '1.25rem',
    },
    fileInputWrapper: {
      border: `2px dashed ${isDark ? 'rgba(0,229,255,0.4)' : 'rgba(33,150,243,0.5)'}`,
      borderRadius: '16px',
      padding: '3rem 1rem',
      textAlign: 'center',
      cursor: uploading ? 'not-allowed' : 'pointer',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0,0,0,0.7)',
      marginBottom: '2rem',
      transition: 'border-color 0.3s ease',
    },
    inputLabel: {
      cursor: uploading ? 'not-allowed' : 'pointer',
      display: 'block',
      marginTop: '0.5rem',
      fontSize: '1.125rem',
    },
    previewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    },
    previewCard: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '16px',
      position: 'relative',
      padding: '0.75rem',
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 2px 10px rgba(0, 0, 0, 0.1)',
      userSelect: 'none',
    },
    removeButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: '#ef4444',
      borderRadius: '9999px',
      color: '#fff',
      border: 'none',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
      fontSize: '1rem',
    },
    previewImage: {
      width: '100%',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '12px',
      marginBottom: '0.5rem',
      backgroundColor: '#222',
    },
    previewIcon: {
      fontSize: '1.75rem',
      marginBottom: '0.5rem',
    },
    previewText: {
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0,0,0,0.7)',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      userSelect: 'text',
    },
    button: {
      width: '100%',
      padding: '1rem',
      fontWeight: '700',
      fontSize: '1.125rem',
      borderRadius: '9999px',
      border: 'none',
      background: uploading ? 'rgba(124, 77, 255, 0.6)' : 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#fff',
      cursor: uploading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.75rem',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <motion.h1
          style={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>Create New Post</span>
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '1rem' }}
        >
          {/* Title */}
          <label style={styles.label} htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
            required
            style={styles.input}
            disabled={uploading}
          />

          {/* Description */}
          <label style={styles.label} htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell us about your post..."
            style={{ ...styles.input, resize: 'vertical' }}
            disabled={uploading}
          />

          {/* File Upload */}
          <label style={styles.label}>Upload Media (Max 5 files) *</label>
          <div style={styles.fileInputWrapper} onClick={() => !uploading && document.getElementById('file-upload').click()}>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {/* <FiUpload size={48} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} /> */}
            <p style={{ marginTop: '1rem', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '1rem' }}>
              Click to upload images, videos, or audio
            </p>
            <p style={{ marginTop: '0.5rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: '0.85rem' }}>
              {files.length} / 5 files selected
            </p>
          </div>

          {/* File Previews */}
          {previews.length > 0 && (
            <div style={styles.previewGrid}>
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={styles.previewCard}
                >
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    style={styles.removeButton}
                    aria-label="Remove file"
                  >
                    <FiX />
                  </button>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {preview.type === 'image' ? (
                      <>
                        <img src={preview.url} alt="" style={styles.previewImage} />
                        <FiImage color="#8b5cf6" size={24} />
                      </>
                    ) : preview.type === 'video' ? (
                      <>
                        <video src={preview.url} style={styles.previewImage} muted />
                        <FiVideo color="#3b82f6" size={24} />
                      </>
                    ) : (
                      <FiMusic color="#ec4899" size={32} />
                    )}
                    <p style={styles.previewText} title={preview.name}>{preview.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={uploading}
            whileHover={{ scale: uploading ? 1 : 1.02 }}
            whileTap={{ scale: uploading ? 1 : 0.98 }}
            style={styles.button}
          >
            {uploading ? 'Creating Post...' : 'Create Post'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default NewPost;
