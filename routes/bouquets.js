import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  bouquetIdParamSchema,
  bouquetCreateSchema,
  favoriteUpdateSchema,
} from '../schemas/bouquets.js';
import {
  listBouquets,
  getBouquet,
  createBouquet,
  setFavorite,
} from '../controllers/bouquetsController.js';

export const bouquetsRouter = Router();

bouquetsRouter.get('/', listBouquets);
bouquetsRouter.get('/:id', validate(bouquetIdParamSchema, 'params'), getBouquet);
bouquetsRouter.post(
  '/',
  authenticate,
  upload.single('image'),
  validate(bouquetCreateSchema),
  createBouquet,
);
bouquetsRouter.patch(
  '/:id/favorite',
  authenticate,
  validate(bouquetIdParamSchema, 'params'),
  validate(favoriteUpdateSchema),
  setFavorite,
);
