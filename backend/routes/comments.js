import express from 'express';
import Comment from '../models/comment.js';
import Post from '../models/Post.js';
// Use the named export 'protect' for the authentication middleware
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all comments for a post (public route, no protection needed)
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      postId: req.params.postId,
      isDeleted: false 
    })
    .populate('userId', 'username displayName avatar')
    .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a comment (protected route)
router.post('/post/:postId', protect, async (req, res) => {
  try {
    // Updated to use 'parent' instead of 'parentCommentId'
    const { content, parent } = req.body; 
    
    const comment = new Comment({
      postId: req.params.postId,
      userId: req.user.id,
      username: req.user.username,
      content,
      parent: parent || null // Use the new 'parent' property
    });
    
    await comment.save();
    await comment.populate('userId', 'username displayName avatar');
    
    // Update post comment count
    await Post.findByIdAndUpdate(req.params.postId, {
      $inc: { commentCount: 1 }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upvote a comment (protected route)
router.post('/:commentId/upvote', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const hasUpvoted = comment.upvotes.includes(req.user.id);
    const hasDownvoted = comment.downvotes.includes(req.user.id);
    
    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user.id);
    } else {
      if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user.id);
      }
      comment.upvotes.push(req.user.id);
    }
    
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Downvote a comment (protected route)
router.post('/:commentId/downvote', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const hasUpvoted = comment.upvotes.includes(req.user.id);
    const hasDownvoted = comment.downvotes.includes(req.user.id);
    
    if (hasDownvoted) {
      comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user.id);
    } else {
      if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user.id);
      }
      comment.downvotes.push(req.user.id);
    }
    
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a comment (protected route)
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();
    
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
