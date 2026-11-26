const Category = require('../models/Category');
const UserLogin = require('../models/UserLogin');
const { sendOfferEmail } = require('../services/emailService');

const sendCategoryDiscountEmail = async (category, emailData = {}) => {
    if (category.discountType === 'none' || Number(category.discountValue) <= 0) return;
    try {
        const users = await UserLogin.findAll({ attributes: ['email'], where: { email: { [require('sequelize').Op.ne]: null } } });
        await sendOfferEmail({
            title: `${category.name} discount`,
            discountType: category.discountType,
            discountValue: category.discountValue,
            emailSubject: emailData.emailSubject || `${category.name} discount - Vika Vastra`,
            emailContent: emailData.emailContent || `Save on products in the ${category.name} category. This discount applies to products belonging to this category.`,
            discountLabel: category.discountType === 'percentage' ? `${category.discountValue}% off` : `₹${category.discountValue} off`,
            shopUrl: process.env.STORE_URL,
        }, users.map(user => user.email));
    } catch (error) {
        console.error('Could not send category discount emails:', error.message);
    }
};
const parseDiscount = (body) => {
    const discountType = body.discountType || 'none';
    const discountValue = Number(body.discountValue || 0);
    if (!['none', 'flat', 'percentage'].includes(discountType)) {
        throw new Error('Discount type must be none, flat, or percentage');
    }
    if (!Number.isFinite(discountValue) || discountValue < 0 || (discountType === 'percentage' && discountValue > 100)) {
        throw new Error('Enter a valid discount value (percentage must be 0–100)');
    }
    return { discountType, discountValue: discountType === 'none' ? 0 : discountValue };
};

// 1. Get All Categories (ordered by sort_order ASC)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
        });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Create Category (With Image & auto sort_order)
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const discount = parseDiscount(req.body);

        const image = req.file
            ? req.file.path.replace(/\\/g, '/')
            : null;

        // Auto-assign highest sort_order + 1 so new category appears at the end
        const maxCat = await Category.findOne({ order: [['sort_order', 'DESC']] });
        const sort_order = maxCat && maxCat.sort_order ? (maxCat.sort_order + 1) : 1;

        const newCategory = await Category.create({ name, image, sort_order, ...discount });
        await sendCategoryDiscountEmail(newCategory, req.body);
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        let updateData = { name, ...parseDiscount(req.body) };

        if (req.file) {
            // Same normalization for update
            updateData.image = req.file.path.replace(/\\/g, '/');
        }

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        const previousDiscount = `${category.discountType}:${Number(category.discountValue)}`;
        await category.update(updateData);
        const currentDiscount = `${category.discountType}:${Number(category.discountValue)}`;
        if (currentDiscount !== previousDiscount) await sendCategoryDiscountEmail(category, req.body);
        res.status(200).json({ message: "Category updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.destroy({ where: { id } });
        res.status(200).json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Reorder Categories (Drag and Drop)
exports.reorderCategories = async (req, res) => {
    try {
        const { orderedIds, categories } = req.body;
        const ids = orderedIds || (Array.isArray(categories) ? categories.map(c => c.id || c) : null);

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Invalid ordered categories list" });
        }

        // Update sort_order for each category according to its index in orderedIds
        const updatePromises = ids.map((id, index) => {
            return Category.update({ sort_order: index + 1 }, { where: { id } });
        });

        await Promise.all(updatePromises);

        const updatedCategories = await Category.findAll({
            order: [['sort_order', 'ASC'], ['id', 'ASC']]
        });

        res.status(200).json({
            message: "Categories reordered successfully",
            categories: updatedCategories
        });
    } catch (err) {
        console.error("Reorder categories error:", err);
        res.status(500).json({ error: err.message });
    }
};
