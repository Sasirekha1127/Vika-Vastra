import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Coupons({ showToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '', type: 'percent', value: '',
    min_order: '', max_discount: '', expires_at: '', is_active: true, show_in_checkout: true,
    description: '',
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = () => {
    setLoading(true);
    fetch(`${API}/coupons/admin/all`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => { showToast('Load Failed', 'Could not load coupons.'); setLoading(false); });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditClick = (c) => {
    setEditingId(c.id);
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value,
      min_order: c.min_order,
      max_discount: c.max_discount || '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
      is_active: c.is_active,
      show_in_checkout: c.show_in_checkout !== false && c.show_in_checkout !== 0,
      description: c.description || `Use coupon ${c.code} at checkout and save on your next Vika Vastra order.`,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      type: 'percent',
      value: '',
      min_order: '',
      max_discount: '',
      expires_at: '',
      is_active: true,
      show_in_checkout: true,
      description: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const value = Number(formData.value);
    const minOrder = Number(formData.min_order || 0);
    const maxDiscount = Number(formData.max_discount || 0);

    // ───── BASIC VALIDATION ─────
    if (!formData.code.trim()) {
      return showToast('Error', 'Coupon code is required');
    }

    if (value <= 0) {
      return showToast('Error', 'Discount value must be greater than 0');
    }

    // ❌ REMOVED 100% LIMIT (as per your request)
    // if (formData.type === 'percent' && value > 100) {
    //   return showToast('Error', 'Percentage cannot exceed 100%');
    // }

    if (minOrder < 0) {
      return showToast('Error', 'Min order cannot be negative');
    }

    if (!minOrder || minOrder <= 0) {
      return showToast('Error', 'Min Order is required and must be greater than 0');
    }

    if (minOrder <= value) {
      return showToast(
        'Error',
        'Min Order should be greater than Discount Value'
      );
    }

    // ───── IMPORTANT BUSINESS RULE ─────

    if (formData.type === 'fixed') {
      if (value >= minOrder && minOrder > 0) {
        return showToast(
          'Error',
          'Discount should be less than Min Order value'
        );
      }
    }

    if (formData.type === 'percent') {
      if (maxDiscount && maxDiscount > minOrder && minOrder > 0) {
        return showToast(
          'Error',
          'Max discount cannot be greater than Min Order'
        );
      }

      if (maxDiscount > 50000) {
        return showToast('Error', 'Max discount is too high');
      }
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${API}/coupons/admin/update/${editingId}`
      : `${API}/coupons/admin/create`;

    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_discount: formData.max_discount || null,
          expires_at: formData.expires_at || null
        })
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || result.error || 'Could not save coupon.');
      showToast(
        editingId ? 'Updated!' : 'Created!',
        editingId ? 'Coupon updated successfully.' : 'New coupon created. Customer emails are being sent in the background.'
      );
      resetForm();
      fetchCoupons();
    } catch (error) {
      showToast('Save Failed', error.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this coupon? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/coupons/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCoupons();
        showToast('Deleted!', 'Coupon removed successfully.');
      }
    } catch {
      showToast('Error', 'Could not complete the action.');
    }
  };

  const handleCheckoutVisibility = async (coupon) => {
    const nextValue = !(coupon.show_in_checkout !== false && coupon.show_in_checkout !== 0);
    try {
      const res = await fetch(`${API}/coupons/admin/update/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_in_checkout: nextValue }),
      });
      if (!res.ok) throw new Error('Could not update checkout visibility.');
      setRows(prev => prev.map(row => row.id === coupon.id ? { ...row, show_in_checkout: nextValue } : row));
      showToast('Updated!', nextValue ? 'Coupon is now shown in checkout.' : 'Coupon is hidden from checkout.');
    } catch (error) {
      showToast('Update Failed', error.message || 'Could not update checkout visibility.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Coupons</div>
        <button
          className="action-btn btn-edit"
          onClick={() => showForm ? resetForm() : setShowForm(true)}
        >
          {showForm ? 'Close' : '+ Add Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">%</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Coupon' : 'Add New Coupon'}
              </div>
              <div className="km-form-header-sub">
                Live preview updates as you type
              </div>
            </div>
          </div>

          <div className="km-coupon-preview">
            <div className="km-coupon-ticket">
              <div className="km-coupon-stripe" />
              <div className="km-coupon-body">
                <div className="km-coupon-label">OFFER PREVIEW</div>
                <div className="km-coupon-code">{formData.code || 'CODE'}</div>
                <div className="km-coupon-value">
                  {formData.type === 'percent'
                    ? `${formData.value || 0}%`
                    : `₹${formData.value || 0}`}
                  <span className="km-coupon-off"> OFF</span>
                </div>
                {formData.type === 'percent' && formData.max_discount > 0 && (
                  <div className="km-coupon-cap">
                    Up to ₹{formData.max_discount}
                  </div>
                )}
                <div className="km-coupon-min">
                  Min Order: ₹{formData.min_order}
                </div>
              </div>
              <div className="km-coupon-notch" />
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              <div className="km-field km-field-full">
                <label className="km-label">Coupon Code</label>
                <input
                  className="km-input"
                  name="code"
                  type="text"
                  placeholder="e.g. WELCOME100"
                  required
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Type</label>
                <select
                  className="km-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="km-field">
                <label className="km-label">Value</label>
                <input
                  className="km-input"
                  name="value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Min Order (₹)</label>
                <input
                  className="km-input"
                  name="min_order"
                  type="number"
                  value={formData.min_order}
                  onChange={handleChange}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Max Discount Cap (₹)</label>
                <input
                  className={`km-input ${formData.type === 'fixed' ? 'km-input-disabled' : ''}`}
                  name="max_discount"
                  type="number"
                  placeholder={formData.type === 'fixed' ? 'N/A' : '0'}
                  disabled={formData.type === 'fixed'}
                  value={formData.max_discount}
                  onChange={handleChange}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Expiry Date</label>
                <input
                  className="km-input"
                  name="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={handleChange}
                />
              </div>

              <div className="km-field km-field-checkbox">
                <label className="km-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Active Status
                </label>
              </div>

              <div className="km-field km-field-full">
                <label className="km-label">Coupon Email Message</label>
                <textarea className="km-input" name="description" rows="3"
                  placeholder="Write the message customers will receive with this coupon."
                  maxLength={255}
                  value={formData.description} onChange={handleChange} />
                <small className="td-muted">Included in the branded coupon email sent when a new active coupon is created.</small>
              </div>

              <div className="km-field km-field-checkbox">
                <label className="km-checkbox-label">
                  <input
                    type="checkbox"
                    name="show_in_checkout"
                    checked={formData.show_in_checkout}
                    onChange={handleChange}
                  />
                  Show in checkout coupon list
                </label>
              </div>


              <button type="submit" className="km-btn-submit" disabled={submitting}>
                {submitting ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Coupon' : 'Save Coupon')}
              </button>
              <button type="button" className="km-btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading...</p>
      ) : (
        <DataTable
          columns={['Code', 'Discount', 'Min Order', 'Max Cap', 'Expiry', 'Status', 'Checkout', 'Actions']}
          initialRows={rows}
          renderRow={(row) => (
            <tr key={row.id}>
              <td className="td-code">{row.code}</td>
              <td><strong>{row.type === 'percent' ? `${row.value}%` : `₹${row.value}`}</strong></td>
              <td>₹{row.min_order}</td>
              <td>{row.type === 'percent' && row.max_discount ? `₹${row.max_discount}` : '—'}</td>
              <td className="td-muted">
                {row.expires_at ? new Date(row.expires_at).toLocaleDateString('en-IN') : 'No Expiry'}
              </td>
              <td>
                <span className={`status-pill ${row.is_active ? 'pill-active' : 'pill-inactive'}`}>
                  {row.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </td>
              <td>
                <label className="km-checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={row.show_in_checkout !== false && row.show_in_checkout !== 0}
                    onChange={() => handleCheckoutVisibility(row)}
                    aria-label={`${row.show_in_checkout ? 'Hide' : 'Show'} ${row.code} in checkout`}
                  />
                  {row.show_in_checkout ? 'Shown' : 'Hidden'}
                </label>
              </td>
              <td>
                <button className="action-btn btn-edit" onClick={() => handleEditClick(row)}>Edit</button>
                <button className="action-btn btn-del" onClick={() => handleDelete(row.id)}>Delete</button>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
