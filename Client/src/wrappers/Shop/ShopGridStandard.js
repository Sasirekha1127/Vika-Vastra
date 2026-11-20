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
              border: `1.5px solid ${layout === l ? "rgb(197, 155, 39)" : "#e0e0e0"}`,
              background: layout === l ? "#FFF8EA" : "#fff",
              color: layout === l ? "rgb(197, 155, 39)" : "#777",
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

// ── PRODUCT CARD (HOME PAGE ARCHED CARD DESIGN) ──────────────────────────────
export const ProductCard = ({ product, cartItems = [], wishlistItems = [], addToCart, addToWishlist, removeFromWishlist, layout, onNotLoggedIn }) => {
  const [hovered,   setHovered]   = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const navigate = useNavigate();

  const currentMrp      = Number(product.mrp || product.price || 0);
  const currentPrice    = Number(product.salesPrice ?? product.mrp ?? product.price ?? 0);
  const currentDiscount = currentMrp > 0 && currentPrice < currentMrp
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const currentImage    = getImageUrl(product.image);
  const activeVariants  = Array.isArray(product.variants) ? product.variants.filter(variant => variant.isActive !== false) : [];
  const displayStock    = activeVariants.length
    ? activeVariants.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0)
    : Number(product.stock || 0);
  const availableVariants = activeVariants.filter(variant => Number(variant.stock) > 0);
  const onlyAvailableVariant = availableVariants.length === 1 ? availableVariants[0] : null;
  const outOfStock      = displayStock <= 0;

  const cartItem     = cartItems.find((c) => String(c.productId ?? c.id) === String(product.id));
  const wishlistItem = wishlistItems.find((w) => String(w.productId ?? w.id) === String(product.id));
  const inWishlist   = !!wishlistItem;
  const inCart       = cartItem && cartItem.quantity > 0;
  const isList       = layout === "list";
  const productName  = product.name || product.productName || "Handloom Silk Saree";

  const flashAdded = () => {
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn()) { onNotLoggedIn?.("cart", product); return; }
    if (outOfStock) return;
    if (activeVariants.length && !onlyAvailableVariant) {
      navigate(getProductUrl(product));
      return;
    }
    if (onlyAvailableVariant) {
      const added = await addToCart({
        ...product,
        selectedVariant: onlyAvailableVariant,
        variantId: onlyAvailableVariant.id,
        image: onlyAvailableVariant.image || product.image,
        mrp: onlyAvailableVariant.mrp ?? product.mrp,
        salesPrice: onlyAvailableVariant.salesPrice ?? product.salesPrice,
        stock: onlyAvailableVariant.stock,
        weight: Object.entries(onlyAvailableVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', '),
      });
      if (added !== false) flashAdded();
      return;
    }
    const added = await addToCart(product);
    if (added !== false) flashAdded();
  };

  const handleWishlist = (e) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn()) { onNotLoggedIn?.("wishlist", product); return; }
    if (inWishlist) {
      removeFromWishlist(wishlistItem.id);
    } else {
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

  const btnState = outOfStock ? "is-out" : (addedAnim || inCart) ? "is-added" : "";
  const btnLabel = addedAnim ? "Added to Cart" : inCart ? "In your Cart" : outOfStock ? "Sold Out" : "Add to Cart";

  /* ── LIST VIEW ── */
  if (isList) {
    return (
      <article
        onClick={() => navigate(getProductUrl(product))}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: "pointer",
          display: "flex",
          gap: 24,
          alignItems: "stretch",
          background: "#fff",
          border: "1px solid #EBE5DB",
          borderRadius: 18,
          padding: 16,
          marginBottom: 24,
          boxShadow: hovered ? "0 8px 24px rgba(114, 14, 30, 0.10)" : "0 2px 10px rgba(0,0,0,0.04)",
          transition: "box-shadow .25s ease, transform .25s ease",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        {/* Arch frame on the left */}
        <div
          style={{
            width: 190,
            flexShrink: 0,
            padding: 5,
            border: `1.5px solid ${hovered ? "#720E1E" : "#C59B27"}`,
            borderRadius: "999px 999px 0 0",
            transition: "border-color .2s ease",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              aspectRatio: "3 / 4",
              background: "#efe6e2",
              borderRadius: "999px 999px 0 0",
              width: "100%",
              height: "100%",
            }}
          >
            {currentImage && !imgError ? (
              <img
                src={currentImage}
                alt={productName}
                loading="lazy"
                onError={() => setImgError(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform .5s ease",
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: "#f5efe6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A835D" }}>
                <span style={{ fontSize: 32 }}>🛍️</span>
              </div>
            )}

            {currentDiscount > 0 && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 12,
                  background: "#720E1E",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px 4px 8px",
                  borderRadius: "0 999px 999px 0",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                }}
              >
                {currentDiscount}% off
              </span>
            )}
          </div>
        </div>

        {/* Info on the right */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "6px 0" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
              {product.subCategory && (
                <span style={{ fontSize: 10, color: "#720E1E", background: "#F8F6F2", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                  {product.subCategory}
                </span>
              )}
              {product.brand && (
                <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {product.brand}
                </span>
              )}
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                fontFamily: "'Fraunces', 'Cormorant Garamond', Georgia, serif",
                fontWeight: 600,
                fontSize: 20,
                color: "#2a1a1c",
                lineHeight: 1.35,
              }}
            >
              {productName}
            </h3>

            {product.sku && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: '#F3F0E9', color: '#720E1E', fontSize: 11, fontWeight: 700, margin: '0 0 10px' }}>
                <span style={{ color: '#8A7A60', fontWeight: 600 }}>CODE</span>
                <span>{product.sku}</span>
              </div>
            )}

            {product.shortDescription && (
              <p style={{ fontSize: 13.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
                {product.shortDescription}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "10px 0 14px" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#720E1E" }}>
                Rs. {currentPrice.toLocaleString("en-IN")}
              </span>
              {currentDiscount > 0 && (
                <span style={{ fontSize: 14, color: "#8a7a78", textDecoration: "line-through" }}>
                  Rs. {currentMrp.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons with gold theme */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              style={{
                padding: "11px 26px",
                font: "700 13px 'Figtree', 'Jost', sans-serif",
                color: "#fff",
                background: outOfStock ? "#eee7e4" : (addedAnim || inCart) ? "#2E7D32" : "rgb(197, 155, 39)",
                border: `1.5px solid ${outOfStock ? "#eee7e4" : (addedAnim || inCart) ? "#2E7D32" : "rgb(197, 155, 39)"}`,
                borderRadius: 999,
                cursor: outOfStock ? "not-allowed" : "pointer",
                boxShadow: outOfStock ? "none" : "0 4px 12px rgba(197, 155, 39, 0.28)",
                transition: "all .2s ease",
              }}
            >
              {btnLabel}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "1.5px solid rgb(197, 155, 39)",
                background: inWishlist ? "#720E1E" : "#fff",
                color: inWishlist ? "#fff" : "#720E1E",
                fontSize: 18,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                transition: "all .2s ease",
              }}
            >
              {inWishlist ? "♥" : "♡"}
            </button>

            <button
              type="button"
              onClick={() => navigate(getProductUrl(product))}
              style={{
                padding: "10px 22px",
                font: "600 13px 'Figtree', 'Jost', sans-serif",
                color: "rgb(197, 155, 39)",
                background: "transparent",
                border: "1.5px solid rgb(197, 155, 39)",
                borderRadius: 999,
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </article>
    );
  }

  /* ── GRID VIEW (MATCHES HOME PAGE ARCHED CARD) ── */
  return (
    <article
      onClick={() => navigate(getProductUrl(product))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        marginBottom: 32,
        height: "100%",
      }}
    >
      {/* Arched Temple Frame */}
      <div
        style={{
          padding: 5,
          border: `1.5px solid ${hovered ? "#720E1E" : "#C59B27"}`,
          borderRadius: "999px 999px 0 0",
          transition: "border-color .2s ease, box-shadow .2s ease",
          boxShadow: hovered ? "0 8px 24px rgba(114, 14, 30, 0.12)" : "none",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            aspectRatio: "3 / 4",
            background: "#efe6e2",
            borderRadius: "999px 999px 0 0",
          }}
        >
          {currentImage && !imgError ? (
            <img
              src={currentImage}
              alt={productName}
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform .5s ease",
                transform: hovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #f5efe6, #faede8)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#9A835D",
              }}
            >
              <span style={{ fontSize: 36 }}>🛍️</span>
              <span style={{ fontSize: 11, marginTop: 6, fontWeight: 600 }}>Pure Silk</span>
            </div>
          )}

          {/* Badges: Discount & New */}
          <div style={{ position: "absolute", left: 0, bottom: 12, display: "flex", flexDirection: "column", gap: 4, zIndex: 2 }}>
            {currentDiscount > 0 && (
              <span
                style={{
                  background: "#720E1E",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "5px 12px 5px 10px",
                  borderRadius: "0 999px 999px 0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              >
                {currentDiscount}% off
              </span>
            )}
            {product.isNewArrival && (
              <span
                style={{
                  background: "#C59B27",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px 3px 8px",
                  borderRadius: "0 999px 999px 0",
                }}
              >
                NEW
              </span>
            )}
          </div>

          {/* Hover Dark Vignette Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(36, 2, 7, 0.28)",
              opacity: hovered ? 1 : 0,
              transition: "opacity .3s ease",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Quick Added Flash Notification */}
          {addedAnim && (
            <div
              style={{
                position: "absolute",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#2E7D32",
                color: "#FFFFFF",
                fontSize: 11.5,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 999,
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                zIndex: 6,
                whiteSpace: "nowrap",
                letterSpacing: "0.03em",
              }}
            >
              ✓ Added to Cart
            </div>
          )}

          {/* Hover Action Icons (Cart, Wishlist, Quick View) */}
          <div
            className="emb-card-hover-actions"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: hovered ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -40%) scale(0.85)",
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? "auto" : "none",
              transition: "all .3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              zIndex: 4,
            }}
          >
            {/* Add to Cart Icon Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              title={btnLabel}
              aria-label={btnLabel}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `1.5px solid ${addedAnim || inCart ? "#2E7D32" : "#C59B27"}`,
                background: addedAnim || inCart ? "#2E7D32" : "#FFFFFF",
                color: addedAnim || inCart ? "#FFFFFF" : "#720E1E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: outOfStock ? "not-allowed" : "pointer",
                boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                if (!outOfStock && !addedAnim && !inCart) {
                  e.currentTarget.style.background = "rgb(197, 155, 39)";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "rgb(197, 155, 39)";
                  e.currentTarget.style.transform = "scale(1.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!outOfStock && !addedAnim && !inCart) {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.color = "#720E1E";
                  e.currentTarget.style.borderColor = "#C59B27";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {addedAnim || inCart ? (
                <span style={{ fontSize: 17, fontWeight: 700 }}>✓</span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
            </button>

            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={handleWishlist}
              title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
              aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `1.5px solid ${inWishlist ? "#720E1E" : "#C59B27"}`,
                background: inWishlist ? "#720E1E" : "#FFFFFF",
                color: inWishlist ? "#FFFFFF" : "#720E1E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                if (!inWishlist) {
                  e.currentTarget.style.background = "#720E1E";
                  e.currentTarget.style.color = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#720E1E";
                  e.currentTarget.style.transform = "scale(1.12)";
                }
              }}
              onMouseLeave={(e) => {
                if (!inWishlist) {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.color = "#720E1E";
                  e.currentTarget.style.borderColor = "#C59B27";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {inWishlist ? "♥" : "♡"}
            </button>

            {/* Quick View / Details Eye Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(getProductUrl(product));
              }}
              title="View Saree Details"
              aria-label="View saree details"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "1.5px solid #C59B27",
                background: "#FFFFFF",
                color: "#2a1a1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(197, 155, 39)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.borderColor = "rgb(197, 155, 39)";
                e.currentTarget.style.transform = "scale(1.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.color = "#2a1a1c";
                e.currentTarget.style.borderColor = "#C59B27";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div
        style={{
          padding: "14px 2px 0",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {product.subCategory && (
            <span style={{ fontSize: 10, color: "#720E1E", background: "#F8F6F2", padding: "2px 8px", borderRadius: 10, fontWeight: 600, letterSpacing: "0.03em" }}>
              {product.subCategory}
            </span>
          )}
          {product.brand && (
            <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.8 }}>
              {product.brand}
            </span>
          )}
        </div>

        <h3
          title={productName}
          style={{
            margin: 0,
            fontFamily: "'Fraunces', 'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize: 16.5,
            lineHeight: 1.35,
            color: "#2a1a1c",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {productName}
        </h3>

        {product.sku && (
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, background: '#F3F0E9', color: '#720E1E', fontSize: 10, fontWeight: 700, letterSpacing: '.04em' }}>
            <span style={{ color: '#8A7A60', fontWeight: 600 }}>CODE</span>
            <span>{product.sku}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginTop: 2, marginBottom: 8 }}>
          <span style={{ fontSize: 16.5, fontWeight: 700, color: "#720E1E" }}>
            Rs. {currentPrice.toLocaleString("en-IN")}
          </span>
          {currentDiscount > 0 && (
            <span style={{ fontSize: 13, color: "#8a7a78", textDecoration: "line-through" }}>
              Rs. {currentMrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {product.reviewCount > 0 && product.rating > 0 && (
          <div style={{ color: "#C59B27", fontSize: 12, marginBottom: 4 }}>
            {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
            <span style={{ color: "#aaa", marginLeft: 4 }}>({product.rating})</span>
          </div>
        )}
      </div>
    </article>
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
              border: `1px solid ${isCurrent ? "rgb(197, 155, 39)" : "#e0e0e0"}`,
              borderRadius: 8,
              background: isCurrent ? "rgb(197, 155, 39)" : "#fff",
              color: isCurrent ? "#fff" : "#444",
              cursor: "pointer",
              fontWeight: isCurrent ? 700 : 500,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .15s",
              boxShadow: isCurrent ? "0 2px 8px rgba(197, 155, 39, 0.3)" : "none",
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
        @media (max-width: 768px) {
          .emb-card-hover-actions {
            opacity: 1 !important;
            transform: translate(-50%, -50%) scale(0.92) !important;
            pointer-events: auto !important;
          }
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
                    <button onClick={fetchAll} style={{ background: "rgb(197, 155, 39)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 999, cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 12px rgba(197, 155, 39, 0.28)" }}>Retry</button>
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
                    <button onClick={clearAllFilters} style={{ marginTop: 8, background: "rgb(197, 155, 39)", color: "#fff", border: "none", padding: "9px 24px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(197, 155, 39, 0.28)" }}>
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
