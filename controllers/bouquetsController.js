import { HttpError } from '../helpers/HttpError.js';
import { models } from '../models/index.js';
import { uploadBuffer, destroyAsset } from '../helpers/cloudinary.js';
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

export const setFavorite = async (req, res, next) => {
  try {
    const bouquet = await Bouquet.findByPk(req.params.id);
    if (!bouquet) throw new HttpError(404, 'Bouquet not found');
    bouquet.favorite = req.body.favorite;
    await bouquet.save();
    res.status(200).json(bouquet.toJSON());
  } catch (error) {
    next(error);
  }
};

export const updateBouquet = async (req, res, next) => {
  try {
    const bouquet = await Bouquet.findByPk(req.params.id);
    if (!bouquet) throw new HttpError(404, 'Bouquet not found');

    const { title, description, price, favorite } = req.body;
    let newPhoto = null;
    let oldPublicId = null;

    if (req.file) {
      const publicId = `${slugify(title ?? bouquet.title)}-${Date.now()}`;
      newPhoto = await uploadBuffer(req.file.buffer, {
        folder: env.cloudinary.folder,
        publicId,
      });
      oldPublicId = bouquet.photoPublicId;
    }

    if (title !== undefined) bouquet.title = title;
    if (description !== undefined) bouquet.description = description;
    if (price !== undefined) bouquet.price = price;
    if (favorite !== undefined) bouquet.favorite = favorite;
    if (newPhoto) {
      bouquet.photoURL = newPhoto.url;
      bouquet.photoPublicId = newPhoto.publicId;
    }

    try {
      await bouquet.save();
    } catch (dbError) {
      if (newPhoto) {
        try {
          await destroyAsset(newPhoto.publicId);
        } catch (rollbackError) {
          console.error('Rollback: failed to remove new Cloudinary asset:', rollbackError);
        }
      }
      throw dbError;
    }

    if (oldPublicId) {
      try {
        await destroyAsset(oldPublicId);
      } catch (cleanupError) {
        console.error('Failed to remove old Cloudinary asset after update:', oldPublicId, cleanupError);
      }
    }

    res.status(200).json(bouquet.toJSON());
  } catch (error) {
    next(error);
  }
};
