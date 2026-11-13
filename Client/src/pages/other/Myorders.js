// src/pages/other/MyOrders.js
import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import LayoutOne from "../../layouts/LayoutOne";
import { getImageUrl } from "../../api";
import { formatVariantLabel } from "../../utils/variantDisplay";
import { getProductUrl } from "../../utils/productUrl";

const myOrdersStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600;700&display=swap');

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .mo-page { background: #F8F6F2; min-height: 80vh; padding: 60px 0 90px; font-family: 'Jost', sans-serif; }
  .mo-page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
  .mo-page-sub { font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #C9933A; margin: 0 0 32px; }

  .mo-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .mo-filter-btn { padding: 7px 18px; border-radius: 20px; border: 1px solid #e8e3dc; background: #fff; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #888; cursor: pointer; transition: all 0.2s; }
  .mo-filter-btn:hover { border-color: #C9933A; color: #C9933A; }
  .mo-filter-btn.active { background: #C9933A; border-color: transparent; color: #fff; box-shadow: 0 3px 12px rgba(201,147,58,0.28); }

  .mo-card { background: #FFFFFF; border: 1px solid rgba(26,16,64,0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(26,16,64,0.05); margin-bottom: 18px; animation: fadeSlideUp 0.4s ease both; transition: box-shadow 0.2s; }
  .mo-card::before { content: ''; display: block; height: 3px; background: linear-gradient(90deg, #C9933A 0%, #E8D1A1 35%, #C9933A 100%); }
  .mo-card:hover { box-shadow: 0 10px 36px rgba(114,14,30,0.12); }

  .mo-card-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 16px 22px; border-bottom: 1px solid #ede8e2; background: #F8F6F2; }
  .mo-card-head-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .mo-order-id { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #1a1a1a; }
  .mo-order-date { font-size: 12px; color: #aaa; letter-spacing: 0.02em; }

  .mo-status { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .mo-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .mo-status-confirmed    { background: #fff4e1; color: #C9933A; }
  .mo-status-confirmed .mo-status-dot    { background: #C9933A; }
  .mo-status-shipped      { background: #eff6ff; color: #1d4ed8; }
  .mo-status-shipped .mo-status-dot      { background: #3b82f6; }
  .mo-status-out_for_delivery { background: #fdf4ff; color: #7e22ce; }
  .mo-status-out_for_delivery .mo-status-dot { background: #a855f7; }
  .mo-status-delivered    { background: #f0fdf4; color: #15803d; }
  .mo-status-delivered .mo-status-dot    { background: #22c55e; }
  .mo-status-cancelled    { background: #fef2f2; color: #b91c1c; }
  .mo-status-cancelled .mo-status-dot    { background: #ef4444; }
  .mo-status-refunded     { background: #f5f3ff; color: #6d28d9; }
  .mo-status-refunded .mo-status-dot     { background: #8b5cf6; }
  .mo-status-default      { background: #eef0f6; color: #4b5563; }
  .mo-status-default .mo-status-dot      { background: #9ca3af; }

  .mo-items { padding: 16px 22px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .mo-item-img { width: 58px; height: 58px; border-radius: 10px; border: 1px solid rgba(201,147,58,0.18); background: #FFFFFF; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 22px; }
  .mo-item-img img { width: 100%; height: 100%; object-fit: cover; }
  .mo-item-info { flex: 1; min-width: 0; }
  .mo-item-name { font-size: 13px; font-weight: 600; color: #720E1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mo-item-meta { font-size: 12px; color: #aaa; margin-top: 2px; }
  .mo-more-items { font-size: 12px; font-weight: 600; color: #C9933A; background: #fff5d8; border: 1px solid rgba(201,147,58,0.24); border-radius: 20px; padding: 4px 12px; white-space: nowrap; }

  .mo-card-foot { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 14px 22px; border-top: 1px solid #f3ede3; background: #FFFFFF; }
  .mo-total-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; margin-bottom: 2px; }
  .mo-total-value { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; background: linear-gradient(90deg, #C9933A, #C9933A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .mo-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  .mo-btn-outline { padding: 8px 18px; border: 1px solid rgba(114,14,30,0.12); border-radius: 4px; background: transparent; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #666; cursor: pointer; transition: border-color 0.2s, color 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
  .mo-btn-outline:hover { border-color: #C9933A; color: #C9933A; }
  .mo-btn-gold { padding: 8px 18px; border: none; border-radius: 4px; background: linear-gradient(90deg, #C9933A 0%, #F8F6F2 25%, #C9933A 50%, #F8F6F2 75%, #C9933A 100%); background-size: 200% auto; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #fff; cursor: pointer; transition: background-position 0.4s, opacity 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(179,135,40,0.24); }
  .mo-btn-gold:hover { background-position: right center; opacity: 0.92; color: #fff; }

  .mo-detail-panel { border-top: 1px solid #f3ede3; padding: 20px 22px 24px; background: #fffdf9; }
  .mo-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .mo-detail-section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #C9933A; margin-bottom: 10px; }
  .mo-detail-line { font-size: 13px; color: #555; line-height: 1.7; }
  .mo-detail-line strong { color: #1a1a1a; font-weight: 600; }

  .mo-items-table { width: 100%; border-collapse: collapse; }
  .mo-items-table th { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C9933A; padding: 0 0 10px; text-align: left; border-bottom: 1px solid #ede8e2; }
  .mo-items-table th:last-child { text-align: right; }
  .mo-items-table td { padding: 12px 0; border-bottom: 1px solid #f8f4ee; font-size: 13px; color: #444; vertical-align: middle; }
  .mo-items-table td:last-child { text-align: right; font-weight: 600; color: #1a1a1a; font-family: 'Playfair Display', serif; font-size: 14px; }
  .mo-variant-label { display: inline-flex; margin: 5px 0 0 6px; padding: 2px 8px; border-radius: 999px; background: #fff8eb; border: 1px solid #f0dfbf; color: #80591f; font: 600 10px 'Jost', sans-serif; }
  .mo-table-img { width: 44px; height: 44px; border-radius: 5px; border: 1px solid #ede8e2; object-fit: cover; margin-right: 10px; vertical-align: middle; background: #F8F6F2; }

  .mo-tracker { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ede8e2; }
  .mo-tracker-title { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #C9933A; margin-bottom: 18px; }
  .mo-steps { display: flex; align-items: flex-start; overflow-x: auto; padding-bottom: 4px; }
  .mo-step { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 70px; position: relative; }
  .mo-step:not(:last-child)::after { content: ''; position: absolute; top: 14px; left: calc(50% + 14px); right: calc(-50% + 14px); height: 2px; background: #ede8e2; z-index: 0; }
  .mo-step.done:not(:last-child)::after { background: #C9933A; }
  .mo-step-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #e8e3dc; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; position: relative; z-index: 1; transition: all 0.3s; }
  .mo-step.done .mo-step-dot { background: #C9933A; border-color: transparent; box-shadow: 0 2px 10px rgba(179,135,40,0.35); color: #fff; }
  .mo-step.current .mo-step-dot { border-color: #C9933A; box-shadow: 0 0 0 4px rgba(179,135,40,0.15); color: #C9933A; }
  .mo-step-label { font-size: 10px; font-weight: 600; letter-spacing: 0.04em; color: #bbb; margin-top: 7px; text-align: center; line-height: 1.3; }
  .mo-step.done .mo-step-label { color: #C9933A; }
  .mo-step.current .mo-step-label { color: #1a1a1a; font-weight: 700; }

  .mo-skeleton { background: linear-gradient(90deg, #f3ede3 25%, #faf4e8 50%, #f3ede3 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite; border-radius: 4px; }
  .mo-skel-card { background: #fff; border: 1px solid #ede8e2; border-radius: 8px; overflow: hidden; margin-bottom: 18px; padding: 20px 22px; }
  .mo-skel-card::before { content: ''; display: block; height: 3px; background: linear-gradient(90deg, #C9933A 0%, #F8F6F2 25%, #C9933A 50%, #F8F6F2 75%, #C9933A 100%); margin: -20px -22px 20px; }

  .mo-empty { text-align: center; padding: 70px 20px; }
  .mo-empty-icon { font-size: 54px; display: block; margin-bottom: 16px; }
  .mo-empty-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
  .mo-empty-sub { font-size: 13px; color: #aaa; margin-bottom: 24px; line-height: 1.6; }

  .mo-login-prompt { text-align: center; padding: 70px 20px; }
  .mo-login-prompt-icon { font-size: 52px; display: block; margin-bottom: 16px; }
  .mo-login-prompt-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
  .mo-login-prompt-sub { font-size: 13px; color: #aaa; margin-bottom: 24px; line-height: 1.6; }

  .mo-error { text-align: center; padding: 60px 20px; }
  .mo-error-icon { font-size: 44px; margin-bottom: 14px; display: block; }
  .mo-error-text { font-size: 14px; color: #c0392b; margin-bottom: 20px; }

  @media (max-width: 768px) {
    .mo-detail-grid { grid-template-columns: 1fr; gap: 14px; }
    .mo-card-head { flex-direction: column; align-items: flex-start; }
  }
`;

const invoiceEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const printCustomerInvoice = (order, displayOrderNumber, parseAddress) => {
  const billing = parseAddress(order.billing_address) || {};
  const shipping = parseAddress(order.shipping_address) || billing;
  const buyerGst = billing.gstBillingDetails || {
    businessName: billing.company,
    gstin: billing.gstin,
    billingAddress: billing.address1,
    state: billing.state,
    pincode: billing.postcode,
  };
  const items = order.OrderItems || [];
  const subtotal = Number(order.subtotal || 0);
  const tax = Number(order.tax || 0);
  const destinationState = shipping.state || billing.state || 'Tamil Nadu';
  const isIntraState = destinationState.toLowerCase() === 'tamil nadu';
  const money = value => Number(value || 0).toFixed(2);
  const stateCodes = {
    'jammu and kashmir':'01','himachal pradesh':'02','punjab':'03','chandigarh':'04',
    'uttarakhand':'05','haryana':'06','delhi':'07','rajasthan':'08','uttar pradesh':'09',
    'bihar':'10','sikkim':'11','arunachal pradesh':'12','nagaland':'13','manipur':'14',
    'mizoram':'15','tripura':'16','meghalaya':'17','assam':'18','west bengal':'19',
    'jharkhand':'20','odisha':'21','chhattisgarh':'22','madhya pradesh':'23','gujarat':'24',
    'daman and diu':'25','dadra and nagar haveli':'26','maharashtra':'27','andhra pradesh':'28',
    'karnataka':'29','goa':'30','lakshadweep':'31','kerala':'32','tamil nadu':'33',
    'puducherry':'34','andaman and nicobar islands':'35','telangana':'36','andhra pradesh (new)':'37'
  };
  const stateCode = state => stateCodes[String(state || '').toLowerCase()] || '—';
  const addressLines = addr => [
    [addr.address1, addr.address2].filter(Boolean).join(', '),
    addr.landmark ? `Near: ${addr.landmark}` : '',
    [addr.city, addr.state, addr.postcode].filter(Boolean).join(', '),
    `State Code: ${stateCode(addr.state)}`,
    addr.phone ? `Phone: ${addr.phone}` : '',
    addr.email || ''
  ].filter(Boolean).map(line => `<div>${invoiceEscape(line)}</div>`).join('');
  const rows = items.map((item, index) => {
    const qty = Math.max(1, Number(item.quantity || 1));
    const price = Number(item.price || 0);
    const lineTotal = price * qty;
    const gst = Number(item.taxAmount ?? (lineTotal * Number(item.gstRate || 0) / 100));
    const taxable = Number(item.taxableAmount ?? lineTotal);
    return `<tr><td class="center">${index + 1}</td><td><strong>${invoiceEscape(item.name || 'Product')}</strong>${item.weight ? `<br><small>Variant: ${invoiceEscape(item.weight)}</small>` : ''}</td><td class="center">5407</td><td class="center">${qty}</td><td class="right">₹${money(taxable / qty)}</td><td class="right">₹${money(taxable)}</td>${isIntraState ? `<td class="right">${Number(item.gstRate || 0) / 2}%<br>₹${money(gst / 2)}</td><td class="right">${Number(item.gstRate || 0) / 2}%<br>₹${money(gst / 2)}</td>` : `<td class="right">${Number(item.gstRate || 0)}%<br>₹${money(gst)}</td>`}<td class="right"><strong>₹${money(taxable + gst)}</strong></td></tr>`;
  }).join('');
  const invoiceNo = `INV-${String(order.order_number || displayOrderNumber).replace(/^#/, '')}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN');
  const taxRows = isIntraState
    ? `<div class="calc-row"><span>CGST</span><b>₹${money(tax / 2)}</b></div><div class="calc-row"><span>SGST</span><b>₹${money(tax / 2)}</b></div>`
    : `<div class="calc-row"><span>IGST</span><b>₹${money(tax)}</b></div>`;
  const billedName = billing.gstBilling
    ? (buyerGst.businessName || '')
    : ([billing.firstName, billing.lastName].filter(Boolean).join(' ') || order.customer_name || '');
  const shippedName = [shipping.firstName, shipping.lastName].filter(Boolean).join(' ') || order.customer_name || '';
  const popup = window.open('', '_blank', 'width=1000,height=800');
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><title>${invoiceEscape(invoiceNo)}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font:11.5px/1.4 'Segoe UI',Arial,sans-serif;color:#111;padding:20px}
    .invoice{max-width:210mm;margin:auto;border:1.5px solid #222}.header{display:flex;padding:14px 18px;background:#fafafa;border-bottom:1.5px solid #222}
    .seller{flex:1.2;padding-right:15px;border-right:1px solid #ccc}.seller h1{font-size:17px;color:#0b1f44;letter-spacing:.04em;margin-bottom:4px}
    .seller div{font-size:11px}.meta{flex:.9;padding-left:18px}.badge{font-size:18px;font-weight:800;color:#0b1f44;margin-bottom:6px}
    .meta div{display:flex;justify-content:space-between;padding:2px 0}.parties{display:flex;border-bottom:1.5px solid #222}
    .party{flex:1;padding:10px 16px}.party:first-child{border-right:1.5px solid #222}.party-title{font-size:10px;font-weight:800;color:#0b1f44;background:#eef2f8;padding:3px 6px;display:inline-block;margin-bottom:6px}
    .party-name{font-size:13px;font-weight:700;margin-bottom:3px}.party div{font-size:11px;line-height:1.45}.party .gstin{font-weight:700}
    table{width:100%;border-collapse:collapse;font-size:10px}th{background:#0b1f44;color:#fff;font-size:9px;text-transform:uppercase;padding:7px 4px;border:1px solid #0b1f44}
    td{padding:6px 4px;border:1px solid #ddd;vertical-align:middle}.center{text-align:center}.right{text-align:right}
    .summary{display:flex;justify-content:flex-end;border-top:1.5px solid #222;border-bottom:1.5px solid #222}
    .calc{width:42%;padding:10px 16px}.calc-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11px}
    .grand{border-top:1.5px solid #222;margin-top:4px;padding-top:6px;font-size:13px;font-weight:800;color:#0b1f44}
    .footer{display:flex;padding:12px 16px;background:#fafafa}.terms{flex:1.2;border-right:1px solid #ddd;padding-right:16px}.sign{flex:.9;text-align:right;padding-left:16px;display:flex;flex-direction:column;justify-content:space-between;min-height:70px}
    @media print{body{padding:0}@page{size:A4;margin:10mm}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><div class="invoice">
    <header class="header"><div class="seller"><h1>VIKA VASTHRA</h1><div>Vikraman.k, Murari Enclave, Maragondanahalli</div><div>Electronic City phase 1, Bangalore - 560100, Karnataka</div><div><b>Phone:</b> +91 9482944552 &nbsp;|&nbsp; <b>Email:</b> vikram.25feb@gmail.com &nbsp;|&nbsp; <b>Web:</b> www.vikavasthra.com</div></div>
    <div class="meta"><div class="badge">TAX INVOICE</div><div><span>Invoice No:</span><b>${invoiceEscape(invoiceNo)}</b></div><div><span>Invoice Date:</span><b>${invoiceEscape(invoiceDate)}</b></div><div><span>Order Ref:</span><b>${invoiceEscape(displayOrderNumber)}</b></div><div><span>Place of Supply:</span><b>${invoiceEscape(destinationState)} (${stateCode(destinationState)})</b></div><div><span>Reverse Charge:</span><b>No</b></div></div></header>
    <section class="parties"><div class="party"><div class="party-title">Billed To (Receiver Details)</div><div class="party-name">${invoiceEscape(billedName)}</div>
    ${billing.gstBilling && buyerGst.gstin ? `<div class="gstin">GSTIN: ${invoiceEscape(buyerGst.gstin)}</div>` : ''}
    ${billing.gstBilling ? `<div>${invoiceEscape(buyerGst.billingAddress || '')}</div><div>${invoiceEscape([buyerGst.state, buyerGst.pincode].filter(Boolean).join(' - '))}</div>${billing.phone ? `<div>Phone: ${invoiceEscape(billing.phone)}</div>` : ''}${order.customer_email ? `<div>${invoiceEscape(order.customer_email)}</div>` : ''}` : addressLines(billing)}</div>
    <div class="party"><div class="party-title">Shipped To (Consignee Details)</div><div class="party-name">${invoiceEscape(shippedName)}</div>${addressLines(shipping)}</div></section>
    <table><thead><tr><th>#</th><th>Item Description</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Taxable Val</th>${isIntraState ? '<th>CGST</th><th>SGST</th>' : '<th>IGST</th>'}<th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <section class="summary"><div class="calc"><div class="calc-row"><span>Taxable Subtotal</span><b>₹${money(subtotal)}</b></div>${taxRows}<div class="calc-row"><span>Delivery Charges</span><b>${Number(order.delivery_charge || 0) ? `+₹${money(order.delivery_charge)}` : 'FREE'}</b></div>${Number(order.discount || 0) ? `<div class="calc-row"><span>Discount</span><b>−₹${money(order.discount)}</b></div>` : ''}<div class="calc-row grand"><span>Grand Total</span><b>₹${money(order.total)}</b></div></div></section>
  </div><script>window.onload=()=>window.print();</script></body></html>`);
  popup.document.close();
};

const STATUS_STEPS = [
  { key: "confirmed",        label: "Confirmed",        icon: "✓" },
  { key: "shipped",          label: "Shipped",          icon: "📦" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "delivered",        label: "Delivered",        icon: "✓" },
];

const CANCELLED_STEPS = [
  { key: "confirmed", label: "Confirmed", icon: "✓" },
  { key: "cancelled", label: "Cancelled", icon: "✕" },
];

const STATUS_LABELS = {
  confirmed:        "Confirmed",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  refunded:         "Refunded",
  processing:       "Processing",
  in_transit:       "In Transit",
  return_requested: "Return Requested",
  return_approved:  "Return Approved",
  return_picked_up: "Return Picked Up",
  return_received:  "Return Received",
};

const FILTER_TABS = [
  { key: "all", label: "All Orders" },
];

const filterOrders = (orders, tab) => {
  if (tab === "all") return orders;
  return orders;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return "";
  }
};

const StatusBadge = ({ status }) => {
  const cls = `mo-status mo-status-${status}` +
    (!STATUS_LABELS[status] ? " mo-status-default" : "");
  return (
    <span className={cls}>
      <span className="mo-status-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
};

const TrackingStepper = ({ status }) => {
  const steps      = ["cancelled", "refunded"].includes(status) ? CANCELLED_STEPS : STATUS_STEPS;
  const currentIdx = steps.findIndex(s => s.key === status);
  return (
    <div className="mo-tracker">
      <div className="mo-tracker-title">Order Progress</div>
      <div className="mo-steps">
        {steps.map((step, i) => {
          const done    = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={step.key} className={`mo-step${done ? " done" : ""}${current ? " current" : ""}`}>
              <div className="mo-step-dot">{step.icon}</div>
              <div className="mo-step-label">{step.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="mo-skel-card">
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"16px" }}>
      <div className="mo-skeleton" style={{ width:"140px", height:"16px" }} />
      <div className="mo-skeleton" style={{ width:"80px", height:"22px", borderRadius:"20px" }} />
    </div>
    <div style={{ display:"flex", gap:"12px", marginBottom:"16px" }}>
      {[1,2].map(i => (
        <div key={i} className="mo-skeleton" style={{ width:"58px", height:"58px", borderRadius:"6px", flexShrink:0 }} />
      ))}
      <div style={{ flex:1 }}>
        <div className="mo-skeleton" style={{ width:"60%", height:"13px", marginBottom:"8px" }} />
        <div className="mo-skeleton" style={{ width:"40%", height:"11px" }} />
      </div>
    </div>
    <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"14px", borderTop:"1px solid #f3ede3" }}>
      <div className="mo-skeleton" style={{ width:"90px", height:"18px" }} />
      <div className="mo-skeleton" style={{ width:"120px", height:"32px", borderRadius:"4px" }} />
    </div>
  </div>
);

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getCustomerId = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("customer"))?.id ||
      JSON.parse(localStorage.getItem("user"))?.id ||
      localStorage.getItem("customerId") ||
      null
    );
  } catch {
    return null;
  }
};

const MyOrders = ({ shop }) => {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [activeTab,   setActiveTab]   = useState("all");
  const [expandedId,  setExpandedId]  = useState(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const customerId = getCustomerId();

  useEffect(() => {
    if (!customerId) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res  = await fetch(`${API_BASE}/orders/customer/${customerId}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📦 Orders data from API:', data);
        
        if (data.success) {
          const sortedOrders = data.orders.sort((a, b) => b.id - a.id);
          setOrders(sortedOrders);
        } else {
          setError(data.message || "Could not load orders.");
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId]);

  const visible = filterOrders(orders, activeTab);

  const parseAddress = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch { return { line: raw }; }
  };

  const renderAddress = (raw) => {
    const a = parseAddress(raw);
    if (!a) return <span style={{ color:"#bbb" }}>—</span>;
    const parts = [a.address1 || a.line, a.address2, a.city, a.state, a.postcode, a.country].filter(Boolean);
    return parts.map((p, i) => <div key={i} className="mo-detail-line">{p}</div>);
  };

  const getDisplayOrderNumber = (order) => {
    if (order.order_number) {
      return String(order.order_number).replace(/^EMT-/, 'VV-');
    }
    return `VV-${String(order.id || '000').padStart(3, '0')}`;
  };

  return (
    <Fragment>
      <style>{myOrdersStyles}</style>

      <LayoutOne shop={shop} headerTop="visible">
        <div className="mo-page">
          <div className="container">

            <h2 className="mo-page-title">My Orders</h2>
            <p className="mo-page-sub">Track &amp; manage your purchases</p>

            {/* ── Not logged in ── */}
            {notLoggedIn && (
              <div className="mo-card">
                <div className="mo-login-prompt">
                  <span className="mo-login-prompt-icon">🔐</span>
                  <p className="mo-login-prompt-title">Please sign in to view your orders</p>
                  <p className="mo-login-prompt-sub">
                    You need to be logged in to see your order history.
                  </p>
                  <Link to="/login-register" className="mo-btn-gold">Sign In</Link>
                </div>
              </div>
            )}

            {/* ── Filter tabs ── */}
            {!notLoggedIn && (
              <div className="mo-filters">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`mo-filter-btn${activeTab === tab.key ? " active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    {!loading && (
                      <span style={{ marginLeft:"4px", opacity:0.7 }}>
                        ({orders.length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── Loading ── */}
            {loading && <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>}

            {/* ── Error ── */}
            {!loading && !notLoggedIn && error && (
              <div className="mo-card">
                <div className="mo-error">
                  <span className="mo-error-icon">⚠️</span>
                  <p className="mo-error-text">{error}</p>
                  <button className="mo-btn-gold" onClick={() => window.location.reload()}>
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {!loading && !notLoggedIn && !error && visible.length === 0 && (
              <div className="mo-card">
                <div className="mo-empty">
                  <span className="mo-empty-icon">🛍️</span>
                  <p className="mo-empty-title">No orders yet</p>
                  <p className="mo-empty-sub">
                    Looks like you haven't placed any orders yet.
                  </p>
                  <Link to="/shop" className="mo-btn-gold">Start Shopping</Link>
                </div>
              </div>
            )}

            {/* ── Order cards ── */}
            {!loading && !notLoggedIn && !error && visible.map((order, idx) => {
              const items        = order.OrderItems || [];
              const previewItems = items.slice(0, 2);
              const extraCount   = items.length - 2;
              const isExpanded   = expandedId === order.id;
              const addr         = parseAddress(order.shipping_address) || parseAddress(order.billing_address);
              const displayOrderNumber = getDisplayOrderNumber(order);

              return (
                <div key={order.id} className="mo-card" style={{ animationDelay:`${idx * 0.06}s` }}>

                  {/* ── Header ── */}
                  <div className="mo-card-head">
                    <div className="mo-card-head-left">
                      <span className="mo-order-id">
                        Order #{displayOrderNumber}
                      </span>
                      <span className="mo-order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* ── Preview items ── */}
                  <div className="mo-items">
                    {previewItems.length > 0 ? (
                      previewItems.map((item, i) => {
                        const previewImage = getImageUrl(item.image || item.img);
                        return (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", flex:1, minWidth:0 }}>
                            <div className="mo-item-img">
                              {previewImage ? <img src={previewImage} alt={item.name} /> : "🛍️"}
                            </div>
                            <div className="mo-item-info">
                              <div className="mo-item-name">{item.name || 'Product'}</div>
                              <div className="mo-item-meta">
                                Qty: {item.quantity || 1}{formatVariantLabel(item) ? ` · ${formatVariantLabel(item)}` : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: '#aaa', fontSize: '13px' }}>No items</div>
                    )}
                    {extraCount > 0 && <span className="mo-more-items">+{extraCount} more</span>}
                  </div>

                  {/* ── Expanded detail panel ── */}
                  {isExpanded && (
                    <div className="mo-detail-panel">
                      <div className="mo-detail-grid">
                        <div>
                          <div className="mo-detail-section-title">Shipping Address</div>
                          {renderAddress(order.shipping_address || order.billing_address)}
                          {addr?.phone && (
                            <div className="mo-detail-line" style={{ marginTop:"4px" }}>
                              📞 {addr.phone}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="mo-detail-section-title">Order Info</div>
                          <div className="mo-detail-line">
                            <strong>Payment:</strong>&nbsp;
                            {order.payment_id || order.razorpay_order_id || "Cash on Delivery"}
                          </div>
                          {order.coupon_code && (
                            <div className="mo-detail-line"><strong>Coupon:</strong>&nbsp;{order.coupon_code}</div>
                          )}
                          {order.order_notes && (
                            <div className="mo-detail-line"><strong>Notes:</strong>&nbsp;{order.order_notes}</div>
                          )}
                          {order.awb_code && (
                            <div className="mo-detail-line"><strong>AWB:</strong>&nbsp;{order.awb_code}</div>
                          )}
                          {order.courier_name && (
                            <div className="mo-detail-line"><strong>Courier:</strong>&nbsp;{order.courier_name}</div>
                          )}
                          <div className="mo-detail-line" style={{ marginTop: '6px' }}>
                            <strong>Order ID:</strong>&nbsp;{order.id}
                          </div>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="mo-detail-section-title" style={{ marginBottom:"10px" }}>Items Ordered</div>
                      <table className="mo-items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i}>
                              <td>
                                {getImageUrl(item.image || item.img) && (
                                  <img
                                    src={getImageUrl(item.image || item.img)}
                                    alt={item.name}
                                    className="mo-table-img"
                                  />
                                )}
                                {item.name || 'Product'}
                                {formatVariantLabel(item) && (
                                  <span className="mo-variant-label">
                                    {formatVariantLabel(item)}
                                  </span>
                                )}
                              </td>
                              <td style={{ color:"#888" }}>× {item.quantity || 1}</td>
                              <td>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Price breakdown */}
                      <div style={{ marginTop:"16px", paddingTop:"14px", borderTop:"1px solid #ede8e2", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"5px" }}>
                        {order.subtotal > 0 && (
                          <div style={{ fontSize:"12px", color:"#888" }}>
                            Subtotal: <strong style={{ color:"#444" }}>₹{parseFloat(order.subtotal).toFixed(2)}</strong>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div style={{ fontSize:"12px", color:"#C9933A" }}>
                            Discount: −₹{parseFloat(order.discount).toFixed(2)}
                          </div>
                        )}
                        {order.delivery_charge > 0 && (
                          <div style={{ fontSize:"12px", color:"#888" }}>
                            Delivery: ₹{parseFloat(order.delivery_charge).toFixed(2)}
                          </div>
                        )}
                        {order.tax > 0 && (
                          <div style={{ fontSize:"12px", color:"#888" }}>
                            Tax: ₹{parseFloat(order.tax).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Tracking stepper */}
                      {order.status !== "refunded" && (
                        <TrackingStepper status={order.status} />
                      )}
                    </div>
                  )}

                  {/* ── Footer ── */}
                  <div className="mo-card-foot">
                    <div>
                      <div className="mo-total-label">Order Total</div>
                      <div className="mo-total-value">₹{parseFloat(order.total || 0).toFixed(2)}</div>
                    </div>
                    <div className="mo-actions">
                      <button className="mo-btn-outline" onClick={() => printCustomerInvoice(order, displayOrderNumber, parseAddress)}>
                        🧾 Invoice
                      </button>
                      <button
                        className="mo-btn-outline"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        {isExpanded ? "▲ Hide Details" : "▼ View Details"}
                      </button>

                      {order.status === "delivered" && items.length > 0 && (
                        <Link to={getProductUrl({ id: items[0]?.product_id, name: items[0]?.name })} className="mo-btn-outline">
                          ★ Write Review
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default MyOrders;
