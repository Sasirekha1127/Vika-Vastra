const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');
const UserLogin = require('../models/UserLogin');
const Customer = require('../models/Customer');
const { sendOfferEmail } = require('../services/emailService');

const emailCustomers = async (coupon) => {
    try {
        const [users, customers] = await Promise.all([
            UserLogin.findAll({ attributes: ['email'] }),
            Customer.findAll({ attributes: ['email'] }),
        ]);
        await sendOfferEmail({
            title: `Coupon ${coupon.code}`,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            description: coupon.description || 'Use this coupon at checkout.',
            expires_at: coupon.expires_at,
        }, [...users, ...customers].map(person => person.email));
    } catch (error) {
        console.error('Could not send coupon emails:', error.message);
    }
};

// Create coupon
exports.createCoupon = async (req, res) => {
    try {
        const code = String(req.body.code || '').trim().toUpperCase();
        if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

        const existingCoupon = await Coupon.findOne({ where: { code } });
        if (existingCoupon) {
            return res.status(409).json({ success: false, message: `Coupon code ${code} already exists. Choose a different code.` });
        }

        const coupon = await Coupon.create({ ...req.body, code });
        res.status(201).json({ success: true, data: coupon });
        // Don't make coupon creation wait for SMTP delivery to every customer.
        if (coupon.is_active) setImmediate(() => emailCustomers(coupon));
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ success: false, message: 'That coupon code already exists. Choose a different code.' });
        }
        if (error.name === 'SequelizeValidationError') {
            const details = (error.errors || []).map(item => item.message).filter(Boolean);
            return res.status(400).json({ success: false, message: details.join(' ') || 'Please check the coupon fields and try again.' });
        }
        console.error('Coupon creation failed:', error);
        res.status(400).json({ success: false, message: error.message || 'Could not create coupon.' });
    }
};

// Update coupon (needed by admin UI)
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        await coupon.update(req.body);
        res.json({ success: true, message: 'Coupon updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all coupons (Admin)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /coupons/available — returns active, non-expired coupons for modal display
exports.getAvailableCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            where: {
                is_active: true,
                show_in_checkout: true,
                [Op.or]: [
                    { expires_at: { [Op.gt]: new Date() } },
                    { expires_at: null }
                ]
            },
            attributes: ['code', 'type', 'value', 'min_order', 'max_discount', 'expires_at', 'description']
        });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /coupons/apply — validates and returns discount (called on Apply button)
exports.applyCoupon = async (req, res) => {
    // Frontend sends: { code, subtotal }
    const { code, subtotal } = req.body;

    try {
        const coupon = await Coupon.findOne({
            where: {
                code: code.trim().toUpperCase(),
                is_active: true,
                [Op.or]: [
                    { expires_at: { [Op.gt]: new Date() } },
                    { expires_at: null }
                ]
            }
        });

        if (!coupon) {
            return res.json({ success: false, message: 'Invalid or expired coupon code.' });
        }

        if (parseFloat(subtotal) < parseFloat(coupon.min_order)) {
            return res.json({
                success: false,
                message: `Minimum order of ₹${coupon.min_order} required for this coupon.`
            });
        }

        // Calculate discount
        let discount = 0;
        let label = '';

        if (coupon.type === 'percent') {
            discount = parseFloat(subtotal) * (parseFloat(coupon.value) / 100);
            if (coupon.max_discount && discount > parseFloat(coupon.max_discount)) {
                discount = parseFloat(coupon.max_discount);
            }
            label = `${coupon.value}% off${coupon.max_discount ? ` (max ₹${coupon.max_discount})` : ''}`;
        } else {
            discount = parseFloat(coupon.value);
            label = `₹${coupon.value} off`;
        }

        // Response shape matches what Checkout.jsx expects
        res.json({
            success: true,
            discount: parseFloat(discount.toFixed(2)),
            code: coupon.code,
            label,
            type: coupon.type,
            value: coupon.value
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
