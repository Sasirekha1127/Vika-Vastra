import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api";
import { getProductUrl } from "../../utils/productUrl";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/* ── Palette ─────────────────────────────────────────── */
const MAROON      = "#720E1E";
const MAROON_DEEP = "#4E0914";
const GOLD        = "#C59B27";
const INK         = "#2a1a1c";
const MUTED       = "#8a7a78";
const PAPER       = "#f8ebd7";

/* ── Helpers (unchanged logic) ───────────────────────── */
const getCustomerId = () => {
  try {
    const user     = JSON.parse(localStorage.getItem("user")     || "null");
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

/* ── Toast ───────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="bs-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`bs-toast bs-toast--${t.type}`}>
          <span className="bs-toast__icon">{t.type === "cart" ? "✓" : "♥"}</span>
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

  const mrp       = Number(product.mrp || 0);
  const salePrice = Number(product.salesPrice || product.mrp || 0);
  const discount  = mrp > 0 ? Math.round(((mrp - salePrice) / mrp) * 100) : 0;
  const variants  = Array.isArray(product.Variants)
    ? product.Variants.filter((v) => v.isActive !== false)
    : [];
  const displayStock = variants.length
    ? variants.reduce((sum, v) => sum + Math.max(0, Number(v.stock) || 0), 0)
    : Number(product.stock || 0);
  const outOfStock = displayStock <= 0;

  const isInCart     = !!cartItems.find((c) => String(c.productId ?? c.id) === String(product.id));
  const isWishlisted = !!wishlistItems.find((w) => String(w.productId ?? w.id) === String(product.id));
  const imageUrl     = getImageUrl(product.image);

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
  const btnLabel = addedAnim ? "Added to cart" : isInCart ? "In your cart" : outOfStock ? "Sold out" : "Add to cart";

  return (
    <article className="bs-card" onClick={() => navigate(getProductUrl(product))}>
      <div className="bs-arch">
        <div className="bs-arch__inner">
          <img src={imageUrl} alt={product.productName} loading="lazy" />
          {discount > 0 && <span className="bs-off">{discount}% off</span>}
          <button
            type="button"
            className={`bs-heart ${isWishlisted ? "is-on" : ""}`}
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={isWishlisted}
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <div className="bs-info">
        <h3 className="bs-name" title={product.productName}>{product.productName}</h3>
        <div className="bs-price">
          <span className="bs-price__now">Rs. {salePrice.toLocaleString()}</span>
          {discount > 0 && <span className="bs-price__old">Rs. {mrp.toLocaleString()}</span>}
        </div>
        <button
          type="button"
          className={`bs-cart ${btnState}`}
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
export default function BestSellers({ shop }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toasts,   setToasts]   = useState([]);

  const {
    cartItems = [],
    wishlistItems = [],
    addToCart,
    addToWishlist,
    deleteFromWishlist,
    onNotLoggedIn,
  } = shop;

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res  = await fetch(`${API_BASE}/products/best-sellers`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch best sellers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
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

  if (loading) return <div className="bs-loading">Loading best sellers…</div>;
  if (!products.length) return null;

  return (
    <section className="bs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Figtree:wght@400;500;600&display=swap');

        .bs-root, .bs-root * { box-sizing: border-box; }
        .bs-root { font-family: 'Figtree', sans-serif; color: ${INK}; background: ${PAPER}; }
        .bs-wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px 56px; }

        .bs-head { display: flex; flex-direction: column; align-items: center; text-align: center;
          gap: 8px; margin-bottom: 36px; }
        .bs-head h2 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 40px;
          line-height: 1.1; margin: 0; color: ${MAROON}; letter-spacing: -0.01em; }
        .bs-head p { margin: 0; font-size: 14px; color: ${MUTED}; }
        .bs-head::after { content: ""; width: 56px; height: 2px; background: ${GOLD}; margin-top: 10px; }

        .bs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 36px 24px; animation: bsFade .6s ease both; }
        @keyframes bsFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

        .bs-card { cursor: pointer; display: flex; flex-direction: column; }

        /* arch frame */
        .bs-arch { padding: 5px; border: 1.5px solid ${GOLD}; border-radius: 999px 999px 0 0;
          transition: border-color .2s; }
        .bs-card:hover .bs-arch { border-color: ${MAROON}; }
        .bs-arch__inner { position: relative; overflow: hidden; aspect-ratio: 3/4; background: #efe6e2;
          border-radius: 999px 999px 0 0; }
        .bs-arch__inner img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          transition: transform .5s ease; }
        .bs-card:hover .bs-arch__inner img { transform: scale(1.04); }

        .bs-off { position: absolute; left: 0; bottom: 12px; background: ${MAROON}; color: #fff;
          font-size: 12px; font-weight: 600; padding: 5px 12px 5px 10px; border-radius: 0 999px 999px 0; }

        .bs-heart { position: absolute; top: 16%; right: 8%; width: 36px; height: 36px; border-radius: 50%;
          border: none; cursor: pointer; display: grid; place-items: center; font-size: 18px; line-height: 1;
          background: rgba(255,255,255,.94); color: ${MAROON}; transition: background .2s, color .2s, transform .15s; }
        .bs-heart:hover { transform: scale(1.08); }
        .bs-heart.is-on { background: ${MAROON}; color: #fff; }

        /* info */
        .bs-info { padding: 14px 2px 0; display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .bs-name { margin: 0; font-family: 'Fraunces', serif; font-weight: 500; font-size: 17px; line-height: 1.3;
          color: ${INK}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .bs-price { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .bs-price__now { font-size: 16px; font-weight: 600; color: ${MAROON}; }
        .bs-price__old { font-size: 13px; color: ${MUTED}; text-decoration: line-through; }

        .bs-cart {
          margin-top: auto;
          width: 100%;
          padding: 11px 12px;
          font: 700 13px 'Figtree', sans-serif;
          letter-spacing: 0.02em;
          color: #380710;
          background: linear-gradient(135deg, #C59B27 0%, #E5C365 55%, #CFA23A 100%);
          border: 1px solid rgba(197, 155, 39, 0.85);
          border-radius: 999px;
          cursor: pointer;
          transition: all .25s ease;
          box-shadow: 0 4px 14px rgba(197, 155, 39, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.45);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
        }
        .bs-cart:hover {
          background: linear-gradient(135deg, #B88E20 0%, #DFBA58 52%, #C49727 100%);
          color: #380710;
          box-shadow: 0 6px 18px rgba(197, 155, 39, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.55);
          transform: translateY(-1px);
        }
        .bs-cart.is-added {
          background: #2E7D32;
          border-color: #2E7D32;
          color: #fff;
          text-shadow: none;
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
        }
        .bs-cart.is-out {
          background: #eee7e4;
          border-color: #eee7e4;
          color: ${MUTED};
          cursor: not-allowed;
          box-shadow: none;
          text-shadow: none;
        }

        .bs-root button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }

        /* toasts */
        .bs-toasts { position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex;
          flex-direction: column; gap: 10px; align-items: flex-end; pointer-events: none; }
        .bs-toast { display: flex; align-items: center; gap: 10px; max-width: 320px; padding: 12px 18px;
          border-radius: 10px; font: 500 13px 'Figtree', sans-serif; color: #fff; background: ${MAROON};
          border-left: 4px solid ${GOLD}; box-shadow: 0 6px 24px rgba(78,9,20,.25); animation: bsToast .25s ease; }
        .bs-toast--wish { background: ${MAROON_DEEP}; }
        .bs-toast__icon { color: ${GOLD}; font-size: 15px; }
        @keyframes bsToast { from { transform: translateX(32px); opacity: 0; } to { transform: none; opacity: 1; } }

        .bs-loading { text-align: center; padding: 60px 0; font: 14px 'Figtree', sans-serif; color: ${MUTED}; }

        @media (max-width: 767px) {
          .bs-wrap { padding: 28px 12px 36px; }
          .bs-head { margin-bottom: 24px; }
          .bs-head h2 { font-size: 30px; }
          .bs-head p { font-size: 13px; }
          .bs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 12px; }
          .bs-name { font-size: 15px; }
          .bs-price__now { font-size: 15px; }
          .bs-cart { padding: 9px 6px; font-size: 12px; }
          .bs-toasts { left: 12px; right: 12px; bottom: 16px; align-items: stretch; }
          .bs-toast { max-width: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bs-grid, .bs-toast { animation: none; }
          .bs-arch__inner img, .bs-heart, .bs-cart { transition: none; }
        }
      `}</style>

      <div className="bs-wrap">
        <header className="bs-head">
          <h2>Best Sellers</h2>
          <p>Most loved by our customers.</p>
        </header>

        <div className="bs-grid">
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