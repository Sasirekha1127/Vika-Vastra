const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InstagramPost = sequelize.define('InstagramPost', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
 
  postUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'instagram_posts',
  timestamps: true,
});

module.exports = InstagramPost;