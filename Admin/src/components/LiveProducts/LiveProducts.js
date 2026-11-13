import { useState, useEffect, useRef } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

const mediaUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  const clean = filePath.replace(/\\/g, '/');
  if (clean.startsWith('uploads/')) {
    return `${API}/uploads/${clean.slice('uploads/'.length)}`;
  }
  return `${API}/${clean}`;
};

// Resolves a display name for a product object regardless of which field
// the backend actually uses for the name/title. Falls back through the
// most common naming conventions before finally falling back to "Product #id".
const productName = (p) => {
  if (!p) return '';
  return (
    p.name ||
    p.title ||
    p.productName ||
    p.product_name ||
    p.productTitle ||
    p.product_title ||
    p.label ||
    (p.Product && (p.Product.name || p.Product.title)) ||
    `Product #${p.id}`
  );
};

export default function LiveProducts({ showToast }) {
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [editingRow, setEditingRow] = useState(null);

  // ── All products for the dropdown ──────────────────────────────
  const [allProducts, setAllProducts]         = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch]     = useState('');

  const [formData, setFormData] = useState({
    title: '', price: '', originalPrice: '', discountPercent: '',
    link: '', sortOrder: 1, status: 'Active', mediaType: 'image',
  });
  const [imageFile, setImageFile]     = useState(null);
  const [videoFile, setVideoFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const videoPreviewRef = useRef(null);

  // ── Fetch live products ─────────────────────────────────────────
  useEffect(() => { fetchItems(); }, []);

  const fetchItems = () => {
    setLoading(true);
    fetch(`${API}/live-products`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => {
        showToast('Load Failed', 'Could not load live products.');
        setLoading(false);
      });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingRow(null);
    setFormData({
      title: '', price: '', originalPrice: '', discountPercent: '',
      link: '', sortOrder: 1, status: 'Active', mediaType: 'image',
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
  };

  const handleEditClick = (row) => {
    setEditingId(row.id);
    setEditingRow(row);
    setFormData({
      title:           row.title           || '',
      price:           row.price           || '',
      originalPrice:   row.originalPrice   || '',
      discountPercent: row.discountPercent  || '',
      link:            row.link            || (row.productId ? `/product/${row.productId}` : ''),
      sortOrder:       row.sortOrder       || 1,
      status:          row.status          || 'Active',
      mediaType:       row.mediaType       || 'image',
    });
    setImageFile(null);
    setVideoFile(null);
    setImagePreview(null);
    setVideoPreview(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ── Check video duration before accepting the file ───────────
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      const duration = probe.duration;
      if (duration > 30) {
        showToast(
          'Video Too Long',
          `Video must be 30 seconds or less (this one is ${Math.round(duration)}s). Please trim it and try again.`
        );
        URL.revokeObjectURL(objectUrl);
        e.target.value = ''; // reset the file input
        return;
      }
      setVideoFile(file);
      setVideoPreview(objectUrl);
    };
    probe.onerror = () => {
      showToast('Invalid Video', 'Could not read this video file. Please choose a different file.');
      URL.revokeObjectURL(objectUrl);
      e.target.value = '';
    };
    probe.src = objectUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Required field validation (every field is mandatory) ────
    if (!formData.title.trim()) {
      showToast('Missing Title', 'Please enter a product title.');
      return;
    }
    if (formData.price === '' || Number(formData.price) <= 0) {
      showToast('Missing Sale Price', 'Please enter a valid sale price.');
      return;
    }
    if (formData.originalPrice === '' || Number(formData.originalPrice) <= 0) {
      showToast('Missing Original Price', 'Please enter the original price.');
      return;
    }
    if (formData.discountPercent === '' || formData.discountPercent === null) {
      showToast('Missing Discount %', 'Please enter a discount percentage.');
      return;
    }
    if (!formData.link || !formData.link.trim()) {
      showToast('Missing Product Link', 'Please enter a product or collection link URL.');
      return;
    }
    if (formData.sortOrder === '' || Number(formData.sortOrder) < 1) {
      showToast('Missing Sort Order', 'Please enter a valid sort order (1 or higher).');
      return;
    }
    if (!imageFile && !(editingRow && editingRow.image)) {
      showToast('Missing Image', 'Please upload a thumbnail image.');
      return;
    }
    if (!videoFile && !(editingRow && editingRow.video)) {
      showToast('Missing Video', 'Please upload a video (max 30 seconds).');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (imageFile) data.append('image', imageFile);
    if (videoFile) data.append('video', videoFile);

    const method = editingId ? 'PUT' : 'POST';
    const url    = editingId
      ? `${API}/live-products/update/${editingId}`
      : `${API}/live-products/add`;

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(
          editingId ? 'Updated!' : 'Added!',
          editingId ? 'Live product updated.' : 'Live product added.'
        );
        closeForm();
        fetchItems();
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
      text: 'Delete this live product? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/live-products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Live product removed.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong.');
    }
  };

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const currentImageSrc = imagePreview || (editingRow ? mediaUrl(editingRow.image) : null);
  const currentVideoSrc = videoPreview || (editingRow ? mediaUrl(editingRow.video) : null);

  return (
    <div>
      <div className="section-header">
        <div className="section-title">What More Live</div>
        <button
          className="action-btn btn-edit"
          onClick={() => showForm ? closeForm() : setShowForm(true)}
        >
          {showForm ? 'Close' : '+ Add Live Product'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">{editingId ? 'E' : 'L'}</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Live Product' : 'Add Live Product'}
              </div>
              <div className="km-form-header-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              {/* Title */}
              <div className="km-field">
                <label className="km-label">Product Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="km-input" type="text" required
                  placeholder="e.g. Rani Pink Banarasi Silk"
                  value={formData.title}
                  onChange={e => set('title', e.target.value)} />
              </div>

              {/* Media Type */}
              <div className="km-field">
                <label className="km-label">Media Type</label>
                <select className="km-select" value={formData.mediaType}
                  onChange={e => set('mediaType', e.target.value)}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {/* Sale Price */}
              <div className="km-field">
                <label className="km-label">Sale Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="km-input" type="number" min="0" step="0.01" required
                  placeholder="e.g. 5200"
                  value={formData.price}
                  onChange={e => set('price', e.target.value)} />
              </div>

              {/* Original Price */}
              <div className="km-field">
                <label className="km-label">Original Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="km-input" type="number" min="0" step="0.01" required
                  placeholder="e.g. 6500"
                  value={formData.originalPrice}
                  onChange={e => set('originalPrice', e.target.value)} />
              </div>

              {/* Discount % */}
              <div className="km-field">
                <label className="km-label">Discount % <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="km-input" type="number" min="0" max="100" required
                  placeholder="e.g. 20"
                  value={formData.discountPercent}
                  onChange={e => set('discountPercent', e.target.value)} />
              </div>

              {/* Sort Order */}
              <div className="km-field">
                <label className="km-label">Sort Order <span style={{ color: '#ef4444' }}>*</span></label>
                <input className="km-input" type="number" min="1" required
                  value={formData.sortOrder}
                  onChange={e => set('sortOrder', e.target.value)} />
              </div>

              {/* Status */}
              <div className="km-field">
                <label className="km-label">Status</label>
                <select className="km-select" value={formData.status}
                  onChange={e => set('status', e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Product Link URL */}
              <div className="km-field km-field-full">
                <label className="km-label">
                  Product Link / URL <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#6366f1', fontWeight: 500 }}>
                    (links "View Product" button to a product or collection page)
                  </span>
                </label>
                <input
                  className="km-input"
                  type="text"
                  required
                  placeholder="e.g. /product/13 or /shop or /collections"
                  value={formData.link}
                  onChange={e => set('link', e.target.value)}
                />
              </div>

              {/* ── Thumbnail Image ── */}
              <div className="km-field km-field-full">
                <label className="km-label">
                  Thumbnail Image <span style={{ color: '#ef4444' }}>*</span>
                  {editingRow?.image && !imageFile && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#888', fontWeight: 400 }}>
                      (current shown below — upload to replace)
                    </span>
                  )}
                </label>

                {currentImageSrc && (
                  <div style={previewStyle}>
                    <img
                      src={currentImageSrc}
                      alt="preview"
                      style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {imageFile && <span style={newBadge}>NEW</span>}
                  </div>
                )}

                <div className="km-file-zone" style={{ marginTop: currentImageSrc ? 8 : 0 }}>
                  <div className="km-file-icon">🖼️</div>
                  {imageFile
                    ? <p className="km-file-selected">✓ {imageFile.name}</p>
                    : <p className="km-file-label">
                        {editingRow?.image ? 'Click to replace image' : 'Click to upload image'}
                      </p>}
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              {/* ── Video File ── */}
              <div className="km-field km-field-full">
                <label className="km-label">
                  Video File <span style={{ color: '#ef4444' }}>*</span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#6366f1', fontWeight: 500 }}>
                    (max 30 seconds)
                  </span>
                  {editingRow?.video && !videoFile && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#888', fontWeight: 400 }}>
                      (current shown below — upload to replace)
                    </span>
                  )}
                  {!editingRow?.video && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#f59e0b', fontWeight: 400 }}>
                      ⚠ No video uploaded yet
                    </span>
                  )}
                </label>

                {currentVideoSrc && (
                  <div style={previewStyle}>
                    <video
                      ref={videoPreviewRef}
                      src={currentVideoSrc}
                      muted loop playsInline controls
                      style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 6 }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {videoFile && <span style={newBadge}>NEW</span>}
                    {!videoFile && editingRow?.video && (
                      <span style={{ ...newBadge, background: '#6b7280' }}>SAVED</span>
                    )}
                  </div>
                )}

                <div className="km-file-zone" style={{ marginTop: currentVideoSrc ? 8 : 0 }}>
                  <div className="km-file-icon">🎬</div>
                  {videoFile
                    ? <p className="km-file-selected">✓ {videoFile.name}</p>
                    : <p className="km-file-label">
                        {editingRow?.video
                          ? 'Click to replace video (mp4, mov, webm — max 30 sec)'
                          : 'Click to upload video (mp4, mov, webm — max 30 sec)'}
                      </p>}
                  <input type="file" accept="video/mp4,video/mov,video/webm,video/avi"
                    onChange={handleVideoChange} />
                </div>
              </div>

              <button type="submit" className="km-btn-submit">
                {editingId ? 'Update Live Product' : 'Save Live Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading live products...</p>
      ) : (
        <DataTable
          columns={['ID', 'Image', 'Video', 'Title', 'Price', 'Original', 'Discount', 'Sort', 'Link URL', 'Status', 'Actions']}
          initialRows={rows}
          renderRow={(row, i) => {
            const displayLink = row.link || (row.productId ? `/product/${row.productId}` : '');
            return (
              <tr key={row.id}>
                <td className="td-id">#{i + 1}</td>

                <td>
                  {row.image ? (
                    <img src={mediaUrl(row.image)} alt={row.title}
                      width="56" height="72"
                      style={{ objectFit: 'cover', borderRadius: 4, display: 'block' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : <span style={{ color: '#ccc', fontSize: 20 }}>—</span>}
                </td>

                <td>
                  {row.video ? (
                    <video src={mediaUrl(row.video)} width="80" height="56"
                      style={{ objectFit: 'cover', borderRadius: 4, display: 'block', cursor: 'pointer' }}
                      muted playsInline
                      onMouseEnter={e => {
                        const vid = e.target;
                        const playPromise = vid.play();
                        if (playPromise !== undefined) {
                          playPromise.catch(() => {}); // ignore AbortError from a quick mouseleave
                        }
                      }}
                      onMouseLeave={e => {
                        const vid = e.target;
                        vid.pause();
                        vid.currentTime = 0;
                      }}
                      title="Hover to preview"
                    />
                  ) : (
                    <span style={{
                      background: '#fef3c7', color: '#92400e',
                      padding: '2px 7px', borderRadius: 4,
                      fontSize: 11, fontWeight: 600,
                    }}>No video</span>
                  )}
                </td>

                <td>{row.title}</td>
                <td>₹{parseFloat(row.price).toLocaleString()}</td>
                <td>{row.originalPrice ? `₹${parseFloat(row.originalPrice).toLocaleString()}` : '—'}</td>
                <td>
                  {row.discountPercent ? (
                    <span style={{
                      background: '#d4edda', color: '#155724',
                      padding: '2px 8px', borderRadius: 4,
                      fontWeight: 600, fontSize: 12,
                    }}>{row.discountPercent}% off</span>
                  ) : '—'}
                </td>
                <td>{row.sortOrder}</td>

                {/* Link URL column */}
                <td>
                  {displayLink ? (
                    <a
                      href={displayLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#eef2ff', color: '#4f46e5',
                        padding: '3px 8px', borderRadius: 4,
                        fontSize: 12, fontWeight: 600,
                        textDecoration: 'none', display: 'inline-block',
                        maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}
                      title={displayLink}
                    >
                      {displayLink}
                    </a>
                  ) : (
                    <span style={{
                      background: '#fef2f2', color: '#ef4444',
                      padding: '2px 7px', borderRadius: 4,
                      fontSize: 11, fontWeight: 600,
                    }}>⚠ No link</span>
                  )}
                </td>

                <td>
                  <span className={`status-pill ${pillClass[row.status] || 'pill-active'}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn btn-edit" onClick={() => handleEditClick(row)}>Edit</button>
                  <button className="action-btn btn-del"  onClick={() => handleDelete(row.id)}>Delete</button>
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const previewStyle = {
  position: 'relative', display: 'inline-block',
  background: '#f3f4f6', borderRadius: 8,
  padding: 8, border: '1px solid #e5e7eb',
};
const newBadge = {
  position: 'absolute', top: 6, right: 6,
  background: '#10b981', color: '#fff',
  fontSize: 10, fontWeight: 700,
  padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5,
};