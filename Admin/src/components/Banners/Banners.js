import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const pillClass = { Active: 'pill-active', Inactive: 'pill-inactive' };

export default function Banners({ showToast }) {
  const [rows, setRows]           = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState({
    title: '',
    subtitle: '',
    content: '',
    link: '',
    sortOrder: 1,
    status: 'Active',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = () => {
    fetch(`${API}/banners`)
      .then(r => r.json())
      .then(data => { setRows(data); })
      .catch(() => { showToast('Load Failed', 'Could not load banners.'); });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', subtitle: '', content: '', link: '', sortOrder: 1, status: 'Active' });
    setImageFile(null);
  };

  const handleEditClick = (banner) => {
    setEditingId(banner.id);
    setFormData({
      title:     banner.title     || '',
      subtitle:  banner.subtitle  || '',
      content:   banner.content   || '',
      link:      banner.link      || '',
      sortOrder: banner.sortOrder || 1,
      status:    banner.status    || 'Active',
    });
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title',     formData.title);
    data.append('subtitle',  formData.subtitle);
    data.append('content',   formData.content);
    data.append('link',      formData.link);
    data.append('sortOrder', formData.sortOrder);
    data.append('status',    formData.status);
    // Image mandatory only while adding
if (!editingId && !imageFile) {
  return showToast('Image Required', 'Please upload a banner image.');
}

if (imageFile) {
  data.append('image', imageFile);
}

    const method = editingId ? 'PUT' : 'POST';
    const url    = editingId ? `${API}/banners/update/${editingId}` : `${API}/banners/add`;

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showToast(editingId ? 'Updated!' : 'Added!',
                  editingId ? 'Banner updated successfully.' : 'New banner added.');
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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this banner? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Banner removed successfully.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Banners</div>
        <button
          className="action-btn btn-edit"
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
        >
          {showForm ? 'Close' : '+ Add Banner'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">{editingId ? 'E' : 'B'}</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Banner' : 'Add New Banner'}
              </div>
              <div className="km-form-header-sub">Fill in the details below</div>
            </div>
          </div>

          <div className="km-form-body">
            <form className="km-form-grid" onSubmit={handleSubmit}>

              <div className="km-field">
                <label className="km-label">Banner Title</label>
                <input
                  className="km-input" type="text"
                  placeholder="e.g. Summer Sale"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Subtitle</label>
                <input
                  className="km-input" type="text"
                  placeholder="Up to 50% off everything"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div className="km-field km-field-full">
                <label className="km-label">Content</label>
                <textarea
                  className="km-input"
                  rows={3}
                  placeholder="e.g. Shop our biggest sale of the year..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Link URL</label>
                <input
                  className="km-input" type="text"
                  placeholder="e.g. /sale or https://..."
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="km-field">
                <label className="km-label">Sort Order</label>
                <input
                  className="km-input" type="number" min="1"
                  placeholder="e.g. 1"
                  value={formData.sortOrder}
                  onChange={e => setFormData({ ...formData, sortOrder: e.target.value })}
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

              <div className="km-field km-field-full">
                <label className="km-label">
  Banner Image <span style={{ color: 'red' }}>*</span>
</label>
                <div className="km-file-zone">
                  <div className="km-file-icon">↑</div>
                  {imageFile
                    ? <p className="km-file-selected">✓ {imageFile.name}</p>
                    : <p className="km-file-label">Click to upload image</p>}
                  <input
  type="file"
  accept="image/*"
  required={!editingId}
  onChange={e => setImageFile(e.target.files[0])}
/>
                </div>
              </div>

              <button type="submit" className="km-btn-submit">
                {editingId ? 'Update Banner' : 'Save Banner'}
              </button>
            </form>
          </div>
        </div>
      )}

      <DataTable
        columns={['ID', 'Image', 'Title', 'Subtitle', 'Content', 'Sort Order', 'Link', 'Status', 'Actions']}
        initialRows={rows}
        renderRow={(row, i) => (
          <tr key={row.id}>
            <td className="td-id">#{i + 1}</td>
            <td>
              <div className="img-thumb">
                {row.image
                  ? <img src={`${API}/${row.image}`} alt={row.title}
                      width="60" height="36"
                      style={{ objectFit: 'cover', borderRadius: 4 }} />
                  : '🖼️'}
              </div>
            </td>
            <td>{row.title || '—'}</td>
            <td>{row.subtitle || '—'}</td>
            <td style={{ maxWidth: 200, whiteSpace: 'nowrap',
                         overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.content || '—'}
            </td>
            <td>{row.sortOrder ?? '—'}</td>
            <td>
              {row.link
                ? <a href={row.link} target="_blank" rel="noreferrer"
                     style={{ color: '#4f7cf7' }}>{row.link}</a>
                : '—'}
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
        )}
      />
    </div>
  );
}