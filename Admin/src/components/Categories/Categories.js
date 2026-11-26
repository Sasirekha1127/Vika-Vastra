import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const filename = imagePath.replace(/^\//, '').replace(/^uploads\//, '');
  return `${API}/uploads/${filename}`;
};

export default function Categories({ showToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [query, setQuery] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(data => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { showToast('Load Failed', 'Could not load categories.'); setLoading(false); });
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id); setCategoryName(cat.name);
    setDiscountType(cat.discountType || 'none');
    setDiscountValue(cat.discountValue && Number(cat.discountValue) > 0 ? String(cat.discountValue) : '');
    setEmailSubject(`${cat.name} discount - Vika Vastra`);
    setEmailContent(`Save on products in the ${cat.name} category. This discount applies to products belonging to this category.`);
    setImageFile(null); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isApplyingDiscount) return;
    if (!categoryName) { showToast('Missing Name', 'Please enter a category name.'); return; }
    const data = new FormData();
    data.append('name', categoryName);
    data.append('discountType', discountType);
    data.append('discountValue', discountType === 'none' ? '0' : discountValue || '0');
    data.append('emailSubject', emailSubject);
    data.append('emailContent', emailContent);
    if (imageFile) data.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API}/categories/update/${editingId}` : `${API}/categories/add`;
    const applyingDiscount = discountType !== 'none' && Number(discountValue) > 0;
    if (applyingDiscount) setIsApplyingDiscount(true);
    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(editingId ? 'Updated!' : 'Added!', editingId ? 'Category updated successfully.' : 'New category added.');
        resetForm(); fetchCategories();
      } else {
        const error = await res.json().catch(() => ({}));
        showToast('Failed', error.error || 'Operation could not be completed.');
      }
    } catch { showToast('Server Error', 'Something went wrong. Try again.'); }
    finally { if (applyingDiscount) setIsApplyingDiscount(false); }
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setCategoryName(''); setImageFile(null); setDiscountType('none'); setDiscountValue('');
    setEmailSubject(''); setEmailContent('');
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this category? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/categories/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Category removed successfully.');
      }
    } catch { showToast('Delete Failed', 'Could not delete category.'); }
  };

  // ── Drag & Drop Handlers ──
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const saveOrderToBackend = async (newOrder) => {
    setIsSavingOrder(true);
    try {
      const orderedIds = newOrder.map(c => c.id);
      const res = await fetch(`${API}/categories/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      showToast('Order Updated!', 'Category order saved and reflected live on website.');
    } catch (err) {
      showToast('Reorder Failed', 'Could not save category order.');
      fetchCategories();
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || targetIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const updated = [...rows];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, moved);

    setRows(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
    saveOrderToBackend(updated);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= rows.length) return;

    const updated = [...rows];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setRows(updated);
    saveOrderToBackend(updated);
  };

  // Filtered rows for search
  const isFiltered = query.trim().length > 0;
  const displayRows = isFiltered
    ? rows.filter(r => r.name?.toLowerCase().includes(query.toLowerCase()))
    : rows;

  return (
    <div>
      {isApplyingDiscount && (
        <>
          <style>{`@keyframes km-discount-toast-spin { to { transform: rotate(360deg); } }`}</style>
          <div role="status" aria-live="polite" style={{ position: 'fixed', top: 22, right: 24, zIndex: 100000, display: 'flex', alignItems: 'center', gap: 11, padding: '13px 18px', borderRadius: 10, background: '#720E1E', color: '#fff', boxShadow: '0 8px 28px rgba(26,16,64,.28)', fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#C9933A', borderRadius: '50%', animation: 'km-discount-toast-spin .7s linear infinite' }} />
            Applying discount…
          </div>
        </>
      )}
      <div className="section-header">
        <div className="section-title">Categories</div>
        <button className="action-btn btn-edit"
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? 'Close' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">C</div>
            <div>
              <div className="km-form-header-title">{editingId ? 'Edit Category' : 'Add New Category'}</div>
              <div className="km-form-header-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              <div className="km-field km-field-full">
                <label className="km-label">Category Name</label>
                <input className="km-input" type="text" placeholder="e.g. Electronics" required
                  value={categoryName} onChange={e => setCategoryName(e.target.value)} />
              </div>

              <div className="km-field">
                <label className="km-label">Category Discount</label>
                <select className="km-input" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                  <option value="none">No discount</option>
                  <option value="flat">Flat amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              {discountType !== 'none' && (
                <div className="km-field">
                  <label className="km-label">Discount {discountType === 'flat' ? 'Amount (₹)' : 'Percentage (%)'}</label>
                  <input className="km-input" type="number" min="0" max={discountType === 'percentage' ? '100' : undefined}
                    step="0.01" required value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'flat' ? 'e.g. 100' : 'e.g. 10'} />
                </div>
              )}

              {discountType !== 'none' && (
                <>
                  <div className="km-field km-field-full">
                    <label className="km-label">Discount Email Subject</label>
                    <input className="km-input" type="text" value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder={`${categoryName || 'Category'} discount - Vika Vastra`} />
                  </div>
                  <div className="km-field km-field-full">
                    <label className="km-label">Discount Email Message</label>
                    <textarea className="km-input" rows="3" value={emailContent}
                      onChange={e => setEmailContent(e.target.value)}
                      placeholder="Write the message customers will receive with this category offer." />
                    <small className="td-muted">Sent in the branded Vika Vastra offer email when this discount is applied.</small>
                  </div>
                </>
              )}


              <div className="km-field km-field-full">
                <label className="km-label">
                  Category Image {editingId && '(Leave blank to keep current)'}
                </label>
                <div className="km-file-zone">
                  <div className="km-file-icon">↑</div>
                  {imageFile
                    ? <p className="km-file-selected">✓ {imageFile.name}</p>
                    : <p className="km-file-label">Click to upload image</p>}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                </div>
              </div>

              <button type="submit" className="km-btn-submit" disabled={isApplyingDiscount}>
                {editingId ? 'Update Category' : 'Save Category'}
              </button>
              <button type="button" className="km-btn-cancel" onClick={resetForm}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading categories...</p>
      ) : (
        <div style={{
          background: 'var(--km-white)',
          borderRadius: 'var(--km-radius)',
          border: '1px solid var(--km-border)',
          boxShadow: 'var(--km-shadow)',
          overflow: 'hidden',
        }}>
          {/* Controls & Instruction Bar */}
          <div style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            borderBottom: '1px solid var(--km-border)',
            background: 'var(--km-bg)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <input
                className="search-input"
                placeholder="Search categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: 220 }}
              />
              {isFiltered ? (
                <span style={{ fontSize: 12, color: 'var(--km-muted)' }}>
                  🔍 Showing {displayRows.length} of {rows.length} · <strong style={{ color: 'var(--km-orange)' }}>Clear search to drag & drop reorder</strong>
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--km-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>⠿ Drag & drop rows (or use ▲ ▼) to rearrange display order on the website.</span>
                  {isSavingOrder && (
                    <span style={{ color: 'var(--km-orange)', fontWeight: 600 }}>· ⏳ Saving order…</span>
                  )}
                </span>
              )}
            </div>

            <span className="km-count-badge">
              {rows.length} {rows.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>

          {/* Table */}
          <div className="km-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Order</th>
                  <th style={{ width: 80 }}>Image</th>
                  <th>Category Name</th>
                  <th>Discount</th>
                  <th style={{ width: 150 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="km-empty" style={{ textAlign: 'center', padding: 28 }}>
                      {isFiltered ? 'No matching categories found.' : 'No categories found.'}
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row, i) => {
                    const isDragging = draggedIdx === i;
                    const isDragOver = dragOverIdx === i && draggedIdx !== i;

                    return (
                      <tr
                        key={row.id}
                        draggable={!isFiltered}
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, i)}
                        style={{
                          cursor: isFiltered ? 'default' : 'grab',
                          opacity: isDragging ? 0.35 : 1,
                          background: isDragging
                            ? 'var(--km-orange-light)'
                            : isDragOver
                              ? 'var(--km-green-light)'
                              : undefined,
                          borderTop: isDragOver && draggedIdx > i ? '2px solid var(--km-orange)' : undefined,
                          borderBottom: isDragOver && draggedIdx < i ? '2px solid var(--km-orange)' : undefined,
                          transition: 'background 0.15s, opacity 0.15s',
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: isFiltered ? 'transparent' : 'var(--km-blue-xl)',
                                color: isFiltered ? '#bbb' : 'var(--km-blue-mid)',
                                fontSize: 16,
                                cursor: isFiltered ? 'not-allowed' : 'grab',
                                userSelect: 'none',
                                lineHeight: 1,
                              }}
                              title={isFiltered ? 'Clear search to reorder' : 'Click & drag to reorder'}
                            >
                              ⠿
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--km-blue)' }}>
                              #{i + 1}
                            </span>
                            {!isFiltered && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 2 }}>
                                <button
                                  type="button"
                                  disabled={i === 0 || isSavingOrder}
                                  onClick={(e) => { e.stopPropagation(); handleMove(i, -1); }}
                                  title="Move Up"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: i === 0 ? 'default' : 'pointer',
                                    padding: '0 2px',
                                    fontSize: 10,
                                    color: i === 0 ? '#ddd' : 'var(--km-muted)',
                                    lineHeight: 1,
                                  }}
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={i === displayRows.length - 1 || isSavingOrder}
                                  onClick={(e) => { e.stopPropagation(); handleMove(i, 1); }}
                                  title="Move Down"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: i === displayRows.length - 1 ? 'default' : 'pointer',
                                    padding: '0 2px',
                                    fontSize: 10,
                                    color: i === displayRows.length - 1 ? '#ddd' : 'var(--km-muted)',
                                    lineHeight: 1,
                                  }}
                                >
                                  ▼
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="img-thumb">
                            {row.image
                              ? <img src={getImageUrl(row.image)} alt={row.name} width="40" height="40"
                                onError={e => { e.target.src = 'https://via.placeholder.com/40?text=No+Img'; }} />
                              : '🗂️'}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--km-text)' }}>
                            {row.name}
                          </span>
                        </td>

                        <td>{row.discountType === 'flat'
                          ? `₹${Number(row.discountValue || 0).toFixed(2)} off`
                          : row.discountType === 'percentage'
                            ? `${Number(row.discountValue || 0)}% off`
                            : '—'}</td>

                        <td>
                          <div className="action-btns">
                            <button className="action-btn btn-edit" onClick={() => handleEditClick(row)}>Edit</button>
                            <button className="action-btn btn-del" onClick={() => handleDelete(row.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
