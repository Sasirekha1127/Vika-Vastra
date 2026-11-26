import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

export default function InstagramPosts({ showToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    tag: '',

    postUrl: '',
    sortOrder: 1,
    status: 'Active',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API}/instagram-posts/admin`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => { showToast('Load Failed', 'Could not load Instagram posts.'); setLoading(false); });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ label: '', tag: '', postUrl: '', sortOrder: 1, status: 'Active' });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleEditClick = (post) => {
    setEditingId(post.id);
    setFormData({
      label: post.label || '',
      tag: post.tag || '',

      postUrl: post.postUrl || '',
      sortOrder: post.sortOrder || 1,
      status: post.status || 'Active',
    });
    setImageFile(null);
    setPreviewUrl(post.image ? `${API}/${post.image}` : null);
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

    // ── Required field validation (every field is mandatory) ────
    if (!formData.label.trim()) {
      showToast('Missing Label', 'Please enter a label / caption.');
      return;
    }
    if (!formData.tag.trim()) {
      showToast('Missing Tag', 'Please enter a tag.');
      return;
    }
    if (!formData.postUrl.trim()) {
      showToast('Missing Post URL', 'Please enter the Instagram post URL.');
      return;
    }
    if (formData.sortOrder === '' || Number(formData.sortOrder) < 1) {
      showToast('Missing Sort Order', 'Please enter a valid sort order (1 or higher).');
      return;
    }
    if (!imageFile && !previewUrl) {
      showToast('Missing Image', 'Please upload a post image.');
      return;
    }

    const data = new FormData();
    data.append('label', formData.label);
    data.append('tag', formData.tag);

    data.append('postUrl', formData.postUrl);
    data.append('sortOrder', formData.sortOrder);
    data.append('status', formData.status);
    if (imageFile) data.append('image', imageFile);

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${API}/instagram-posts/update/${editingId}`
      : `${API}/instagram-posts/add`;

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(
          editingId ? 'Updated!' : 'Added!',
          editingId ? 'Post updated successfully.' : 'New post added.'
        );
        closeForm();
        fetchPosts();
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
      text: 'Delete this Instagram post? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/instagram-posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Post removed successfully.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Instagram Posts</div>
        <button
          className="action-btn btn-edit"
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
        >
          {showForm ? 'Close' : '+ Add Post'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">{editingId ? 'E' : 'IG'}</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Instagram Post' : 'Add New Instagram Post'}
              </div>
              <div className="km-form-header-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              <div className="km-field">
                <label className="km-label">Label / Caption <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  className="km-input"
                  type="text"
                  placeholder="e.g. Summer Best collection"
                  required
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Tag <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  className="km-input"
                  type="text"
                  placeholder="e.g. #NewArrival"
                  required
                  value={formData.tag}
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                />
              </div>



              <div className="km-field">
                <label className="km-label">Sort Order <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  className="km-input"
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  required
                  value={formData.sortOrder}
                  onChange={e => setFormData({ ...formData, sortOrder: e.target.value })}
                />
              </div>

              <div className="km-field km-field-full">
                <label className="km-label">Instagram Post URL <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  className="km-input"
                  type="text"
                  placeholder="e.g. https://instagram.com/p/..."
                  required
                  value={formData.postUrl}
                  onChange={e => setFormData({ ...formData, postUrl: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Status <span style={{ color: '#ef4444' }}>*</span></label>
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
                <label className="km-label">Post Image <span style={{ color: '#ef4444' }}>*</span></label>
                <div className="km-file-zone">
                  <div className="km-file-icon">↑</div>
                  {imageFile
                    ? <p className="km-file-selected">✓ {imageFile.name}</p>
                    : <p className="km-file-label">Click to upload image</p>}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                {/* Image preview */}
                {previewUrl && (
                  <div style={{ marginTop: 10 }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: 120, height: 120,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="km-btn-submit">
                {editingId ? 'Update Post' : 'Save Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading Instagram posts...</p>
      ) : (
        <DataTable
          columns={['ID', 'Image', 'Label', 'Tag', 'Sort', 'Status', 'Actions']}
          initialRows={rows}
          renderRow={(row, i) => (
            <tr key={row.id}>
              <td className="td-id">#{i + 1}</td>
              <td>
                <div className="img-thumb">
                  {row.image
                    ? <img
                      src={`${API}/${row.image}`}
                      alt={row.label}
                      width="48"
                      height="48"
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                    : '📷'}
                </div>
              </td>
              <td>{row.label}</td>
              <td>
                {row.tag
                  ? <span style={{ background: '#f0f0ff', color: '#5c5cf5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{row.tag}</span>
                  : '—'}
              </td>

              <td>{row.sortOrder ?? '—'}</td>
              <td>
                <span className={`status-pill ${pillClass[row.status] || 'pill-active'}`}>
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