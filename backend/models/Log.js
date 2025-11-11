import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'http', 'debug'],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    index: true
  },
  ip: String,
  userAgent: String,
  statusCode: Number,
  method: String,
  url: String,
  duration: Number,
  error: {
    message: String,
    stack: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
logSchema.index({ timestamp: -1, level: 1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ action: 1, timestamp: -1 });

// TTL Index - automatically delete logs older than 30 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Log', logSchema);
