import { models } from '../models/index.js';

const { Order } = models;

// ponytail: public write, no auth/list endpoint. Add admin list + auth if order review is needed.
export const createOrder = async (req, res, next) => {
  try {
    const { bouquetId, quantity, name, phone, address, message } = req.body;
    const order = await Order.create({ bouquetId, quantity, name, phone, address, message });
    res.status(201).json(order.toJSON());
  } catch (error) {
    next(error);
  }
};
