import { getCustomerId } from "./Auth";

const firstOf = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

export const PENDING_ACTION_KEY = "pendingAction";
export const PENDING_CART_KEY = "pendingCartItem";
export const PENDING_WISHLIST_KEY = "pendingWishlistItem";

export const getStoredCustomerId = getCustomerId;

export const makeCartKey = (productId, variantId = null) => `${productId}:${variantId || 'base'}`;

export const normalizeCartProduct = (product = {}) => {
  const productId = firstOf(product.productId, product.id);
  const name = firstOf(product.name, product.productName, product.title, "Product");
  const rawImage = firstOf(product.img, product.image, product.images?.[0], product.thumbnail, "");
  const img = Array.isArray(rawImage) ? rawImage[0] : rawImage;
  const price = Number(firstOf(product.salesPrice, product.salePrice, product.price, product.mrp, 0));
  const quantity = Math.max(1, Number(firstOf(product.quantity, product.qty, 1)));
  const weight = firstOf(product.weight, product.selectedProductSize, "");

  return {
    productId,
    variantId: product.selectedVariant?.id ?? product.variantId ?? null,
    variantAttributes: product.selectedVariant?.attributes || product.variantAttributes || null,
    name,
    img,
    price,
    quantity,
    weight: weight || null,
    stock: firstOf(product.stock, 999),
  };
};

export const normalizeWishlistProduct = (product = {}) => {
  const productId = firstOf(product.productId, product.id);
  const name = firstOf(product.name, product.productName, product.title, "Product");
  const rawImage = firstOf(product.img, product.image, product.images?.[0], product.thumbnail, "");
  const img = Array.isArray(rawImage) ? rawImage[0] : rawImage;

  return {
    productId,
    variantId: product.selectedVariant?.id ?? product.variantId ?? null,
    variantAttributes: product.selectedVariant?.attributes || product.variantAttributes || null,
    name,
    img,
    price: Number(firstOf(product.salesPrice, product.salePrice, product.price, product.mrp, 0)),
    weight: firstOf(product.weight, product.selectedProductSize, ""),
    stock: firstOf(product.stock, true),
    rating:  firstOf(product.rating, 4.5),
    reviews: firstOf(product.reviews, 0),
  };
};

export const storePendingShopAction = (action, product) => {
  if (!action || !product) return;
  const key = action === "wishlist" ? PENDING_WISHLIST_KEY : PENDING_CART_KEY;
  const payload = action === "wishlist" ? normalizeWishlistProduct(product) : normalizeCartProduct(product);
  localStorage.setItem(PENDING_ACTION_KEY, action);
  localStorage.setItem(key, JSON.stringify(payload));
};

export const readPendingShopAction = () => {
  const action = localStorage.getItem(PENDING_ACTION_KEY);
  const key = action === "wishlist" ? PENDING_WISHLIST_KEY : PENDING_CART_KEY;
  try {
    const item = JSON.parse(localStorage.getItem(key) || "null");
    return { action, item };
  } catch {
    return { action, item: null };
  }
};

export const clearPendingShopAction = () => {
  localStorage.removeItem(PENDING_ACTION_KEY);
  localStorage.removeItem(PENDING_CART_KEY);
  localStorage.removeItem(PENDING_WISHLIST_KEY);
};
