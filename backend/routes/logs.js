import express from 'express';
import Log from '../models/Log.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/logs
// @desc    Get logs with filtering
// @access  Private (Admin only - add admin middleware)
router.get('/', protect, async (req, res) => {
  try {
    const { level, action, userId, startDate, endDate, limit = 100, page = 1 } = req.query;

    const query = {};
    
    if (level) query.level = level;
    if (action) query.action = action;
    if (userId) query.userId = userId;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await Log.find(query)
      .sort('-timestamp')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('userId', 'username email')
      .lean();

    const total = await Log.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/logs/stats
// @desc    Get log statistics
// @access  Private (Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    const actionStats = await Log.aggregate([
      {
        $match: { action: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({ stats, topActions: actionStats });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
