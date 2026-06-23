import { HttpError } from '../helpers/HttpError.js';
import { models } from '../models/index.js';
import { uploadBuffer } from '../helpers/cloudinary.js';
import { env } from '../data/env.js';

const { Bouquet } = models;

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'bouquet';

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

export const createBouquet = async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, 'Image file is required');
    const { title, description, price, favorite } = req.body;
    const publicId = `${slugify(title)}-${Date.now()}`;
    const { url, publicId: returnedPublicId } = await uploadBuffer(req.file.buffer, {
      folder: env.cloudinary.folder,
      publicId,
    });
    const bouquet = await Bouquet.create({
      title,
      description,
      price,
      favorite: favorite ?? false,
      photoURL: url,
      photoPublicId: returnedPublicId,
    });
    res.status(201).json(bouquet.toJSON());
  } catch (error) {
    next(error);
  }
};
