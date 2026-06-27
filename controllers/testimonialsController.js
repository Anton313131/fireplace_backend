import { models } from '../models/index.js';

const { Testimonial } = models;

const order = [['id', 'ASC']];

export const listTestimonials = async (_req, res, next) => {
  try {
    const items = await Testimonial.findAll({ order });
    res.status(200).json(items.map((t) => t.toJSON()));
  } catch (error) {
    next(error);
  }
};

// ponytail: public write, no auth/rate-limit. Add rate-limiting if spam becomes a problem.
export const createTestimonial = async (req, res, next) => {
  try {
    const { name, text } = req.body;
    const testimonial = await Testimonial.create({ name, text });
    res.status(201).json(testimonial.toJSON());
  } catch (error) {
    next(error);
  }
};
