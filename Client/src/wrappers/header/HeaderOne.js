import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/* ── Colour tokens ───────────────────────────────────────────── */
const C = {
  maroon:         "#720E1E",
  maroonDark:     "#4A0713",
  maroonDeep:     "#32040C",
  maroonHover:    "#8E1428",
  gold:           "#C59B27",
  goldLight:      "#E5C365",
  goldLt:         "#F8EFE2",
  goldBorder:     "rgba(197, 155, 39, 0.30)",
  goldGradient:   "linear-gradient(135deg, #C59B27 0%, #E5C365 55%, #CFA23A 100%)",
  maroonGradient: "linear-gradient(135deg, #720E1E 0%, #9E182F 100%)",
  charcoal:       "#2E050D",
  muted:          "#6B5B5E",
  border:         "rgba(197, 155, 39, 0.24)",
  white:          "#FFFFFF",
  cream:          "#FBF8F3",
  blush:          "#F5EBE4",
  ivoryBg:        "rgba(251, 248, 243, 0.96)",
};

/* ── Static styles ───────────────────────────────────────────── */
const S = {
  promoWrap: {
    display:        "flex",
    alignItems:     "center",
    padding:        "8px 0",
    fontSize:       13,
    fontWeight:     700,
    letterSpacing:  "0.14em",
    textTransform:  "uppercase",
    fontFamily:     "'Cormorant Garamond', 'Cinzel', Georgia, serif",
    textDecoration: "none",
    overflow:       "hidden",
    whiteSpace:     "nowrap",
    position:       "relative",
    width:          "100%",
    background:     "#FBECD7",
    backgroundColor: "#FBECD7",
    color:          "#720E1E",
    borderBottom:   "1.5px solid rgba(197, 155, 39, 0.45)",
    boxShadow:      "0 2px 8px rgba(114, 14, 30, 0.08)",
  },
  header: {
    background:           "#720E1E",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    position:             "sticky",
    top:                  0,
    zIndex:               999,
    width:                "100%",
    maxWidth:             "100%",
    boxSizing:            "border-box",
    borderBottom:         "1.5px solid rgba(197, 155, 39, 0.5)",
    boxShadow:            "0 6px 20px rgba(46, 5, 13, 0.35)",
    transition:           "box-shadow .3s ease, background .3s ease",
  },
  headerStick: {
    boxShadow:            "0 10px 30px rgba(46, 5, 13, 0.45)",
    background:           "rgba(114, 14, 30, 0.98)",
    borderBottom:         "1.5px solid rgba(197, 155, 39, 0.6)",
  },
  mainRow: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "0 48px",
    height:         86,
    position:       "relative",
    width:          "100%",
    maxWidth:       "100%",
    boxSizing:      "border-box",
  },
  logoWrap: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            14,
    textDecoration: "none",
    flexShrink:     0,
    paddingRight:   28,
  },
  /* arch-shaped frame – echoes temple / heritage doorways */
  logoFrame: {
    width:          58,
    height:         66,
    borderRadius:   "28px 28px 12px 12px",
    background:     "#FFFFFF",
    border:         "2px solid rgba(197, 155, 39, 0.65)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    padding:        5,
    boxShadow:      "0 6px 18px rgba(114, 14, 30, 0.16)",
    flexShrink:     0,
    transition:     "all .28s ease",
  },
  logoIcon: {
    width:      "100%",
    height:     "100%",
    objectFit:  "contain",
    display:    "block",
    transition: "transform .25s ease",
  },
  navCenter: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    flex:           1,
    gap:            6,
  },
  iconsRight: {
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    flexShrink:     0,
    justifyContent: "flex-end",
  },
  iconBtn: {
    position:       "relative",
    width:          42,
    height:         42,
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    border:         "1px solid rgba(229, 195, 101, 0.35)",
    background:     "rgba(255, 255, 255, 0.12)",
    color:          "#FAF7F2",
    cursor:         "pointer",
    borderRadius:   14,
    transition:     "all .25s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  badge: {
    position:       "absolute",
    top:            -6,
    right:          -6,
    minWidth:       18,
    height:         18,
    padding:        "0 5px",
    boxSizing:      "border-box",
    borderRadius:   9,
    background:     C.goldGradient,
    border:         "2px solid #720E1E",
    color:          C.maroonDeep,
    fontSize:       9.5,
    fontWeight:     800,
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    pointerEvents:  "none",
    fontFamily:     "'DM Sans', sans-serif",
    lineHeight:     1,
  },
  dropdown: {
    position:     "absolute",
    top:          "calc(100% + 16px)",
    left:         "50%",
    transform:    "translateX(-50%)",
    background:   "#FFFFFF",
    border:       "1px solid rgba(197, 155, 39, 0.4)",
    borderRadius: 20,
    minWidth:     340,
    padding:      "18px",
    zIndex:       9999,
    boxShadow:    "0 24px 56px rgba(60, 5, 12, 0.16)",
  },
  accDropdown: {
    position:     "absolute",
    top:          "calc(100% + 14px)",
    right:        0,
    background:   "#FFFFFF",
    border:       "1px solid rgba(197, 155, 39, 0.4)",
    borderRadius: 18,
    minWidth:     230,
    padding:      "14px 10px",
    zIndex:       9999,
    boxShadow:    "0 24px 56px rgba(60, 5, 12, 0.16)",
  },
  dropItem: {
    display:        "flex",
    alignItems:     "center",
    gap:            12,
    width:          "100%",
    textAlign:      "left",
    fontSize:       13.5,
    padding:        "9px 12px",
    color:          C.charcoal,
    background:     "transparent",
    border:         "none",
    borderRadius:   12,
    cursor:         "pointer",
    fontFamily:     "'DM Sans', sans-serif",
    fontWeight:     500,
    letterSpacing:  "0.02em",
    textDecoration: "none",
    whiteSpace:     "nowrap",
    boxSizing:      "border-box",
    transition:     "background .18s ease, color .18s ease",
  },
  dropIcon: {
    width:          34,
    height:         34,
    borderRadius:   11,
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    flexShrink:     0,
    background:     C.blush,
    color:          C.maroon,
    border:         "1px solid transparent",
    transition:     "background .18s ease, color .18s ease",
  },
  /* search – deep maroon panel */
  searchOverlay: {
    position:     "absolute",
    top:          "100%",
    left:         0,
    right:        0,
    background:   "linear-gradient(180deg, #4A0713 0%, #32040C 100%)",
    borderBottom: `2px solid ${C.gold}`,
    boxShadow:    "0 20px 44px rgba(30, 2, 6, 0.30)",
    zIndex:       9998,
    overflow:     "hidden",
    transition:   "max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s ease",
  },
  searchOverlayInner: {
    display:        "flex",
    flexDirection:  "column",
    padding:        "20px 44px 22px 44px",
    maxWidth:       900,
    margin:         "0 auto",
    gap:            14,
  },
  searchBarRow: {
    display:        "flex",
    alignItems:     "center",
    gap:            10,
    width:          "100%",
  },
  searchInputWrapper: {
    display:        "flex",
    alignItems:     "center",
    flex:           1,
    background:     C.cream,
    border:         "1px solid transparent",
    borderRadius:   14,
    padding:        "5px 16px",
    transition:     "border-color .2s, box-shadow .2s",
  },
  searchInput: {
    flex:          1,
    padding:       "9px 10px",
    fontSize:      14.5,
    border:        "none",
    background:    "transparent",
    fontFamily:    "'DM Sans', sans-serif",
    color:         C.charcoal,
    outline:       "none",
    letterSpacing: "0.02em",
  },
  searchBtn: {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            8,
    padding:        "13px 26px",
    background:     C.goldGradient,
    color:          C.maroonDeep,
    border:         "none",
    borderRadius:   14,
    fontFamily:     "'DM Sans', sans-serif",
    fontSize:       14,
    fontWeight:     700,
    letterSpacing:  "0.03em",
    cursor:         "pointer",
    flexShrink:     0,
    transition:     "opacity .2s, transform .2s",
  },
  searchCloseBtn: {
    width:          44,
    height:         44,
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    border:         "1px solid rgba(229, 195, 101, 0.4)",
    background:     "transparent",
    color:          "#F6E9C8",
    cursor:         "pointer",
    borderRadius:   14,
    flexShrink:     0,
    transition:     "all .2s ease",
  },
  mobileMenuOverlay: {
    position:   "fixed",
    top:        0,
    left:       0,
    right:      0,
    bottom:     0,
    background: "rgba(46, 5, 13, 0.55)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex:     10000,
    opacity:    0,
    visibility: "hidden",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  },
  mobileMenu: {
    position:   "fixed",
    top:        0,
    left:       0,
    bottom:     0,
    width:      "86%",
    maxWidth:   340,
    background: C.cream,
    zIndex:     10001,
    transform:  "translateX(-100%)",
    transition: "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
    overflowY:  "auto",
    boxShadow:  "4px 0 30px rgba(46, 5, 13, 0.25)",
    display:    "flex",
    flexDirection: "column",
    borderRadius: "0 24px 24px 0",
  },
  mobileMenuHeader: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "20px",
    background:     "linear-gradient(135deg, #4A0713 0%, #32040C 100%)",
    borderBottom:   `2px solid ${C.gold}`,
  },
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/* ── Custom hook: fetch categories ──────────────────────────── */
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/categories`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d)  => { if (!cancelled) { setCategories(Array.isArray(d) ? d : []); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
};

/* ── Custom hook: fetch active promo bar ─────────────────────── */
const usePromoBar = () => {
  const [message, setMessage] = useState(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/promo-bar/active`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d)  => { if (!cancelled) { setMessage(d?.message || null); setLoaded(true); } })
      .catch(()  => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  return { message, loaded };
};

const MsgDot = () => (
  <span style={{
    display:        "inline-flex",
    alignItems:     "center",
    justifyContent: "center",
    margin:         "0 26px",
    verticalAlign:  "middle",
    flexShrink:     0,
    fontSize:       11,
    color:          "#C59B27",
    lineHeight:     1,
    filter:         "drop-shadow(0 1px 2px rgba(197, 155, 39, 0.4))",
  }}>✦</span>
);

/* ── Seamless looping marquee ────────────────────────────────── */
const PromoStrip = () => {
  const { message, loaded } = usePromoBar();
  if (!loaded || !message) return null;

  // Sanitize message: dynamically replace legacy "Emartebuy" with "Vika Vastra"
  const cleanMessage = (message || "").replace(/emartebuy/gi, "Vika Vastra");

  const messages = cleanMessage.includes("|")
    ? cleanMessage.split("|").map((m) => m.trim()).filter(Boolean)
    : [cleanMessage.trim()];

  const TrackContent = () => (
    <>
      {messages.map((msg, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
          <span className="emb-marquee-item">{msg}</span>
          <MsgDot />
        </span>
      ))}
    </>
  );

  return (
    <div className="emb-promo-wrap emb-marquee-wrap" style={S.promoWrap}>
      <div className="emb-marquee-track" aria-hidden="false">
        <TrackContent />
      </div>
      <div className="emb-marquee-track" aria-hidden="true">
        <TrackContent />
      </div>
    </div>
  );
};

/* ── SVG Icons (new rounded duotone set) ─────────────────────── */
const Svg = ({ size = 20, sw = 1.6, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const IconSearch = () => (
  <Svg>
    <circle cx="10.5" cy="10.5" r="6.5" fill="currentColor" fillOpacity="0.12" />
    <path d="M15.5 15.5L20 20" />
  </Svg>
);
const IconUser = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.08" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.6 18c1.2-2 3.2-3 5.4-3s4.2 1 5.4 3" />
  </Svg>
);
const IconHeart = () => (
  <Svg>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0112 7.6a4.1 4.1 0 017.5 2.2C19.5 15.4 12 20 12 20z" fill="currentColor" fillOpacity="0.12" />
  </Svg>
);
const IconCart = () => (
  <Svg>
    <path d="M5 8.5h14l-1 11.5H6L5 8.5z" fill="currentColor" fillOpacity="0.12" />
    <path d="M9 8.5V7.5a3 3 0 016 0v1" />
  </Svg>
);
const IconMenu = () => (
  <Svg size={22} sw={1.9}>
    <path d="M4 8h16M4 16h10" />
  </Svg>
);
const IconClose = () => (
  <Svg size={16} sw={2}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
const ChevronRight = () => (
  <Svg size={14} sw={2}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
const ChevronDown = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform .22s cubic-bezier(0.4, 0, 0.2, 1)", transform: open ? "rotate(180deg)" : "none" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const IconMyAccount = () => (
  <Svg size={16}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </Svg>
);
const IconMyOrders = () => (
  <Svg size={16}>
    <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
  </Svg>
);
const IconLogout = () => (
  <Svg size={16}>
    <path d="M14 4h4a2 2 0 012 2v12a2 2 0 01-2 2h-4" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </Svg>
);
const IconLogin = () => (
  <Svg size={16}>
    <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" />
    <path d="M14 8l4 4-4 4M18 12H8" />
  </Svg>
);
const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 2C6.505 2 2 6.506 2 12.03c0 1.905.534 3.687 1.458 5.215L2.062 22l4.908-1.344A9.96 9.96 0 0012.03 22c5.525 0 10.03-4.505 10.03-10.03C22.06 6.506 17.556 2 12.03 2zm5.727 14.184c-.24.672-1.389 1.285-1.92 1.344-.48.053-1.095.076-3.238-.809-2.29-1.042-3.766-3.39-3.88-3.542-.115-.152-.927-1.233-.927-2.35 0-1.118.583-1.668.79-1.897.208-.228.455-.286.607-.286.152 0 .304.002.436.008.14.007.327-.053.511.39.19.458.647 1.579.704 1.694.058.114.096.248.02.399-.077.152-.115.247-.229.38-.114.133-.24.298-.343.4-.114.114-.233.238-.101.466.133.228.59 0.974 1.268 1.578.873.777 1.609 1.018 1.838 1.132.228.114.361.095.494-.058.133-.152.571-.666.723-.894.152-.228.304-.19.512-.114.209.076 1.328.627 1.556.74.228.115.38.172.437.267.057.095.057.552-.183 1.224z"/>
  </svg>
);

/* ── Category Dropdown Card ──────────────────────────────────── */
const CategoryDropItem = ({ category, onClick }) => {
  const imgSrc = category.image ? `${API_BASE}/${category.image}` : null;
  return (
    <button className="emb-cat-card" onClick={onClick}>
      <div className="emb-cat-thumb-wrap">
        {imgSrc ? (
          <img src={imgSrc} alt={category.name} className="emb-cat-thumb" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <div className="emb-cat-thumb-placeholder">
            <span>{category.name?.charAt(0) || "V"}</span>
          </div>
        )}
      </div>
      <div className="emb-cat-info">
        <span className="emb-cat-name">{category.name}</span>
        <span className="emb-cat-view">Explore sarees</span>
      </div>
      <span className="emb-cat-go"><ChevronRight /></span>
    </button>
  );
};

/* ── Nav item with indicator ─────────────────────────────────── */
const NavItem = ({ label, to, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const timerRef = useRef(null);

  const normalizePath = (path) => path === '/' ? '/' : (path?.replace(/\/+$/, '') || '/');
  const currentPath = normalizePath(location.pathname);
  const targetPath = to ? normalizePath(to) : '';
  const hasCategoryFilter = currentPath === '/shop' && Boolean(new URLSearchParams(location.search).get('category'));
  const isCollectionActive = !to && label === 'Collection' && hasCategoryFilter;
  const isShopPermanent = label === 'Shop';
  const isActive = Boolean(isCollectionActive || (to && label !== 'Shop' && (currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`)))));

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => { clearTimeout(timerRef.current); setDropOpen(true); }}
      onMouseLeave={() => { timerRef.current = setTimeout(() => setDropOpen(false), 160); }}
    >
      <button
        className={`emb-nav-link${isShopPermanent ? ' is-shop-gold' : (isActive ? ' is-active' : '')}${dropOpen ? ' is-open' : ''}`}
        onClick={() => to && navigate(to)}
      >
        <span>{label}</span>
        {children && <ChevronDown open={dropOpen} />}
      </button>

      {children && dropOpen && (
        <div className="emb-dropdown" style={S.dropdown}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ── Mobile Menu Drawer ──────────────────────────────────────── */
const MobileMenu = ({ isOpen, onClose, categories, catLoading, catError, isLoggedIn, onLogout, navigate, openWishlistDrawer, openCartDrawer, wishlistCount, cartCount }) => {
  const [collectionOpen, setCollectionOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleLinkClick = (path) => { navigate(path); onClose(); };
  const categoryPath    = (name) => `/shop?category=${encodeURIComponent(name)}`;
  const curPath         = location.pathname;

  return (
    <>
      <div
        style={{ ...S.mobileMenuOverlay, opacity: isOpen ? 1 : 0, visibility: isOpen ? "visible" : "hidden" }}
        onClick={onClose}
      />
      <div ref={menuRef} style={{ ...S.mobileMenu, transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}>

        {/* Mobile Header */}
        <div style={S.mobileMenuHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 48, borderRadius: "21px 21px 9px 9px", background: "#fff", border: "1.5px solid rgba(197,155,39,0.6)", padding: 4, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={`${process.env.PUBLIC_URL}/vika-icon.png`} alt="Vika Vastra" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', Georgia, serif", fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>
                <span style={{ color: "#FFF4E5", textShadow: "0 2px 10px rgba(255,244,229,0.4)" }}>VIKA </span>
                <span style={{ color: C.goldLight, textShadow: "0 2px 10px rgba(229,195,101,0.5)" }}>VASTRA</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 7.5, letterSpacing: "0.2em", color: C.goldLight, textTransform: "uppercase", fontWeight: 600, marginTop: 3 }}>
                A HERITAGE IN EVERY DRAPE
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(229,195,101,0.45)", background: "transparent", borderRadius: 12, color: "#F6E9C8", cursor: "pointer" }}
          >
            <IconClose />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          <div className={`emb-mobile-nav-item${curPath === '/' ? ' is-active' : ''}`} onClick={() => handleLinkClick("/")}>
            <span>Home</span>
            <ChevronRight />
          </div>
          <div className={`emb-mobile-nav-item${curPath === '/about' ? ' is-active' : ''}`} onClick={() => handleLinkClick("/about")}>
            <span>About Us</span>
            <ChevronRight />
          </div>
          <div className={`emb-mobile-nav-item${curPath === '/shop' && !location.search.includes('category') ? ' is-active' : ''}`} onClick={() => handleLinkClick("/shop")}>
            <span>Shop All Sarees</span>
            <ChevronRight />
          </div>

          <div>
            <div className={`emb-mobile-nav-item${location.search.includes('category') ? ' is-active' : ''}`} onClick={() => setCollectionOpen(!collectionOpen)}>
              <span>Collections</span>
              <ChevronDown open={collectionOpen} />
            </div>
            {collectionOpen && (
              <div style={{ background: C.goldLt, borderRadius: 14, margin: "2px 12px 6px", padding: "6px 0 6px 8px" }}>
                {catLoading && <div style={{ padding: "10px 16px", fontSize: 13, color: C.muted, fontStyle: "italic" }}>Loading collections…</div>}
                {catError   && <div style={{ padding: "10px 16px", fontSize: 13, color: "#c0392b" }}>Could not load collections.</div>}
                {!catLoading && !catError && categories.length === 0 && (
                  <div style={{ padding: "10px 16px", fontSize: 13, color: C.muted }}>No categories found.</div>
                )}
                {!catLoading && categories.map((cat) => (
                  <div key={cat.id} className="emb-mobile-sub-item" onClick={() => handleLinkClick(categoryPath(cat.name))}>
                    <span style={{ color: C.gold, fontSize: 8 }}>◆</span>
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`emb-mobile-nav-item${curPath === '/contact' ? ' is-active' : ''}`} onClick={() => handleLinkClick("/contact")}>
            <span>Contact & Store</span>
            <ChevronRight />
          </div>

          <div style={{ padding: "16px 20px 8px 20px", display: "flex", gap: 10 }}>
            <button
              onClick={() => { openWishlistDrawer(); onClose(); }}
              style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.goldLt, border: `1px solid ${C.goldBorder}`, borderRadius: 14, color: C.maroon, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              <IconHeart /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </button>
            <button
              onClick={() => { openCartDrawer(); onClose(); }}
              style={{ flex: 1, padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.maroonGradient, border: "none", borderRadius: 14, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              <IconCart /> Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        </div>

        {/* WhatsApp & Account footer */}
        <div style={{ padding: "16px 20px 24px 20px", borderTop: `1px solid ${C.border}`, background: "#FFFFFF" }}>
          <a
            href="https://wa.me/919482944552?text=Hi%20Vika%20Vastra,%20I%20would%20like%20to%20enquire%20about%20your%20sarees."
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#25D366", color: "#FFFFFF", borderRadius: 14, textDecoration: "none", fontSize: 13.5, fontWeight: 600, justifyContent: "center", marginBottom: 12 }}
          >
            <IconWhatsApp /> Need Styling Advice? Chat with Us
          </a>

          {isLoggedIn ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="emb-mobile-acc-link" onClick={() => handleLinkClick("/my-account")}>
                <IconMyAccount /><span>My Account</span>
              </div>
              <div className="emb-mobile-acc-link" onClick={() => handleLinkClick("/my-orders")}>
                <IconMyOrders /><span>My Orders</span>
              </div>
              <button
                onClick={() => { onLogout(); onClose(); }}
                style={{ width: "100%", padding: "11px", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fdf0f0", color: "#c0392b", border: "1px solid #fcdada", borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                <IconLogout /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleLinkClick("/login-register")}
              style={{ width: "100%", padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.maroonGradient, color: "#fff", border: "none", borderRadius: 14, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
            >
              <IconLogin /> Sign In / Register
            </button>
          )}
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════ */
const HeaderOne = ({ shop }) => {
  const [scroll,         setScroll]         = useState(0);
  const [accOpen,        setAccOpen]        = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchInput,    setSearchInput]    = useState("");
  const [isLoggedIn,     setIsLoggedIn]     = useState(() => !!localStorage.getItem("isLoggedIn"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accCloseTimer    = useRef(null);
  const searchOverlayRef = useRef(null);
  const searchInputRef   = useRef(null);
  const navigate = useNavigate();

  const { categories, loading: catLoading, error: catError } = useCategories();
  const { wishlistItems, cartItems, openCartDrawer, openWishlistDrawer } = shop;

  useEffect(() => {
    const fn = () => setScroll(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 40);
    else setSearchInput("");
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (searchOverlayRef.current && !searchOverlayRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 20);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler); };
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem("isLoggedIn"));
    window.addEventListener("authChange", sync);
    window.addEventListener("storage",    sync);
    return () => { window.removeEventListener("authChange", sync); window.removeEventListener("storage", sync); };
  }, []);

  const handleSearch = (customQuery) => {
    const q = (typeof customQuery === "string" ? customQuery : searchInput).trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const handleLogout = () => {
    ["isLoggedIn","user","customer","customerId","cart","wishlist","cartOwnerId","wishlistOwnerId"]
      .forEach((k) => localStorage.removeItem(k));
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    navigate("/");
  };

  const categoryPath = (name) => `/shop?category=${encodeURIComponent(name)}`;

  const searchSuggestions = ["Bridal Silks", "Kanjivaram", "Soft Silk", "Cotton Sarees", "Festive Drapes"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;0,800;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes embHeaderSlideDown {
          from {
            transform: translateY(-100%);
            opacity: 0.95;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .emb-header {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          left: 0;
          right: 0;
          position: sticky !important;
          top: 0;
          z-index: 999;
          background: #720E1E !important;
          border-bottom: 1.5px solid rgba(197, 155, 39, 0.5) !important;
          transition: background .25s ease, box-shadow .25s ease;
        }

        .emb-header.is-sticky {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 1000 !important;
          background: rgba(114, 14, 30, 0.98) !important;
          box-shadow: 0 10px 30px rgba(46, 5, 13, 0.45) !important;
          border-bottom: 1.5px solid rgba(197, 155, 39, 0.6) !important;
          animation: embHeaderSlideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .emb-header-placeholder {
          height: 78px;
          width: 100%;
        }

        @media (max-width: 991px) {
          .emb-header-placeholder {
            height: 68px !important;
          }
        }

        /* ── Gold thread under the header ── */
        .emb-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #C59B27 20%, #F0D68A 50%, #C59B27 80%, transparent 100%);
          pointer-events: none;
        }

        .emb-logo-wrap { transition: transform 0.25s ease; }

        .emb-logo-wrap:hover .emb-logo-icon-frame {
          border-color: ${C.gold} !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(197, 155, 39, 0.28) !important;
        }

        /* ── Nav links: unbolded, increased size, warm ivory silk cream color (#FBECD7) ── */
        .emb-nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 22px !important;
          font-weight: 500 !important;
          letter-spacing: 0.03em;
          color: #FBECD7 !important;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          border-radius: 12px;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── Gold Underline Bar for links (except Shop) ── */
        .emb-nav-link:not(.is-shop-gold)::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 14px;
          right: 14px;
          height: 3px;
          background: ${C.goldGradient};
          border-radius: 3px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
          opacity: 0;
          box-shadow: 0 2px 8px rgba(223, 177, 67, 0.65);
        }

        .emb-nav-link:not(.is-shop-gold):hover {
          color: #DFB143 !important;
          background: rgba(251, 236, 215, 0.08) !important;
          border-color: transparent !important;
        }

        .emb-nav-link:not(.is-shop-gold):hover::after {
          transform: scaleX(1);
          opacity: 0.85;
        }

        .emb-nav-link:active {
          transform: scale(0.96);
        }

        .emb-nav-link.is-open {
          background: rgba(251, 236, 215, 0.12) !important;
          border-color: transparent !important;
          color: #DFB143 !important;
        }

        /* ── Active state: Sleek Gold Underline Bar (except Shop) ── */
        .emb-nav-link:not(.is-shop-gold).is-active {
          color: #DFB143 !important;
          background: transparent !important;
          border-color: transparent !important;
          font-weight: 600 !important;
          text-shadow: 0 1px 10px rgba(223, 177, 67, 0.35);
        }

        .emb-nav-link:not(.is-shop-gold).is-active::after {
          transform: scaleX(1);
          opacity: 1;
        }

        /* ── Permanent Shop Featured Gold Active Bar / Pill (Except Shop: keeps full gold pill) ── */
        .emb-nav-link.is-shop-gold {
          background: ${C.goldGradient} !important;
          color: #380710 !important;
          font-weight: 700 !important;
          border: 1px solid rgba(197, 155, 39, 0.75) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3) !important;
          padding: 6px 18px !important;
        }

        .emb-nav-link.is-shop-gold::after {
          display: none !important;
        }

        .emb-nav-link.is-shop-gold:hover {
          background: linear-gradient(135deg, #B88E20 0%, #DFBA58 52%, #C49727 100%) !important;
          color: #380710 !important;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5) !important;
        }

        .emb-nav-link:focus-visible,
        .emb-icon-btn:focus-visible {
          outline: 2px solid ${C.gold};
          outline-offset: 2px;
        }

        /* ── Brand Typography: Highlighted & Unique Royal Cinzel Decorative ── */
        .emb-brand-title {
          font-family: 'Cinzel Decorative', 'Cinzel', Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .emb-brand-vika {
          color: #FFF4E5;
          text-shadow: 0 2px 14px rgba(255, 244, 229, 0.45), 0 0 24px rgba(223, 177, 67, 0.3);
          letter-spacing: 0.04em;
          display: inline-block;
        }

        .emb-brand-vastra {
          background: linear-gradient(135deg, #FFE599 0%, #DFB143 45%, #FFF0B8 75%, #C59B27 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-left: 8px;
          letter-spacing: 0.06em;
          filter: drop-shadow(0 2px 8px rgba(223, 177, 67, 0.55));
          display: inline-block;
        }

        .emb-brand-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 8.5px;
          letter-spacing: 0.28em;
          color: #E5C365 !important;
          text-transform: uppercase;
          font-weight: 700;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
        }

        /* ── Dropdown notch ── */
        .emb-dropdown::before,
        .emb-acc-dropdown::before {
          content: '';
          position: absolute;
          top: -7px;
          width: 12px;
          height: 12px;
          background: #FFFFFF;
          border-left: 1px solid rgba(197, 155, 39, 0.4);
          border-top: 1px solid rgba(197, 155, 39, 0.4);
          transform: rotate(45deg);
          border-top-left-radius: 3px;
        }
        .emb-dropdown::before     { left: calc(50% - 6px); }
        .emb-acc-dropdown::before { right: 15px; }

        /* ── Collection Dropdown Menu ── */
        .emb-cat-dropdown-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: 12px;
          margin-bottom: 10px;
          border-bottom: 1px dashed rgba(197, 155, 39, 0.5);
        }

        .emb-cat-dropdown-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16px;
          font-style: italic;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: ${C.maroon};
        }

        .emb-cat-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 320px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .emb-cat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 10px;
          background: transparent;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        }

        .emb-cat-card:hover { background: ${C.blush}; }

        .emb-cat-thumb-wrap {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid ${C.goldLight};
          background: #fff;
        }

        .emb-cat-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .emb-cat-thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${C.maroon};
          color: ${C.goldLight};
          font-weight: 700;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
        }

        .emb-cat-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 2px;
        }

        .emb-cat-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 16.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #380710;
        }

        .emb-cat-view {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: ${C.muted};
        }

        .emb-cat-go {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: ${C.maroon};
          background: #fff;
          border: 1px solid ${C.goldBorder};
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
        }

        .emb-cat-card:hover .emb-cat-go {
          opacity: 1;
          transform: none;
          background: ${C.maroon};
          color: ${C.goldLight};
          border-color: ${C.maroon};
        }

        .emb-cat-card:hover .emb-cat-name { color: ${C.maroon}; }

        .emb-cat-dropdown-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed rgba(197, 155, 39, 0.5);
          text-align: center;
        }

        .emb-view-all-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: ${C.maroon};
          background: ${C.goldLt};
          border: 1px solid ${C.goldBorder};
          border-radius: 12px;
          padding: 9px 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .emb-view-all-btn:hover {
          background: ${C.maroon};
          color: ${C.goldLight};
          border-color: ${C.maroon};
        }

        /* ── Icon buttons: refined glass-tile on maroon → gold on hover ── */
        .emb-icon-btn {
          border: 1px solid rgba(229, 195, 101, 0.35) !important;
          background: rgba(255, 255, 255, 0.12) !important;
          color: #FAF7F2 !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .emb-icon-btn:hover {
          background: ${C.goldGradient} !important;
          color: #380710 !important;
          border-color: #E5C365 !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35) !important;
        }

        .emb-icon-btn.active {
          background: ${C.goldGradient} !important;
          color: #380710 !important;
          border-color: #E5C365 !important;
        }

        /* ── Search Overlay ── */
        .emb-search-overlay {
          max-height: 0;
          opacity: 0;
          pointer-events: none;
        }

        .emb-search-overlay.open {
          max-height: 170px;
          opacity: 1;
          pointer-events: auto;
        }

        .emb-search-overlay button:hover { opacity: 0.92; }

        .emb-search-suggestion-pill {
          padding: 5px 13px;
          border-radius: 10px;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          color: #F6E9C8;
          background: transparent;
          border: 1px solid rgba(229, 195, 101, 0.4);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .emb-search-suggestion-pill:hover {
          background: ${C.goldLight};
          border-color: ${C.goldLight};
          color: ${C.maroonDeep};
        }

        /* ── Account Dropdown ── */
        .emb-acc-header {
          padding: 6px 12px 10px 12px;
          border-bottom: 1px dashed rgba(197, 155, 39, 0.5);
          margin-bottom: 6px;
        }

        .emb-acc-tag {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 15px;
          font-style: italic;
          font-weight: 700;
          color: ${C.maroon};
        }

        .emb-acc-item:hover {
          background: ${C.blush} !important;
          color: ${C.maroon} !important;
        }

        .emb-acc-item:hover .emb-acc-icon {
          background: ${C.maroon} !important;
          color: ${C.goldLight} !important;
        }

        .emb-acc-logout:hover {
          background: #fdf0f0 !important;
          color: #c0392b !important;
        }

        .emb-acc-logout:hover .emb-acc-icon-danger {
          background: #c0392b !important;
          color: #FFFFFF !important;
          border-color: #c0392b !important;
        }

        /* ── Marquee Ticker ── */
        .emb-promo-wrap {
          display: flex;
          overflow: hidden;
          width: 100%;
          background: #FBECD7 !important;
          background-color: #FBECD7 !important;
          border-bottom: 1.5px solid rgba(197, 155, 39, 0.45) !important;
        }

        @keyframes emb-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .emb-marquee-track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 100%;
          animation: emb-marquee 28s linear infinite;
        }

        .emb-marquee-wrap:hover .emb-marquee-track { animation-play-state: paused; }

        @media (prefers-reduced-motion: reduce) {
          .emb-marquee-track { animation: none; }
        }

        .emb-marquee-item {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 0 16px;
          font-family: 'Cormorant Garamond', 'Cinzel', Georgia, serif;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #720E1E !important;
          text-shadow: none !important;
        }

        /* ── Mobile menu items ── */
        .emb-mobile-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 2px 12px;
          padding: 14px 14px;
          font-size: 15px;
          font-weight: 500;
          color: ${C.charcoal};
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .emb-mobile-nav-item:hover {
          background: rgba(197, 155, 39, 0.12);
          color: ${C.maroon};
          box-shadow: inset 3px 0 0 ${C.gold};
        }

        .emb-mobile-nav-item.is-active {
          background: ${C.goldGradient};
          color: #380710;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(197, 155, 39, 0.28);
        }

        .emb-mobile-sub-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 13.5px;
          color: ${C.charcoal};
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .emb-mobile-sub-item:hover { color: ${C.maroon}; }

        .emb-mobile-acc-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          font-size: 13.5px;
          color: ${C.charcoal};
          border-radius: 14px;
          cursor: pointer;
          background: ${C.cream};
          border: 1px solid ${C.border};
          transition: all 0.2s ease;
        }

        .emb-mobile-acc-link:hover {
          background: ${C.blush};
          color: ${C.maroon};
          border-color: ${C.goldBorder};
        }

        /* ── Responsive adjustments ── */
        @media (max-width: 1199px) and (min-width: 992px) {
          .emb-main-row   { padding: 0 24px !important; }
          .emb-nav-link   { padding: 5px 12px !important; font-size: 18.5px !important; }
          .emb-brand-title{ font-size: 30px !important; }
          .emb-brand-sub  { font-size: 8px !important; letter-spacing: 0.20em !important; }
          .emb-logo-icon-frame { width: 50px !important; height: 58px !important; }
        }

        @media (max-width: 991px) {
          .emb-nav-center { display: none !important; }
          .emb-main-row   { padding: 0 16px !important; height: 74px !important; }
          .emb-brand-title{ font-size: 28px !important; }
          .emb-brand-sub  { font-size: 7.5px !important; letter-spacing: 0.18em !important; margin-top: 3px !important; }
          .emb-logo-icon-frame { width: 46px !important; height: 52px !important; }
          .emb-icon-btn   { width: 38px !important; height: 38px !important; }
          .emb-badge      { min-width: 16px !important; height: 16px !important; font-size: 8.5px !important; }
          .emb-search-overlay-inner { padding: 14px 16px !important; }
        }

        @media (max-width: 575px) {
          .emb-main-row   { padding: 0 12px !important; height: 62px !important; }
          .emb-brand-title{ font-size: 22px !important; }
          .emb-brand-sub  { font-size: 6.5px !important; letter-spacing: 0.12em !important; }
          .emb-logo-icon-frame { width: 34px !important; height: 40px !important; }
          .emb-icon-btn   { width: 34px !important; height: 34px !important; }
          .emb-badge      { min-width: 15px !important; height: 15px !important; font-size: 8px !important; }
          .emb-icons-right{ gap: 8px !important; }
          .emb-promo-wrap { font-size: 11.5px !important; padding: 6px 0 !important; }
        }

        @media (max-width: 991px) { .d-lg-none { display: inline-flex !important; } }
        @media (min-width: 992px) {
          .d-lg-none  { display: none !important; }
          .d-lg-flex  { display: flex !important; }
          .d-lg-block { display: block !important; }
        }
      `}</style>

      {/* ── Top Promo Bar ── */}
      <PromoStrip />

      {/* ── Placeholder for fixed sticky header to prevent layout shift ── */}
      {scroll > 36 && <div className="emb-header-placeholder" aria-hidden="true" />}

      {/* ── Main Sticky Header ── */}
      <header className={`emb-header${scroll > 36 ? " is-sticky" : ""}`} style={{ ...S.header, ...(scroll > 36 ? S.headerStick : {}) }}>
        <div className="emb-main-row" style={S.mainRow}>

          {/* LEFT: BRAND LOGO & WORDMARK */}
          <Link to="/" className="emb-logo-wrap" style={S.logoWrap}>
            <div className="emb-logo-icon-frame" style={S.logoFrame}>
              <img
                className="emb-logo-icon"
                src={`${process.env.PUBLIC_URL}/vika-icon.png`}
                alt="Vika Vastra"
                style={S.logoIcon}
              />
            </div>
            <div className="emb-brand-wordmark">
              <div className="emb-brand-title">
                <span className="emb-brand-vika">VIKA</span>
                <span className="emb-brand-vastra">VASTRA</span>
              </div>
              <div className="emb-brand-sub">
                <span style={{ color: C.goldLight, fontSize: 6 }}>◆</span>
                <span style={{ color: C.goldLight }}>A HERITAGE IN EVERY DRAPE</span>
                <span style={{ color: C.goldLight, fontSize: 6 }}>◆</span>
              </div>
            </div>
          </Link>

          {/* CENTER: DESKTOP NAVIGATION MENU */}
          <nav className="emb-nav-center d-none d-lg-flex" style={S.navCenter} aria-label="Main navigation">
            <NavItem label="Home" to="/" />
            <NavItem label="About" to="/about" />
            <NavItem label="Shop" to="/shop" />

            <NavItem label="Collection">
              <div className="emb-cat-dropdown-header">
                <span className="emb-cat-dropdown-title">✦ Handcrafted Collections ✦</span>
              </div>

              {catLoading && <div style={{ padding: "16px", fontSize: 13, color: C.muted, fontStyle: "italic", textAlign: "center" }}>Curating collections…</div>}
              {catError   && <div style={{ padding: "16px", fontSize: 13, color: "#c0392b", textAlign: "center" }}>Could not load collections.</div>}
              {!catLoading && !catError && categories.length === 0 && (
                <div style={{ padding: "16px", fontSize: 13, color: C.muted, textAlign: "center" }}>No categories available.</div>
              )}

              {!catLoading && categories.length > 0 && (
                <div className="emb-cat-grid">
                  {categories.map((cat) => (
                    <CategoryDropItem
                      key={cat.id}
                      category={cat}
                      onClick={() => navigate(categoryPath(cat.name))}
                    />
                  ))}
                </div>
              )}

              <div className="emb-cat-dropdown-footer">
                <button className="emb-view-all-btn" onClick={() => navigate("/shop")}>
                  View All Sarees & Drapes <ChevronRight />
                </button>
              </div>
            </NavItem>

            <NavItem label="Contact" to="/contact" />
          </nav>

          {/* RIGHT: ACTION ICONS */}
          <div className="emb-icons-right" style={S.iconsRight}>

            {/* Search Trigger */}
            <button
              className={`emb-icon-btn${searchOpen ? " active" : ""}`}
              style={S.iconBtn}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <IconSearch />
            </button>

            {/* Wishlist Trigger */}
            <button
              className="emb-icon-btn"
              style={S.iconBtn}
              onClick={openWishlistDrawer}
              aria-label="Wishlist"
            >
              <IconHeart />
              {wishlistItems?.length > 0 && (
                <span className="emb-badge" style={S.badge}>{wishlistItems.length}</span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              className="emb-icon-btn"
              style={S.iconBtn}
              onClick={openCartDrawer}
              aria-label="Cart"
            >
              <IconCart />
              {cartItems?.length > 0 && (
                <span className="emb-badge" style={S.badge}>{cartItems.length}</span>
              )}
            </button>

            {/* User Account (Desktop Only) */}
            <div
              className="d-none d-lg-block"
              style={{ position: "relative" }}
              onMouseEnter={() => { clearTimeout(accCloseTimer.current); setAccOpen(true); }}
              onMouseLeave={() => { accCloseTimer.current = setTimeout(() => setAccOpen(false), 160); }}
            >
              <button className="emb-icon-btn" style={S.iconBtn} aria-label="Account">
                <IconUser />
              </button>

              {accOpen && (
                <div className="emb-acc-dropdown" style={S.accDropdown}>
                  <div className="emb-acc-header">
                    <span className="emb-acc-tag">{isLoggedIn ? "Account Overview" : "Welcome"}</span>
                  </div>

                  {isLoggedIn ? (
                    <>
                      <Link to="/my-account" className="emb-acc-item" style={S.dropItem}>
                        <span className="emb-acc-icon" style={S.dropIcon}><IconMyAccount /></span>
                        <span>My Account</span>
                      </Link>
                      <Link to="/my-orders" className="emb-acc-item" style={S.dropItem}>
                        <span className="emb-acc-icon" style={S.dropIcon}><IconMyOrders /></span>
                        <span>My Orders</span>
                      </Link>
                      <button onClick={handleLogout} className="emb-acc-logout" style={{ ...S.dropItem, color: "#c0392b" }}>
                        <span className="emb-acc-icon-danger" style={{ ...S.dropIcon, background: "#fdf0f0", color: "#c0392b", borderColor: "#fcdada" }}>
                          <IconLogout />
                        </span>
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link to="/login-register" className="emb-acc-item" style={S.dropItem}>
                      <span className="emb-acc-icon" style={S.dropIcon}><IconLogin /></span>
                      <span>Sign In / Register</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger (Mobile Only) */}
            <button
              className="emb-icon-btn d-lg-none"
              style={S.iconBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <IconMenu />
            </button>

          </div>
        </div>

        {/* ── Slide-down Search Overlay ── */}
        <div
          ref={searchOverlayRef}
          className={`emb-search-overlay${searchOpen ? " open" : ""}`}
          style={S.searchOverlay}
          role="search"
          aria-hidden={!searchOpen}
        >
          <div className="emb-search-overlay-inner" style={S.searchOverlayInner}>
            <div style={S.searchBarRow}>
              <div style={S.searchInputWrapper}>
                <span style={{ color: C.maroon, display: "inline-flex", marginRight: 8 }}>
                  <IconSearch />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search bridal silks, kanjivaram, sarees, fabrics…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={S.searchInput}
                  tabIndex={searchOpen ? 0 : -1}
                  autoComplete="off"
                />
              </div>

              <button
                style={{
                  ...S.searchBtn,
                  opacity: searchInput.trim() ? 1 : 0.6,
                  cursor: searchInput.trim() ? "pointer" : "default",
                }}
                onClick={() => handleSearch()}
                disabled={!searchInput.trim()}
                aria-label="Search"
              >
                <span>Search</span>
              </button>

              <button
                style={S.searchCloseBtn}
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <IconClose />
              </button>
            </div>

            {/* Popular Search Suggestions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingLeft: 4 }}>
              <span style={{ fontSize: 12.5, color: C.goldLight, fontWeight: 600, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}>Popular:</span>
              {searchSuggestions.map((tag) => (
                <button
                  key={tag}
                  className="emb-search-suggestion-pill"
                  onClick={() => handleSearch(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
        catLoading={catLoading}
        catError={catError}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        navigate={navigate}
        openWishlistDrawer={openWishlistDrawer}
        openCartDrawer={openCartDrawer}
        wishlistCount={wishlistItems?.length || 0}
        cartCount={cartItems?.length || 0}
      />
    </>
  );
};

HeaderOne.propTypes = {
  shop: PropTypes.shape({
    wishlistItems:      PropTypes.array,
    cartItems:          PropTypes.array,
    openCartDrawer:     PropTypes.func,
    openWishlistDrawer: PropTypes.func,
  }).isRequired,
};

export default HeaderOne;