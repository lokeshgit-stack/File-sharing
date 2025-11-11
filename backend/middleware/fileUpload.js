import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { s3Client, S3_BUCKET } from '../config/aws.js';
import logger from '../config/logger.js';

const fileUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET,
    acl: 'private', // Private access for secure sharing
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user ? req.user._id.toString() : 'anonymous',
        uploadDate: new Date().toISOString(),
        originalName: file.originalname
      });
    },
    key: function (req, file, cb) {
      const userId = req.user ? req.user._id : 'anonymous';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = path.extname(file.originalname);
      const filename = `secure-files/${userId}/${timestamp}-${randomString}${extension}`;
      
      logger.info('Uploading secure file to S3', {
        action: 'SECURE_FILE_UPLOAD_START',
        userId: req.user?._id,
        filename: file.originalname,
        s3Key: filename
      });
      
      cb(null, filename);
    }
  }),
  limits: { 
    fileSize: 200 * 1024 * 1024 // 200MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types
    cb(null, true);
  }
});

export { fileUpload };
