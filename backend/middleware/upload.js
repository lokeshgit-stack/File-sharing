import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { s3Client, S3_BUCKET } from '../config/aws.js';
import logger from '../config/logger.js';

// Configure multer to use S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user._id.toString() : 'anonymous',
        uploadDate: new Date().toISOString()
      });
    },
    key: function (req, file, cb) {
      const userId = req.user ? req.user._id : 'anonymous';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = path.extname(file.originalname);
      
      // Determine folder based on file type
      const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(file.originalname);
      const folder = isVideo ? 'videos' : 'podcasts';
      
      const filename = `${folder}/${userId}/${timestamp}-${randomString}${extension}`;
      
      logger.info('Uploading file to S3', {
        action: 'FILE_UPLOAD_START',
        userId: req.user?._id,
        filename: file.originalname,
        s3Key: filename,
        fileType: isVideo ? 'video' : 'audio'
      });
      
      cb(null, filename);
    }
  }),
  limits: { 
    fileSize: 500 * 1024 * 1024 // 500MB for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|m4a|mpeg|mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio and video files are allowed!'));
    }
  }
});

export { upload };
