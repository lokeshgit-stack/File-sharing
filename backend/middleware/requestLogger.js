import logger, { logAction } from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logAction('http', `${req.method} ${req.url} ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?._id
    });
  });

  next();
};
