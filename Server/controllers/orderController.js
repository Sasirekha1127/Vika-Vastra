// controllers/orderController.js
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const ProductVariant = require('../models/ProductVariant');
const sequelize = require('../config/db');
const crypto = require('crypto');

const {
    sendOrderStatusEmail,
    sendOrderConfirmationEmail,
    sendAdminOrderNotification,
    sendShipmentTrackingEmail
} = require('../services/emailService');

// ─────────────────────────────────────────
// 🔢 GENERATE ORDER NUMBER  →  VV-001 (Vika Vasthra)
// ─────────────────────────────────────────
const generateOrderNumber = async () => {
    try {
        const last = await Order.findOne({
            where: sequelize.literal(`order_number LIKE 'VV-%' OR order_number LIKE 'EMT-%'`),
            order: [['id', 'DESC']],
        });

        let nextNum = 1;
        if (last && last.order_number) {
            const parts = last.order_number.split('-');
            if (parts.length >= 2) {
                const num = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(num)) {
                    nextNum = num + 1;
                }
            }
        }

        const orderNumber = `VV-${String(nextNum).padStart(3, '0')}`;
        console.log(`📋 Generated order number: ${orderNumber}`);
        return orderNumber;
    } catch (error) {
        console.error('Error generating order number:', error);
        // Fallback to timestamp-based number
        return `VV-${Date.now().toString().slice(-6)}`;
    }
};

// ─────────────────────────────────────────
// 🛍 CREATE ORDER
// ─────────────────────────────────────────
const createOrder = async (req, res) => {
    try {
        console.log('=== 📦 CREATE ORDER CALLED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const {
            customer_id,
            customer_name,
            customer_email,
            customer_phone,
            customer_phone2,
            billing_address,
            shipping_address,
            order_notes,
            subtotal,
            delivery_charge,
            tax,
            discount,
            total,
            coupon_code,
            payment_id,
            razorpay_order_id,
            razorpay_signature,
            payment_status,
            items = []
        } = req.body;

        console.log(`📦 Items received: ${items.length}`);

        if (!razorpay_order_id || !payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Verified Razorpay payment details are required.' });
        }
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${payment_id}`)
            .digest('hex');
        const expectedBuffer = Buffer.from(expectedSignature);
        const suppliedBuffer = Buffer.from(String(razorpay_signature));
        if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
            return res.status(400).json({ success: false, message: 'Payment signature is invalid; order was not saved.' });
        }

        const existingPaymentOrder = await Order.findOne({ where: { payment_id } });
        if (existingPaymentOrder) {
            return res.status(200).json({
                success: true,
                message: 'Order already saved for this payment.',
                orderId: existingPaymentOrder.id,
                orderNumber: existingPaymentOrder.order_number,
                order: existingPaymentOrder,
            });
        }

        // ── Validation ──────────────────────────────────────────────
        if (!customer_name || !customer_email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customer_name and customer_email are required'
            });
        }

        if (items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in order. Please add items to your cart.'
            });
        }

        // ── Validate item stock before creating the order ──────────
        let taxableSubtotal = 0;
        let calculatedTax = 0;
        const unavailableItems = [];
        for (const item of items) {
            const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
            const productId = item.product_id || item.id;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: `Product ID is missing for item: ${item.name || 'Unknown'}`
                });
            }

            const product = await Product.findByPk(productId, { include: [{ model: Category }] });
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product "${item.name || 'Unknown'}" not found.`
                });
            }

            const selectedVariant = item.variantId ? await ProductVariant.findOne({ where: { id: item.variantId, productId } }) : null;
            if (item.variantId && !selectedVariant) return res.status(400).json({ success: false, message: `The selected variant for ${item.name || 'this product'} is unavailable.` });
            const availableStock = Number(selectedVariant?.stock ?? product.stock ?? 0);
            if (availableStock < quantity) unavailableItems.push(item.name || product.productName || 'Product');

            const basePrice = Number(selectedVariant?.salesPrice ?? product.salesPrice ?? product.mrp ?? 0);
            const categoryValue = Number(product.Category?.discountValue || 0);
            const categoryDiscount = product.Category?.discountType === 'flat'
                ? categoryValue
                : product.Category?.discountType === 'percentage'
                    ? basePrice * categoryValue / 100
                    : 0;
            const price = Math.max(0, basePrice - Math.min(basePrice, categoryDiscount));
            const gstRate = Math.max(0, Number(product.gstRate || 0));
            const gstType = product.gstType === 'inclusive' ? 'inclusive' : 'exclusive';
            const taxableUnit = gstType === 'inclusive' ? price / (1 + gstRate / 100) : price;
            const taxUnit = gstRate > 0 ? (gstType === 'inclusive' ? price - taxableUnit : taxableUnit * gstRate / 100) : 0;
            item.price = price;
            item.gstRate = gstRate;
            item.gstType = gstType;
            item.taxableUnit = taxableUnit;
            item.taxUnit = taxUnit;
            const lineTax = Number((taxUnit * quantity).toFixed(2));
            calculatedTax += lineTax;
            item.taxableLineAmount = Number((taxableUnit * quantity).toFixed(2));
            taxableSubtotal += item.taxableLineAmount;
        }

        const transaction = await sequelize.transaction();
        try {
            const effectiveTax = Number(calculatedTax.toFixed(2));
            const effectiveDiscount = parseFloat(discount) || 0;
            const effectiveTotal = taxableSubtotal + calculatedTax + (parseFloat(delivery_charge) || 0) - (parseFloat(discount) || 0);
            // ── Generate order number ──────────────────────────────
            const orderNumber = await generateOrderNumber();
            console.log(`📋 Using order number: ${orderNumber}`);

            // ── Create Order ──────────────────────────────────────────
            const order = await Order.create({
                order_number: orderNumber,
                customer_id: customer_id || null,
                customer_name,
                customer_email,
                customer_phone: customer_phone || null,
                customer_phone2: customer_phone2 || null,
                billing_address: billing_address || null,
                shipping_address: shipping_address || null,
                order_notes: [order_notes, unavailableItems.length
                    ? `PAYMENT RECEIVED - STOCK REVIEW REQUIRED: ${unavailableItems.join(', ')}`
                    : null].filter(Boolean).join('\n') || null,
                subtotal: Number(taxableSubtotal.toFixed(2)),
                delivery_charge: parseFloat(delivery_charge) || 0,
                tax: effectiveTax,
                discount: effectiveDiscount,
                total: Math.max(0, effectiveTotal),
                coupon_code: coupon_code || null,
                payment_id: payment_id || null,
                razorpay_order_id: razorpay_order_id || null,
                razorpay_signature: razorpay_signature || null,
                payment_status: payment_status || 'paid',
                image: items[0]?.image || items[0]?.img || null,
                status: 'processing'
            }, { transaction });

            console.log(`✅ Order created with ID: ${order.id}, Number: ${order.order_number}`);

            // ── Create Order Items ────────────────────────────────────
            const orderItemsData = items.map(item => ({
                orderId: order.id,
                product_id: item.product_id || item.id,
                name: item.name || 'Product',
                price: parseFloat(item.price) || 0,
                gstType: item.gstType,
                gstRate: item.gstRate,
                taxableAmount: item.taxableLineAmount,
                taxAmount: Number((item.taxUnit * Math.max(1, parseInt(item.quantity, 10) || 1)).toFixed(2)),
                quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
                image: item.image || item.img || null,
                weight: item.weight || item.variantName || null,
                variantId: item.variantId || null,
                variantAttributes: item.variantAttributes || null,
                status: null
            }));

            await OrderItem.bulkCreate(orderItemsData, { transaction });
            console.log(`✅ ${orderItemsData.length} order items created`);

            // ── Reduce stock ──────────────────────────────────────────
            for (const item of items) {
                const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
                const productId = item.product_id || item.id;
                const variant = item.variantId ? await ProductVariant.findOne({ where: { id: item.variantId, productId }, transaction }) : null;
                const product = variant || await Product.findByPk(productId, { transaction });
                if (product && Number(product.stock || 0) >= quantity) {
                    const newStock = Number(product.stock || 0) - quantity;
                    await product.update({ stock: newStock }, { transaction });
                    if (variant) {
                        const parent = await Product.findByPk(productId, { transaction });
                        const variants = await ProductVariant.findAll({ where: { productId, isActive: true }, attributes: ['stock'], transaction });
                        if (parent) await parent.update({ stock: variants.reduce((sum, row) => sum + Math.max(0, Number(row.stock) || 0), 0) }, { transaction });
                    }
                    console.log(`📦 Stock updated for product ${product.id}: ${newStock}`);
                }
            }

            await transaction.commit();
            console.log(`✅ Order ${order.order_number} committed successfully`);

            // ── Clear customer cart ──────────────────────────────────
            try {
                if (customer_id && req.body.checkout_mode !== 'buy_now') {
                    await Cart.destroy({ where: { customerId: customer_id } });
                    console.log(`🛒 Cart cleared for customer ${customer_id}`);
                }
            } catch (cartErr) {
                console.error('⚠️ Cart clear failed:', cartErr.message);
            }

            // ── Send order received email (don't block response) ─────
            try {
                console.log(`📧 Sending confirmation email → ${order.customer_email}`);
                await sendOrderConfirmationEmail({
                    email: order.customer_email,
                    name: order.customer_name,
                    paymentId: order.payment_id || order.razorpay_order_id || '—',
                    orderId: order.order_number,
                    items,
                    subtotal: order.subtotal,
                    tax: order.tax,
                    delivery_charge: order.delivery_charge,
                    discount: order.discount,
                    total: order.total,
                    coupon: order.coupon_code || null,
                    billingAddress: order.billing_address,
                    phone: order.customer_phone,
                    phone2: order.customer_phone2,
                });
                console.log(`✅ Confirmation email sent`);
            } catch (mailErr) {
                console.error('⚠️ Confirmation email failed:', mailErr.message);
            }

            // ── Notify admin (don't block response) ──────────────────
            try {
                await sendAdminOrderNotification(order, items);
            } catch (adminMailErr) {
                console.error('⚠️ Admin notification failed:', adminMailErr.message);
            }

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                orderId: order.id,
                orderNumber: order.order_number,
                order: order
            });

        } catch (txErr) {
            await transaction.rollback();
            console.error('❌ Order transaction error:', txErr);
            return res.status(500).json({
                success: false,
                message: 'Order creation failed: ' + txErr.message
            });
        }
    } catch (err) {
        console.error('❌ createOrder error:', err);
        return res.status(500).json({
            success: false,
            message: 'Order creation failed: ' + err.message
        });
    }
};

// ─────────────────────────────────────────
// 📦 GET ALL ORDERS
// ─────────────────────────────────────────
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                as: 'OrderItems',
                include: [{
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'productName', 'image', 'salesPrice'],
                }, {
                    model: ProductVariant,
                    as: 'Variant',
                    attributes: ['id', 'attributes'],
                    required: false,
                }],
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.json({ success: true, orders });
    } catch (err) {
        console.error('getAllOrders error:', err);
        return res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────
// 👤 CUSTOMER ORDERS
// ─────────────────────────────────────────
const getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customer_id: req.params.id },
            include: [{
                model: OrderItem,
                as: 'OrderItems',
                include: [{
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'productName', 'image', 'salesPrice'],
                }, {
                    model: ProductVariant,
                    as: 'Variant',
                    attributes: ['id', 'attributes'],
                    required: false,
                }],
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.json({ success: true, orders });
    } catch (err) {
        console.error('getCustomerOrders error:', err);
        return res.status(500).json({ success: false });
    }
};

// ─────────────────────────────────────────
// 🔄 UPDATE STATUS
// ─────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = [
            'processing', 'confirmed', 'shipped', 'in_transit', 'out_for_delivery',
            'delivered', 'cancelled', 'return_requested', 'return_approved',
            'return_picked_up', 'return_received', 'refunded'
        ];
        const requestedStatus = String(req.body.status || '').toLowerCase();
        if (!allowedStatuses.includes(requestedStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid order status' });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const normalizedStatus = requestedStatus;

        // Restore stock on cancellation
        if (normalizedStatus === 'cancelled' && order.status !== 'cancelled') {
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            for (const item of orderItems) {
                const variant = item.variantId ? await ProductVariant.findOne({ where: { id: item.variantId, productId: item.product_id } }) : null;
                const product = variant || await Product.findByPk(item.product_id);
                if (product) {
                    await product.update({ stock: (product.stock || 0) + (item.quantity || 1) });
                    if (variant) {
                        const parent = await Product.findByPk(item.product_id);
                        const variants = await ProductVariant.findAll({ where: { productId: item.product_id, isActive: true }, attributes: ['stock'] });
                        if (parent) await parent.update({ stock: variants.reduce((sum, row) => sum + Math.max(0, Number(row.stock) || 0), 0) });
                    }
                }
            }
        }

        await order.update({ status: normalizedStatus });

        // Send status update email
        try {
            await sendOrderStatusEmail(order, normalizedStatus);
        } catch (mailErr) {
            console.error('⚠️ Status email failed:', mailErr.message);
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('updateOrderStatus error:', err);
        return res.status(500).json({ success: false });
    }
};

const sendShipmentTracking = async (req, res) => {
    try {
        const courierName = String(req.body.courierName || '').trim();
        const trackingNumber = String(req.body.trackingNumber || '').trim();
        const supportedCouriers = ['India Post', 'Professional Courier', 'DTDC', 'ST Couriers'];
        if (!supportedCouriers.includes(courierName)) {
            return res.status(400).json({ success: false, message: 'Select a supported courier' });
        }
        if (!trackingNumber) {
            return res.status(400).json({ success: false, message: 'Tracking ID is required' });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (!order.customer_email) {
            return res.status(400).json({ success: false, message: 'Customer email is missing for this order' });
        }

        await order.update({ courier_name: courierName, awb_code: trackingNumber });
        try {
            await sendShipmentTrackingEmail(order, courierName, trackingNumber);
        } catch (emailError) {
            console.error('Shipment tracking email failed:', emailError);
            return res.status(502).json({ success: false, message: 'Tracking details were saved, but the email could not be sent' });
        }

        return res.json({ success: true, message: 'Tracking email sent', order: { id: order.id, courier_name: order.courier_name, awb_code: order.awb_code } });
    } catch (err) {
        console.error('sendShipmentTracking error:', err);
        return res.status(500).json({ success: false, message: 'Could not send shipment tracking email' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getCustomerOrders,
    updateOrderStatus,
    sendShipmentTracking,
};
