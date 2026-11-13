import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // Remove leading slash if present to avoid double slashes
  const clean = imagePath.replace(/^\//, '');
  return `${API}/${clean}`;
}

export default function SubCategories({ showToast }) {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', categoryId: '', status: 'Active' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchAll(); fetchCategories(); }, []);

  const fetchAll = () => {
    setLoading(true);
    fetch(`${API}/subcategories`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => { showToast('Load Failed', 'Could not load sub-categories.'); setLoading(false); });
  };

  const fetchCategories = () => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => showToast('Load Failed', 'Could not load categories.'));
  };

  const handleEditClick = (sub) => {
    setEditingId(sub.id);
    setFormData({ name: sub.name, categoryId: sub.categoryId, status: sub.status || 'Active' });
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('categoryId', formData.categoryId);
    data.append('status', formData.status);
    if (imageFile) data.append('image', imageFile);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${API}/subcategories/update/${editingId}`
      : `${API}/subcategories/add`;
    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(editingId ? 'Updated!' : 'Added!', editingId ? 'Sub-category updated successfully.' : 'New sub-category added.');
        resetForm();
        fetchAll();
      } else {
        showToast('Failed', 'Operation could not be completed.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', categoryId: '', status: 'Active' });
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this sub-category? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/subcategories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Sub-category removed successfully.');
      }
    } catch {
      showToast('Delete Failed', 'Could not delete sub-category.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Sub-Categories</div>
        <button
          className="action-btn btn-edit"
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
        >
          {showForm ? 'Close' : '+ Add Sub-Category'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">S</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Sub-Category' : 'Add Sub-Category'}
              </div>
              <div className="km-form-header-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              <div className="km-field">
                <label className="km-label">Sub-Category Name</label>
                <input
                  className="km-input"
                  type="text"
                  placeholder="e.g. Smart Phones"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Parent Category</label>
                <select
                  className="km-select"
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="km-field km-field-full">
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

              <div className="km-field km-field-full">
                <label className="km-label">Sub-Category Image</label>
                <div className="km-file-zone">
                  {imageFile ? (
                    <>
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', marginBottom: 8 }}
                      />
                      <p className="km-file-selected">✓ {imageFile.name}</p>
                    </>
                  ) : (
                    <>
                      <div className="km-file-icon">↑</div>
                      <p className="km-file-label">Click to upload image</p>
                      <small className="km-file-label">Recommended: 500x500px</small>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                  />
                </div>
              </div>

              <button type="submit" className="km-btn-submit">
                {editingId ? 'Update Sub-Category' : 'Save Sub-Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading...</p>
      ) : (
        <DataTable
          columns={['ID', 'Image', 'Sub-Category', 'Parent Category', 'Status', 'Actions']}
          initialRows={rows}
          renderRow={(row, i) => (
            <tr key={row.id}>
              <td>#{i + 1}</td>
              <td>
                <div className="img-thumb">
                  {row.image ? (
                    <img
                      src={getImageUrl(row.image)}
                      alt={row.name}
                      width="45"
                      height="45"
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span style={{ display: row.image ? 'none' : 'block', fontSize: 24 }}>🗂️</span>
                </div>
              </td>
              <td>{row.name}</td>
              <td>
                <span className="status-pill pill-approved">
                  {row.Category ? row.Category.name : 'No Parent'}
                </span>
              </td>
              <td>
                <span className={`status-pill ${pillClass[row.status] || 'pill-inactive'}`}>
                  {row.status}
                </span>
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