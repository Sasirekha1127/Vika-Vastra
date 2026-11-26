// src/components/Dashboard/Dashboard.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtINR(n) {
  if (n == null || n === '-') return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
function fmtNum(n) {
  if (n == null || n === '-') return '—';
  return Number(n).toLocaleString('en-IN');
}
function stockColor(s) {
  if (s === 0) return '#EA5455';
  if (s <= 50) return '#FF9F43';
  if (s <= 200) return '#00CFE8';
  return '#28C76F';
}
function stockLabel(s) {
  if (s === 0) return 'Out of Stock';
  if (s <= 50) return 'Low Stock';
  if (s <= 200) return 'Medium';
  return 'In Stock';
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DONUT_COLORS = ['#7367F0', '#28C76F', '#FF9F43', '#EA5455', '#00CFE8', '#9B59B6'];
const STATUS_CONFIG = [
  { key: 'confirmed', label: 'Confirmed', color: '#00CFE8' },
  { key: 'shipped', label: 'Shipped', color: '#7367F0' },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: '#4BC0C0' },
  { key: 'delivered', label: 'Delivered', color: '#28C76F' },
];

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  bg: '#F4F5FA',
  surface: '#FFFFFF',
  border: '#EAEAEC',
  primary: '#7367F0',
  primaryBg: '#F0EEFF',
  green: '#28C76F',
  greenBg: '#E8F8F0',
  orange: '#FF9F43',
  orangeBg: '#FFF2E5',
  blue: '#2E8FDD',
  blueBg: '#E5F0FF',
  red: '#EA5455',
  redBg: '#FFEAEA',
  text: '#2E263D',
  muted: '#A0A3B1',
};

const card = {
  background: T.surface,
  borderRadius: 12,
  border: `1px solid ${T.border}`,
  padding: '18px 20px',
};

/* ─── Shared UI atoms ────────────────────────────────────────────────────── */
function Pill({ label, bg, color }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 9px',
      borderRadius: 20, background: bg, color
    }}>
      {label}
    </span>
  );
}

function Badge({ up, children, onClick, title }) {
  const isClickable = Boolean(onClick);
  return (
    <span
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      title={title}
      onClick={e => {
        if (isClickable) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      onKeyDown={e => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.stopPropagation();
          e.preventDefault();
          onClick(e);
        }
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700,
        padding: '2px 8px', borderRadius: 20,
        background: up ? T.greenBg : T.redBg,
        color: up ? T.green : T.red,
        cursor: isClickable ? 'pointer' : 'inherit',
        transition: 'all 0.15s ease',
      }}>
      {up ? '▲' : '▼'} {children}
    </span>
  );
}

function IconBox({ icon, bg, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
    }}>
      {icon}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  badge,
  badgeUp,
  icon,
  iconBg,
  loading,
  onClick,
  onBadgeClick,
  badgeTitle,
  onSubClick,
  subTitle,
  tooltip,
}) {
  const [hovered, setHovered] = useState(false);
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => isClickable && setHovered(false)}
      title={tooltip || (isClickable ? `Click to view ${label}` : undefined)}
      style={{
        ...card,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        cursor: isClickable ? 'pointer' : 'default',
        transform: isClickable && hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isClickable && hovered
          ? '0 10px 24px rgba(115, 103, 240, 0.15), 0 2px 6px rgba(0, 0, 0, 0.04)'
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        borderColor: isClickable && hovered ? '#7367F0' : T.border,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 11,
              color: isClickable && hovered ? T.primary : T.muted,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.5px',
              transition: 'color 0.2s ease',
            }}
          >
            {label}
          </span>
          {isClickable && (
            <span
              style={{
                fontSize: 12,
                opacity: hovered ? 1 : 0.4,
                transform: hovered ? 'translate(1px, -1px)' : 'none',
                transition: 'all 0.2s ease',
                color: hovered ? T.primary : T.muted,
                lineHeight: 1,
              }}
            >
              ↗
            </span>
          )}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.1, marginBottom: 5 }}>
          {loading ? '—' : value}
        </div>
        {badge && !loading && (
          <Badge up={badgeUp} onClick={onBadgeClick} title={badgeTitle}>
            {badge}
          </Badge>
        )}
        {sub && !loading && (
          <div
            onClick={e => {
              if (onSubClick) {
                e.stopPropagation();
                onSubClick();
              }
            }}
            title={subTitle}
            style={{
              fontSize: 11,
              color: T.muted,
              marginTop: 4,
              cursor: onSubClick ? 'pointer' : 'inherit',
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          transform: isClickable && hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}
      >
        <IconBox icon={icon} bg={iconBg} />
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      {action && (
        <button onClick={onAction} style={{
          fontSize: 12, fontWeight: 600, color: T.primary, background: T.primaryBg,
          border: 'none', padding: '5px 13px', borderRadius: 8, cursor: 'pointer'
        }}>
          {action}
        </button>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
      padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12
    }}>
      <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Revenue' ? fmtINR(p.value) : fmtNum(p.value)}
        </div>
      ))}
    </div>
  );
}

/* ─── Export button ──────────────────────────────────────────────────────── */
function ExportBtn({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600,
        color: loading ? T.muted : T.green,
        background: loading ? '#F4F5FA' : T.greenBg,
        border: `1px solid ${loading ? T.border : '#b7f0d0'}`,
        padding: '5px 13px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all .15s',
      }}
    >
      {loading ? '⏳ Exporting…' : '⬇ Export CSV'}
    </button>
  );
}

/* ─── Report filter bar ──────────────────────────────────────────────────── */
function FilterBar({ filters, onChange, onApply, onReset, children }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
      {Object.entries(filters).map(([key, val]) => {
        if (key === 'meta') return null;
        const meta = filters.meta?.[key] || {};
        if (meta.type === 'select') {
          return (
            <div key={key}>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.4px' }}>{meta.label}</div>
              <select value={val} onChange={e => onChange(key, e.target.value)}
                style={{
                  fontSize: 12, padding: '5px 10px', borderRadius: 8, border: `1px solid ${T.border}`,
                  background: T.surface, color: T.text, outline: 'none', cursor: 'pointer'
                }}>
                {meta.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          );
        }
        return (
          <div key={key}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.4px' }}>{meta.label}</div>
            <input type="date" value={val} onChange={e => onChange(key, e.target.value)}
              style={{
                fontSize: 12, padding: '5px 10px', borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.surface, color: T.text, outline: 'none'
              }} />
          </div>
        );
      })}
      <button onClick={onApply} style={{
        fontSize: 12, fontWeight: 700, color: '#fff', background: T.primary,
        border: 'none', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', marginTop: 14
      }}>
        Apply
      </button>
      <button onClick={onReset} style={{
        fontSize: 12, fontWeight: 600, color: T.muted, background: T.bg,
        border: `1px solid ${T.border}`, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', marginTop: 14
      }}>
        Reset
      </button>
      {children}
    </div>
  );
}

/* ─── Summary tiles row ──────────────────────────────────────────────────── */
function SummaryTiles({ tiles }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tiles.length},1fr)`, gap: 10, marginBottom: 14 }}>
      {tiles.map(({ label, value, color, bg }) => (
        <div key={label} style={{ background: bg, borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const STORAGE_KEY = 'kalpana_low_stock_threshold';
  const [threshold, setThreshold] = useState(parseInt(localStorage.getItem(STORAGE_KEY)) || 10);
  const [recentProducts, setRecentProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);

  /* ── Report state ──────────────────────────────────────────────────────── */
  const DEFAULT_ORDER_FILTERS = {
    from: '', to: '',
    status: '', payment_status: '',
    meta: {
      from: { label: 'From Date', type: 'date' },
      to: { label: 'To Date', type: 'date' },
      status: {
        label: 'Order Status', type: 'select', options: [
          { value: '', label: 'All Statuses' },
          ...STATUS_CONFIG.map(s => ({ value: s.key, label: s.label })),
        ]
      },
      payment_status: {
        label: 'Payment Status', type: 'select', options: [
          { value: '', label: 'All' },
          { value: 'paid', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
        ]
      },
    },
  };

  const DEFAULT_PRODUCT_FILTERS = {
    stockStatus: '',
    meta: {
      stockStatus: {
        label: 'Stock Status', type: 'select', options: [
          { value: '', label: 'All Products' },
          { value: 'low', label: 'Low Stock' },
          { value: 'out', label: 'Out of Stock' },
        ]
      },
    },
  };

  const [orderFilters, setOrderFilters] = useState(DEFAULT_ORDER_FILTERS);
  const [productFilters, setProductFilters] = useState(DEFAULT_PRODUCT_FILTERS);
  const [orderReport, setOrderReport] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [orderRptLoading, setOrderRptLoading] = useState(false);
  const [prodRptLoading, setProdRptLoading] = useState(false);
  const [orderExporting, setOrderExporting] = useState(false);
  const [prodExporting, setProdExporting] = useState(false);

  useEffect(() => {
    const onS = e => { if (e.key === STORAGE_KEY) setThreshold(parseInt(e.newValue) || 10); };
    const onC = e => setThreshold(e.detail);
    window.addEventListener('storage', onS);
    window.addEventListener('kalpana_threshold_change', onC);
    return () => {
      window.removeEventListener('storage', onS);
      window.removeEventListener('kalpana_threshold_change', onC);
    };
  }, []);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : [];
        setAllProducts(list);
        setRecentProducts([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10));
      })
      .catch(() => showToast?.('Failed to load products'))
      .finally(() => setProductsLoading(false));
  }, [showToast]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch(`${API}/orders/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setAllOrders(Array.isArray(d.orders) ? d.orders : []))
      .catch(() => showToast?.('Failed to load orders'))
      .finally(() => setOrdersLoading(false));
  }, [showToast]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    fetch(`${API}/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setAllCustomers(Array.isArray(d) ? d : d.users || []))
      .catch(() => [])
      .finally(() => setCustomersLoading(false));
  }, [showToast]);

  /* ── Report API helpers ────────────────────────────────────────────────── */
  const buildQuery = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (k !== 'meta' && v) params.append(k, v); });
    return params.toString();
  };

  const fetchOrderReport = async (filters = orderFilters) => {
    setOrderRptLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const q = buildQuery(filters);
      const r = await fetch(`${API}/dashboard/reports/orders${q ? '?' + q : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setOrderReport(d);
      else showToast?.('Failed to load order report');
    } catch { showToast?.('Failed to load order report'); }
    finally { setOrderRptLoading(false); }
  };

  const fetchProductReport = async (filters = productFilters) => {
    setProdRptLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const q = buildQuery(filters);
      const r = await fetch(`${API}/dashboard/reports/products${q ? '?' + q : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setProductReport(d);
      else showToast?.('Failed to load product report');
    } catch { showToast?.('Failed to load product report'); }
    finally { setProdRptLoading(false); }
  };

  const exportOrderCSV = async () => {
    setOrderExporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const q = buildQuery(orderFilters);
      const r = await fetch(`${API}/dashboard/reports/orders/export${q ? '?' + q : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `order-report-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { showToast?.('Export failed'); }
    finally { setOrderExporting(false); }
  };

  const exportProductCSV = async () => {
    setProdExporting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const q = buildQuery(productFilters);
      const r = await fetch(`${API}/dashboard/reports/products/export${q ? '?' + q : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `product-report-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { showToast?.('Export failed'); }
    finally { setProdExporting(false); }
  };

  /* ── Derived stats ─────────────────────────────────────────────────────── */
  const uniqueCustomerCount = useMemo(() => {
    const emails = new Set(), phones = new Set(), ids = new Set();
    allCustomers.forEach(c => {
      if (c.id) ids.add(String(c.id));
      if (c.email) emails.add(c.email.toLowerCase().trim());
      if (c.phone) phones.add(c.phone.trim());
    });
    let extra = 0;
    allOrders.forEach(o => {
      const e = (o.email || o.customerEmail || o.Customer?.email || '').toLowerCase().trim();
      const p = (o.phone || o.customerPhone || o.Customer?.phone || '').trim();
      const id = o.customerId || o.customer_id || o.Customer?.id;
      if (!(id && ids.has(String(id))) && !(e && emails.has(e)) && !(p && phones.has(p))) {
        extra++;
        if (e) emails.add(e); if (p) phones.add(p); if (id) ids.add(String(id));
      }
    });
    return allCustomers.length + extra;
  }, [allCustomers, allOrders]);

  const newCustomersThisMonth = useMemo(() => {
    const now = new Date(), m = now.getMonth(), y = now.getFullYear(), seen = new Set();
    allOrders.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getMonth() === m && d.getFullYear() === y) {
        const k = o.customerId || o.customer_id || o.Customer?.id || (o.email || '').toLowerCase().trim() || (o.phone || '').trim();
        if (k) seen.add(String(k));
      }
    });
    allCustomers.forEach(c => {
      const d = new Date(c.createdAt);
      if (d.getMonth() === m && d.getFullYear() === y) seen.add(String(c.id));
    });
    return seen.size;
  }, [allCustomers, allOrders]);

  const sales = useMemo(() => {
    const delivered = allOrders.filter(o => o.status === 'delivered');
    const newOrders = allOrders.filter(o => ['processing', 'pending', 'new'].includes(String(o.status || '').toLowerCase()));
    const cancelled = allOrders.filter(o => o.status === 'cancelled');
    const refunded = allOrders.filter(o => o.status === 'refunded');
    const totalRevenue = delivered.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const now = new Date(), thisM = now.getMonth(), thisY = now.getFullYear();
    const revOfMonth = (m, y) =>
      delivered.filter(o => { const d = new Date(o.createdAt); return d.getMonth() === m && d.getFullYear() === y; })
        .reduce((s, o) => s + (Number(o.total) || 0), 0);
    const lastM = (thisM + 11) % 12, lastY = thisM === 0 ? thisY - 1 : thisY;
    const growth = revOfMonth(lastM, lastY)
      ? ((revOfMonth(thisM, thisY) - revOfMonth(lastM, lastY)) / revOfMonth(lastM, lastY) * 100).toFixed(1) : 0;
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const m = (thisM - i + 12) % 12, y = thisM - i < 0 ? thisY - 1 : thisY;
      monthlyData.push({
        month: MONTH_NAMES[m], revenue: revOfMonth(m, y),
        orders: allOrders.filter(o => { const d = new Date(o.createdAt); return d.getMonth() === m && d.getFullYear() === y; }).length
      });
    }
    const statusCounts = {};
    allOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    return {
      totalRevenue, ordersCount: allOrders.length, newOrdersCount: newOrders.length, deliveredCount: delivered.length,
      growth: Number(growth), cancellations: cancelled.length, refunds: refunded.length, monthlyData, statusCounts
    };
  }, [allOrders]);

  const products = useMemo(() => {
    const nameToId = {};
    allProducts.forEach(p => { if (p.productName) nameToId[p.productName.toLowerCase().trim()] = p.id; });
    const salesByProduct = {}, salesByName = {};
    allOrders.filter(o => o.status === 'delivered').forEach(o => {
      (o.OrderItems || o.orderItems || o.order_items || o.items || []).forEach(item => {
        const qty = Number(item.quantity) || 1, pid = item.product_id || item.productId || null;
        const key = (item.name || item.productName || '').toLowerCase().trim();
        if (pid) salesByProduct[String(pid)] = (salesByProduct[String(pid)] || 0) + qty;
        if (key) { salesByName[key] = (salesByName[key] || 0) + qty; if (!pid && nameToId[key]) salesByProduct[String(nameToId[key])] = (salesByProduct[String(nameToId[key])] || 0) + qty; }
      });
    });
    const enriched = allProducts.map(p => {
      const stock = Number(p.stock) || 0, nameKey = p.productName?.toLowerCase().trim() || '';
      const s = salesByProduct[String(p.id)] || salesByName[nameKey] || 0;
      return { id: p.id, name: p.productName, category: p.Category?.name || '—', stock, sales: s, price: Number(p.salesPrice) || 0, mrp: Number(p.mrp) || 0 };
    });
    const lowStock = [], outOfStock = [];
    allProducts.forEach(p => {
      const entry = { productId: p.id, productName: p.productName, category: p.Category?.name || '—', stock: Number(p.stock) || 0, salesPrice: Number(p.salesPrice) || 0, mrp: Number(p.mrp) || 0 };
      if (entry.stock === 0) outOfStock.push(entry); else if (entry.stock <= threshold) lowStock.push(entry);
    });
    lowStock.sort((a, b) => a.stock - b.stock);
    const byCategory = {};
    enriched.forEach(p => {
      if (!byCategory[p.category]) byCategory[p.category] = { name: p.category, products: 0, stock: 0, sales: 0 };
      byCategory[p.category].products++; byCategory[p.category].stock += p.stock; byCategory[p.category].sales += p.sales;
    });
    return {
      enriched, lowStock, outOfStock,
      bestSelling: [...enriched].sort((a, b) => b.sales - a.sales).slice(0, 5),
      categoryData: Object.values(byCategory).sort((a, b) => b.products - a.products).slice(0, 6),
    };
  }, [allProducts, allOrders, threshold]);

  const isCustomersLoading = customersLoading || ordersLoading;

  /* ── Order report chart data ─────────────────────────────────────────── */
  const orderReportChartData = useMemo(() => {
    if (!orderReport?.orders) return [];
    const map = {};
    orderReport.orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      if (!map[key]) map[key] = { month: key, revenue: 0, orders: 0 };
      map[key].revenue += Number(o.total) || 0;
      map[key].orders += 1;
    });
    return Object.values(map).slice(-6);
  }, [orderReport]);

  /* ── Product report chart data ───────────────────────────────────────── */
  const productReportChartData = useMemo(() => {
    if (!productReport?.products) return [];
    return [...productReport.products]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 8)
      .map(p => ({ name: p.productName.length > 14 ? p.productName.slice(0, 14) + '…' : p.productName, unitsSold: p.unitsSold, revenue: p.revenue }));
  }, [productReport]);

  return (
    <div style={{ minHeight: '100vh', fontFamily: '"Public Sans","Inter",sans-serif', background: T.bg }}>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Page title */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-.3px' }}>Dashboard</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: T.muted }}>Overview of sales, orders and inventory</p>
        </div>

        {/* ── STAT CARDS ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, alignItems: 'stretch' }}>
          <StatCard
            label="New Orders"
            icon="🆕"
            iconBg={T.orangeBg}
            loading={ordersLoading}
            value={fmtNum(sales.newOrdersCount)}
            badge="needs attention"
            badgeUp={false}
            sub="awaiting processing"
            onClick={() => navigate('/orders_new')}
            tooltip="View New Orders awaiting processing"
          />
          <StatCard
            label="Total Orders"
            icon="🛒"
            iconBg={T.greenBg}
            loading={ordersLoading}
            value={fmtNum(sales.ordersCount)}
            badge={`${sales.cancellations} cancelled`}
            badgeUp={false}
            sub="total placed"
            onClick={() => navigate('/orders')}
            onBadgeClick={() => navigate('/orders_cancelled')}
            badgeTitle="View Cancelled Orders"
            tooltip="View All Orders"
          />
          <StatCard
            label="Total Revenue"
            icon="💰"
            iconBg={T.primaryBg}
            loading={ordersLoading}
            value={fmtINR(sales.totalRevenue)}
            badge={`${sales.growth > 0 ? '+' : ''}${sales.growth}% this month`}
            badgeUp={sales.growth > 0}
            sub={`${sales.deliveredCount} delivered`}
            onClick={() => navigate('/orders_delivered')}
            onSubClick={() => navigate('/orders_delivered')}
            subTitle="View Delivered Orders"
            tooltip="View Delivered Orders & Revenue Details"
          />
          <StatCard
            label="Total Products"
            icon="📦"
            iconBg={T.orangeBg}
            loading={productsLoading}
            value={fmtNum(allProducts.length)}
            badge={`${products.lowStock.length} low stock`}
            badgeUp={false}
            sub={`${products.outOfStock.length} out of stock`}
            onClick={() => navigate('/products')}
            onBadgeClick={() => navigate('/stock')}
            badgeTitle="Manage Low Stock in Stock Management"
            onSubClick={() => navigate('/stock')}
            subTitle="Manage Out of Stock in Stock Management"
            tooltip="View Products Catalog"
          />
          <StatCard
            label="Total Customers"
            icon="👥"
            iconBg={T.blueBg}
            loading={isCustomersLoading}
            value={fmtNum(uniqueCustomerCount)}
            badge={newCustomersThisMonth > 0 ? `+${newCustomersThisMonth} this month` : null}
            badgeUp={true}
            sub={`${allCustomers.length} registered`}
            onClick={() => navigate('/customers')}
            tooltip="View Customers"
          />
        </div>

        {/* ── REVENUE CHART + DONUT ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 14 }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Revenue & Orders</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Last 6 months performance</div>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: T.muted, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: T.primary, display: 'inline-block' }} />Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, border: `2px dashed ${T.green}`, display: 'inline-block' }} />Orders
                </span>
              </div>
            </div>
            {ordersLoading ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 13 }}>Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={sales.monthlyData} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="rev" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue"
                    stroke={T.primary} strokeWidth={2.5} fill="url(#gRev)" dot={false} />
                  <Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders"
                    stroke={T.green} strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={card}>
            <SectionHeader title="Sales Overview" sub="Category distribution" />
            {productsLoading ? (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: 13 }}>Loading…</div>
            ) : products.categoryData.length === 0 ? (
              <div style={{ color: T.muted, textAlign: 'center', padding: 20, fontSize: 13 }}>No category data.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={products.categoryData} dataKey="products" nameKey="name"
                      cx="50%" cy="50%" outerRadius={60} innerRadius={36} paddingAngle={2}
                      label={({ percent }) => percent > 0.09 ? `${(percent * 100).toFixed(0)}%` : ''} labelLine={false}>
                      {products.categoryData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, _, p) => [`${v} products`, p.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {products.categoryData.slice(0, 4).map((cat, i) => (
                    <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: DONUT_COLORS[i % DONUT_COLORS.length], display: 'inline-block' }} />
                        <span style={{ color: T.text, fontWeight: 500 }}>{cat.name}</span>
                      </span>
                      <span style={{ color: DONUT_COLORS[i % DONUT_COLORS.length], fontWeight: 700 }}>{cat.products} items</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── ORDER STATUS | BEST SELLING | INVENTORY ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <div style={card}>
            <SectionHeader title="Order Status" sub={`${fmtNum(sales.ordersCount)} total orders`} action="View Orders" onAction={() => navigate('/orders')} />
            {ordersLoading ? (
              <div style={{ color: T.muted, textAlign: 'center', padding: 16, fontSize: 13 }}>Loading…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STATUS_CONFIG.map(({ key, label, color }) => {
                  const cnt = sales.statusCounts[key] || 0;
                  const pct = sales.ordersCount ? Math.round((cnt / sales.ordersCount) * 100) : 0;
                  const statusRoute = {
                    confirmed: '/orders_confirmed',
                    shipped: '/orders_shipped',
                    out_for_delivery: '/orders_delivery',
                    delivered: '/orders_delivered',
                  }[key];
                  return (
                    <div
                      key={key}
                      onClick={() => statusRoute && navigate(statusRoute)}
                      style={{
                        cursor: statusRoute ? 'pointer' : 'default',
                        padding: '4px 6px',
                        borderRadius: 6,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => { if (statusRoute) e.currentTarget.style.background = '#F6F6F9'; }}
                      onMouseLeave={e => { if (statusRoute) e.currentTarget.style.background = 'transparent'; }}
                      title={statusRoute ? `View ${label} Orders` : undefined}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: T.text, fontWeight: 500 }}>{label}</span>
                        <span style={{ color, fontWeight: 700 }}>{fmtNum(cnt)} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: '#F0F0F0', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width .4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={card}>
            <SectionHeader title="Best Selling Products" sub="Top 5 by units sold" />
            {productsLoading || ordersLoading ? (
              <div style={{ color: T.muted, textAlign: 'center', padding: 16, fontSize: 13 }}>Loading…</div>
            ) : products.bestSelling.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 13 }}>No sales data yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'left', padding: '0 0 10px', borderBottom: `1px solid #F0F0F0`, textTransform: 'uppercase', letterSpacing: '.4px' }}>Product</th>
                    <th style={{ fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'right', padding: '0 0 10px', borderBottom: `1px solid #F0F0F0`, textTransform: 'uppercase', letterSpacing: '.4px' }}>Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {products.bestSelling.map(p => (
                    <tr key={p.id}>
                      <td style={{ padding: '8px 0', borderBottom: `1px solid #F9F9F9` }}>
                        <div style={{ fontWeight: 600, color: T.text }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '8px 0', borderBottom: `1px solid #F9F9F9`, textAlign: 'right', fontWeight: 700, color: T.primary }}>{fmtNum(p.sales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={card}>
            <SectionHeader title="Inventory Alerts" sub="Low & out of stock" action="Stock Manager" onAction={() => navigate('/stock')} />
            {productsLoading ? (
              <div style={{ color: T.muted, textAlign: 'center', padding: 16, fontSize: 13 }}>Loading…</div>
            ) : (products.lowStock.length === 0 && products.outOfStock.length === 0) ? (
              <div style={{ color: T.green, fontWeight: 600, fontSize: 13 }}>✅ All products in stock!</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'left', padding: '0 0 10px', borderBottom: `1px solid #F0F0F0`, textTransform: 'uppercase', letterSpacing: '.4px' }}>Product</th>
                    <th style={{ fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'right', padding: '0 0 10px', borderBottom: `1px solid #F0F0F0`, textTransform: 'uppercase', letterSpacing: '.4px' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {[...products.outOfStock, ...products.lowStock].slice(0, 5).map(v => (
                    <tr
                      key={v.productId}
                      onClick={() => navigate('/stock')}
                      style={{ cursor: 'pointer' }}
                      title="Open in Stock Management"
                    >
                      <td style={{ padding: '8px 0', borderBottom: `1px solid #F9F9F9` }}>
                        <div style={{ fontWeight: 600, color: T.text, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.productName}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{v.category}</div>
                      </td>
                      <td style={{ padding: '8px 0', borderBottom: `1px solid #F9F9F9`, textAlign: 'right' }}>
                        <Pill label={v.stock === 0 ? 'Out' : v.stock + ' left'} bg={v.stock === 0 ? T.redBg : T.orangeBg} color={v.stock === 0 ? T.red : T.orange} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── RECENT PRODUCTS TABLE ──────────────────────────────────────── */}
        <div style={card}>
          <SectionHeader title="Recent Products" sub="Latest additions to catalog" action="View All" onAction={() => navigate('/products')} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid #F0F0F0` }}>
                  {['Product Name', 'Category', 'MRP', 'Sale Price', 'Stock', 'Status'].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'left', padding: '0 12px 10px 0', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr><td colSpan={6} style={{ padding: 24, color: T.muted, textAlign: 'center', fontSize: 13 }}>Loading…</td></tr>
                ) : recentProducts.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 24, color: T.muted, textAlign: 'center', fontSize: 13 }}>No products yet.</td></tr>
                ) : recentProducts.map(p => {
                  const stock = Number(p.stock) || 0, mrp = Number(p.mrp) || 0, price = Number(p.salesPrice) || 0;
                  const sc = stockColor(stock);
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid #F9F9F9` }}>
                      <td style={{ padding: '10px 12px 10px 0', fontWeight: 600, color: T.text, maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</td>
                      <td style={{ padding: '10px 12px 10px 0' }}><Pill label={p.Category?.name || '—'} bg={T.primaryBg} color={T.primary} /></td>
                      <td style={{ padding: '10px 12px 10px 0', textDecoration: 'line-through', color: T.muted, fontSize: 11 }}>₹{mrp}</td>
                      <td style={{ padding: '10px 12px 10px 0', fontWeight: 800, color: T.green }}>{fmtINR(price)}</td>
                      <td style={{ padding: '10px 12px 10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc, display: 'inline-block' }} />
                          <span style={{ fontWeight: 700, color: T.text }}>{stock}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 0' }}>
                        <Pill label={stockLabel(stock)} bg={stock === 0 ? T.redBg : stock <= 50 ? T.orangeBg : stock <= 200 ? '#E8F5FF' : T.greenBg} color={sc} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 12, paddingTop: 10, borderTop: `1px solid #F0F0F0` }}>
            {[[T.green, 'High (>200)'], [T.blue, 'Medium (51–200)'], [T.orange, 'Low (≤50)'], [T.red, 'Out of stock']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ORDER REPORT SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div style={card}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>📋 Order Report</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Filter and analyse orders by date, status or payment</div>
            </div>
            <ExportBtn onClick={exportOrderCSV} loading={orderExporting} />
          </div>

          {/* Filters */}
          <FilterBar
            filters={orderFilters}
            onChange={(k, v) => setOrderFilters(f => ({ ...f, [k]: v }))}
            onApply={() => fetchOrderReport(orderFilters)}
            onReset={() => { setOrderFilters(DEFAULT_ORDER_FILTERS); setOrderReport(null); }}
          >
            {/* inline generate button next to reset */}
            <button onClick={() => fetchOrderReport(orderFilters)}
              style={{
                fontSize: 12, fontWeight: 700, color: '#fff', background: T.primary,
                border: 'none', padding: '6px 16px', borderRadius: 8, cursor: 'pointer', marginTop: 14, display: 'none'
              }}>
            </button>
          </FilterBar>

          {/* Prompt before first load */}
          {!orderReport && !orderRptLoading && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted, fontSize: 13 }}>
              Set filters above and click <strong style={{ color: T.primary }}>Apply</strong> to generate the order report.
            </div>
          )}

          {orderRptLoading && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted, fontSize: 13 }}>Loading report…</div>
          )}

          {orderReport && !orderRptLoading && (
            <>
              {/* Summary tiles */}
              <SummaryTiles tiles={[
                { label: 'Total Orders', value: fmtNum(orderReport.summary.totalOrders), color: T.primary, bg: T.primaryBg },
                { label: 'Total Revenue', value: fmtINR(orderReport.summary.totalRevenue), color: T.green, bg: T.greenBg },
                { label: 'Total Discount', value: fmtINR(orderReport.summary.totalDiscount), color: T.orange, bg: T.orangeBg },
                { label: 'Tax Collected', value: fmtINR(orderReport.summary.totalTax), color: T.blue, bg: T.blueBg },
                { label: 'Delivered', value: fmtNum(orderReport.summary.deliveredCount), color: T.green, bg: T.greenBg },
                { label: 'Cancelled', value: fmtNum(orderReport.summary.cancelledCount), color: T.red, bg: T.redBg },
              ]} />

              {/* Chart */}
              {orderReportChartData.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Monthly Trend</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={orderReportChartData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.primary} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false}
                        tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="Revenue"
                        stroke={T.primary} strokeWidth={2} fill="url(#gOrd)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Orders table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid #F0F0F0` }}>
                      {['Order #', 'Date', 'Customer', 'Quantity', 'Status', 'Payment', 'Total'].map(h => (
                        <th key={h} style={{
                          fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'left',
                          padding: '0 12px 10px 0', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orderReport.orders.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: T.muted, fontSize: 13 }}>No orders found for the selected filters.</td></tr>
                    ) : orderReport.orders.map(o => {
                      const sc = STATUS_CONFIG.find(s => s.key === o.status);
                      const totalQty = (o.OrderItems || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
                      return (
                        <tr key={o.id} style={{ borderBottom: `1px solid #F9F9F9` }}>
                          <td style={{ padding: '9px 12px 9px 0', fontWeight: 700, color: T.primary }}>{o.order_number ? String(o.order_number).replace(/^EMT-/, 'VV-') : `#${o.id}`}</td>
                          <td style={{ padding: '9px 12px 9px 0', color: T.muted }}>
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding: '9px 12px 9px 0' }}>
                            <div style={{ fontWeight: 600, color: T.text }}>{o.customer_name}</div>
                            <div style={{ fontSize: 11, color: T.muted }}>{o.customer_email}</div>
                          </td>
                          <td style={{ padding: '9px 12px 9px 0', fontWeight: 700, color: T.text }}>
                            {totalQty}
                          </td>
                          <td style={{ padding: '9px 12px 9px 0' }}>
                            <Pill label={sc?.label || o.status}
                              bg={sc ? sc.color + '22' : T.primaryBg}
                              color={sc?.color || T.primary} />
                          </td>
                          <td style={{ padding: '9px 12px 9px 0' }}>
                            <Pill label={o.payment_status}
                              bg={o.payment_status === 'paid' ? T.greenBg : o.payment_status === 'failed' ? T.redBg : T.orangeBg}
                              color={o.payment_status === 'paid' ? T.green : o.payment_status === 'failed' ? T.red : T.orange} />
                          </td>
                          <td style={{ padding: '9px 0', fontWeight: 800, color: T.green }}>{fmtINR(o.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PRODUCT REPORT SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <div style={card}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>📦 Product Report</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Sales performance and stock status across all products</div>
            </div>
            <ExportBtn onClick={exportProductCSV} loading={prodExporting} />
          </div>

          {/* Filters */}
          <FilterBar
            filters={productFilters}
            onChange={(k, v) => setProductFilters(f => ({ ...f, [k]: v }))}
            onApply={() => fetchProductReport(productFilters)}
            onReset={() => { setProductFilters(DEFAULT_PRODUCT_FILTERS); setProductReport(null); }}
          />

          {/* Prompt before first load */}
          {!productReport && !prodRptLoading && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted, fontSize: 13 }}>
              Set filters above and click <strong style={{ color: T.primary }}>Apply</strong> to generate the product report.
            </div>
          )}

          {prodRptLoading && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.muted, fontSize: 13 }}>Loading report…</div>
          )}

          {productReport && !prodRptLoading && (
            <>
              {/* Summary tiles */}
              <SummaryTiles tiles={[
                { label: 'Total Products', value: fmtNum(productReport.summary.totalProducts), color: T.primary, bg: T.primaryBg },
                { label: 'Units Sold', value: fmtNum(productReport.summary.totalUnitsSold), color: T.green, bg: T.greenBg },
                { label: 'Total Revenue', value: fmtINR(productReport.summary.totalRevenue), color: T.blue, bg: T.blueBg },
                { label: 'Low Stock', value: fmtNum(productReport.summary.lowStockCount), color: T.orange, bg: T.orangeBg },
                { label: 'Out of Stock', value: fmtNum(productReport.summary.outOfStockCount), color: T.red, bg: T.redBg },
              ]} />

              {/* Top products bar chart */}
              {productReportChartData.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Top Products by Units Sold</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={productReportChartData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#F0F0F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="unitsSold" name="Units Sold" fill={T.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Products table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid #F0F0F0` }}>
                      {['Product', 'Category', 'Brand', 'Sale Price', 'Stock', 'Stock Status', 'Units Sold', 'Revenue'].map(h => (
                        <th key={h} style={{
                          fontSize: 10, fontWeight: 700, color: T.muted, textAlign: 'left',
                          padding: '0 12px 10px 0', textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productReport.products.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: T.muted, fontSize: 13 }}>No products found for the selected filters.</td></tr>
                    ) : productReport.products.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid #F9F9F9` }}>
                        <td style={{ padding: '9px 12px 9px 0', fontWeight: 600, color: T.text, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</td>
                        <td style={{ padding: '9px 12px 9px 0' }}><Pill label={p.category} bg={T.primaryBg} color={T.primary} /></td>
                        <td style={{ padding: '9px 12px 9px 0', color: T.muted }}>{p.brand}</td>
                        <td style={{ padding: '9px 12px 9px 0', fontWeight: 700, color: T.green }}>{fmtINR(p.salesPrice)}</td>
                        <td style={{ padding: '9px 12px 9px 0', fontWeight: 700, color: T.text }}>{fmtNum(p.stock)}</td>
                        <td style={{ padding: '9px 12px 9px 0' }}>
                          <Pill
                            label={p.stockStatus}
                            bg={p.stockStatus === 'Out of Stock' ? T.redBg : p.stockStatus === 'Low Stock' ? T.orangeBg : T.greenBg}
                            color={p.stockStatus === 'Out of Stock' ? T.red : p.stockStatus === 'Low Stock' ? T.orange : T.green}
                          />
                        </td>
                        <td style={{ padding: '9px 12px 9px 0', fontWeight: 700, color: T.primary }}>{fmtNum(p.unitsSold)}</td>
                        <td style={{ padding: '9px 0', fontWeight: 700, color: T.green }}>{fmtINR(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer Credit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '10px 4px 16px', fontSize: 12, color: T.muted }}>
          <div>Copyright © {new Date().getFullYear()} Vika Vastra Admin Panel</div>
          <div>
            Developed by{' '}
            <a
              href="https://saitechnosolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: T.primary, textDecoration: 'none', fontWeight: 600 }}
            >
              Sai Techno Solutions Pvt. Ltd
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
