// controllers/productController.js
const Product      = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const ProductVariant = require('../models/ProductVariant');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Category     = require('../models/Category');
const SubCategory  = require('../models/SubCategory');
const Brand        = require('../models/Brand');
const OrderItem    = require('../models/OrderItem');
const Review       = require('../models/Review');
const fs           = require('fs');
const path         = require('path');
const { Op }       = require('sequelize');

function isDuplicateSkuError(err) {
    return err.name === 'SequelizeUniqueConstraintError' && (err.fields?.sku || err.errors?.some(e => e.path === 'sku'));
}

// ── Shared helper: extract files from req.files array ────────────────────────
function extractFiles(req) {
    const files         = req.files || [];
    const mainImageFile = files.find(f => f.fieldname === 'image');
    const galleryFiles  = files.filter(f => f.fieldname === 'gallery');
    return { mainImageFile, galleryFiles };
}

// ── Shared include config ─────────────────────────────────────────────────────
const PRODUCT_INCLUDE = [
    { model: Category,     attributes: ['id', 'name', 'discountType', 'discountValue'] },
    { model: SubCategory,  attributes: ['id', 'name'] },
    { model: Brand,        attributes: ['id', 'brandName'] },
    { model: ProductImage, as: 'Images', attributes: ['id', 'url', 'sortOrder'], order: [['sortOrder', 'ASC']] },
    { model: ProductVariant, as: 'Variants' },
];

function normalizeAttributes(attributes) {
    if (typeof attributes === 'string') {
        try { attributes = JSON.parse(attributes); } catch { attributes = {}; }
    }
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) return {};
    const entries = Object.entries(attributes).map(([key, value]) => [key.trim(), String(value ?? '').trim()]).filter(([key, value]) => key && value);
    if (new Set(entries.map(([key]) => key)).size !== entries.length) {
        throw Object.assign(new Error('Variant attribute names must be unique.'), { status: 400 });
    }
    return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base' })));
}

function validateVariantCombinations(variants) {
    const keys = variants.map(variant => JSON.stringify(Object.entries(variant.attributes || {}).map(([name, value]) => [name.toLowerCase(), String(value).toLowerCase()]).sort(([a], [b]) => a.localeCompare(b))));
    if (new Set(keys).size !== keys.length) {
        throw Object.assign(new Error('Duplicate variant combination. Each combination must be unique regardless of capitalization.'), { status: 400 });
    }
}

function serializeVariant(variant) {
    const row = variant.toJSON ? variant.toJSON() : { ...variant };
    let attributes = row.attributes;
    if (typeof attributes === 'string') {
        try { attributes = JSON.parse(attributes); } catch { attributes = {}; }
    }
    return { ...row, attributes: attributes && typeof attributes === 'object' && !Array.isArray(attributes) ? attributes : {} };
}

function addCategoryPricing(product) {
    const row = product.toJSON ? product.toJSON() : { ...product };
    if (Array.isArray(row.Variants)) row.Variants = row.Variants.map(serializeVariant);
    const category = row.Category;
    const basePrice = Number(row.salesPrice ?? row.mrp ?? 0);
    const value = Number(category?.discountValue || 0);
    let discount = 0;
    if (category?.discountType === 'flat') discount = value;
    if (category?.discountType === 'percentage') discount = basePrice * value / 100;
    row.categoryDiscount = Number(Math.min(basePrice, Math.max(0, discount)).toFixed(2));
    row.baseSalesPrice = basePrice;
    row.priceBeforeCategoryDiscount = basePrice;
    row.salesPrice = Number(Math.max(0, basePrice - row.categoryDiscount).toFixed(2));
    return row;
}

// ── Helper: normalise a file path for storage ─────────────────────────────────
const normPath = (p) => p.replace(/\\/g, '/');

// ── Helper: delete a file from disk safely ────────────────────────────────────
const unlinkSafe = (filePath) => {
    if (!filePath) return;
    try {
        const abs = path.resolve(filePath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (_) { /* ignore */ }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Create Product
// ─────────────────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
    try {
        const {
            productName, categoryId, subCategoryId, brandId,
            isNewArrival, isBestSeller,
            shortDescription, longDescription, sku,
            mrp, salesPrice, stock, gstType, gstRate,
        } = req.body;

        const colors  = req.body.colors  ? JSON.parse(req.body.colors)  : null;
        const sizes   = req.body.sizes   ? JSON.parse(req.body.sizes)   : null;
        const ages    = req.body.ages    ? JSON.parse(req.body.ages)    : null;
        const metres  = req.body.metres  ? JSON.parse(req.body.metres)  : null;
        const fabrics = req.body.fabrics ? JSON.parse(req.body.fabrics) : null;
        const weights = req.body.weights ? JSON.parse(req.body.weights) : null;
        const volumes = req.body.volumes ? JSON.parse(req.body.volumes) : null;
        const nos     = req.body.nos     ? JSON.parse(req.body.nos)     : null;

        const normalizedGstRate = Number(gstRate || 0);
        if (!Number.isFinite(normalizedGstRate) || normalizedGstRate < 0 || normalizedGstRate > 100) return res.status(400).json({ success: false, error: 'GST rate must be between 0 and 100.' });

        const { mainImageFile, galleryFiles } = extractFiles(req);
        const imagePath = mainImageFile ? normPath(mainImageFile.path) : null;

        let initialVariant = null;
        if (req.body.initialVariant) {
            initialVariant = JSON.parse(req.body.initialVariant);
            if (!Array.isArray(initialVariant.variants) && (!initialVariant.attributes || typeof initialVariant.attributes !== 'object' || Array.isArray(initialVariant.attributes))) {
                return res.status(400).json({ success: false, error: 'Initial variant attributes must be an object.' });
            }
        }
        const requestedVariants = Array.isArray(initialVariant?.variants) && initialVariant.variants.length ? initialVariant.variants : [initialVariant || {
            sku, mrp, salesPrice, stock, attributes: { Default: 'Standard' },
        }];
        const variantRows = requestedVariants.map((variant, index) => {
            const normalizedAttributes = normalizeAttributes(variant.attributes);
            if (!Object.keys(normalizedAttributes).length) normalizedAttributes.default = 'standard';
            const variantSku = String(variant.sku || '').trim().toUpperCase() || null;
            return {
                sku: variantSku || null,
                attributes: normalizedAttributes,
                image: req.files?.find(file => file.fieldname === `variantImage_${index}`)?.path?.replace(/\\/g, "/") || null,
                mrp: variant.mrp == null || variant.mrp === '' ? null : Number(variant.mrp),
                salesPrice: variant.salesPrice == null || variant.salesPrice === '' ? null : Number(variant.salesPrice),
                stock: Math.max(0, parseInt(variant.stock, 10) || 0),
                isActive: variant.isActive !== false,
            };
        });
        validateVariantCombinations(variantRows);
        const variantSkus = variantRows.map(variant => variant.sku).filter(Boolean);
        if (new Set(variantSkus).size !== variantSkus.length) return res.status(400).json({ success: false, error: 'Variant SKUs must be unique.' });
        if (variantRows.some(variant => (variant.mrp !== null && (!Number.isFinite(variant.mrp) || variant.mrp < 0)) || (variant.salesPrice !== null && (!Number.isFinite(variant.salesPrice) || variant.salesPrice < 0)))) {
            return res.status(400).json({ success: false, error: 'Variant prices must be valid non-negative numbers.' });
        }

        const newProduct = await Product.sequelize.transaction(async (transaction) => {
          const product = await Product.create({
            productName,
            sku: sku || null,
            mrp:              parseFloat(mrp || 0),
            salesPrice:       parseFloat(salesPrice || 0),
            gstType: gstType === 'inclusive' ? 'inclusive' : 'exclusive',
            gstRate: normalizedGstRate,
            stock:            variantRows.reduce((sum, variant) => sum + (variant.isActive ? variant.stock : 0), 0),
            categoryId,
            subCategoryId:    subCategoryId || null,
            brandId:          brandId       || null,
            image:            imagePath,
            shortDescription: shortDescription || null,
            longDescription:  longDescription  || null,
            isNewArrival: isNewArrival === 'true' || isNewArrival === true,
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            colors, sizes, ages, metres, fabrics, weights, volumes, nos,
          }, { transaction });

          await ProductVariant.bulkCreate(variantRows.map(variant => ({ ...variant, productId: product.id })), { transaction });
          return product;
        });

        // Save gallery images
        if (galleryFiles.length > 0) {
            const imageRecords = galleryFiles.map((f, i) => ({
                productId: newProduct.id,
                url:       normPath(f.path),
                sortOrder: i,
            }));
            await ProductImage.bulkCreate(imageRecords);
        }

        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        if (isDuplicateSkuError(err)) return res.status(409).json({ success: false, error: 'This SKU is already assigned to another product.' });
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Update Product
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            productName, categoryId, subCategoryId, brandId,
            isNewArrival, isBestSeller,
            shortDescription, longDescription, sku,
            mrp, salesPrice, stock, gstType, gstRate,
        } = req.body;

        const colors  = req.body.colors  ? JSON.parse(req.body.colors)  : null;
        const sizes   = req.body.sizes   ? JSON.parse(req.body.sizes)   : null;
        const ages    = req.body.ages    ? JSON.parse(req.body.ages)    : null;
        const metres  = req.body.metres  ? JSON.parse(req.body.metres)  : null;
        const fabrics = req.body.fabrics ? JSON.parse(req.body.fabrics) : null;
        const weights = req.body.weights ? JSON.parse(req.body.weights) : null;
        const volumes = req.body.volumes ? JSON.parse(req.body.volumes) : null;
        const nos     = req.body.nos     ? JSON.parse(req.body.nos)     : null;

        const normalizedGstRate = Number(gstRate || 0);
        if (!Number.isFinite(normalizedGstRate) || normalizedGstRate < 0 || normalizedGstRate > 100) return res.status(400).json({ success: false, error: 'GST rate must be between 0 and 100.' });

        // IDs of existing gallery images the admin wants to KEEP (sent as JSON array)
        const keepImageIds = req.body.keepImageIds
            ? JSON.parse(req.body.keepImageIds)
            : null; // null means "don't touch gallery"

        const { mainImageFile, galleryFiles } = extractFiles(req);

        const updateData = {
            productName,
            sku: sku || null,
            mrp:              parseFloat(mrp || 0),
            salesPrice:       parseFloat(salesPrice || 0),
            gstType: gstType === 'inclusive' ? 'inclusive' : 'exclusive',
            gstRate: normalizedGstRate,
            stock:            parseInt(stock || 0, 10),
            categoryId,
            subCategoryId:    subCategoryId    || null,
            brandId:          brandId          || null,
            shortDescription: shortDescription || null,
            longDescription:  longDescription  || null,
            isNewArrival: isNewArrival === 'true' || isNewArrival === true,
            isBestSeller: isBestSeller === 'true' || isBestSeller === true,
            colors, sizes, ages, metres, fabrics, weights, volumes, nos,
        };

        if (mainImageFile) {
            updateData.image = normPath(mainImageFile.path);
        }

        let savedVariants = null;
        if (req.body.initialVariant) {
            const payload = JSON.parse(req.body.initialVariant);
            if (Array.isArray(payload.variants)) {
                const variants = payload.variants.map((variant, index) => {
                    const normalized = normalizeAttributes(variant.attributes);
                    if (!Object.keys(normalized).length) normalized.default = 'standard';
                    return {
                        id: Number(variant.id) || null,
                        productId: Number(id),
                        sku: String(variant.sku || '').trim().toUpperCase() || null,
                        attributes: normalized,
                        image: req.files?.find(file => file.fieldname === `variantImage_${index}`)?.path?.replace(/\\/g, "/") || (variant.image === null ? null : undefined),
                        mrp: variant.mrp == null || variant.mrp === '' ? null : Number(variant.mrp),
                        salesPrice: variant.salesPrice == null || variant.salesPrice === '' ? null : Number(variant.salesPrice),
                        stock: Math.max(0, parseInt(variant.stock, 10) || 0),
                        isActive: variant.isActive !== false,
                    };
                });
                validateVariantCombinations(variants);
                const variantSkus = variants.map(variant => variant.sku).filter(Boolean);
                if (new Set(variantSkus).size !== variantSkus.length) return res.status(400).json({ error: 'Variant SKUs must be unique.' });
                if (variants.some(variant => (variant.mrp !== null && (!Number.isFinite(variant.mrp) || variant.mrp < 0)) || (variant.salesPrice !== null && (!Number.isFinite(variant.salesPrice) || variant.salesPrice < 0)))) return res.status(400).json({ error: 'Variant prices must be valid non-negative numbers.' });
                updateData.stock = variants.reduce((sum, variant) => sum + (variant.isActive ? variant.stock : 0), 0);
                await ProductVariant.sequelize.transaction(async transaction => {
                    const existing = await ProductVariant.findAll({ where: { productId: id }, attributes: ['id', 'image'], transaction });
                    const existingIds = existing.map(variant => variant.id);
                    const submittedSkus = variants.map(variant => variant.sku).filter(Boolean);
                    const submittedIds = variants.map(variant => variant.id).filter(variantId => existingIds.includes(variantId));
                    const conflict = submittedSkus.length ? await ProductVariant.findOne({ where: { sku: submittedSkus, id: { [Op.notIn]: existingIds.length ? existingIds : [0] } }, transaction }) : null;
                    if (conflict) throw Object.assign(new Error('Variant SKU is already in use.'), { name: 'SequelizeUniqueConstraintError', fields: { sku: true } });
                    await Product.update(updateData, { where: { id }, transaction });
                    const retainedIds = submittedIds;
                    await ProductVariant.destroy({ where: { productId: id, id: { [Op.notIn]: retainedIds.length ? retainedIds : [0] } }, transaction });
                    for (const variant of variants) {
                        const { id: variantId, ...record } = variant;
                        if (record.image === undefined) record.image = existing.find(item => item.id === variantId)?.image || null;
                        if (existingIds.includes(variantId)) await ProductVariant.update(record, { where: { id: variantId, productId: id }, transaction });
                        else await ProductVariant.create(record, { transaction });
                    }
                    savedVariants = await ProductVariant.findAll({ where: { productId: id }, order: [['id', 'ASC']], transaction });
                });
            }
        }

        if (savedVariants === null) await Product.update(updateData, { where: { id } });

        // ── Gallery management ────────────────────────────────────────────────
        if (keepImageIds !== null) {
            // Delete gallery rows NOT in keepImageIds, and their files
            const toDelete = await ProductImage.findAll({
                where: { productId: id },
            });
            for (const img of toDelete) {
                if (!keepImageIds.includes(img.id)) {
                    unlinkSafe(img.url);
                    await img.destroy();
                }
            }
        }

        // Add new gallery uploads
        if (galleryFiles.length > 0) {
            const existing = await ProductImage.count({ where: { productId: id } });
            const imageRecords = galleryFiles.map((f, i) => ({
                productId: Number(id),
                url:       normPath(f.path),
                sortOrder: existing + i,
            }));
            await ProductImage.bulkCreate(imageRecords);
        }

        res.status(200).json({ success: true, message: 'Updated!', ...(savedVariants !== null ? { variants: savedVariants.map(serializeVariant) } : {}) });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ success: false, error: 'This product or variant SKU is already in use.' });
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Get All Products
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: PRODUCT_INCLUDE,
            order: [['id', 'DESC']],
        });
        const summaries = await Review.findAll({
            attributes: ['productId', [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'averageRating'], [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'reviewCount']],
            where: { status: 'Approved' },
            group: ['productId'],
            raw: true,
        });
        const summaryByProduct = new Map(summaries.map(summary => [String(summary.productId), {
            rating: Number(summary.averageRating) || 0,
            reviewCount: Number(summary.reviewCount) || 0,
        }]));
        res.status(200).json(products.map(product => {
            const row = addCategoryPricing(product);
            return { ...row, ...(summaryByProduct.get(String(row.id)) || { rating: 0, reviewCount: 0 }) };
        }));
    } catch (err) {
        res.status(500).json({ message: 'Error', error: err.message });
    }
};

exports.getVariants = async (req, res) => {
    try {
        const variants = await ProductVariant.findAll({ where: { productId: req.params.productId }, order: [['id', 'ASC']] });
        res.json(variants.map(serializeVariant));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.saveVariants = async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        if (!await Product.findByPk(productId)) return res.status(404).json({ error: 'Product not found.' });
        if (!Array.isArray(req.body.variants)) return res.status(400).json({ error: 'Variants must be an array.' });
        const variantsSkuSet = new Set();
        const variants = req.body.variants.map((variant) => {
            const normalized = normalizeAttributes(variant.attributes);
            if (!Object.keys(normalized).length) throw new Error('Each variant needs at least one attribute and value.');
            const sku = variant.sku ? String(variant.sku).trim().toUpperCase() : null;
            if (sku && variantsSkuSet.has(sku)) throw new Error(`Duplicate variant SKU: ${sku}`);
            if (sku) variantsSkuSet.add(sku);
            return {
                productId,
                sku,
                attributes: normalized,
                mrp: variant.mrp === '' || variant.mrp == null ? null : Number(variant.mrp),
                salesPrice: variant.salesPrice === '' || variant.salesPrice == null ? null : Number(variant.salesPrice),
                stock: Math.max(0, parseInt(variant.stock, 10) || 0),
                isActive: variant.isActive !== false,
            };
        });
        validateVariantCombinations(variants);
        for (const variant of variants) {
            if ((variant.mrp !== null && (!Number.isFinite(variant.mrp) || variant.mrp < 0)) || (variant.salesPrice !== null && (!Number.isFinite(variant.salesPrice) || variant.salesPrice < 0))) {
                return res.status(400).json({ error: 'Variant prices must be valid non-negative numbers.' });
            }
        }
        await ProductVariant.sequelize.transaction(async (transaction) => {
            const existing = await ProductVariant.findAll({ where: { productId }, attributes: ['id', 'sku'], transaction });
            const existingIds = existing.map(item => item.id);
            const submittedSkus = variants.map(item => item.sku).filter(Boolean);
            const conflict = submittedSkus.length ? await ProductVariant.findOne({ where: { sku: submittedSkus, id: { [Op.notIn]: existingIds.length ? existingIds : [0] } }, transaction }) : null;
            if (conflict) throw Object.assign(new Error('Variant SKU is already in use.'), { name: 'SequelizeUniqueConstraintError', fields: { sku: true } });
            await ProductVariant.destroy({ where: { productId }, transaction });
            if (variants.length) await ProductVariant.bulkCreate(variants, { transaction });
        });
        res.json({ success: true, variants: variants.map(serializeVariant) });
    } catch (err) {
        const status = err.name === 'SequelizeUniqueConstraintError' ? 409 : 400;
        res.status(status).json({ error: err.name === 'SequelizeUniqueConstraintError' ? 'Variant SKU is already in use.' : err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Get New Arrivals
// ─────────────────────────────────────────────────────────────────────────────
exports.getNewArrivals = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { isNewArrival: true },
            include: PRODUCT_INCLUDE,
            limit: 8,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(products.map(addCategoryPricing));
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Get Best Sellers
// ─────────────────────────────────────────────────────────────────────────────
exports.getBestSellers = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { isBestSeller: true },
            include: PRODUCT_INCLUDE,
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(products.map(addCategoryPricing));
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Delete Product
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const images = await ProductImage.findAll({ where: { productId: id } });
        const deleted = await Product.sequelize.transaction(async transaction => {
            await Wishlist.destroy({ where: { productId: id }, transaction });
            await Cart.destroy({ where: { productId: id }, transaction });
            await ProductVariant.destroy({ where: { productId: id }, transaction });
            await ProductImage.destroy({ where: { productId: id }, transaction });
            return Product.destroy({ where: { id }, transaction });
        });
        if (deleted) {
            images.forEach(img => unlinkSafe(img.url));
            res.status(200).json({ success: true, message: 'Product deleted!' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Get Product By ID
// ─────────────────────────────────────────────────────────────────────────────
exports.getProductById = async (req, res) => {
    try {
        const routeValue = String(req.params.id || '');
        const idMatch = routeValue.match(/(?:^|-)\d+$/);
        const productId = /^\d+$/.test(routeValue) ? Number(routeValue) : idMatch ? Number(idMatch[0].replace(/^-/, '')) : null;
        const product = productId ? await Product.findByPk(productId, {
            include: PRODUCT_INCLUDE,
        }) : null;
        if (product) {
            res.status(200).json(addCategoryPricing(product));
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Delete a single gallery image
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteGalleryImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const img = await ProductImage.findByPk(imageId);
        if (!img) return res.status(404).json({ success: false, message: 'Image not found' });
        unlinkSafe(img.url);
        await img.destroy();
        res.status(200).json({ success: true, message: 'Gallery image deleted' });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, error: err.message });
    }
};
