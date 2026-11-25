require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config/db');
const { DataTypes } = require('sequelize');

// --- 1. MODELS IMPORT ---
const Category = require('./models/Category');
const SubCategory = require('./models/SubCategory');
const Product = require('./models/Product');
const ProductVariant = require('./models/ProductVariant');
const UserLogin = require('./models/UserLogin');
const Customer = require('./models/Customer');
const CustomerAddress = require('./models/CustomerAddress');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Return = require('./models/Return');
const DeliveryZone = require('./models/DeliveryZone');
const Banner = require('./models/Banner');
const OfferBanner = require('./models/Offerbanner');
const LiveProduct = require('./models/LiveProduct');
const InstagramPost = require('./models/InstagramPost');
const PromoBar = require('./models/PromoBar');
const Coupon = require('./models/Coupon');

// --- 2. DEFINE RELATIONSHIPS ---
Category.hasMany(SubCategory, { foreignKey: 'categoryId' });
SubCategory.belongsTo(Category, { foreignKey: 'categoryId' });

SubCategory.hasMany(Product, { foreignKey: 'subCategoryId' });
Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'Variant', constraints: false });
Wishlist.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'Variant', constraints: false });

Order.hasMany(Return, { foreignKey: 'order_id' });
Return.belongsTo(Order, { foreignKey: 'order_id' });

Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });

// FIX: UserLogin hasMany CustomerAddress (was Customer)
// CustomerAddresses.customer_id now references userlogin.id
UserLogin.hasMany(CustomerAddress, {
  foreignKey: 'customer_id',
  as: 'addresses',
  onDelete: 'CASCADE'
});
CustomerAddress.belongsTo(UserLogin, {
  foreignKey: 'customer_id',
  as: 'customer'
});

// --- 3. ROUTES IMPORT ---
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const brandRoutes = require('./routes/brandRoutes');
const stockRoutes = require('./routes/stockRoutes');
const customerRoutes = require('./routes/customerRoutes');
const customerAddressRoutes = require('./routes/customerAddressRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const userLoginRoutes = require('./routes/userloginRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');
const orderRoutes = require('./routes/orderRoutes');
const returnRoutes = require('./routes/returnRoutes');
const contactroutes = require('./routes/contactRoutes');
const deliveryZonesRouter = require('./routes/DeliveryzoneRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const middleBannerRoutes = require('./routes/middleBannerRoutes');
const offerBannerRoutes = require('./routes/offerbannerRoutes');
const liveProductRoutes = require('./routes/liveProductRoutes');
const instagramPostRoutes = require('./routes/instagrampostRoutes');
const promoBarRoutes = require('./routes/promoBarRoutes');
const emailCampaignRoutes = require('./routes/emailCampaignRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

const app = express();

// --- 4. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Product pages are a client-rendered SPA, so social crawlers need the product
// metadata in the initial HTML response rather than a later React update.
const frontendBuildDir = process.env.FRONTEND_BUILD_DIR
  ? path.resolve(process.env.FRONTEND_BUILD_DIR)
  : path.resolve(__dirname, '../emartebuyfrontend/build');
const frontendIndexPath = path.join(frontendBuildDir, 'index.html');
const websiteUrl = (process.env.PUBLIC_SITE_URL || 'https://vikavasthra.com').replace(/\/$/, '');
const publicApiUrl = (process.env.PUBLIC_API_URL || 'https://api.vikavasthra.com').replace(/\/$/, '');
const defaultShareImage = process.env.DEFAULT_SHARE_IMAGE_URL || `${websiteUrl}/AJNLogo.png`;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;',
  })[char]);
}

function absoluteImageUrl(imagePath) {
  if (!imagePath) return null;
  const value = String(imagePath).trim().replace(/\\/g, '/');
  if (/^https:\/\//i.test(value)) return value;
  if (/^http:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)) return null;
      return `${publicApiUrl}${parsed.pathname}`;
    } catch { return null; }
  }
  if (/^(data:|javascript:|\/\/)/i.test(value)) return null;
  const cleanPath = value.replace(/^\/+/, '').replace(/^(?:api\/)?uploads\//i, '');
  return `${publicApiUrl}/api/uploads/${cleanPath.split('/').map(encodeURIComponent).join('/')}`;
}

function imageExistsForSharing(imagePath) {
  if (!imagePath) return false;
  const value = String(imagePath).replace(/\\/g, '/');
  if (/^https:\/\//i.test(value)) return true;
  const relativePath = value.replace(/^\/+/, '').replace(/^(?:api\/)?uploads\//i, '');
  return fs.existsSync(path.resolve(__dirname, 'uploads', relativePath));
}

function renderPageMetadata(html, { title, description, image, url, type = 'website' }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(url);
  const tags = [
    `<title>${safeTitle}</title>`,
    `<meta name="description" content="${safeDescription}">`,
    `<link rel="canonical" href="${safeUrl}">`,
    `<meta property="og:title" content="${safeTitle}">`,
    `<meta property="og:description" content="${safeDescription}">`,
    `<meta property="og:image" content="${safeImage}">`,
    `<meta property="og:image:secure_url" content="${safeImage}">`,
    `<meta property="og:image:alt" content="${safeTitle}">`,
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:url" content="${safeUrl}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${safeTitle}">`,
    `<meta name="twitter:description" content="${safeDescription}">`,
    `<meta name="twitter:image" content="${safeImage}">`,
  ].join('\n  ');
  return html.replace(/<title>[\s\S]*?<\/title>/i, '').replace('</head>', `  ${tags}\n</head>`);
}

app.get('/product/:id', async (req, res, next) => {
  try {
    if (!fs.existsSync(frontendIndexPath)) return res.status(404).send('Product page is not configured on this server.');
    const routeValue = String(req.params.id || '');
    const idMatch = routeValue.match(/(?:^|-)\d+$/);
    const productId = /^\d+$/.test(routeValue) ? Number(routeValue) : idMatch ? Number(idMatch[0].replace(/^-/, '')) : null;
    const Product = require('./models/Product');
    const ProductImage = require('./models/ProductImage');
    const product = productId ? await Product.findByPk(productId, {
      attributes: ['id', 'productName', 'shortDescription', 'longDescription', 'image'],
      include: [{ model: ProductImage, as: 'Images', attributes: ['url', 'sortOrder'], required: false }],
    }) : null;
    if (!product) return res.status(404).send('Product not found.');

    const row = product.toJSON();
    const gallery = Array.isArray(row.Images) ? row.Images.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) : [];
    const primaryImage = imageExistsForSharing(row.image) ? absoluteImageUrl(row.image) : null;
    const galleryImage = gallery.find(item => imageExistsForSharing(item.url));
    const image = primaryImage || (galleryImage && absoluteImageUrl(galleryImage.url)) || defaultShareImage;
    const description = String(row.shortDescription || row.longDescription || `Shop ${row.productName} at Vika Vastra.`).replace(/\s+/g, ' ').trim().slice(0, 300);
    const url = `${websiteUrl}${req.path}`;
    const html = fs.readFileSync(frontendIndexPath, 'utf8');
    res.status(200).type('html').send(renderPageMetadata(html, {
      title: `${row.productName} | Vika Vastra`, description, image, url, type: 'product',
    }));
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res, next) => {
  if (!fs.existsSync(frontendIndexPath)) return next();
  try {
    const html = fs.readFileSync(frontendIndexPath, 'utf8');
    res.type('html').send(renderPageMetadata(html, {
      title: 'Vika Vastra | A Heritage in Every Drape',
      description: 'Vika Vastra - A Heritage in Every Drape. Premium Saree Best collection For Online Shopping.',
      image: defaultShareImage,
      url: `${websiteUrl}/`,
    }));
  } catch (error) { next(error); }
});

app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// --- 5. ROUTES SETUP ---
app.use('/api/user', userLoginRoutes);
app.use('/api/users', userLoginRoutes);
app.use('/api/auth', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/stocks', stockRoutes);

// Address routes FIRST, then customer routes (order matters for Express)
app.use('/api/customers', customerAddressRoutes);
app.use('/api/customers', customerRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/contact', contactroutes);
app.use('/api/contacts', contactroutes);
app.use('/api/delivery-zones', deliveryZonesRouter);
app.use('/api/banners', bannerRoutes);
app.use('/api/middle-banners', middleBannerRoutes);
app.use('/api/offer-banners', offerBannerRoutes);
app.use('/api/live-products', liveProductRoutes);
app.use('/api/instagram-posts', instagramPostRoutes);
app.use('/api/promo-bar', promoBarRoutes);
app.use('/api/email-campaigns', emailCampaignRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// --- 6. SAFE MIGRATIONS & START ---
const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(async () => {
    try {
      const queryInterface = sequelize.getQueryInterface();
      const existingTables = await queryInterface.showAllTables();
      const resolveExistingTable = model => {
        const modelTable = model.getTableName();
        const modelTableName = String(typeof modelTable === 'object' ? modelTable.tableName : modelTable);
        const existingTable = existingTables.find(table => {
          const existingName = String(typeof table === 'object' ? table.tableName : table);
          return existingName.toLowerCase() === modelTableName.toLowerCase();
        });
        if (!existingTable) throw new Error(`Required table "${modelTableName}" was not found in the connected database.`);
        return typeof existingTable === 'object' ? existingTable : { tableName: existingTable };
      };
      const tableName = resolveExistingTable(Category);
      const columns = await queryInterface.describeTable(tableName);

      if (!columns.sort_order) {
        await queryInterface.addColumn(tableName, 'sort_order', {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        });
        await sequelize.query(`UPDATE ${sequelize.getQueryInterface().quoteTable(tableName)} SET sort_order = id WHERE sort_order = 0`);
        console.log('Added sort_order column to Categories table');
      }
      if (!columns.discountType) {
        await queryInterface.addColumn(tableName, 'discountType', {
          type: DataTypes.ENUM('none', 'flat', 'percentage'),
          allowNull: false,
          defaultValue: 'none',
        });
        console.log('Added discountType column to Categories table');
      }
      if (!columns.discountValue) {
        await queryInterface.addColumn(tableName, 'discountValue', {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        });
        console.log('Added discountValue column to Categories table');
      }

      const productTable = resolveExistingTable(Product);
      const productColumns = await queryInterface.describeTable(productTable);
      if (!productColumns.sku) {
        await queryInterface.addColumn(productTable, 'sku', {
          type: DataTypes.STRING(64),
          allowNull: true,
        });
        console.log('Added sku column to Products table');
      }
      if (!productColumns.gstType) await queryInterface.addColumn(productTable, 'gstType', { type: DataTypes.ENUM('inclusive', 'exclusive'), allowNull: false, defaultValue: 'exclusive' });
      if (!productColumns.gstRate) await queryInterface.addColumn(productTable, 'gstRate', { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 });
      const indexes = await queryInterface.showIndex(productTable);
      if (!indexes.some(index => index.fields?.some(field => field.attribute === 'sku' || field.name === 'sku') && index.unique)) {
        await queryInterface.addIndex(productTable, ['sku'], {
          unique: true,
          name: 'products_sku_unique',
        });
        console.log('Added unique SKU index to Products table');
      }

      const variantTable = ProductVariant.getTableName();
      const variantTableName = String(typeof variantTable === 'object' ? variantTable.tableName : variantTable);
      const matchingVariantTable = existingTables.some(table => String(typeof table === 'object' ? table.tableName : table).toLowerCase() === variantTableName.toLowerCase());
      if (!matchingVariantTable) {
        await queryInterface.createTable({ tableName: variantTableName.toLowerCase() }, {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
          productId: { type: DataTypes.INTEGER, allowNull: false, references: { model: productTable, key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
          sku: { type: DataTypes.STRING(64), allowNull: true, unique: true },
          attributes: { type: DataTypes.JSON, allowNull: false },
          mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
          salesPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
          stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
          isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        });
        console.log('Created ProductVariants table');
      }
      const resolvedVariantTable = matchingVariantTable ? resolveExistingTable(ProductVariant) : { tableName: variantTableName.toLowerCase() };
      const variantColumns = await queryInterface.describeTable(resolvedVariantTable);
      if (!variantColumns.image) await queryInterface.addColumn(resolvedVariantTable, 'image', { type: DataTypes.STRING, allowNull: true });
      const orderItemTable = resolveExistingTable(OrderItem);
      const orderItemColumns = await queryInterface.describeTable(orderItemTable);
      if (!orderItemColumns.variantId) await queryInterface.addColumn(orderItemTable, 'variantId', { type: DataTypes.INTEGER, allowNull: true });
      if (!orderItemColumns.variantAttributes) await queryInterface.addColumn(orderItemTable, 'variantAttributes', { type: DataTypes.JSON, allowNull: true });
      if (!orderItemColumns.gstType) await queryInterface.addColumn(orderItemTable, 'gstType', { type: DataTypes.ENUM('inclusive', 'exclusive'), allowNull: false, defaultValue: 'exclusive' });
      if (!orderItemColumns.gstRate) await queryInterface.addColumn(orderItemTable, 'gstRate', { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 });
      if (!orderItemColumns.taxableAmount) await queryInterface.addColumn(orderItemTable, 'taxableAmount', { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 });
      if (!orderItemColumns.taxAmount) await queryInterface.addColumn(orderItemTable, 'taxAmount', { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 });
      const wishlistTable = resolveExistingTable(Wishlist);
      const wishlistColumns = await queryInterface.describeTable(wishlistTable);
      if (!wishlistColumns.variantId) await queryInterface.addColumn(wishlistTable, 'variantId', { type: DataTypes.INTEGER, allowNull: true });
      if (!wishlistColumns.variantAttributes) await queryInterface.addColumn(wishlistTable, 'variantAttributes', { type: DataTypes.JSON, allowNull: true });
      for (const [name, definition] of Object.entries({
        ages: { type: DataTypes.JSON, allowNull: true },
        metres: { type: DataTypes.JSON, allowNull: true },
      })) {
        if (!productColumns[name]) await queryInterface.addColumn(productTable, name, definition);
      }
      const cartTable = resolveExistingTable(Cart);
      const cartColumns = await queryInterface.describeTable(cartTable);
      if (!cartColumns.variantId) await queryInterface.addColumn(cartTable, 'variantId', { type: DataTypes.INTEGER, allowNull: true });
      if (!cartColumns.variantAttributes) await queryInterface.addColumn(cartTable, 'variantAttributes', { type: DataTypes.JSON, allowNull: true });

      const couponTable = resolveExistingTable(Coupon);
      const couponColumns = await queryInterface.describeTable(couponTable);
      if (!couponColumns.show_in_checkout) {
        await queryInterface.addColumn(couponTable, 'show_in_checkout', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        });
        console.log('Added show_in_checkout column to Coupons table');
      }

      // Migrate legacy EMT- order numbers to VV- in the database
      try {
        await sequelize.query(`UPDATE orders SET order_number = REPLACE(order_number, 'EMT-', 'VV-') WHERE order_number LIKE 'EMT-%'`);
        console.log('Migrated legacy EMT order numbers to VV prefix');
      } catch (migErr) {
        console.warn('Order prefix migration notice:', migErr.message);
      }
    } catch (colErr) {
      console.error('Database schema migration failed; API will not start:', colErr);
      process.exit(1);
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB sync error:', err));
