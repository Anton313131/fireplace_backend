import { Router } from 'express';
import { validate, requireUpdatePayload } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  bouquetIdParamSchema,
  bouquetCreateSchema,
  bouquetUpdateSchema,
  favoriteUpdateSchema,
} from '../schemas/bouquets.js';
import {
  listBouquets,
  getBouquet,
  createBouquet,
  setFavorite,
  updateBouquet,
  deleteBouquet,
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
bouquetsRouter.put(
  '/:id',
  authenticate,
  validate(bouquetIdParamSchema, 'params'),
  upload.single('image'),
  validate(bouquetUpdateSchema),
  requireUpdatePayload,
  updateBouquet,
);
bouquetsRouter.delete(
  '/:id',
  authenticate,
  validate(bouquetIdParamSchema, 'params'),
  deleteBouquet,
);
bouquetsRouter.patch(
  '/:id/favorite',
  authenticate,
  validate(bouquetIdParamSchema, 'params'),
  validate(favoriteUpdateSchema),
  setFavorite,
);
