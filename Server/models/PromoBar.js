"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PromoBar = sequelize.define(
  "PromoBar",
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    message: {
      type:      DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "Pay Online & GET 10% OFF on your Purchase",
    },
    isActive: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
  },
  {
    tableName:  "promobars",
    timestamps: true,
  }
);

module.exports = PromoBar;
