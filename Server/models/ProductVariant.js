const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariant = sequelize.define('ProductVariant', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    sku: { type: DataTypes.STRING(64), allowNull: true, unique: true },
    attributes: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    image: { type: DataTypes.STRING, allowNull: true },
    mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    salesPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'productvariants' });

module.exports = ProductVariant;
