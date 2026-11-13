const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {

  order_number: {
    type:         DataTypes.STRING,
    allowNull:    true,
    unique:       true,
  },

  customer_id: { type: DataTypes.INTEGER, allowNull: true },

  customer_name:  { type: DataTypes.STRING, allowNull: false },
  customer_email: { type: DataTypes.STRING, allowNull: false },
  customer_phone: { type: DataTypes.STRING, allowNull: true },
  customer_phone2:{ type: DataTypes.STRING, allowNull: true },

  billing_address:  { type: DataTypes.TEXT, allowNull: true },
  shipping_address: { type: DataTypes.TEXT, allowNull: true },
  order_notes:      { type: DataTypes.TEXT, allowNull: true },

  subtotal:        { type: DataTypes.FLOAT, defaultValue: 0 },
  delivery_charge: { type: DataTypes.FLOAT, defaultValue: 0 },
  tax:             { type: DataTypes.FLOAT, defaultValue: 0 },
  discount:        { type: DataTypes.FLOAT, defaultValue: 0 },
  total:           { type: DataTypes.FLOAT, defaultValue: 0 },

  coupon_code:        DataTypes.STRING,
  payment_id:         DataTypes.STRING,
  razorpay_order_id:  DataTypes.STRING,
  razorpay_signature: DataTypes.STRING,

  payment_status: {
    type: DataTypes.ENUM('paid', 'pending', 'failed'),
    defaultValue: 'paid',
  },

  status: {
    type: DataTypes.ENUM(
      'processing',
      'confirmed',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'return_requested',
      'return_approved',
      'return_picked_up',
      'return_received',
      'refunded'
    ),
    defaultValue: 'processing',
  },

  awb_code:     DataTypes.STRING,
  courier_name: DataTypes.STRING,
  image:        DataTypes.STRING,

}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
