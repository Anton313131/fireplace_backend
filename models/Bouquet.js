import { DataTypes } from 'sequelize';
import { sequelize } from '../data/database.js';

export const Bouquet = sequelize.define(
  'Bouquet',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    photoURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photoPublicId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'bouquets',
    timestamps: true,
  },
);

Bouquet.prototype.toJSON = function toJSON() {
  const { photoPublicId, price, ...rest } = this.get();
  return { ...rest, price: Number(price) };
};
