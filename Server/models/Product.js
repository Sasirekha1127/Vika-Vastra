const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./Category');
const SubCategory = require('./SubCategory');
const Brand = require('./Brand');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true,
        set(value) {
            this.setDataValue('sku', value ? String(value).trim().toUpperCase() : null);
        }
    },
    mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    salesPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    gstType: { type: DataTypes.ENUM('inclusive', 'exclusive'), allowNull: false, defaultValue: 'exclusive' },
    gstRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shortDescription: {
        type: DataTypes.STRING(300),
        allowNull: true
    },
    longDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isNewArrival: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isBestSeller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    subCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    brandId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    colors: {
        type: DataTypes.JSON,
        allowNull: true
    },
    sizes: {
        type: DataTypes.JSON,
        allowNull: true
    },
    ages: { type: DataTypes.JSON, allowNull: true },
    metres: { type: DataTypes.JSON, allowNull: true },
    fabrics: {
        type: DataTypes.JSON,
        allowNull: true
    },
    weights: {
        type: DataTypes.JSON,
        allowNull: true
    },
    volumes: {
        type: DataTypes.JSON,
        allowNull: true
    },
    nos: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, { tableName: 'products' });

// Associations
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId' });
SubCategory.hasMany(Product, { foreignKey: 'subCategoryId' });

Brand.hasMany(Product, { foreignKey: 'brandId' });
Product.belongsTo(Brand, { foreignKey: 'brandId' });

const ProductVariant = require('./ProductVariant');
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'Variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

module.exports = Product;
