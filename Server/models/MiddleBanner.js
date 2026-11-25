const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MiddleBanner = sequelize.define('MiddleBanner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Middle Banner',
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/shop',
  },
  shopUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/shop',
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'middle_banners',
  timestamps: true,
});

module.exports = MiddleBanner;
