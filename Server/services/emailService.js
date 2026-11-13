const nodemailer = require('nodemailer');

const emailPort = Number(process.env.EMAIL_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: emailPort,
  secure: emailPort === 465,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  pool: true,
  maxConnections: 1,
  maxMessages: 1000,
  rateDelta: 1000,
  rateLimit: 1,
});
const deliverEmail = async message => {
  return transporter.sendMail(message);
};

const B = {
  navy: '#1A1040',
  gold: '#C9933A',
  ivory: '#F8F6F2',
  border: '#E7DFD2',
  text: '#4A4A4A',
  muted: '#77736D',
  white: '#FFFFFF',
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const money = value => `₹${Number(value || 0).toFixed(2)}`;
const orderNumber = order => String(order.order_number || order.orderId || order.id || '—').replace(/^EMT-/, 'VV-');

const emailLayout = ({ preheader = '', title, greeting, content, footer = 'Thank you for shopping with Vika Vasthra.' }) => `
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${B.ivory};margin:0;padding:24px 10px;font-family:Arial,Helvetica,sans-serif;color:${B.text}">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${B.white};border:1px solid ${B.border};border-radius:12px;overflow:hidden">
        <tr><td style="background:${B.navy};padding:24px 30px;text-align:left">
          <div style="font-size:22px;line-height:1.2;font-weight:700;letter-spacing:1px;color:${B.white}">VIKA VASTHRA</div>
          <div style="margin-top:5px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#E8D8B8">Where tradition meets elegance</div>
        </td></tr>
        <tr><td style="height:4px;background:${B.gold};font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:30px 32px 34px">
          <h1 style="margin:0 0 18px;color:${B.navy};font-size:23px;line-height:1.3">${title}</h1>
          ${greeting ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.65">Hi ${greeting},</p>` : ''}
          ${content}
        </td></tr>
        <tr><td style="background:${B.ivory};border-top:1px solid ${B.border};padding:18px 30px;text-align:center;color:${B.muted};font-size:12px;line-height:1.6">
          ${footer}<br><span style="color:${B.navy};font-weight:700">Vika Vasthra</span>
        </td></tr>
      </table>
    </td></tr>
  </table>`;

const detailsTable = rows => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:20px 0">${rows.map(([label, value, strong]) => `
  <tr><td style="padding:10px 0;border-bottom:1px solid ${B.border};font-size:14px;color:${B.muted}">${label}</td>
  <td align="right" style="padding:10px 0;border-bottom:1px solid ${B.border};font-size:14px;color:${strong ? B.navy : B.text};font-weight:${strong ? 700 : 400}">${value}</td></tr>`).join('')}</table>`;

const offerHtml = (offer) => {
  const title = escapeHtml(offer.title || offer.name || offer.code || 'A new offer is here');
  const discount = offer.discountLabel || (offer.code
    ? `${offer.type === 'percent' ? `${offer.value}%` : `Rs. ${offer.value}`} off with code ${offer.code}`
    : offer.discountType === 'percentage' ? `${offer.discountValue}% off`
      : offer.discountType === 'flat' ? `Rs. ${offer.discountValue} off` : 'Shop now and explore the offer.');
  const message = offer.emailContent || offer.content || offer.description || `${offer.name || title} is now available. ${discount}`;
  const link = offer.shopUrl || offer.link || process.env.STORE_URL || 'https://vikavasthra.com';
  const content = `<p style="margin:0 0 12px;color:${B.gold};font-size:16px;font-weight:700">${escapeHtml(discount)}</p><p style="margin:0 0 20px;font-size:14px;line-height:1.7">${String(message).split(/\r?\n/).map(escapeHtml).join('<br>')}</p>${offer.code ? `<p style="padding:12px;background:${B.ivory};border:1px dashed ${B.gold};color:${B.navy};font-weight:700">Coupon code: ${escapeHtml(offer.code)}</p>` : ''}<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:${B.gold};color:${B.white};padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:700">Shop now</a></p>${offer.endDate || offer.expires_at ? `<p style="color:${B.muted};font-size:12px">Valid until ${escapeHtml(offer.endDate || offer.expires_at)}</p>` : ''}`;
  return emailLayout({ preheader: discount, title, content });
};

exports.sendOfferEmail = async (offer, recipients = [], { batchSize = 100 } = {}) => {
  const emails = [...new Set(recipients.map(email => String(email || '').trim().toLowerCase()).filter(Boolean))];
  if (!emails.length) return { sent: 0, failed: 0 };
  const title = offer.title || offer.name || offer.code || 'New offer';
  const html = offerHtml(offer);
  let sent = 0;
  let failed = 0;
  let deferred = 0;
  const errors = [];
  const safeBatchSize = Math.max(1, Math.min(100, Number(batchSize) || 100));
  for (let index = 0; index < emails.length; index += 1) {
    try {
      await deliverEmail({
        from: `"Vika Vasthra" <${process.env.EMAIL_USER}>`, to: emails[index],
        subject: offer.emailSubject || `${title} - Vika Vasthra`, html,
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      const code = error?.code ? `${error.code}: ` : '';
      errors.push(`${code}${error?.message || 'Mail server rejected the message.'}`);
      if (error?.code === 'EAUTH') {
        // Stop on authentication failures instead of retrying login for every recipient.
        deferred = emails.length - index - 1;
        break;
      }
    }
    if ((index + 1) % safeBatchSize === 0 && index + 1 < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  return { sent, failed, deferred, errors: [...new Set(errors)].slice(0, 3) };
};

exports.sendAdminOrderNotification = async (order, items = []) => {
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!to) return;
  const number = escapeHtml(orderNumber(order));
  const content = `<p style="font-size:14px;line-height:1.7">A new order has been placed by <strong>${escapeHtml(order.customer_name || 'Customer')}</strong>.</p>${detailsTable([
    ['Order number', number], ['Customer email', escapeHtml(order.customer_email || '—')],
    ['Items', String(items.length)], ['Order total', money(order.total), true],
  ])}`;
  await deliverEmail({
    from: `"Vika Vasthra" <${process.env.EMAIL_USER}>`, to,
    subject: `New Order #${orderNumber(order)} - Vika Vasthra`,
    text: `New order from ${order.customer_name}. Total: Rs. ${order.total}. Items: ${items.length}`,
    html: emailLayout({ preheader: `New order ${number}`, title: 'New order received', content }),
  });
};

exports.sendOrderConfirmationEmail = async (data) => {
  if (!data.email) return;
  const number = escapeHtml(orderNumber(data));
  const items = Array.isArray(data.items) ? data.items : [];
  const itemRows = items.map(item => `<tr>
    <td style="padding:12px 0;border-bottom:1px solid ${B.border};font-size:14px;color:${B.text}">${escapeHtml(item.name || item.productName || 'Item')}${item.weight ? ` <span style="color:${B.muted}">(${escapeHtml(item.weight)})</span>` : item.variantAttributes ? ` <span style="color:${B.muted}">(${escapeHtml(Object.entries(item.variantAttributes).map(([key, value]) => `${key}: ${value}`).join(', '))})</span>` : ''}</td>
    <td align="center" style="padding:12px 4px;border-bottom:1px solid ${B.border};font-size:13px;color:${B.muted};white-space:nowrap">× ${Number(item.quantity || 1)}</td>
    <td align="right" style="padding:12px 0;border-bottom:1px solid ${B.border};font-size:14px;color:${B.gold};font-weight:700;white-space:nowrap">${money(Number(item.price || 0) * Number(item.quantity || 1))}</td>
  </tr>`).join('');
  const address = typeof data.billingAddress === 'string'
    ? (() => { try { return JSON.parse(data.billingAddress); } catch { return {}; } })()
    : (data.billingAddress || {});
  const addressLines = [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.company,
    [address.address1, address.address2].filter(Boolean).join(', '),
    address.landmark,
    [address.city, address.state].filter(Boolean).join(', '),
    address.postcode ? `PIN: ${address.postcode}` : null,
  ].filter(Boolean).map(line => `<div style="margin:3px 0">${escapeHtml(line)}</div>`).join('');
  const customerEmail = escapeHtml(data.email);
  const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const sectionTitle = title => `<div style="margin:24px 0 12px;padding-left:9px;border-left:3px solid ${B.gold};font-size:12px;font-weight:700;letter-spacing:1px;color:${B.navy}">${title}</div>`;
  const itemTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
    <tr><td style="padding:9px 0;color:${B.muted};font-size:11px;font-weight:700;letter-spacing:.7px">PRODUCT</td><td align="center" style="padding:9px 4px;color:${B.muted};font-size:11px;font-weight:700">QTY</td><td align="right" style="padding:9px 0;color:${B.muted};font-size:11px;font-weight:700">PRICE</td></tr>${itemRows}</table>`;
  const totals = [
    ['Subtotal', money(data.subtotal)],
    ...(Number(data.tax) > 0 ? [['GST', `+${money(data.tax)}`]] : []),
    ['Delivery', Number(data.delivery_charge) > 0 ? money(data.delivery_charge) : 'Free'],
    ...(Number(data.discount) > 0 ? [[`Discount${data.coupon ? ` (${escapeHtml(data.coupon)})` : ''}`, `−${money(data.discount)}`]] : []),
    ['Total Paid', money(data.total), true],
  ];
  const totalsTable = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;background:${B.ivory};border:1px solid ${B.border};border-radius:8px;padding:9px 12px;border-collapse:separate">${totals.map(([label, value, strong]) => `<tr><td style="padding:4px 0;border-bottom:${strong ? 'none' : `1px solid ${B.border}`};font-size:${strong ? '12px' : '11px'};font-weight:${strong ? 700 : 400};color:${strong ? B.navy : B.muted}">${label}</td><td align="right" style="padding:4px 0;border-bottom:${strong ? 'none' : `1px solid ${B.border}`};font-size:${strong ? '14px' : '11px'};font-weight:${strong ? 700 : 400};color:${strong ? B.gold : B.navy}">${value}</td></tr>`).join('')}</table>`;
  const paymentCards = [
    ['Payment ID', data.paymentId || '—'], ['Order ID', number],
    ['Order Date', orderDate], ['Amount Paid', money(data.total)],
  ].map(([label, value]) => `<td width="50%" style="padding:5px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${B.ivory};border:1px solid ${B.border};border-radius:7px"><tr><td style="padding:10px"><div style="font-size:9px;color:${B.muted}">${label}</div><div style="margin-top:5px;font-size:11px;font-weight:700;color:${B.gold};word-break:break-word">${escapeHtml(value)}</div></td></tr></table></td>`);
  const content = `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:${B.text}">Thank you, <strong>${escapeHtml(data.name || 'Customer')}</strong>! Your payment was successful and your order is being processed. A confirmation copy has been sent to <a href="mailto:${customerEmail}" style="color:${B.gold}">${customerEmail}</a>.</p>
    ${sectionTitle('ITEMS ORDERED')}${itemTable}${totalsTable}
    ${sectionTitle('PAYMENT DETAILS')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${paymentCards.slice(0, 2).join('')}</tr><tr>${paymentCards.slice(2).join('')}</tr></table>
    ${addressLines ? `${sectionTitle('BILLING ADDRESS')}<div style="padding:11px;background:${B.ivory};border:1px solid ${B.border};border-radius:7px;font-size:10px;line-height:1.55;color:${B.text}">${addressLines}${data.phone ? `<div style="margin-top:5px">☎ ${escapeHtml(data.phone)}</div>` : ''}${data.phone2 ? `<div>☎ ${escapeHtml(data.phone2)} <span style="color:${B.gold}">(Alt)</span></div>` : ''}<div><a href="mailto:${customerEmail}" style="color:${B.navy}">${customerEmail}</a></div></div>` : ''}
    <p style="margin:18px 0 0;text-align:center;font-size:10px;color:${B.muted}">Questions? Contact us at <a href="mailto:${escapeHtml(process.env.EMAIL_USER || 'vikram.25feb@gmail.com')}" style="color:${B.gold}">${escapeHtml(process.env.EMAIL_USER || 'vikram.25feb@gmail.com')}</a></p>`;
  await deliverEmail({
    from: `"Vika Vasthra" <${process.env.EMAIL_USER}>`, to: data.email,
    subject: `We Received Your Order - Vika Vasthra`,
    text: `Hi ${data.name || 'Customer'}, we received your order ${orderNumber(data)}. Total: Rs. ${data.total}.`,
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${B.ivory};padding:20px 12px;font-family:Arial,Helvetica,sans-serif"><tr><td align="center"><table role="presentation" width="375" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:${B.white};border:1px solid ${B.border};border-radius:12px;overflow:hidden"><tr><td style="background:${B.navy};padding:28px 32px;text-align:center"><div style="margin:0 auto 9px;width:23px;height:23px;line-height:23px;border-radius:7px;background:${B.gold};color:${B.white};font-weight:700;font-size:12px">V</div><div style="color:${B.white};font-size:12px;font-weight:700">Vika Vasthra</div><h1 style="margin:15px 0 6px;color:${B.white};font-size:17px">Order Confirmed! 🎉</h1><div style="font-size:14px;line-height:1.6;color:#E9E4F3">Thank you, ${escapeHtml(data.name || 'Customer')}! Your payment was successful and your order is being processed.<br>A confirmation copy has been sent to <a href="mailto:${customerEmail}" style="color:#D9B86C">${customerEmail}</a>.</div></td></tr><tr><td style="padding:4px 32px 28px">${content}</td></tr><tr><td style="background:${B.navy};padding:13px 15px;text-align:center;color:#E9E4F3;font-size:12px;line-height:1.7"><strong style="color:${B.white}">V&nbsp; Vika Vasthra</strong><br>© ${new Date().getFullYear()} Vika Vasthra. All rights reserved.<br>Thank you for shopping with us!</td></tr></table></td></tr></table>`,
  });
};

exports.sendOrderStatusEmail = async (order, status) => {
  if (!order.customer_email) return;
  const labels = {
    processing: ['We Received Your Order', 'Your order has been received and will be reviewed shortly.'],
    confirmed: ['Order Confirmed', 'Your order is confirmed and being prepared for shipment.'],
    shipped: ['Order Shipped', 'Your order is on its way.'],
    in_transit: ['Order In Transit', 'Your order is moving through the delivery network.'],
    out_for_delivery: ['Out for Delivery', 'Your order is out for delivery.'],
    delivered: ['Order Delivered', 'Your order has been delivered.'],
    cancelled: ['Order Cancelled', 'Your order has been cancelled.'],
    refunded: ['Refund Processed', 'Your refund has been processed.'],
    return_requested: ['Return Requested', 'We received your return request.'],
    return_approved: ['Return Approved', 'Your return was approved.'],
    return_picked_up: ['Return Picked Up', 'Your return item was picked up.'],
    return_received: ['Return Received', 'We received your return item.'],
  };
  const message = labels[status];
  if (!message) return;
  const number = escapeHtml(orderNumber(order));
  const content = `<p style="margin:0 0 18px;font-size:14px;line-height:1.7">${escapeHtml(message[1])}</p>${detailsTable([['Order number', number], ['Order total', money(order.total), true]])}`;
  await deliverEmail({
    from: `"Vika Vasthra" <${process.env.EMAIL_USER}>`, to: order.customer_email,
    subject: `${message[0]} - Vika Vasthra`,
    text: `Hi ${order.customer_name || 'Customer'}, ${message[1]} Order: ${orderNumber(order)}.`,
    html: emailLayout({ preheader: `${message[1]} Order ${number}`, title: message[0], greeting: escapeHtml(order.customer_name || 'Customer'), content }),
  });
};

const courierTrackers = {
  'india post': { name: 'India Post', url: 'https://www.indiapost.gov.in/#trackandtrace' },
  'professional courier': { name: 'Professional Couriers', url: 'https://www.tpcindia.com/' },
  'dtdc': { name: 'DTDC', url: 'https://www.dtdc.com/track-your-shipment/' },
  'st couriers': { name: 'ST Courier', url: 'https://www.stcourier.com/track/shipment' },
};

exports.sendShipmentTrackingEmail = async (order, courierName, trackingNumber) => {
  if (!order.customer_email) throw new Error('Customer email is missing');
  const tracker = courierTrackers[String(courierName || '').trim().toLowerCase()];
  if (!tracker) throw new Error('Unsupported courier');

  const number = orderNumber(order);
  // DTDC's official tracking page accepts an AWB query parameter. Other carriers
  // require entering the tracking ID in their official tracking form.
  const trackingUrl = String(courierName || '').trim().toLowerCase() === 'dtdc'
    ? `https://www.dtdc.com/track-your-shipment/?awb=${encodeURIComponent(trackingNumber)}`
    : tracker.url;
  const content = `<p style="margin:0 0 18px;font-size:14px;line-height:1.7">Your order is on its way. Use the tracking details below to follow its progress.</p>
    ${detailsTable([['Order number', escapeHtml(number)], ['Courier', escapeHtml(tracker.name)], ['Tracking ID', escapeHtml(trackingNumber), true]])}
    <p style="margin:24px 0"><a href="${escapeHtml(trackingUrl)}" style="display:inline-block;background:${B.gold};color:${B.white};padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:700">Track your shipment</a></p>
    <p style="font-size:13px;line-height:1.7;color:${B.muted}">Enter the tracking ID shown above in the courier's tracking form. The order number is not a courier tracking ID. If the carrier page shows an error or is blocked, try again later or open the courier's official website and choose Track Shipment.</p>`;

  await deliverEmail({
    from: `"Vika Vasthra" <${process.env.EMAIL_USER}>`, to: order.customer_email,
    subject: `Your order ${number} has shipped - Vika Vasthra`,
    text: `Hi ${order.customer_name || 'Customer'},\n\nYour order ${number} has been shipped with ${tracker.name}.\nTracking ID: ${trackingNumber}\nTrack your shipment: ${trackingUrl}\n\nIf the tracking page does not fill the number automatically, enter the tracking ID above on the courier's official tracking page.`,
    html: emailLayout({ preheader: `Your order ${number} is on its way. Tracking ID: ${trackingNumber}`, title: 'Your order is on its way', greeting: escapeHtml(order.customer_name || 'Customer'), content }),
  });
};
