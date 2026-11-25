import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../api';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

export default function MiddleBanner({ showToast }) {
  const [rows, setRows]           = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState({
    link: '/shop',
    status: 'Active',
  });
  const [imageFile, setImageFile]     = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = () => {
    fetch(`${API}/middle-banners?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        showToast('Load Failed', 'Could not load middle banners.');
      });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ link: '/shop', status: 'Active' });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleEditClick = (banner) => {
    setEditingId(banner.id);
    setFormData({
      link: banner.link || '/shop',
      status: banner.status || 'Active',
    });
    setImageFile(null);
    setPreviewUrl(getImageUrl(banner.image));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !imageFile) {
      return showToast('Image Required', 'Please upload a banner image.');
    }

    const data = new FormData();
    data.append('link', formData.link || '/shop');
    data.append('status', formData.status || 'Active');

    if (imageFile) {
      data.append('image', imageFile);
    }

    const method = editingId ? 'PUT' : 'POST';
    const url    = editingId ? `${API}/middle-banners/update/${editingId}` : `${API}/middle-banners/add`;

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(
          editingId ? 'Updated!' : 'Added!',
          editingId ? 'Middle banner updated successfully.' : 'New middle banner added.'
        );
        closeForm();
        fetchBanners();
      } else {
        const err = await res.json();
        showToast('Failed', err.error || 'Operation could not be completed.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${API}/middle-banners/update/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast('Status Updated', `Banner is now ${newStatus}.`);
        fetchBanners();
      } else {
        showToast('Failed', 'Could not update status.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong.');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this middle banner? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/middle-banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Deleted!', 'Banner deleted successfully.');
        fetchBanners();
      } else {
        showToast('Failed', 'Could not delete banner.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong.');
    }
  };

  return (
    <div className="banners-page">
      <div className="section-header">
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: '#fff', fontWeight: 600 }}>Middle Banner Management</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8899a6' }}>
            Upload middle banner image displayed between Collections and New Arrivals on homepage.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            if (showForm) closeForm();
            else {
              closeForm();
              setShowForm(true);
            }
          }}
        >
          {showForm ? '✕ Close Form' : '+ Add Banner'}
        </button>
      </div>

      {showForm && (
        <div className="km-modal-backdrop">
          <div className="km-modal-card" style={{ maxWidth: 600 }}>
            <div className="km-modal-header">
              <h3 className="km-modal-title">
                {editingId ? 'Edit Middle Banner Image' : 'Upload Middle Banner Image'}
              </h3>
              <button className="km-modal-close" onClick={closeForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="km-form-grid">
              {/* Image upload field ONLY (No name/title fields) */}
              <div className="km-field km-field-full">
                <label className="km-label">
                  Banner Image <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <div
                  className="km-file-zone"
                  style={{
                    border: '2px dashed #3a4b63',
                    borderRadius: 10,
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: '#0e1726',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                  {imageFile ? (
                    <p style={{ color: '#00b894', fontWeight: 600, margin: '4px 0' }}>✓ {imageFile.name}</p>
                  ) : previewUrl ? (
                    <p style={{ color: '#8899a6', margin: '4px 0' }}>Click or drop to replace image</p>
                  ) : (
                    <p style={{ color: '#8899a6', margin: '4px 0' }}>Click to select banner image (JPG, PNG, WEBP)</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingId && !previewUrl}
                    onChange={handleImageChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>

                {previewUrl && (
                  <div style={{ marginTop: 14, textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#8899a6', marginBottom: 6 }}>Banner Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 180,
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        border: '1px solid #243447',
                        objectFit: 'contain',
                        backgroundColor: '#1a2332',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status and Optional Link */}
              <div className="km-field">
                <label className="km-label">Link (optional redirect)</label>
                <input
                  className="km-input"
                  type="text"
                  placeholder="/shop"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Status</label>
                <select
                  className="km-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="km-field-full" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" className="km-btn-submit" style={{ flex: 1 }}>
                  {editingId ? 'Update Banner Image' : 'Upload Banner'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 6,
                    border: '1px solid #3a4b63',
                    background: '#1a2332',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        columns={['#', 'Banner Image', 'Target Link', 'Status', 'Actions']}
        initialRows={rows}
        renderRow={(row, i) => (
          <tr key={row.id}>
            <td className="td-id">#{i + 1}</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {row.image ? (
                  <img
                    src={getImageUrl(row.image)}
                    alt="Middle Banner"
                    style={{
                      width: 160,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border: '1px solid #243447',
                      backgroundColor: '#1a2332',
                    }}
                  />
                ) : (
                  <span>🖼️ No image</span>
                )}
              </div>
            </td>
            <td style={{ color: '#8899a6' }}>{row.link || '/shop'}</td>
            <td>
              <button
                type="button"
                onClick={() => handleToggleStatus(row)}
                title="Click to toggle status"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span className={pillClass[row.status] || 'pill-inactive'}>
                  {row.status || 'Active'}
                </span>
              </button>
            </td>
            <td>
              <div className="td-actions" style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-edit"
                  onClick={() => handleEditClick(row)}
                  title="Replace / Edit Image"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(row.id)}
                  title="Delete Banner"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
