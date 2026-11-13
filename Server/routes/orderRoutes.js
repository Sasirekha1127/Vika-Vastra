// routes/orderRoutes.js
const express = require('express');
const router  = express.Router();

const {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  updateOrderStatus,
  sendShipmentTracking,
} = require('../controllers/orderController');

router.post  ('/save',            createOrder);
router.get   ('/all',             getAllOrders);
router.get   ('/customer/:id',    getCustomerOrders);
router.patch ('/:id/status',      updateOrderStatus);
router.post  ('/:id/shipping-tracking', sendShipmentTracking);

module.exports = router;
