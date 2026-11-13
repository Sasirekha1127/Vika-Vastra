const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

// Association (only if NOT already defined in server.js)
// Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

// GET all wishlist items for a customer (with live stock from Product table)
router.get('/:customerId', async (req, res) => {
    try {
        const items = await Wishlist.findAll({
            where: { customerId: req.params.customerId },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['stock'],
                    required: false,
                }, {
                    model: ProductVariant,
                    as: 'Variant',
                    attributes: ['id', 'attributes', 'image', 'salesPrice', 'stock'],
                    required: false,
                }
            ]
        });

        const result = items.map(item => ({
            ...item.toJSON(),
            stock: item.Product?.stock ?? item.stock,
        }));

        res.json(result);
    } catch (err) {
        console.error('Get wishlist error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ADD item to wishlist (skip if already exists)
router.post('/add', async (req, res) => {
    try {
        const { customerId, productId, variantId, variantAttributes, name, img, price, weight, stock, rating, reviews } = req.body;

        if (!customerId || !productId || !name || price === undefined) {
            return res.status(400).json({ error: 'customerId, productId, name, price are required' });
        }

        if (variantId != null) {
            const variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
            if (!variant) {
                return res.status(400).json({ error: 'Selected variant does not belong to this product' });
            }
        }

        const existing = variantId
            ? await Wishlist.findOne({ where: { customerId, productId, variantId } })
            : await Wishlist.findOne({ where: { customerId, productId, variantId: null } });

        if (existing) {
            return res.status(200).json({ ...existing.toJSON(), alreadyExists: true });
        }

        const item = await Wishlist.create({
            customerId,
            productId,
            variantId: variantId || null,
            variantAttributes: variantAttributes || null,
            name,
            img: img || '',
            price,
            weight: weight || '',
            stock: stock !== undefined ? stock : true,
            rating: rating || 4.5,
            reviews: reviews || 0,
        });

        res.status(201).json(item);
    } catch (err) {
        console.error('Add wishlist error:', err);
        res.status(500).json({ error: err.message });
    }
});

// REMOVE a wishlist item by wishlist row id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Wishlist.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Wishlist item not found' });
        res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (err) {
        console.error('Remove wishlist error:', err);
        res.status(500).json({ error: err.message });
    }
});

// MOVE item from wishlist to cart
router.post('/move-to-cart/:id', async (req, res) => {
    try {
        const wishlistItem = await Wishlist.findByPk(req.params.id);
        if (!wishlistItem) return res.status(404).json({ error: 'Wishlist item not found' });

        const existing = await Cart.findOne({
            where: {
                customerId: wishlistItem.customerId,
                productId: wishlistItem.productId,
                variantId: wishlistItem.variantId || null,
            }
        });

        if (existing) {
            existing.quantity += 1;
            await existing.save();
        } else {
            await Cart.create({
                customerId: wishlistItem.customerId,
                productId:  wishlistItem.productId,
                variantId:  wishlistItem.variantId || null,
                name:       wishlistItem.name,
                img:        wishlistItem.img,
                price:      wishlistItem.price,
                quantity:   1,
                weight:     wishlistItem.weight || null,
                variantAttributes: wishlistItem.variantAttributes || null,
            });
        }

        await wishlistItem.destroy();

        res.json({ success: true, message: 'Moved to cart' });
    } catch (err) {
        console.error('Move to cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
