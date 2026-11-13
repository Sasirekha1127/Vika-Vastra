import { useState } from 'react';
import * as XLSX from 'xlsx';

// ── Seller / Store Information ────────────────────────────────────────────────
const HSN_CODE = '5407'; // Standard textile/apparel HSN code

const STORE = {
  name:      'VIKA VASTHRA',
  contactPerson: 'Vikraman.k',
  phone:     '+91 9482944552',
  email:     'vikram.25feb@gmail.com',
  website:   'www.vikavasthra.com',
  address1:  'Murari Enclave, Maragondanahalli',
  address2:  'Electronic City phase 1',
  city:      'Bangalore',
  state:     'Karnataka',
  stateCode: '29',
  pincode:   '560100',
  gstin:     '33GRIPS1487L1Z3',
  pan:       'GRIPS1487L',
};

const STATE_CODES = {
  'jammu and kashmir': '01',
  'himachal pradesh':  '02',
  'punjab':            '03',
  'chandigarh':        '04',
  'uttarakhand':       '05',
  'haryana':           '06',
  'delhi':             '07',
  'rajasthan':         '08',
  'uttar pradesh':     '09',
  'bihar':             '10',
  'sikkim':            '11',
  'arunachal pradesh': '12',
  'nagaland':          '13',
  'manipur':           '14',
  'mizoram':           '15',
  'tripura':           '16',
  'meghalaya':         '17',
  'assam':             '18',
  'west bengal':       '19',
  'jharkhand':         '20',
  'odisha':            '21',
  'chhattisgarh':      '22',
  'madhya pradesh':    '23',
  'madhyapradesh':     '23',
  'gujarat':           '24',
  'maharashtra':       '27',
  'andhra pradesh':    '28',
  'karnataka':         '29',
  'goa':               '30',
  'kerala':            '32',
  'tamil nadu':        '33',
  'tamilnadu':         '33',
  'puducherry':        '34',
  'telangana':         '36',
};

const getStateCode = (stateName) => {
  if (!stateName) return '33';
  const clean = stateName.toLowerCase().replace(/[^a-z]/g, '');
  for (const [name, code] of Object.entries(STATE_CODES)) {
    if (clean.includes(name.replace(/[^a-z]/g, '')) || name.replace(/[^a-z]/g, '').includes(clean)) {
      return code;
    }
  }
  return '33';
};

const parseAddr = (raw) => {
  try { return JSON.parse(raw); } catch { return null; }
};

// Splits a raw order_notes string
const parseNotes = (raw) => {
  if (!raw) return { note: null, deliveryState: null };
  const match = raw.match(/Delivery State:\s*(.+)$/i);
  if (!match) return { note: raw.trim() || null, deliveryState: null };
  return {
    deliveryState: match[1].trim() || null,
    note: raw.replace(/Delivery State:\s*.+$/i, '').trim() || null,
  };
};

// Helper: Convert Number to Words in Indian Rupees
function numToWordsINR(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  };

  const n = Math.round(Number(num) || 0);
  if (n === 0) return 'Rupees Zero Only';

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  let res = '';
  if (crore > 0) res += inWords(crore) + ' Crore ';
  if (lakh > 0) res += inWords(lakh) + ' Lakh ';
  if (thousand > 0) res += inWords(thousand) + ' Thousand ';
  if (remainder > 0) res += inWords(remainder) + ' ';

  return `Rupees ${res.trim()} Only`;
}

// ── Print styles for Tax Invoice ──────────────────────────────────────────────
const INVOICE_PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #fff;
    color: #111;
    font-size: 11.5px;
    line-height: 1.4;
    padding: 20px;
  }

  .inv-container {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    border: 1.5px solid #222;
    background: #fff;
  }

  .inv-header {
    display: flex;
    border-bottom: 1.5px solid #222;
    padding: 14px 18px;
    background: #fafafa;
  }
  .inv-seller {
    flex: 1.2;
    padding-right: 15px;
    border-right: 1px solid #ccc;
  }
  .inv-seller-title {
    font-size: 17px;
    font-weight: 800;
    color: #0b1f44;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }
  .inv-seller-line {
    font-size: 11px;
    color: #333;
    line-height: 1.45;
  }

  .inv-meta {
    flex: 0.9;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .inv-badge {
    font-size: 18px;
    font-weight: 800;
    color: #0b1f44;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  .inv-meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding: 2px 0;
  }
  .inv-meta-label { font-weight: 600; color: #555; }
  .inv-meta-val { font-weight: 700; color: #111; }

  .inv-parties {
    display: flex;
    border-bottom: 1.5px solid #222;
  }
  .inv-party-col {
    flex: 1;
    padding: 10px 16px;
  }
  .inv-party-col:first-child {
    border-right: 1.5px solid #222;
  }
  .inv-party-title {
    font-size: 10.5px;
    font-weight: 800;
    text-transform: uppercase;
    color: #0b1f44;
    background: #eef2f8;
    padding: 3px 6px;
    margin-bottom: 6px;
    border-radius: 2px;
    display: inline-block;
  }
  .inv-party-name { font-size: 13px; font-weight: 700; color: #000; margin-bottom: 3px; }
  .inv-party-text { font-size: 11px; line-height: 1.45; color: #222; }

  .inv-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  .inv-table th {
    background: #0b1f44;
    color: #fff;
    font-weight: 700;
    padding: 8px 6px;
    text-align: left;
    border: 1px solid #0b1f44;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.03em;
  }
  .inv-table td {
    padding: 7px 6px;
    border: 1px solid #ddd;
    vertical-align: middle;
  }
  .inv-table tr:nth-child(even) { background: #fdfdfd; }
  .text-center { text-align: center; }
  .text-right  { text-align: right; }
  .font-bold   { font-weight: 700; }

  .inv-summary-section {
    display: flex;
    border-top: 1.5px solid #222;
    border-bottom: 1.5px solid #222;
  }
  .inv-words-col {
    flex: 1.2;
    padding: 12px 16px;
    border-right: 1.5px solid #222;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .inv-words-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 4px; }
  .inv-words-val { font-size: 12px; font-weight: 700; color: #0b1f44; font-style: italic; }

  .inv-calc-col {
    flex: 0.9;
    padding: 10px 16px;
  }
  .inv-calc-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding: 3px 0;
  }
  .inv-calc-row.total {
    border-top: 1.5px solid #222;
    margin-top: 4px;
    padding-top: 6px;
    font-size: 13px;
    font-weight: 800;
    color: #0b1f44;
  }

  .inv-footer {
    display: flex;
    padding: 12px 16px;
    background: #fafafa;
  }
  .inv-terms {
    flex: 1.2;
    padding-right: 16px;
    border-right: 1px solid #ddd;
  }
  .inv-terms-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; margin-bottom: 4px; }
  .inv-terms-text { font-size: 10px; color: #444; line-height: 1.4; }

  .inv-sign {
    flex: 0.9;
    padding-left: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: right;
    min-height: 70px;
  }
  .inv-sign-for { font-size: 10px; font-weight: 700; color: #333; }
  .inv-sign-label { font-size: 10.5px; font-weight: 700; color: #0b1f44; border-top: 1px solid #888; padding-top: 4px; display: inline-block; }

  @media print {
    body { padding: 0; margin: 0; background: #fff; }
    .inv-container { border: 1.5px solid #000; width: 100%; max-width: 100%; }
    .inv-table th { background: #0b1f44 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .inv-party-title { background: #eef2f8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

export default function Invoice({ order, displayOrderId }) {
  const [open, setOpen] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState(() => `INV-${String(displayOrderId || '').replace(/^#/, '')}`);

  const billing      = parseAddr(order.billing_address);
  const shipping     = parseAddr(order.shipping_address);
  const shippingAddr = shipping || billing;
  const billingAddr  = billing  || shipping;
  const buyerGst = billingAddr?.gstBillingDetails || (
    billingAddr?.gstin ? {
      businessName: billingAddr.company,
      gstin: billingAddr.gstin,
      billingAddress: billingAddr.address1,
      state: billingAddr.state,
      pincode: billingAddr.postcode,
    } : null
  );

  const { deliveryState } = parseNotes(order.order_notes);

  const stateOfSupply = shippingAddr?.state || billingAddr?.state || deliveryState || STORE.state;
  const destStateCode = getStateCode(stateOfSupply);
  const isIntraState  = destStateCode === STORE.stateCode; // Within Tamil Nadu

  const subtotal       = Number(order.subtotal        || 0);
  const totalTax       = Number(order.tax             || 0);
  const deliveryCharge = Number(order.delivery_charge || 0);
  const discount       = Number(order.discount        || 0);
  const total          = Number(order.total           || 0);

  // Split each saved GST amount by place of supply.
  const cgstAmount = isIntraState ? (totalTax / 2) : 0;
  const sgstAmount = isIntraState ? (totalTax / 2) : 0;
  const igstAmount = !isIntraState ? totalTax : 0;

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const billedName = billingAddr?.gstBilling && buyerGst?.businessName
    ? buyerGst.businessName
    : billingAddr
      ? `${billingAddr.firstName || ''} ${billingAddr.lastName || ''}`.trim()
      : order.customer_name;
  const shippedName = shippingAddr
    ? `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim()
    : order.customer_name;

  // ── Open Print Window ───────────────────────────────────────────────────────
  const handlePrint = () => {
    const finalInvoiceNo = invoiceNo.trim();
    if (!finalInvoiceNo) return;
    const itemsRowsHtml = (order.OrderItems && order.OrderItems.length > 0)
      ? order.OrderItems.map((item, idx) => {
          const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
          const itemPrice = Number(item.price || 0);
          const itemTotal = itemPrice * itemQty;
          const hsnCode = HSN_CODE;

          if (isIntraState) {
            const itemTax = Number(item.taxAmount ?? (itemTotal * Number(item.gstRate || 0) / 100));
            const itemTaxable = Number(item.taxableAmount ?? itemTotal);
            const itemCgst = itemTax / 2;
            const itemSgst = itemTax / 2;
            return `
              <tr>
                <td class="text-center font-bold">${idx + 1}</td>
                <td>
                  <strong>${item.name || 'Product'}</strong>
                  ${(item.weight || (item.Variant?.attributes && Object.entries(item.Variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', '))) ? `<br/><span style="font-size:10px; color:#555;">Variant: ${item.weight || Object.entries(item.Variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}</span>` : ''}
                </td>
                <td class="text-center">${hsnCode}</td>
                <td class="text-center font-bold">${itemQty}</td>
                <td class="text-right">₹${(itemTaxable / itemQty).toFixed(2)}</td>
                <td class="text-right font-bold">₹${itemTaxable.toFixed(2)}</td>
                <td class="text-right">${Number(item.gstRate || 0) / 2}%<br/>₹${itemCgst.toFixed(2)}</td>
                <td class="text-right">${Number(item.gstRate || 0) / 2}%<br/>₹${itemSgst.toFixed(2)}</td>
                <td class="text-right font-bold">₹${(itemTaxable + itemTax).toFixed(2)}</td>
              </tr>
            `;
          } else {
            const itemIgst = Number(item.taxAmount ?? (itemTotal * Number(item.gstRate || 0) / 100));
            const itemTaxable = Number(item.taxableAmount ?? itemTotal);
            return `
              <tr>
                <td class="text-center font-bold">${idx + 1}</td>
                <td>
                  <strong>${item.name || 'Product'}</strong>
                  ${(item.weight || (item.Variant?.attributes && Object.entries(item.Variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', '))) ? `<br/><span style="font-size:10px; color:#555;">Variant: ${item.weight || Object.entries(item.Variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}</span>` : ''}
                </td>
                <td class="text-center">${hsnCode}</td>
                <td class="text-center font-bold">${itemQty}</td>
                <td class="text-right">₹${(itemTaxable / itemQty).toFixed(2)}</td>
                <td class="text-right font-bold">₹${itemTaxable.toFixed(2)}</td>
                <td class="text-right">${Number(item.gstRate || 0)}%<br/>₹${itemIgst.toFixed(2)}</td>
                <td class="text-right font-bold">₹${(itemTaxable + itemIgst).toFixed(2)}</td>
              </tr>
            `;
          }
        }).join('')
      : `<tr><td colspan="${isIntraState ? 9 : 8}" class="text-center">No items found</td></tr>`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>GST Tax Invoice – ${finalInvoiceNo}</title>
  <style>${INVOICE_PRINT_STYLES}</style>
</head>
<body>
  <div class="inv-container">
    <!-- Header -->
    <div class="inv-header">
      <div class="inv-seller">
        <div class="inv-seller-title">${STORE.name}</div>
        <div class="inv-seller-line">${STORE.address1}, ${STORE.address2}</div>
        <div class="inv-seller-line">${STORE.state} - ${STORE.pincode} (State Code: ${STORE.stateCode})</div>
        <div class="inv-seller-line"><strong>GSTIN:</strong> ${STORE.gstin} &nbsp;|&nbsp; <strong>PAN:</strong> ${STORE.pan}</div>
        <div class="inv-seller-line"><strong>Phone:</strong> ${STORE.phone} &nbsp;|&nbsp; <strong>Web:</strong> ${STORE.website}</div>
      </div>
      <div class="inv-meta">
        <div class="inv-badge">TAX INVOICE</div>
        <div class="inv-meta-row"><span class="inv-meta-label">Invoice No:</span><span class="inv-meta-val">${finalInvoiceNo}</span></div>
        <div class="inv-meta-row"><span class="inv-meta-label">Invoice Date:</span><span class="inv-meta-val">${invoiceDate}</span></div>
        <div class="inv-meta-row"><span class="inv-meta-label">Order Ref:</span><span class="inv-meta-val">${displayOrderId}</span></div>
        <div class="inv-meta-row"><span class="inv-meta-label">Place of Supply:</span><span class="inv-meta-val">${stateOfSupply} (${destStateCode})</span></div>
        <div class="inv-meta-row"><span class="inv-meta-label">Reverse Charge:</span><span class="inv-meta-val">No</span></div>
      </div>
    </div>

    <!-- Parties -->
    <div class="inv-parties">
      <div class="inv-party-col">
        <div class="inv-party-title">Billed To (Receiver Details)</div>
        <div class="inv-party-name">${billedName}</div>
        ${billingAddr?.gstBilling && buyerGst?.gstin ? `<div class="inv-party-text"><strong>GSTIN:</strong> ${buyerGst.gstin}</div>` : ''}
        <div class="inv-party-text">${billingAddr?.gstBilling && buyerGst?.billingAddress ? buyerGst.billingAddress : `${billingAddr?.address1 || ''} ${billingAddr?.address2 || ''}`}</div>
        ${!billingAddr?.gstBilling && billingAddr?.landmark ? `<div class="inv-party-text">Near: ${billingAddr.landmark}</div>` : ''}
        <div class="inv-party-text">${billingAddr?.gstBilling && buyerGst?.state ? buyerGst.state : billingAddr?.city || ''}${!billingAddr?.gstBilling && billingAddr?.state ? `, ${billingAddr.state}` : ''} ${billingAddr?.gstBilling && buyerGst?.pincode ? `- ${buyerGst.pincode}` : !billingAddr?.gstBilling && billingAddr?.postcode ? `- ${billingAddr.postcode}` : ''}</div>
        <div class="inv-party-text">State Code: ${getStateCode(billingAddr?.gstBilling ? buyerGst?.state : billingAddr?.state || stateOfSupply)}</div>
        <div class="inv-party-text">📞 ${billingAddr?.phone || order.customer_phone || '—'} &nbsp;|&nbsp; ✉️ ${order.customer_email || '—'}</div>
      </div>

      <div class="inv-party-col">
        <div class="inv-party-title">Shipped To (Consignee Details)</div>
        <div class="inv-party-name">${shippedName}</div>
        <div class="inv-party-text">${shippingAddr?.address1 || ''} ${shippingAddr?.address2 || ''}</div>
        ${shippingAddr?.landmark ? `<div class="inv-party-text">Near: ${shippingAddr.landmark}</div>` : ''}
        <div class="inv-party-text">${shippingAddr?.city || ''}${shippingAddr?.state ? `, ${shippingAddr.state}` : ''} ${shippingAddr?.postcode ? `- ${shippingAddr.postcode}` : ''}</div>
        <div class="inv-party-text">State Code: ${destStateCode}</div>
        <div class="inv-party-text">📞 ${shippingAddr?.phone || order.customer_phone || '—'}</div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="inv-table">
      <thead>
        <tr>
          <th style="width: 32px;" class="text-center">#</th>
          <th>Item Description</th>
          <th style="width: 55px;" class="text-center">HSN</th>
          <th style="width: 40px;" class="text-center">Qty</th>
          <th style="width: 65px;" class="text-right">Rate</th>
          <th style="width: 75px;" class="text-right">Taxable Val</th>
          ${isIntraState ? `
            <th style="width: 65px;" class="text-right">CGST</th>
            <th style="width: 65px;" class="text-right">SGST</th>
          ` : `
            <th style="width: 75px;" class="text-right">IGST</th>
          `}
          <th style="width: 80px;" class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRowsHtml}
      </tbody>
    </table>

    <!-- Summary Section -->
    <div class="inv-summary-section">
      <div class="inv-words-col">
        <div>
          <div class="inv-words-title">Total Amount in Words:</div>
          <div class="inv-words-val">${numToWordsINR(total)}</div>
        </div>
        <div style="margin-top: 10px; font-size: 10px; color: #555;">
          <strong>Payment Method:</strong> Online (Razorpay) &nbsp;|&nbsp; <strong>Status:</strong> ${order.payment_status || 'PAID'} &nbsp;|&nbsp; <strong>Txn ID:</strong> ${order.payment_id || '—'}
        </div>
      </div>

      <div class="inv-calc-col">
        <div class="inv-calc-row">
          <span style="color:#555;">Taxable Subtotal</span>
          <span class="font-bold">₹${subtotal.toFixed(2)}</span>
        </div>
        ${isIntraState ? `
          <div class="inv-calc-row">
            <span style="color:#555;">CGST</span>
            <span>+₹${cgstAmount.toFixed(2)}</span>
          </div>
          <div class="inv-calc-row">
            <span style="color:#555;">SGST</span>
            <span>+₹${sgstAmount.toFixed(2)}</span>
          </div>
        ` : `
          <div class="inv-calc-row">
            <span style="color:#555;">IGST</span>
            <span>+₹${igstAmount.toFixed(2)}</span>
          </div>
        `}
        <div class="inv-calc-row">
          <span style="color:#555;">Delivery Charges</span>
          <span>${deliveryCharge > 0 ? `+₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
        </div>
        ${discount > 0 ? `
          <div class="inv-calc-row" style="color:#2e7d32;">
            <span>Discount (${order.coupon_code || 'Coupon'})</span>
            <span>−₹${discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="inv-calc-row total">
          <span>Grand Total</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="inv-footer">
      <div class="inv-terms">
        <div class="inv-terms-title">Terms & Conditions:</div>
        <div class="inv-terms-text">1. Video of parcel opening without cut/pause is mandatory for any exchange or return claims.</div>
        <div class="inv-terms-text">2. Goods once sold will be subject to store return & warranty policy.</div>
        <div class="inv-terms-text">3. This is a computer generated tax invoice.</div>
      </div>
      <div class="inv-sign">
        <div class="inv-sign-for">For ${STORE.name}</div>
        <div>
          <div class="inv-sign-label">Authorized Signatory</div>
        </div>
      </div>
    </div>

  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=840,height=750');
    win.document.write(html);
    win.document.close();
  };

  // ── Download Excel Invoice ──────────────────────────────────────────────────
  const handleDownloadExcel = () => {
    const finalInvoiceNo = invoiceNo.trim();
    if (!finalInvoiceNo) return;
    const rows = [
      ['TAX INVOICE', '', '', '', '', '', ''],
      [STORE.name, '', '', '', `Invoice No: ${finalInvoiceNo}`, '', ''],
      [`${STORE.address1}, ${STORE.address2}, ${STORE.state} - ${STORE.pincode}`, '', '', '', `Invoice Date: ${invoiceDate}`, '', ''],
      [`GSTIN: ${STORE.gstin} | PAN: ${STORE.pan}`, '', '', '', `Order ID: ${displayOrderId}`, '', ''],
      [`Phone: ${STORE.phone} | Web: ${STORE.website}`, '', '', '', `Place of Supply: ${stateOfSupply} (${destStateCode})`, '', ''],
      ['', '', '', '', '', '', ''],
      ['BILLED TO (CUSTOMER)', '', '', 'SHIPPED TO (CONSIGNEE)', '', '', ''],
      [`Name: ${billedName}`, '', '', `Name: ${shippedName}`, '', '', ''],
      ...(billingAddr?.gstBilling && buyerGst?.gstin ? [[`Buyer GSTIN: ${buyerGst.gstin}`, '', '', '', '', '', '']] : []),
      [`Address: ${billingAddr?.gstBilling ? buyerGst?.billingAddress || '' : billingAddr?.address1 || ''}, ${billingAddr?.gstBilling ? buyerGst?.pincode || '' : billingAddr?.city || ''}`, '', '', `Address: ${shippingAddr?.address1 || ''}, ${shippingAddr?.city || ''}`, '', '', ''],
      [`State: ${billingAddr?.gstBilling ? buyerGst?.state || '' : billingAddr?.state || stateOfSupply} (Code: ${getStateCode(billingAddr?.gstBilling ? buyerGst?.state : billingAddr?.state || stateOfSupply)})`, '', '', `State: ${shippingAddr?.state || stateOfSupply} (Code: ${destStateCode})`, '', '', ''],
      [`Phone: ${billingAddr?.phone || order.customer_phone || ''}`, '', '', `Phone: ${shippingAddr?.phone || order.customer_phone || ''}`, '', '', ''],
      ['', '', '', '', '', '', ''],
      ['#', 'Item Description', 'HSN Code', 'Qty', 'Unit Price (Rs)', 'Taxable Amount (Rs)', 'GST (Rs)', 'Total (Rs)'],
    ];

    if (order.OrderItems && order.OrderItems.length > 0) {
      order.OrderItems.forEach((item, idx) => {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const price = Number(item.price || 0);
        const taxable = Number(item.taxableAmount ?? price * qty);
        const tax = Number(item.taxAmount ?? (taxable * Number(item.gstRate || 0) / 100));
        rows.push([
          idx + 1,
          item.name + (item.weight ? ` (${item.weight})` : ''),
          HSN_CODE,
          qty,
          (Number(item.taxableAmount ?? price * qty) / qty).toFixed(2),
          taxable.toFixed(2),
          tax.toFixed(2),
          (taxable + tax).toFixed(2),
        ]);
      });
    }

    rows.push(
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', 'Taxable Subtotal', `Rs. ${subtotal.toFixed(2)}`],
      ['', '', '', '', '', isIntraState ? 'CGST' : 'IGST', `Rs. ${(isIntraState ? cgstAmount : igstAmount).toFixed(2)}`],
      ...(isIntraState ? [['', '', '', '', '', 'SGST', `Rs. ${sgstAmount.toFixed(2)}`]] : []),
      ['', '', '', '', '', 'Delivery Charge', deliveryCharge > 0 ? `Rs. ${deliveryCharge.toFixed(2)}` : 'FREE'],
      ...(discount > 0 ? [['', '', '', '', '', `Discount (${order.coupon_code || 'Coupon'})`, `-Rs. ${discount.toFixed(2)}`]] : []),
      ['', '', '', '', '', 'GRAND TOTAL', `Rs. ${total.toFixed(2)}`],
      ['', '', '', '', '', '', ''],
      ['Amount in Words:', numToWordsINR(total), '', '', '', '', ''],
      ['Payment Status:', order.payment_status || 'PAID', '', 'Txn ID:', order.payment_id || '—', '', ''],
      ['Note:', 'Video of parcel opening is mandatory for return/exchange requests.', '', '', '', '', '']
    );

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 6 }, { wch: 36 }, { wch: 12 }, { wch: 8 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tax Invoice');
    XLSX.writeFile(wb, `invoice-${finalInvoiceNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '5px 12px',
          background: '#0b1f44',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginLeft: 5,
        }}
      >
        🧾 Invoice
      </button>

      {/* Modal Preview */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 10, padding: '24px 28px',
              width: 820, maxWidth: '96%', maxHeight: '92vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              fontFamily: 'Segoe UI, Arial, sans-serif',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#0b1f44' }}>
                🧾 GST Tax Invoice Preview – {invoiceNo}
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}
              >✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label htmlFor={`invoice-number-${order.id}`} style={{ fontSize: 12, fontWeight: 700, color: '#444', whiteSpace: 'nowrap' }}>
                Invoice Number
              </label>
              <input
                id={`invoice-number-${order.id}`}
                type="text"
                value={invoiceNo}
                maxLength={40}
                onChange={e => setInvoiceNo(e.target.value)}
                style={{ flex: 1, padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: 5, fontSize: 13 }}
              />
            </div>

            {/* Invoice Card Container */}
            <div style={{ border: '1.5px solid #222', background: '#fff', fontSize: 12, lineHeight: 1.4 }}>
              
              {/* Header */}
              <div style={{ display: 'flex', borderBottom: '1.5px solid #222', padding: '14px 16px', background: '#fafafa' }}>
                <div style={{ flex: 1.3, paddingRight: 15, borderRight: '1px solid #ccc' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0b1f44', textTransform: 'uppercase' }}>{STORE.name}</div>
                  <div style={{ fontSize: 11, color: '#333' }}>{STORE.address1}, {STORE.address2}</div>
                  <div style={{ fontSize: 11, color: '#333' }}>{STORE.state} - {STORE.pincode}</div>
                  <div style={{ fontSize: 11, color: '#333' }}><strong>GSTIN:</strong> {STORE.gstin} &nbsp;|&nbsp; <strong>PAN:</strong> {STORE.pan}</div>
                  <div style={{ fontSize: 11, color: '#333' }}><strong>Phone:</strong> {STORE.phone} &nbsp;|&nbsp; <strong>Web:</strong> {STORE.website}</div>
                </div>

                <div style={{ flex: 0.9, paddingLeft: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0b1f44', marginBottom: 4 }}>TAX INVOICE</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#666', fontWeight: 600 }}>Invoice No:</span>
                    <strong>{invoiceNo}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#666', fontWeight: 600 }}>Invoice Date:</span>
                    <strong>{invoiceDate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#666', fontWeight: 600 }}>Order ID:</span>
                    <strong>{displayOrderId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#666', fontWeight: 600 }}>Place of Supply:</span>
                    <strong>{stateOfSupply} ({destStateCode})</strong>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'flex', borderBottom: '1.5px solid #222' }}>
                <div style={{ flex: 1, padding: '10px 14px', borderRight: '1.5px solid #222' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0b1f44', background: '#eef2f8', padding: '2px 6px', display: 'inline-block', marginBottom: 4 }}>
                    Billed To (Receiver Details)
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{billedName}</div>
                  {billingAddr?.gstBilling && buyerGst?.gstin && (
                    <div style={{ fontSize: 11, fontWeight: 600 }}>GSTIN: {buyerGst.gstin}</div>
                  )}
                  <div style={{ fontSize: 11 }}>{billingAddr?.gstBilling ? buyerGst?.billingAddress || '' : `${billingAddr?.address1 || ''} ${billingAddr?.address2 || ''}`}</div>
                  {!billingAddr?.gstBilling && billingAddr?.landmark && <div style={{ fontSize: 11 }}>Near: {billingAddr.landmark}</div>}
                  <div style={{ fontSize: 11 }}>{billingAddr?.gstBilling ? buyerGst?.state || '' : `${billingAddr?.city || ''}${billingAddr?.state ? `, ${billingAddr.state}` : ''}`} {billingAddr?.gstBilling ? (buyerGst?.pincode ? `- ${buyerGst.pincode}` : '') : (billingAddr?.postcode ? `- ${billingAddr.postcode}` : '')}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>State Code: {getStateCode(billingAddr?.gstBilling ? buyerGst?.state : billingAddr?.state || stateOfSupply)} &nbsp;|&nbsp; 📞 {billingAddr?.phone || order.customer_phone || '—'}</div>
                </div>

                <div style={{ flex: 1, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#0b1f44', background: '#eef2f8', padding: '2px 6px', display: 'inline-block', marginBottom: 4 }}>
                    Shipped To (Consignee Details)
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{shippedName}</div>
                  <div style={{ fontSize: 11 }}>{shippingAddr?.address1 || ''} {shippingAddr?.address2 || ''}</div>
                  {shippingAddr?.landmark && <div style={{ fontSize: 11 }}>Near: {shippingAddr.landmark}</div>}
                  <div style={{ fontSize: 11 }}>{shippingAddr?.city || ''}{shippingAddr?.state ? `, ${shippingAddr.state}` : ''} {shippingAddr?.postcode ? `- ${shippingAddr.postcode}` : ''}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>State Code: {destStateCode} &nbsp;|&nbsp; 📞 {shippingAddr?.phone || order.customer_phone || '—'}</div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#0b1f44', color: '#fff' }}>
                    <th style={{ padding: '6px', width: 30, textAlign: 'center' }}>#</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '6px', width: 50, textAlign: 'center' }}>HSN</th>
                    <th style={{ padding: '6px', width: 40, textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '6px', width: 65, textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '6px', width: 75, textAlign: 'right' }}>Taxable Val</th>
                    {isIntraState ? (
                      <>
                        <th style={{ padding: '6px', width: 65, textAlign: 'right' }}>CGST</th>
                        <th style={{ padding: '6px', width: 65, textAlign: 'right' }}>SGST</th>
                      </>
                    ) : (
                      <th style={{ padding: '6px', width: 75, textAlign: 'right' }}>IGST</th>
                    )}
                    <th style={{ padding: '6px', width: 80, textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.OrderItems?.length > 0 ? (
                    order.OrderItems.map((item, idx) => {
                      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
                      const price = Number(item.price || 0);
                      const itemTotal = price * qty;
                      const itemTax = Number(item.taxAmount ?? (itemTotal * Number(item.gstRate || 0) / 100));
                      const itemTaxable = Number(item.taxableAmount ?? itemTotal);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #ddd', background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>
                          <td style={{ padding: '6px', textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '6px' }}>
                            <strong>{item.name}</strong>
                            {item.weight && <span style={{ marginLeft: 5, fontSize: 10, color: '#555' }}>({item.weight})</span>}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>{HSN_CODE}</td>
                          <td style={{ padding: '6px', textAlign: 'center', fontWeight: 700 }}>{qty}</td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>₹{(itemTaxable / qty).toFixed(2)}</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600 }}>₹{itemTaxable.toFixed(2)}</td>
                          {isIntraState ? (
                            <>
                              <td style={{ padding: '6px', textAlign: 'right' }}>{Number(item.gstRate || 0) / 2}%<br/>₹{(itemTax / 2).toFixed(2)}</td>
                              <td style={{ padding: '6px', textAlign: 'right' }}>{Number(item.gstRate || 0) / 2}%<br/>₹{(itemTax / 2).toFixed(2)}</td>
                            </>
                          ) : (
                            <td style={{ padding: '6px', textAlign: 'right' }}>{Number(item.gstRate || 0)}%<br/>₹{itemTax.toFixed(2)}</td>
                          )}
                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>₹{(itemTaxable + itemTax).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={isIntraState ? 9 : 8} style={{ padding: 12, textAlign: 'center' }}>No items found</td></tr>
                  )}
                </tbody>
              </table>

              {/* Summary */}
              <div style={{ display: 'flex', borderTop: '1.5px solid #222', borderBottom: '1.5px solid #222' }}>
                <div style={{ flex: 1.2, padding: '12px 14px', borderRight: '1.5px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>Amount in Words:</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0b1f44', fontStyle: 'italic', marginTop: 2 }}>{numToWordsINR(total)}</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 8 }}>
                    <strong>Payment:</strong> Razorpay &nbsp;|&nbsp; <strong>Status:</strong> {order.payment_status || 'PAID'} &nbsp;|&nbsp; <strong>Txn ID:</strong> {order.payment_id || '—'}
                  </div>
                </div>

                <div style={{ flex: 0.9, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                    <span style={{ color: '#555' }}>Taxable Subtotal:</span>
                    <strong>₹{subtotal.toFixed(2)}</strong>
                  </div>
                  {isIntraState ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                        <span style={{ color: '#555' }}>CGST:</span>
                        <span>+₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                        <span style={{ color: '#555' }}>SGST:</span>
                        <span>+₹{sgstAmount.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                      <span style={{ color: '#555' }}>IGST:</span>
                      <span>+₹{igstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                    <span style={{ color: '#555' }}>Delivery:</span>
                    <span>{deliveryCharge > 0 ? `+₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11, color: '#2e7d32' }}>
                      <span>Discount ({order.coupon_code || 'Coupon'}):</span>
                      <span>−₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #222', marginTop: 4, paddingTop: 6, fontSize: 13, fontWeight: 800, color: '#0b1f44' }}>
                    <span>Grand Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', padding: '10px 14px', background: '#fafafa', fontSize: 10, color: '#444' }}>
                <div style={{ flex: 1.2, paddingRight: 12, borderRight: '1px solid #ddd' }}>
                  <strong>Terms & Conditions:</strong>
                  <div>1. Video of parcel opening is mandatory for return/exchange claims.</div>
                  <div>2. This is a computer generated tax invoice.</div>
                </div>
                <div style={{ flex: 0.9, paddingLeft: 12, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700 }}>For {STORE.name}</div>
                  <div style={{ fontWeight: 700, color: '#0b1f44', borderTop: '1px solid #888', paddingTop: 2, display: 'inline-block' }}>Authorized Signatory</div>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button
                onClick={handlePrint}
                style={{
                  flex: 1, padding: '11px 0',
                  background: '#0b1f44', color: '#fff',
                  border: 'none', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                🖨️ Print / Save PDF Invoice
              </button>
              <button
                onClick={handleDownloadExcel}
                style={{
                  flex: 1, padding: '11px 0',
                  background: '#1d6f42', color: '#fff',
                  border: 'none', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                📊 Download Excel Invoice
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 10 }}>
              Print → Select "Save as PDF" destination to download standard A4 PDF invoice
            </p>
          </div>
        </div>
      )}
    </>
  );
}
