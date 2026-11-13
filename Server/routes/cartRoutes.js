const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductVariant = require('../models/ProductVariant');

const getAvailableStock = async ({ productId, variantId }) => {
    if (variantId) {
        const variant = await ProductVariant.findOne({ where: { id: variantId, productId, isActive: true } });
        return Number(variant?.stock || 0);
    }
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new Error('Product not found');
    }
    return Number(product.stock || 0);
};

// ── CLEAR entire cart (MUST be before /:id) ───────────────────────────────────
router.delete('/clear/:customerId', async (req, res) => {
    try {
        await Cart.destroy({ where: { customerId: req.params.customerId } });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── GET all cart items for a customer ─────────────────────────────────────────
router.get('/customer/:customerId', async (req, res) => {
    try {
        const items = await Cart.findAll({
            where: { customerId: req.params.customerId },
            order: [['createdAt', 'DESC']],
        });
        res.json(items);
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── ADD item to cart ──────────────────────────────────────────────────────────
router.post('/add', async (req, res) => {
    try {
        const {
            customerId,
            productId,
            name,
            img,
            price,
            quantity,
            weight,
            variantId,
            variantAttributes,
        } = req.body;

        if (!customerId || !productId || !name || price === undefined) {
            return res.status(400).json({ error: 'customerId, productId, name, price are required' });
        }

        const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
        const stock = await getAvailableStock({ productId, variantId });

        const product = await Product.findByPk(productId, { include: [{ model: Category }] });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        const variant = variantId ? await ProductVariant.findOne({ where: { id: variantId, productId, isActive: true } }) : null;
        if (variantId && !variant) return res.status(400).json({ error: 'Selected variant is unavailable.' });
        const basePrice = Number(variant?.salesPrice ?? product.salesPrice ?? product.mrp ?? 0);
        const categoryValue = Number(product.Category?.discountValue || 0);
        const categoryDiscount = product.Category?.discountType === 'flat'
            ? categoryValue
            : product.Category?.discountType === 'percentage'
                ? basePrice * categoryValue / 100
                : 0;
        const effectivePrice = Math.max(0, basePrice - Math.min(basePrice, categoryDiscount));

        if (stock <= 0) {
            return res.status(400).json({ error: 'This item is out of stock.' });
        }

        const existing = await Cart.findOne({
            where: {
                customerId,
                productId,
                variantId: variantId || null,
            }
        });

        if (existing) {
            const desiredQuantity = existing.quantity + qtyToAdd;
            if (desiredQuantity > stock) {
                return res.status(400).json({ error: `Only ${stock} item${stock === 1 ? '' : 's'} available in stock.` });
            }
            existing.quantity = desiredQuantity;
            existing.price = effectivePrice;
            existing.variantAttributes = variantAttributes || variant?.attributes || existing.variantAttributes || null;
            await existing.save();
            return res.json(existing);
        }

        if (qtyToAdd > stock) {
            return res.status(400).json({ error: `Only ${stock} item${stock === 1 ? '' : 's'} available in stock.` });
        }

        const item = await Cart.create({
            customerId,
            productId,
            name,
            img:         img         || '',
            price: effectivePrice,
            quantity:    qtyToAdd,
            weight:      weight      || null,
            variantId: variantId || null,
            variantAttributes: variantAttributes || variant?.attributes || null,
        });

        res.status(201).json(item);
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── UPDATE quantity ───────────────────────────────────────────────────────────
router.put('/update/:id', async (req, res) => {
    try {
        const item = await Cart.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Cart item not found' });

        const desiredQuantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);
        const stock = await getAvailableStock({ productId: item.productId, variantId: item.variantId });

        if (stock <= 0) {
            return res.status(400).json({ error: 'This item is out of stock.' });
        }

        if (desiredQuantity > stock) {
            return res.status(400).json({ error: `Only ${stock} item${stock === 1 ? '' : 's'} available in stock.` });
        }

        item.quantity = desiredQuantity;
        await item.save();
        res.json(item);
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── REMOVE single item (MUST be last) ────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Cart.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Cart item not found' });
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error('Remove cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
