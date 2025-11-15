import express from 'express';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import Post from '../models/Post.js';
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

// Helper to determine media type from MIME type
const getMediaType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'other';
};

// @route   POST /api/posts
// @desc    Create new post with multiple media files (max 5)
// @access  Private
router.post('/', protect, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      logAction('warn', 'No files uploaded', {
        action: 'UPLOAD_NO_FILE',
        userId: req.user._id
      });
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Process each uploaded file
    const mediaItems = [];

    for (const file of req.files) {
      const mediaType = getMediaType(file.mimetype);
      let thumbnailUrl = null;
      let thumbnailKey = null;
      let duration = 0;

      // Process video files for thumbnail and duration
      if (mediaType === 'video') {
        try {
          const tempPath = path.join('/tmp', `temp-${Date.now()}.mp4`);
          await downloadFile(file.location, tempPath);

          // Generate thumbnail
          const thumbnailData = await generateThumbnail(tempPath, req.user._id);
          thumbnailUrl = thumbnailData.thumbnailUrl;
          thumbnailKey = thumbnailData.thumbnailKey;

          // Get video duration
          duration = await getVideoDuration(tempPath);

          // Clean up temp file
          try {
            fs.unlinkSync(tempPath);
          } catch (err) {
            logger.warn('Failed to delete temp file', { error: err.message });
          }

          logger.info('Video processing completed', {
            action: 'VIDEO_PROCESS_SUCCESS',
            userId: req.user._id,
            duration: duration,
            hasThumbnail: !!thumbnailUrl
          });
        } catch (error) {
          logger.error('Video processing failed', {
            action: 'VIDEO_PROCESS_FAILED',
            error: error.message
          });
          // Continue without thumbnail if processing fails
        }
      }

      mediaItems.push({
        url: file.location,
        type: mediaType,
        thumbnailUrl,
        thumbnailKey,
        duration,
        fileSize: file.size,
        s3Key: file.key,
        mimeType: file.mimetype,
        fileName: file.originalname
      });
    }

    // Create post entry
    const post = await Post.create({
      title,
      description: description || '',
      media: mediaItems,
      owner: req.user._id
    });

    const populatedPost = await Post.findById(post._id)
      .populate('owner', 'username');

    logAction('info', 'Post created successfully', {
      action: 'POST_CREATE_SUCCESS',
      userId: req.user._id,
      postId: post._id,
      title: post.title,
      mediaCount: mediaItems.length
    });

    res.status(201).json({
      id: populatedPost._id,
      title: populatedPost.title,
      description: populatedPost.description,
      media: populatedPost.media,
      plays: populatedPost.plays,
      likes: populatedPost.likes,
      owner: populatedPost.owner.username,
      userId: populatedPost.owner._id,
      createdAt: populatedPost.createdAt
    });
  } catch (error) {
    logger.error('Error creating post', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/posts
// @desc    Get all posts for home feed
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('owner', 'username')
      .sort('-createdAt')
      .lean();

    res.json(posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      media: post.media,
      plays: post.plays,
      likes: post.likes,
      owner: post.owner.username,
      userId: post.owner._id,
      createdAt: post.createdAt
    })));
  } catch (error) {
    logger.error('Error fetching posts', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('owner', 'username')
      .lean();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      id: post._id,
      title: post.title,
      description: post.description,
      media: post.media,
      plays: post.plays,
      likes: post.likes,
      owner: post.owner.username,
      userId: post.owner._id,
      createdAt: post.createdAt
    });
  } catch (error) {
    logger.error('Error fetching post', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user (My Posts)
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.params.userId })
      .populate('owner', 'username')
      .sort('-createdAt')
      .lean();

    res.json(posts.map(post => ({
      id: post._id,
      title: post.title,
      description: post.description,
      media: post.media,
      plays: post.plays,
      likes: post.likes,
      owner: post.owner.username,
      userId: post.owner._id,
      createdAt: post.createdAt
    })));
  } catch (error) {
    logger.error('Error fetching user posts', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post
    if (post.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete all media files from S3
    for (const mediaItem of post.media) {
      if (mediaItem.s3Key) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: mediaItem.s3Key
          }));
        } catch (err) {
          logger.warn('Failed to delete S3 object', { 
            error: err.message, 
            key: mediaItem.s3Key 
          });
        }
      }

      // Delete thumbnail if exists
      if (mediaItem.thumbnailKey) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: mediaItem.thumbnailKey
          }));
        } catch (err) {
          logger.warn('Failed to delete thumbnail', { 
            error: err.message, 
            key: mediaItem.thumbnailKey 
          });
        }
      }
    }

    // Delete post from database
    await post.deleteOne();

    logAction('info', 'Post deleted successfully', {
      action: 'POST_DELETE_SUCCESS',
      userId: req.user._id,
      postId: post._id,
      title: post.title
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Error deleting post', { error: error.message });
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// @route   POST /api/posts/:id/view
// @desc    Increment view count for a post
// @access  Public
router.post('/:id/view', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count safely
    post.plays = (post.plays || 0) + 1;
    await post.save();

    // Log view event
    const log = new Log({
      action: 'VIEW',
      level: 'info',
      message: `Post "${post.title}" was viewed`,
      post: post._id,
      user: req.user ? req.user.id : null,
      metadata: {
        postTitle: post.title,
        viewCount: post.plays,
        timestamp: new Date()
      }
    });
    await log.save();

    res.json({
      success: true,
      message: 'Post viewed',
      title: post.title,
      plays: post.plays
    });
  } catch (error) {
    logger.error('Error updating view count', { error: error.message });
    res.status(500).json({ error: 'Error updating view count' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Toggle like for a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Toggle like (simplified - you may want to track individual user likes)
    post.likes = (post.likes || 0) + 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post liked',
      likes: post.likes
    });
  } catch (error) {
    logger.error('Error liking post', { error: error.message });
    res.status(500).json({ error: 'Error liking post' });
  }
});

export default router;
