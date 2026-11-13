// src/pages/other/Checkout.js
import { Fragment, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getDiscountPrice } from "../../helpers/product";
import { formatVariantLabel } from "../../utils/variantDisplay";
import LayoutOne from "../../layouts/LayoutOne";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getCustomerId = () => {
  try {
    const user     = JSON.parse(localStorage.getItem("user")     || "null");
    const customer = JSON.parse(localStorage.getItem("customer") || "null");
    return user?.id ?? customer?.id ?? null;
  } catch { return null; }
};

const C = {
  gold: "#B38728",
  goldLt: "#faf8f5",
  goldGradient: "linear-gradient(45deg, #BF953F 0%, #B38728 100%)",
  dark: "#1a1a1a",
  border: "#e7dfd2",
  white: "#faf8f5",
};

const checkoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600;700&display=swap');

  .co-page { background: #faf8f5; padding: 60px 0 90px; min-height: 80vh; }
  .co-page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; letter-spacing: 0.01em; }
  .co-page-sub { font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #B38728; margin: 0 0 36px; }

  .co-card { background: #fff; border: 1px solid #e7dfd2; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 28px rgba(26,16,64,0.06); margin-bottom: 24px; }
  .co-card::before { content: ''; display: block; height: 3px; background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); }
  .co-card-body { padding: 28px 30px 32px; }

  .co-section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
  .co-section-divider { width: 36px; height: 2px; background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); border-radius: 2px; margin-bottom: 24px; }

  .co-label { display: block; font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #888; margin-bottom: 7px; }
  .co-label-error { color: #c0392b !important; }

  .co-input { width: 100%; padding: 12px 14px; border: 1px solid #e7dfd2; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 14px; color: #1a1a1a; background: #faf8f5; outline: none; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .co-input:focus { border-color: #B38728; background: #fff; box-shadow: 0 0 0 3px rgba(179,135,40,0.12); }
  .co-input::placeholder { color: #c8c2b8; }
  .co-input.co-input--error { border-color: #e74c3c !important; background: #fff8f7; box-shadow: 0 0 0 3px rgba(231,76,60,0.10) !important; animation: co-shake 0.35s ease; }

  .co-select { width: 100%; padding: 12px 14px; border: 1px solid #e7dfd2; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 14px; color: #1a1a1a; background: #faf8f5; outline: none; box-sizing: border-box; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B38728' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
  .co-select:focus { border-color: #B38728; background-color: #fff; box-shadow: 0 0 0 3px rgba(179,135,40,0.12); }
  .co-select.co-input--error { border-color: #e74c3c !important; background-color: #fff8f7; box-shadow: 0 0 0 3px rgba(231,76,60,0.10) !important; animation: co-shake 0.35s ease; }

  .co-error-msg { font-family: 'Jost', sans-serif; font-size: 11px; color: #c0392b; margin-top: 5px; letter-spacing: 0.02em; display: flex; align-items: center; gap: 4px; }
  .co-error-msg::before { content: '!'; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: #c0392b; color: #fff; border-radius: 50%; font-size: 9px; font-weight: 700; flex-shrink: 0; }

  .co-error-banner { background: #fdf3f2; border: 1px solid #f5c6c2; border-left: 4px solid #e74c3c; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px; font-family: 'Jost', sans-serif; font-size: 13px; color: #922b21; line-height: 1.6; }
  .co-error-banner strong { display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.02em; }

  .co-field { margin-bottom: 18px; }

  .co-textarea { width: 100%; padding: 12px 14px; border: 1px solid #e7dfd2; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 14px; color: #1a1a1a; background: #faf8f5; outline: none; box-sizing: border-box; resize: vertical; min-height: 110px; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
  .co-textarea:focus { border-color: #B38728; background: #fff; box-shadow: 0 0 0 3px rgba(179,135,40,0.12); }
  .co-textarea::placeholder { color: #c8c2b8; }

  .co-checkbox-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; padding: 12px 14px; background: #faf8f5; border: 1px solid #e7dfd2; border-radius: 5px; cursor: pointer; }
  .co-checkbox-row input[type="checkbox"] { width: 15px; height: 15px; accent-color: #B38728; cursor: pointer; flex-shrink: 0; }
  .co-checkbox-label { font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 500; color: #1a1a1a; margin: 0; cursor: pointer; letter-spacing: 0.02em; }

  .co-shipping-disabled { opacity: 0.45; pointer-events: none; transition: opacity 0.3s ease; }

  .co-zone-loading { font-family: 'Jost', sans-serif; font-size: 13px; color: #888; padding: 10px 0; }
  .co-zone-available { display: flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 5px; padding: 11px 14px; margin-top: 10px; font-family: 'Jost', sans-serif; font-size: 13px; color: #166534; }
  .co-zone-unavailable { display: flex; align-items: center; gap: 8px; background: #fff8f0; border: 1px solid #f5ddb8; border-radius: 5px; padding: 11px 14px; margin-top: 10px; font-family: 'Jost', sans-serif; font-size: 13px; color: #b45309; }

  .co-summary-card { position: sticky; top: 24px; }
  .co-summary-body { padding: 28px 28px 32px; }

  .co-order-header { display: flex; justify-content: space-between; padding: 0 0 12px; border-bottom: 1px solid #e7dfd2; margin-bottom: 4px; }
  .co-order-header span { font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #B38728; }

  .co-order-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 11px 0; border-bottom: 1px solid #faf8f5; }
  .co-order-item-name { font-family: 'Jost', sans-serif; font-size: 13px; color: #444444; font-weight: 500; flex: 1; padding-right: 12px; line-height: 1.4; }
  .co-order-item-price { font-family: 'Jost', sans-serif; font-size: 13px; color: #1a1a1a; font-weight: 600; white-space: nowrap; }
  .co-variant-label { display: table; margin-top: 5px; padding: 3px 8px; border-radius: 999px; background: #fff8eb; color: #80591f; border: 1px solid #f0dfbf; font-size: 11px; font-weight: 600; }

  .co-summary-line { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #faf8f5; }
  .co-summary-line-label { font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 500; color: #888; letter-spacing: 0.04em; }
  .co-summary-line-value { font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 600; color: #1a1a1a; }
  .co-summary-line-value.free { color: #27ae60; }
  .co-summary-line-value.pending { color: #aaa; font-style: italic; font-weight: 400; }
  .co-summary-line-value.unavailable { color: #b45309; }
  .co-summary-line-value.charge { color: #b45309; }
  .co-summary-line-value.discount { color: #27ae60; }

  .co-order-total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0 0; }
  .co-order-total-label { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #1a1a1a; }
  .co-order-total-value { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  .co-coupon-section { margin: 18px 0 4px; }
  .co-coupon-dropdown-wrap { position: relative; }
  .co-coupon-dropdown-select { width: 100%; padding: 11px 40px 11px 14px; border: 1px solid #e7dfd2; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 13px; color: #1a1a1a; background: #faf8f5; outline: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B38728' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
  .co-coupon-dropdown-select:focus { border-color: #B38728; background-color: #fff; box-shadow: 0 0 0 3px rgba(179,135,40,0.12); }
  .co-coupon-dropdown-select:disabled { opacity: 0.55; cursor: not-allowed; }
  .co-coupon-dropdown-row { display: flex; gap: 8px; align-items: stretch; }
  .co-coupon-dropdown-row .co-coupon-dropdown-select { flex: 1; }
  .co-coupon-btn { padding: 10px 16px; border: none; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s, transform 0.12s; white-space: nowrap; }
  .co-coupon-btn:active { transform: scale(0.97); }
  .co-coupon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .co-coupon-btn-apply { background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); color: #fff; }
  .co-coupon-btn-apply:hover:not(:disabled) { opacity: 0.88; }
  .co-coupon-btn-remove { background: #f4f0eb; color: #888; border: 1px solid #e7dfd2; }
  .co-coupon-btn-remove:hover:not(:disabled) { background: #ece6de; color: #1a1a1a; }
  .co-coupon-preview-card { margin-top: 10px; background: #faf8f5; border: 1px solid #e7dfd2; border-radius: 6px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .co-coupon-preview-left { flex: 1; }
  .co-coupon-preview-code { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #1a1a1a; letter-spacing: 0.04em; margin-bottom: 2px; }
  .co-coupon-preview-desc { font-family: 'Jost', sans-serif; font-size: 11.5px; color: #777; line-height: 1.5; }
  .co-coupon-preview-badge { background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); color: #fff; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
  .co-coupon-success { display: flex; align-items: center; gap: 7px; margin-top: 9px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 5px; padding: 9px 13px; font-family: 'Jost', sans-serif; font-size: 12px; color: #166534; font-weight: 500; }
  .co-coupon-error { margin-top: 7px; font-family: 'Jost', sans-serif; font-size: 11px; color: #c0392b; display: flex; align-items: center; gap: 4px; }
  .co-coupon-error::before { content: '!'; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: #c0392b; color: #fff; border-radius: 50%; font-size: 9px; font-weight: 700; flex-shrink: 0; }
  .co-coupon-loading { margin-top: 7px; font-family: 'Jost', sans-serif; font-size: 11px; color: #888; letter-spacing: 0.04em; }
  .co-coupon-applying { margin-top: 7px; font-family: 'Jost', sans-serif; font-size: 11px; color: #888; letter-spacing: 0.04em; }

  .co-place-order-btn { display: block; width: 100%; margin-top: 24px; padding: 15px; text-align: center; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); border: none; border-radius: 4px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 4px 20px rgba(179,135,40,0.22); }
  .co-place-order-btn:hover { opacity: 0.88; }
  .co-place-order-btn:active { transform: scale(0.99); }
  .co-place-order-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .co-razorpay-badge { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; }
  .co-razorpay-badge span { font-family: 'Jost', sans-serif; font-size: 10px; color: #bbb; letter-spacing: 0.04em; }

  .co-empty { text-align: center; padding: 80px 20px; }
  .co-empty i { font-size: 64px; background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: block; margin-bottom: 20px; }
  .co-empty-text { font-family: 'Jost', sans-serif; font-size: 15px; color: #888; margin-bottom: 20px; line-height: 1.7; }
  .co-empty-link { display: inline-block; padding: 12px 32px; background: linear-gradient(45deg, #BF953F 0%, #B38728 100%); color: #fff; border-radius: 4px; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; text-decoration: none; transition: opacity 0.2s; }
  .co-empty-link:hover { opacity: 0.85; color: #fff; }

  /* ── Saved Address Cards ── */
  .co-saved-addr-section { margin-bottom: 22px; }
  .co-saved-addr-label { font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #B38728; margin-bottom: 12px; }
  .co-saved-addr-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .co-saved-addr-card { display: flex; align-items: flex-start; gap: 12px; border: 1.5px solid #e7dfd2; border-radius: 7px; padding: 14px 16px; cursor: pointer; background: #fff; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; font-family: 'Jost', sans-serif; }
  .co-saved-addr-card:hover { border-color: #B38728; background: #fffdf7; }
  .co-saved-addr-card.selected { border-color: #B38728; background: #fffdf0; box-shadow: 0 0 0 3px rgba(179,135,40,0.13); }
  .co-saved-addr-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #ccc; flex-shrink: 0; margin-top: 2px; transition: border-color 0.2s, background 0.2s; display: flex; align-items: center; justify-content: center; }
  .co-saved-addr-card.selected .co-saved-addr-radio { border-color: #B38728; background: #B38728; }
  .co-saved-addr-card.selected .co-saved-addr-radio::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff; }
  .co-saved-addr-info { flex: 1; }
  .co-saved-addr-name { font-size: 13px; font-weight: 700; color: #222; margin-bottom: 3px; }
  .co-saved-addr-text { font-size: 12px; color: #666; line-height: 1.55; }
  .co-saved-addr-meta { font-size: 11px; color: #999; margin-top: 3px; }
  .co-saved-addr-badge { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 8px; border-radius: 10px; margin-left: 6px; }
  .co-saved-addr-badge.billing { background: #e8f0fe; color: #1a56db; }
  .co-saved-addr-badge.shipping { background: #fef3e8; color: #b45309; }
  .co-saved-addr-divider { display: flex; align-items: center; gap: 10px; margin: 6px 0 16px; }
  .co-saved-addr-divider-line { flex: 1; height: 1px; background: #e7dfd2; }
  .co-saved-addr-divider-text { font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 600; color: #bbb; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }

  /* ── Location Details Group ── */
  .co-location-group { background: #faf8f5; border: 1px solid #e7dfd2; border-radius: 6px; padding: 18px 18px 4px; margin-bottom: 18px; }
  .co-location-group-title { font-family: 'Jost', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #B38728; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .co-location-group-title::after { content: ''; flex: 1; height: 1px; background: #e7dfd2; }

  @keyframes co-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes co-pulse-ring { 0%{transform:scale(0.85);opacity:0.6} 50%{transform:scale(1.1);opacity:0.2} 100%{transform:scale(0.85);opacity:0.6} }
  @keyframes co-fade-in { from{opacity:0} to{opacity:1} }
  @keyframes co-slide-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

  .co-payment-overlay { position:fixed; inset:0; z-index:99999; background:rgba(250,248,245,0.96); backdrop-filter:blur(6px); display:flex; flex-direction:column; align-items:center; justify-content:center; animation:co-fade-in 0.25s ease; }
  .co-payment-overlay-inner { display:flex; flex-direction:column; align-items:center; gap:20px; animation:co-slide-up 0.35s ease 0.1s both; }
  .co-spinner-wrap { position:relative; width:72px; height:72px; }
  .co-spinner-ring { position:absolute; inset:0; border-radius:50%; background:linear-gradient(135deg,#BF953F,#B38728); opacity:0.15; animation:co-pulse-ring 1.6s ease-in-out infinite; }
  .co-spinner { position:absolute; inset:6px; border-radius:50%; border:3px solid transparent; border-top-color:#B38728; border-right-color:#BF953F; animation:co-spin 0.75s linear infinite; }
  .co-spinner-icon { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:22px; }
  .co-overlay-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:#1a1a1a; letter-spacing:0.01em; }
  .co-overlay-sub { font-family:'Jost',sans-serif; font-size:12px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#B38728; margin-top:-10px; }
  .co-overlay-dots { display:flex; gap:6px; margin-top:4px; }
  .co-overlay-dot { width:6px; height:6px; border-radius:50%; background:#B38728; opacity:0.3; animation:co-pulse-ring 1.2s ease-in-out infinite; }
  .co-overlay-dot:nth-child(2) { animation-delay:0.2s; }
  .co-overlay-dot:nth-child(3) { animation-delay:0.4s; }

  @keyframes co-shake { 0%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} 100%{transform:translateX(0)} }
  @media (max-width: 768px) { .co-card-body, .co-summary-body { padding: 20px 18px 24px; } .co-saved-addr-list { gap: 8px; } }
`;

const REQUIRED_FIELDS = ["firstName","lastName","address1","landmark","postOffice","district","city","postcode","phone","phone2","email"];
const FIELD_LABELS = {
  firstName:"First Name", lastName:"Last Name", address1:"Street Address",
  landmark:"Landmark", postOffice:"Post Office", district:"District",
  city:"Town / City", postcode:"Postcode / ZIP", phone:"Phone",
  phone2:"Alternate Phone", email:"Email Address"
};
const emptyErrors = () => Object.fromEntries(REQUIRED_FIELDS.map(k => [k, ""]));
const emptyAddress = () => ({
  firstName:"", lastName:"", company:"",
  address1:"", address2:"", city:"", state:"", postcode:"",
  phone:"", phone2:"", email:"",
  landmark:"", district:"", postOffice:"",
});
const hasErrors = (e) => Object.values(e).some(v => v !== "");

const validateAddress = (fields) => {
  const errors = emptyErrors();
  REQUIRED_FIELDS.forEach(key => {
    if (!fields[key]?.trim()) errors[key] = `${FIELD_LABELS[key]} is required`;
  });
  if (fields.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = "Please enter a valid email address";
  return errors;
};

// ─── Saved Address Picker ─────────────────────────────────────────────────────
const SavedAddressPicker = ({ type, savedAddresses, onSelect }) => {
  const filtered = savedAddresses.filter(a => a.type === type || a.type === "billing");
  const [selectedId, setSelectedId] = useState(null);

  if (!filtered.length) return null;

  const handleSelect = (addr) => {
    setSelectedId(addr.id);
    onSelect({
      firstName:  addr.firstName  || "",
      lastName:   addr.lastName   || "",
      company:    addr.company    || "",
      address1:   addr.address1   || "",
      address2:   addr.address2   || "",
      city:       addr.city       || "",
      state:      addr.state      || "",
      postcode:   addr.postcode   || "",
      phone:      addr.phone      || "",
      phone2:     addr.phone2     || "",
      email:      addr.email      || "",
      landmark:   addr.landmark   || "",
      district:   addr.district   || "",
      postOffice: addr.postOffice || "",
    });
  };

  return (
    <div className="co-saved-addr-section">
      <div className="co-saved-addr-label">Saved Addresses</div>
      <div className="co-saved-addr-list">
        {filtered.map(addr => (
          <div
            key={addr.id}
            className={`co-saved-addr-card${selectedId === addr.id ? " selected" : ""}`}
            onClick={() => handleSelect(addr)}
          >
            <div className="co-saved-addr-radio" />
            <div className="co-saved-addr-info">
              <div className="co-saved-addr-name">
                {addr.firstName} {addr.lastName}
                <span className={`co-saved-addr-badge ${addr.type}`}>{addr.type}</span>
              </div>
              <div className="co-saved-addr-text">
                {[addr.address1, addr.address2, addr.landmark, addr.postOffice, addr.district, addr.city, addr.state, addr.postcode]
                  .filter(Boolean).join(", ")}
              </div>
              <div className="co-saved-addr-meta">
                {addr.phone}
                {addr.email ? `  ·  ${addr.email}` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="co-saved-addr-divider">
        <div className="co-saved-addr-divider-line" />
        <div className="co-saved-addr-divider-text">Or enter a new address</div>
        <div className="co-saved-addr-divider-line" />
      </div>
    </div>
  );
};

// ─── Delivery Charge Helpers ──────────────────────────────────────────────────
const isTamilNaduState = (stateName) => {
  if (!stateName) return false;
  const s = String(stateName).toLowerCase().replace(/[^a-z0-9]/g, "");
  return s === "tamilnadu" || s === "tn" || s === "puducherry" || s === "pondicherry";
};

const getCalculatedDeliveryCharge = (zone, state, totalQty) => {
  if (!zone || zone === "unavailable" || !state || totalQty <= 0) return 0;
  const baseCharge = Number(zone.charge) || 0;
  const isTN = isTamilNaduState(state);
  const extraRatePerItem = isTN ? 30 : 50;
  const additionalQty = Math.max(0, totalQty - 1);
  return baseCharge + (additionalQty * extraRatePerItem);
};

// ─── Address Form ──────────────────────────────────────────────────────────────
const AddressForm = ({
  prefix, fields, onChange, errors,
  showStateSelect, availableStates, selectedState, onStateChange,
  zoneError, zoneLoading, selectedZone, deliveryUnavailable, calculatedDeliveryCharge, totalQuantity, currencySymbol,
  submitAttempted,
}) => {
  const isTN = isTamilNaduState(selectedState);
  const extraRate = isTN ? 30 : 50;
  const extraCount = Math.max(0, (totalQuantity || 1) - 1);

  return (
  <div className="row">
    {[
      { label:"First Name", key:"firstName", col:"col-lg-6 col-md-6" },
      { label:"Last Name",  key:"lastName",  col:"col-lg-6 col-md-6" },
    ].map(({ label, key, col }) => (
      <div key={key} className={col}>
        <div className="co-field">
          <label className={`co-label${errors[key] ? " co-label-error" : ""}`}>{label}</label>
          <input
            className={`co-input${errors[key] ? " co-input--error" : ""}`}
            type="text" value={fields[key]}
            onChange={e => onChange(prefix, key, e.target.value)}
          />
          {errors[key] && <span className="co-error-msg">{errors[key]}</span>}
        </div>
      </div>
    ))}

    <div className="col-lg-12">
      <div className="co-field">
        <label className="co-label">
          Company Name{" "}
          <span style={{ color:"#ccc", fontWeight:400, letterSpacing:0, textTransform:"none" }}>(optional)</span>
        </label>
        <input className="co-input" type="text" value={fields.company}
          onChange={e => onChange(prefix, "company", e.target.value)} />
      </div>
    </div>

    <div className="col-lg-12">
      <div className="co-field">
        <label className={`co-label${errors.address1 ? " co-label-error" : ""}`}>Street Address</label>
        <input
          className={`co-input${errors.address1 ? " co-input--error" : ""}`}
          type="text" placeholder="House number and street name"
          value={fields.address1} onChange={e => onChange(prefix, "address1", e.target.value)}
        />
        {errors.address1 && <span className="co-error-msg">{errors.address1}</span>}
        <input
          className="co-input" type="text"
          placeholder="Apartment, suite, unit etc. (optional)"
          value={fields.address2} onChange={e => onChange(prefix, "address2", e.target.value)}
          style={{ marginTop:"10px" }}
        />
      </div>
    </div>

    {/* ── Location Details: Landmark · Post Office · District ── */}
    <div className="col-lg-12">
      <div className="co-location-group">
        <div className="co-location-group-title">Location Details</div>
        <div className="row">
          <div className="col-lg-12">
            <div className="co-field">
              <label className={`co-label${errors.landmark ? " co-label-error" : ""}`}>Landmark *</label>
              <input
                className={`co-input${errors.landmark ? " co-input--error" : ""}`}
                type="text"
                placeholder="e.g. Near City Hospital, Opposite Bus Stand"
                value={fields.landmark}
                onChange={e => onChange(prefix, "landmark", e.target.value)}
              />
              {errors.landmark && <span className="co-error-msg">{errors.landmark}</span>}
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <div className="co-field">
              <label className={`co-label${errors.postOffice ? " co-label-error" : ""}`}>Post Office *</label>
              <input
                className={`co-input${errors.postOffice ? " co-input--error" : ""}`}
                type="text"
                placeholder="e.g. Gandhipuram P.O."
                value={fields.postOffice}
                onChange={e => onChange(prefix, "postOffice", e.target.value)}
              />
              {errors.postOffice && <span className="co-error-msg">{errors.postOffice}</span>}
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <div className="co-field">
              <label className={`co-label${errors.district ? " co-label-error" : ""}`}>District *</label>
              <input
                className={`co-input${errors.district ? " co-input--error" : ""}`}
                type="text"
                placeholder="e.g. Coimbatore"
                value={fields.district}
                onChange={e => onChange(prefix, "district", e.target.value)}
              />
              {errors.district && <span className="co-error-msg">{errors.district}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="col-lg-12">
      <div className="co-field">
        <label className={`co-label${errors.city ? " co-label-error" : ""}`}>Town / City</label>
        <input
          className={`co-input${errors.city ? " co-input--error" : ""}`}
          type="text" value={fields.city}
          onChange={e => onChange(prefix, "city", e.target.value)}
        />
        {errors.city && <span className="co-error-msg">{errors.city}</span>}
      </div>
    </div>

    {showStateSelect && (
      <div className="col-lg-12">
        <div className="co-field">
          <label className={`co-label${(zoneError || (submitAttempted && !selectedState)) ? " co-label-error" : ""}`}>
            State *
          </label>
          {zoneLoading ? (
            <div className="co-zone-loading">Loading available states…</div>
          ) : (
            <select
              className={`co-select${(zoneError || (submitAttempted && !selectedState)) ? " co-input--error" : ""}`}
              value={selectedState}
              onChange={e => onStateChange(e.target.value)}
            >
              <option value="">— Select your state —</option>
              {availableStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          {zoneError && <span className="co-error-msg">{zoneError}</span>}

          {selectedState && !deliveryUnavailable && selectedZone && (
            <div className="co-zone-available">
              ✅&nbsp;
              <div>
                Delivery available to <strong>{selectedZone.state}</strong> —&nbsp;
                {calculatedDeliveryCharge === 0
                  ? <strong>Free delivery</strong>
                  : <strong>Delivery charge: {currencySymbol}{Number(calculatedDeliveryCharge).toFixed(2)}</strong>
                }
                {/* {extraCount > 0 && (
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    (1st saree: {currencySymbol}{Number(selectedZone.charge).toFixed(2)} + {extraCount} extra {extraCount === 1 ? "item" : "items"} × {currencySymbol}{extraRate} = {currencySymbol}{Number(calculatedDeliveryCharge).toFixed(2)})
                  </div>
                )} */}
              </div>
            </div>
          )}

          {deliveryUnavailable && (
            <div className="co-zone-unavailable">
              ⚠️&nbsp;
              <span>
                Delivery is <strong>not available</strong> for <strong>{selectedState}</strong>.
                Please select a different state or contact us.
              </span>
            </div>
          )}
        </div>
      </div>
    )}

    {[
      { label:"Postcode / ZIP",    key:"postcode", col:"col-lg-6 col-md-6" },
      { label:"Phone *",           key:"phone",    col:"col-lg-6 col-md-6" },
      { label:"Alternate Phone *", key:"phone2",   col:"col-lg-6 col-md-6" },
      { label:"Email Address",     key:"email",    col:"col-lg-6 col-md-6" },
    ].map(({ label, key, col }) => (
      <div key={key} className={col}>
        <div className="co-field">
          <label className={`co-label${errors[key] ? " co-label-error" : ""}`}>{label}</label>
          <input
            className={`co-input${errors[key] ? " co-input--error" : ""}`}
            type="text" value={fields[key]}
            onChange={e => onChange(prefix, key, e.target.value)}
          />
          {errors[key] && <span className="co-error-msg">{errors[key]}</span>}
        </div>
      </div>
    ))}
  </div>
  );
};

// ─── Coupon Dropdown ───────────────────────────────────────────────────────────
const CouponDropdown = ({ cartSubtotal, currency, appliedCoupon, onApply, onRemove }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  const previewCoupon = coupons.find(c => c.code === selectedCode) || null;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/coupons/available`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        setLoadError("Could not load coupons.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDiscount = (c) => {
    if (!c) return "";
    if (c.discountType === "percent" || c.type === "percent") return `${c.discountValue ?? c.value}% OFF`;
    return `${currency.currencySymbol}${c.discountValue ?? c.value} OFF`;
  };

  const formatDescription = (c) => {
    if (!c) return "";
    const parts = [];
    const disc = formatDiscount(c);
    if (disc) parts.push(disc);
    const minOrder = c.minOrderValue ?? c.min_order ?? 0;
    const maxDisc = c.maxDiscount ?? c.max_discount ?? 0;
    if (minOrder > 0) parts.push(`Min. order ${currency.currencySymbol}${minOrder}`);
    if (maxDisc > 0) parts.push(`Max. savings ${currency.currencySymbol}${maxDisc}`);
    return parts.join("  ·  ");
  };

  const handleApply = async () => {
    if (!selectedCode) { setCouponError("Please select a coupon."); return; }
    setApplying(true); setCouponError("");
    try {
      const res = await fetch(`${API_BASE}/coupons/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: selectedCode, subtotal: cartSubtotal }),
      });
      const data = await res.json();
      if (data.success) {
        onApply({ code: data.code, discount: data.discount, label: data.label });
        setCouponError("");
      } else {
        setCouponError(data.message || "Coupon is not valid.");
      }
    } catch {
      setCouponError("Could not apply coupon. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => { setSelectedCode(""); setCouponError(""); onRemove(); };

  if (appliedCoupon) {
    return (
      <div className="co-coupon-section">
        <label className="co-label" style={{ marginBottom: 8 }}>Have a coupon?</label>
        <div className="co-coupon-success">
          <span>🎉</span>
          <span style={{ flex: 1 }}><strong>{appliedCoupon.code}</strong> — {appliedCoupon.label}</span>
          <button className="co-coupon-btn co-coupon-btn-remove" onClick={handleRemove} style={{ padding: "5px 10px", fontSize: 10 }}>Remove</button>
        </div>
      </div>
    );
  }

  return (
    <div className="co-coupon-section">
      <label className="co-label" style={{ marginBottom: 8 }}>Have a coupon?</label>
      {loading ? (
        <div className="co-coupon-loading">Loading available coupons…</div>
      ) : loadError ? (
        <div className="co-coupon-error">{loadError}</div>
      ) : coupons.length === 0 ? (
        <div className="co-coupon-loading" style={{ color: "#aaa" }}>No coupons available right now.</div>
      ) : (
        <>
          <div className="co-coupon-dropdown-row">
            <select
              className="co-coupon-dropdown-select"
              value={selectedCode}
              onChange={e => { setSelectedCode(e.target.value); setCouponError(""); }}
              disabled={applying}
            >
              <option value="">— Select a coupon —</option>
              {coupons.map(c => (
                <option key={c.id ?? c.code} value={c.code}>{c.code}  ·  {formatDiscount(c)}</option>
              ))}
            </select>
            <button className="co-coupon-btn co-coupon-btn-apply" onClick={handleApply} disabled={applying || !selectedCode}>
              {applying ? "…" : "Apply"}
            </button>
          </div>
          {previewCoupon && !applying && (
            <div className="co-coupon-preview-card">
              <div className="co-coupon-preview-left">
                <div className="co-coupon-preview-code">{previewCoupon.code}</div>
                <div className="co-coupon-preview-desc">{formatDescription(previewCoupon)}</div>
              </div>
              <div className="co-coupon-preview-badge">{formatDiscount(previewCoupon)}</div>
            </div>
          )}
          {applying && <div className="co-coupon-applying">Checking coupon…</div>}
          {couponError && <div className="co-coupon-error">{couponError}</div>}
        </>
      )}
    </div>
  );
};

// ─── Payment Processing Overlay ───────────────────────────────────────────────
const PaymentProcessingOverlay = () => (
  <div className="co-payment-overlay">
    <div className="co-payment-overlay-inner">
      <div className="co-spinner-wrap">
        <div className="co-spinner-ring" />
        <div className="co-spinner" />
        <div className="co-spinner-icon">✓</div>
      </div>
      <div className="co-overlay-title">Payment Successful</div>
      <div className="co-overlay-sub">Confirming your order…</div>
      <div className="co-overlay-dots">
        <div className="co-overlay-dot" />
        <div className="co-overlay-dot" />
        <div className="co-overlay-dot" />
      </div>
    </div>
  </div>
);

const loadRazorpayScript = () =>
  new Promise(resolve => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// ─── Checkout ─────────────────────────────────────────────────────────────────
const Checkout = ({ shop }) => {
  let cartSubtotal = 0;
  const { currency } = shop;
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const isBuyNow = Boolean(buyNowItem);
  const cartItems = isBuyNow ? [buyNowItem] : shop.cartItems;
  const navigate = useNavigate();
  const errorBannerRef = useRef(null);
  const orderNotesRef = useRef(null);

  const CUSTOMER_ID = getCustomerId();

  const [sameBilling, setSameBilling] = useState(false);
  const [gstBilling, setGstBilling] = useState(false);
  const [gstBillingDetails, setGstBillingDetails] = useState({
    businessName: "", gstin: "", billingAddress: "", state: "", pincode: ""
  });
  const [resellerEnabled, setResellerEnabled] = useState(false);
  const [resellerAddress, setResellerAddress] = useState({
    resellerName: "", mobile: "", addressLine: "", city: "", state: "", pincode: "", country: ""
  });
  const [addresses, setAddresses] = useState({ billing: emptyAddress(), shipping: emptyAddress() });
  const [formErrors, setFormErrors] = useState({ billing: emptyErrors(), shipping: emptyErrors() });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [zones, setZones] = useState([]);
  const [zoneLoading, setZoneLoading] = useState(true);
  const [zoneLoadError, setZoneLoadError] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneError, setZoneError] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [productTaxConfig, setProductTaxConfig] = useState({});
  const [taxConfigLoaded, setTaxConfigLoaded] = useState(false);

  useEffect(() => { loadRazorpayScript(); }, []);

  useEffect(() => {
    let active = true;
    setTaxConfigLoaded(false);
    const ids = [...new Set((cartItems || []).map(item => item.productId || item.product_id || item.id).filter(Boolean))];
    Promise.all(ids.map(async id => {
      try {
        const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error(`Unable to load tax details for product ${id}.`);
        const payload = await response.json();
        const product = payload.product || payload;
        const cartItem = (cartItems || []).find(item => String(item.productId || item.product_id || item.id) === String(id));
        const variant = (product.Variants || []).find(row => String(row.id) === String(cartItem?.variantId));
        return [String(id), {
          gstRate: Math.max(0, Number(product.gstRate) || 0),
          gstType: product.gstType === 'inclusive' ? 'inclusive' : 'exclusive',
          categoryDiscountType: product.Category?.discountType || 'none',
          categoryDiscountValue: Number(product.Category?.discountValue) || 0,
          baseSalesPrice: Number(variant?.salesPrice ?? product.baseSalesPrice ?? product.salesPrice) || 0,
        }];
      } catch { return [String(id), null]; }
    })).then(entries => {
      if (active) {
        setProductTaxConfig(Object.fromEntries(entries.filter(([, config]) => config)));
        setTaxConfigLoaded(entries.every(([, config]) => Boolean(config)));
      }
    });
    return () => { active = false; };
  }, [cartItems]);

  useEffect(() => {
    const load = async () => {
      setZoneLoading(true);
      try {
        const res = await fetch(`${API_BASE}/delivery-zones/active`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : []).map(z => ({
          ...z,
          state: (z.state && z.state.trim()) ? z.state.trim() : (z.district || ""),
        }));
        setZones(normalized);
      } catch (err) {
        setZoneLoadError(`Unable to load delivery zones: ${err.message}`);
        setZones([]);
      } finally {
        setZoneLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!CUSTOMER_ID) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/customers/${CUSTOMER_ID}/addresses`);
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Could not load saved addresses:", err);
      }
    };
    load();
  }, [CUSTOMER_ID]);

  const availableStates = [...new Set(zones.map(z => z.state).filter(Boolean))].sort();

  const handleStateChange = (state) => {
    setSelectedState(state);
    setZoneError("");
    setAddresses(prev => ({ ...prev, billing: { ...prev.billing, state } }));
    if (!state) { setSelectedZone(null); return; }
    const match = zones.find(z => z.state === state);
    setSelectedZone(match || "unavailable");
  };

  let totalQuantity = 0;
  let gstAmount = 0;
  let checkoutTaxTotal = 0;
  let calculatedSubtotal = 0;
  cartItems && cartItems.forEach(item => {
    const disc = getDiscountPrice(item.price, item.discount);
    const price = (disc != null ? disc : item.price) * currency.currencyRate;
    cartSubtotal += price * item.quantity;
    const config = productTaxConfig[String(item.productId || item.product_id || item.id)] || { gstRate: 0, gstType: 'exclusive', categoryDiscountType: 'none', categoryDiscountValue: 0 };
    const productBasePrice = Number(config.baseSalesPrice ?? item.baseSalesPrice ?? item.salesPrice ?? item.price ?? 0) * currency.currencyRate;
    const categoryDiscount = config.categoryDiscountType === 'flat'
      ? Number(config.categoryDiscountValue || 0) * currency.currencyRate
      : config.categoryDiscountType === 'percentage'
        ? productBasePrice * Number(config.categoryDiscountValue || 0) / 100
        : 0;
    const salePrice = Math.max(0, productBasePrice - categoryDiscount);
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    const discountedTaxBase = config.gstType === 'inclusive' ? salePrice / (1 + config.gstRate / 100) : salePrice;
    calculatedSubtotal += Number((discountedTaxBase * quantity).toFixed(2));
    const itemTax = config.gstRate > 0 ? Number(((config.gstType === 'inclusive' ? salePrice - discountedTaxBase : discountedTaxBase * config.gstRate / 100) * quantity).toFixed(2)) : 0;
    gstAmount += itemTax;
    if (config.gstType !== 'inclusive') checkoutTaxTotal += itemTax;
    totalQuantity += Math.max(1, parseInt(item.quantity, 10) || 1);
  });

  const deliveryUnavailable = selectedZone === "unavailable";
  const deliveryCharge = (!deliveryUnavailable && selectedZone && selectedState)
    ? getCalculatedDeliveryCharge(selectedZone, selectedState, totalQuantity)
    : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = calculatedSubtotal + gstAmount + (deliveryUnavailable ? 0 : deliveryCharge) - couponDiscount;

  const handleFieldChange = (prefix, field, value) => {
    setAddresses(prev => ({ ...prev, [prefix]: { ...prev[prefix], [field]: value } }));
    if (submitAttempted)
      setFormErrors(prev => ({ ...prev, [prefix]: { ...prev[prefix], [field]: "" } }));
  };

  const handleSameBillingToggle = (checked) => {
    setSameBilling(checked);
    if (checked) {
      setAddresses(prev => ({ ...prev, shipping: { ...prev.billing } }));
      setFormErrors(prev => ({ ...prev, shipping: emptyErrors() }));
    } else {
      setAddresses(prev => ({ ...prev, shipping: emptyAddress() }));
    }
  };

  const handleSavedAddressSelect = (prefix, filledAddr) => {
    setAddresses(prev => ({ ...prev, [prefix]: filledAddr }));
    if (submitAttempted)
      setFormErrors(prev => ({ ...prev, [prefix]: emptyErrors() }));
    if (prefix === "billing" && filledAddr.state) {
      handleStateChange(filledAddr.state);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitAttempted(true);
    setPlaceError(null);

    if (!taxConfigLoaded) {
      setPlaceError('Please wait while product tax details load, then try again.');
      return;
    }

    const billingErrors  = validateAddress(addresses.billing);
    const shippingErrors = sameBilling ? emptyErrors() : validateAddress(addresses.shipping);
    setFormErrors({ billing: billingErrors, shipping: shippingErrors });

    const billingOk  = !hasErrors(billingErrors);
    const shippingOk = sameBilling || !hasErrors(shippingErrors);
    const zoneOk     = !!selectedState && !deliveryUnavailable;
    const normalizedGstin = gstBillingDetails.gstin.trim().toUpperCase();
    const normalizedPincode = gstBillingDetails.pincode.trim();
    const gstBillingValid = !gstBilling || (
      gstBillingDetails.businessName.trim() &&
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(normalizedGstin) &&
      gstBillingDetails.billingAddress.trim() &&
      gstBillingDetails.state.trim() &&
      /^[0-9]{6}$/.test(normalizedPincode)
    );
    if (!gstBillingValid) setPlaceError("Complete all five GST billing fields. Enter a valid GSTIN and 6-digit pincode.");
    const resellerValid = !resellerEnabled || Object.values(resellerAddress).every(value => value.trim());
    if (!resellerValid) setPlaceError("Complete all reseller address fields before continuing.");

    if (!selectedState) setZoneError("Please select your state.");
    else if (deliveryUnavailable) setZoneError("Delivery is not available for the selected state.");

    if (!billingOk || !shippingOk || !zoneOk || !gstBillingValid || !resellerValid) {
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }

    // Recheck live inventory before creating a Razorpay order so customers
    // are not charged for items that are already unavailable.
    try {
      const requested = new Map();
      (cartItems || []).forEach(item => {
        const productId = item.productId || item.product_id || item.id;
        if (!productId) return;
        const key = `${productId}:${item.variantId || ''}`;
        const entry = requested.get(key) || { productId, variantId: item.variantId || null, quantity: 0 };
        entry.quantity += Math.max(1, parseInt(item.quantity, 10) || 1);
        requested.set(key, entry);
      });
      const liveProducts = await Promise.all([...requested.values()].map(async ({ productId, variantId, quantity }) => {
        const response = await fetch(`${API_BASE}/products/${encodeURIComponent(productId)}`);
        if (!response.ok) throw new Error("One or more products are no longer available. Refresh your cart and try again.");
        const product = await response.json();
        const variant = variantId ? (product.Variants || []).find(row => String(row.id) === String(variantId)) : null;
        return { product, variant, quantity };
      }));
      const unavailable = liveProducts.find(({ product, variant, quantity }) => Number(variant?.stock ?? product.stock ?? 0) < quantity);
      if (unavailable) {
        const productName = unavailable.product.productName || "A cart item";
        const available = Number(unavailable.variant?.stock ?? unavailable.product.stock ?? 0);
        setPlaceError(`Only ${available} unit(s) of "${productName}" are currently available. You have not been charged. Update your cart and try again.`);
        setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        return;
      }
    } catch (inventoryError) {
      setPlaceError(inventoryError.message || "Could not confirm product availability. Please try again.");
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setPlaceError("Failed to load Razorpay. Please check your connection and try again.");
      return;
    }

    try {
      setPlacing(true);

      const rzpOrderRes = await fetch(`${API_BASE}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(grandTotal.toFixed(2)) }),
      });

      const ct = rzpOrderRes.headers.get("content-type") || "";
      if (!ct.includes("application/json"))
        throw new Error(`Server error (HTTP ${rzpOrderRes.status}). Check backend at ${API_BASE}.`);

      const rzpData = await rzpOrderRes.json();
      if (!rzpOrderRes.ok || !rzpData.success)
        throw new Error(rzpData.message || `Failed to create payment order (${rzpOrderRes.status})`);

      const b = {
        ...addresses.billing,
        gstBilling,
        ...(gstBilling ? {
          gstBillingDetails: {
            businessName: gstBillingDetails.businessName.trim(),
            gstin: normalizedGstin,
            billingAddress: gstBillingDetails.billingAddress.trim(),
            state: gstBillingDetails.state.trim(),
            pincode: normalizedPincode,
          },
        } : {}),
        ...(resellerEnabled ? {
          resellerAddress: Object.fromEntries(
            Object.entries(resellerAddress).map(([key, value]) => [key, value.trim()])
          ),
        } : {}),
      };

      const rzpOptions = {
        key: rzpData.key || process.env.REACT_APP_RAZORPAY_KEY,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Your Store",
        description: "Order Payment",
        order_id: rzpData.orderId,
        prefill: { name: `${b.firstName} ${b.lastName}`.trim(), email: b.email, contact: b.phone },
        theme: { color: C.gold },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setPaymentProcessing(false);
            setPlaceError("Payment was cancelled. Please try again.");
          },
        },
        handler: async (paymentResponse) => {
          setPaymentProcessing(true);
          await handlePaymentSuccess(paymentResponse, rzpData.orderId);
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on("payment.failed", (response) => {
        setPlacing(false);
        setPaymentProcessing(false);
        setPlaceError(`Payment failed: ${response.error.description || "Unknown error"}. Please try again.`);
        setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      });
      rzp.open();

    } catch (err) {
      const msg = err.message.toLowerCase().includes("failed to fetch")
        ? `Cannot reach server at ${API_BASE}. Is your backend running?`
        : err.message;
      setPlaceError(msg || "Something went wrong. Please try again.");
      setPlacing(false);
      setPaymentProcessing(false);
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
  };

  const handlePaymentSuccess = async (paymentResponse, rzpOrderId) => {
    try {
      const verifyRes = await fetch(`${API_BASE}/razorpay/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success)
        throw new Error(verifyData.message || "Payment verification failed.");

      const baseBilling = addresses.billing;
      const b = {
        ...baseBilling,
        gstBilling,
        ...(gstBilling ? {
          gstBillingDetails: {
            businessName: gstBillingDetails.businessName.trim(),
            gstin: gstBillingDetails.gstin.trim().toUpperCase(),
            billingAddress: gstBillingDetails.billingAddress.trim(),
            state: gstBillingDetails.state.trim(),
            pincode: gstBillingDetails.pincode.trim(),
          },
        } : {}),
        ...(resellerEnabled ? {
          resellerAddress: Object.fromEntries(
            Object.entries(resellerAddress).map(([key, value]) => [key, value.trim()])
          ),
        } : {}),
      };
      const shippingAddr = sameBilling ? b : addresses.shipping;
      const zoneNote = (selectedZone && !deliveryUnavailable)
        ? `\nDelivery State: ${selectedZone.state}` : "";

      // REMOVED: Frontend order number generation - let backend handle it
      // const orderNumber = `VV-${Date.now().toString().slice(-6)}`;

      const orderPayload = {
        customer_id: CUSTOMER_ID,
        customer_name: `${b.firstName} ${b.lastName}`.trim(),
        customer_email: b.email,
        customer_phone: b.phone,
        customer_phone2: b.phone2,
        billing_address: JSON.stringify(b),
        shipping_address: JSON.stringify(shippingAddr),
        order_notes: `${orderNotesRef.current?.value || ""}${zoneNote}`,
        subtotal: calculatedSubtotal.toFixed(2),
        discount: parseFloat(couponDiscount.toFixed(2)),
        delivery_charge: deliveryCharge,
        delivery_zone_id: (selectedZone && !deliveryUnavailable) ? selectedZone.id : null,
        tax: parseFloat(gstAmount.toFixed(2)),
        total: grandTotal.toFixed(2),
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: rzpOrderId,
        razorpay_signature: paymentResponse.razorpay_signature,
        payment_status: "paid",
        status: "processing",
        // order_number: NOT SENT - backend will generate it
        checkout_mode: isBuyNow ? "buy_now" : "cart",
        items: cartItems.map(item => {
          const disc = getDiscountPrice(item.price, item.discount);
          const price = (disc != null ? disc : item.price) * currency.currencyRate;
          return {
            product_id: item.productId || item.id,
            variantId: item.variantId || null,
            variantAttributes: item.variantAttributes || null,
            name: item.name,
            image: item.img || item.image || null,
            price: parseFloat((() => {
              const config = productTaxConfig[String(item.productId || item.product_id || item.id)];
              if (!config) return price;
              const base = config.baseSalesPrice * currency.currencyRate;
              const categoryDiscount = config.categoryDiscountType === 'flat'
                ? config.categoryDiscountValue * currency.currencyRate
                : config.categoryDiscountType === 'percentage'
                  ? base * config.categoryDiscountValue / 100
                  : 0;
              return Math.max(0, base - categoryDiscount);
            })().toFixed(2)),
            quantity: item.quantity,
            weight: item.weight || null,
          };
        }),
      };

      console.log('📦 Sending order payload:', orderPayload);

      const saveRes = await fetch(`${API_BASE}/orders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const saveCT = saveRes.headers.get("content-type") || "";
      if (!saveCT.includes("application/json"))
        throw new Error(`Server error (HTTP ${saveRes.status}). Check POST /orders/save.`);

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success)
        throw new Error(saveData.message || `Order save failed (${saveRes.status}).`);

      console.log('✅ Order saved:', saveData);

      // Clear both the persisted cart and the shared React/localStorage state
      // before leaving checkout for the thank-you page.
      if (isBuyNow) {
        // Direct purchases leave the existing cart intact.
      } else if (CUSTOMER_ID && shop?.clearCart) {
        await shop.clearCart({ silent: true });
      } else {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
      }

      if (CUSTOMER_ID) {
        const saveAddr = async (addrData, type) => {
          try {
            const existing = await fetch(`${API_BASE}/customers/${CUSTOMER_ID}/addresses`);
            const existingList = existing.ok ? await existing.json() : [];
            const alreadyExists = existingList.some(a =>
              a.firstName === addrData.firstName &&
              a.address1  === addrData.address1  &&
              a.postcode  === addrData.postcode
            );
            if (!alreadyExists) {
              await fetch(`${API_BASE}/customers/${CUSTOMER_ID}/addresses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...addrData, type }),
              });
            }
          } catch {}
        };
        await saveAddr(b, "billing");
        if (!sameBilling) await saveAddr(addresses.shipping, "shipping");
      }

      navigate("/thank-you", {
        state: {
          orderNumber: (saveData.orderNumber ? String(saveData.orderNumber).replace(/^EMT-/, 'VV-') : `VV-${String(saveData.orderId || '').padStart(3, '0')}`),
          billing: addresses.billing,
          shipping: shippingAddr,
          cartItems, currency,
          cartSubtotal: calculatedSubtotal.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          deliveryCharge: deliveryCharge.toFixed(2),
          couponDiscount: couponDiscount.toFixed(2),
          couponCode: appliedCoupon?.code || null,
          grandTotal: grandTotal.toFixed(2),
          deliveryState: selectedZone?.state || "",
          paymentId: paymentResponse.razorpay_payment_id,
          razorpayOrderId: rzpOrderId,
        },
      });

    } catch (err) {
      setPaymentProcessing(false);
      setPlaceError(
        err.message ||
        "Payment received but order could not be saved. Contact support with payment ID: " +
        paymentResponse.razorpay_payment_id
      );
      setPlacing(false);
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
  };

  const showBanner = placeError || (submitAttempted && (
    hasErrors(formErrors.billing) ||
    (!sameBilling && hasErrors(formErrors.shipping)) ||
    !selectedState || deliveryUnavailable
  ));

  return (
    <Fragment>
      <style>{checkoutStyles}</style>
      <LayoutOne shop={shop} headerTop="visible">

        {paymentProcessing && <PaymentProcessingOverlay />}

        <div className="co-page">
          <div className="container">

            <h2 className="co-page-title">Checkout</h2>
            <p className="co-page-sub">Complete your order</p>

            {showBanner && (
              <div className="co-error-banner" ref={errorBannerRef}>
                <strong>
                  {placeError ? "Order could not be placed." : "Please fix the errors below."}
                </strong>
                {placeError || "Fill in all required fields and select a valid delivery state."}
              </div>
            )}

            {cartItems && cartItems.length >= 1 ? (
              <div className="row">

                <div className="col-lg-7">

                  {/* Billing */}
                  <div className="co-card">
                    <div className="co-card-body">
                      <h3 className="co-section-title">Billing Details</h3>
                      <div className="co-section-divider" />

                      {zoneLoadError && (
                        <div className="co-error-banner" style={{ marginBottom: 20 }}>
                          <strong>Could not load delivery zones.</strong>
                          {zoneLoadError}
                        </div>
                      )}

                      {savedAddresses.length > 0 && (
                        <SavedAddressPicker
                          type="billing"
                          savedAddresses={savedAddresses}
                          onSelect={(filled) => handleSavedAddressSelect("billing", filled)}
                        />
                      )}

                      <AddressForm
                        prefix="billing"
                        fields={addresses.billing}
                        onChange={handleFieldChange}
                        errors={formErrors.billing}
                        showStateSelect={!zoneLoadError}
                        availableStates={availableStates}
                        selectedState={selectedState}
                        onStateChange={handleStateChange}
                        zoneError={zoneError}
                        zoneLoading={zoneLoading}
                        selectedZone={selectedZone}
                        deliveryUnavailable={deliveryUnavailable}
                        calculatedDeliveryCharge={deliveryCharge}
                        totalQuantity={totalQuantity}
                        currencySymbol={currency.currencySymbol}
                        submitAttempted={submitAttempted}
                      />
                      <label className="co-checkbox-row" style={{ marginTop: 18 }}>
                        <input type="checkbox" checked={gstBilling}
                          onChange={e => {
                            setGstBilling(e.target.checked);
                            setPlaceError(null);
                          }} />
                        <span className="co-checkbox-label">I need a GST tax invoice for my business</span>
                      </label>
                      {gstBilling && (
                        <div className="row" style={{ marginTop: 8 }}>
                          <div className="col-md-6" style={{ marginBottom: 12 }}>
                            <label className="co-label" htmlFor="gst-business-name">Business / Legal Name *</label>
                            <input id="gst-business-name" className="co-input" required maxLength={150}
                              value={gstBillingDetails.businessName}
                              onChange={e => setGstBillingDetails(prev => ({ ...prev, businessName: e.target.value }))} />
                          </div>
                          <div className="col-md-6" style={{ marginBottom: 12 }}>
                            <label className="co-label" htmlFor="gstin">GSTIN *</label>
                            <input id="gstin" className="co-input" required maxLength={15}
                              pattern="[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z][1-9A-Za-z]Z[0-9A-Za-z]"
                              placeholder="15-character GSTIN" value={gstBillingDetails.gstin}
                              onChange={e => setGstBillingDetails(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))} />
                          </div>
                          <div className="col-12" style={{ marginBottom: 12 }}>
                            <label className="co-label" htmlFor="gst-billing-address">Billing Address *</label>
                            <textarea id="gst-billing-address" className="co-input" required rows={3} maxLength={300}
                              value={gstBillingDetails.billingAddress}
                              onChange={e => setGstBillingDetails(prev => ({ ...prev, billingAddress: e.target.value }))} />
                          </div>
                          <div className="col-md-6" style={{ marginBottom: 12 }}>
                            <label className="co-label" htmlFor="gst-billing-state">State *</label>
                            <input id="gst-billing-state" className="co-input" required maxLength={80}
                              value={gstBillingDetails.state}
                              onChange={e => setGstBillingDetails(prev => ({ ...prev, state: e.target.value }))} />
                          </div>
                          <div className="col-md-6" style={{ marginBottom: 12 }}>
                            <label className="co-label" htmlFor="gst-billing-pincode">Pincode *</label>
                            <input id="gst-billing-pincode" className="co-input" required inputMode="numeric"
                              maxLength={6} pattern="[0-9]{6}" placeholder="6-digit pincode"
                              value={gstBillingDetails.pincode}
                              onChange={e => setGstBillingDetails(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="co-card">
                    <div className="co-card-body">
                      <h3 className="co-section-title">Shipping Details</h3>
                      <div className="co-section-divider" />
                      <label
                        className="co-checkbox-row"
                        onClick={() => handleSameBillingToggle(!sameBilling)}
                      >
                        <input
                          type="checkbox"
                          checked={sameBilling}
                          onChange={e => handleSameBillingToggle(e.target.checked)}
                          onClick={e => e.stopPropagation()}
                        />
                        <span className="co-checkbox-label">Ship to same address as billing</span>
                      </label>

                      <div className={sameBilling ? "co-shipping-disabled" : ""}>
                        {!sameBilling && savedAddresses.length > 0 && (
                          <SavedAddressPicker
                            type="shipping"
                            savedAddresses={savedAddresses}
                            onSelect={(filled) => handleSavedAddressSelect("shipping", filled)}
                          />
                        )}

                        <AddressForm
                          prefix="shipping"
                          fields={addresses.shipping}
                          onChange={handleFieldChange}
                          errors={sameBilling ? emptyErrors() : formErrors.shipping}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="co-card">
                    <div className="co-card-body">
                      <h3 className="co-section-title">Reseller Details</h3>
                      <div className="co-section-divider" />
                      <label className="co-checkbox-row">
                        <input type="checkbox" checked={resellerEnabled}
                          onChange={e => setResellerEnabled(e.target.checked)} />
                        <span className="co-checkbox-label">I am placing this order as a reseller</span>
                      </label>
                      {resellerEnabled && (
                        <div className="row" style={{ marginTop: 12 }}>
                          {[
                            ["resellerName", "Reseller Name", "text"],
                            ["mobile", "Mobile Number", "tel"],
                            ["addressLine", "Address Line", "text"],
                            ["city", "City", "text"],
                            ["state", "State", "text"],
                            ["pincode", "Pincode", "text"],
                            ["country", "Country", "text"],
                          ].map(([key, label, type]) => (
                            <div className="col-md-6" style={{ marginBottom: 12 }} key={key}>
                              <label className="co-label" htmlFor={`reseller-${key}`}>{label} *</label>
                              <input id={`reseller-${key}`} className="co-input" type={type} required
                                inputMode={key === "mobile" || key === "pincode" ? "tel" : undefined}
                                maxLength={key === "mobile" ? 20 : key === "pincode" ? 12 : 150}
                                value={resellerAddress[key]}
                                onChange={e => setResellerAddress(prev => ({ ...prev, [key]: e.target.value }))} />
                            </div>
                          ))}
                        </div>
                      )}
                      <h3 className="co-section-title">Additional Information</h3>
                      <div className="co-section-divider" />
                      <div className="co-field">
                        <label className="co-label">
                          Order Notes{" "}
                          <span style={{ color: "#ccc", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
                            (optional)
                          </span>
                        </label>
                        <textarea
                          ref={orderNotesRef}
                          className="co-textarea"
                          placeholder="Notes about your order, e.g. special notes for delivery."
                          defaultValue=""
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT: Summary */}
                <div className="col-lg-5">
                  <div className="co-card co-summary-card">
                    <div className="co-summary-body">
                      <h3 className="co-section-title">Your Order</h3>
                      <div className="co-section-divider" />

                      <div className="co-order-header">
                        <span>Product</span>
                        <span>Total</span>
                      </div>

                      {cartItems.map((item, key) => {
                        const disc = getDiscountPrice(item.price, item.discount);
                        const price = (disc != null ? disc : item.price) * currency.currencyRate;
                        return (
                          <div key={key} className="co-order-item">
                            <span className="co-order-item-name">
                              {item.name}
                              <span style={{ color: C.gold, fontWeight: 600 }}> × {item.quantity}</span>
                              {formatVariantLabel(item) && <small className="co-variant-label">{formatVariantLabel(item)}</small>}
                            </span>
                            <span className="co-order-item-price">
                              {currency.currencySymbol}{(price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}

                      <div className="co-summary-line">
                        <span className="co-summary-line-label">Subtotal</span>
                        <span className="co-summary-line-value">{currency.currencySymbol}{cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="co-summary-line">
                        <span className="co-summary-line-label">{cartItems.some(item => productTaxConfig[String(item.productId || item.product_id || item.id)]?.gstType === 'inclusive') && checkoutTaxTotal === 0 ? 'GST (included)' : 'GST'}</span>
                        <span className="co-summary-line-value">{checkoutTaxTotal > 0 ? '+' : ''}{currency.currencySymbol}{(checkoutTaxTotal || gstAmount).toFixed(2)}</span>
                      </div>
                      <div className="co-summary-line">
                        <span className="co-summary-line-label">
                          Delivery {totalQuantity > 1 ? `(${totalQuantity} items)` : ""}
                        </span>
                        {!selectedState ? (
                          <span className="co-summary-line-value pending">Select state</span>
                        ) : deliveryUnavailable ? (
                          <span className="co-summary-line-value unavailable">Not available</span>
                        ) : deliveryCharge === 0 ? (
                          <span className="co-summary-line-value free">Free</span>
                        ) : (
                          <span className="co-summary-line-value charge">+{currency.currencySymbol}{deliveryCharge.toFixed(2)}</span>
                        )}
                      </div>

                      {appliedCoupon && (
                        <div className="co-summary-line">
                          <span className="co-summary-line-label">
                            Coupon{" "}
                            <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: "0.08em" }}>
                              {appliedCoupon.code}
                            </span>
                          </span>
                          <span className="co-summary-line-value discount">
                            −{currency.currencySymbol}{couponDiscount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="co-order-total-row">
                        <span className="co-order-total-label">Total</span>
                        <span className="co-order-total-value">
                          {currency.currencySymbol}{Math.max(0, grandTotal).toFixed(2)}
                        </span>
                      </div>

                      <CouponDropdown
                        cartSubtotal={cartSubtotal}
                        currency={currency}
                        appliedCoupon={appliedCoupon}
                        onApply={setAppliedCoupon}
                        onRemove={() => setAppliedCoupon(null)}
                      />

                      <button
                        className="co-place-order-btn"
                        onClick={handlePlaceOrder}
                        disabled={placing || deliveryUnavailable}
                        title={deliveryUnavailable ? "Delivery not available for selected state" : ""}
                      >
                        {placing ? "Processing…" : "Place Order"}
                      </button>

                      <div className="co-razorpay-badge">
                        <span>🔒 Secured by Razorpay</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="co-card">
                <div className="co-empty">
                  <i className="pe-7s-cash" />
                  <p className="co-empty-text">No items found in cart to checkout.</p>
                  <Link to="/shop" className="co-empty-link">Shop Now</Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default Checkout;
