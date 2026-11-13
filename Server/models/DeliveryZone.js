const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DeliveryZone = sequelize.define('DeliveryZone', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '',
    },
// ✅ After
district: {
  type: DataTypes.STRING(100),
  allowNull: false,
  unique: false,   
},
    charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'delivery_zones',
    timestamps: true,
});

module.exports = DeliveryZone;