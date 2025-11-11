import mongoose from 'mongoose';
import crypto from 'crypto';

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  s3Key: {
    type: String,
    required: true
  },
  s3Url: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'archive', 'other'],
    default: 'other'
  },
  shareId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(8).toString('hex')
  },
  accessCode: {
    type: String,
    required: true,
    default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  expiresAt: {
    type: Date,
    index: true
  },
  maxDownloads: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  views: {
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
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
});

// Generate share ID before saving
fileSchema.pre('save', function(next) {
  if (!this.shareId) {
    this.shareId = crypto.randomBytes(8).toString('hex');
  }
  if (!this.accessCode) {
    this.accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

// Check if file is expired
fileSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Check if max downloads reached
fileSchema.methods.canDownload = function() {
  if (this.isExpired()) return false;
  if (this.maxDownloads === 0) return true;
  return this.downloadCount < this.maxDownloads;
};

// Indexes
fileSchema.index({ owner: 1, createdAt: -1 });
fileSchema.index({ shareId: 1 });
fileSchema.index({ expiresAt: 1 });

export default mongoose.model('File', fileSchema);
