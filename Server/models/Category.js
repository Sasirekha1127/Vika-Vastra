const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING, 
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    discountType: {
        type: DataTypes.ENUM('none', 'flat', 'percentage'),
        allowNull: false,
        defaultValue: 'none'
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, { tableName: 'categories' });

module.exports = Category;
