import mongoose from 'mongoose';
import crypto from 'crypto';

// Individual file item schema (for multiple files in one share)
const fileItemSchema = new mongoose.Schema({
  title: {
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
  }
});

// Main file schema (collection of files to share)
const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  files: [fileItemSchema], // Array of files
  shareId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    default: () => crypto.randomBytes(8).toString('hex')
  },
  accessCode: {
    type: String,
    default: null // Optional access code for password protection
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
  downloads: {
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
  }]
});

// Generate share ID before saving
fileSchema.pre('save', function(next) {
  if (!this.shareId) {
    this.shareId = crypto.randomBytes(8).toString('hex');
  }
  
  // Set isPasswordProtected based on accessCode presence
  if (this.accessCode) {
    this.isPasswordProtected = true;
  }
  
  next();
});

// Check if file share is expired
fileSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Check if max downloads reached
fileSchema.methods.canDownload = function() {
  if (this.isExpired()) return false;
  if (this.maxDownloads === 0) return true; // Unlimited
  return this.downloads < this.maxDownloads;
};

// Increment download count
fileSchema.methods.incrementDownload = async function() {
  this.downloads += 1;
  this.downloadCount += 1;
  await this.save();
};

// Increment view count
fileSchema.methods.incrementView = async function() {
  this.views += 1;
  await this.save();
};

// Validate access code
fileSchema.methods.validateAccessCode = function(code) {
  if (!this.accessCode) return true; // No code required
  return this.accessCode === code;
};

// Indexes
fileSchema.index({ owner: 1, createdAt: -1 });
fileSchema.index({ shareId: 1 });
fileSchema.index({ expiresAt: 1 });

export default mongoose.model('File', fileSchema);
