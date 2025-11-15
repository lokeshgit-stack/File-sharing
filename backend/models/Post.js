import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video', 'audio'], required: true },
  thumbnailUrl: String,
  duration: Number,
  fileSize: Number,
  s3Key: String
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  media: [mediaSchema], // Array of media items
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plays: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', postSchema);
