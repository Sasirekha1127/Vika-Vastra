const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubCategory = sequelize.define('SubCategory', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    categoryId: { 
        type: DataTypes.INTEGER, 
        allowNull: false
    },
    image: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' }
}, { tableName: 'subcategories' });

module.exports = SubCategory;
