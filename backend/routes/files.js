import express from 'express';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import File from '../models/File.js';
import { protect } from '../middleware/auth.js';
import { fileUpload } from '../middleware/fileUpload.js';
import { s3Client, S3_BUCKET } from '../config/aws.js';
import { generateQRCodeDataURL } from '../utils/qrcode.js';
import logger, { logAction } from '../config/logger.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('doc') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'other';
};

// POST /api/files -- upload and share
router.post('/', protect, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const {
      title, description, isPublic,
      isPasswordProtected, password,
      expiryDays, maxDownloads
    } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    let hashedPassword = null;
    if (isPasswordProtected === 'true' && password) hashedPassword = await bcrypt.hash(password, 10);

    let expiresAt = null;
    if (expiryDays && parseInt(expiryDays) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
    }

    const file = await File.create({
      title,
      description: description || '',
      originalName: req.file.originalname,
      fileName: req.file.key.split('/').pop(),
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      s3Key: req.file.key,
      s3Url: req.file.location,
      fileType: getFileType(req.file.mimetype),
      isPublic: isPublic === 'true',
      isPasswordProtected: isPasswordProtected === 'true',
      password: hashedPassword,
      expiresAt,
      maxDownloads: parseInt(maxDownloads) || 0,
      owner: req.user._id
    });

    // --- Share link logic ---
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${base}/share/${file.shareId}`;
    let qrCode = null;
    try {
      qrCode = await generateQRCodeDataURL(shareUrl);
    } catch (err) {
      qrCode = null;
      logger.error('QR code generation failed', { error: err.message });
    }

    const whatsappMsg = `📎 *${file.title}*\n\n🔗 Download Link:\n${shareUrl}\n\n🔑 Access Code: *${file.accessCode}*${file.isPasswordProtected ? '\n🔒 Password Required' : ''}\n\n📤 Shared via SharePod`;
    const emailSubject = encodeURIComponent(`File Shared: ${file.title}`);
    const emailBody = encodeURIComponent(`I've shared a file with you:\n\nFile: ${file.title}\nAccess Link: ${shareUrl}\nAccess Code: ${file.accessCode}\n\nShared via SharePod`);
    const twitterMsg = encodeURIComponent(`📎 ${file.title}\n🔗 ${shareUrl}\n🔑 Code: ${file.accessCode}`);
    const telegramMsg = encodeURIComponent(`📎 ${file.title}\n🔗 ${shareUrl}\n🔑 Access Code: ${file.accessCode}`);

    const responseData = {
      id: file._id,
      title: file.title,
      description: file.description,
      originalName: file.originalName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      shareId: file.shareId,
      accessCode: file.accessCode,
      shareUrl,
      qrCode,
      shareLinks: {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`,
        email: `mailto:?subject=${emailSubject}&body=${emailBody}`,
        twitter: `https://twitter.com/intent/tweet?text=${twitterMsg}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${telegramMsg}`,
      },
      isPublic: file.isPublic,
      isPasswordProtected: file.isPasswordProtected,
      expiresAt: file.expiresAt,
      maxDownloads: file.maxDownloads,
      createdAt: file.createdAt
    };

    logAction('info', 'File uploaded for secure sharing', {
      action: 'SECURE_FILE_UPLOAD',
      userId: req.user._id,
      fileId: file._id,
      shareId: file.shareId,
      shareUrl
    });

    res.status(201).json(responseData);
  } catch (error) {
    logger.error('File upload error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET /api/files - List user's files
router.get('/', protect, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .sort('-createdAt')
      .select('-password');
    res.json(files.map(file => ({
      ...file.toObject(),
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${file.shareId}`
    })));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/files/share/:shareId -- Get public info for a shared file
router.get('/share/:shareId', async (req, res) => {
  try {
    const file = await File.findOne({ shareId: req.params.shareId })
      .populate('owner', 'username')
      .select('-password');
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.isExpired()) return res.status(410).json({ error: 'File has expired' });
    if (!file.canDownload()) return res.status(403).json({ error: 'Maximum downloads reached' });

    file.views += 1;
    await file.save();

    res.json({
      id: file._id,
      title: file.title,
      description: file.description,
      originalName: file.originalName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      shareId: file.shareId,
      isPasswordProtected: file.isPasswordProtected,
      expiresAt: file.expiresAt,
      maxDownloads: file.maxDownloads,
      downloadCount: file.downloadCount,
      views: file.views,
      owner: file.owner.username,
      createdAt: file.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/files/download/:shareId -- get temporary S3 download URL
router.post('/download/:shareId', async (req, res) => {
  try {
    const { accessCode, password } = req.body;
    const file = await File.findOne({ shareId: req.params.shareId }).select('+password');
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.accessCode !== accessCode?.toUpperCase()) return res.status(401).json({ error: 'Invalid access code' });
    if (file.isExpired()) return res.status(410).json({ error: 'File has expired' });
    if (!file.canDownload()) return res.status(403).json({ error: 'Maximum downloads reached' });

    // Check password if required
    if (file.isPasswordProtected) {
      if (!password) return res.status(401).json({ error: 'Password required' });
      const isMatch = await bcrypt.compare(password, file.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.originalName}"`
    });
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    file.downloadCount += 1;
    await file.save();

    res.json({ downloadUrl, fileName: file.originalName, fileSize: file.fileSize, expiresIn: 300 });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/files/:id -- owner delete file
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file.s3Key }));
    } catch (err) {
      logger.error('Error deleting file from S3', { error: err.message });
    }
    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/files/:id/qrcode -- regenerate QR code (owner only)
router.get('/:id/qrcode', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    if (file.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${file.shareId}`;
    const qrCode = await generateQRCodeDataURL(shareUrl);
    res.json({ qrCode, shareUrl });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
