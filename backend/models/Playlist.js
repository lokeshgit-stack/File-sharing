import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  podcasts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for queries
playlistSchema.index({ creator: 1 });
playlistSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.model('Playlist', playlistSchema);
