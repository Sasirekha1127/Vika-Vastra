// controllers/dashboardController.js
const { Op } = require('sequelize');
const Product    = require('../models/Product');
const Category   = require('../models/Category');
const Brand      = require('../models/Brand');
const Customer   = require('../models/Customer');
const Order      = require('../models/Order');
const OrderItem  = require('../models/OrderItem');
const sequelize  = require('../config/db');

// ─── HELPER: format date ──────────────────────────────────────────────────────
const parseRange = (from, to) => {
  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(from);
    if (to)   where.createdAt[Op.lte] = new Date(new Date(to).setHours(23, 59, 59, 999));
  }
  return where;
};

// ─── HELPER: rows → CSV string ────────────────────────────────────────────────
const toCSV = (headers, rows) => {
  const escape = v =>
    v == null ? '' : `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  return lines.join('\r\n');
};


// ─── GET /dashboard/stats ────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalCustomers, totalOrders, recentProducts] = await Promise.all([
      Product.count(),
      Customer.count(),
      Order.count(),
      Product.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [{ model: Category, attributes: ['id', 'name'] }],
      }),
    ]);

    return res.json({
      stats: { totalProducts, totalCustomers, totalOrders },
      recentProducts,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ─── GET /dashboard/stock-alerts?threshold=10 ────────────────────────────────
exports.getStockAlerts = async (req, res) => {
  try {
    const threshold = Math.max(1, parseInt(req.query.threshold) || 10);

    const products = await Product.findAll({
      include: [{ model: Category, attributes: ['id', 'name'] }],
    });

    const lowStock   = [];
    const outOfStock = [];

    products.forEach(p => {
      const entry = {
        productId:   p.id,
        productName: p.productName,
        category:    p.Category?.name || '—',
        stock:       Number(p.stock) || 0,
        mrp:         p.mrp,
        salesPrice:  p.salesPrice,
      };

      if (entry.stock === 0) {
        outOfStock.push(entry);
      } else if (entry.stock <= threshold) {
        lowStock.push(entry);
      }
    });

    lowStock.sort((a, b) => a.stock - b.stock);

    return res.json({
      lowStockThreshold: threshold,
      lowStock,
      outOfStock,
      summary: {
        lowStockCount:   lowStock.length,
        outOfStockCount: outOfStock.length,
        totalAlerts:     lowStock.length + outOfStock.length,
      },
    });
  } catch (err) {
    console.error('getStockAlerts error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// ─── GET /dashboard/reports/orders ───────────────────────────────────────────
// Query params:
//   from        ISO date string  e.g. 2025-01-01
//   to          ISO date string  e.g. 2025-12-31
//   status      order status     e.g. delivered
//   payment_status               e.g. paid
//
// Response: summary totals + order list
exports.getOrderReport = async (req, res) => {
  try {
    const { from, to, status, payment_status } = req.query;

    const where = parseRange(from, to);
    if (status)         where.status         = status;
    if (payment_status) where.payment_status = payment_status;

    const orders = await Order.findAll({
      where,
      include: [{
        model: OrderItem,
        as:    'OrderItems',
        include: [{
          model:      Product,
          as:         'Product',
          attributes: ['id', 'productName', 'salesPrice'],
        }],
      }],
      order: [['createdAt', 'DESC']],
    });

    // ── Summary totals ──────────────────────────────────────────────────────
    const summary = orders.reduce(
      (acc, o) => {
        acc.totalOrders   += 1;
        acc.totalRevenue  += parseFloat(o.total)           || 0;
        acc.totalDiscount += parseFloat(o.discount)        || 0;
        acc.totalTax      += parseFloat(o.tax)             || 0;
        acc.totalDelivery += parseFloat(o.delivery_charge) || 0;
        if (o.status === 'delivered')  acc.deliveredCount++;
        if (o.status === 'cancelled')  acc.cancelledCount++;
        return acc;
      },
      {
        totalOrders:    0,
        totalRevenue:   0,
        totalDiscount:  0,
        totalTax:       0,
        totalDelivery:  0,
        deliveredCount: 0,
        cancelledCount: 0,
      }
    );

    // Round floats
    Object.keys(summary).forEach(k => {
      if (typeof summary[k] === 'number' && !Number.isInteger(summary[k])) {
        summary[k] = parseFloat(summary[k].toFixed(2));
      }
    });

    return res.json({ success: true, summary, orders });
  } catch (err) {
    console.error('getOrderReport error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ─── GET /dashboard/reports/orders/export ────────────────────────────────────
// Same query params as getOrderReport; streams a CSV file download.
exports.exportOrderReport = async (req, res) => {
  try {
    const { from, to, status, payment_status } = req.query;

    const where = parseRange(from, to);
    if (status)         where.status         = status;
    if (payment_status) where.payment_status = payment_status;

    const orders = await Order.findAll({
      where,
      include: [{
        model: OrderItem,
        as:    'OrderItems',
        include: [{
          model:      Product,
          as:         'Product',
          attributes: ['id', 'productName'],
        }],
      }],
      order: [['createdAt', 'DESC']],
    });

    // Flatten: one row per order (items joined as pipe-separated string)
    const HEADERS = [
      'order_number', 'date', 'customer_name', 'customer_email',
      'customer_phone', 'status', 'payment_status', 'subtotal',
      'discount', 'tax', 'delivery_charge', 'total',
      'coupon_code', 'items',
    ];

    const rows = orders.map(o => ({
      order_number:    o.order_number,
      date:            o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '',
      customer_name:   o.customer_name,
      customer_email:  o.customer_email,
      customer_phone:  o.customer_phone || '',
      status:          o.status,
      payment_status:  o.payment_status,
      subtotal:        o.subtotal,
      discount:        o.discount,
      tax:             o.tax,
      delivery_charge: o.delivery_charge,
      total:           o.total,
      coupon_code:     o.coupon_code || '',
      items: (o.OrderItems || [])
        .map(i => `${i.Product?.productName || i.name} x${i.quantity}`)
        .join(' | '),
    }));

    const csv      = toCSV(HEADERS, rows);
    const filename = `order-report-${Date.now()}.csv`;

    res.setHeader('Content-Type',        'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  } catch (err) {
    console.error('exportOrderReport error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ─── GET /dashboard/reports/products ─────────────────────────────────────────
// Query params:
//   categoryId    filter by category
//   brandId       filter by brand
//   stockStatus   all | low | out   (default: all)
//   threshold     low-stock threshold (default: 10)
//
// Response: summary + product list with sales data joined from OrderItems
exports.getProductReport = async (req, res) => {
  try {
    const {
      categoryId,
      brandId,
      stockStatus = 'all',
      threshold   = 10,
    } = req.query;

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (brandId)    where.brandId    = brandId;

    const stockThreshold = Math.max(1, parseInt(threshold) || 10);
    if (stockStatus === 'out') {
      where.stock = 0;
    } else if (stockStatus === 'low') {
      where.stock = { [Op.gt]: 0, [Op.lte]: stockThreshold };
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category,  attributes: ['id', 'name'] },
        { model: Brand,     attributes: ['id', 'brandName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // ── Attach total units sold from OrderItems ──────────────────────────────
    const productIds = products.map(p => p.id);

    let salesMap = {};
    if (productIds.length) {
      const salesRows = await OrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'unitsSold'],
          [sequelize.fn('SUM', sequelize.literal('quantity * price')), 'revenue'],
        ],
        where:  { product_id: { [Op.in]: productIds } },
        group:  ['product_id'],
        raw:    true,
      });
      
      salesRows.forEach(r => {
        salesMap[r.product_id] = {
          unitsSold: parseInt(r.unitsSold) || 0,
          revenue:   parseFloat(r.revenue) || 0,
        };
      });
    }

    const productList = products.map(p => ({
      id:           p.id,
      productName:  p.productName,
      category:     p.Category?.name      || '—',
      brand:        p.Brand?.brandName    || '—',
      mrp:          p.mrp,
      salesPrice:   p.salesPrice,
      stock:        p.stock,
      stockStatus:  p.stock === 0
                      ? 'Out of Stock'
                      : p.stock <= stockThreshold
                        ? 'Low Stock'
                        : 'In Stock',
      unitsSold:    salesMap[p.id]?.unitsSold || 0,
      revenue:      parseFloat((salesMap[p.id]?.revenue || 0).toFixed(2)),
    }));

    const summary = productList.reduce(
      (acc, p) => {
        acc.totalProducts++;
        acc.totalRevenue  += p.revenue;
        acc.totalUnitsSold += p.unitsSold;
        if (p.stockStatus === 'Out of Stock') acc.outOfStockCount++;
        if (p.stockStatus === 'Low Stock')    acc.lowStockCount++;
        return acc;
      },
      {
        totalProducts:  0,
        totalRevenue:   0,
        totalUnitsSold: 0,
        outOfStockCount: 0,
        lowStockCount:  0,
      }
    );
    summary.totalRevenue = parseFloat(summary.totalRevenue.toFixed(2));

    return res.json({ success: true, summary, products: productList });
  } catch (err) {
    console.error('getProductReport error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ─── GET /dashboard/reports/products/export ──────────────────────────────────
// Same query params as getProductReport; streams a CSV file download.
exports.exportProductReport = async (req, res) => {
  try {
    const {
      categoryId,
      brandId,
      stockStatus = 'all',
      threshold   = 10,
    } = req.query;

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (brandId)    where.brandId    = brandId;

    const stockThreshold = Math.max(1, parseInt(threshold) || 10);
    if (stockStatus === 'out') {
      where.stock = 0;
    } else if (stockStatus === 'low') {
      where.stock = { [Op.gt]: 0, [Op.lte]: stockThreshold };
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: Brand,    attributes: ['id', 'brandName'] },
      ],
      order: [['productName', 'ASC']],
    });

    const productIds = products.map(p => p.id);
    let salesMap = {};
    if (productIds.length) {
      const salesRows = await OrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'unitsSold'],
          [sequelize.fn('SUM', sequelize.literal('quantity * price')), 'revenue'],
        ],
        where:  { product_id: { [Op.in]: productIds } },
        group:  ['product_id'],
        raw:    true,
      });
      salesRows.forEach(r => {
        salesMap[r.product_id] = {
          unitsSold: parseInt(r.unitsSold) || 0,
          revenue:   parseFloat(r.revenue) || 0,
        };
      });
    }

    const HEADERS = [
      'id', 'productName', 'category', 'brand',
      'mrp', 'salesPrice', 'stock', 'stockStatus',
      'unitsSold', 'revenue',
    ];

    const rows = products.map(p => {
      const s = p.stock;
      return {
        id:          p.id,
        productName: p.productName,
        category:    p.Category?.name   || '—',
        brand:       p.Brand?.brandName || '—',
        mrp:         p.mrp,
        salesPrice:  p.salesPrice,
        stock:       s,
        stockStatus: s === 0
                       ? 'Out of Stock'
                       : s <= stockThreshold
                         ? 'Low Stock'
                         : 'In Stock',
        unitsSold:   salesMap[p.id]?.unitsSold || 0,
        revenue:     parseFloat((salesMap[p.id]?.revenue || 0).toFixed(2)),
      };
    });

    const csv      = toCSV(HEADERS, rows);
    const filename = `product-report-${Date.now()}.csv`;

    res.setHeader('Content-Type',        'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('exportProductReport error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};