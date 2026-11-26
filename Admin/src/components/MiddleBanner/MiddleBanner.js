import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../api';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

export default function MiddleBanner({ showToast }) {
  const [rows, setRows]               = useState([]);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all' | 'new_arrivals' | 'best_sellers'
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState({
    link: '/shop',
    status: 'Active',
    position: 'new_arrivals',
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
    setFormData({ link: '/shop', status: 'Active', position: 'new_arrivals' });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const openAddForm = (pos = 'new_arrivals') => {
    setEditingId(null);
    setFormData({ link: '/shop', status: 'Active', position: pos });
    setImageFile(null);
    setPreviewUrl(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = (banner) => {
    setEditingId(banner.id);
    setFormData({
      link: banner.link || '/shop',
      status: banner.status || 'Active',
      position: banner.position || 'new_arrivals',
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
    data.append('position', formData.position || 'new_arrivals');

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
      const data = new FormData();
      data.append('status', newStatus);
      const res = await fetch(`${API}/middle-banners/update/${banner.id}`, {
        method: 'PUT',
        body: data,
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

  const handleTogglePosition = async (banner) => {
    const newPos = banner.position === 'best_sellers' ? 'new_arrivals' : 'best_sellers';
    const label = newPos === 'best_sellers' ? 'Above Best Sellers' : 'Above New Arrivals';
    try {
      const data = new FormData();
      data.append('position', newPos);
      const res = await fetch(`${API}/middle-banners/update/${banner.id}`, {
        method: 'PUT',
        body: data,
      });
      if (res.ok) {
        showToast('Placement Switched', `Banner moved to "${label}".`);
        fetchBanners();
      } else {
        showToast('Failed', 'Could not update placement.');
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

  // Filtered rows for the DataTable
  const displayedRows = selectedTab === 'all'
    ? rows
    : rows.filter(r => (r.position || 'new_arrivals') === selectedTab);

  const newArrivalsCount = rows.filter(r => (r.position || 'new_arrivals') === 'new_arrivals').length;
  const bestSellersCount = rows.filter(r => r.position === 'best_sellers').length;

  const activeNewArrivalsBanner = rows.find(r => (r.position || 'new_arrivals') === 'new_arrivals' && r.status === 'Active');
  const activeBestSellersBanner = rows.find(r => r.position === 'best_sellers' && r.status === 'Active');

  return (
    <div className="banners-page">
      {/* Header with Title and Dedicated Quick-Add Buttons */}
      <div className="section-header" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: '#fff', fontWeight: 600 }}>Middle Banners Management</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8899a6' }}>
            Manage homepage promotional banners for both <strong>Above New Arrivals</strong> and <strong>Above Best Sellers</strong> sections.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openAddForm('new_arrivals')}
            style={{
              background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>✨</span> + Add New Arrivals Banner
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openAddForm('best_sellers')}
            style={{
              background: 'linear-gradient(135deg, #e67e22, #f39c12)',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>⭐</span> + Add Best Sellers Banner
          </button>
        </div>
      </div>

      {/* Live Homepage Sections Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Section 1 Card */}
        <div style={{
          background: '#1a2332',
          border: '1px solid rgba(108, 92, 231, 0.4)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <strong style={{ color: '#a29bfe', fontSize: 14 }}>Section 1: Above New Arrivals</strong>
            </div>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 999,
              background: activeNewArrivalsBanner ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.2)',
              color: activeNewArrivalsBanner ? '#00b894' : '#ff7675',
              fontWeight: 600,
            }}>
              {activeNewArrivalsBanner ? '● Live on Site' : '○ No Active Banner'}
            </span>
          </div>

          <div style={{
            background: '#0e1726',
            borderRadius: 8,
            overflow: 'hidden',
            minHeight: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #243447',
          }}>
            {activeNewArrivalsBanner ? (
              <img
                src={getImageUrl(activeNewArrivalsBanner.image)}
                alt="New Arrivals Banner"
                style={{ width: '100%', maxHeight: 110, objectFit: 'contain' }}
              />
            ) : (
              <span style={{ color: '#636e72', fontSize: 12 }}>No active banner for New Arrivals</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            {activeNewArrivalsBanner ? (
              <button
                type="button"
                onClick={() => handleEditClick(activeNewArrivalsBanner)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px solid #6c5ce7',
                  background: 'rgba(108, 92, 231, 0.15)',
                  color: '#a29bfe',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✏️ Edit Live Banner
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAddForm('new_arrivals')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px dashed #6c5ce7',
                  background: 'transparent',
                  color: '#a29bfe',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Banner
              </button>
            )}
          </div>
        </div>

        {/* Section 2 Card */}
        <div style={{
          background: '#1a2332',
          border: '1px solid rgba(230, 126, 34, 0.4)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>⭐</span>
              <strong style={{ color: '#f39c12', fontSize: 14 }}>Section 2: Above Best Sellers</strong>
            </div>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 999,
              background: activeBestSellersBanner ? 'rgba(0,184,148,0.2)' : 'rgba(255,107,107,0.2)',
              color: activeBestSellersBanner ? '#00b894' : '#ff7675',
              fontWeight: 600,
            }}>
              {activeBestSellersBanner ? '● Live on Site' : '○ No Active Banner'}
            </span>
          </div>

          <div style={{
            background: '#0e1726',
            borderRadius: 8,
            overflow: 'hidden',
            minHeight: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #243447',
          }}>
            {activeBestSellersBanner ? (
              <img
                src={getImageUrl(activeBestSellersBanner.image)}
                alt="Best Sellers Banner"
                style={{ width: '100%', maxHeight: 110, objectFit: 'contain' }}
              />
            ) : (
              <span style={{ color: '#636e72', fontSize: 12 }}>No active banner for Best Sellers</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
            {activeBestSellersBanner ? (
              <button
                type="button"
                onClick={() => handleEditClick(activeBestSellersBanner)}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px solid #e67e22',
                  background: 'rgba(230, 126, 34, 0.15)',
                  color: '#f39c12',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✏️ Edit Live Banner
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAddForm('best_sellers')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px dashed #e67e22',
                  background: 'transparent',
                  color: '#f39c12',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Banner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Form */}
      {showForm && (
        <div className="km-modal-backdrop">
          <div className="km-modal-card" style={{ maxWidth: 640 }}>
            <div className="km-modal-header">
              <h3 className="km-modal-title">
                {editingId ? 'Edit Middle Banner' : 'Add New Middle Banner'}
              </h3>
              <button className="km-modal-close" onClick={closeForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="km-form-grid">
              {/* Prominent Placement Selection (Large Clickable Option Cards) */}
              <div className="km-field-full">
                <label className="km-label" style={{ marginBottom: 8, display: 'block' }}>
                  Choose Homepage Section Placement <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Card 1: New Arrivals */}
                  <div
                    onClick={() => setFormData({ ...formData, position: 'new_arrivals' })}
                    style={{
                      cursor: 'pointer',
                      border: formData.position === 'new_arrivals' ? '2px solid #6c5ce7' : '1px solid #243447',
                      background: formData.position === 'new_arrivals' ? 'rgba(108, 92, 231, 0.15)' : '#0e1726',
                      borderRadius: 10,
                      padding: '12px 14px',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.position === 'new_arrivals' ? '0 0 12px rgba(108, 92, 231, 0.4)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ color: '#a29bfe', fontSize: 13 }}>✨ Above New Arrivals</strong>
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: formData.position === 'new_arrivals' ? '5px solid #6c5ce7' : '2px solid #576574',
                        background: '#fff',
                        display: 'inline-block',
                      }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#8899a6' }}>
                      Appears between Collections &amp; New Arrivals
                    </p>
                  </div>

                  {/* Card 2: Best Sellers */}
                  <div
                    onClick={() => setFormData({ ...formData, position: 'best_sellers' })}
                    style={{
                      cursor: 'pointer',
                      border: formData.position === 'best_sellers' ? '2px solid #e67e22' : '1px solid #243447',
                      background: formData.position === 'best_sellers' ? 'rgba(230, 126, 34, 0.15)' : '#0e1726',
                      borderRadius: 10,
                      padding: '12px 14px',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.position === 'best_sellers' ? '0 0 12px rgba(230, 126, 34, 0.4)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ color: '#f39c12', fontSize: 13 }}>⭐ Above Best Sellers</strong>
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: formData.position === 'best_sellers' ? '5px solid #e67e22' : '2px solid #576574',
                        background: '#fff',
                        display: 'inline-block',
                      }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#8899a6' }}>
                      Appears between New Arrivals &amp; Best Sellers
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner Image file upload zone */}
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
                <label className="km-label">Target Link (optional redirect)</label>
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
                  {editingId ? 'Update Banner' : 'Upload Banner'}
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

      {/* Filter Tabs for Section Filtering */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        borderBottom: '1px solid #243447',
        paddingBottom: 8,
      }}>
        <button
          type="button"
          onClick={() => setSelectedTab('all')}
          style={{
            padding: '7px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: selectedTab === 'all' ? '#243447' : 'transparent',
            color: selectedTab === 'all' ? '#fff' : '#8899a6',
          }}
        >
          All Banners ({rows.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('new_arrivals')}
          style={{
            padding: '7px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: selectedTab === 'new_arrivals' ? 'rgba(108, 92, 231, 0.25)' : 'transparent',
            color: selectedTab === 'new_arrivals' ? '#a29bfe' : '#8899a6',
          }}
        >
          ✨ Above New Arrivals ({newArrivalsCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('best_sellers')}
          style={{
            padding: '7px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            background: selectedTab === 'best_sellers' ? 'rgba(230, 126, 34, 0.25)' : 'transparent',
            color: selectedTab === 'best_sellers' ? '#f39c12' : '#8899a6',
          }}
        >
          ⭐ Above Best Sellers ({bestSellersCount})
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={['#', 'Banner Image', 'Placement Section', 'Target Link', 'Status', 'Actions']}
        initialRows={displayedRows}
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
            <td>
              <button
                type="button"
                onClick={() => handleTogglePosition(row)}
                title="Click to switch between Above New Arrivals and Above Best Sellers"
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: row.position === 'best_sellers' ? 'rgba(230, 126, 34, 0.18)' : 'rgba(108, 92, 231, 0.18)',
                  color: row.position === 'best_sellers' ? '#ff9f43' : '#a29bfe',
                  border: row.position === 'best_sellers' ? '1px solid rgba(230, 126, 34, 0.4)' : '1px solid rgba(108, 92, 231, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                {row.position === 'best_sellers' ? '⭐ Above Best Sellers' : '✨ Above New Arrivals'}
                <span style={{ fontSize: 10, opacity: 0.7 }}>⇄</span>
              </button>
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
