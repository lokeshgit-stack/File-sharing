import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, S3_BUCKET } from '../config/aws.js';

// Set FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

/**
 * Generate thumbnail from video and upload to S3
 * @param {string} videoPath - Path to video file or S3 URL
 * @param {string} userId - User ID for organizing thumbnails
 * @returns {Promise<Object>} Object with thumbnailKey and thumbnailUrl
 */
export const generateThumbnail = async (videoPath, userId) => {
  return new Promise((resolve, reject) => {
    const thumbnailFilename = `thumbnail-${Date.now()}.jpg`;
    const thumbnailPath = path.join('uploads', thumbnailFilename);

    // Ensure uploads directory exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }

    console.log('Generating thumbnail from:', videoPath);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['50%'], // Take screenshot at 50% of video
        filename: thumbnailFilename,
        folder: 'uploads',
        size: '1280x720' // HD thumbnail
      })
      .on('end', async () => {
        console.log('Thumbnail generated, uploading to S3...');
        
        try {
          // Upload thumbnail to S3
          const fileStream = fs.createReadStream(thumbnailPath);
          const s3Key = `thumbnails/${userId}/${Date.now()}-${thumbnailFilename}`;

          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: S3_BUCKET,
              Key: s3Key,
              Body: fileStream,
              ContentType: 'image/jpeg',
              ACL: 'public-read'
            }
          });

          await upload.done();

          const thumbnailUrl = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

          console.log('Thumbnail uploaded to S3:', thumbnailUrl);

          // Clean up local file
          fs.unlinkSync(thumbnailPath);

          resolve({
            thumbnailKey: s3Key,
            thumbnailUrl: thumbnailUrl
          });
        } catch (error) {
          console.error('Error uploading thumbnail to S3:', error);
          
          // Clean up local file even on error
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
          
          reject(error);
        }
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        
        // Clean up local file on error
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
        
        reject(err);
      });
  });
};

/**
 * Get video duration using FFprobe
 * @param {string} videoPath - Path to video file
 * @returns {Promise<number>} Duration in seconds
 */
export const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    console.log('Getting video duration from:', videoPath);
    
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Error getting video duration:', err);
        reject(err);
      } else {
        const duration = Math.floor(metadata.format.duration);
        console.log('Video duration:', duration, 'seconds');
        resolve(duration);
      }
    });
  });
};

/**
 * Get video metadata (duration, resolution, codec, etc.)
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} Video metadata
 */
export const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('Error getting video metadata:', err);
        reject(err);
      } else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        
        resolve({
          duration: Math.floor(metadata.format.duration),
          size: metadata.format.size,
          bitRate: metadata.format.bit_rate,
          width: videoStream?.width,
          height: videoStream?.height,
          codec: videoStream?.codec_name,
          fps: eval(videoStream?.r_frame_rate) // Convert "30/1" to 30
        });
      }
    });
  });
};

/**
 * Generate multiple thumbnails at different timestamps
 * @param {string} videoPath - Path to video file
 * @param {string} userId - User ID
 * @param {number} count - Number of thumbnails to generate
 * @returns {Promise<Array>} Array of thumbnail objects
 */
export const generateMultipleThumbnails = async (videoPath, userId, count = 3) => {
  const timestamps = [];
  
  // Generate evenly spaced timestamps (e.g., 25%, 50%, 75%)
  for (let i = 1; i <= count; i++) {
    timestamps.push(`${(100 / (count + 1)) * i}%`);
  }

  return new Promise((resolve, reject) => {
    const thumbnails = [];
    const baseFilename = `thumbnail-${Date.now()}`;
    
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }

    ffmpeg(videoPath)
      .screenshots({
        timestamps: timestamps,
        filename: `${baseFilename}-%i.jpg`,
        folder: 'uploads',
        size: '1280x720'
      })
      .on('end', async () => {
        try {
          // Upload all thumbnails to S3
          for (let i = 0; i < count; i++) {
            const localPath = path.join('uploads', `${baseFilename}-${i + 1}.jpg`);
            const fileStream = fs.createReadStream(localPath);
            const s3Key = `thumbnails/${userId}/${Date.now()}-${i}.jpg`;

            const upload = new Upload({
              client: s3Client,
              params: {
                Bucket: S3_BUCKET,
                Key: s3Key,
                Body: fileStream,
                ContentType: 'image/jpeg',
                ACL: 'public-read'
              }
            });

            await upload.done();

            thumbnails.push({
              thumbnailKey: s3Key,
              thumbnailUrl: `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`
            });

            // Clean up local file
            fs.unlinkSync(localPath);
          }

          resolve(thumbnails);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};
