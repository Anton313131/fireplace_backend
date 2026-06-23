import multer from 'multer';
import { HttpError } from '../helpers/HttpError.js';

const MAX_FILE_SIZE = 6 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new HttpError(400, `Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
