// src/pages/other/LoginRegister.js
import { Fragment, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import LayoutOne from "../../layouts/LayoutOne";
import { registerUser, verifyRegistrationOtp, loginUser, addToCart as apiAddToCart, addToWishlist as apiAddToWishlist } from "../../api";
import { clearPendingShopAction } from "../../utils/shopActions";

const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700;800&family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');

  .lr-page {
    background: radial-gradient(circle at 50% 12%, rgba(251, 236, 215, 0.55) 0%, #FAF6F0 50%, #F5EFE6 100%);
    min-height: calc(100vh - 160px);
    display: flex;
    align-items: center;
    padding: 50px 0 70px;
    position: relative;
  }
  .lr-card {
    background: #FFFFFF;
    border: 1.5px solid rgba(197, 155, 39, 0.45);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 16px 50px rgba(114, 14, 30, 0.10), 0 4px 18px rgba(197, 155, 39, 0.14);
    max-width: 540px;
    margin: 0 auto;
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .lr-card::before {
    content: '';
    display: block;
    height: 4px;
    background: linear-gradient(90deg, #720E1E 0%, #DFB143 50%, #720E1E 100%);
  }

  /* ── Brand Heritage Header ── */
  .lr-brand-header {
    padding: 30px 24px 20px;
    text-align: center;
    background: linear-gradient(180deg, #FFFDFB 0%, #FAF6F0 100%);
    border-bottom: 1px solid rgba(197, 155, 39, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .lr-brand-frame {
    width: 52px;
    height: 60px;
    border-radius: 26px 26px 12px 12px;
    background: #FFFFFF;
    border: 2px solid rgba(197, 155, 39, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    box-shadow: 0 6px 16px rgba(114, 14, 30, 0.12);
    margin-bottom: 12px;
    transition: transform 0.25s ease;
  }
  .lr-brand-frame:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(197, 155, 39, 0.25);
  }
  .lr-brand-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
  .lr-brand-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.05em;
    line-height: 1.1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lr-brand-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    letter-spacing: 0.24em;
    color: #720E1E;
    text-transform: uppercase;
    font-weight: 700;
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .lr-brand-sub span {
    color: #C59B27;
    font-size: 8px;
  }

  /* ── Tabs ── */
  .lr-tabs {
    display: flex;
    background: #FAF7F2;
    border-bottom: 1.5px solid rgba(197, 155, 39, 0.3);
  }
  .lr-tab {
    flex: 1;
    padding: 16px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8C7377;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    transition: all 0.25s ease;
  }
  .lr-tab:hover:not(.active) {
    color: #720E1E;
    background: rgba(197, 155, 39, 0.08);
  }
  .lr-tab.active {
    color: #720E1E !important;
    background: #FFFFFF;
    font-weight: 800;
  }
  .lr-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1.5px;
    left: 18%;
    right: 18%;
    height: 3px;
    background: linear-gradient(90deg, #720E1E, #DFB143);
    border-radius: 3px;
    box-shadow: 0 2px 6px rgba(197, 155, 39, 0.4);
  }

  /* ── Body ── */
  .lr-body { padding: 34px 38px 40px; }
  .lr-field { margin-bottom: 22px; }
  .lr-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5A0B17;
    margin-bottom: 8px;
  }
  .lr-input-wrap { position: relative; }
  .lr-input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #C59B27;
    font-size: 17px;
    pointer-events: none;
    transition: all 0.2s;
  }
  .lr-input {
    width: 100%;
    padding: 13px 14px 13px 44px;
    border: 1.5px solid rgba(197, 155, 39, 0.35);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    color: #32040C;
    background: #FFFFFF;
    outline: none;
    transition: all 0.25s ease;
    box-sizing: border-box;
  }
  .lr-input.has-eye { padding-right: 44px; }
  .lr-input:focus {
    border-color: #DFB143;
    background: #FFFFFF;
    box-shadow: 0 0 0 3.5px rgba(223, 177, 67, 0.2);
  }
  .lr-input-wrap:focus-within .lr-input-icon {
    color: #720E1E;
    transform: translateY(-50%) scale(1.1);
  }
  .lr-input::placeholder { color: #B5A8A3; }

  /* Eye toggle button */
  .lr-eye-btn {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #A38E92;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
    line-height: 1;
  }
  .lr-eye-btn:hover { color: #720E1E; }
  .lr-input-wrap:focus-within .lr-eye-btn { color: #C59B27; }

  .lr-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .lr-remember {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #777;
    cursor: pointer;
  }
  .lr-remember input[type="checkbox"] { width: 14px; height: 14px; accent-color: #720E1E; cursor: pointer; }
  .lr-forgot {
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    color: #720E1E;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: all 0.2s ease;
  }
  .lr-forgot:hover { color: #C59B27; text-decoration: underline; }

  /* ── Primary Submit Button ── */
  .lr-btn {
    display: block;
    width: 100%;
    padding: 15px;
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #380710 !important;
    background: linear-gradient(135deg, #C59B27 0%, #E5C365 52%, #CFA23A 100%) !important;
    border: 1px solid rgba(197, 155, 39, 0.75) !important;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(197, 155, 39, 0.35);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .lr-btn:hover {
    background: linear-gradient(135deg, #B88E20 0%, #DFBA58 52%, #C49727 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(197, 155, 39, 0.48);
    color: #380710 !important;
  }
  .lr-btn:active { transform: scale(0.99); }
  .lr-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  /* ── Alerts & Sync Banners ── */
  .lr-alert {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 22px;
    line-height: 1.5;
  }
  .lr-alert-error {
    background: #FFF1F0;
    border: 1.5px solid #F8B4B4;
    border-left: 4px solid #720E1E;
    color: #720E1E;
    font-weight: 600;
  }
  .lr-alert-success {
    background: #F0FDF4;
    border: 1.5px solid #86EFAC;
    border-left: 4px solid #16A34A;
    color: #166534;
    font-weight: 600;
  }
  .lr-sync-banner {
    background: linear-gradient(135deg, #FFF9F0 0%, #FBECD7 100%);
    border: 1.5px solid rgba(197, 155, 39, 0.5);
    border-left: 4px solid #720E1E;
    border-radius: 12px;
    padding: 13px 16px;
    margin-bottom: 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #5A0B17;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 14px rgba(197, 155, 39, 0.12);
  }
  .lr-banner-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #720E1E;
    color: #FBECD7;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(114, 14, 30, 0.25);
  }

  /* ── Switch & Terms ── */
  .lr-switch {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #6B5B5E;
    text-align: center;
    margin-top: 22px;
  }
  .lr-switch a {
    color: #720E1E;
    text-decoration: none;
    font-weight: 700;
    margin-left: 4px;
    transition: color 0.2s ease;
  }
  .lr-switch a:hover { color: #C59B27; text-decoration: underline; }
  .lr-terms {
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px;
    color: #8C7377;
    text-align: center;
    margin-top: 16px;
    line-height: 1.7;
  }
  .lr-terms a { color: #720E1E; text-decoration: none; font-weight: 600; }
  .lr-terms a:hover { color: #C59B27; text-decoration: underline; }

  @keyframes lrToastIn {
    from { transform: translateX(40px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes lrToastOut {
    from { transform: translateX(0);    opacity: 1; }
    to   { transform: translateX(40px); opacity: 0; }
  }

  @media (max-width: 600px) {
    .lr-body { padding: 26px 20px 32px; }
    .lr-card { border-radius: 18px; margin: 0 12px; }
    .lr-brand-header { padding: 24px 20px 18px; }
  }
`;

const CART_KEY     = "guest_cart";
const WISHLIST_KEY = "guest_wishlist";

const getPendingCartItem = () => {
  try { const p = localStorage.getItem("pendingCartItem"); return p ? JSON.parse(p) : null; }
  catch { return null; }
};
const getPendingWishlistItem = () => {
  try { const p = localStorage.getItem("pendingWishlistItem"); return p ? JSON.parse(p) : null; }
  catch { return null; }
};
const clearPendingItems = clearPendingShopAction;

const syncGuestCartToBackend = async (customerId) => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return;
    const items = JSON.parse(stored);
    if (!Array.isArray(items) || items.length === 0) return;
    await Promise.allSettled(
      items.map(item => apiAddToCart({
        customerId,
        productId: item.id ?? item.productId,
        name:      item.name,
        img:       item.img ?? (Array.isArray(item.image) ? item.image[0] : (item.image ?? "")),
        price:     item.price ?? item.salePrice ?? 0,
        quantity:  item.quantity ?? 1,
        weight:    item.weight ?? null,
      }))
    );
    localStorage.removeItem(CART_KEY);
    return true;
  } catch (err) { console.error("Cart sync failed:", err); return false; }
};

const syncGuestWishlistToBackend = async (customerId) => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (!stored) return;
    const items = JSON.parse(stored);
    if (!Array.isArray(items) || items.length === 0) return;
    await Promise.allSettled(
      items.map(item => apiAddToWishlist({
        customerId,
        productId: item.id ?? item.productId,
        name:      item.name,
        img:       item.img ?? (Array.isArray(item.image) ? item.image[0] : (item.image ?? "")),
        price:     item.price ?? item.salePrice ?? 0,
        stock:     item.stock,
        rating:    item.rating ?? 4.5,
        reviews:   item.reviews ?? 0,
      }))
    );
    localStorage.removeItem(WISHLIST_KEY);
    return true;
  } catch (err) { console.error("Wishlist sync failed:", err); return false; }
};

const addPendingCartItem = async (customerId, pendingItem) => {
  if (!pendingItem || !customerId) return false;
  try {
    await apiAddToCart({
      customerId,
      productId: pendingItem.id ?? pendingItem.productId,
      name:      pendingItem.name,
      img:       pendingItem.img ?? (Array.isArray(pendingItem.image) ? pendingItem.image[0] : (pendingItem.image ?? "")),
      price:     pendingItem.price ?? pendingItem.salePrice ?? 0,
      quantity:  pendingItem.quantity ?? 1,
      weight:    pendingItem.weight ?? null,
    });
    return true;
  } catch (err) { console.error("Failed to add pending cart item:", err); return false; }
};

const addPendingWishlistItem = async (customerId, pendingItem) => {
  if (!pendingItem || !customerId) return false;
  try {
    await apiAddToWishlist({
      customerId,
      productId: pendingItem.id ?? pendingItem.productId,
      name:      pendingItem.name,
      img:       pendingItem.img ?? (Array.isArray(pendingItem.image) ? pendingItem.image[0] : (pendingItem.image ?? "")),
      price:     pendingItem.price ?? pendingItem.salePrice ?? 0,
      stock:     pendingItem.stock,
      rating:    pendingItem.rating ?? 4.5,
      reviews:   pendingItem.reviews ?? 0,
    });
    return true;
  } catch (err) { console.error("Failed to add pending wishlist item:", err); return false; }
};

// ─── Eye Icon SVGs ────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Password input with eye toggle ──────────────────────────────────────────
const PasswordInput = ({ value, onChange, placeholder, className = "" }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="lr-input-wrap">
      <input
        className={`lr-input has-eye ${className}`}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required
        value={value}
        onChange={onChange}
      />
      <i className="pe-7s-lock lr-input-icon" />
      <button
        type="button"
        className="lr-eye-btn"
        onClick={() => setShow(v => !v)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );
};

// ─── Brand-matched LoginToast ─────────────────────────────────────────────────
const LR_TOAST_THEMES = {
  success: {
    border:    "#C9933A",
    iconBg:    "rgba(201,147,58,0.15)",
    iconColor: "#C9933A",
    icon:      "✓",
  },
  error: {
    border:    "#e05252",
    iconBg:    "rgba(224,82,82,0.15)",
    iconColor: "#e05252",
    icon:      "✕",
  },
};

const LoginToast = ({ message, type = "success", onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress,  setProgress]  = useState(100);
  const onCloseRef = useRef(onClose);
  const theme = LR_TOAST_THEMES[type] || LR_TOAST_THEMES.success;

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!message) return;
    setIsExiting(false);
    setProgress(100);

    const startTime = Date.now();
    const duration  = 3000;

    const interval = setInterval(() => {
      const elapsed   = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 16);

    const exitTimer  = setTimeout(() => setIsExiting(true),          duration - 300);
    const closeTimer = setTimeout(() => { onCloseRef.current?.(); }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [message]);

  if (!message) return null;

  return (
    <div style={{
      position:  "fixed",
      top:       "24px",
      right:     "24px",
      zIndex:    99999,
      animation: isExiting ? "lrToastOut 0.3s ease forwards" : "lrToastIn 0.35s ease",
      maxWidth:  "360px",
      minWidth:  "280px",
    }}>
      <div style={{
        background:   "#38050E",
        border:       `1px solid ${theme.border}`,
        borderRadius: "10px",
        overflow:     "hidden",
        boxShadow:    "0 8px 32px rgba(114,14,30,0.28)",
      }}>
        <div style={{ height: "3px", background: `linear-gradient(90deg, #720E1E 0%, ${theme.border} 100%)` }} />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 15px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: theme.iconBg, border: `1px solid ${theme.border}`,
            borderRadius: "8px", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            color: theme.iconColor, fontSize: "16px", fontWeight: 700,
          }}>
            {theme.icon}
          </div>

          <div style={{ flex: 1, fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#F8F6F2", lineHeight: 1.45 }}>
            {message}
          </div>

          <button
            onClick={() => onCloseRef.current?.()}
            style={{
              background: "rgba(248,246,242,0.08)", border: "1px solid rgba(248,246,242,0.12)",
              borderRadius: "6px", width: "24px", height: "24px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(248,246,242,0.5)",
              flexShrink: 0, fontSize: "12px", lineHeight: 1, transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = "rgba(201,147,58,0.18)";
              e.currentTarget.style.borderColor = "#C9933A";
              e.currentTarget.style.color       = "#C9933A";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = "rgba(248,246,242,0.08)";
              e.currentTarget.style.borderColor = "rgba(248,246,242,0.12)";
              e.currentTarget.style.color       = "rgba(248,246,242,0.5)";
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ height: "3px", background: "rgba(248,246,242,0.08)" }}>
          <div style={{ height: "100%", background: theme.border, width: `${progress}%`, transition: "width 0.016s linear" }} />
        </div>
      </div>
    </div>
  );
};

// ─── LoginRegister ────────────────────────────────────────────────────────────
const LoginRegister = ({ shop }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [activeTab,    setActiveTab]    = useState("login");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType,    setToastType]    = useState("success");

  const pendingAction = new URLSearchParams(location.search).get("pending") ||
                        localStorage.getItem("pendingAction");

  const guestCartCount     = (() => { try { return (JSON.parse(localStorage.getItem(CART_KEY)) || []).length; } catch { return 0; } })();
  const guestWishlistCount = (() => { try { return (JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []).length; } catch { return 0; } })();
  const hasPendingItems    = guestCartCount > 0 || guestWishlistCount > 0;

  const [loginData,    setLoginData]    = useState({ email: "", password: "" });
  const [loginError,   setLoginError]   = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [regData,    setRegData]    = useState({ username: "", email: "", password: "", phone: "" });
  const [regError,   setRegError]   = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regOtpRequired, setRegOtpRequired] = useState(false);
  const [regOtp, setRegOtp] = useState("");

  const switchTab = (tab) => {
    setActiveTab(tab);
    setLoginError(""); setRegError(""); setRegSuccess("");
    if (tab !== "register") { setRegOtpRequired(false); setRegOtp(""); }
  };

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleLogin = async (e) => {

  e.preventDefault();

  setLoginError("");
  setLoginLoading(true);

  try {

    // =====================================
    // LOGIN API
    // =====================================

    const res = await loginUser({
      email: loginData.email,
      password: loginData.password
    });

    await completeLogin(res);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    const msg = err.response?.data?.message || err.response?.data?.error || "Login failed. Please try again.";
    setLoginError(msg);
    setLoginSuccess(false);
    showToast(msg, "error");
  } finally {
    setLoginLoading(false);
  }
};

  const completeLogin = async (res) => {
    console.log("LOGIN RESPONSE:", res.data);

    // =====================================
    // GET USER DATA
    // =====================================

    const userData =
      res.data.user ||
      res.data.data ||
      res.data;

    // =====================================
    // CREATE CLEAN USER OBJECT
    // =====================================

    const user = {
      id:
        userData.id ||
        userData.customerId ||
        userData.customer_id,

      username:
        userData.username ||
        userData.name,

      email:
        userData.email,

      phone:
        userData.phone
    };

    console.log("FINAL USER:", user);

    // =====================================
    // SAVE USER
    // =====================================

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "customer",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "customerId",
      String(user.id)
    );

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    console.log(
      "LOCAL STORAGE USER:",
      JSON.parse(localStorage.getItem("user"))
    );

    // =====================================
    // PENDING ITEMS
    // =====================================

    const pendingCartItem =
      getPendingCartItem();

    const pendingWishlistItem =
      getPendingWishlistItem();

    const pendingActionType =
      localStorage.getItem("pendingAction");

    let addedMessage = "";

    // =====================================
    // SYNC CART & WISHLIST
    // =====================================

    await Promise.all([
      syncGuestCartToBackend(user.id),
      syncGuestWishlistToBackend(user.id),
    ]);

    // =====================================
    // ADD PENDING CART ITEM
    // =====================================

    if (
      pendingCartItem &&
      pendingActionType === "cart"
    ) {

      await addPendingCartItem(
        user.id,
        pendingCartItem
      );

      addedMessage =
        `"${pendingCartItem.name}" added to your cart!`;
    }

    // =====================================
    // ADD PENDING WISHLIST ITEM
    // =====================================

    else if (
      pendingWishlistItem &&
      pendingActionType === "wishlist"
    ) {

      await addPendingWishlistItem(
        user.id,
        pendingWishlistItem
      );

      addedMessage =
        `"${pendingWishlistItem.name}" added to your wishlist!`;
    }

    // =====================================
    // CLEAR PENDING
    // =====================================

    clearPendingItems();

    // =====================================
    // EVENTS
    // =====================================

    window.dispatchEvent(
      new Event("authChange")
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );

    window.dispatchEvent(
      new Event("storage")
    );

    await Promise.allSettled([
      shop?.refreshCart?.(),
      shop?.refreshWishlist?.()
    ]);

    // =====================================
    // SUCCESS
    // =====================================

    setLoginSuccess(true);

    showToast(
      addedMessage ||
      (
        hasPendingItems
          ? "Cart and wishlist synced!"
          : "Welcome back!"
      ),
      "success"
    );

    // =====================================
    // REDIRECT
    // =====================================

    setTimeout(() => {

      const from =
        location.state?.from?.pathname ||

        (
          pendingActionType === "cart"
            ? "/cart"

            : pendingActionType === "wishlist"
              ? "/wishlist"
              : process.env.PUBLIC_URL + "/"
        );

      navigate(from);

    }, 1500);

};

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError(""); setRegSuccess("");
    if (!regData.phone.trim()) {
      setRegError("Phone number is required.");
      showToast("Phone number is required.", "error");
      return;
    }
    if (regData.password.length < 8) {
      setRegError("Password must be at least 8 characters.");
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    setRegLoading(true);
    try {
      if (regOtpRequired) {
        await verifyRegistrationOtp(regData.email, regOtp);
        setRegSuccess("Account verified and created! You can now sign in.");
        showToast("Account verified successfully. Please sign in.", "success");
        setRegData({ username: "", email: "", password: "", phone: "" });
        setRegOtpRequired(false);
        setRegOtp("");
        setTimeout(() => switchTab("login"), 1800);
      } else {
        const res = await registerUser({
          username: regData.username,
          email:    regData.email,
          password: regData.password,
          phone:    regData.phone.trim(),
        });
        if (res.data.requiresOtp) {
          setRegOtpRequired(true);
          setRegSuccess("We sent a verification code to your email.");
          showToast("Check your email for the verification code.", "success");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Registration failed. Please try again.";
      setRegError(msg);
      showToast(msg, "error");
    } finally { setRegLoading(false); }
  };

  return (
    <Fragment>
      <style>{loginStyles}</style>

      <LayoutOne shop={shop} headerTop="visible">
        <LoginToast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        <div className="lr-page">
          <div className="container">
            <div className="lr-card">

              {loginSuccess && (
                <div className="lr-alert lr-alert-success" style={{ margin: "16px 16px 0 16px" }}>
                  ✓ Login successful! Redirecting...
                </div>
              )}

              {/* ── Brand Heritage Header ── */}
              <div className="lr-brand-header">
                <div className="lr-brand-frame">
                  <img
                    src={`${process.env.PUBLIC_URL}/vika-icon.png`}
                    alt="Vika Vastra"
                    className="lr-brand-icon"
                  />
                </div>
                <div className="lr-brand-name">
                  <span style={{ color: "#720E1E" }}>VIKA </span>
                  <span style={{ color: "#C59B27", marginLeft: 6 }}>VASTRA</span>
                </div>
                <div className="lr-brand-sub">
                  <span>✦</span> A HERITAGE IN EVERY DRAPE <span>✦</span>
                </div>
              </div>

              <div className="lr-tabs">
                <button className={`lr-tab ${activeTab === "login"    ? "active" : ""}`} onClick={() => switchTab("login")}>Sign In</button>
                <button className={`lr-tab ${activeTab === "register" ? "active" : ""}`} onClick={() => switchTab("register")}>Create Account</button>
              </div>

              {/* ── LOGIN FORM ── */}
              {activeTab === "login" && (
                <div className="lr-body">
                  <form onSubmit={handleLogin}>
                    {pendingAction === "cart" && (
                      <div className="lr-sync-banner">
                        <span className="lr-banner-icon">🛒</span>
                        <span>Please login to add this item to your cart.</span>
                      </div>
                    )}
                    {pendingAction === "wishlist" && (
                      <div className="lr-sync-banner">
                        <span className="lr-banner-icon">♥</span>
                        <span>Please login to add this item to your wishlist.</span>
                      </div>
                    )}
                    {hasPendingItems && !pendingAction && (
                      <div className="lr-sync-banner">
                        <span className="lr-banner-icon">🛍️</span>
                        <div>
                          You have{" "}
                          {guestCartCount > 0 && <strong>{guestCartCount} cart item{guestCartCount > 1 ? "s" : ""}</strong>}
                          {guestCartCount > 0 && guestWishlistCount > 0 && " and "}
                          {guestWishlistCount > 0 && <strong>{guestWishlistCount} wishlist item{guestWishlistCount > 1 ? "s" : ""}</strong>}
                          {" "}saved. They'll be added to your account on sign in.
                        </div>
                      </div>
                    )}

                    {loginError && <div className="lr-alert lr-alert-error">{loginError}</div>}

                    <div className="lr-field">
                      <label className="lr-label">Email Address</label>
                      <div className="lr-input-wrap">
                        <input className="lr-input" type="email" placeholder="you@example.com" required
                          value={loginData.email} onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))} />
                        <i className="pe-7s-mail lr-input-icon" />
                      </div>
                    </div>

                    <div className="lr-field">
                      <label className="lr-label">Password</label>
                      <PasswordInput
                        value={loginData.password}
                        onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="lr-meta">
                      <label className="lr-remember"></label>
                      <Link to={process.env.PUBLIC_URL + "/forgot-password"} className="lr-forgot">
                        Forgot Password?
                      </Link>
                    </div>

                    <button type="submit" className="lr-btn" disabled={loginLoading}>
                      {loginLoading ? "Signing In…" : "Sign In"}
                    </button>

                    <p className="lr-switch">
                      Don't have an account?{" "}
                      <a href="#!" onClick={e => { e.preventDefault(); switchTab("register"); }}>Create one</a>
                    </p>
                  </form>
                </div>
              )}

              {/* ── REGISTER FORM ── */}
              {activeTab === "register" && (
                <div className="lr-body">
                  <form onSubmit={handleRegister}>
                    {regError   && <div className="lr-alert lr-alert-error">{regError}</div>}
                    {regSuccess && <div className="lr-alert lr-alert-success">{regSuccess}</div>}

                    {!regOtpRequired && <>
                      <div className="lr-field">
                      <label className="lr-label">Full Name</label>
                      <div className="lr-input-wrap">
                        <input className="lr-input" type="text" placeholder="Your name" required
                          value={regData.username} onChange={e => setRegData(p => ({ ...p, username: e.target.value }))} />
                        <i className="pe-7s-user lr-input-icon" />
                      </div>
                    </div>

                    <div className="lr-field">
                      <label className="lr-label">Email Address</label>
                      <div className="lr-input-wrap">
                        <input className="lr-input" type="email" placeholder="you@example.com" required
                          value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} />
                        <i className="pe-7s-mail lr-input-icon" />
                      </div>
                    </div>

                    <div className="lr-field">
                      <label className="lr-label">Password</label>
                      <PasswordInput
                        value={regData.password}
                        onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                        placeholder="Min. 8 characters"
                      />
                    </div>

                    <div className="lr-field">
                      <label className="lr-label">Phone Number</label>
                      <div className="lr-input-wrap">
                        <input className="lr-input" type="tel" placeholder="+91 00000 00000" required
                          value={regData.phone} onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))} />
                        <i className="pe-7s-call lr-input-icon" />
                      </div>
                    </div>
                    </>}

                    {regOtpRequired && (
                      <div className="lr-field">
                        <label className="lr-label">Email Verification Code</label>
                        <div className="lr-input-wrap">
                          <input className="lr-input" type="text" inputMode="numeric" autoComplete="one-time-code"
                            placeholder="Enter 6-digit code" maxLength={6} required
                            value={regOtp} onChange={e => setRegOtp(e.target.value.replace(/\D/g, ""))} />
                        </div>
                        <p className="lr-switch">Check your email for the code. It expires in 10 minutes.</p>
                      </div>
                    )}

                    <button type="submit" className="lr-btn" disabled={regLoading}>
                      {regLoading ? (regOtpRequired ? "Verifying…" : "Sending Code…") : (regOtpRequired ? "Verify Code" : "Create Account")}
                    </button>

                    <p className="lr-terms">
                      By registering you agree to our{" "}
                      <Link to={process.env.PUBLIC_URL + "/"}>Terms of Service</Link>{" "}&amp;{" "}
                      <Link to={process.env.PUBLIC_URL + "/"}>Privacy Policy</Link>.
                    </p>

                    <p className="lr-switch">
                      Already have an account?{" "}
                      <a href="#!" onClick={e => { e.preventDefault(); switchTab("login"); }}>Sign in</a>
                    </p>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default LoginRegister;
