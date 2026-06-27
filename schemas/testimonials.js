import Joi from 'joi';

export const testimonialCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  text: Joi.string().trim().min(1).max(1000).required(),
}).unknown(false);
