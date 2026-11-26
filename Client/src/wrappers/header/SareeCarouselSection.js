import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProductUrl } from "../../utils/productUrl";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const fmt = (n) => "₹ " + Number(n).toLocaleString("en-IN");

// Desktop slots (for screens >= 768px)
const DESKTOP_SLOTS = {
  center: { width: 290, height: 420, left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, opacity: 1, filter: "brightness(1)" },
  right1: { width: 210, height: 340, left: "calc(50% + 170px)", transform: "translate(0, -50%)", zIndex: 6, opacity: 0.88, filter: "brightness(0.82)" },
  right2: { width: 155, height: 265, left: "calc(50% + 385px)", transform: "translate(0, -50%)", zIndex: 3, opacity: 0.5, filter: "brightness(0.65)" },
  left1: { width: 210, height: 340, left: "calc(50% - 170px)", transform: "translate(-100%, -50%)", zIndex: 6, opacity: 0.88, filter: "brightness(0.82)" },
  left2: { width: 155, height: 265, left: "calc(50% - 385px)", transform: "translate(-100%, -50%)", zIndex: 3, opacity: 0.5, filter: "brightness(0.65)" },
  hidden: { width: 120, height: 200, left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0, pointerEvents: "none" },
};

// Mobile slots (for screens < 768px) - shows only center
const MOBILE_SLOTS = {
  center: { width: 280, height: 400, left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, opacity: 1, filter: "brightness(1)" },
  right1: { width: 0, height: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0, pointerEvents: "none", display: "none" },
  right2: { width: 0, height: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0, pointerEvents: "none", display: "none" },
  left1: { width: 0, height: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0, pointerEvents: "none", display: "none" },
  left2: { width: 0, height: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0, pointerEvents: "none", display: "none" },
  hidden: { width: 0, height: 0, left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0, pointerEvents: "none" },
};

const mediaUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  const clean = filePath.replace(/\\/g, "/");
  if (clean.startsWith("uploads/")) {
    return `${API_BASE}/uploads/${clean.slice("uploads/".length)}`;
  }
  return `${API_BASE}/${clean}`;
};

// ── MediaCard ─────────────────────────────────────────────────────
const MediaCard = ({ src, type, thumb, isActive, style }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  if (type === "video") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <img
          src={thumb}
          alt=""
          style={{
            ...style,
            position: "absolute", top: 0, left: 0,
            opacity: isActive ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <video
          ref={videoRef}
          src={src}
          muted loop playsInline
          style={{
            ...style,
            position: "absolute", top: 0, left: 0,
            opacity: isActive ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={thumb || src}
      alt=""
      style={style}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
};

// ── Main Section ──────────────────────────────────────────────────
const SareeCarouselSection = ({
  sectionTitle   = "What More Live",
  sectionSubText = "STYLED FOR YOU",
}) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(2);
  const [animating, setAnimating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cartState, setCartState] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const timerRef = useRef(null);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Fetch live products ───────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/live-products`)
      .then(r => r.json())
      .then(data => {
        const mapped = data
          .filter(p => p.status === "Active")
          .map(p => ({
            id: p.id,
            name: p.title,
            price: parseFloat(p.price),
            originalPrice: parseFloat(p.originalPrice) || 0,
            discount: p.discountPercent || 0,
            videoSrc: mediaUrl(p.video),
            thumb: mediaUrl(p.image),
            type: p.video ? "video" : "image",
            productId: p.productId || null,
            legacyLink: p.link || null,
          }));
        setProducts(mapped);
        setActive(Math.floor(mapped.length / 2));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = products.length;
  const SLOTS = isMobile ? MOBILE_SLOTS : DESKTOP_SLOTS;

  const go = (dir) => {
    if (animating || total === 0) return;
    setAnimating(true);
    setActive((prev) => (prev + dir + total) % total);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAnimating(false), 420);
  };

  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => go(1), 4000);
    return () => clearInterval(t);
  }, [active, animating, total]);

  const getSlot = (i) => {
    const diff = ((i - active + total) % total + total) % total;
    
    // On mobile, only show center image
    if (isMobile) {
      if (diff === 0) return "center";
      return "hidden";
    }
    
    // On desktop, show multiple images
    if (diff === 0) return "center";
    if (diff === 1) return "right1";
    if (diff === 2) return "right2";
    if (diff === total - 1) return "left1";
    if (diff === total - 2) return "left2";
    return "hidden";
  };

  const current = products[active];

  const resolveProductRoute = (product) => {
    if (product.legacyLink) return product.legacyLink;
    if (product.productId) return getProductUrl({ id: product.productId, name: product.productName || product.name });
    return null;
  };

  const handleViewProduct = async (product) => {
    setLinkError(null);
    const route = resolveProductRoute(product);

    if (!route) {
      setLinkError("This product doesn't have a linked product page yet. Please check back soon.");
      return;
    }

    if (!product.legacyLink && product.productId) {
      try {
        const res = await fetch(`${API_BASE}/products/${product.productId}`);
        if (!res.ok) {
          setLinkError(`Product not found (ID: ${product.productId}). It may have been removed.`);
          return;
        }
      } catch {}
    }

    setLightboxOpen(false);
    setCartState(null);
    setLinkError(null);
    navigate(route);
  };

  const handleAddToCart = async (product) => {
    if (!product.productId && !product.legacyLink) {
      setLinkError("Cannot add to cart: this product has no linked product page.");
      return;
    }

    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      setCartState("login");
      setTimeout(() => setCartState(null), 3000);
      return;
    }

    if (!product.productId) {
      await handleViewProduct(product);
      return;
    }

    setCartState("loading");
    setLinkError(null);

    try {
      const prodRes = await fetch(`${API_BASE}/products/${product.productId}`);
      if (!prodRes.ok) {
        setLinkError(`Product not found (ID: ${product.productId}).`);
        setCartState(null);
        return;
      }

      const cartRes = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: parseInt(customerId, 10),
          productId: product.productId,
          quantity: 1,
        }),
      });

      if (cartRes.ok) {
        window.dispatchEvent(new Event("cartUpdated"));
        setCartState("added");
        setTimeout(() => setCartState(null), 2500);
      } else {
        setLightboxOpen(false);
        navigate(getProductUrl({ id: product.productId, name: product.productName || product.name }));
      }
    } catch {
      setCartState("error");
      setTimeout(() => setCartState(null), 2500);
    }
  };

  const hasProductLink = (product) => !!(product?.productId || product?.legacyLink);

  const btnLabel = (product) => {
    if (!product) return "VIEW PRODUCT →";
    if (cartState === "loading") return "PLEASE WAIT…";
    if (cartState === "added") return "✓ ADDED TO CART";
    if (cartState === "error") return "TRY AGAIN";
    if (cartState === "login") return "LOGIN TO ADD";
    return "VIEW PRODUCT →";
  };

  const btnColor = () => {
    if (cartState === "added") return "#16a34a";
    if (cartState === "error") return "#dc2626";
    if (cartState === "login") return "#d97706";
    return "linear-gradient(135deg, #5a0b53 0%, #3f063e 60%, #34052f 100%)";
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="saree-carousel-area">
      <div className="container-fluid">

        {sectionTitle && (
          <div style={s.titleWrap}>
            <p style={s.subText}>{sectionSubText}</p>
            <h2 style={s.title}>{sectionTitle}</h2>
            <div style={s.titleLine} />
          </div>
        )}

        {/* ── Stage ── */}
        <div style={{
          ...s.stage,
          height: isMobile ? 450 : 500,
        }}>
          {products.map((p, i) => {
            const slot = getSlot(i);
            const ss = SLOTS[slot] || SLOTS.hidden;
            const isActive = slot === "center";

            // Don't render hidden slots on mobile
            if (isMobile && slot === "hidden") return null;

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (slot === "center") {
                    setCartState(null);
                    setLinkError(null);
                    setLightboxOpen(true);
                  } else {
                    setActive(i);
                  }
                }}
                style={{
                  position: "absolute", top: "50%",
                  borderRadius: 10, overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.42s cubic-bezier(0.4,0,0.2,1)",
                  ...ss,
                }}
              >
                <MediaCard
                  src={p.videoSrc}
                  type={p.type}
                  thumb={p.thumb}
                  isActive={isActive}
                  style={s.cardImg}
                />

                {isActive && (
                  <div style={s.overlay}>
                    <div style={s.infoRow}>
                      <div style={s.thumbBox}>
                        <img
                          src={p.thumb}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 3 }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>
                      <div>
                        <div style={s.name}>{p.name}</div>
                        <div style={s.priceRow}>
                          <span style={s.price}>{fmt(p.price)}</span>
                          {p.originalPrice > 0 && <span style={s.oldPrice}>{fmt(p.originalPrice)}</span>}
                          {p.discount > 0 && <span style={s.badge}>{p.discount}% off</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Dots ── */}
        <div style={s.dots}>
          {products.map((_, i) => (
            <span
              key={i}
              onClick={() => setActive(i)}
              style={{
                ...s.dot,
                background: i === active ? "#5a3e7a" : "#ccc",
                transform: i === active ? "scale(1.35)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && current && (
        <div
          style={{
            ...s.lightbox,
            flexDirection: !isMobile && window.innerWidth >= 768 ? "row" : "column",
            padding: isMobile ? 20 : 40,
            gap: isMobile ? 20 : 36,
          }}
          onClick={() => { setLightboxOpen(false); setCartState(null); setLinkError(null); }}
        >
          <button
            style={s.closeBtn}
            onClick={() => { setLightboxOpen(false); setCartState(null); setLinkError(null); }}
          >
            ✕
          </button>

          {/* Media */}
          <div style={{
            maxWidth: isMobile ? "90vw" : "42vw",
            maxHeight: isMobile ? "50vh" : "80vh",
          }}>
            {current.type === "video" ? (
              <video
                src={current.videoSrc}
                autoPlay muted loop playsInline
                style={{ ...s.lbImg, maxHeight: "100%", maxWidth: "100%" }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={current.thumb}
                alt={current.name}
                style={{ ...s.lbImg, maxHeight: "100%", maxWidth: "100%" }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          {/* Info panel */}
          <div style={{
            ...s.lbInfo,
            maxWidth: isMobile ? "90vw" : 300,
            textAlign: isMobile ? "center" : "left"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.lbName, fontSize: isMobile ? 18 : 22 }}>{current.name}</div>

            <div style={{ ...s.priceRow, marginTop: 10, justifyContent: isMobile ? "center" : "flex-start" }}>
              <span style={{ ...s.price, fontSize: isMobile ? 18 : 20 }}>{fmt(current.price)}</span>
              {current.originalPrice > 0 && <span style={s.oldPrice}>{fmt(current.originalPrice)}</span>}
              {current.discount > 0 && <span style={s.badge}>{current.discount}% off</span>}
            </div>

            {linkError && (
              <div style={s.errorBox}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span>{linkError}</span>
              </div>
            )}

            <button
              style={{
                ...s.cartBtn,
                background: hasProductLink(current) ? btnColor() : "#9ca3af",
                color: "#fff",
                opacity: cartState === "loading" ? 0.7 : 1,
                cursor: cartState === "loading" ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: hasProductLink(current) ? "0 4px 14px rgba(63, 6, 62, 0.35)" : "none",
                fontSize: isMobile ? 11 : 13,
                padding: isMobile ? "10px 20px" : "13px 28px",
              }}
              disabled={cartState === "loading"}
              onClick={() => handleViewProduct(current)}
            >
              {btnLabel(current)}
            </button>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 767px) {
            .saree-carousel-area .container-fluid {
              padding: 0 10px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SareeCarouselSection;

// ── Styles ────────────────────────────────────────────────────────
const s = {
  titleWrap: { textAlign: "center", marginBottom: 40, padding: "30px 20px" },
  subText: { fontFamily: "sans-serif", fontSize: "11px", fontWeight: "600", letterSpacing: "0.25em", color: "rgba(0,0,0,0.4)", textTransform: "uppercase", margin: "0 0 10px" },
  title: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "32px", fontWeight: "400", color: "#111", letterSpacing: "0.04em", textTransform: "capitalize", margin: "0 0 18px", lineHeight: 1.2 },
  titleLine: { width: "60px", height: "1px", background: "rgba(0,0,0,0.15)", margin: "0 auto", borderRadius: 2 },
  stage: { position: "relative", overflow: "hidden", userSelect: "none" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.78))", padding: "20px 12px 12px" },
  infoRow: { display: "flex", gap: 10, alignItems: "flex-end" },
  thumbBox: { width: 44, height: 58, borderRadius: 4, overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,255,255,0.45)", background: "#555" },
  name: { color: "#fff", fontSize: 12, fontWeight: 600, marginBottom: 5, lineHeight: 1.35 },
  priceRow: { display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" },
  price: { color: "#fff", fontSize: 14, fontWeight: 700 },
  oldPrice: { color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "line-through" },
  badge: { background: "#5a3e7a", color: "#fff", fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 600, letterSpacing: 0.4 },
  dots: { display: "flex", justifyContent: "center", gap: 8, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: "50%", cursor: "pointer", transition: "all 0.3s", display: "inline-block" },
  lightbox: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.86)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto" },
  closeBtn: { position: "absolute", top: 20, right: 24, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", zIndex: 10000 },
  lbImg: { borderRadius: 10, objectFit: "cover" },
  lbInfo: { color: "#fff" },
  lbName: { fontWeight: 700, lineHeight: 1.4 },
  cartBtn: { marginTop: 24, color: "#fff", border: "none", borderRadius: 6, letterSpacing: 2, fontWeight: 600, width: "100%", cursor: "pointer" },
  errorBox: { marginTop: 14, display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.45)", borderRadius: 6, padding: "10px 12px", fontSize: 12, color: "#fca5a5", lineHeight: 1.5 },
};
