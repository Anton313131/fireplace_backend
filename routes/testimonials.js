import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { testimonialCreateSchema } from '../schemas/testimonials.js';
import { listTestimonials, createTestimonial } from '../controllers/testimonialsController.js';

export const testimonialsRouter = Router();

testimonialsRouter.get('/', listTestimonials);
testimonialsRouter.post('/', validate(testimonialCreateSchema), createTestimonial);
