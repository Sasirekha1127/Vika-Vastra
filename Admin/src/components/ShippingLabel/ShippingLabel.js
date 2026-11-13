// src/components/ShippingLabel/ShippingLabel.jsx
// Drop-in component — renders a "🏷️ Label" button.
// When clicked, opens a modal with the shipping label (FROM left → TO right)
// matching the courier-slip format. User can Print/Save as PDF or Download Excel.

import { useState } from 'react';
import * as XLSX from 'xlsx';

// ── Store details ─────────────────────────────────────────────────────────────
const STORE = {
  name:     'AJN MART',
  phone:    '+91 9626812020',
  website:  'www.vikavasthra.com',
  address1: '1/764,Puthupatty Mariyamman kovil (st)',
  address2: 'Ariyanoor Post, Salem ,TN-636308',
};
// ───────────────────────────────────────────────────────────────────────────────

const parseAddr = (raw) => { try { return JSON.parse(raw); } catch { return null; } };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const getResellerFrom = (order) => parseAddr(order.billing_address)?.resellerAddress || null;

const buildResellerLines = (address) => [
  address.addressLine,
  [address.city, address.state, address.pincode].filter(Boolean).join(', '),
  address.country,
].filter(Boolean);

const buildAddrLines = (addr, phone, phone2) => {
  if (!addr) return [];
  const lines = [];
  if (addr.firstName || addr.lastName)
    lines.push(`${addr.firstName || ''} ${addr.lastName || ''}`.trim());
  if (addr.company) lines.push(addr.company);
  if (addr.address1) lines.push(addr.address1);
  if (addr.address2) lines.push(addr.address2);
  if (addr.landmark) lines.push(`Near: ${addr.landmark}`);
  if (addr.postOffice || addr.district)
    lines.push([addr.postOffice && `${addr.postOffice} P.O.`, addr.district && `${addr.district} Dist.`].filter(Boolean).join(', '));
  
  const cityStatePin = [
    addr.city,
    addr.state,
    addr.postcode ? `${addr.postcode}` : ''
  ].filter(Boolean).join(', ');
  if (cityStatePin) lines.push(cityStatePin);

  const ph = addr.phone || phone;
  if (ph) lines.push(`Mob.: ${ph}`);
  if (addr.phone2 || phone2) lines.push(`Alt.: ${addr.phone2 || phone2}`);
  return lines;
};

export const printShippingLabels = (orders) => {
  const labels = orders.slice(0, 5).map(({ order, displayOrderId }) => {
    const shipping = parseAddr(order.shipping_address);
    const billing = parseAddr(order.billing_address);
    const address = shipping || billing;
    const resellerFrom = getResellerFrom(order);
    const toLines = buildAddrLines(address, order.customer_phone, order.customer_phone2);
    const toName = address
      ? `${address.firstName || ''} ${address.lastName || ''}`.trim()
      : order.customer_name;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const toBody = toLines.slice(1).map(line => `<div class="label-line">${line}</div>`).join('');

    return `<section class="label-wrap">
      <table class="label-table"><tr>
        <td class="label-col-from">
          <div class="label-tag">From:</div>
          ${resellerFrom
            ? [...buildResellerLines(resellerFrom).map(line => `<div class="label-line">${escapeHtml(line)}</div>`), resellerFrom.mobile ? `<div class="label-line">Mob : ${escapeHtml(resellerFrom.mobile)}</div>` : ''].join('')
            : `<div class="label-name">${STORE.name}</div><div class="label-line">Mob : ${STORE.phone}</div><div class="label-line">${STORE.website}</div><div class="label-line">${STORE.address1}</div><div class="label-line">${STORE.address2}</div>`}
          <div class="label-order-id">ID - ${displayOrderId} | ${orderDate}</div>
        </td>
        <td class="label-col-to">
          <div class="label-tag">TO:</div>
          <div class="label-name">${toName}</div>
          ${toBody}
        </td>
      </tr></table>
      <div class="label-note">Note: Video of parcel opening is mandatory for return or exchange requests.</div>
    </section>`;
  }).join('');

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Shipping Labels</title><style>
    ${PRINT_STYLES}
    body { padding: 0; }
    .labels-grid { display: grid; grid-template-columns: 1fr; grid-template-rows: repeat(5, minmax(0, 1fr)); row-gap: 2mm; width: 100%; height: 10.75in; }
    .label-wrap { width: 100%; height: auto; max-width: none; margin: 0; border: 1px solid #000; padding: 0; page-break-after: auto; page-break-inside: avoid; overflow: hidden; }
    .label-col-from, .label-col-to { padding: 2mm 3mm; }
    .label-tag { font-size: 14pt; line-height: 1.1; margin-bottom: 2px; padding-bottom: 2px; letter-spacing: 0.08em; }
    .label-name { font-size: 13pt; line-height: 1.1; margin-bottom: 1px; letter-spacing: 0.025em; }
    .label-line { font-size: 11pt; line-height: 1.12; letter-spacing: 0.015em; }
    .label-order-id { font-size: 9pt; margin-top: 2px; padding-top: 2px; letter-spacing: 0.06em; }
    .label-note { background: #fff !important; color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 10pt; line-height: 1.1; font-weight: 900; padding: 2px 4px; letter-spacing: 0.025em; white-space: normal; }
    @media print {
      @page { size: Letter portrait; margin: 3mm 12.7mm; }
      body { padding: 0; margin: 0; }
      .labels-grid { height: 10.75in; grid-template-rows: repeat(5, minmax(0, 1fr)); }
      .label-wrap { height: auto; min-height: 0; }
    }
  </style></head><body><main class="labels-grid">${labels}</main><script>window.onload=function(){window.print();}</script></body></html>`);
  win.document.close();
};

// ── Print styles injected into print window ───────────────────────────────────
const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; background: #fff; padding: 12px; }

  .label-wrap {
    width: 100%;
    max-width: 16cm;
    border: 2px solid #000;
    margin: 0 auto;
    page-break-inside: avoid;
  }

  .label-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .label-col-from {
    width: 50%;
    padding: 12px 14px;
    vertical-align: top;
    border-right: 2px solid #000;
  }

  .label-col-to {
    width: 50%;
    padding: 12px 14px;
    vertical-align: top;
  }

  .label-tag {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #000;
    margin-bottom: 6px;
    padding-bottom: 3px;
    border-bottom: 1px solid #ccc;
  }

  .label-name {
    font-size: 18px;
    font-weight: 800;
    color: #000;
    margin-bottom: 3px;
  }

  .label-line {
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: 0.02em;
    color: #111;
  }

  .label-order-id {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: #333;
    margin-top: 10px;
    padding-top: 6px;
    border-top: 1px dashed #ccc;
  }

  .label-note {
    background: #fff;
    color: #000;
    text-align: center;
    font-size: 17px;
    font-weight: 900;
    padding: 8px 10px;
    letter-spacing: 0.035em;
    border-top: 2px solid #000;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  @media print {
    body { padding: 0; margin: 0; }
    .label-wrap { border: 2px solid #000; width: 100%; max-width: none; }
  }
`;

// ── Download as Excel ──────────────────────────────────────────────────────────
const downloadExcel = (order, shippingAddr, displayOrderId) => {
  const toLines   = buildAddrLines(shippingAddr, order.customer_phone, order.customer_phone2);
  const resellerFrom = getResellerFrom(order);
  const fromLines = resellerFrom ? [
    ...buildResellerLines(resellerFrom),
    resellerFrom.mobile ? `Mob : ${resellerFrom.mobile}` : '',
    `ID - ${displayOrderId} | ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
  ].filter(Boolean) : [
    STORE.name,
    `Mob : ${STORE.phone}`,
    STORE.website,
    STORE.address1,
    STORE.address2,
    `ID - ${displayOrderId}`,
  ];

  const rows = [
    ['SHIPPING LABEL', ''],
    ['', ''],
    ['From:', 'TO:'],
    ...Array.from({ length: Math.max(fromLines.length, toLines.length) }, (_, i) => [
      fromLines[i] || '',
      toLines[i]   || '',
    ]),
    ['', ''],
    ['Order Date', new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Total', `Rs. ${Number(order.total || 0).toFixed(2)}`],
    ['', ''],
    ['Note', 'Video Of Parcel Opening Is Mandatory For Return Or Exchange Requests.'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [{ wch: 42 }, { wch: 42 }];

  // Style header
  if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };

  // Merge title row
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Shipping Label');
  XLSX.writeFile(wb, `label-${displayOrderId}.xlsx`);
};

// ── Open print window ──────────────────────────────────────────────────────────
const openPrintWindow = (order, shippingAddr, displayOrderId) => {
  const toLines   = buildAddrLines(shippingAddr, order.customer_phone, order.customer_phone2);
  const resellerFrom = getResellerFrom(order);
  const toName    = shippingAddr
    ? `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim()
    : order.customer_name;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const toBody = toLines.slice(1).map(l => `<div class="label-line">${l}</div>`).join('');
  const fromBody = resellerFrom
    ? [...buildResellerLines(resellerFrom), resellerFrom.mobile ? `Mob : ${resellerFrom.mobile}` : '']
      .filter(Boolean).map(line => `<div class="label-line">${escapeHtml(line)}</div>`).join('')
    : `<div class="label-line">Mob : ${STORE.phone}</div><div class="label-line">${STORE.website}</div><div class="label-line">${STORE.address1}</div><div class="label-line">${STORE.address2}</div>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Shipping Label – ${displayOrderId}</title>
  <style>${PRINT_STYLES}
    @media print {
      body > *:not(.label-wrap) { display: none !important; }
      body > .label-wrap { display: block !important; }
    }
  </style>
</head>
<body>
  <div class="label-wrap">
    <table class="label-table">
      <tr>
        <!-- FROM (Left) -->
        <td class="label-col-from">
          <div class="label-tag">From:</div>
          ${resellerFrom ? '' : `<div class="label-name">${STORE.name}</div>`}
          ${fromBody}
          <div class="label-order-id">ID - ${displayOrderId} &nbsp;|&nbsp; ${orderDate}</div>
        </td>

        <!-- TO (Right) -->
        <td class="label-col-to">
          <div class="label-tag">TO:</div>
          <div class="label-name">${toName}</div>
          ${toBody}
        </td>
      </tr>
    </table>

    <!-- NOTE -->
    <div class="label-note">
      Note : Video Of Parcel Opening Is Mandatory For Return Or Exchange Requests.
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=720,height=520');
  win.document.write(html);
  win.document.close();
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ShippingLabel({ order, displayOrderId }) {
  const [open, setOpen] = useState(false);

  const billing      = parseAddr(order.billing_address);
  const shipping     = parseAddr(order.shipping_address);
  const shippingAddr = shipping || billing;
  const resellerFrom = billing?.resellerAddress || null;

  const toLines = buildAddrLines(shippingAddr, order.customer_phone, order.customer_phone2);
  const toName  = shippingAddr
    ? `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim()
    : order.customer_name;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '5px 12px',
          background: '#720E1E',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        🏷️ Label
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 10, padding: '24px 28px',
              width: 900, maxWidth: '96vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#720E1E' }}>🏷️ Shipping Label</div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}
              >✕</button>
            </div>

            {/* ── Label Preview (From Left, To Right) ── */}
            <div style={{ border: '2px solid #000', fontFamily: 'Arial, sans-serif', fontSize: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex' }}>

                {/* FROM (Left column) */}
                <div style={{ flex: 1, padding: '12px 14px', borderRight: '2px solid #000' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000', marginBottom: 6, borderBottom: '1px solid #e0e0e0', paddingBottom: 3 }}>
                    From:
                  </div>
                  {resellerFrom ? (
                    <>
                      {buildResellerLines(resellerFrom).map((line, i) => <div key={i} style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>{line}</div>)}
                      {resellerFrom.mobile && <div style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>Mob : {resellerFrom.mobile}</div>}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#000', marginBottom: 3 }}>{STORE.name}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>Mob : {STORE.phone}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>{STORE.website}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>{STORE.address1}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>{STORE.address2}</div>
                    </>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#444', marginTop: 10, paddingTop: 6, borderTop: '1px dashed #ccc' }}>
                    ID - {displayOrderId} &nbsp;|&nbsp; {orderDate}
                  </div>
                </div>

                {/* TO (Right column) */}
                <div style={{ flex: 1, padding: '12px 14px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000', marginBottom: 6, borderBottom: '1px solid #e0e0e0', paddingBottom: 3 }}>
                    TO:
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#000', marginBottom: 3 }}>{toName}</div>
                  {toLines.slice(1).map((line, i) => (
                    <div key={i} style={{ fontSize: 14, lineHeight: 1.5, color: '#111' }}>{line}</div>
                  ))}
                </div>

              </div>

              {/* NOTE */}
              <div style={{ background: '#fff', color: '#000', textAlign: 'center', fontSize: 15, fontWeight: 900, padding: '8px 10px', letterSpacing: '0.02em', borderTop: '2px solid #000', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                <strong>Note: Video of parcel opening is mandatory for return or exchange requests.</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => openPrintWindow(order, shippingAddr, displayOrderId)}
                style={{
                  flex: 1, padding: '11px 0',
                  background: '#720E1E', color: '#fff',
                  border: 'none', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                🖨️ Print / Save PDF
              </button>
              <button
                onClick={() => downloadExcel(order, shippingAddr, displayOrderId)}
                style={{
                  flex: 1, padding: '11px 0',
                  background: '#1d6f42', color: '#fff',
                  border: 'none', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                📊 Download Excel
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 10 }}>
              Print → "Save as PDF" to get a PDF file
            </p>
          </div>
        </div>
      )}
    </>
  );
}
