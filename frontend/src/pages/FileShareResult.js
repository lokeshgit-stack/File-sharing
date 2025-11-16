import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiCopy, FiEye, FiClock, FiTrash2, FiFile, FiFolder } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FileShareResult = () => {
  const [fileShares, setFileShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrShareId, setQrShareId] = useState(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

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
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyCode = async (accessCode) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      toast.success('Access code copied!');
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleDelete = async (shareId) => {
    if (!window.confirm('Are you sure you want to delete this share? All files will be deleted.')) return;
    try {
      await api.delete(`/files/${shareId}`);
      setFileShares(fileShares.filter(share => share._id !== shareId));
      toast.success('Share deleted');
    } catch {
      toast.error('Failed to delete share');
    }
  };

  const handleDownload = async (share) => {
    try {
      const payload = {};
      if (share.accessCode) payload.accessCode = share.accessCode;
      const res = await api.post(`/files/download/${share.shareId}`, payload);
      if (res.data?.downloads?.length > 0) {
        res.data.downloads.forEach((download, index) => {
          setTimeout(() => window.open(download.url, '_blank'), index * 500);
        });
        toast.success(`Downloading ${res.data.downloads.length} file(s)`);
      } else {
        toast.error('Unable to download');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.error || 'Failed to start download';
      toast.error(errorMsg);
      if (errorMsg === 'Password required') {
        const password = prompt('Enter password to download:');
        if (password) {
          try {
            const res = await api.post(`/files/download/${share.shareId}`, {
              accessCode: share.accessCode,
              password
            });
            if (res.data?.downloads?.length > 0) {
              res.data.downloads.forEach((download, index) => {
                setTimeout(() => window.open(download.url, '_blank'), index * 500);
              });
              toast.success(`Downloading ${res.data.downloads.length} file(s)`);
            }
          } catch {
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

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1rem',
      minHeight: '100vh',
      color: isDark ? '#fff' : '#1a1a1a',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
    },
    uploadButton: {
      background: 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#fff',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
    },
    emptyState: {
      textAlign: 'center',
      padding: '8rem 1rem',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    },
    emptyIcon: {
      fontSize: '6rem',
      marginBottom: '1.5rem',
    },
    emptyText: {
      fontSize: '1.25rem',
      marginBottom: '1rem',
    },
    fileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '2rem',
    },
    shareCard: {
      background: isDark ? 'rgba(10, 14, 39, 0.7)' : '#fff',
      borderRadius: '24px',
      padding: '1.5rem',
      border: `1px solid ${isDark ? 'rgba(0,229,255,0.2)' : '#ddd'}`,
      boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      color: isDark ? '#fff' : '#1a1a1a',
    },
    deleteBtn: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'transparent',
      border: 'none',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0,0,0,0.4)',
      cursor: 'pointer',
      fontSize: '1.25rem',
      transition: 'color 0.3s ease',
    },
    shareHeader: {
      marginBottom: '1rem',
    },
    shareTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.25rem',
    },
    shareTitleIcon: {
      fontSize: '1.5rem',
      color: '#7c4dff',
    },
    shareTitle: {
      fontWeight: '700',
      fontSize: '1.25rem',
      wordBreak: 'break-word',
      flex: 1,
    },
    shareDescription: {
      fontSize: '0.875rem',
      color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0,0,0,0.6)',
      wordBreak: 'break-word',
    },
    filesListWrapper: {
      maxHeight: '130px',
      overflowY: 'auto',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
      padding: '0.5rem 1rem',
      borderRadius: '12px',
      marginBottom: '1rem',
    },
    filesListItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      color: isDark ? 'rgba(255,255,255,0.7)' : '#444',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1rem',
    },
    statCard: {
      background: isDark ? 'rgba(255,255,255,0.1)' : '#f3f3f3',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: isDark ? '#ccc' : '#666',
    },
    statValue: {
      fontWeight: '700',
      fontSize: '1.1rem',
      color: isDark ? '#fff' : '#000',
      marginTop: '0.25rem',
    },
    actionsRow: {
      display: 'flex',
      gap: '1rem',
      marginTop: 'auto',
      flexWrap: 'wrap',
    },
    actionButton: {
      flex: '1 1 100%',
      padding: '0.75rem',
      borderRadius: '12px',
      fontWeight: '700',
      fontSize: '0.9rem',
      cursor: 'pointer',
      border: 'none',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      userSelect: 'none',
      transition: 'background 0.3s ease',
    },
    downloadBtn: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    },
    qrBtn: {
      background: 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
    },
    linkBtn: {
      background: isDark ? 'rgba(80, 80, 80, 0.8)' : '#444',
    },
    qrCodeWrapper: {
      marginTop: '1rem',
      textAlign: 'center',
    },
    qrCode: {
      background: '#fff',
      borderRadius: '12px',
      padding: '1rem',
      display: 'inline-block',
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '4rem', color: isDark ? '#0eefff' : '#2196f3' }}
        >
          📁
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Files</h1>
          <button
            onClick={() => navigate('/file-share')}
            style={{ 
              ...styles.uploadButton, 
              background: 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '12px', 
              color: '#fff',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
            }}
          >
            Upload Files
          </button>
        </div>

        {fileShares.length === 0 ? (
          <div style={styles.emptyState}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={styles.emptyIcon}
            >
              📁
            </motion.div>
            <p style={styles.emptyText}>No files uploaded yet.</p>
            <button
              onClick={() => navigate('/file-share')}
              style={{ 
                ...styles.uploadButton, 
                padding: '0.75rem 2rem', 
                borderRadius: '12px' 
              }}
            >
              Upload Your First File
            </button>
          </div>
        ) : (
          <div style={styles.fileGrid}>
            {fileShares.map((share) => (
              <motion.div
                key={share._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.shareCard}
                whileHover={{ boxShadow: isDark ? '0 0 30px #00e5ff' : '0 0 30px #7c4dff' }}
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(share._id)}
                  title="Delete share"
                  style={styles.deleteBtn}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}
                  aria-label="Delete share"
                >
                  <FiTrash2 size={20} />
                </button>

                {/* Share Header */}
                <div style={styles.shareHeader}>
                  <div style={styles.shareTitleContainer}>
                    <FiFolder style={styles.shareTitleIcon} />
                    <h2 style={styles.shareTitle}>{share.title || 'Untitled Share'}</h2>
                  </div>
                  {share.description && <p style={styles.shareDescription}>{share.description}</p>}
                </div>

                {/* Files List */}
                <div style={styles.filesListWrapper}>
                  <p style={{ ...styles.shareDescription, marginBottom: '0.25rem', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Files ({share.files?.length || 0})
                  </p>
                  {share.files?.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                      {share.files.map((file, idx) => (
                        <li key={idx} style={styles.filesListItem}>
                          <FiFile style={{ color: '#7c4dff' }} />
                          <span title={file.originalName}>{file.originalName}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#888', fontSize: '0.9rem' }}>
                      No files
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <p>Total Size</p>
                    <p style={styles.statValue}>{getTotalSize(share.files || [])} MB</p>
                  </div>
                  <div style={styles.statCard}>
                    <p>Views</p>
                    <p style={styles.statValue}><FiEye /> {share.views || 0}</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div style={styles.statsGrid}>
                  {share.hasAccessCode && share.accessCode && (
                    <div style={styles.statCard}>
                      <p>Access Code</p>
                      <p style={{display: 'flex', alignItems:'center', gap: '0.25rem', fontFamily: 'monospace', fontSize:'0.85rem'}}>
                        {share.accessCode}
                        <button 
                          onClick={() => handleCopyCode(share.accessCode)} 
                          title="Copy access code"
                          style={{background: 'none', border: 'none', cursor: 'pointer', color: '#7c4dff'}}
                          aria-label="Copy access code"
                        >
                          <FiCopy size={14} />
                        </button>
                      </p>
                    </div>
                  )}
                  <div style={styles.statCard}>
                    <p>Expires</p>
                    <p style={styles.statValue}>
                      {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div style={styles.statCard}>
                    <p>Downloads</p>
                    <p style={styles.statValue}>
                      {share.downloads || 0} / {share.maxDownloads > 0 ? share.maxDownloads : '∞'}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                {qrShareId === share._id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.qrCodeWrapper}
                  >
                    <QRCodeSVG
                      value={share.shareUrl || `${window.location.origin}/share/${share.shareId}`}
                      size={180}
                      level="H"
                      style={styles.qrCode}
                    />
                  </motion.div>
                )}

                {/* Actions */}
                <div style={styles.actionsRow}>
                  <button
                    onClick={() => handleDownload(share)}
                    style={{ ...styles.actionButton, ...styles.downloadBtn }}
                    aria-label="Download files"
                  >
                    <FiDownload size={16} /> Download
                  </button>
                  <button
                    onClick={() => setQrShareId(qrShareId === share._id ? null : share._id)}
                    style={{ ...styles.actionButton, ...styles.qrBtn }}
                    aria-label={qrShareId === share._id ? 'Hide QR code' : 'Show QR code'}
                  >
                    <FiShare2 size={16} /> {qrShareId === share._id ? 'Hide' : 'QR'}
                  </button>
                  <button
                    onClick={() => handleCopyShareLink(share)}
                    style={{ ...styles.actionButton, ...styles.linkBtn }}
                    aria-label="Copy share link"
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
