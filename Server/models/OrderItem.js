const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
    },

    product_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        field:     'product_id',
    },

    name: {
        type:      DataTypes.STRING,
        allowNull: true,
    },

    image: {
        type:      DataTypes.STRING,
        allowNull: true,
    },

    weight: {
        type:      DataTypes.STRING,
        allowNull: true,
    },

    variantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    variantAttributes: { type: DataTypes.JSON, allowNull: true },

    quantity: {
        type:         DataTypes.INTEGER,
        defaultValue: 1,
    },

    price: {
        type:      DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },

    gstType: { type: DataTypes.ENUM('inclusive', 'exclusive'), allowNull: false, defaultValue: 'exclusive' },
    gstRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    taxableAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },

    status: {
        type: DataTypes.ENUM(
            'Pending',
            'Processing',
            'Shipped',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
            'Returned',
        ),
        allowNull:    true,
        defaultValue: null,
    },

}, {
    tableName:  'orderitems',
    timestamps: true,
});

module.exports = OrderItem;
