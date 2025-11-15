import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  s3Key: {
    type: String,
    required: true
  },
  s3Url: {
    type: String,
    required: true
  },
  thumbnailKey: {           // ← New: Thumbnail S3 key
    type: String
  },
  thumbnailUrl: {           // ← New: Thumbnail URL
    type: String
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  duration: {
    type: Number,
    default: 0
  },
  mediaType: {              // ← New: 'audio' or 'video'
    type: String,
    enum: ['image', 'audio', 'video'],
    default: 'video',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

podcastSchema.index({ owner: 1, createdAt: -1 });
podcastSchema.index({ createdAt: -1 });
podcastSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Podcast', podcastSchema);
