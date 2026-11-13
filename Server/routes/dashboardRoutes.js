// routes/dashboardRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getDashboardStats,
  getStockAlerts,
  getOrderReport,
  exportOrderReport,
  getProductReport,
  exportProductReport,
} = require('../controllers/dashboardController');

// ── Existing ──────────────────────────────────────────────────────────────────
router.get('/stats',        getDashboardStats);
router.get('/stock-alerts', getStockAlerts);

// ── Order Reports ─────────────────────────────────────────────────────────────
// GET /dashboard/reports/orders
//   ?from=2025-01-01 &to=2025-12-31 &status=delivered &payment_status=paid
router.get('/reports/orders',        getOrderReport);

// GET /dashboard/reports/orders/export  → downloads orders.csv
router.get('/reports/orders/export', exportOrderReport);

// ── Product Reports ───────────────────────────────────────────────────────────
// GET /dashboard/reports/products
//   ?categoryId=3 &brandId=1 &stockStatus=low &threshold=10
router.get('/reports/products',        getProductReport);

// GET /dashboard/reports/products/export  → downloads products.csv
router.get('/reports/products/export', exportProductReport);

module.exports = router;