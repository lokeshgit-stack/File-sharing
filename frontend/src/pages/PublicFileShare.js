import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    fetchFileShare();
    // eslint-disable-next-line
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
      const payload = { accessCode: accessCode || null };
      if (fileShare.isPasswordProtected) payload.password = password;

      const { data } = await fileAPI.download(shareId, payload);

      if (data.downloads && data.downloads.length > 0) {
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

  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
      padding: '3rem 1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    box: {
      background: isDark ? 'rgba(30, 39, 73, 0.8)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: isDark
        ? '0 20px 60px rgba(0,0,0,0.6)'
        : '0 10px 40px rgba(0,0,0,0.1)',
      border: `1px solid ${isDark ? 'rgba(0,229,255,0.2)' : 'rgba(33,150,243,0.2)'}`,
      width: '100%',
      maxWidth: 600,
      textAlign: 'center',
    },
    iconLarge: {
      fontSize: '6rem',
      marginBottom: '1rem',
      color: isDark ? '#7c4dff' : '#6b21a8',
    },
    heading: {
      fontSize: '2rem',
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#1a1a1a',
      marginBottom: '1rem',
      userSelect: 'none',
    },
    textMuted: {
      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
      marginBottom: '1.5rem',
    },
    formControl: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      border: `1.5px solid ${isDark ? 'rgba(0,229,255,0.3)' : 'rgba(33,150,243,0.5)'}`,
      background: isDark ? 'rgba(10,14,39,0.7)' : '#fff',
      color: isDark ? '#fff' : '#111',
      fontSize: '1rem',
      outline: 'none',
      marginBottom: '1rem',
    },
    button: {
      width: '100%',
      padding: '1rem',
      borderRadius: '9999px',
      border: 'none',
      background:
        'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#fff',
      fontWeight: '700',
      fontSize: '1.2rem',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.75rem',
      userSelect: 'none',
      opacity: downloading ? 0.7 : 1,
      pointerEvents: downloading ? 'none' : 'auto',
      transition: 'all 0.3s ease',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
      textAlign: 'center',
    },
    infoBox: {
      background: isDark ? 'rgba(10,14,39,0.5)' : '#f5f5f5',
      borderRadius: '16px',
      padding: '1rem',
      color: isDark ? '#ccc' : '#444',
      userSelect: 'none',
    },
    infoLabel: {
      fontSize: '0.75rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
      color: isDark ? '#888' : '#777',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    infoValue: {
      fontWeight: '700',
      fontSize: '1.1rem',
      color: isDark ? '#fff' : '#111',
    },
    fileList: {
      textAlign: 'left',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    fileItem: {
      background: isDark ? 'rgba(30, 39, 73, 0.4)' : '#f9f9f9',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: isDark ? '#ddd' : '#333',
      userSelect: 'text',
    },
    fileName: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      flexGrow: 1,
    },
    passwordInputWrapper: {
      marginBottom: '1.5rem',
    },
    smallTextCentered: {
      textAlign: 'center',
      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
      fontSize: '0.85rem',
      userSelect: 'none',
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: styles.container.background }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '4rem', color: isDark ? '#0eefff' : '#2196f3' }}>
          📦
        </motion.div>
      </div>
    );
  }

  if (requiresAccessCode && !fileShare) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <motion.div style={styles.wrapper} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <FiLock style={{ fontSize: '6rem', color: '#a78bfa', marginBottom: '1rem' }} />
          <h2 style={{ ...styles.heading, color: isDark ? '#fff' : '#1a1a1a' }}>Access Code Required</h2>
          <p style={{ ...styles.smallTextCentered, marginBottom: '1.5rem' }}>This file requires an access code to view</p>
          <form onSubmit={handleAccessCodeSubmit}>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Enter access code"
              style={{ ...styles.input, textAlign: 'center', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.2em' }}
              required
              autoFocus
            />
            <button type="submit" style={styles.submitBtn}>Access Files</button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (error && !fileShare) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FiAlertCircle style={{ fontSize: '6rem', color: '#f87171', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: isDark ? '#fff' : '#1a1a1a' }}>{error}</h2>
          <p style={{ ...styles.smallTextCentered, marginBottom: '1.5rem' }}>The link may be expired, invalid, or removed</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '5rem', marginBottom: '1rem' }}>
            📦
          </motion.div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: isDark ? '#fff' : '#111', marginBottom: '0.5rem' }}>
            {fileShare?.title || 'Shared Files'}
          </h1>
          {fileShare?.description && <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '1rem' }}>{fileShare.description}</p>}
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}><FiUser /> Shared by</div>
            <div style={styles.infoValue}>{fileShare?.owner}</div>
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}><FiFile /> Files</div>
            <div style={styles.infoValue}>{fileShare?.files?.length || 0}</div>
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}><FiEye /> Views</div>
            <div style={styles.infoValue}>{fileShare?.views || 0}</div>
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}><FiDownload /> Downloads</div>
            <div style={styles.infoValue}>
              {fileShare?.downloads || 0}
              {fileShare?.maxDownloads > 0 ? ` / ${fileShare.maxDownloads}` : ''}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ color: isDark ? '#fff' : '#111', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Files</h3>
          <div style={styles.fileList}>
            {fileShare?.files?.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.fileItem}
              >
                <FiFile style={{ color: '#7c4dff' }} />
                <span style={styles.fileName} title={file.originalName}>{file.originalName}</span>
                <small style={{ marginLeft: 'auto', color: isDark ? 'rgba(255,255,255,0.5)' : '#666' }}>
                  {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                </small>
              </motion.div>
            ))}
          </div>
        </div>

        {requiresPassword && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '1.5rem' }}>
            <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiLock /> Password Required
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to download"
              style={styles.input}
              autoFocus
            />
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={downloading || (requiresPassword && !password)}
          style={styles.button}
          aria-label="Download files"
        >
          {downloading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ marginRight: '0.5rem' }}>
                <FiDownload />
              </motion.div>
              Downloading...
            </>
          ) : (
            <>
              <FiDownload />
              <span>Download {fileShare?.files?.length > 1 ? 'All Files' : 'File'}</span>
            </>
          )}
        </motion.button>

        {fileShare?.expiresAt && (
          <div style={{ marginTop: '1rem', textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.9rem' }}>
            <FiClock style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Expires: {new Date(fileShare.expiresAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicFileShare;
