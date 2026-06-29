import Joi from 'joi';

export const orderCreateSchema = Joi.object({
  bouquetId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
  name: Joi.string().trim().min(1).max(100).required(),
  phone: Joi.string().trim().min(1).max(50).required(),
  address: Joi.string().trim().max(300).allow(''),
  message: Joi.string().trim().max(1000).allow(''),
}).unknown(false);
