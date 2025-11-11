import winston from 'winston';
import 'winston-mongodb';
import Log from '../models/Log.js';
import dotenv from 'dotenv';
dotenv.config();

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(meta).length > 0) {
    msg += ` ${JSON.stringify(meta)}`;
  }
  return msg;
});

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        consoleFormat
      )
    }),
    
    // MongoDB transport
 new winston.transports.MongoDB({
  db:process.env.MONGODB_URI,     // Provide the full connection string here
  collection: 'logs',
  level: 'info',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
})

  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: 'logs'
    })
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: 'logs'
    })
  ]
});

// Helper function to log with custom metadata
export const logAction = async (level, message, meta = {}) => {
  logger.log(level, message, meta);
  
  // Also save to custom Log model for advanced queries
  if (level === 'error' || level === 'warn' || meta.action) {
    try {
      await Log.create({
        level,
        message,
        meta,
        userId: meta.userId,
        action: meta.action,
        ip: meta.ip,
        userAgent: meta.userAgent,
        statusCode: meta.statusCode,
        method: meta.method,
        url: meta.url,
        duration: meta.duration,
        error: meta.error,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }
};

export default logger;
