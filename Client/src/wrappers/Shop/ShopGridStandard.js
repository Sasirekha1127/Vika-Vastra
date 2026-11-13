import { getProductColors, matchesColors } from "../../helpers/productColors";
import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LayoutOne from "../../layouts/LayoutOne";
import { getProductUrl } from "../../utils/productUrl";
import { getAllProducts, getAllCategories, getAllSubCategories, getAllBrands, getImageUrl } from "../../api";

// ── THEME COLORS ──────────────────────────────────────────────────────────────
const COLOR = {
  primary:      "#720E1E",
  primaryHover: "#8C1428",
  primaryLight: "#F8F6F2",
  dark:         "#720E1E",
  accent:       "#C59B27",
  danger:       "#e74c3c",
};

const getProductSearchValues = (product) => {
  if (!product) return [];
  const fields = [
    product.productName,
    product.sku,
    product.name,
    product.category,
    product.subCategory,
    product.brand,
    product.description,
    product.shortDescription,
  ];
  return fields
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
};

// ── AUTH CHECK ────────────────────────────────────────────────────────────────
const getLoggedInId = () => {
  try {
    const user     = JSON.parse(localStorage.getItem("user")     || "null");
    const customer = JSON.parse(localStorage.getItem("customer") || "null");
    return user?.id ?? customer?.id ?? null;
  } catch { return null; }
};
const isLoggedIn = () => !!getLoggedInId();

// ── HELPERS ───────────────────────────────────────────────────────────────────
const getDiscountedPrice = (mrp, salesPrice) => {
  const m = parseFloat(mrp);
  const s = parseFloat(salesPrice);
  if (!m || !s || s >= m) return null;
  return s;
};

const getDiscountPercent = (mrp, salesPrice) => {
  const m = parseFloat(mrp);
  const s = parseFloat(salesPrice);
  if (!m || !s || s >= m) return 0;
  return Math.round(((m - s) / m) * 100);
};

const getEffectivePrice = (product) =>
  product.discountedPrice != null ? product.discountedPrice : product.mrp;

const CUR = "Rs. ";

// ── NORMALIZE ─────────────────────────────────────────────────────────────────
const normalize = (p) => {
  const mrp            = parseFloat(p.mrp || 0);
  const salesPrice     = parseFloat(p.salesPrice ?? p.mrp ?? 0);
  const discountPercent = getDiscountPercent(mrp, salesPrice);
  const image          = getImageUrl(p.image);
  const priceMin       = mrp;
  const priceMax       = salesPrice;
  const createdAt      = p.createdAt || p.updatedAt || null;

  return {
    id:               String(p.id),
    name:             p.productName,
    variants:         (Array.isArray(p.Variants) ? p.Variants : []).filter(variant => variant.isActive !== false),
    colors:           getProductColors(p),
    sku:              p.sku || '',
    mrp,
    salesPrice,
    discountedPrice:  getDiscountedPrice(mrp, salesPrice),
    discountPercent,
    rating:           Number(p.rating) || 0,
    reviewCount:      Number(p.reviewCount) || 0,
    stock:            Number(p.stock || 0),
    image,
    shortDescription: p.shortDescription || "",
    category:         p.Category?.name    || "",
    categoryId:       p.Category?.id      || null,
    subCategory:      p.SubCategory?.name || "",
    subCategoryId:    p.SubCategory?.id   || null,
    brand:            p.Brand?.brandName  || "",
    brandId:          p.Brand?.id         || null,
    isNewArrival:     p.isNewArrival,
    isHotDeal:        p.isHotDeal,
    isRecommended:    p.isRecommended,
    priceMin,
    priceMax,
    createdAt,
  };
};

// ── PRICE DISPLAY ─────────────────────────────────────────────────────────────
const PriceDisplay = ({ product, size = "md" }) => {
  const fs    = size === "lg" ? 18 : 15;
  const fsSub = size === "lg" ? 13 : 12;
  if (product.discountedPrice) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: fs, fontWeight: 700, color: COLOR.primary }}>
          {CUR}{product.discountedPrice.toFixed(2)}
        </span>
        <span style={{ fontSize: fsSub, color: "#aaa", textDecoration: "line-through" }}>
          {CUR}{product.mrp.toFixed(2)}
        </span>
        {product.discountPercent > 0 && (
          <span style={{ fontSize: 11, background: "#fff3e0", color: COLOR.accent, fontWeight: 700, padding: "1px 6px", borderRadius: 3 }}>
            -{product.discountPercent}%
          </span>
        )}
      </div>
    );
  }
  return (
    <span style={{ fontSize: fs, fontWeight: 700, color: COLOR.primary }}>
      {CUR}{product.mrp.toFixed(2)}
    </span>
  );
};

// ── SIDEBAR SECTION WRAPPER ───────────────────────────────────────────────────
const SideSection = ({ title, children }) => (
  <div style={{
    background: "#fff", borderRadius: 10, padding: "18px 16px",
    marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
  }}>
    <p style={{
      fontSize: 12, fontWeight: 700, letterSpacing: 1.2,
      textTransform: "uppercase", color: "#888",
      marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #f0f0f0",
    }}>
      {title}
    </p>
    {children}
  </div>
);

// ── DUAL-HANDLE PRICE RANGE SLIDER ────────────────────────────────────────────
const PriceRangeSlider = ({ min, max, priceMin, priceMax, onChange }) => {
  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), priceMax - 1);
    onChange(val, priceMax);
  };
  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), priceMin + 1);
    onChange(priceMin, val);
  };

  const minPct   = ((priceMin - min) / (max - min)) * 100;
  const maxPct   = ((priceMax - min) / (max - min)) * 100;
  const isActive = priceMin > min || priceMax < max;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: COLOR.primary, padding: "3px 8px", borderRadius: 4 }}>
          {CUR}{priceMin.toLocaleString()}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: COLOR.primary, padding: "3px 8px", borderRadius: 4 }}>
          {CUR}{priceMax.toLocaleString()}
        </span>
      </div>
      <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "#e0e0e0" }} />
        <div style={{
          position: "absolute", left: `${minPct}%`, width: `${maxPct - minPct}%`,
          height: 4, borderRadius: 2,
          background: isActive ? COLOR.accent : COLOR.primary, transition: "background .2s",
        }} />
        <input type="range" min={min} max={max} step={50} value={priceMin} onChange={handleMinChange}
          style={{ position: "absolute", width: "100%", pointerEvents: "none", appearance: "none", WebkitAppearance: "none", background: "transparent", height: 4 }}
          className="price-thumb price-thumb--left"
        />
        <input type="range" min={min} max={max} step={50} value={priceMax} onChange={handleMaxChange}
          style={{ position: "absolute", width: "100%", pointerEvents: "none", appearance: "none", WebkitAppearance: "none", background: "transparent", height: 4 }}
          className="price-thumb price-thumb--right"
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 14 }}>
        {[
          { label: "Under ₹500",   lo: min,  hi: 500  },
          { label: "₹500–₹1000",  lo: 500,  hi: 1000 },
          { label: "₹1000–₹2500", lo: 1000, hi: 2500 },
          { label: "₹2500+",      lo: 2500, hi: max  },
        ].map(({ label, lo, hi }) => {
          const active = priceMin === lo && priceMax === hi;
          return (
            <button key={label} onClick={() => onChange(lo, hi)} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 10, cursor: "pointer",
              border: `1px solid ${active ? COLOR.primary : "#e0e0e0"}`,
              background: active ? COLOR.primary : "#fff",
              color: active ? "#fff" : "#666",
              fontWeight: active ? 700 : 400, transition: "all .15s",
            }}>
              {label}
            </button>
          );
        })}
        {isActive && (
          <button onClick={() => onChange(min, max)} style={{
            fontSize: 10, padding: "3px 8px", borderRadius: 10, cursor: "pointer",
            border: "1px solid #e0e0e0", background: "#fff", color: "#e74c3c",
          }}>
            Reset ✕
          </button>
        )}
      </div>
    </div>
  );
};

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const Sidebar = ({
  categories, subCategories, brands, colors, selectedColors, onColor,
  activeCategory, activeSubCategory, activeBrand,
  onCategory, onSubCategory, onBrand,
  priceMin, priceMax, globalPriceMin, globalPriceMax, onPriceChange,
}) => {
  const scrollShopToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleSubCategories = useMemo(() => {
    if (!activeCategory) return subCategories;
    const matchedCat = categories.find((c) => c.name === activeCategory);
    if (!matchedCat) return subCategories;
    return subCategories.filter(
      (s) => String(s.categoryId || s.Category?.id) === String(matchedCat.id)
    );
  }, [subCategories, categories, activeCategory]);

  const catBtnStyle = (active) => ({
    background: "none", border: "none", cursor: "pointer",
    fontSize: 13, color: active ? COLOR.primary : "#444",
    fontWeight: active ? 700 : 400,
    padding: "5px 0", display: "flex", alignItems: "center",
    justifyContent: "space-between", width: "100%", textAlign: "left",
    transition: "color .15s",
  });

  const filterImageStyle = {
    width: 32, height: 32, borderRadius: 8, objectFit: "cover",
    background: "#f7f7f7", border: "1px solid #eee", flexShrink: 0,
  };

  const renderFilterImage = (src, label) => {
    if (!src) return (
      <div style={{ ...filterImageStyle, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 11 }}>
        {label?.charAt(0) || "?"}
      </div>
    );
    return (
      <img
        src={src}
        alt={label || "filter"}
        style={filterImageStyle}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  };

  const subCatCheckStyle = (active) => ({
    background: active ? COLOR.primaryLight : "none",
    border: "none", cursor: "pointer",
    fontSize: 12, color: active ? COLOR.primary : "#555",
    fontWeight: active ? 700 : 400,
    padding: "6px 10px", display: "flex", alignItems: "center",
    gap: 8, width: "100%", textAlign: "left",
    borderRadius: 6, transition: "all .15s", marginBottom: 2,
  });

  return (
    <div>
      <style>{`
        .price-thumb { pointer-events: none; }
        .price-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; pointer-events: all;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${COLOR.primary}; border: 2px solid #fff;
          box-shadow: 0 1px 6px rgba(0,0,0,0.25); cursor: grab;
          transition: transform .15s, box-shadow .15s;
        }
        .price-thumb::-webkit-slider-thumb:active {
          cursor: grabbing; transform: scale(1.2);
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        }
        .price-thumb::-moz-range-thumb {
          pointer-events: all; width: 18px; height: 18px;
          border-radius: 50%; background: ${COLOR.primary};
          border: 2px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.25); cursor: grab;
        }
        .price-thumb--right::-webkit-slider-thumb { position: relative; z-index: 2; }
        .km-subcat-btn:hover { background: ${COLOR.primaryLight} !important; color: ${COLOR.primary} !important; }
        .km-color-checkbox {
          width: 16px !important;
          height: 16px !important;
          min-width: 16px !important;
          max-width: 16px !important;
          margin: 0 !important;
          padding: 0 !important;
          flex-shrink: 0 !important;
          accent-color: ${COLOR.primary} !important;
          cursor: pointer !important;
          box-shadow: none !important;
        }
        .km-color-item:hover { color: ${COLOR.primary} !important; }
      `}</style>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <SideSection title="Categories">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 2 }}>
              <button
                style={catBtnStyle(activeCategory === "" && activeSubCategory === "")}
                onClick={() => { onCategory(""); onSubCategory(""); scrollShopToTop(); }}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              const imgSrc   = getImageUrl(cat.image);
              return (
                <li key={cat.id} style={{ marginBottom: 2 }}>
                  <button
                    style={catBtnStyle(isActive)}
                    onClick={() => { onCategory(cat.name); onSubCategory(""); scrollShopToTop(); }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
                      {renderFilterImage(imgSrc, cat.name)}
                      <span style={{ flex: 1 }}>{isActive ? "▸ " : ""}{cat.name}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </SideSection>
      )}

      {/* ── Sub-Categories ── */}
      {visibleSubCategories.length > 0 && (
        <SideSection title="Sub-Categories">
          {activeCategory && (
            <div style={{ fontSize: 11, color: COLOR.accent, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
              <span>📂</span> {activeCategory}
            </div>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 2 }}>
              <button
                className="km-subcat-btn"
                style={subCatCheckStyle(activeSubCategory === "")}
                onClick={() => { onSubCategory(""); scrollShopToTop(); }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: `2px solid ${activeSubCategory === "" ? COLOR.primary : "#ddd"}`,
                  background: activeSubCategory === "" ? COLOR.primary : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}>
                  {activeSubCategory === "" && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                </span>
                All
              </button>
            </li>
            {visibleSubCategories.map((s) => {
              const isActive  = activeSubCategory === s.name;
              const parentCat = categories.find(
                (c) => String(c.id) === String(s.categoryId || s.Category?.id)
              );
              const imgSrc = getImageUrl(s.image);
              return (
                <li key={s.id} style={{ marginBottom: 2 }}>
                  <button
                    className="km-subcat-btn"
                    style={subCatCheckStyle(isActive)}
                    onClick={() => {
                      if (parentCat && activeCategory !== parentCat.name) {
                        onCategory(parentCat.name);
                      }
                      onSubCategory(isActive ? "" : s.name);
                      scrollShopToTop();
                    }}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                      border: `2px solid ${isActive ? COLOR.primary : "#ddd"}`,
                      background: isActive ? COLOR.primary : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .15s",
                    }}>
                      {isActive && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                    </span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                      {renderFilterImage(imgSrc, s.name)}
                      <span style={{ flex: 1 }}>{s.name}</span>
                    </div>

                  </button>
                </li>
              );
            })}
          </ul>
        </SideSection>
      )}

      {/* ── Brands ── */}
      {brands.length > 0 && (
        <SideSection title="Brands">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 4 }}>
              <button style={catBtnStyle(activeBrand === "")} onClick={() => onBrand("")}>
                All Brands
              </button>
            </li>
            {brands.map((b) => {
              const isActive = activeBrand === b.brandName;
              const imgSrc   = getImageUrl(b.logo);
              return (
                <li key={b.id} style={{ marginBottom: 4 }}>
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "4px 0" }}
                    onClick={() => onBrand(isActive ? "" : b.brandName)}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                      border: `2px solid ${isActive ? COLOR.primary : "#ddd"}`,
                      background: isActive ? COLOR.primary : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .15s",
                    }}>
                      {isActive && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                    </span>
                    {renderFilterImage(imgSrc, b.brandName)}
                    <span style={{ fontSize: 13, color: isActive ? COLOR.primary : "#444", fontWeight: isActive ? 600 : 400 }}>
                      {b.brandName}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </SideSection>
      )}

      {/* ── Color ── */}
      {colors.length > 0 && (
        <SideSection title="Color">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {colors.map((color) => {
              const isSelected = selectedColors.includes(color);
              return (
                <label
                  key={color}
                  className="km-color-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    margin: 0,
                    padding: "4px 0",
                    cursor: "pointer",
                    fontSize: 13,
                    color: isSelected ? COLOR.primary : "#444",
                    fontWeight: isSelected ? 600 : 400,
                    textTransform: "capitalize",
                    userSelect: "none",
                    transition: "color .15s",
                  }}
                >
                  <input
                    type="checkbox"
                    className="km-color-checkbox"
                    checked={isSelected}
                    onChange={() => onColor(color)}
                    style={{
                      width: 16,
                      height: 16,
                      minWidth: 16,
                      maxWidth: 16,
                      margin: 0,
                      padding: 0,
                      flexShrink: 0,
                      accentColor: COLOR.primary,
                      cursor: "pointer",
                      verticalAlign: "middle",
                    }}
                  />
                  <span>{color}</span>
                </label>
              );
            })}
          </div>
        </SideSection>
      )}
      <SideSection title="Price Range">
        <PriceRangeSlider
          min={globalPriceMin}
          max={globalPriceMax}
          priceMin={priceMin}
          priceMax={priceMax}
          onChange={onPriceChange}
        />
      </SideSection>
    </div>
  );
};

// ── TOPBAR ────────────────────────────────────────────────────────────────────
const Topbar = ({ productCount, sortedCount, onSort, onLayout, layout }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 8, padding: "12px 0",
    borderBottom: "1px solid #f0f0f0", marginBottom: 16,
  }}>
    <p style={{ fontSize: 13, color: "#777", margin: 0 }}>
      Showing <strong style={{ color: "#333" }}>{sortedCount}</strong> of <strong style={{ color: "#333" }}>{productCount}</strong> products
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <select
        onChange={(e) => onSort(e.target.value)}
        style={{ border: "1px solid #e0e0e0", padding: "7px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "#444", outline: "none" }}
      >
        <option value="">Default sorting</option>
        <option value="priceHighToLow">Price: High → Low</option>
        <option value="priceLowToHigh">Price: Low → High</option>
      </select>
      <div style={{ display: "flex", gap: 4 }}>
        {["grid", "list"].map((l) => (
          <button
            key={l}
            title={l === "grid" ? "Grid View" : "List View"}
            onClick={() => onLayout(l)}
            style={{
              border: `1px solid ${layout === l ? COLOR.primary : "#e0e0e0"}`,
              background: layout === l ? COLOR.primaryLight : "#fff",
              color: layout === l ? COLOR.primary : "#777",
              borderRadius: 6, padding: "7px 10px", cursor: "pointer", fontSize: 16, lineHeight: 1,
            }}
          >
            {l === "grid" ? "⊞" : "☰"}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
export const ProductCard = ({ product, cartItems = [], wishlistItems = [], addToCart, addToWishlist, removeFromWishlist, layout, onNotLoggedIn }) => {
  const [hovered,        setHovered]        = useState(false);
  const [cartBtnHovered, setCartBtnHovered] = useState(false);
  const [imgError,       setImgError]       = useState(false);
  const navigate = useNavigate();

  const currentMrp      = Number(product.mrp || 0);
  const currentPrice    = Number(product.salesPrice ?? product.mrp ?? 0);
  const currentDiscount = currentMrp > 0 && currentPrice < currentMrp
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const currentImage    = getImageUrl(product.image);
  const activeVariants = Array.isArray(product.variants) ? product.variants.filter(variant => variant.isActive !== false) : [];
  const displayStock    = activeVariants.length
    ? activeVariants.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0)
    : Number(product.stock || 0);
  const availableVariants = activeVariants.filter(variant => Number(variant.stock) > 0);
  const onlyAvailableVariant = availableVariants.length === 1 ? availableVariants[0] : null;
  const outOfStock      = displayStock <= 0;

  const priceProduct = {
    ...product,
    mrp:             currentMrp,
    salesPrice:      currentPrice,
    discountedPrice: getDiscountedPrice(currentMrp, currentPrice),
    discountPercent: currentDiscount,
  };

  const cartItem     = cartItems.find((c) => String(c.productId ?? c.id) === String(product.id));
  const wishlistItem = wishlistItems.find((w) => String(w.productId ?? w.id) === String(product.id));
  const inWishlist   = !!wishlistItem;
  const inCart       = cartItem && cartItem.quantity > 0;
  const isList       = layout === "list";
  const cartBg       = inCart ? "#B38728" : cartBtnHovered ? "#A8801D" : "rgb(197, 155, 39)";

  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn()) { onNotLoggedIn?.("cart", product); return; }
    if (outOfStock) return;
    if (activeVariants.length && !onlyAvailableVariant) {
      navigate(getProductUrl(product));
      return;
    }
    if (onlyAvailableVariant) {
      addToCart({
        ...product,
        selectedVariant: onlyAvailableVariant,
        variantId: onlyAvailableVariant.id,
        image: onlyAvailableVariant.image || product.image,
        mrp: onlyAvailableVariant.mrp ?? product.mrp,
        salesPrice: onlyAvailableVariant.salesPrice ?? product.salesPrice,
        stock: onlyAvailableVariant.stock,
        weight: Object.entries(onlyAvailableVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', '),
      });
      return;
    }
    addToCart(product);
  };

  const handleWishlist = (e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn()) { onNotLoggedIn?.("wishlist", product); return; }
    if (inWishlist) removeFromWishlist(wishlistItem.id);
    else {
      const selectedVariant = product.variants?.[0];
      addToWishlist({
        ...product,
        selectedVariant,
        ...(selectedVariant ? {
          image: selectedVariant.image || product.image,
          salesPrice: selectedVariant.salesPrice ?? product.salesPrice,
          stock: selectedVariant.stock,
          weight: Object.entries(selectedVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', '),
        } : {}),
      });
    }
  };

  return (
    <div
      style={{
        background: "#fff", borderRadius: 12, overflow: "hidden",
        boxShadow: hovered ? "0 10px 28px rgba(0,0,0,0.13)" : "0 2px 10px rgba(0,0,0,0.07)",
        transition: "box-shadow .25s, transform .25s",
        transform: hovered && !isList ? "translateY(-3px)" : "none",
        marginBottom: 24,
        display: isList ? "flex" : "block", alignItems: isList ? "stretch" : "unset",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={() => navigate(getProductUrl(product))}
        style={{ position: "relative", overflow: "hidden", background: "#f9f6f2", flexShrink: 0, width: isList ? 190 : "100%", cursor: "pointer", borderRadius: isList ? "12px 0 0 12px" : "12px 12px 0 0" }}
      >
        {currentImage && !imgError ? (
          <img
            src={currentImage} alt={product.name} onError={() => setImgError(true)}
            style={{ width: "100%", aspectRatio: isList ? "1/1" : "4/5", objectFit: "cover", display: "block", transition: "transform .4s", transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: isList ? "1/1" : "4/5", background: "linear-gradient(135deg,#f3ecf9,#fce8f3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
            <span style={{ fontSize: 36 }}>🛍️</span>
            <span style={{ fontSize: 11, marginTop: 6 }}>No Image</span>
          </div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {currentDiscount > 0 && <span style={{ background: COLOR.accent, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>-{currentDiscount}%</span>}
          {product.isNewArrival && <span style={{ background: COLOR.dark, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>NEW</span>}
          {product.isHotDeal && <span style={{ background: "#e74c3c", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>🔥 HOT</span>}
        </div>
        {!isList && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", transform: hovered ? "translateY(0)" : "translateY(100%)", transition: "transform .3s" }}>
            <button
              onClick={handleAddToCart}
              onMouseEnter={() => setCartBtnHovered(true)}
              onMouseLeave={() => setCartBtnHovered(false)}
              disabled={outOfStock}
              style={{ flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 700, background: outOfStock ? "#999" : cartBg, color: "#fff", border: "none", cursor: outOfStock ? "not-allowed" : "pointer", letterSpacing: "0.5px", transition: "background .2s", opacity: outOfStock ? 0.6 : 1 }}
            >
              {inCart ? "✓ Added to Cart" : outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button onClick={handleWishlist} style={{ width: 44, background: inWishlist ? COLOR.danger : "#fff", color: inWishlist ? "#fff" : "#333", border: "none", cursor: "pointer", fontSize: 17, transition: "background .2s" }}>
              {inWishlist ? "♥" : "♡"}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          {product.brand && <span style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8 }}>{product.brand}</span>}
          {product.subCategory && <span style={{ fontSize: 10, color: COLOR.primary, background: COLOR.primaryLight, padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>{product.subCategory}</span>}
        </div>

        <h3
          onClick={() => navigate(getProductUrl(product))}
          style={{ fontSize: 14, fontWeight: 600, color: COLOR.dark, margin: "0 0 6px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", cursor: "pointer" }}
        >
          {product.name}
        </h3>

        {product.sku && <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 5, margin: '0 0 8px', padding: '4px 9px', borderRadius: 999, background: '#F3F0E9', color: COLOR.dark, fontSize: 10, fontWeight: 700, letterSpacing: '.04em', maxWidth: '100%' }}><span style={{ color: '#8A7A60', fontWeight: 600 }}>CODE</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.sku}</span></div>}

        <div style={{ marginTop: "auto" }}>
          <div style={{ marginBottom: 6 }}><PriceDisplay product={priceProduct} /></div>
          {product.reviewCount > 0 && product.rating > 0 && (
            <div style={{ color: COLOR.accent, fontSize: 12, marginBottom: isList ? 10 : 0 }}>
              {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
              <span style={{ color: "#bbb", marginLeft: 4 }}>{product.rating}/5</span>
            </div>
          )}
          {isList && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={handleAddToCart} onMouseEnter={() => setCartBtnHovered(true)} onMouseLeave={() => setCartBtnHovered(false)} disabled={outOfStock}
                style={{ padding: "9px 20px", fontSize: 12, fontWeight: 700, background: outOfStock ? "#999" : cartBg, color: "#fff", border: "none", borderRadius: 6, cursor: outOfStock ? "not-allowed" : "pointer", transition: "background .2s", opacity: outOfStock ? 0.6 : 1 }}>
                {inCart ? "✓ In Cart" : outOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
              <button onClick={handleWishlist}
                style={{ padding: "9px 14px", fontSize: 15, background: inWishlist ? COLOR.danger : "#f5f5f5", color: inWishlist ? "#fff" : "#555", border: "none", borderRadius: 6, cursor: "pointer", transition: "background .2s" }}>
                {inWishlist ? "♥" : "♡"}
              </button>
              <button onClick={() => navigate(getProductUrl(product))}
                style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, background: "#f5f5f5", color: "#555", border: "none", borderRadius: 6, cursor: "pointer" }}>
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── PAGINATOR ─────────────────────────────────────────────────────────────────
const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    end = Math.min(totalPages - 1, 4);
  } else if (currentPage >= totalPages - 2) {
    start = Math.max(2, totalPages - 3);
  }

  if (start > 2) {
    pages.push("ellipsis-left");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis-right");
  }

  pages.push(totalPages);
  return pages;
};

const SimplePaginator = ({ total, pageLimit, currentPage, setCurrentPage }) => {
  const totalPages = Math.ceil(total / pageLimit);
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const handlePageClick = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
        document.body.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    };
    scrollToTop();
    setTimeout(scrollToTop, 50);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 36,
        maxWidth: "100%",
        overflowX: "auto",
        padding: "6px 0",
      }}
    >
      <button
        onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous Page"
        style={{
          height: 36,
          minWidth: 36,
          padding: "0 10px",
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          background: "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          color: currentPage === 1 ? "#ccc" : "#444",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .15s",
        }}
      >
        «
      </button>

      {pages.map((item, idx) => {
        if (typeof item === "string") {
          return (
            <span
              key={item + idx}
              style={{
                height: 36,
                minWidth: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888",
                fontSize: 14,
                userSelect: "none",
              }}
            >
              …
            </span>
          );
        }

        const isCurrent = currentPage === item;
        return (
          <button
            key={item}
            onClick={() => handlePageClick(item)}
            style={{
              height: 36,
              minWidth: 36,
              padding: "0 10px",
              border: `1px solid ${isCurrent ? COLOR.dark : "#e0e0e0"}`,
              borderRadius: 6,
              background: isCurrent ? COLOR.dark : "#fff",
              color: isCurrent ? "#fff" : "#444",
              cursor: "pointer",
              fontWeight: isCurrent ? 700 : 400,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s",
            }}
          >
            {item}
          </button>
        );
      })}

      <button
        onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
        style={{
          height: 36,
          minWidth: 36,
          padding: "0 10px",
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          background: "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          color: currentPage === totalPages ? "#ccc" : "#444",
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .15s",
        }}
      >
        »
      </button>
    </div>
  );
};

// ── LOADING SKELETON ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 24 }}>
    <div style={{ width: "100%", aspectRatio: "4/5", background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    <div style={{ padding: "14px 16px 18px" }}>
      <div style={{ height: 10, background: "#f0f0f0", borderRadius: 4, marginBottom: 8, width: "40%" }} />
      <div style={{ height: 14, background: "#f0f0f0", borderRadius: 4, marginBottom: 6, width: "80%" }} />
      <div style={{ height: 14, background: "#f0f0f0", borderRadius: 4, marginBottom: 12, width: "60%" }} />
      <div style={{ height: 16, background: "#f0f0f0", borderRadius: 4, width: "35%" }} />
    </div>
  </div>
);

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const GLOBAL_PRICE_MIN = 0;
const GLOBAL_PRICE_MAX = 10000;

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const ShopGridStandard = ({ shop }) => {
  const [selectedColors, setSelectedColors] = useState([]);
  const [layout,            setLayout]            = useState("grid");
  const [sortValue,         setSortValue]         = useState("");
  const [activeCategory,    setActiveCategory]    = useState("");
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const [activeBrand,       setActiveBrand]       = useState("");
  const [searchTerm,        setSearchTerm]        = useState("");
  const [currentPage,       setCurrentPage]       = useState(1);
  const [productsData,      setProductsData]      = useState([]);
  const [categories,        setCategories]        = useState([]);
  const [subCategories,     setSubCategories]     = useState([]);
  const [brands,            setBrands]            = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [priceMin,          setPriceMin]          = useState(GLOBAL_PRICE_MIN);
  const [priceMax,          setPriceMax]          = useState(GLOBAL_PRICE_MAX);

  const { cartItems = [], wishlistItems = [], addToCart, addToWishlist, deleteFromWishlist, onNotLoggedIn } = shop;

  const pageLimit = 9;
  const location  = useLocation();

  const globalPriceMin = GLOBAL_PRICE_MIN;
  const globalPriceMax = GLOBAL_PRICE_MAX;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, subCatRes, brandRes] = await Promise.all([
        getAllProducts(), getAllCategories(), getAllSubCategories(), getAllBrands(),
      ]);
      const normalized = (prodRes.data || []).map(normalize);
      setProductsData(normalized);
      setCategories(catRes.data       || []);
      setSubCategories(subCatRes.data || []);
      setBrands(brandRes.data         || []);
    } catch (err) {
      console.error("Shop fetch error:", err);
      setError("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── KEY FIX: Always reset ALL filters from URL params.
  // Previously used `if (cat)` conditionals, so navigating to /shop?q=term
  // would set searchTerm but leave stale activeCategory in state,
  // causing category filter to override the search results.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat    = params.get("category");
    const sub    = params.get("subCategory");
    const brand  = params.get("brand");
    const q      = params.get("q");

    // Always set (or clear) every filter so stale state never bleeds through
    setActiveCategory(   cat   ? decodeURIComponent(cat)   : "");
    setActiveSubCategory(sub   ? decodeURIComponent(sub)   : "");
    setActiveBrand(      brand ? decodeURIComponent(brand) : "");
    setSelectedColors(params.getAll("color").map(color => color.trim().toLowerCase()).filter(Boolean));
    setSearchTerm(       q     ? decodeURIComponent(q)     : "");
  }, [location.search]);

  useEffect(() => { setCurrentPage(1); }, [selectedColors, activeCategory, activeSubCategory, activeBrand, searchTerm, sortValue, priceMin, priceMax]);

  const colors = useMemo(() => [...new Set(productsData.flatMap(product => product.colors))].sort((a, b) => a.localeCompare(b)), [productsData]);

  const filtered = useMemo(() => {
    let result = productsData.filter(product => matchesColors(product, selectedColors));

    // Category / sub-category filter
    if (activeSubCategory) {
      result = result.filter((p) => p.subCategory === activeSubCategory);
    } else if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Brand filter
    if (activeBrand) result = result.filter((p) => p.brand === activeBrand);

    // Search filter — matches name, category, brand, description, etc.
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((p) =>
        getProductSearchValues(p).some((v) => v.includes(q))
      );
    }

    // Price filter
    const isPriceActive = priceMin > globalPriceMin || priceMax < globalPriceMax;
    if (isPriceActive) {
      result = result.filter((p) => p.priceMin <= priceMax && p.priceMax >= priceMin);
    }

    // Sort
    switch (sortValue) {
      case "priceHighToLow": result.sort((a, b) => (b.priceMax || 0) - (a.priceMax || 0));                  break;
      case "priceLowToHigh": result.sort((a, b) => (a.priceMin || 0) - (b.priceMin || 0));                  break;
      case "newest":         result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
      case "discount":       result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));     break;
      default: break;
    }

    return result;
  }, [productsData, selectedColors, activeCategory, activeSubCategory, activeBrand, searchTerm, priceMin, priceMax, globalPriceMin, globalPriceMax, sortValue]);

  const totalCount  = filtered.length;
  const offset      = (currentPage - 1) * pageLimit;
  const currentData = filtered.slice(offset, offset + pageLimit);

  const clearAllFilters = () => {
    setSelectedColors([]);
    setActiveCategory("");
    setActiveSubCategory("");
    setActiveBrand("");
    setSearchTerm("");
    setPriceMin(globalPriceMin);
    setPriceMax(globalPriceMax);
  };

  const isPriceFilterActive = priceMin > globalPriceMin || priceMax < globalPriceMax;
  const hasFilters = selectedColors.length > 0 || activeCategory || activeSubCategory || activeBrand || searchTerm || isPriceFilterActive;

  const emptyMessage = searchTerm
    ? `No products found for "${searchTerm}". Try a different search term.`
    : isPriceFilterActive && !activeCategory && !activeSubCategory && !activeBrand
    ? "No products found in this price range."
    : "No products found. Try changing your filters.";

  return (
    <Fragment>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <LayoutOne shop={shop} headerTop="visible">
        <div className="shop-area pt-95 pb-100">
          <div className="container">
            <div className="row">

              {/* ── Sidebar ── */}
              <div className="col-lg-3 order-2 order-lg-1">
                <div style={{ marginRight: 12 }}>
                  <Sidebar
                    colors={colors}
                    selectedColors={selectedColors}
                    onColor={color => setSelectedColors(current => current.includes(color) ? current.filter(value => value !== color) : [...current, color])}
                    categories={categories}
                    subCategories={subCategories}
                    brands={brands}
                    activeCategory={activeCategory}
                    activeSubCategory={activeSubCategory}
                    activeBrand={activeBrand}
                    onCategory={(cat) => {
                      setActiveCategory(cat);
                      setActiveSubCategory("");
                    }}
                    onSubCategory={setActiveSubCategory}
                    onBrand={setActiveBrand}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    globalPriceMin={globalPriceMin}
                    globalPriceMax={globalPriceMax}
                    onPriceChange={(lo, hi) => { setPriceMin(lo); setPriceMax(hi); }}
                  />
                </div>
              </div>

              {/* ── Products ── */}
              <div className="col-lg-9 order-1 order-lg-2">
                <Topbar
                  productCount={productsData.length}
                  sortedCount={totalCount}
                  onSort={setSortValue}
                  onLayout={setLayout}
                  layout={layout}
                />

                {/* Active filter chips */}
                {hasFilters && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14, alignItems: "center" }}>
                    {searchTerm && (
                      <span style={{ background: "#e8f4ff", color: "#1a6fba", fontSize: 12, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                        🔍 "{searchTerm}"
                        <button onClick={() => setSearchTerm("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a6fba", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    )}
                    {activeCategory && (
                      <span style={{ background: COLOR.primaryLight, color: COLOR.primary, fontSize: 12, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                        📂 {activeCategory}
                        <button onClick={() => { setActiveCategory(""); setActiveSubCategory(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: COLOR.primary, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    )}
                    {activeSubCategory && (
                      <span style={{ background: COLOR.primaryLight, color: COLOR.primary, fontSize: 12, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                        📁 {activeSubCategory}
                        <button onClick={() => setActiveSubCategory("")} style={{ background: "none", border: "none", cursor: "pointer", color: COLOR.primary, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    )}
                    {activeBrand && (
                      <span style={{ background: "#fff8e6", color: COLOR.accent, fontSize: 12, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                        🏷️ {activeBrand}
                        <button onClick={() => setActiveBrand("")} style={{ background: "none", border: "none", cursor: "pointer", color: COLOR.accent, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    )}
                    {selectedColors.map(color => <button key={color} type="button" onClick={() => setSelectedColors(current => current.filter(value => value !== color))} aria-label={`Remove color filter ${color}`} style={{ fontSize: 11, border: '1px solid #e0e0e0', borderRadius: 20, padding: '3px 10px', background: '#fff', cursor: 'pointer' }}>Color: {color} ×</button>)}
                    {isPriceFilterActive && (
                      <span style={{ background: "#f0fff4", color: "#2d7a4f", fontSize: 12, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                        💰 {CUR}{priceMin.toLocaleString()} – {CUR}{priceMax.toLocaleString()}
                        <button onClick={() => { setPriceMin(globalPriceMin); setPriceMax(globalPriceMax); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#2d7a4f", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    )}
                    <button onClick={clearAllFilters} style={{ fontSize: 11, color: "#aaa", background: "none", border: "1px solid #e0e0e0", borderRadius: 20, padding: "3px 10px", cursor: "pointer" }}>
                      Clear all
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                    <p style={{ color: "#e74c3c", marginBottom: 16 }}>{error}</p>
                    <button onClick={fetchAll} style={{ background: COLOR.primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Retry</button>
                  </div>
                )}

                {/* Skeletons */}
                {loading && (
                  <div className="row" style={{ marginTop: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="col-6 col-sm-6 col-xl-4"><SkeletonCard /></div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!loading && !error && currentData.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                    <div style={{ fontSize: 50, marginBottom: 12 }}>
                      {searchTerm ? "🔍" : isPriceFilterActive ? "💸" : "🛒"}
                    </div>
                    <p style={{ fontSize: 16, color: "#888", marginBottom: 8 }}>{emptyMessage}</p>
                    <button onClick={clearAllFilters} style={{ marginTop: 8, background: COLOR.primary, color: "#fff", border: "none", padding: "9px 22px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Product grid */}
                {!loading && !error && currentData.length > 0 && (
                  <div className="row">
                    {currentData.map((product) => (
                      <div key={product.id} className={layout === "list" ? "col-12" : "col-6 col-sm-6 col-xl-4"}>
                        <ProductCard
                          product={product}
                          layout={layout}
                          cartItems={cartItems}
                          wishlistItems={wishlistItems}
                          addToCart={addToCart}
                          addToWishlist={addToWishlist}
                          removeFromWishlist={deleteFromWishlist}
                          onNotLoggedIn={onNotLoggedIn}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <SimplePaginator
                  total={totalCount}
                  pageLimit={pageLimit}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>

            </div>
          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default ShopGridStandard;
