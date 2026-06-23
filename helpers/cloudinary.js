import { v2 as cloudinary } from 'cloudinary';
import { env } from '../data/env.js';

const configured =
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret;

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export const uploadBuffer = (buffer, { folder, publicId }) => {
  if (!configured) {
    return Promise.reject(
      new Error('Cloudinary credentials are not configured (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).'),
    );
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image', overwrite: false },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};
