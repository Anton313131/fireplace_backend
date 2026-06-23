import Joi from 'joi';

const requiredString = (max = 1000) => Joi.string().trim().min(1).max(max).required();

export const bouquetIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const bouquetCreateSchema = Joi.object({
  title: requiredString(200),
  description: requiredString(2000),
  price: Joi.number().positive().precision(2).required(),
  favorite: Joi.boolean().default(false),
});

export const bouquetUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1).max(2000),
  price: Joi.number().positive().precision(2),
  favorite: Joi.boolean(),
}).min(1);

export const favoriteUpdateSchema = Joi.object({
  favorite: Joi.boolean().required(),
}).unknown(false);
