// src/pages/other/ProductView.js
import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { normalizeCartProduct } from "../../utils/shopActions";
import { isLoggedIn } from "../../utils/Auth";
import Swal from 'sweetalert2';

import LayoutOne from "../../layouts/LayoutOne";
import { getProductById, getImageUrl, getAllProducts, getAllReviews, canReview, addReview } from "../../api";
import ProductImageViewer from "./ProductImageViewer";
import { ProductCard } from "./ShopGridStandard";

// ── BRAND COLORS ──────────────────────────────────────────────────────────────
const CART_BG       = "linear-gradient(135deg, #C59B27 0%, #E5C365 55%, #CFA23A 100%)";
const CART_BG_HOVER = "linear-gradient(135deg, #B88E20 0%, #DFBA58 52%, #C49727 100%)";
const CART_BG_ADDED = "#2E7D32";
const DARK          = "#720E1E";
const GOLD          = "#C59B27";
const BUY_NOW_BG    = "linear-gradient(135deg, #C59B27 0%, #E5C365 55%, #CFA23A 100%)";
const BUY_NOW_HOVER = "linear-gradient(135deg, #B88E20 0%, #DFBA58 52%, #C49727 100%)";
const CUR           = { symbol: "Rs. ", rate: 1 };

const getLoggedInUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch { return null; }
};

const normalize = (p) => {
  // Some database drivers serialize JSON columns in API responses.
  const variants = (Array.isArray(p.Variants) ? p.Variants : []).map(variant => {
    let attributes = variant.attributes;
    if (typeof attributes === 'string') {
      try { attributes = JSON.parse(attributes); } catch { attributes = {}; }
    }
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) attributes = {};
    return { ...variant, attributes };
  });
  p = { ...p, Variants: variants };
  const parseJsonFallback = (val) => {
    if (!val) return [];
    if (typeof val === "string") {
      try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  };

  return {
    id:               String(p.id),
    name:             p.productName,
    sku:              p.sku || '',
    price:            parseFloat(p.mrp || 0),
    salesPrice:       parseFloat(p.salesPrice ?? 0),
    discount:
      p.mrp && p.salesPrice && parseFloat(p.mrp) > parseFloat(p.salesPrice)
        ? Math.round(((parseFloat(p.mrp) - parseFloat(p.salesPrice)) / parseFloat(p.mrp)) * 100)
        : 0,
    rating:    Number(p.rating) || 0,
    stock:     Number(p.stock || 0),
    image:     p.image ? getImageUrl(p.image) : null,
    images:    p.Images?.map((img) => getImageUrl(img.url || img)) || [],
    shortDescription: p.shortDescription || "",
    longDescription:  p.longDescription  || "",
    brand:       p.Brand?.brandName     || p.brand       || "",
    category:    p.Category?.name       || p.category    || "",
    categoryId:  p.Category?.id         || p.categoryId  || null,
    subCategory: p.SubCategory?.name    || p.subCategory || "",
    subCategoryId:p.SubCategory?.id     || p.subCategoryId || null,
    isNewArrival: p.isNewArrival,
    isHotDeal:    p.isHotDeal,
    colors:       parseJsonFallback(p.colors),
    sizes:        parseJsonFallback(p.sizes),
    fabrics:      parseJsonFallback(p.fabrics),
    weights:      parseJsonFallback(p.weights),
    volumes:      parseJsonFallback(p.volumes),
    nos:          parseJsonFallback(p.nos),
    ages:         parseJsonFallback(p.ages),
    metres:       parseJsonFallback(p.metres),
    variants:      Array.isArray(p.Variants) ? p.Variants.filter(variant => variant.isActive !== false).sort((a, b) => a.id - b.id).map(variant => ({ ...variant, image: variant.image ? getImageUrl(variant.image) : null })) : [],
    hasVariantRecords: Array.isArray(p.Variants) && p.Variants.length > 0,
    variantOptions: (() => {
      const activeVariants = Array.isArray(p.Variants) ? p.Variants.filter(variant => variant.isActive !== false) : [];
      const groups = new Map();
      const addValue = (name, value) => {
        if (value == null || !String(value).trim()) return;
        const key = name.trim().toLowerCase();
        if (!key || key === 'default') return;
        if (!groups.has(key)) groups.set(key, { name: name.trim(), key, values: [] });
        const group = groups.get(key);
        if (!group.values.some(item => String(item).toLowerCase() === String(value).toLowerCase())) group.values.push(String(value));
      };
      activeVariants.forEach(variant => Object.entries(variant.attributes || {}).forEach(([name, value]) => addValue(name, value)));
      [[ 'Color', p.colors ], [ 'Size', p.sizes ], [ 'Age', p.ages ], [ 'Metre', p.metres ], [ 'Fabric', p.fabrics ], [ 'Weight', p.weights ], [ 'Volume', p.volumes ], [ 'Number of Pieces', p.nos ]].forEach(([name, values]) => parseJsonFallback(values).forEach(value => addValue(name, value)));
      return [...groups.values()];
    })(),
  };
};

const Breadcrumb = ({ category, name }) => {
  const navigate = useNavigate();
  const crumbs = [
    { label: "Home",  path: "/" },
    { label: "Shop",  path: "/shop" },
    category ? { label: category, path: `/shop?category=${encodeURIComponent(category)}` } : null,
    { label: name, path: null },
  ].filter(Boolean);

  return (
    <nav style={{ fontSize: 12, color: "#999", marginBottom: 28, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {i > 0 && <span style={{ color: "#ccc" }}>/</span>}
          {c.path ? (
            <button onClick={() => navigate(c.path)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 12, padding: 0 }}>
              {c.label}
            </button>
          ) : (
            <span style={{ color: DARK, fontWeight: 600 }}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

const ImageSelector = ({ gallery, originalImage, activeImage, onSelect }) => {
  if (!gallery || gallery.length <= 1) return null;

  return (
    <div
      className="pv-thumbnails-left"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxHeight: 560,
        overflowY: "auto",
        paddingRight: 4,
        flexShrink: 0,
        scrollbarWidth: "none",
      }}
    >
      {gallery.map((src, i) => {
        const isOriginal = src === originalImage;
        const isActive   = src === activeImage;
        return (
          <div
            key={i}
            onClick={() => onSelect(src)}
            onMouseEnter={() => onSelect(src)}
            title={isOriginal ? "Model Image" : `Image ${i + 1}`}
            style={{
              position: "relative",
              width: 68,
              height: 68,
              borderRadius: 10,
              overflow: "hidden",
              border: isActive
                ? `2px solid ${GOLD}`
                : "1.5px solid #E7DFD2",
              cursor: "pointer",
              background: "#f9f6f2",
              flexShrink: 0,
              transition: "all .2s ease",
              boxShadow: isActive
                ? "0 4px 12px rgba(197, 155, 39, 0.35)"
                : "none",
              transform: isActive ? "scale(1.04)" : "scale(1)",
            }}
          >
            <img
              src={src}
              alt={isOriginal ? "Model image" : `Product image ${i + 1}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />

            {isActive && (
              <div style={{
                position: "absolute", top: 4, right: 4,
                width: 16, height: 16, borderRadius: "50%",
                background: GOLD, display: "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}>
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.8 7L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}

            {isOriginal && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: isActive
                  ? "rgba(114, 14, 30, 0.88)"
                  : "rgba(0,0,0,0.48)",
                color: "#fff",
                fontSize: 8, fontWeight: 700,
                textAlign: "center", padding: "2px 0",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}>
                Model
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const QtySelector = ({ qty, setQty, max }) => (
  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 6, overflow: "hidden", width: "fit-content" }}>
    <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 36, height: 40, border: "none", background: "#f5f5f5", cursor: "pointer", fontSize: 18, color: DARK }}>−</button>
    <span style={{ minWidth: 44, textAlign: "center", fontSize: 15, fontWeight: 600, color: DARK }}>{qty}</span>
    <button onClick={() => setQty((q) => Math.min(max || 99, q + 1))} style={{ width: 36, height: 40, border: "none", background: "#f5f5f5", cursor: "pointer", fontSize: 18, color: DARK }}>+</button>
  </div>
);

const AttributesSelector = ({ product, selections, onSelect, isDisabled }) => {
  const renderGroup = (title, attrName, list) => {
    if (!list || list.length === 0) return null;
    return (
      <div key={attrName} style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#777", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          {title}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {list.map((val) => {
            const isSelected = selections[attrName] === String(val);
            const disabled   = isDisabled(attrName, val);
            return (
              <button
                key={val}
                aria-pressed={isSelected}
                onClick={() => !disabled && onSelect(attrName, isSelected ? '' : String(val))}
                style={{
                  padding: "7px 18px", fontSize: 13, borderRadius: 4,
                  cursor: disabled ? "not-allowed" : "pointer",
                  border: isSelected ? `2px solid ${CART_BG}` : disabled ? "2px dashed #eee" : "2px solid #ddd",
                  background: isSelected ? "#fdf0f8" : disabled ? "#fafafa" : "#fff",
                  color: isSelected ? CART_BG : disabled ? "#ccc" : "#444",
                  fontWeight: isSelected ? 700 : 400,
                  opacity: disabled ? 0.6 : 1,
                  transition: "all .22s cubic-bezier(.2,.75,.25,1)",
                  transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                  boxShadow: isSelected ? "0 3px 10px rgba(26,16,64,.12)" : "none",
                }}
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {(product.variantOptions || []).map(group => renderGroup(group.name, group.key, group.values))}
    </div>
  );
};

const StarPicker = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star} type="button" onClick={() => onChange(star)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 26, color: star <= value ? GOLD : "#ddd", padding: "0 2px", lineHeight: 1, transition: "color .15s" }}
      >★</button>
    ))}
  </div>
);

const DescriptionAndReviews = ({ product, onReviewSummary }) => {
  const [tab,      setTab]      = useState("description");
  const [reviews,  setReviews]  = useState([]);
  const [loadingR, setLoadingR] = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");
  const [canReviewState,           setCanReviewState]           = useState(false);
  const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState("");
  const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(true);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingR(true);
      try {
        const res = await getAllReviews();
        const all = res.data || [];
        const productReviews = all.filter(
          (r) => String(r.productId || r.product_id || r.ProductId) === String(product.id)
        );
        setReviews(productReviews);
        const ratings = productReviews.map(review => Number(review.rating)).filter(rating => Number.isFinite(rating) && rating >= 1 && rating <= 5);
        onReviewSummary({ productId: product.id, count: ratings.length, rating: ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0 });
        const user = getLoggedInUser();
        if (user?.id) {
          const userReview = productReviews.find(
            (r) => String(r.customerId || r.customer_id || r.userId) === String(user.id)
          );
          setUserHasReviewed(!!userReview);
        }
      } catch (e) {
        console.error("Reviews fetch error:", e);
      } finally {
        setLoadingR(false);
      }
    };
    load();
  }, [product.id]);

  useEffect(() => {
    const loadEligibility = async () => {
      const user = getLoggedInUser();
      if (!user?.id) {
        setCanReviewState(false);
        setReviewEligibilityMessage("Please log in to write a review.");
        setReviewEligibilityLoading(false);
        return;
      }
      if (!product?.id) return;
      setReviewEligibilityLoading(true);
      try {
        const res = await canReview({ customerId: user.id, productId: product.id });
        const { canReview: allowed, message } = res.data || {};
        if (allowed) {
          setCanReviewState(true);
          setAlreadyReviewed(false);
          setReviewEligibilityMessage("");
        } else {
          setCanReviewState(false);
          const msg = message || "";
          const isAlready = msg.toLowerCase().includes("already") || msg.toLowerCase().includes("already reviewed");
          if (isAlready && !userHasReviewed) {
            setAlreadyReviewed(true);
          } else {
            setAlreadyReviewed(false);
          }
          setReviewEligibilityMessage(msg);
        }
      } catch (err) {
        console.error("Review eligibility error:", err);
        setCanReviewState(false);
        setReviewEligibilityMessage("Unable to verify review eligibility at this time.");
      } finally {
        setReviewEligibilityLoading(false);
      }
    };
    loadEligibility();
  }, [product?.id, userHasReviewed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = getLoggedInUser();
    if (!user?.id) { setSubmitError("Please log in to submit a review."); return; }
    if (!name.trim() || !comment.trim()) { setSubmitError("Please fill in your name and review."); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      await addReview({
        customerId: user.id,
        productId:  Number(product.id),
        rating,
        feedback:   comment.trim(),
        comment:    comment.trim(),
        name:       name.trim(),
        email:      email.trim(),
      });
      setSubmitSuccess(true);
      setCanReviewState(false);
      setAlreadyReviewed(true);
      setName(""); setEmail(""); setRating(5); setComment("");
      Swal.fire({
        title: '✅ Review Submitted!',
        text: 'Your review is pending admin approval and will appear once approved.',
        icon: 'success',
        confirmButtonColor: '#C9933A',
        confirmButtonText: 'Great!',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (e) {
      console.error("Review submit error:", e);
      const errorMessage = e?.response?.data?.error || "Failed to submit review. Please try again.";
      setSubmitError(errorMessage);
      Swal.fire({
        title: '❌ Submission Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#C9933A',
        confirmButtonText: 'OK',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const showPurchaseRequiredAlert = () => {
    Swal.fire({
      title: '🛍️ Purchase Required',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.8;">
          <p style="margin-bottom: 12px; color: #720E1E; font-weight: 600;">
            You can review this product only after it has been delivered.
          </p>
          <div style="background: #f5f0e8; padding: 12px 16px; border-radius: 8px; margin: 12px 0;">
            <p style="margin: 0; font-size: 13px; color: #7a5500;"><strong>📋 Requirements:</strong></p>
            <ul style="margin: 8px 0 0 20px; color: #666; font-size: 13px;">
              <li>You must have purchased this product</li>
              <li>Your order must be in "Delivered" status</li>
              <li>You can only review products you've actually received</li>
            </ul>
          </div>
          <p style="margin-top: 12px; font-size: 13px; color: #888; font-style: italic;">
            💡 Once your order is delivered, you'll be able to share your experience!
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#C9933A',
      confirmButtonText: 'Got it!',
      background: '#fff',
      color: '#720E1E',
      iconColor: '#C9933A',
      width: '500px',
    });
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  const inputStyle = {
    width: "100%", border: "1px solid #e0e0e0", borderRadius: 6,
    padding: "10px 14px", fontSize: 14, color: "#333",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    background: "#fafafa",
  };

  const tabBtn = (key, label) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: "10px 24px", fontSize: 14, fontWeight: 600, border: "none",
        borderBottom: tab === key ? `2px solid ${CART_BG}` : "2px solid transparent",
        background: "none", color: tab === key ? CART_BG : "#888",
        cursor: "pointer", marginBottom: -1, transition: "color .2s",
      }}
    >
      {label}{key === "reviews" && reviews.length > 0 ? ` (${reviews.length})` : ""}
    </button>
  );

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: 28 }}>
        {tabBtn("description", "Description")}
        {tabBtn("reviews", "Reviews")}
      </div>

      {tab === "description" && (
        <div style={{ fontSize: 14, color: "#555", lineHeight: 1.9, maxWidth: 680 }}>
          {product.longDescription || product.shortDescription || "No description available."}
        </div>
      )}

      {tab === "reviews" && (
        <div>
          {avg && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "14px 18px", background: "#fdf8ff", borderRadius: 10, border: "1px solid #f0e0f5" }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: DARK }}>{avg}</span>
              <div>
                <div style={{ color: GOLD, fontSize: 18, letterSpacing: 2 }}>
                  {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                </div>
                <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {loadingR ? (
            <p style={{ color: "#bbb", fontSize: 14, marginBottom: 24 }}>Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <div style={{ background: "#fafafa", borderRadius: 10, padding: "24px", textAlign: "center", color: "#ccc", border: "1px dashed #eee", marginBottom: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>💬</div>
              <p style={{ fontSize: 13 }}>No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #f5f0f8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: DARK, margin: "0 0 3px" }}>
                        {r.name || r.customerName || "Anonymous"}
                      </p>
                      <span style={{ color: GOLD, fontSize: 13 }}>
                        {"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}
                      </span>
                    </div>
                    {(r.createdAt || r.date) && (
                      <span style={{ fontSize: 11, color: "#ccc" }}>
                        {new Date(r.createdAt || r.date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>
                    {r.comment || r.review || r.body || ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 18px" }}>Write a Review</h3>

            {submitSuccess && (
              <div style={{ background: "#f0faf4", borderRadius: 10, padding: "18px 20px", border: "1px solid #b7e4c7", maxWidth: 560, display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#1a6b38" }}>Review submitted successfully!</p>
                </div>
              </div>
            )}

            {!submitSuccess && reviewEligibilityLoading && (
              <p style={{ color: "#999", fontSize: 14 }}>Checking review eligibility…</p>
            )}

            {!submitSuccess && !reviewEligibilityLoading && alreadyReviewed && !userHasReviewed && (
              <div style={{ background: "#f5f8ff", borderRadius: 10, padding: "18px 20px", border: "1px solid #c5d5f5", maxWidth: 560, display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 22 }}>📝</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#1a3a8b" }}>You've already reviewed this product</p>
                </div>
              </div>
            )}

            {!submitSuccess && !reviewEligibilityLoading && userHasReviewed && (
              <div style={{ background: "#e8f5e9", borderRadius: 10, padding: "18px 20px", border: "1px solid #a5d6a7", maxWidth: 560, display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 22 }}>⭐</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#2e7d32" }}>You've reviewed this product</p>
                </div>
              </div>
            )}

            {!submitSuccess && !reviewEligibilityLoading && !alreadyReviewed && !canReviewState && !userHasReviewed && reviewEligibilityMessage && (
              <div
                onClick={showPurchaseRequiredAlert}
                style={{ background: "#fffbf0", borderRadius: 10, padding: "18px 20px", border: "1px solid #f5dfa0", maxWidth: 560, display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fff5e6"; e.currentTarget.style.borderColor = "#e5c87a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fffbf0"; e.currentTarget.style.borderColor = "#f5dfa0"; }}
              >
                <span style={{ fontSize: 22 }}>🛍️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#7a5500" }}>
                    Purchase required to review
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#c99700", fontWeight: 400 }}>(click for details)</span>
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "#9a6f00", lineHeight: 1.7 }}>{reviewEligibilityMessage}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#c99700", fontWeight: 500 }}>👆 Click here for more information</p>
                </div>
                <span style={{ fontSize: 18, color: "#c99700" }}>→</span>
              </div>
            )}

            {!submitSuccess && !reviewEligibilityLoading && canReviewState && (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 560 }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Your Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya S." style={inputStyle} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Email (optional)</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Your Rating *</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 6 }}>Your Review *</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this product…" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                {submitError && <p style={{ fontSize: 13, color: "#e74c3c", margin: 0 }}>{submitError}</p>}
                <button
                  type="submit" disabled={submitting}
                  style={{ alignSelf: "flex-start", padding: "11px 32px", background: submitting ? "#ccc" : CART_BG, color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", letterSpacing: "0.5px", transition: "background 0.2s" }}
                >
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ProductView = ({ shop }) => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [reviewSummary, setReviewSummary] = useState(null);
  const [product,        setProduct]        = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);
  const [activeImage,    setActiveImage]    = useState(null);
  const [originalImage,  setOriginalImage]  = useState(null);
  const [isMainImageHovered, setIsMainImageHovered] = useState(false);
  const [isZoomOpen,     setIsZoomOpen]     = useState(false);
  const [qty,            setQty]            = useState(1);
  const [cartBtnHovered, setCartBtnHovered] = useState(false);
  const [buyNowHovered,  setBuyNowHovered]  = useState(false);
  const [addedFeedback,  setAddedFeedback]  = useState(false);

  const [selectedColor,  setSelectedColor]  = useState("");
  const [selectedSize,   setSelectedSize]   = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedVolume, setSelectedVolume] = useState("");
  const [selectedNos,    setSelectedNos]    = useState("");
  const [selectedAge,    setSelectedAge]    = useState("");
  const [selectedMetre,  setSelectedMetre]  = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedCustomOptions, setSelectedCustomOptions] = useState({});

  const { cartItems = [], wishlistItems = [], addToCart, addToWishlist, deleteFromWishlist, onNotLoggedIn } = shop;
  const recommendationsRef = useRef(null);

  const scrollRecommendations = (direction) => {
    recommendationsRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  };

  const gallery = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([selectedVariant?.image, product.image, ...(product.images || [])].filter(Boolean)));
  }, [product, selectedVariant]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(false);
      try {
        const res  = await getProductById(id);
        const raw  = res.data;
        if (!raw) { setError(true); setLoading(false); return; }
        const normalized = normalize(raw);
        setProduct(normalized);
        setSelectedColor(""); setSelectedSize(""); setSelectedFabric(""); setSelectedWeight("");
        setSelectedVolume(""); setSelectedNos(""); setSelectedAge(""); setSelectedMetre(""); setSelectedVariant(null);
        setSelectedCustomOptions({});
        setRelatedProducts([]);
        if (normalized.categoryId) {
          try {
            const productsRes = await getAllProducts();
            const related = (productsRes.data || [])
              .filter((item) => String(item.Category?.id ?? item.categoryId ?? "") === String(normalized.categoryId)
                && String(item.id) !== String(normalized.id))
              .map((item) => ({
                id: String(item.id),
                name: item.productName || item.name || "",
                mrp: Number(item.mrp || 0),
                salesPrice: Number(item.salesPrice ?? item.mrp ?? 0),
                discountedPrice: Number(item.salesPrice ?? item.mrp ?? 0) < Number(item.mrp || 0)
                  ? Number(item.salesPrice) : null,
                discountPercent: Number(item.mrp || 0) > Number(item.salesPrice ?? item.mrp ?? 0)
                  ? Math.round(((Number(item.mrp) - Number(item.salesPrice)) / Number(item.mrp)) * 100) : 0,
                rating: Number(item.rating) || 0,
                stock: Number(item.stock || 0),
                image: item.image ? getImageUrl(item.image) : null,
                shortDescription: item.shortDescription || "",
                category: item.Category?.name || normalized.category,
                categoryId: item.Category?.id ?? item.categoryId ?? null,
                subCategory: item.SubCategory?.name || "",
                brand: item.Brand?.brandName || "",
                isNewArrival: item.isNewArrival,
                isHotDeal: item.isHotDeal,
              }));
            setRelatedProducts(related);
          } catch (relatedError) {
            console.error("Related products fetch error:", relatedError);
          }
        }
        const galleryList = Array.from(new Set([normalized.image, ...(normalized.images || [])].filter(Boolean)));
        const firstImage  = normalized.variants[0]?.image || galleryList[0] || null;
        setActiveImage(firstImage);
        setOriginalImage(firstImage);
      } catch (err) {
        console.error("ProductView fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, location.state?.product]);

  const applyVariant = (variant, fallbackOptions = []) => {
    const defaults = variant
      ? Object.fromEntries(Object.entries(variant.attributes || {}).filter(([key]) => key.toLowerCase() !== 'default').map(([key, value]) => [key.toLowerCase(), String(value)]))
      : {};
    setSelectedColor(defaults.color || ''); setSelectedSize(defaults.size || '');
    setSelectedAge(defaults.age || ''); setSelectedMetre(defaults.metre || '');
    setSelectedFabric(defaults.fabric || ''); setSelectedWeight(defaults.weight || '');
    setSelectedVolume(defaults.volume || ''); setSelectedNos(defaults.nos || '');
    setSelectedCustomOptions(Object.fromEntries(Object.entries(defaults).filter(([key]) => !['color', 'size', 'age', 'metre', 'fabric', 'weight', 'volume', 'nos'].includes(key))));
    setSelectedVariant(variant || null);
    setQty(1);
  };

  useEffect(() => {
    applyVariant(product?.variants?.[0], product?.hasVariantRecords ? [] : product?.variantOptions || []);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const image = selectedVariant?.image || product.image || product.images?.[0] || null;
    setActiveImage(image);
    setOriginalImage(image);
  }, [product, selectedVariant]);

  useEffect(() => {
    if (selectedVariant?.image || !gallery || gallery.length <= 1 || isMainImageHovered || isZoomOpen) return;

    const timer = setInterval(() => {
      setActiveImage((prevImage) => {
        const currentIndex = gallery.indexOf(prevImage);
        const nextIndex = currentIndex === -1 || currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
        return gallery[nextIndex];
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [gallery, isMainImageHovered, isZoomOpen, selectedVariant]);

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (!gallery || gallery.length <= 1) return;
    const currentIndex = gallery.indexOf(activeImage);
    const nextIndex = currentIndex === -1 || currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
    setActiveImage(gallery[nextIndex]);
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (!gallery || gallery.length <= 1) return;
    const currentIndex = gallery.indexOf(activeImage);
    const prevIndex = currentIndex <= 0 ? gallery.length - 1 : currentIndex - 1;
    setActiveImage(gallery[prevIndex]);
  };

  if (loading) {
    return (
      <LayoutOne shop={shop} headerTop="visible">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#bbb" }}>
          <div style={{ width: 48, height: 48, border: `4px solid #f0e0f0`, borderTop: `4px solid ${CART_BG}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14 }}>Loading product…</p>
        </div>
      </LayoutOne>
    );
  }

  if (error || !product) {
    return (
      <LayoutOne shop={shop} headerTop="visible">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
          <p style={{ fontSize: 16, marginBottom: 20 }}>Product not found.</p>
          <button onClick={() => navigate("/shop")} style={{ padding: "11px 28px", background: "rgb(197, 155, 39)", color: "#fff", border: "none", borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(197,155,39,0.28)" }}>Back to Shop</button>
        </div>
      </LayoutOne>
    );
  }

  const currentSelection = {
    color: selectedColor, size: selectedSize, fabric: selectedFabric,
    weight: selectedWeight, volume: selectedVolume, nos: selectedNos,
    age: selectedAge, metre: selectedMetre,
    ...selectedCustomOptions,
  };

  const variantOptions = product.variantOptions || [];
  const normalizeOptionValue = value => String(value ?? '' ).trim().toLowerCase();
  const selectedVariantRecord = product.variants.find(variant => Object.entries(variant.attributes || {}).filter(([name]) => name.toLowerCase() !== 'default').every(([name, value]) => normalizeOptionValue(currentSelection[name.toLowerCase()]) === normalizeOptionValue(value))) || null;
  const effectiveVariant = selectedVariantRecord || selectedVariant;
  const variantNeedsSelection = product.hasVariantRecords && variantOptions.some(group => group.values.length > 1 && !currentSelection[group.key]);
  const isOptionDisabled = (attrName, val) => product.hasVariantRecords && !product.variants.some(variant =>
    normalizeOptionValue(Object.entries(variant.attributes || {}).find(([name]) => name.toLowerCase() === attrName)?.[1]) === normalizeOptionValue(val)
  );

  const handleOptionSelect = (attrName, val) => {
    if (product.variants.length) {
      const name = variantOptions.find(group => group.key === attrName)?.name;
      if (!val) {
        const first = product.variants.find(variant => Object.keys(variant.attributes || {}).every(key => key.toLowerCase() === 'default'));
        applyVariant(first || null, variantOptions);
        return;
      }
      const candidates = product.variants.filter(variant => normalizeOptionValue(Object.entries(variant.attributes || {}).find(([key]) => key.toLowerCase() === attrName)?.[1]) === normalizeOptionValue(val));
      const match = candidates.find(variant => Object.entries(variant.attributes || {}).filter(([key]) => key.toLowerCase() !== 'default').every(([key, value]) => key.toLowerCase() === attrName || currentSelection[key.toLowerCase()] === String(value))) || candidates[0];
      if (match) applyVariant(match);
      return;
    }
    if (attrName === "color")  setSelectedColor(val);
    if (attrName === "size")   setSelectedSize(val);
    if (attrName === "fabric") setSelectedFabric(val);
    if (attrName === "weight") setSelectedWeight(val);
    if (attrName === "volume") setSelectedVolume(val);
    if (attrName === "nos")    setSelectedNos(val);
    if (attrName === "age")    setSelectedAge(val);
    if (attrName === "metre")  setSelectedMetre(val);
    if (!['color', 'size', 'fabric', 'weight', 'volume', 'nos', 'age', 'metre'].includes(attrName)) {
      setSelectedCustomOptions(current => ({ ...current, [attrName]: val }));
    }

  };

  const handleAddToCart = async () => {
    if (variantNeedsSelection || (product.hasVariantRecords && !effectiveVariant)) return;
    if (outOfStock) return;
    if (!isLoggedIn()) { onNotLoggedIn?.("cart", { ...product, selectedVariant: effectiveVariant, quantity: qty }); return; }
    const added = await addToCart({ ...product, selectedVariant: effectiveVariant, ...(effectiveVariant ? { image: effectiveVariant.image || product.image, salesPrice: effectiveVariant.salesPrice ?? product.salesPrice, price: effectiveVariant.mrp ?? product.price, stock: effectiveVariant.stock, weight: Object.entries(effectiveVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ') } : {}), quantity: qty });
    if (added) { setAddedFeedback(true); setTimeout(() => setAddedFeedback(false), 2200); }
  };

  const handleBuyNow = async () => {
    if (variantNeedsSelection || (product.hasVariantRecords && !effectiveVariant)) return;
    if (outOfStock) return;
    if (!isLoggedIn()) { onNotLoggedIn?.("cart", { ...product, selectedVariant: effectiveVariant, quantity: qty }); return; }
    const item = normalizeCartProduct({ ...product, ...(effectiveVariant ? {
      selectedVariant: effectiveVariant,
      image: effectiveVariant.image || product.image,
      salesPrice: effectiveVariant.salesPrice ?? product.salesPrice,
      stock: effectiveVariant.stock,
      weight: Object.entries(effectiveVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', '),
    } : {}), quantity: qty });
    navigate("/checkout", { state: { buyNowItem: item } });
  };

  const handleWishlistToggle = () => {
    if (!isLoggedIn()) { onNotLoggedIn?.("wishlist", product); return; }
    if (inWishlist) {
      const wItem = wishlistItems.find((w) => String(w.productId ?? w.id) === String(product.id) && String(w.variantId || '') === String(effectiveVariant?.id || ''));
      if (wItem) deleteFromWishlist(wItem.id);
    } else {
      addToWishlist({ ...product, selectedVariant: effectiveVariant, ...(effectiveVariant ? { image: effectiveVariant.image || product.image, salesPrice: effectiveVariant.salesPrice ?? product.salesPrice, stock: effectiveVariant.stock, weight: Object.entries(effectiveVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ') } : {}) });
    }
  };

  const handleWhatsAppShare = () => {
    const productCode = effectiveVariant?.sku || product.sku;
    const shareText = [
      `Check out this ${product.name} on Vika Vasthra.`,
      `Product code (SKU): ${productCode || "Not available"}`,
      `Product link: ${window.location.href}`,
    ].filter(Boolean).join("\n");
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleEnquireNow = () => {
    const imageUrl = activeImage || product.image || "";
    const productCode = effectiveVariant?.sku || product.sku;
    const message = [
      `Hi, I'm interested in ${product.name}.`,
      `Product code (SKU): ${productCode || "Not available"}`,
      `Product link: ${window.location.href}`,
    ].filter(Boolean).join("\n");
    const whatsappUrl = `https://wa.me/919482944552?text=${encodeURIComponent(message)}`;
    // Open both tabs directly from the click so browsers allow the popups.
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (imageUrl) window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  const productMrp      = parseFloat(product.price || product.mrp || 0);
  const productSales    = parseFloat(product.salesPrice || product.price || product.mrp || 0);
  const currentStock = effectiveVariant ? Number(effectiveVariant.stock || 0) : product.stock;
  const displayedMrp = effectiveVariant?.mrp != null ? Number(effectiveVariant.mrp) : productMrp;
  const displayedSales = effectiveVariant?.salesPrice != null ? Number(effectiveVariant.salesPrice) : productSales;
  const displayedDiscount = displayedMrp > displayedSales ? Math.round(((displayedMrp - displayedSales) / displayedMrp) * 100) : 0;
  const finalMrp = (displayedMrp * CUR.rate).toFixed(2);
  const finalSales = displayedDiscount > 0 ? (displayedSales * CUR.rate).toFixed(2) : null;
  const outOfStock   = currentStock === 0 || (product.hasVariantRecords && product.variants.length === 0);
  const inCart     = cartItems.some((c) => String(c.productId ?? c.id) === product.id && String(c.variantId || '') === String(effectiveVariant?.id || ''));
  const inWishlist = wishlistItems.some((w) => String(w.productId ?? w.id) === String(product.id) && String(w.variantId || '') === String(effectiveVariant?.id || ''));
  const cartBg   = (inCart || addedFeedback) ? CART_BG_ADDED : cartBtnHovered ? CART_BG_HOVER : CART_BG;
  const buyNowBg = buyNowHovered ? BUY_NOW_HOVER : BUY_NOW_BG;

  return (
    <Fragment>
      <LayoutOne shop={shop} headerTop="visible">
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "44px 20px 90px" }}>
          <Breadcrumb category={product.category} name={product.name} />

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 52 }}>

            {/* Gallery Wrapper: Left Thumbnails + Main Arch Product Image */}
            <div className="pv-gallery-wrap" style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: "0 0 auto", maxWidth: "100%" }}>
              {gallery.length > 1 && (
                <ImageSelector gallery={gallery} originalImage={originalImage} activeImage={activeImage} onSelect={setActiveImage} />
              )}

              <div style={{ width: 420, maxWidth: "100%", flexShrink: 0 }}>
                {/* Signature Arch Card Frame */}
              <div
                onMouseEnter={() => setIsMainImageHovered(true)}
                onMouseLeave={() => setIsMainImageHovered(false)}
                style={{
                  padding: 6,
                  border: `1.5px solid ${isMainImageHovered ? DARK : GOLD}`,
                  borderRadius: "999px 999px 0 0",
                  transition: "border-color .25s ease, box-shadow .25s ease",
                  boxShadow: isMainImageHovered ? "0 10px 32px rgba(114, 14, 30, 0.14)" : "0 6px 28px rgba(0,0,0,0.08)",
                  background: "#fff",
                }}
              >
                {/* Arch Inner Container */}
                <div
                  onClick={() => setIsZoomOpen(true)}
                  style={{
                    background: "#efe6e2",
                    borderRadius: "999px 999px 0 0",
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "3/4",
                    width: "100%",
                    cursor: "zoom-in",
                  }}
                >
                  {activeImage ? (
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt={product.name}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transform: isMainImageHovered ? "scale(1.05)" : "scale(1)",
                        transition: "transform 0.5s ease",
                        animation: "fadeInImage 0.4s ease-in-out"
                      }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#ddd", fontSize: 56 }}>🖼️</div>
                  )}

                  {/* Expand / Zoom Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomOpen(true);
                    }}
                    title="View larger image"
                    aria-label="View larger image"
                    style={{
                      position: "absolute",
                      top: "14%",
                      right: "7%",
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.94)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      border: `1.5px solid ${GOLD}`,
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 4,
                      color: DARK,
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.transform = "scale(1.08)";
                      e.currentTarget.style.borderColor = DARK;
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.94)";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.borderColor = GOLD;
                      e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.14)";
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>

                  {/* Ribbon Badges (bottom left) */}
                  <div style={{ position: "absolute", left: 0, bottom: 14, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
                    {displayedDiscount > 0 && (
                      <span
                        style={{
                          background: DARK,
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "5px 14px 5px 10px",
                          borderRadius: "0 999px 999px 0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {displayedDiscount}% OFF
                      </span>
                    )}
                    {product.isHotDeal && (
                      <span
                        style={{
                          background: "#e74c3c",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 12px 4px 10px",
                          borderRadius: "0 999px 999px 0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        }}
                      >
                        🔥 HOT
                      </span>
                    )}
                    {outOfStock && (
                      <span
                        style={{
                          background: "#555",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 12px 4px 10px",
                          borderRadius: "0 999px 999px 0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                        }}
                      >
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        aria-label="Previous image"
                        style={{
                          position: "absolute",
                          top: "52%",
                          left: 10,
                          transform: "translateY(-50%)",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "1px solid rgba(197, 155, 39, 0.35)",
                          color: DARK,
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          opacity: isMainImageHovered ? 1 : 0,
                          transition: "opacity 0.25s ease, background 0.2s ease, transform 0.2s ease",
                          zIndex: 3,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={handleNextImage}
                        aria-label="Next image"
                        style={{
                          position: "absolute",
                          top: "52%",
                          right: 10,
                          transform: "translateY(-50%)",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.9)",
                          border: "1px solid rgba(197, 155, 39, 0.35)",
                          color: DARK,
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          opacity: isMainImageHovered ? 1 : 0,
                          transition: "opacity 0.25s ease, background 0.2s ease, transform 0.2s ease",
                          zIndex: 3,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
                      >
                        ›
                      </button>

                      <div style={{
                        position: "absolute",
                        bottom: 14,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 6,
                        background: "rgba(0, 0, 0, 0.38)",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                        padding: "5px 10px",
                        borderRadius: 12,
                        zIndex: 3
                      }}>
                        {gallery.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}
                            style={{
                              width: img === activeImage ? 16 : 6,
                              height: 6,
                              borderRadius: 3,
                              background: img === activeImage ? "#fff" : "rgba(255, 255, 255, 0.5)",
                              cursor: "pointer",
                              transition: "all 0.3s ease"
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <style>{`
                @keyframes fadeInImage {
                  from { opacity: 0.7; }
                  to { opacity: 1; }
                }
                .pv-thumbnails-left::-webkit-scrollbar {
                  display: none;
                }
                @media (max-width: 768px) {
                  .pv-gallery-wrap {
                    flex-direction: column-reverse !important;
                    width: 100% !important;
                  }
                  .pv-gallery-wrap > div:last-child {
                    width: 100% !important;
                  }
                  .pv-thumbnails-left {
                    flex-direction: row !important;
                    max-height: none !important;
                    width: 100% !important;
                    overflow-x: auto !important;
                    padding-bottom: 6px !important;
                  }
                }
              `}</style>
            </div>
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              {product.brand && (
                <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{product.brand}</p>
              )}
              <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, lineHeight: 1.35, margin: "0 0 12px" }}>{product.name}</h1>
              {product.sku && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '6px 11px', borderRadius: 999, border: '1px solid #E7E1D5', background: '#F8F6F2', color: DARK, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', maxWidth: '100%' }}><span style={{ color: '#9A835D', fontSize: 10 }}>PRODUCT CODE</span><span style={{ overflowWrap: 'anywhere' }}>{product.sku}</span></div>}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                {reviewSummary?.productId === product.id && reviewSummary.count > 0 && <>
                  <span style={{ color: GOLD, fontSize: 15, letterSpacing: 1 }}>{"\u2605".repeat(Math.round(reviewSummary.rating))}{"\u2606".repeat(5 - Math.round(reviewSummary.rating))}</span>
                  <span style={{ fontSize: 12, color: "#888" }}>({reviewSummary.rating.toFixed(1)} / 5 � {reviewSummary.count} {reviewSummary.count === 1 ? 'review' : 'reviews'})</span>
                </>}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {finalSales ? (
                  <>
                    <span style={{ fontSize: 26, fontWeight: 800, color: CART_BG }}>{CUR.symbol}{finalSales}</span>
                    <span style={{ fontSize: 16, color: "#bbb", textDecoration: "line-through" }}>{CUR.symbol}{finalMrp}</span>
                    <span style={{ fontSize: 12, background: "#fdf0f8", color: CART_BG, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>Save {displayedDiscount}%</span>
                  </>
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 800, color: CART_BG }}>{CUR.symbol}{finalMrp}</span>
                )}
              </div>

              {product.shortDescription && (
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75, marginBottom: 24, paddingLeft: 14, borderLeft: `3px solid #f0dded` }}>
                  {product.shortDescription}
                </p>
              )}

              <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "0 0 24px" }} />

              <AttributesSelector product={product} selections={currentSelection} onSelect={handleOptionSelect} isDisabled={isOptionDisabled} />
              {variantNeedsSelection && <p role="status" style={{ margin: '-10px 0 18px', color: '#8a5a12', fontSize: 12 }}>Choose an option combination to see its availability and add it to your cart.</p>}


              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#777", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Qty</p>
                <QtySelector qty={qty} setQty={setQty} max={currentStock} />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button
                  onClick={handleEnquireNow}
                  style={{ flex: 1, minWidth: 150, padding: "14px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", background: "#25D366", color: "#fff", border: "none", borderRadius: 999, cursor: "pointer", transition: "background 0.2s" }}
                >
                  <i className="fa fa-whatsapp" aria-hidden="true" style={{ marginRight: 8 }} />
                  Enquire now
                </button>
                <button
                  onClick={handleAddToCart}
                  onMouseEnter={() => setCartBtnHovered(true)}
                  onMouseLeave={() => setCartBtnHovered(false)}
                  disabled={outOfStock || variantNeedsSelection}
                  style={{ flex: 1, minWidth: 150, padding: "14px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", background: outOfStock ? "#ddd" : cartBg, color: outOfStock ? "#888" : (inCart || addedFeedback) ? "#fff" : "#380710", border: "none", borderRadius: 999, cursor: outOfStock ? "not-allowed" : "pointer", transition: "all 0.25s ease", boxShadow: outOfStock ? "none" : "0 4px 14px rgba(197, 155, 39, 0.35)", textShadow: outOfStock || (inCart || addedFeedback) ? "none" : "0 1px 0 rgba(255, 255, 255, 0.35)" }}
                >
                  {outOfStock ? "Out of Stock" : (inCart || addedFeedback) ? "✓ Added to Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  onMouseEnter={() => setBuyNowHovered(true)}
                  onMouseLeave={() => setBuyNowHovered(false)}
                  disabled={outOfStock || variantNeedsSelection}
                  style={{ flex: 1, minWidth: 150, padding: "14px 20px", fontSize: 13, fontWeight: 700, letterSpacing: "0.5px", background: outOfStock ? "#ddd" : buyNowBg, color: outOfStock ? "#888" : "#380710", border: "none", borderRadius: 999, cursor: outOfStock ? "not-allowed" : "pointer", transition: "all 0.25s ease", boxShadow: outOfStock ? "none" : "0 4px 14px rgba(197, 155, 39, 0.35)", textShadow: outOfStock ? "none" : "0 1px 0 rgba(255, 255, 255, 0.35)" }}
                >
                  ⚡ Buy Now
                </button>

                <button
                  onClick={handleWishlistToggle}
                  title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  style={{ width: 50, height: 50, border: `1px solid ${inWishlist ? "#e74c3c" : "#e0e0e0"}`, borderRadius: "50%", background: inWishlist ? "#e74c3c" : "#fff", color: inWishlist ? "#fff" : "#888", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}
                >
                  {inWishlist ? "♥" : "♡"}
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  title="Share on WhatsApp"
                  style={{
                    flex: 1,
                    minWidth: 120,
                    height: 50,
                    border: "1px solid #e0e0e0",
                    borderRadius: 999,
                    background: "#fff",
                    color: "#25D366",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    transition: "all .2s",
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#25D366";
                    e.currentTarget.style.borderColor = "#25D366";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.color = "#25D366";
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              <div style={{ fontSize: 12, color: "#bbb", lineHeight: 2, display: "flex", flexDirection: "column", gap: 2, marginTop: 14 }}>
                {product.category && <span>Category: <strong style={{ color: "#888" }}>{product.category}</strong></span>}
                <span>Availability: {currentStock > 0
                  ? <strong style={{ color: "#4caf50" }}>{currentStock} in stock</strong>
                  : <strong style={{ color: "#e74c3c" }}>Out of Stock</strong>}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 36 }}>
            <DescriptionAndReviews key={product.id} product={product} onReviewSummary={setReviewSummary} />
          </div>

          {relatedProducts.length > 0 && (
            <section aria-label="Recommended products in the same category" style={{ borderTop: "1px solid #eee", marginTop: 44, paddingTop: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                <div>
                  <h2 style={{ color: DARK, fontSize: 24, margin: 0, fontFamily: "Georgia, serif" }}>Recommended Products</h2>
                  <p style={{ color: "#888", fontSize: 13, margin: "7px 0 0" }}>More from {product.category}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[-1, 1].map((direction) => (
                    <button
                      key={direction}
                      type="button"
                      aria-label={direction < 0 ? "Scroll recommendations left" : "Scroll recommendations right"}
                      onClick={() => scrollRecommendations(direction)}
                      style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid rgb(197, 155, 39)", background: "#fff", color: "rgb(197, 155, 39)", cursor: "pointer", fontSize: 20, fontWeight: "bold" }}
                    >{direction < 0 ? "‹" : "›"}</button>
                  ))}
                </div>
              </div>
              <div
                ref={recommendationsRef}
                style={{ display: "flex", gap: 18, overflowX: "auto", scrollBehavior: "smooth", padding: "4px 2px 16px", scrollbarWidth: "thin" }}
              >
                {relatedProducts.map((recommended) => (
                  <div key={recommended.id} style={{ flex: "0 0 250px", minWidth: 0 }}>
                    <ProductCard
                      product={recommended}
                      layout="grid"
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
            </section>
          )}
        </div>
      </LayoutOne>

      {/* Custom Fullscreen Image Preview Layer */}
      <ProductImageViewer
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={gallery}
        activeImage={activeImage}
        onSelectImage={setActiveImage}
        title={product.name}
      />
    </Fragment>
  );
};

export default ProductView;
