import { Sequelize } from 'sequelize';
import { env } from './env.js';

const isRenderUrl = env.databaseUrl.includes('render.com');

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  ...(isRenderUrl && {
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  }),
});
