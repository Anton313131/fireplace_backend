import { HttpError } from '../helpers/HttpError.js';

const formatDetails = (details) =>
  details.map((d) => d.message).filter(Boolean);

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source], {
    abortEarly: false,
    convert: true,
  });
  if (error) {
    return next(new HttpError(400, 'Validation failed', formatDetails(error.details)));
  }
  req[source] = value;
  next();
};
