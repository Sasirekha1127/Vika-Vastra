import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  content: '',
  discountLabel: '',
  brandTag: '',
  shopUrl: '',
  link: '',
  startDate: '',
  endDate: '',
  status: 'Active',
  titleColor: '#ffffff',
  discountColor: '#f5d78e',
};

export default function OfferBanners({ showToast }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchOfferBanners(); }, []);

  const fetchOfferBanners = () => {
    setLoading(true);
    fetch(`${API}/offer-banners`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => {
        showToast('Load Failed', 'Could not load offer banners.');
        setLoading(false);
      });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
  };

  const handleEditClick = (offer) => {
    setEditingId(offer.id);
    setFormData({
      title:         offer.title         || '',
      subtitle:      offer.subtitle      || '',
      content:       offer.content       || '',
      discountLabel: offer.discountLabel || '',
      brandTag:      offer.brandTag      || '',
      shopUrl:       offer.shopUrl       || '',
      link:          offer.link          || '',
      startDate:     offer.startDate ? offer.startDate.slice(0, 10) : '',
      endDate:       offer.endDate   ? offer.endDate.slice(0, 10)   : '',
      status:        offer.status        || 'Active',
      titleColor:    offer.titleColor    || '#ffffff',
      discountColor: offer.discountColor || '#f5d78e',
    });
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, typeof v === 'boolean' ? String(v) : v));
    if (imageFile) data.append('image', imageFile);

    const method = editingId ? 'PUT' : 'POST';
    const url    = editingId
      ? `${API}/offer-banners/update/${editingId}`
      : `${API}/offer-banners/add`;

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(
          editingId ? 'Updated!' : 'Added!',
          editingId ? 'Offer banner updated successfully.' : 'New offer banner added.',
        );
        closeForm();
        fetchOfferBanners();
      } else {
        const err = await res.json();
        showToast('Failed', err.error || 'Operation could not be completed.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this offer banner? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/offer-banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Offer banner removed successfully.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  const isExpired = (endDate) => endDate && new Date(endDate) < new Date();

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Offer Banners</div>
        <button
          className="action-btn btn-edit"
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
        >
          {showForm ? 'Close' : '+ Add Offer Banner'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">{editingId ? 'E' : 'O'}</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Offer Banner' : 'Add New Offer Banner'}
              </div>
              <div className="km-form-header-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              {/* Title */}
              <div className="km-field">
                <label className="km-label">Offer Title *</label>
                <input
                  className="km-input" type="text" required
                  placeholder="e.g. Flash Sale "
                  value={formData.title} onChange={set('title')}
                />
              </div>

              {/* Title Color */}
              <div className="km-field">
                <label className="km-label">Title Color *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={formData.titleColor}
                    onChange={set('titleColor')}
                    style={{ width: 44, height: 36, padding: 2, borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
                  />
                  <input
                    className="km-input" type="text" required
                    placeholder="#ffffff"
                    value={formData.titleColor} onChange={set('titleColor')}
                    style={{ flex: 1 }}
                  />
                  <span style={{
                    fontWeight: 700, fontSize: 15,
                    color: formData.titleColor,
                    background: '#222', padding: '4px 10px',
                    borderRadius: 4, whiteSpace: 'nowrap', border: '1px solid #444',
                  }}>
                    Preview
                  </span>
                </div>
              </div>

              {/* Subtitle */}
              <div className="km-field">
                <label className="km-label">Subtitle *</label>
                <input
                  className="km-input" type="text" required
                  placeholder="e.g. Limited time only"
                  value={formData.subtitle} onChange={set('subtitle')}
                />
              </div>

              {/* CTA Button Label */}
              <div className="km-field km-field-full">
                <label className="km-label">CTA Button Label *</label>
                <input
                  className="km-input" type="text" required
                  placeholder="e.g. Shop Now "
                  value={formData.content} onChange={set('content')}
                />
              </div>

              {/* Brand Tag */}
              <div className="km-field">
                <label className="km-label">Brand Tag *</label>
                <input
                  className="km-input" type="text" required
                  placeholder="e.g. Nike, Apple, Exclusive"
                  value={formData.brandTag} onChange={set('brandTag')}
                />
              </div>

              {/* Discount Label */}
              <div className="km-field">
                <label className="km-label">Discount Label *</label>
                <input
                  className="km-input" type="text" required
                  placeholder="e.g. Upto 50% OFF"
                  value={formData.discountLabel} onChange={set('discountLabel')}
                />
              </div>

              {/* Discount Color */}
              <div className="km-field">
                <label className="km-label">Discount Color *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="color"
                    value={formData.discountColor}
                    onChange={set('discountColor')}
                    style={{ width: 44, height: 36, padding: 2, borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer' }}
                  />
                  <input
                    className="km-input" type="text" required
                    placeholder="#f5d78e"
                    value={formData.discountColor} onChange={set('discountColor')}
                    style={{ flex: 1 }}
                  />
                  <span style={{
                    fontWeight: 900, fontSize: 22,
                    color: formData.discountColor,
                    background: '#222', padding: '2px 10px',
                    borderRadius: 4, whiteSpace: 'nowrap', border: '1px solid #444',
                  }}>
                    50%
                  </span>
                </div>
              </div>

              {/* Shop URL */}
              <div className="km-field km-field-full">
                <label className="km-label">
                  Shop Button URL *
                  <span style={{ fontWeight: 400, color: '#888', marginLeft: 6, fontSize: 11 }}>
                    (used by the CTA button — overrides Link URL)
                  </span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    className="km-input" type="text" required
                    placeholder="e.g. /shop"
                    value={formData.shopUrl} onChange={set('shopUrl')}
                    style={{ flex: 1 }}
                  />
                  {formData.shopUrl && (
                    <a
                      href={formData.shopUrl} target="_blank" rel="noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: '#0d6efd', color: '#fff',
                        padding: '6px 12px', borderRadius: 4,
                        fontSize: 12, fontWeight: 600,
                        textDecoration: 'none', whiteSpace: 'nowrap',
                        border: '1px solid #0a58ca',
                      }}
                    >
                      ↗ Open URL
                    </a>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div className="km-field">
                <label className="km-label">Start Date *</label>
                <input className="km-input" type="date" required value={formData.startDate} onChange={set('startDate')} />
              </div>

              {/* End Date */}
              <div className="km-field">
                <label className="km-label">End Date *</label>
                <input className="km-input" type="date" required value={formData.endDate} onChange={set('endDate')} />
              </div>

              {/* Status */}
              <div className="km-field">
                <label className="km-label">Status *</label>
                <select className="km-select" required value={formData.status} onChange={set('status')}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Image */}
              <div className="km-field km-field-full">
                <label className="km-label">Banner Image {editingId ? '' : '*'}</label>
                <div className="km-file-zone">
                  <div className="km-file-icon">↑</div>
                  {imageFile
                    ? <p className="km-file-selected">✓ {imageFile.name}</p>
                    : <p className="km-file-label">Click to upload image</p>}
                  <input
                    type="file" accept="image/*" required={!editingId}
                    onChange={e => setImageFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button type="submit" className="km-btn-submit">
                {editingId ? 'Update Offer Banner' : 'Save Offer Banner'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading offer banners...</p>
      ) : (
        <DataTable
          columns={[
            'ID', 'Image', 'Title', 'Title Color', 'Discount Color', 'Subtitle', 'CTA Label',
            'Brand Tag', 'Shop URL', 'Discount', 'Start Date', 'End Date', 'Status', 'Actions',
          ]}
          initialRows={rows}
          renderRow={(row, i) => (
            <tr key={row.id}>
              <td className="td-id">#{i + 1}</td>

              {/* Image */}
              <td>
                <div className="img-thumb">
                  {row.image
                    ? <img src={`${API}/${row.image}`} alt={row.title} width="60" height="36"
                        style={{ objectFit: 'cover', borderRadius: 4 }} />
                    : '🏷️'}
                </div>
              </td>

              <td>{row.title}</td>

              {/* Title Color */}
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    display: 'inline-block', width: 18, height: 18, borderRadius: 3,
                    background: row.titleColor || '#ffffff', border: '1px solid #ccc', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: '#555' }}>{row.titleColor || '#ffffff'}</span>
                </div>
              </td>

              {/* Discount Color */}
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    display: 'inline-block', width: 18, height: 18, borderRadius: 3,
                    background: row.discountColor || '#f5d78e', border: '1px solid #ccc', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: '#555' }}>{row.discountColor || '#f5d78e'}</span>
                </div>
              </td>

              <td>{row.subtitle || '—'}</td>

              {/* CTA Label */}
              <td style={{ maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.content || '—'}
              </td>

              {/* Brand Tag */}
              <td>
                {row.brandTag ? (
                  <span style={{
                    background: '#e8f4fd', color: '#0d6efd',
                    padding: '2px 8px', borderRadius: 4,
                    fontWeight: 600, fontSize: 12, border: '1px solid #b6d4fe',
                  }}>
                    🏷️ {row.brandTag}
                  </span>
                ) : '—'}
              </td>

              {/* Shop URL */}
              <td>
                {row.shopUrl ? (
                  <a href={row.shopUrl} target="_blank" rel="noreferrer" title={row.shopUrl}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: '#0d6efd', color: '#fff',
                      padding: '3px 10px', borderRadius: 4,
                      fontWeight: 600, fontSize: 12,
                      border: '1px solid #0a58ca', textDecoration: 'none',
                    }}
                  >
                    🔗 Shop
                  </a>
                ) : '—'}
              </td>

              {/* Discount */}
              <td>
                {row.discountLabel ? (
                  <span style={{
                    background: '#fff3cd', color: '#856404',
                    padding: '2px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12,
                  }}>
                    {row.discountLabel}
                  </span>
                ) : '—'}
              </td>

              <td>{row.startDate ? row.startDate.slice(0, 10) : '—'}</td>

              {/* End Date */}
              <td>
                {row.endDate ? (
                  <span style={{ color: isExpired(row.endDate) ? '#dc3545' : 'inherit' }}>
                    {row.endDate.slice(0, 10)}{isExpired(row.endDate) && ' ⚠️'}
                  </span>
                ) : '—'}
              </td>

              {/* Status */}
              <td>
                <span className={`status-pill ${pillClass[row.status] || 'pill-active'}`}>
                  {row.status}
                </span>
              </td>

              {/* Actions */}
              <td>
                <div className="action-btns">
                  <button className="action-btn btn-edit" onClick={() => handleEditClick(row)}>Edit</button>
                  <button className="action-btn btn-del"  onClick={() => handleDelete(row.id)}>Delete</button>
                </div>
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
