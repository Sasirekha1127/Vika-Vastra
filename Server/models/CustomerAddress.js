// models/CustomerAddress.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CustomerAddress = sequelize.define('CustomerAddress', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'userlogin', // FIX: was 'Customers', now points to userlogin table
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    type: {
        type: DataTypes.ENUM('billing', 'shipping'),
        defaultValue: 'billing',
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    company: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    address1: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address2: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    postcode: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    phone2: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    }
}, {
    tableName: 'customeraddresses',
    freezeTableName: true,
    timestamps: false
});

module.exports = CustomerAddress;
