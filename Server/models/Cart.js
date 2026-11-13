const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    variantId: { type: DataTypes.INTEGER, allowNull: true },
    variantAttributes: { type: DataTypes.JSON, allowNull: true },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
    type: DataTypes.STRING,
    allowNull: true,
},
    img: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    tableName: 'carts',
    timestamps: true,
});

module.exports = Cart;
