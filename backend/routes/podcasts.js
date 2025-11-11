import express from 'express';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import Podcast from '../models/Podcast.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { s3Client, S3_BUCKET } from '../config/aws.js';
import { generateThumbnail, getVideoDuration } from '../utils/thumbnail.js';
import logger, { logAction } from '../config/logger.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import Log from '../models/Log.js';

const router = express.Router();

// Helper to download file from S3
const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

// @route   POST /api/podcasts
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      logAction('warn', 'No file uploaded', {
        action: 'UPLOAD_NO_FILE',
        userId: req.user._id
      });
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, duration } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Determine if file is video
    const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(req.file.originalname);
    
    let thumbnailData = {};
    let actualDuration = parseInt(duration) || 0;

    // Generate thumbnail and get duration for videos
    if (isVideo) {
      try {
        // Download video temporarily for processing
        const tempPath = path.join('uploads', `temp-${Date.now()}.mp4`);
        await downloadFile(req.file.location, tempPath);

        // Generate thumbnail
        thumbnailData = await generateThumbnail(tempPath, req.user._id);

        // Get actual duration
        if (!actualDuration) {
          actualDuration = await getVideoDuration(tempPath);
        }

        // Clean up temp file
        fs.unlinkSync(tempPath);

        logger.info('Video processing completed', {
          action: 'VIDEO_PROCESS_SUCCESS',
          userId: req.user._id,
          duration: actualDuration,
          hasThumbnail: !!thumbnailData.thumbnailUrl
        });
      } catch (error) {
        logger.error('Video processing failed', {
          action: 'VIDEO_PROCESS_FAILED',
          error: error.message
        });
        // Continue without thumbnail if processing fails
      }
    }

    // Create podcast entry
    const podcast = await Podcast.create({
      title,
      description: description || '',
      s3Key: req.file.key,
      s3Url: req.file.location,
      thumbnailKey: thumbnailData.thumbnailKey,
      thumbnailUrl: thumbnailData.thumbnailUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      duration: actualDuration,
      mediaType: isVideo ? 'video' : 'audio',
      owner: req.user._id
    });

    const populatedPodcast = await Podcast.findById(podcast._id)
      .populate('owner', 'username');

    logAction('info', 'Media uploaded successfully', {
      action: 'MEDIA_UPLOAD_SUCCESS',
      userId: req.user._id,
      podcastId: podcast._id,
      title: podcast.title,
      fileSize: req.file.size,
      mediaType: isVideo ? 'video' : 'audio',
      s3Key: req.file.key
    });

    res.status(201).json({
      id: populatedPodcast._id,
      title: populatedPodcast.title,
      description: populatedPodcast.description,
      s3Url: populatedPodcast.s3Url,
      thumbnailUrl: populatedPodcast.thumbnailUrl,
      fileName: populatedPodcast.fileName,
      fileSize: populatedPodcast.fileSize,
      duration: populatedPodcast.duration,
      mediaType: populatedPodcast.mediaType,
      plays: populatedPodcast.plays,
      owner: populatedPodcast.owner.username,
      userId: populatedPodcast.owner._id,
      createdAt: populatedPodcast.createdAt
    });
  } catch (error) {
    logger.error('Error uploading media', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/podcasts (Update response format)
router.get('/', async (req, res) => {
  try {
    const podcasts = await Podcast.find()
      .populate('owner', 'username')
      .sort('-createdAt')
      .lean();

    res.json(podcasts.map(podcast => ({
      id: podcast._id,
      title: podcast.title,
      description: podcast.description,
      s3Url: podcast.s3Url,
      thumbnailUrl: podcast.thumbnailUrl,
      fileName: podcast.fileName,
      fileSize: podcast.fileSize,
      duration: podcast.duration,
      mediaType: podcast.mediaType || 'audio',
      plays: podcast.plays,
      owner: podcast.owner.username,
      userId: podcast.owner._id,
      createdAt: podcast.createdAt
    })));
  } catch (error) {
    logger.error('Error fetching podcasts', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this new route to get podcasts by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const podcasts = await Podcast.find({ owner: req.params.userId })
      .populate('owner', 'username')
      .sort('-createdAt')
      .lean();

    res.json(podcasts.map(podcast => ({
      id: podcast._id,
      title: podcast.title,
      description: podcast.description, 
      s3Url: podcast.s3Url,
      thumbnailUrl: podcast.thumbnailUrl,
      fileName: podcast.fileName,
      fileSize: podcast.fileSize,
      duration: podcast.duration,
      mediaType: podcast.mediaType || 'audio',
      plays: podcast.plays,
      owner: podcast.owner.username,
      userId: podcast.owner._id,
      createdAt: podcast.createdAt
    })));
  } catch (error) {
    logger.error('Error fetching user podcasts', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/podcasts/:id 
// @desc    Delete a podcast
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    // Check if user owns the podcast
    if (podcast.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this podcast' });
    }

    // Delete file from S3
    const deleteParams = {
      Bucket: S3_BUCKET,
      Key: podcast.s3Key
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));

    // If there's a thumbnail, delete it too
    if (podcast.thumbnailKey) {
      const deleteThumbnailParams = {
        Bucket: S3_BUCKET,
        Key: podcast.thumbnailKey
      };
      await s3Client.send(new DeleteObjectCommand(deleteThumbnailParams));
    }

    // Delete podcast from database
    await podcast.deleteOne();

    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    logger.error('Error deleting podcast', { error: error.message });
    res.status(500).json({ error: 'Error deleting podcast' });
  }
});

// @route   POST /api/podcasts/:id/play
// @desc    Increment play count for a podcast
// @access  Public
router.post('/:id/play', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    // Increment plays count
    podcast.plays = (podcast.plays || 0) + 1;
    await podcast.save();

    // Log the play event with required fields
    const log = new Log({
      action: 'PLAY',
      level: 'info',
      message: `Podcast "${podcast.title}" was played`,
      podcast: podcast._id,
      user: req.user ? req.user.id : null,
      metadata: {
        podcastTitle: podcast.title,
        playCount: podcast.plays,
        timestamp: new Date()
      }
    });
    await log.save();

    res.json({ plays: podcast.plays });
  } catch (error) {
    logger.error('Error updating play count', { error: error.message });
    res.status(500).json({ error: 'Error updating play count' });
  }
});



// ... (keep all other routes, just update response format to include thumbnailUrl and mediaType)

export default router;
