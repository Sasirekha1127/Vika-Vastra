const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subtitle: {                          // ← NEW
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {                           // ← NEW
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'banners',
  timestamps: true,
});

module.exports = Banner;