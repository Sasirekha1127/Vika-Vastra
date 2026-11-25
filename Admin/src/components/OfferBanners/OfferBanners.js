import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  content: 'Shop Now →',
  link: '/shop',
  shopUrl: '/shop',
  status: 'Active',
  startDate: '',
  endDate: '',
};

export default function OfferBanners({ showToast }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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
    setPreviewUrl(null);
  };

  const handleEditClick = (offer) => {
    setEditingId(offer.id);
    setFormData({
      title:     offer.title     || '',
      subtitle:  offer.subtitle  || '',
      content:   offer.content   || 'Shop Now →',
      link:      offer.link || offer.shopUrl || '/shop',
      shopUrl:   offer.shopUrl || offer.link || '/shop',
      status:    offer.status    || 'Active',
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : '',
      endDate:   offer.endDate   ? offer.endDate.slice(0, 10)   : '',
    });
    setImageFile(null);
    setPreviewUrl(offer.image ? `${API}/${offer.image.replace(/^\//, '')}` : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return showToast('Title Required', 'Please enter a title for the offer banner.');
    }
    if (!editingId && !imageFile) {
      return showToast('Image Required', 'Please upload a banner image.');
    }

    const data = new FormData();
    data.append('title',     formData.title);
    data.append('subtitle',  formData.subtitle);
    data.append('content',   formData.content);
    data.append('link',      formData.link || '/shop');
    data.append('shopUrl',   formData.link || '/shop');
    data.append('status',    formData.status);
    if (formData.startDate) data.append('startDate', formData.startDate);
    if (formData.endDate)   data.append('endDate',   formData.endDate);
    if (imageFile)          data.append('image',     imageFile);

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

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Offer Banners (Middle Section)</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Manage the promo banner positioned between Categories and New Arrivals.
          </div>
        </div>
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
              <div className="km-form-header-sub">Upload your middle section promo banner graphic</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              {/* Title */}
              <div className="km-field">
                <label className="km-label">Banner Title *</label>
                <input
                  className="km-input" type="text" required
                  placeholder="e.g. Top Deals"
                  value={formData.title} onChange={set('title')}
                />
              </div>

              {/* Subtitle */}
              <div className="km-field">
                <label className="km-label">Subtitle (Optional)</label>
                <input
                  className="km-input" type="text"
                  placeholder="e.g. Shop Smart, Save More"
                  value={formData.subtitle} onChange={set('subtitle')}
                />
              </div>

              {/* Link / URL */}
              <div className="km-field">
                <label className="km-label">Link / Shop URL</label>
                <input
                  className="km-input" type="text"
                  placeholder="e.g. /shop or https://..."
                  value={formData.link} onChange={set('link')}
                />
              </div>

              {/* Status */}
              <div className="km-field">
                <label className="km-label">Status *</label>
                <select className="km-select" required value={formData.status} onChange={set('status')}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Image Upload */}
              <div className="km-field km-field-full">
                <label className="km-label">Banner Image {editingId ? '(Leave empty to keep existing)' : '*'}</label>
                <div className="km-file-zone">
                  <div className="km-file-icon">↑</div>
                  {imageFile ? (
                    <p className="km-file-selected">✓ {imageFile.name}</p>
                  ) : (
                    <p className="km-file-label">Click to upload banner image (e.g. 980x222 or 1024x275 or 1200x300)</p>
                  )}
                  <input
                    type="file" accept="image/*" required={!editingId && !previewUrl}
                    onChange={handleFileChange}
                  />
                </div>
                {previewUrl && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: 320,
                        maxHeight: 90,
                        borderRadius: 12,
                        objectFit: 'cover',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#666' }}>Banner Preview</span>
                  </div>
                )}
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
            'ID', 'Banner Image', 'Title', 'Subtitle', 'Link URL', 'Status', 'Actions',
          ]}
          initialRows={rows}
          renderRow={(row, i) => (
            <tr key={row.id}>
              <td className="td-id">#{i + 1}</td>

              {/* Image */}
              <td>
                <div className="img-thumb">
                  {row.image ? (
                    <img
                      src={`${API}/${row.image.replace(/^\//, '')}`}
                      alt={row.title}
                      width="120"
                      height="36"
                      style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e8e8e8' }}
                    />
                  ) : (
                    '🏷️'
                  )}
                </div>
              </td>

              <td style={{ fontWeight: 600 }}>{row.title}</td>

              <td>{row.subtitle || '—'}</td>

              {/* Link */}
              <td>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#f4f4f4',
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}>
                  {row.link || row.shopUrl || '/shop'}
                </span>
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
