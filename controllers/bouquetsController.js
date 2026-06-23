import { HttpError } from '../helpers/HttpError.js';
import { models } from '../models/index.js';

const { Bouquet } = models;

export const listBouquets = async (_req, res, next) => {
  try {
    const items = await Bouquet.findAll({ order: [['id', 'ASC']] });
    res.status(200).json(items.map((b) => b.toJSON()));
  } catch (error) {
    next(error);
  }
};

export const getBouquet = async (req, res, next) => {
  try {
    const bouquet = await Bouquet.findByPk(req.params.id);
    if (!bouquet) throw new HttpError(404, 'Bouquet not found');
    res.status(200).json(bouquet.toJSON());
  } catch (error) {
    next(error);
  }
};
