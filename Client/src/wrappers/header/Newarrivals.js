import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api";
import { getProductUrl } from "../../utils/productUrl";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/* ── Palette ─────────────────────────────────────────── */
const MAROON = "#720E1E";
const MAROON_DEEP = "#4E0914";
const GOLD = "#C59B27";
const INK = "#2a1a1c";
const MUTED = "#8a7a78";
const PAPER = "#ffffff";
const PLUM = "#3f063e";
const PLUM_DARK = "#34052f";
const PLUM_MID = "#5a0b53";
const PEACH_TOP = "#f7e1cf";
const PEACH_BOTTOM = "#ecc9ae";

/* ── Helpers (unchanged logic) ───────────────────────── */
const getCustomerId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const customer = JSON.parse(localStorage.getItem("customer") || "null");
    return user?.id ?? customer?.id ?? null;
  } catch { return null; }
};

const storePendingCartItem = (product) => {
  const pendingItem = {
    id: product.id,
    name: product.productName,
    image: product.image,
    price: Number(product.salesPrice || product.mrp || 0),
    mrp: Number(product.mrp || product.salesPrice || 0),
    quantity: 1,
  };
  localStorage.setItem("pendingCartItem", JSON.stringify(pendingItem));
  localStorage.setItem("pendingAction", "cart");
};

const storePendingWishlistItem = (product) => {
  const pendingItem = {
    id: product.id,
    name: product.productName,
    image: product.image,
    price: Number(product.salesPrice || product.mrp || 0),
    stock: Number(product.stock || 0),
  };
  localStorage.setItem("pendingWishlistItem", JSON.stringify(pendingItem));
  localStorage.setItem("pendingAction", "wishlist");
};

/* ── Lotus icon ──────────────────────────────────────── */
const LotusIcon = () => (
  <svg width="34" height="26" viewBox="0 0 64 48" aria-hidden="true">
    <defs>
      <linearGradient id="naLotusA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6a04d" />
        <stop offset="100%" stopColor="#e0457b" />
      </linearGradient>
      <linearGradient id="naLotusB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f48fb1" />
        <stop offset="100%" stopColor="#c2185b" />
      </linearGradient>
    </defs>
    {/* outer petals */}
    <path d="M32 44 C10 44 2 28 4 16 C16 18 26 28 32 44 Z" fill="url(#naLotusB)" />
    <path d="M32 44 C54 44 62 28 60 16 C48 18 38 28 32 44 Z" fill="url(#naLotusB)" />
    {/* mid petals */}
    <path d="M32 44 C16 40 12 22 18 8 C28 14 32 28 32 44 Z" fill="url(#naLotusA)" />
    <path d="M32 44 C48 40 52 22 46 8 C36 14 32 28 32 44 Z" fill="url(#naLotusA)" />
    {/* centre petal */}
    <path d="M32 44 C24 34 24 16 32 3 C40 16 40 34 32 44 Z" fill="#f9c27a" />
    <path d="M32 44 C27 34 27 18 32 8 C37 18 37 34 32 44 Z" fill="#f6a04d" opacity=".75" />
  </svg>
);

/* ── Toast ───────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="na-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`na-toast na-toast--${t.type}`}>
          <span className="na-toast__icon">{t.type === "cart" ? "✓" : "♥"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Product card ────────────────────────────────────── */
function ProductCard({ product, cartItems = [], wishlistItems = [], onAddToCart, onToggleWishlist }) {
  const navigate = useNavigate();
  const [addedAnim, setAddedAnim] = useState(false);

  const mrp = Number(product.mrp || 0);
  const salePrice = Number(product.salesPrice || product.mrp || 0);
  const discount = mrp > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
  const variants = Array.isArray(product.Variants)
    ? product.Variants.filter((v) => v.isActive !== false)
    : [];
  const displayStock = variants.length
    ? variants.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0)
    : Number(product.stock || 0);
  const outOfStock = displayStock <= 0;

  const isInCart = !!cartItems.find((c) => String(c.productId ?? c.id) === String(product.id));
  const isWishlisted = !!wishlistItems.find((w) => String(w.productId ?? w.id) === String(product.id));
  const imageUrl = getImageUrl(product.image);

  const flashAdded = () => {
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  const handleCart = async (e) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (variants.length) {
      const available = variants.filter((v) => Number(v.stock) > 0);
      if (available.length !== 1) {
        navigate(getProductUrl(product));
        return;
      }
      const variant = available[0];
      const added = await onAddToCart({
        ...product,
        selectedVariant: variant,
        variantId: variant.id,
        image: variant.image || product.image,
        mrp: variant.mrp ?? product.mrp,
        salesPrice: variant.salesPrice ?? product.salesPrice,
        stock: variant.stock,
        weight: Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(", "),
      });
      if (added) flashAdded();
      return;
    }
    const added = await onAddToCart({ ...product });
    if (added) flashAdded();
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    onToggleWishlist({ ...product });
  };

  const btnState = outOfStock ? "is-out" : addedAnim || isInCart ? "is-added" : "";
  const btnLabel = addedAnim ? "Added to Cart" : isInCart ? "In your Cart" : outOfStock ? "Sold Out" : "Add to Cart";

  return (
    <article className="na-card" onClick={() => navigate(getProductUrl(product))}>
      <div className="na-media">
        <img src={imageUrl} alt={product.productName} loading="lazy" />
        {discount > 0 && <span className="na-off">{discount}% off</span>}
        <button
          type="button"
          className={`na-heart ${isWishlisted ? "is-on" : ""}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={isWishlisted}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="na-info">
        <h3 className="na-name" title={product.productName}>{product.productName}</h3>
        <div className="na-price">
          <span className="na-price__now">₹{salePrice.toLocaleString()}</span>
          {discount > 0 && <span className="na-price__old">₹{mrp.toLocaleString()}</span>}
        </div>
        <button
          type="button"
          className={`na-cart ${btnState}`}
          onClick={handleCart}
          disabled={outOfStock}
        >
          {btnLabel}
        </button>
      </div>
    </article>
  );
}

/* ── Section ─────────────────────────────────────────── */
export default function NewArrivals({ shop }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const {
    cartItems = [],
    wishlistItems = [],
    addToCart,
    addToWishlist,
    deleteFromWishlist,
    onNotLoggedIn,
  } = shop;

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/new-arrivals`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const showToast = (message, type) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  };

  const handleAddToCart = (product) => {
    if (!getCustomerId()) {
      storePendingCartItem(product);
      onNotLoggedIn?.();
      return false;
    }
    addToCart(product);
    showToast(`"${product.productName.slice(0, 28)}…" added to cart`, "cart");
    return true;
  };

  const handleToggleWishlist = (product) => {
    if (!getCustomerId()) {
      storePendingWishlistItem(product);
      onNotLoggedIn?.();
      return;
    }
    const exists = wishlistItems.find((i) => String(i.productId ?? i.id) === String(product.id));
    if (exists) {
      deleteFromWishlist(product.id);
      showToast("Removed from wishlist", "wish");
    } else {
      addToWishlist(product);
      showToast(`"${product.productName.slice(0, 28)}…" saved to wishlist`, "wish");
    }
  };

  if (loading) return <div className="na-loading">Loading new arrivals…</div>;
  if (!products.length) return null;

  return (
    <section className="na-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600;700&display=swap');

        .na-root, .na-root * { box-sizing: border-box; }
        .na-root { font-family: 'Figtree', sans-serif; color: ${INK}; background: ${PAPER}; }
        .na-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 24px 56px; }

        /* ── heading: gold line · lotus · title · gold line ── */
        .na-head {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; margin-bottom: 34px;
        }
        .na-head__line {
          flex: 0 1 90px; height: 2px; border-radius: 2px;
        }
        .na-head__line--l { background: linear-gradient(90deg, rgba(212,169,53,0) 0%, #d9b24a 100%); }
        .na-head__line--r { background: linear-gradient(90deg, #d9b24a 0%, rgba(212,169,53,0) 100%); }
        .na-head__title { display: flex; align-items: center; gap: 10px; }
        .na-head h2 {
          margin: 0;
          font-family: 'Playfair Display', 'Fraunces', serif;
          font-weight: 700; font-size: 32px; line-height: 1.1;
          color: #1c0f14; letter-spacing: 0.005em;
        }

        .na-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 28px 24px; animation: naFade .6s ease both;
        }
        @keyframes naFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        /* ── card ── */
        .na-card {
          cursor: pointer;
          display: flex; flex-direction: column;
          background: #fff;
          border-radius: 18px;
          box-shadow:
            0 10px 24px rgba(70, 35, 45, 0.16),
            0 3px 8px rgba(70, 35, 45, 0.10),
            0 0 0 1px rgba(70, 35, 45, 0.04);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .na-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 18px 34px rgba(70, 35, 45, 0.22),
            0 5px 12px rgba(70, 35, 45, 0.12),
            0 0 0 1px rgba(70, 35, 45, 0.05);
        }

        .na-media {
          position: relative; overflow: hidden;
          aspect-ratio: 1 / 1.15;
          background: linear-gradient(180deg, ${PEACH_TOP} 0%, ${PEACH_BOTTOM} 100%);
          border-radius: 18px 18px 0 0;
        }
        .na-media img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          transition: transform .5s ease;
        }
        .na-card:hover .na-media img { transform: scale(1.05); }

        .na-off {
          position: absolute; left: 0; bottom: 10px;
          background: ${MAROON}; color: #fff;
          font-size: 12px; font-weight: 600;
          padding: 5px 12px 5px 10px;
          border-radius: 0 999px 999px 0;
        }

        .na-heart {
          position: absolute; top: 12px; right: 12px;
          width: 44px; height: 44px; border-radius: 50%;
          border: none; cursor: pointer;
          display: grid; place-items: center;
          font-size: 22px; line-height: 1;
          background: #fff; color: #1c0f14;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
          transition: background .2s, color .2s, transform .15s;
        }
        .na-heart:hover { transform: scale(1.08); }
        .na-heart.is-on { background: ${MAROON}; color: #fff; }

        /* ── info panel ── */
        .na-info {
          padding: 16px 16px 16px;
          display: flex; flex-direction: column; gap: 6px; flex: 1;
          background: #fff;
          border-radius: 0 0 18px 18px;
        }
        .na-name {
          margin: 0;
          font-family: 'Fraunces', serif; font-weight: 500;
          font-size: 15px; line-height: 1.3; color: ${INK};
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .na-price { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
        .na-price__now { font-size: 22px; font-weight: 700; color: #1a0f14; letter-spacing: -0.01em; }
        .na-price__old {
          font-size: 17px; font-weight: 500; color: #8f8789;
          text-decoration: line-through; text-decoration-thickness: 1.5px;
        }

        /* ── plum pill button ── */
        .na-cart {
          margin-top: auto; width: 100%;
          padding: 11px 12px;
          font: 600 15px 'Figtree', sans-serif; letter-spacing: 0.01em;
          color: #fff;
          background: linear-gradient(180deg, ${PLUM_MID} 0%, ${PLUM} 55%, ${PLUM_DARK} 100%);
          border: none; border-radius: 999px; cursor: pointer;
          box-shadow:
            0 5px 12px rgba(63, 6, 62, 0.35),
            0 1px 2px rgba(63, 6, 62, 0.30),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
          transition: transform .15s ease, box-shadow .2s ease, filter .2s ease;
        }
        .na-cart:hover {
          transform: translateY(-1px);
          filter: brightness(1.15);
          box-shadow:
            0 8px 16px rgba(63, 6, 62, 0.45),
            0 2px 4px rgba(63, 6, 62, 0.30),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }
        .na-cart:active { transform: translateY(0); }
        .na-cart.is-added {
          background: linear-gradient(180deg, #388e3c 0%, #2E7D32 100%);
          box-shadow: 0 5px 12px rgba(46, 125, 50, 0.32), inset 0 1px 0 rgba(255,255,255,.15);
        }
        .na-cart.is-out {
          background: #eee7e4; color: ${MUTED};
          cursor: not-allowed; box-shadow: none; transform: none; filter: none;
        }

        .na-root button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }

        /* toasts */
        .na-toasts { position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex;
          flex-direction: column; gap: 10px; align-items: flex-end; pointer-events: none; }
        .na-toast { display: flex; align-items: center; gap: 10px; max-width: 320px; padding: 12px 18px;
          border-radius: 10px; font: 500 13px 'Figtree', sans-serif; color: #fff; background: ${MAROON};
          border-left: 4px solid ${GOLD}; box-shadow: 0 6px 24px rgba(78,9,20,.25); animation: naToast .25s ease; }
        .na-toast--wish { background: ${MAROON_DEEP}; }
        .na-toast__icon { color: ${GOLD}; font-size: 15px; }
        @keyframes naToast { from { transform: translateX(32px); opacity: 0; } to { transform: none; opacity: 1; } }

        .na-loading { text-align: center; padding: 60px 0; font: 14px 'Figtree', sans-serif; color: ${MUTED}; }

        @media (min-width: 1024px) {
          .na-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        @media (max-width: 767px) {
          .na-wrap { padding: 28px 12px 36px; }
          .na-head { gap: 8px; margin-bottom: 22px; }
          .na-head__line { flex-basis: 40px; }
          .na-head h2 { font-size: 24px; }
          .na-head svg { width: 26px; height: 20px; }
          .na-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; }
          .na-card { border-radius: 14px; }
          .na-media { border-radius: 14px 14px 0 0; }
          .na-info { padding: 10px 10px 12px; border-radius: 0 0 14px 14px; }
          .na-name { font-size: 13px; }
          .na-price { gap: 6px; margin-bottom: 6px; }
          .na-price__now { font-size: 17px; }
          .na-price__old { font-size: 13px; }
          .na-heart { width: 34px; height: 34px; font-size: 17px; top: 8px; right: 8px; }
          .na-cart { padding: 9px 6px; font-size: 13px; }
          .na-toasts { left: 12px; right: 12px; bottom: 16px; align-items: stretch; }
          .na-toast { max-width: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .na-grid, .na-toast { animation: none; }
          .na-card, .na-media img, .na-heart, .na-cart { transition: none; }
        }
      `}</style>

      <div className="na-wrap">
        <header className="na-head">
          <span className="na-head__line na-head__line--l" aria-hidden="true" />
          <div className="na-head__title">
            <LotusIcon />
            <h2>New Arrivals</h2>
          </div>
          <span className="na-head__line na-head__line--r" aria-hidden="true" />
        </header>

        <div className="na-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartItems={cartItems}
              wishlistItems={wishlistItems}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      </div>

      <Toast toasts={toasts} />
    </section>
  );
}