import fs from 'node:fs/promises';
import path from 'node:path';
import { sequelize } from '../data/database.js';
import { models } from '../models/index.js';
import { seedBouquets, seedTestimonials } from '../data/seedData.js';
import { uploadBuffer } from '../helpers/cloudinary.js';
import { env } from '../data/env.js';

const { Bouquet, Testimonial } = models;

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const main = async () => {
  const imagesDir = env.seedImagesDir;
  if (!imagesDir) {
    throw new Error('SEED_IMAGES_DIR is required (path to the storefront img/ directory).');
  }

  await sequelize.authenticate();
  console.log('Database connection successful');
  await sequelize.sync();

  const folder = env.cloudinary.folder || 'flora-bouquets';
  let created = 0;
  let skipped = 0;

  for (const record of seedBouquets) {
    const existing = await Bouquet.findOne({ where: { title: record.title } });
    if (existing) {
      console.log(`skip  ${record.title} (already in database)`);
      skipped += 1;
      continue;
    }

    const imagePath = path.join(imagesDir, record.image);
    const buffer = await fs.readFile(imagePath);
    const publicId = slugify(record.title);

    const { url, publicId: cloudPublicId } = await uploadBuffer(buffer, {
      folder,
      publicId,
    });

    await Bouquet.create({
      title: record.title,
      description: record.description,
      price: record.price,
      favorite: record.favorite,
      photoURL: url,
      photoPublicId: cloudPublicId,
    });

    console.log(`add   ${record.title}`);
    created += 1;
  }

  console.log(`Seed complete: ${created} added, ${skipped} skipped`);

  let testimonialsCreated = 0;
  let testimonialsSkipped = 0;
  for (const record of seedTestimonials) {
    const existing = await Testimonial.findOne({ where: { name: record.name, text: record.text } });
    if (existing) {
      testimonialsSkipped += 1;
      continue;
    }
    await Testimonial.create({ name: record.name, text: record.text });
    testimonialsCreated += 1;
  }
  console.log(`Testimonials seed complete: ${testimonialsCreated} added, ${testimonialsSkipped} skipped`);
};

main()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  })
  .finally(() => sequelize.close());
