import express from 'express';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import File from '../models/File.js'; // Changed to capital F
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

// POST /api/files/upload -- upload and share (supports multiple files up to 10)
router.post('/upload', protect, fileUpload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const {
      title,
      description,
      isPublic,
      accessCode,
      password,
      expiryHours,
      maxDownloads
    } = req.body;

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Calculate expiry date
    let expiresAt = null;
    if (expiryHours && parseInt(expiryHours) > 0) {
      expiresAt = new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000);
    }

    // Prepare files array
    const filesArray = req.files.map(file => ({
      title: file.originalname,
      originalName: file.originalname,
      fileName: file.key.split('/').pop(),
      fileSize: file.size,
      mimeType: file.mimetype,
      s3Key: file.key,
      s3Url: file.location,
      fileType: getFileType(file.mimetype)
    }));

    // Create file share entry
    const fileShare = await File.create({
      title: title || filesArray[0].originalName,
      description: description || '',
      files: filesArray,
      isPublic: isPublic === 'true',
      accessCode: accessCode || null,
      password: hashedPassword,
      isPasswordProtected: !!password,
      expiresAt,
      maxDownloads: parseInt(maxDownloads) || 0,
      owner: req.user._id
    });

    // Generate share URL and QR code
    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${base}/share/${fileShare.shareId}`;
    let qrCode = null;
    try {
      qrCode = await generateQRCodeDataURL(shareUrl);
    } catch (err) {
      logger.error('QR code generation failed', { error: err.message });
    }

    // Generate share messages
    const whatsappMsg = `📎 *${fileShare.title}*\n\n🔗 Download Link:\n${shareUrl}${fileShare.accessCode ? `\n\n🔑 Access Code: *${fileShare.accessCode}*` : ''}${fileShare.isPasswordProtected ? '\n🔒 Password Required' : ''}\n\n📤 Shared via SharePod`;
    const emailSubject = encodeURIComponent(`Files Shared: ${fileShare.title}`);
    const emailBody = encodeURIComponent(`I've shared files with you:\n\nTitle: ${fileShare.title}\nAccess Link: ${shareUrl}${fileShare.accessCode ? `\nAccess Code: ${fileShare.accessCode}` : ''}\n\nShared via SharePod`);
    const twitterMsg = encodeURIComponent(`📎 ${fileShare.title}\n🔗 ${shareUrl}`);
    const telegramMsg = encodeURIComponent(`📎 ${fileShare.title}\n🔗 ${shareUrl}${fileShare.accessCode ? `\n🔑 Access Code: ${fileShare.accessCode}` : ''}`);

    const responseData = {
      id: fileShare._id,
      title: fileShare.title,
      description: fileShare.description,
      files: fileShare.files,
      shareId: fileShare.shareId,
      accessCode: fileShare.accessCode,
      shareUrl,
      qrCode,
      shareLinks: {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`,
        email: `mailto:?subject=${emailSubject}&body=${emailBody}`,
        twitter: `https://twitter.com/intent/tweet?text=${twitterMsg}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${telegramMsg}`
      },
      isPublic: fileShare.isPublic,
      isPasswordProtected: fileShare.isPasswordProtected,
      expiresAt: fileShare.expiresAt,
      maxDownloads: fileShare.maxDownloads,
      downloads: fileShare.downloads,
      createdAt: fileShare.createdAt
    };

    logAction('info', 'Files uploaded for secure sharing', {
      action: 'SECURE_FILE_UPLOAD',
      userId: req.user._id,
      shareId: fileShare.shareId,
      fileCount: filesArray.length,
      shareUrl
    });

    res.status(201).json(responseData);
  } catch (error) {
    logger.error('File upload error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// POST /api/files -- backward compatibility (single file)
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
    if (isPasswordProtected === 'true' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let expiresAt = null;
    if (expiryDays && parseInt(expiryDays) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
    }

    const fileShare = await File.create({
      title,
      description: description || '',
      files: [{
        title: req.file.originalname,
        originalName: req.file.originalname,
        fileName: req.file.key.split('/').pop(),
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        s3Key: req.file.key,
        s3Url: req.file.location,
        fileType: getFileType(req.file.mimetype)
      }],
      isPublic: isPublic === 'true',
      isPasswordProtected: isPasswordProtected === 'true',
      password: hashedPassword,
      expiresAt,
      maxDownloads: parseInt(maxDownloads) || 0,
      owner: req.user._id
    });

    const base = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${base}/share/${fileShare.shareId}`;
    let qrCode = null;
    try {
      qrCode = await generateQRCodeDataURL(shareUrl);
    } catch (err) {
      logger.error('QR code generation failed', { error: err.message });
    }

    const firstFile = fileShare.files[0];
    const whatsappMsg = `📎 *${fileShare.title}*\n\n🔗 Download Link:\n${shareUrl}${fileShare.accessCode ? `\n\n🔑 Access Code: *${fileShare.accessCode}*` : ''}${fileShare.isPasswordProtected ? '\n🔒 Password Required' : ''}\n\n📤 Shared via SharePod`;
    const emailSubject = encodeURIComponent(`File Shared: ${fileShare.title}`);
    const emailBody = encodeURIComponent(`I've shared a file with you:\n\nFile: ${fileShare.title}\nAccess Link: ${shareUrl}${fileShare.accessCode ? `\nAccess Code: ${fileShare.accessCode}` : ''}\n\nShared via SharePod`);
    const twitterMsg = encodeURIComponent(`📎 ${fileShare.title}\n🔗 ${shareUrl}`);
    const telegramMsg = encodeURIComponent(`📎 ${fileShare.title}\n🔗 ${shareUrl}${fileShare.accessCode ? `\n🔑 Access Code: ${fileShare.accessCode}` : ''}`);

    const responseData = {
      id: fileShare._id,
      title: fileShare.title,
      description: fileShare.description,
      originalName: firstFile.originalName,
      fileSize: firstFile.fileSize,
      fileType: firstFile.fileType,
      shareId: fileShare.shareId,
      accessCode: fileShare.accessCode,
      shareUrl,
      qrCode,
      shareLinks: {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`,
        email: `mailto:?subject=${emailSubject}&body=${emailBody}`,
        twitter: `https://twitter.com/intent/tweet?text=${twitterMsg}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${telegramMsg}`
      },
      isPublic: fileShare.isPublic,
      isPasswordProtected: fileShare.isPasswordProtected,
      expiresAt: fileShare.expiresAt,
      maxDownloads: fileShare.maxDownloads,
      createdAt: fileShare.createdAt
    };

    logAction('info', 'File uploaded for secure sharing', {
      action: 'SECURE_FILE_UPLOAD',
      userId: req.user._id,
      fileId: fileShare._id,
      shareId: fileShare.shareId,
      shareUrl
    });

    res.status(201).json(responseData);
  } catch (error) {
    logger.error('File upload error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET /api/files - List user's file shares (PRIVATE - requires auth)
router.get('/', protect, async (req, res) => {
  try {
    const fileShares = await File.find({ owner: req.user._id })
      .sort('-createdAt')
      .select('-password');
    
    res.json(fileShares.map(share => ({
      ...share.toObject(),
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${share.shareId}`,
      hasAccessCode: !!share.accessCode
    })));
  } catch (error) {
    logger.error('Error fetching file shares', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/files/share/:shareId -- PUBLIC access to shared files (NO AUTH REQUIRED)
router.get('/share/:shareId', async (req, res) => {
  try {
    const { accessCode } = req.query;
    
    const fileShare = await File.findOne({ shareId: req.params.shareId })
      .populate('owner', 'username')
      .select('-password');
    
    if (!fileShare) {
      return res.status(404).json({ error: 'Share link not found' });
    }
    
    // Check if expired
    if (fileShare.isExpired()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }
    
    // Check max downloads
    if (!fileShare.canDownload()) {
      return res.status(410).json({ error: 'Download limit reached' });
    }
    
    // Check access code if required
    if (fileShare.accessCode) {
      if (!accessCode) {
        return res.status(401).json({ 
          error: 'Access code required',
          requiresAccessCode: true
        });
      }
      if (!fileShare.validateAccessCode(accessCode)) {
        return res.status(403).json({ error: 'Invalid access code' });
      }
    }
    
    // Increment view count
    await fileShare.incrementView();
    
    res.json({
      id: fileShare._id,
      title: fileShare.title,
      description: fileShare.description,
      files: fileShare.files,
      shareId: fileShare.shareId,
      isPasswordProtected: fileShare.isPasswordProtected,
      expiresAt: fileShare.expiresAt,
      maxDownloads: fileShare.maxDownloads,
      downloads: fileShare.downloads,
      views: fileShare.views,
      owner: fileShare.owner.username,
      createdAt: fileShare.createdAt
    });
  } catch (error) {
    logger.error('Error fetching shared files', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/files/download/:shareId -- PUBLIC download (NO AUTH REQUIRED)
router.post('/download/:shareId', async (req, res) => {
  try {
    const { accessCode, password } = req.body;
    
    const fileShare = await File.findOne({ shareId: req.params.shareId }).select('+password');
    
    if (!fileShare) {
      return res.status(404).json({ error: 'Share link not found' });
    }
    
    // Validate access code
    if (fileShare.accessCode && !fileShare.validateAccessCode(accessCode)) {
      return res.status(401).json({ error: 'Invalid access code' });
    }
    
    // Check if expired
    if (fileShare.isExpired()) {
      return res.status(410).json({ error: 'Share link has expired' });
    }
    
    // Check max downloads
    if (!fileShare.canDownload()) {
      return res.status(403).json({ error: 'Download limit reached' });
    }
    
    // Check password if required
    if (fileShare.isPasswordProtected) {
      if (!password) {
        return res.status(401).json({ error: 'Password required' });
      }
      const isMatch = await bcrypt.compare(password, fileShare.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }
    
    // Generate download URLs for all files
    const downloadUrls = await Promise.all(
      fileShare.files.map(async (fileItem) => {
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileItem.s3Key,
          ResponseContentDisposition: `attachment; filename="${fileItem.originalName}"`
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        return {
          url,
          fileName: fileItem.originalName,
          fileSize: fileItem.fileSize
        };
      })
    );
    
    // Increment download count
    await fileShare.incrementDownload();
    
    res.json({
      downloads: downloadUrls,
      expiresIn: 300
    });
  } catch (error) {
    logger.error('Download error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/files/:id -- owner delete file share (PRIVATE)
router.delete('/:id', protect, async (req, res) => {
  try {
    const fileShare = await File.findById(req.params.id);
    
    if (!fileShare) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    if (fileShare.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Delete all files from S3
    for (const fileItem of fileShare.files) {
      try {
        await s3Client.send(new DeleteObjectCommand({ 
          Bucket: S3_BUCKET, 
          Key: fileItem.s3Key 
        }));
      } catch (err) {
        logger.error('Error deleting file from S3', { error: err.message, key: fileItem.s3Key });
      }
    }
    
    await File.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'File share deleted successfully' });
  } catch (error) {
    logger.error('Delete error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/files/:id/qrcode -- regenerate QR code (PRIVATE - owner only)
router.get('/:id/qrcode', protect, async (req, res) => {
  try {
    const fileShare = await File.findById(req.params.id);
    
    if (!fileShare) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    if (fileShare.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${fileShare.shareId}`;
    const qrCode = await generateQRCodeDataURL(shareUrl);
    
    res.json({ qrCode, shareUrl });
  } catch (error) {
    logger.error('QR code generation error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
