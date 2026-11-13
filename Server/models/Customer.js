// models/Customer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isEmail: true }
    },
    // REMOVED: status field - it doesn't exist in your database
    username: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.name;
        },
        set(value) {
            this.name = value;
        }
    }
}, {
    tableName: 'customers',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Customer;
