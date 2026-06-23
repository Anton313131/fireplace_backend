import { HttpError } from '../helpers/HttpError.js';

export const notFoundHandler = (req, res, next) => {
  next(new HttpError(404, 'Route not found'));
};
