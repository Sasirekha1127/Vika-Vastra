const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Offerbanner = sequelize.define('Offerbanner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
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
    allowNull: true,
  },
  discountLabel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  brandTag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shopUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  titleColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#ffffff',
  },
  discountColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#f5d78e',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'offer_banners',
  timestamps: true,
});

module.exports = Offerbanner;
