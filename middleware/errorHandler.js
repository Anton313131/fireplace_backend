import multer from 'multer';
import { NODE_ENVS } from '../constants/env.js';
import { env } from '../data/env.js';

const multerMessages = {
  LIMIT_FILE_SIZE: 'File is too large (max 6 MB)',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
};

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: multerMessages[err.code] || 'File upload error',
    });
  }

  if (err.status && err.message) {
    const body = { message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }

  console.error('Unexpected error:', err);

  const isProd = env.nodeEnv === NODE_ENVS.PRODUCTION;
  return res.status(500).json({
    message: isProd ? 'Internal server error' : err.message,
  });
};
