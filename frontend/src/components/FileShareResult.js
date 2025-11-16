import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiShare2, FiCheck, FiExternalLink } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const FileShareResult = ({ file, onClose }) => {
  const shareUrl = `${window.location.origin}/share/${file.shareId}`;

  const handleCopyLink = async () => {
    try {
      const shareText = `
File: ${file.title}
Access Link: ${shareUrl}
Access Code: ${file.accessCode}

This file ${file.expiresAt ? `expires on ${new Date(file.expiresAt).toLocaleDateString()}` : 'never expires'}
${file.isPasswordProtected ? '(Password protected)' : ''}
      `.trim();

      await navigator.clipboard.writeText(shareText);
      toast.success('Share info copied!');
    } catch (err) {
      toast.error('Failed to copy share info');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{ padding: '1rem' }}
    >
      <div
        className="bg-gray-800/90 rounded-2xl p-6 max-w-sm w-full backdrop-blur-lg border border-white/20"
        style={{ maxWidth: 360 }}
      >
        <div className="text-center mb-4">
          <div
            className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ width: 48, height: 48 }}
          >
            <FiCheck className="text-2xl text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-white">File Uploaded Successfully!</h2>
          <p className="text-gray-400 mt-1 text-sm">Your file is ready to share</p>
        </div>

        {/* QR Code */}
        <div
          className="bg-white p-3 rounded-lg mb-4"
          style={{ padding: 12, marginBottom: 16 }}
        >
          <QRCodeSVG
            value={shareUrl}
            size={140}
            bgColor={"#FFFFFF"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
          />
        </div>

        {/* File Details */}
        <div className="space-y-3 mb-4">
          <div
            className="bg-gray-900/60 p-3 rounded-lg"
            style={{ padding: '0.75rem 1rem' }}
          >
            <p className="text-xs text-gray-400 mb-1">Access Code:</p>
            <p
              className="font-mono text-base text-purple-400 truncate"
              style={{ fontSize: 16 }}
              title={file.accessCode}
            >
              {file.accessCode}
            </p>
          </div>

          <div
            className="bg-gray-900/60 p-3 rounded-lg"
            style={{ padding: '0.75rem 1rem' }}
          >
            <p className="text-xs text-gray-400 mb-1">Share Link:</p>
            <p
              className="font-mono text-xs text-white break-all"
              style={{ fontSize: 12 }}
            >
              {shareUrl}
            </p>
          </div>

          {file.expiresAt && (
            <div
              className="bg-gray-900/60 p-3 rounded-lg"
              style={{ padding: '0.75rem 1rem' }}
            >
              <p className="text-xs text-gray-400 mb-1">Expires On:</p>
              <p className="text-white text-sm">
                {new Date(file.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition duration-200 text-sm"
          >
            <FiCopy /> Copy Info
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition duration-200 text-sm"
          >
            View My Files
          </motion.button>
        </div>

        {/* Additional Actions */}
        <div className="mt-3 flex justify-center">
          <a
            href={`/share/${file.shareId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2 text-sm"
          >
            <FiExternalLink /> Open share page
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default FileShareResult;
