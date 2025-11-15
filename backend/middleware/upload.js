import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { s3Client, S3_BUCKET } from '../config/aws.js';
import logger from '../config/logger.js';

// Allowed formats for images, videos, and audio
const IMAGE_TYPES = /jpg|jpeg|png|webp|heic/;
const VIDEO_TYPES = /mp4|mov|avi|mkv|webm|mpeg/;
const AUDIO_TYPES = /mp3|wav|ogg|m4a/;

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,

    // For inline display like social media
    contentDisposition: (req, file, cb) => {
      const mime = file.mimetype;
      if (mime.startsWith("video/") || mime.startsWith("image/")) {
        cb(null, 'inline'); // show video/image inline
      } else {
        cb(null, 'attachment'); // audio can be downloaded
      }
    },

    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user._id.toString() : 'anonymous',
        uploadDate: new Date().toISOString()
      });
    },

    key: (req, file, cb) => {
      const userId = req.user ? req.user._id : 'anonymous';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const ext = path.extname(file.originalname).toLowerCase();

      const mime = file.mimetype;

      let folder = "others";

      if (mime.startsWith("image/")) folder = "images";
      else if (mime.startsWith("video/")) folder = "videos";
      else if (mime.startsWith("audio/")) folder = "audio";

      const fileKey = `${folder}/${userId}/${timestamp}-${randomString}${ext}`;

      logger.info('Uploading file to S3', {
        action: 'FILE_UPLOAD_START',
        userId: req.user?._id,
        filename: file.originalname,
        s3Key: fileKey,
        fileType: folder
      });

      cb(null, fileKey);
    }
  }),

  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB
  },

fileFilter: (req, file, cb) => {
  const allowedTypes = /mp3|wav|ogg|m4a|mpeg|mp4|mov|avi|mkv|webm|jpg|jpeg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype.startsWith('video/') || 
                   file.mimetype.startsWith('image/') ||
                   file.mimetype.startsWith('audio/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, videos, and audio files are allowed!'));
  }
}

});

export { upload };
