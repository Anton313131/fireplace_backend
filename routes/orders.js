import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { orderCreateSchema } from '../schemas/orders.js';
import { createOrder } from '../controllers/ordersController.js';

export const ordersRouter = Router();

ordersRouter.post('/', validate(orderCreateSchema), createOrder);
