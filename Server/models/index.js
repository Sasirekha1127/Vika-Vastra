const Banner          = require('./Banner');
const Brand           = require('./Brand');
const Cart            = require('./Cart');
const Category        = require('./Category');
const Contact         = require('./Contact');
const Coupon          = require('./Coupon');
const Customer        = require('./Customer');
const CustomerAddress = require('./CustomerAddress');
const DeliveryZone    = require('./DeliveryZone');
const InstagramPost   = require('./InstagramPost');
const LiveProduct     = require('./LiveProduct');
const Offerbanner     = require('./Offerbanner');
const Order           = require('./Order');
const OrderItem       = require('./OrderItem');
const Product         = require('./Product');
const ProductImage    = require('./ProductImage');
const ProductVariant  = require('./ProductVariant');
const PromoBar        = require('./PromoBar');
const Return          = require('./Return');
const Review          = require('./Review');
const Stock           = require('./Stock');
const SubCategory     = require('./SubCategory');
const User            = require('./User');
const UserLogin       = require('./UserLogin');
const Wishlist        = require('./Wishlist');
const sequelize       = require('../config/db');

// ── Associations ──────────────────────────────────────────────────

// LiveProduct ←→ Product
LiveProduct.belongsTo(Product, {
  foreignKey: 'productId',
  as:         'linkedProduct',
  onDelete:   'SET NULL',
  onUpdate:   'CASCADE',
  constraints: true,
});
Product.hasMany(LiveProduct, {
  foreignKey: 'productId',
  as:         'liveProducts',
});

module.exports = {
  sequelize,
  Banner,
  Brand,
  Cart,
  Category,
  Contact,
  Coupon,
  Customer,
  CustomerAddress,
  DeliveryZone,
  InstagramPost,
  LiveProduct,
  Offerbanner,
  Order,
  OrderItem,
  Product,
  ProductImage,
  ProductVariant,
  PromoBar,
  Return,
  Review,
  Stock,
  SubCategory,
  User,
  UserLogin,
  Wishlist,
};
