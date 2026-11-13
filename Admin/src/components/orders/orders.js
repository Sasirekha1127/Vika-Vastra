import { useState, useEffect, useCallback } from 'react';
import DataTable from '../DataTable/DataTable';
import ShippingLabel, { printShippingLabels } from '../ShippingLabel/ShippingLabel';
import Invoice from '../Invoice/Invoice';
import ImageModal from '../ImageModal/ImageModal';
import { formatVariantLabel } from '../../utils/variantDisplay';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STATUS_OPTIONS = [
  'processing', 'confirmed', 'shipped',
  'out_for_delivery', 'delivered'
  // 'cancelled' - REMOVED
];
const COURIER_OPTIONS = ['India Post', 'Professional Courier', 'DTDC', 'ST Couriers'];
const labelFor = s => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const parseAddr = (raw) => { try { return JSON.parse(raw); } catch { return null; } };

const resolveImageSrc = (img) => {
  if (!img) return null;
  if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) return img;
  const base = (API || '').replace(/\/$/, '');
  const clean = img.replace(/\\/g, '/').replace(/^\/?(api\/)?/, '');
  return `${base}/${clean}`;
};

// Splits a raw order_notes string like "Hello Delivery State: Tamil Nadu"
// into the actual customer note ("Hello") and the delivery state ("Tamil Nadu"),
// so they can be shown as two separate blocks instead of one merged string.
const parseNotes = (raw) => {
  if (!raw) return { note: null, deliveryState: null };

  const match = raw.match(/Delivery State:\s*(.+)$/i);
  if (!match) return { note: raw.trim() || null, deliveryState: null };

  const deliveryState = match[1].trim();
  const note = raw.replace(/Delivery State:\s*.+$/i, '').trim();

  return { note: note || null, deliveryState: deliveryState || null };
};

const AddressBlock = ({ addr, phone, phone2, email }) => {
  if (!addr) return <p className="td-muted">Not provided</p>;

  return (
    <div className="km-billing-info">
      <div>
        <strong>{addr.firstName} {addr.lastName}</strong>
      </div>

      {addr.company && (
        <div className="td-muted">{addr.company}</div>
      )}

      <div>{addr.address1}</div>

      {addr.address2 && <div>{addr.address2}</div>}

      {/* ── Landmark ── */}
      {addr.landmark && (
        <div style={{ color: '#555' }}>
          📍 {addr.landmark}
        </div>
      )}

      {/* ── Post Office · District on one line if both present ── */}
      {(addr.postOffice || addr.district) && (
        <div className="td-muted">
          {[
            addr.postOffice && `P.O: ${addr.postOffice}`,
            addr.district   && `Dist: ${addr.district}`,
          ].filter(Boolean).join('  ·  ')}
        </div>
      )}

      <div>
        {addr.city}{addr.state ? `, ${addr.state}` : ''}
      </div>

      {addr.postcode && <div>PIN: {addr.postcode}</div>}

      <div>📞 {addr.phone || phone}</div>

      {(addr.phone2 || phone2) && (
        <div>📞 {addr.phone2 || phone2}{' '}
          <span style={{
            fontSize: 10, fontWeight: 600, background: '#fff3e0',
            color: '#e65100', padding: '1px 6px', borderRadius: 10, marginLeft: 4,
          }}>Alt</span>
        </div>
      )}

      {email && <div>✉️ {addr.email || email}</div>}
    </div>
  );
};

export default function Orders({ showToast, status = null }) {
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [zoomImage,   setZoomImage]   = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [shipmentInputs, setShipmentInputs] = useState({});
  const [sendingTrackingIds, setSendingTrackingIds] = useState(new Set());

  const fetchOrders = useCallback((currentStatus) => {
    setLoading(true);
    fetch(`${API}/orders/all`)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data.orders) ? data.orders : [];
        const mapped = all.map(o => ({
          ...o,
          total_quantity: (o.OrderItems || []).reduce(
            (sum, it) => sum + (Number(it.quantity) || 0),
            0
          ),
        }));
        const filtered = currentStatus === 'processing'
          ? mapped.filter(o => ['processing', 'pending'].includes(String(o.status || '').toLowerCase()))
          : currentStatus
          ? mapped.filter(o => String(o.status || '').toLowerCase() === currentStatus)
          : mapped.filter(o => o.status !== 'cancelled');
        setRows(filtered);
      })
      .catch(() => showToast('Load Failed', 'Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setExpanded(null);
    setSelectedOrderIds([]);
    fetchOrders(status);
  }, [status]);

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds(current => {
      if (current.includes(orderId)) return current.filter(id => id !== orderId);
      if (current.length >= 6) {
        showToast('Selection Limit', 'Select up to six orders per page.');
        return current;
      }
      return [...current, orderId];
    });
  };

  const printSelectedLabels = () => {
    const selected = rows
      .filter(order => selectedOrderIds.includes(order.id))
      .map(order => ({ order, displayOrderId: (order.order_number ? String(order.order_number).replace(/^EMT-/, 'VV-') : `#${order.id}`) }));
    if (selected.length) printShippingLabels(selected);
  };

  const updateStatus = async (id, newStatus, prevStatus) => {
    setRows(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setUpdatingIds(prev => new Set(prev).add(id));

    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setRows(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
        showToast('Update Failed', 'Could not update order status.');
        return;
      }

      if (status && newStatus !== status) {
        setRows(prev => prev.filter(o => o.id !== id));
      }

      if (newStatus === 'cancelled') {
        setRows(prev => prev.filter(o => o.id !== id));
        showToast('Order Cancelled', 'Order has been cancelled and removed from view.');
      } else {
        showToast('Order Updated!', 'Order status changed successfully.');
      }
    } catch {
      setRows(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
      showToast('Server Error', 'Something went wrong. Try again.');
    } finally {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const updateShipmentInput = (orderId, field, value) => {
    setShipmentInputs(current => ({
      ...current,
      [orderId]: { courierName: 'India Post', ...(current[orderId] || {}), [field]: value },
    }));
  };

  const sendShipmentTracking = async (order) => {
    const values = { courierName: 'India Post', ...(shipmentInputs[order.id] || {}) };
    if (!values.trackingNumber?.trim()) {
      showToast('Tracking ID Required', 'Enter the courier tracking ID before sending.');
      return;
    }

    setSendingTrackingIds(current => new Set(current).add(order.id));
    try {
      const response = await fetch(`${API}/orders/${order.id}/shipping-tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courierName: values.courierName, trackingNumber: values.trackingNumber.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not send tracking email.');

      setRows(current => current.map(item => item.id === order.id
        ? { ...item, courier_name: result.order.courier_name, awb_code: result.order.awb_code }
        : item));
      setShipmentInputs(current => ({ ...current, [order.id]: { ...values, trackingNumber: result.order.awb_code } }));
      showToast('Tracking Email Sent', `Tracking details sent to ${order.customer_email}.`);
    } catch (error) {
      showToast('Tracking Email Failed', error.message || 'Could not send tracking email.');
    } finally {
      setSendingTrackingIds(current => { const next = new Set(current); next.delete(order.id); return next; });
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          {status === 'processing' ? 'New Orders' : status ? `${labelFor(status)} Orders` : 'All Orders'}
        </div>
        {!loading && <span className="km-count-badge">{rows.length}</span>}
      </div>

      {loading ? (
        <p className="km-loading">Loading orders...</p>
      ) : rows.length === 0 ? (
        <p className="km-empty">No orders found.</p>
      ) : (
        <>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#666' }}>{selectedOrderIds.length}/6 orders selected</span>
          <button
            type="button"
            onClick={printSelectedLabels}
            disabled={!selectedOrderIds.length}
            style={{ padding: '9px 16px', border: 0, borderRadius: 6, background: selectedOrderIds.length ? '#720E1E' : '#aaa', color: '#fff', fontWeight: 700, cursor: selectedOrderIds.length ? 'pointer' : 'not-allowed' }}
          >
            Print Labels ({selectedOrderIds.length})
          </button>
        </div>
        <DataTable
          columns={['Select', 'Order ID', 'Customer', 'Items', 'Quantity', 'Total', 'Coupon', 'Status', 'Date', 'Details']}
          initialRows={rows}
          renderRow={(order) => {
            const billing      = parseAddr(order.billing_address);
            const shipping     = parseAddr(order.shipping_address);
            const isOpen       = expanded === order.id;
            const shippingAddr = shipping || billing;
            const sameAddress  = !shipping ||
              JSON.stringify(shipping) === JSON.stringify(billing);
            const isSaving     = updatingIds.has(order.id);
            const shipmentValues = { courierName: 'India Post', ...(shipmentInputs[order.id] || {}) };
            const isSendingTracking = sendingTrackingIds.has(order.id);

            const subtotal       = Number(order.subtotal        || 0);
            const tax            = Number(order.tax             || 0);
            const deliveryCharge = Number(order.delivery_charge || 0);
            const discount       = Number(order.discount        || 0);
            const total          = Number(order.total           || 0);
            const totalQuantity  = order.total_quantity ?? (order.OrderItems || []).reduce(
              (sum, it) => sum + (Number(it.quantity) || 0),
              0
            );

            const displayOrderId = order.order_number ? String(order.order_number).replace(/^EMT-/, 'VV-') : `#${order.id}`;
            const { note, deliveryState } = parseNotes(order.order_notes);

            return (
              <>
                <tr key={order.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select order ${displayOrderId} for label printing`}
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                    />
                  </td>
                  <td className="td-id">{displayOrderId}</td>

                  <td>
                    <div className="td-name">{order.customer_name}</div>
                    <div className="td-sub">{order.customer_email}</div>
                    <div className="td-sub">📞 {order.customer_phone}</div>
                    {order.customer_phone2 && (
                      <div className="td-sub">📞 {order.customer_phone2}{' '}
                        <span style={{
                          fontSize: 10, fontWeight: 600, background: '#fff3e0',
                          color: '#e65100', padding: '1px 5px', borderRadius: 10,
                        }}>Alt</span>
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {order.OrderItems?.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                          {order.OrderItems.slice(0, 3).map((it, idx) => {
                            const src = resolveImageSrc(it.image || it.Product?.image);
                            return src ? (
                              <img
                                key={idx}
                                src={src}
                                alt={it.name || ''}
                                title={`${it.name || 'Product'}${formatVariantLabel(it) ? ` · ${formatVariantLabel(it)}` : ''}`}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 6,
                                  objectFit: 'cover',
                                  border: '1.5px solid #fff',
                                  marginLeft: idx > 0 ? -8 : 0,
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                  background: '#fff',
                                  cursor: 'pointer',
                                  transition: 'transform 0.15s ease',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomImage({
                                    src: src,
                                    title: it.name || 'Product Image',
                                    subtitle: `Qty: ${it.quantity} · Price: ₹${(Number(it.price || 0) * (it.quantity || 1)).toFixed(2)}`,
                                    details: it.weight ? `Variant / Weight: ${it.weight}` : null
                                  });
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.15)';
                                  e.currentTarget.style.zIndex = '10';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.zIndex = '1';
                                }}
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                      <span className="km-count-badge">
                        {order.OrderItems?.length || 0} items
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="km-unit-badge" style={{ fontWeight: 700, minWidth: 28, textAlign: 'center', display: 'inline-block' }}>
                      {totalQuantity}
                    </span>
                  </td>

                  <td className="td-price">₹{total.toFixed(2)}</td>

                  <td>
                    {order.coupon_code
                      ? <span className="status-pill pill-approved">{order.coupon_code}</span>
                      : <span className="td-muted">—</span>}
                  </td>

                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        className={`km-status-select km-status-${order.status}`}
                        value={order.status}
                        disabled={isSaving}
                        onChange={e => updateStatus(order.id, e.target.value, order.status)}
                        style={{ opacity: isSaving ? 0.6 : 1 }}
                      >
                        {STATUS_OPTIONS.map(st => (
                          <option key={st} value={st}>{labelFor(st)}</option>
                        ))}
                      </select>
                      {isSaving && (
                        <span style={{
                          position: 'absolute', right: -22, top: '50%',
                          transform: 'translateY(-50%)',
                          width: 14, height: 14,
                          border: '2px solid #ddd',
                          borderTop: '2px solid #720E1E',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                      )}
                    </div>
                    <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
                  </td>

                  <td className="td-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        className="action-btn btn-edit"
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                      >
                        {isOpen ? '▲ Hide' : '▼ View'}
                      </button>
                      <ShippingLabel order={order} displayOrderId={displayOrderId} />
                      <Invoice order={order} displayOrderId={displayOrderId} />
                    </div>
                  </td>
                </tr>

                {isOpen && (
                  <tr key={`${order.id}-detail`}>
                    <td colSpan={10} className="km-order-detail-cell">
                      <div className="km-form-card">
                        <div className="km-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="km-form-header-icon">📦</div>
                            <div>
                              <div className="km-form-header-title">
                                Order {displayOrderId} — {order.customer_name}
                              </div>
                              <div className="km-form-header-sub">
                                Payment ID: {order.payment_id || '—'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <ShippingLabel order={order} displayOrderId={displayOrderId} />
                            <Invoice order={order} displayOrderId={displayOrderId} />
                          </div>
                        </div>

                        {status === 'shipped' && (
                          <div style={{ margin: '16px 0', padding: 16, border: '1px solid #e7dfd2', borderRadius: 8, background: '#fffdf8' }}>
                            <div style={{ fontWeight: 700, color: '#720E1E', marginBottom: 10 }}>Send shipment tracking email</div>
                            {(order.courier_name || order.awb_code) && (
                              <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                                Saved tracking: {order.courier_name || 'Courier not set'} · {order.awb_code || 'ID not set'}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                              <select
                                aria-label={`Courier for order ${displayOrderId}`}
                                value={shipmentValues.courierName}
                                onChange={e => updateShipmentInput(order.id, 'courierName', e.target.value)}
                                style={{ minWidth: 190, padding: '10px 12px', border: '1px solid #d8d2c8', borderRadius: 6, background: '#fff' }}
                              >
                                {COURIER_OPTIONS.map(courier => <option key={courier} value={courier}>{courier}</option>)}
                              </select>
                              <input
                                type="text"
                                aria-label={`Shipping tracking ID for order ${displayOrderId}`}
                                placeholder="Shipping / AWB tracking ID"
                                value={shipmentValues.trackingNumber || ''}
                                onChange={e => updateShipmentInput(order.id, 'trackingNumber', e.target.value)}
                                style={{ flex: '1 1 240px', padding: '10px 12px', border: '1px solid #d8d2c8', borderRadius: 6 }}
                              />
                              <button
                                type="button"
                                onClick={() => sendShipmentTracking(order)}
                                disabled={isSendingTracking || !shipmentValues.trackingNumber?.trim()}
                                style={{ padding: '10px 18px', border: 0, borderRadius: 6, background: isSendingTracking || !shipmentValues.trackingNumber?.trim() ? '#aaa' : '#720E1E', color: '#fff', fontWeight: 700, cursor: isSendingTracking || !shipmentValues.trackingNumber?.trim() ? 'not-allowed' : 'pointer' }}
                              >
                                {isSendingTracking ? 'Sending…' : 'Send'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="km-order-detail-grid km-order-detail-grid-four">

                          {/* ── Items Ordered ── */}
                          <div>
                            <div className="km-detail-section-title">Items Ordered ({totalQuantity} Total Qty)</div>
                            {order.OrderItems?.length > 0
                              ? order.OrderItems.map((item, i) => {
                                  const itemImg = resolveImageSrc(item.image || item.Product?.image);
                                  const variantLabel = formatVariantLabel(item);
                                  return (
                                    <div
                                      key={i}
                                      className="km-order-item-row"
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: '8px 0',
                                        borderBottom: '1px solid #f0f0f0',
                                      }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0, flex: 1 }}>
                                        {itemImg ? (
                                          <img
                                            src={itemImg}
                                            alt={item.name || 'Product'}
                                            title="Click to zoom image"
                                            style={{
                                              width: 44,
                                              height: 44,
                                              objectFit: 'cover',
                                              borderRadius: 6,
                                              border: '1.5px solid #e5e7eb',
                                              flexShrink: 0,
                                              background: '#fff',
                                              cursor: 'pointer',
                                              transition: 'all 0.15s ease-in-out',
                                            }}
                                            onClick={() => setZoomImage({
                                              src: itemImg,
                                              title: item.name || 'Product Image',
                                              subtitle: `Qty: ${item.quantity} · Price: ₹${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}`,
                                              details: variantLabel ? `Variant: ${variantLabel}` : null
                                            })}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.transform = 'scale(1.1)';
                                              e.currentTarget.style.borderColor = '#00b894';
                                              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.transform = 'scale(1)';
                                              e.currentTarget.style.borderColor = '#e5e7eb';
                                              e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.style.display = 'none';
                                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div
                                          style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 6,
                                            background: '#f3f4f6',
                                            border: '1px solid #e5e7eb',
                                            display: itemImg ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 18,
                                            flexShrink: 0,
                                            color: '#9ca3af',
                                          }}
                                        >
                                          📦
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                          <div style={{ fontWeight: 600, color: '#1A1A2E', lineHeight: 1.3, fontSize: 13 }}>
                                            {item.name}
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginTop: 4, minWidth: 0 }}>
                                            {variantLabel && (
                                              <span style={{
                                                fontSize: 10, fontWeight: 700,
                                                background: '#e8f0ff', color: '#720E1E',
                                                padding: '1px 6px', borderRadius: 10,
                                                whiteSpace: 'normal',
                                                overflowWrap: 'anywhere',
                                                maxWidth: '100%',
                                                lineHeight: 1.35,
                                              }}>
                                                {variantLabel}
                                              </span>
                                            )}
                                            <span className="td-muted" style={{ fontSize: 11, lineHeight: 1.3 }}>
                                              Qty: {item.quantity}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <span className="td-price-sm" style={{ fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, paddingTop: 1 }}>
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  );
                                })
                              : <p className="td-muted">No items found</p>}
                          </div>

                          {/* ── Billing Address ── */}
                          <div>
                            <div className="km-detail-section-title">Billing Address</div>
                            <AddressBlock
                              addr={billing}
                              phone={order.customer_phone}
                              phone2={order.customer_phone2}
                              email={order.customer_email}
                            />
                          </div>

                          {/* ── Shipping Address ── */}
                          <div>
                            <div className="km-detail-section-title">
                              Shipping Address
                              {sameAddress && (
                                <span style={{
                                  marginLeft: 8, fontSize: 11, fontWeight: 600,
                                  background: '#e8f5e9', color: '#2e7d32',
                                  padding: '2px 8px', borderRadius: 20,
                                }}>Same as billing</span>
                              )}
                            </div>
                            <AddressBlock
                              addr={shippingAddr}
                              phone={!sameAddress ? order.customer_phone : null}
                              phone2={!sameAddress ? order.customer_phone2 : null}
                              email={null}
                            />
                          </div>

                          {/* ── Payment Summary ── */}
                          <div>
                            <div className="km-detail-section-title">Payment Summary</div>

                            <div className="km-payment-row">
                              <span className="td-muted">Subtotal</span>
                              <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {tax > 0 && (
                              <div className="km-payment-row">
                                <span className="td-muted">GST</span>
                                <span>+₹{tax.toFixed(2)}</span>
                              </div>
                            )}

                            <div className="km-payment-row">
                              <span className="td-muted">Delivery</span>
                              {deliveryCharge > 0 ? (
                                <span>+₹{deliveryCharge.toFixed(2)}</span>
                              ) : (
                                <span className="td-green">FREE</span>
                              )}
                            </div>

                            {discount > 0 && (
                              <div className="km-payment-row">
                                <span className="td-muted">
                                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}
                                </span>
                                <span className="td-green">−₹{discount.toFixed(2)}</span>
                              </div>
                            )}

                            <div style={{ borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />

                            <div className="km-payment-total">
                              <span>Total Paid</span>
                              <span className="td-price">₹{total.toFixed(2)}</span>
                            </div>
                          </div>

                        </div>

                        {/* ── Order Notes & Delivery State (separate full-width section) ── */}
                        {(note || deliveryState) && (
                          <div
                            className="km-order-notes-section"
                            style={{
                              marginTop: 16, paddingTop: 16,
                              borderTop: '1px solid #e5e7eb',
                              display: 'flex', gap: 24,
                            }}
                          >
                            {note && (
                              <div style={{ flex: 1 }}>
                                <div className="km-detail-section-title">📝 Order Notes</div>
                                <div className="km-order-notes">{note}</div>
                              </div>
                            )}

                            {deliveryState && (
                              <div style={{ flex: 1 }}>
                                <div className="km-detail-section-title">🚚 Delivery State</div>
                                <div className="km-order-notes">{deliveryState}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          }}
        />
        </>
      )}

      <ImageModal image={zoomImage} onClose={() => setZoomImage(null)} />
    </div>
  );
}
