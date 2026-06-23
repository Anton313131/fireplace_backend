import { env } from '../data/env.js';

const isOriginAllowed = (origin) => {
  if (env.corsOrigins.length === 0) return false;
  if (!origin) return true;
  return env.corsOrigins.includes(origin);
};

export const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  if (!isOriginAllowed(origin)) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
};
