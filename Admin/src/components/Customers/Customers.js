import { useEffect, useState } from 'react';
import DataTable from '../DataTable/DataTable';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const templateDefaults = {
  category: {
    title: 'A category offer for you',
    emailSubject: 'A special category offer - Vika Vastra',
    emailContent: 'Enjoy special savings on selected products. Browse the Best collection and find something you love.',
    discountLabel: 'Special category savings',
  },
  coupon: {
    title: 'A coupon for your next order',
    emailSubject: 'Your Vika Vastra coupon is here',
    emailContent: 'Use this coupon at checkout and enjoy savings on your next order.',
    discountLabel: 'Use your coupon at checkout',
  },
  offer: {
    title: 'A special offer from Vika Vastra',
    emailSubject: 'A special offer from Vika Vastra',
    emailContent: 'Explore our latest Best collection and enjoy this special offer.',
    discountLabel: 'Special offer',
  },
};

export default function Customers({ showToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignType, setCampaignType] = useState('category');
  const [campaign, setCampaign] = useState({ ...templateDefaults.category, code: '', expiresAt: '', shopUrl: '' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API}/user`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const customers = Array.isArray(data) ? data : Array.isArray(data.users) ? data.users : Array.isArray(data.customers) ? data.customers : [];
      setRows(customers);
      setSelectedIds(current => current.filter(id => customers.some(customer => String(customer.id) === String(id))));
    } catch (err) {
      setError(err.message);
      showToast?.('Load Failed', `Could not load customers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomer = id => setSelectedIds(current => current.some(value => String(value) === String(id)) ? current.filter(value => String(value) !== String(id)) : [...current, id]);
  const allSelected = rows.length > 0 && rows.every(row => selectedIds.some(id => String(id) === String(row.id)));
  const toggleAll = () => setSelectedIds(allSelected ? [] : rows.map(row => row.id));
  const headerCheckbox = <input type="checkbox" aria-label={allSelected ? 'Clear all customer selections' : 'Select all customers'} checked={allSelected} onChange={toggleAll} />;

  const changeTemplate = type => {
    setCampaignType(type);
    setCampaign(current => ({ ...current, ...templateDefaults[type], code: type === 'coupon' ? current.code : '', expiresAt: '' }));
  };

  const sendCampaign = async event => {
    event.preventDefault();
    if (!selectedIds.length) return showToast?.('Select Customers', 'Choose at least one customer to email.');
    if (campaignType === 'coupon' && !campaign.code.trim()) return showToast?.('Coupon Code Required', 'Enter the coupon code for this email.');
    setSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API}/email-campaigns/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerIds: selectedIds, campaignType, ...campaign }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.assign('/login');
        return;
      }
      if (!response.ok || !result.success) {
        const details = Array.isArray(result.details) && result.details.length ? ` ${result.details.join(' ')}` : '';
        throw new Error(`${result.error || 'Could not send campaign emails.'}${details}`);
      }
      showToast?.('Campaign Sent', `${result.sent} emails sent${result.failed ? `, ${result.failed} failed` : ''}.`);
      setShowComposer(false);
      setSelectedIds([]);
    } catch (err) {
      showToast?.('Email Failed', err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div><div className="section-header"><div className="section-title">Customer Directory</div></div><p className="km-loading">Loading customers...</p></div>;
  if (error) return <div><div className="section-header"><div className="section-title">Customer Directory</div></div><div style={{ color: 'red', padding: 20 }}>Error: {error}<button onClick={fetchCustomers} style={{ marginLeft: 10 }}>Retry</button></div></div>;

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Customer Directory</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="section-count">{rows.length} total customers</span>
          <button className="action-btn btn-edit" type="button" onClick={toggleAll}>{allSelected ? 'Clear Selection' : 'Select All'}</button>
          <button className="action-btn btn-edit" type="button" disabled={!selectedIds.length} onClick={() => setShowComposer(value => !value)}>
            Email Selected{selectedIds.length ? ` (${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {showComposer && (
        <form onSubmit={sendCampaign} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1', fontWeight: 700, color: '#720E1E' }}>Branded campaign email · {selectedIds.length} selected</div>
          <label style={{ display: 'grid', gap: 5, fontSize: 12 }}>Email template
            <select className="km-input" value={campaignType} onChange={event => changeTemplate(event.target.value)}>
              <option value="category">Category offer</option><option value="coupon">Coupon offer</option><option value="offer">General offer</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 12 }}>Email subject
            <input className="km-input" required value={campaign.emailSubject} onChange={event => setCampaign(current => ({ ...current, emailSubject: event.target.value }))} />
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 12 }}>Offer title
            <input className="km-input" required value={campaign.title} onChange={event => setCampaign(current => ({ ...current, title: event.target.value }))} />
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 12 }}>Offer highlight
            <input className="km-input" value={campaign.discountLabel} onChange={event => setCampaign(current => ({ ...current, discountLabel: event.target.value }))} placeholder="e.g. 20% off selected sarees" />
          </label>
          {campaignType === 'coupon' && <label style={{ display: 'grid', gap: 5, fontSize: 12 }}>Coupon code
            <input className="km-input" required value={campaign.code} onChange={event => setCampaign(current => ({ ...current, code: event.target.value.toUpperCase() }))} />
          </label>}
          {campaignType === 'coupon' && <label style={{ display: 'grid', gap: 5, fontSize: 12 }}>Valid until (optional)
            <input className="km-input" type="date" value={campaign.expiresAt} onChange={event => setCampaign(current => ({ ...current, expiresAt: event.target.value }))} />
          </label>}
          <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 5, fontSize: 12 }}>Email message
            <textarea className="km-input" rows="4" required value={campaign.emailContent} onChange={event => setCampaign(current => ({ ...current, emailContent: event.target.value }))} />
          </label>
          <label style={{ gridColumn: '1 / -1', display: 'grid', gap: 5, fontSize: 12 }}>Shop link (optional)
            <input className="km-input" type="url" value={campaign.shopUrl} onChange={event => setCampaign(current => ({ ...current, shopUrl: event.target.value }))} placeholder="Uses the store link by default" />
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="km-btn-cancel" onClick={() => setShowComposer(false)}>Cancel</button>
            <button type="submit" className="km-btn-submit" disabled={sending}>{sending ? 'Sending…' : `Send to ${selectedIds.length} customer${selectedIds.length === 1 ? '' : 's'}`}</button>
          </div>
        </form>
      )}

      {rows.length === 0 ? <p className="km-empty">No customers found.</p> : (
        <DataTable
          columns={[<span key="select-heading" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{headerCheckbox}<span>Select</span></span>, '# ID', 'Customer Name', 'Phone Number', 'Email Address', 'Joined']}
          initialRows={rows}
          renderRow={(row, i) => (
            <tr key={row.id}>
              <td><input type="checkbox" aria-label={`Select ${row.username || row.name || row.email}`} checked={selectedIds.some(id => String(id) === String(row.id))} onChange={() => toggleCustomer(row.id)} /></td>
              <td className="td-id" style={{ width: 80 }}>#{i + 1}</td>
              <td style={{ fontWeight: 600 }}>{row.username || row.name || '—'}</td>
              <td>{row.phone || '—'}</td>
              <td className="td-muted">{row.email || '—'}</td>
              <td className="td-muted">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
