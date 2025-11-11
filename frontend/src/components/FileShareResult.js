import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiShare2, FiCheck, FiExternalLink } from 'react-icons/fi';
// import { QRCodeSVG } from 'qr-code-styling';
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
${file.isPasswordProtected ? '(Password protected)' : ''}`;

      await navigator.clipboard.writeText(shareText.trim());
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
    >
      <div className="bg-gray-800/90 rounded-2xl p-8 max-w-md w-full backdrop-blur-lg border border-white/10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-3xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">File Uploaded Successfully!</h2>
          <p className="text-gray-400 mt-2">Your file is ready to share</p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl mb-6">
          <QRCodeSVG
            value={shareUrl}
            size={200}
            bgColor={"#FFFFFF"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={false}
          />
        </div>

        {/* File Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Access Code:</p>
            <p className="font-mono text-lg text-purple-400">{file.accessCode}</p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Share Link:</p>
            <p className="font-mono text-sm text-white break-all">{shareUrl}</p>
          </div>

          {file.expiresAt && (
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Expires On:</p>
              <p className="text-white">
                {new Date(file.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-xl transition duration-200"
          >
            <FiCopy /> Copy Info
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition duration-200"
          >
            View My Files
          </motion.button>
        </div>

        {/* Additional Actions */}
        <div className="mt-4 flex justify-center">
          <a
            href={`/share/${file.shareId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            <FiExternalLink /> Open share page
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default FileShareResult;