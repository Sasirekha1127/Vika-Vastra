// backend/models/UserLogin.js
const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const UserLogin = sequelize.define('UserLogin', {
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING,  allowNull: false },
  email:    { type: DataTypes.STRING,  allowNull: true  },
  phone:    { type: DataTypes.STRING,  allowNull: false },
  password: { type: DataTypes.STRING,  allowNull: false },
}, {
  tableName:       'userlogin',   // ← must match exactly
  freezeTableName: true,
  timestamps:      true,
});

module.exports = UserLogin;
