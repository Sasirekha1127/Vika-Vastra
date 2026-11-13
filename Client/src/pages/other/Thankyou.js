import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

import LayoutOne from "../../layouts/LayoutOne";
import { getImageUrl } from "../../api";
import { formatVariantLabel } from "../../utils/variantDisplay";

const thankYouStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600;700&display=swap');

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes popBounce {
    0%   { opacity: 0; transform: scale(0.4); }
    70%  { transform: scale(1.12); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 80; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes goldPulse {
    0%   { box-shadow: 0 0 0 0 rgba(179,135,40,0.45); }
    70%  { box-shadow: 0 0 0 16px rgba(179,135,40,0); }
    100% { box-shadow: 0 0 0 0 rgba(179,135,40,0); }
  }
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: 0% center; }
  }

  .ty-root { font-family: 'Jost', sans-serif; }
  .ty-a1 { animation: fadeSlideUp 0.5s ease 0.05s both; }
  .ty-a2 { animation: fadeSlideUp 0.5s ease 0.15s both; }
  .ty-a3 { animation: fadeSlideUp 0.5s ease 0.25s both; }
  .ty-a4 { animation: fadeSlideUp 0.5s ease 0.35s both; }
  .ty-check { animation: popBounce 0.55s cubic-bezier(.34,1.56,.64,1) 0.1s both; }
  .ty-ring  { animation: goldPulse 1.6s ease 0.7s; }
  .ty-checkline { stroke-dasharray: 80; animation: checkDraw 0.45s ease 0.6s both; }

  .ty-page {
    background: #F8F6F2;
    min-height: 100vh;
    padding: 48px 0 80px;
  }
  .ty-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
  }

  /* ── Banner ── */
  .ty-banner {
    border-radius: 8px;
    padding: 28px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
    background: linear-gradient(105deg, #38050E 0%, #5A0716 40%, #720E1E 100%);
    border: 1px solid #C59B27;
    position: relative;
    overflow: hidden;
  }
  .ty-banner::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(90deg, #C9933A 0%, #F8F6F2 25%, #C9933A 50%, #F8F6F2 75%, #C9933A 100%);
  }
  .ty-banner-left { display: flex; align-items: center; gap: 20px; }
  .ty-check-wrap {
    width: 62px; height: 62px; border-radius: 50%;
    background: linear-gradient(135deg, #C9933A, #C9933A);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; box-shadow: 0 4px 20px rgba(179,135,40,0.45);
  }
  .ty-banner-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: #F8F6F2; margin-bottom: 4px;
  }
  .ty-banner-sub { font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 400; }
  .ty-banner-sub strong { color: rgba(255,255,255,0.95); font-weight: 600; }
  .ty-banner-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .ty-banner-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
    text-transform: uppercase; color: rgba(255,255,255,0.75);
  }
  .ty-banner-orderno {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.02em;
  }
  .ty-banner-date { font-size: 12px; color: rgba(255,255,255,0.4); }

  /* ── Stats row ── */
  .ty-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 22px;
  }
  .ty-stat {
    background: #fff; border: 1px solid #ede8e2; border-radius: 8px;
    padding: 18px 14px; text-align: center;
    box-shadow: 0 2px 12px rgba(179,135,40,0.05);
    position: relative; overflow: hidden;
  }
  .ty-stat::before {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 2px;
    background: linear-gradient(90deg, #C9933A, #C9933A);
  }
  .ty-stat-icon { font-size: 20px; margin-bottom: 8px; display: block; }
  .ty-stat-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #C9933A; margin-bottom: 5px;
  }
  .ty-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 14px; font-weight: 700; color: #1a1a1a;
  }

  /* ── Grid ── */
  .ty-grid { display: grid; grid-template-columns: 1fr 310px; gap: 16px; align-items: start; }
  .ty-right-col { display: flex; flex-direction: column; }

  /* ── Card ── */
  .ty-card {
    background: #FFFFFF; border: 1px solid rgba(26,16,64,0.08);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 10px 30px rgba(26,16,64,0.06);
  }
  .ty-card::before {
    content: ''; display: block; height: 3px;
    background: linear-gradient(90deg, #C9933A 0%, #F8F6F2 25%, #C9933A 50%, #F8F6F2 75%, #C9933A 100%);
  }
  .ty-card-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 22px; border-bottom: 1px solid #f3ede3;
  }
  .ty-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700; color: #1a1a1a;
  }
  .ty-item-count {
    font-size: 11px; font-weight: 600; color: #C9933A;
    background: #faf4e8; border: 1px solid #e8d9a0;
    padding: 3px 10px; border-radius: 20px;
  }

  /* ── Order items ── */
  .ty-item {
    display: flex; align-items: center; gap: 14px;
    padding: 15px 22px; border-bottom: 1px solid #ede8e2;
    transition: background 0.15s;
  }
  .ty-item:hover { background: #fefcf7; }
  .ty-item:last-of-type { border-bottom: none; }
  .ty-item-img {
    width: 60px; height: 60px; background: #fff; border-radius: 10px;
    border: 1px solid rgba(201,147,58,0.18); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; font-size: 24px;
  }
  .ty-item-body { flex: 1; min-width: 0; }
  .ty-item-name {
    font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 3px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .ty-item-meta { font-size: 12px; color: #aaa; }
  .ty-variant-label { display: inline-flex; margin-top: 5px; padding: 3px 8px; border-radius: 999px; background: #fff8eb; border: 1px solid #f0dfbf; color: #80591f; }
  .ty-item-discount {
    font-size: 11px; color: #C9933A; font-weight: 700;
    margin-top: 3px; letter-spacing: 0.02em;
  }
  .ty-item-price-col { text-align: right; flex-shrink: 0; }
  .ty-item-final {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700; color: #1a1a1a;
  }
  .ty-item-orig {
    font-size: 12px; color: #ccc; text-decoration: line-through; margin-top: 2px;
  }

  /* ── Totals breakdown ── */
  .ty-totals {
    padding: 16px 22px;
    background: #F8F6F2; border-top: 1px solid #ede8e2;
  }
  .ty-totals-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; font-size: 13px; color: #555;
  }
  .ty-totals-row span:first-child { color: #888; }
  .ty-totals-row .ty-totals-discount { color: #C9933A; font-weight: 600; }
  .ty-totals-row.ty-totals-grand {
    border-top: 1px solid #e3dbc9; margin-top: 8px; padding-top: 14px;
  }
  .ty-total-label {
    font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase; color: #aaa;
  }
  .ty-total-amount {
    font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
    background: linear-gradient(90deg, #C9933A, #C9933A, #C9933A);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ── Continue btn ── */
  .ty-continue-btn {
    display: block; text-align: center; margin-top: 14px; padding: 14px;
    background: linear-gradient(90deg, #C9933A 0%, #F8F6F2 25%, #C9933A 50%, #F8F6F2 75%, #C9933A 100%);
    background-size: 200% auto; color: #111 !important;
    font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
    border-radius: 4px; transition: background-position 0.4s ease, opacity 0.2s;
    box-shadow: 0 4px 18px rgba(179,135,40,0.24);
  }
  .ty-continue-btn:hover { background-position: right center; opacity: 0.92; color: #111 !important; }

  /* ── Address cards ── */
  .ty-addr-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    background: #faf4e8; color: #C9933A; border: 1px solid #e8d9a0;
    padding: 3px 10px; border-radius: 20px;
  }
  .ty-addr-badge-billing { background: #f0f4ff; color: #3b5bdb; border-color: #bfcbf7; }
  .ty-addr-name {
    font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700;
    color: #1a1a1a; padding: 14px 22px 4px;
  }
  .ty-addr-line { font-size: 13px; color: #666; line-height: 1.7; padding: 0 22px; }
  .ty-addr-contact { display: flex; flex-direction: column; gap: 4px; padding: 10px 22px 16px; }
  .ty-addr-contact-item { font-size: 13px; color: #999; }

  /* ── Help card ── */
  .ty-help-card {
    display: flex; align-items: flex-start; gap: 14px;
    background: #fff; border: 1px solid #ede8e2; border-radius: 8px;
    padding: 18px; margin-top: 14px;
    box-shadow: 0 2px 12px rgba(179,135,40,0.05);
    position: relative; overflow: hidden;
  }
  .ty-help-card::before {
    content: ''; position: absolute; inset: 0 0 auto 0; height: 3px;
    background: linear-gradient(90deg, #C9933A, #C9933A);
  }
  .ty-help-icon {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #C9933A, #C9933A);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .ty-help-title {
    font-family: 'Playfair Display', serif; font-size: 13px;
    font-weight: 700; color: #1a1a1a; margin-bottom: 5px;
  }
  .ty-help-link {
    font-size: 12px; color: #C9933A; text-decoration: none;
    font-weight: 600; letter-spacing: 0.02em;
  }
  .ty-help-link:hover { text-decoration: underline; }

  /* ── Empty state ── */
  .ty-empty {
    min-height: 60vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 18px; padding: 40px 20px;
  }
  .ty-empty-icon {
    font-size: 56px; background: linear-gradient(135deg, #C9933A, #C9933A);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .ty-empty-text { font-family: 'Playfair Display', serif; font-size: 18px; color: #aaa; margin: 0; }
  .ty-empty-btn {
    padding: 12px 32px; background: linear-gradient(90deg, #C9933A, #C9933A, #C9933A);
    color: #fff; text-decoration: none; border-radius: 4px;
    font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; transition: opacity 0.2s;
    box-shadow: 0 4px 16px rgba(179,135,40,0.28);
  }
  .ty-empty-btn:hover { opacity: 0.85; color: #fff; }

  @media (max-width: 768px) {
    .ty-stats { grid-template-columns: repeat(2, 1fr); }
    .ty-grid { grid-template-columns: 1fr; }
    .ty-banner { flex-direction: column; align-items: flex-start; }
    .ty-banner-right { align-items: flex-start; }
  }
  @media (max-width: 480px) {
    .ty-stats { grid-template-columns: 1fr; }
  }
`;

const ThankYou = ({ shop }) => {
  const { state } = useLocation();

  if (!state || !state.orderNumber) {
    return (
      <Fragment>
        <style>{thankYouStyles}</style>
        <LayoutOne shop={shop} headerTop="visible">
          <div className="ty-page">
            <div className="ty-empty">
              <span className="ty-empty-icon">🛒</span>
              <p className="ty-empty-text">No order found.</p>
              <Link to="/shop" className="ty-empty-btn">Back to Shop</Link>
            </div>
          </div>
        </LayoutOne>
      </Fragment>
    );
  }

  const {
    orderNumber, billing, shipping, cartItems, currency,
    cartSubtotal, gstAmount, deliveryCharge, couponDiscount, couponCode,
    grandTotal, cartTotalPrice,
  } = state;

  const sym = currency?.currencySymbol || "₹";

  // Fallback: compute subtotal from items if not passed in state (older orders)
  const computedSubtotal = cartItems.reduce((sum, item) => {
    const base       = parseFloat(item.price || 0) * (currency?.currencyRate || 1);
    const discounted = item.discount ? base * (1 - item.discount / 100) : base;
    return sum + discounted * item.quantity;
  }, 0);

  const subtotal = cartSubtotal != null ? parseFloat(cartSubtotal) : computedSubtotal;
  const tax       = gstAmount != null ? parseFloat(gstAmount) : 0;
  const delivery  = deliveryCharge != null ? parseFloat(deliveryCharge) : 0;
  const discount  = couponDiscount != null ? parseFloat(couponDiscount) : 0;

  // Prefer the real grand total from checkout; fall back to cartTotalPrice, then computed subtotal
  const displayTotal = grandTotal != null
    ? parseFloat(grandTotal).toFixed(2)
    : cartTotalPrice
      ? parseFloat(cartTotalPrice).toFixed(2)
      : computedSubtotal.toFixed(2);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Fragment>
      <style>{thankYouStyles}</style>
      <LayoutOne shop={shop} headerTop="visible">
        <div className="ty-root ty-page">
          <div className="ty-container">

            {/* ── Banner ── */}
            <div className="ty-a1 ty-banner">
              <div className="ty-banner-left">
                <div className="ty-check ty-ring ty-check-wrap">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <polyline
                      className="ty-checkline"
                      points="7,18 14,25 27,11"
                      stroke="#fff" strokeWidth="3.2"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="ty-banner-title">Order Confirmed!</div>
                  <div className="ty-banner-sub">
                    Thank you, <strong>{billing?.firstName || "Customer"}</strong>. Your order has been successfully placed.
                  </div>
                </div>
              </div>
              {/* ✅ Order ID now shows actual orderNumber value */}
              <div className="ty-banner-right">
                <span className="ty-banner-label">Order ID</span>
                <span className="ty-banner-orderno">#{String(orderNumber || "").replace(/^EMT-/, "VV-")}</span>
                <span className="ty-banner-date">{today}</span>
              </div>
            </div>

            {/* ── Stats — 2 cards only (Cash on Delivery removed) ── */}
            <div className="ty-a2 ty-stats">
              {[
                { icon: "📦", label: "Items",      value: `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}` },
                { icon: "💰", label: "Total Paid", value: `${sym}${displayTotal}` },
              ].map((stat, i) => (
                <div key={i} className="ty-stat">
                  <span className="ty-stat-icon">{stat.icon}</span>
                  <div className="ty-stat-label">{stat.label}</div>
                  <div className="ty-stat-value">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* ── Two-column grid ── */}
            <div className="ty-grid">

              {/* LEFT — order items */}
              <div>
                <div className="ty-a3 ty-card">
                  <div className="ty-card-head">
                    <span className="ty-card-title">Order Summary</span>
                    <span className="ty-item-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
                  </div>

                  {cartItems.map((item, i) => {
                    const base       = parseFloat(item.price || 0) * (currency?.currencyRate || 1);
                    const discounted = item.discount ? base * (1 - item.discount / 100) : null;
                    const finalUnit  = discounted ?? base;
                    const lineTotal  = (finalUnit * item.quantity).toFixed(2);
                    return (
                      <div key={i} className="ty-item">
                        <div className="ty-item-img">
                          {(() => {
                            const imageSrc = getImageUrl(item.image || item.img);
                            return imageSrc
                              ? <img src={imageSrc} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : "🛍️";
                          })()}
                        </div>
                        <div className="ty-item-body">
                          <div className="ty-item-name">{item.name}</div>
                          <div className="ty-item-meta">Qty: {item.quantity}</div>
                          {formatVariantLabel(item) && <div className="ty-item-meta ty-variant-label">{formatVariantLabel(item)}</div>}
                          {item.discount > 0 && (
                            <div className="ty-item-discount">{item.discount}% off applied</div>
                          )}
                        </div>
                        <div className="ty-item-price-col">
                          <div className="ty-item-final">{sym}{lineTotal}</div>
                          {discounted && (
                            <div className="ty-item-orig">{sym}{(base * item.quantity).toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* ── Totals breakdown: subtotal, discount, delivery, tax, grand total ── */}
                  <div className="ty-totals">
                    <div className="ty-totals-row">
                      <span>Subtotal</span>
                      <span>{sym}{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="ty-totals-row">
                        <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
                        <span className="ty-totals-discount">−{sym}{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="ty-totals-row">
                      <span>Delivery</span>
                      <span>{delivery === 0 ? "Free" : `${sym}${delivery.toFixed(2)}`}</span>
                    </div>
                    <div className="ty-totals-row">
                      <span>Tax</span>
                      <span>{sym}{tax.toFixed(2)}</span>
                    </div>
                    <div className="ty-totals-row ty-totals-grand">
                      <span className="ty-total-label">Order Total</span>
                      <span className="ty-total-amount">{sym}{displayTotal}</span>
                    </div>
                  </div>
                </div>

                <Link to="/shop" className="ty-continue-btn">
                  Continue Shopping
                </Link>
              </div>

              {/* RIGHT — addresses */}
              <div className="ty-right-col">

                {/* Delivery address */}
                <div className="ty-a4 ty-card">
                  <div className="ty-card-head">
                    <span className="ty-card-title">Delivery Address</span>
                    <span className="ty-addr-badge">Shipping</span>
                  </div>
                  <div className="ty-addr-name">{shipping?.firstName} {shipping?.lastName}</div>
                  {shipping?.company && <div className="ty-addr-line">{shipping.company}</div>}
                  <div className="ty-addr-line">{shipping?.address1}{shipping?.address2 ? `, ${shipping.address2}` : ""}</div>
                  <div className="ty-addr-line">
                    {[shipping?.city, shipping?.state, shipping?.postcode].filter(Boolean).join(", ")}
                  </div>
                  <div className="ty-addr-line">{shipping?.country}</div>
                  <div className="ty-addr-contact">
                    {shipping?.phone && <span className="ty-addr-contact-item">📞 {shipping.phone}</span>}
                    {shipping?.email && <span className="ty-addr-contact-item">✉️ {shipping.email}</span>}
                  </div>
                </div>

                {/* Billing address */}
                <div className="ty-a4 ty-card" style={{ marginTop: "14px" }}>
                  <div className="ty-card-head">
                    <span className="ty-card-title">Billing Address</span>
                    <span className="ty-addr-badge ty-addr-badge-billing">Billing</span>
                  </div>
                  <div className="ty-addr-name">{billing?.firstName} {billing?.lastName}</div>
                  {billing?.company && <div className="ty-addr-line">{billing.company}</div>}
                  <div className="ty-addr-line">{billing?.address1}{billing?.address2 ? `, ${billing.address2}` : ""}</div>
                  <div className="ty-addr-line">
                    {[billing?.city, billing?.state, billing?.postcode].filter(Boolean).join(", ")}
                  </div>
                  <div className="ty-addr-line">{billing?.country}</div>
                  <div className="ty-addr-contact">
                    {billing?.phone && <span className="ty-addr-contact-item">📞 {billing.phone}</span>}
                    {billing?.email && <span className="ty-addr-contact-item">✉️ {billing.email}</span>}
                  </div>
                </div>

                {/* Help card */}
                <div className="ty-help-card">
                  <div className="ty-help-icon">💬</div>
                  <div>
                    <div className="ty-help-title">Need help with your order?</div>
                    <Link to="/contact" className="ty-help-link">Contact our support team →</Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default ThankYou;
