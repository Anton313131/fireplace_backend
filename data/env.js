import 'dotenv/config';
import { NODE_ENVS } from '../constants/env.js';

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseOrigins = (value) =>
  (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || NODE_ENVS.DEVELOPMENT,
  databaseUrl: required('DATABASE_URL'),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  adminApiKey: process.env.ADMIN_API_KEY ?? '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    folder: process.env.CLOUDINARY_FOLDER ?? 'flora-bouquets',
  },
  seedImagesDir: process.env.SEED_IMAGES_DIR ?? '',
};
