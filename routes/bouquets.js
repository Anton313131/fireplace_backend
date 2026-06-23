import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { bouquetIdParamSchema } from '../schemas/bouquets.js';
import { listBouquets, getBouquet } from '../controllers/bouquetsController.js';

export const bouquetsRouter = Router();

bouquetsRouter.get('/', listBouquets);
bouquetsRouter.get('/:id', validate(bouquetIdParamSchema, 'params'), getBouquet);
