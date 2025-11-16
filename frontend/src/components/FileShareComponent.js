import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiCopy, FiEye, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';

const FileShareResult = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/files/shared-with-me');
        setFiles(response.data);
      } catch {
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
    } catch {
      toast.error('Error starting download');
    }
  };

  const handleShare = async (file) => {
    try {
      if (!file.shareId) {
        const response = await api.post(`/files/${file._id}/share`);
        const updatedFile = { ...file, ...response.data };
        setFiles(files.map(f => f._id === file._id ? updatedFile : f));
        setSelectedFile(updatedFile);
      } else {
        setSelectedFile(selectedFile?._id === file._id ? null : file);
      }
      setShowQR(false);
    } catch {
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
${file.expiresAt ? `Expires on: ${new Date(file.expiresAt).toLocaleDateString()}` : ''}
      `.trim();

      await navigator.clipboard.writeText(shareText);
      setCopiedId(file._id);
      toast.success('Share link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy share link');
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            height: 72, 
            backgroundColor: isDark ? 'rgba(64, 64, 64, 0.6)' : 'rgba(200, 200, 200, 0.5)', 
            borderRadius: 12, marginBottom: 16,
            animation: 'pulse 1.5s infinite alternate'
          }} />
        ))}
        <style>{`
          @keyframes pulse {
            0% {opacity: 1;}
            100% {opacity: 0.4;}
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, color: isDark ? '#eee' : '#111' }}>
      <h1 style={{ fontSize: 24, fontWeight: '700', marginBottom: 24 }}>Shared Files</h1>

      {files.length === 0 ? (
        <div style={{ textAlign: 'center', color: isDark ? '#bbb' : '#666' }}>
          <p>No files have been shared with you yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {files.map(file => (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: isDark ? 'rgba(30, 30, 40, 0.6)' : '#fff',
                padding: 16,
                borderRadius: 16,
                border: `1px solid ${isDark ? 'rgba(60, 130, 255, 0.4)' : '#ddd'}`,
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div>
                  <h3 style={{ fontWeight: '600', fontSize: 18 }}>{file.originalName}</h3>
                  <p style={{ fontSize: 12, color: isDark ? '#bbb' : '#555' }}>
                    Shared by: {file.owner.username} &bull; Size: {(file.size/1024/1024).toFixed(2)} MB &bull; Shared on: {new Date(file.sharedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => handleShare(file)}
                    title="Share file"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: isDark ? '#aaa' : '#666',
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: 8,
                      transition: 'color 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = isDark ? '#fff' : '#000'}
                    onMouseLeave={e => e.currentTarget.style.color = isDark ? '#aaa' : '#666'}
                  >
                    <FiShare2 size={20}/>
                  </button>
                  <button
                    onClick={() => handleDownload(file._id)}
                    style={{
                      backgroundColor: '#7c4dff',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    <FiDownload size={18} /> Download
                  </button>
                </div>
              </div>

              {selectedFile?._id === file._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: isDark ? 'rgba(60,60,80,0.5)' : '#f3f3f3',
                    borderRadius: 12,
                    color: isDark ? '#ddd' : '#444',
                    fontSize: 13,
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                    <span>Share Link</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <button
                        onClick={() => setShowQR(!showQR)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: isDark ? '#aaa' : '#666',
                          cursor: 'pointer',
                          padding: 8,
                          borderRadius: 8,
                        }}
                        title="Toggle QR Code"
                      >
                        <FiEye size={18}/>
                      </button>
                      <button
                        onClick={() => handleCopyLink(file)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: copiedId === file._id ? '#22c55e' : (isDark ? '#aaa' : '#666'),
                          cursor: 'pointer',
                          padding: 8,
                          borderRadius: 8,
                        }}
                        title={copiedId === file._id ? 'Copied!' : 'Copy Link'}
                      >
                        {copiedId === file._id ? <FiCheck size={18}/> : <FiCopy size={18}/>}
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/share/${file.shareId}`}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `1px solid ${isDark ? '#444' : '#ccc'}`,
                      backgroundColor: isDark ? '#222' : '#fff',
                      color: 'inherit',
                      fontFamily: 'monospace',
                      cursor: 'text',
                      userSelect: 'all',
                    }}
                  />

                  {showQR && (
                    <div style={{marginTop: 12, textAlign: 'center', backgroundColor:'#fff', borderRadius: 12, padding: 12}}>
                      <QRCodeSVG
                        value={`${window.location.origin}/share/${file.shareId}`}
                        size={160}
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
