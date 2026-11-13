const Stock = require('../models/Stock');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

// 1. Add Stock
exports.createStock = async (req, res) => {
  try {
    const { productId, productName, weight, stock, status } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({ error: 'Required fields missing: productId' });
    }

    // Check product exists
    const product = await Product.findByPk(Number(productId));
    if (!product) {
      return res.status(400).json({ error: `Product ID ${productId} does not exist` });
    }

    // Check if stock already exists for this product
    const existingStock = await Stock.findOne({ where: { productId: Number(productId) } });
    if (existingStock) {
      return res.status(400).json({ error: 'Stock already exists for this product' });
    }

    const newStock = await Stock.create({
      productName: productName || product.productName,
      weight: weight || 'Default',
      quantity: Number(stock) || 0,
      productId: Number(productId),
      status: status || (Number(stock) > 0 ? 'Active' : 'Inactive'),
    });

    res.status(201).json({ 
      message: 'Stock Added!', 
      data: {
        id: newStock.id,
        productId: newStock.productId,
        productName: newStock.productName,
        unit: newStock.weight,
        stock: newStock.quantity,
        status: newStock.status
      }
    });
  } catch (err) {
    console.error('createStock error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 2. Get All Stock - Returns ALL products with their stock info
exports.getAllStock = async (req, res) => {
  try {
    // Get all products
    const products = await Product.findAll({
      attributes: ['id', 'productName', 'sku', 'mrp', 'salesPrice', 'gstRate', 'image', 'stock', 'subCategoryId', 'brandId'],
      order: [['id', 'DESC']]
    });

    // Get all stock records
    const stocks = await Stock.findAll();
    
    // Create a map of stock records by productId
    const stockMap = new Map();
    stocks.forEach(stock => {
      if (!stockMap.has(stock.productId)) stockMap.set(stock.productId, stock);
    });

    // Product variants are the inventory source for variant products; the
    // Product stock field is their cached total. Keep legacy Stock rows in sync.
    const variantRows = products.length ? await ProductVariant.findAll({
      where: { productId: products.map(product => product.id) },
      attributes: ['productId', 'stock', 'isActive', 'sku'],
    }) : [];
    const variantTotals = new Map();
    const variantSkus = new Map();
    variantRows.forEach(variant => {
      variantTotals.set(variant.productId, (variantTotals.get(variant.productId) || 0) + (variant.isActive ? Math.max(0, Number(variant.stock) || 0) : 0));
      if (variant.sku) variantSkus.set(variant.productId, [...(variantSkus.get(variant.productId) || []), variant.sku]);
    });

    // Combine products with their canonical stock quantity.
    const mapped = products.map(product => {
      const existingStock = stockMap.get(product.id);
      const stock = variantTotals.has(product.id) ? variantTotals.get(product.id) : Math.max(0, Number(product.stock) || 0);

      if (existingStock) {
        return {
          id: existingStock.id,
          productId: product.id,
          productName: product.productName,
          sku: product.sku,
          variantSkus: variantSkus.get(product.id) || [],
          unit: existingStock.weight,
          stock,
          gstRate: product.gstRate,
          status: stock > 0 ? 'Active' : 'Inactive',
          Product: product,
        };
      } else {
        // If no stock record, create a virtual one using product's stock
        return {
          id: `product_${product.id}`, // Temporary ID
          productId: product.id,
          productName: product.productName,
          sku: product.sku,
          variantSkus: variantSkus.get(product.id) || [],
          unit: 'Default',
          stock,
          gstRate: product.gstRate,
          status: stock > 0 ? 'Active' : 'Inactive',
          Product: product,
          isVirtual: true // Mark as virtual (no stock record yet)
        };
      }
    });

    res.status(200).json(mapped);
  } catch (err) {
    console.error('getAllStock error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Stock by ID
exports.getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a product ID (virtual stock)
    if (id.toString().startsWith('product_')) {
      const productId = parseInt(id.toString().replace('product_', ''));
      const product = await Product.findByPk(productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      return res.status(200).json({
        id: `product_${product.id}`,
        productId: product.id,
        productName: product.productName,
        unit: 'Default',
        stock: product.stock || 0,
        status: (product.stock || 0) > 0 ? 'Active' : 'Inactive',
        Product: product,
        isVirtual: true
      });
    }
    
    // Regular stock record
    const stock = await Stock.findByPk(id, {
      include: [{
        model: Product,
        attributes: ['id', 'productName', 'sku', 'mrp', 'salesPrice', 'gstRate', 'image', 'stock']
      }]
    });

    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.status(200).json({
      id: stock.id,
      productId: stock.productId,
      productName: stock.productName,
      unit: stock.weight,
      stock: stock.quantity,
      status: stock.status,
      Product: stock.Product
    });
  } catch (err) {
    console.error('getStockById error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Update Stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, productId, productName, weight, status } = req.body;
    const desiredStock = Number(stock);
    if (stock !== undefined && (!Number.isInteger(desiredStock) || desiredStock < 0)) {
      return res.status(400).json({ error: 'Stock must be a non-negative whole number.' });
    }

    // Check if it's a virtual stock (no record yet)
    const isVirtual = id.toString().startsWith('product_');
    const actualProductId = isVirtual ? parseInt(id.toString().replace('product_', ''), 10) : null;
    const existingRecord = isVirtual ? null : await Stock.findByPk(id);
    const resolvedProductId = actualProductId || existingRecord?.productId || Number(productId);
    const product = resolvedProductId ? await Product.findByPk(resolvedProductId) : null;
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    // Build update payload
    const updatePayload = {};
    
    if (stock !== undefined) {
      updatePayload.quantity = Number(stock);
    }
    if (productName !== undefined) updatePayload.productName = productName;
    if (weight !== undefined) updatePayload.weight = weight;
    if (productId !== undefined) updatePayload.productId = Number(productId);
    if (status !== undefined) updatePayload.status = status;
    
    // Auto-update status based on stock
    if (stock !== undefined) {
      updatePayload.status = Number(stock) > 0 ? 'Active' : 'Inactive';
    }

    const updatedStock = await Product.sequelize.transaction(async transaction => {
      if (stock !== undefined) {
        const variants = await ProductVariant.findAll({ where: { productId: product.id, isActive: true }, order: [['id', 'ASC']], transaction });
        if (variants.length) {
          // The stock tab edits an aggregate, so spread the requested total
          // proportionally across active variants to preserve their balance.
          const quantities = variants.map(variant => Math.max(0, Number(variant.stock) || 0));
          const total = quantities.reduce((sum, quantity) => sum + quantity, 0);
          let allocated = 0;
          for (let index = 0; index < variants.length; index += 1) {
            const quantity = index === variants.length - 1
              ? desiredStock - allocated
              : total > 0 ? Math.floor(desiredStock * quantities[index] / total) : Math.floor(desiredStock / variants.length);
            allocated += quantity;
            await variants[index].update({ stock: quantity }, { transaction });
          }
          await product.update({ stock: desiredStock }, { transaction });
        } else {
          await product.update({ stock: desiredStock }, { transaction });
        }
      }
      let record = existingRecord;
      if (!record) {
        record = await Stock.create({ productName: product.productName, weight: weight || 'Default', quantity: Number(stock ?? product.stock) || 0, productId: product.id, status: Number(stock ?? product.stock) > 0 ? 'Active' : 'Inactive' }, { transaction });
      } else {
        await record.update({ ...updatePayload, ...(stock !== undefined ? { quantity: desiredStock } : {}) }, { transaction });
      }
      return record;
    });
    const variantRows = await ProductVariant.findAll({ where: { productId: product.id, isActive: true }, attributes: ['stock'] });
    const currentStock = variantRows.length ? variantRows.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0) : Number((await Product.findByPk(product.id)).stock) || 0;
    if (updatedStock) {
      return res.status(200).json({ 
        message: 'Stock Updated Successfully!',
        data: {
          id: updatedStock.id,
          productId: product.id,
          productName: product.productName,
          unit: updatedStock.weight,
          stock: currentStock,
          status: currentStock > 0 ? 'Active' : 'Inactive',
          gstRate: product.gstRate,
          Product: product
        }
      });
    }
    res.status(404).json({ message: 'Stock not found' });
  } catch (err) {
    console.error('updateStock error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete Stock
exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't delete if it's a virtual stock
    if (id.toString().startsWith('product_')) {
      return res.status(400).json({ message: 'Cannot delete virtual stock. Create a stock record first.' });
    }
    
    const deleted = await Stock.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.status(200).json({ message: 'Stock Deleted!' });
  } catch (err) {
    console.error('deleteStock error:', err);
    res.status(500).json({ error: err.message });
  }
};
