import { HttpError } from '../helpers/HttpError.js';
import { env } from '../data/env.js';

export const authenticate = (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || token !== env.adminApiKey) {
    return next(new HttpError(401, 'Unauthorized'));
  }
  next();
};
