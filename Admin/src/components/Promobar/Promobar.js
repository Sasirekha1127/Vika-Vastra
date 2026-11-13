import { useState, useEffect } from 'react';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function PromoBar({ showToast }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData]   = useState({
    message:  '',
    isActive: true,
  });

  // Multiple messages list
  const [messages, setMessages]       = useState(['']);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => { fetchItems(); }, []);

  // Cycle through messages in preview
  useEffect(() => {
    if (messages.filter(m => m.trim()).length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIndex(i => (i + 1) % messages.filter(m => m.trim()).length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages]);

  const fetchItems = () => {
    setLoading(true);
    fetch(`${API}/promo-bar`)
      .then(r => r.json())
      .then(data => { setRows(data); setLoading(false); })
      .catch(() => {
        showToast('Load Failed', 'Could not load promo bars.');
        setLoading(false);
      });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ message: '', isActive: true });
    setMessages(['']);
    setPreviewIndex(0);
  };

  const handleEditClick = (row) => {
    setEditingId(row.id);
    // Support both single string and pipe-separated multi messages
    const existing = row.message || '';
    const parts    = existing.includes('|')
      ? existing.split('|').map(m => m.trim())
      : [existing];
    setMessages(parts.length ? parts : ['']);
    setFormData({ message: existing, isActive: row.isActive ?? true });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add a new empty message input
  const addMessage = () => setMessages(prev => [...prev, '']);

  // Update a specific message by index
  const updateMessage = (index, value) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // Remove a message by index
  const removeMessage = (index) => {
    setMessages(prev => {
      if (prev.length === 1) return [''];   // always keep at least one field
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty entries, join with pipe separator
    const cleaned = messages.map(m => m.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      showToast('Validation', 'Please enter at least one promo message.');
      return;
    }
    const combinedMessage = cleaned.join(' | ');

    const payload = { message: combinedMessage, isActive: formData.isActive };
    const method  = editingId ? 'PUT' : 'POST';
    const url     = editingId ? `${API}/promo-bar/${editingId}` : `${API}/promo-bar`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(
          editingId ? 'Updated!' : 'Created!',
          editingId ? 'Promo bar updated.' : 'Promo bar created.'
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

  const handleToggle = async (row) => {
    try {
      const res = await fetch(`${API}/promo-bar/${row.id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, isActive: updated.isActive } : r));
        showToast('Updated!', `Promo bar ${updated.isActive ? 'activated' : 'deactivated'}.`);
      }
    } catch {
      showToast('Server Error', 'Something went wrong.');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this promo bar? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/promo-bar/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Promo bar removed.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong.');
    }
  };

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  // Live preview — cycles through filled messages
  const filledMessages  = messages.filter(m => m.trim());
  const previewText     = filledMessages.length > 0
    ? filledMessages[previewIndex % filledMessages.length]
    : 'Your promo message will appear here…';

  const preview = (
    <div style={{
      background:   'linear-gradient(90deg, #F3ECE2 0%, #FAF6EE 50%, #F3ECE2 100%)',
      color:        '#5A0B17',
      borderRadius: 8,
      border:       '1.5px solid rgba(197, 155, 39, 0.4)',
      padding:      '10px 20px',
      fontSize:     13.5,
      fontWeight:   700,
      letterSpacing:'0.12em',
      textTransform:'uppercase',
      fontFamily:   "'Cormorant Garamond', Georgia, serif",
      whiteSpace:   'nowrap',
      overflow:     'hidden',
      textOverflow: 'ellipsis',
      marginBottom: 20,
      minHeight:    42,
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      boxShadow:    '0 2px 8px rgba(60, 5, 12, 0.04)',
    }}>
      {filledMessages.length > 1 && (
        <span style={{
          fontSize:     10.5,
          fontWeight:   600,
          background:   '#5A0B17',
          color:        '#FAF6EE',
          padding:      '2px 8px',
          borderRadius: 20,
          whiteSpace:   'nowrap',
          flexShrink:   0,
          letterSpacing:'0.05em',
        }}>
          {(previewIndex % filledMessages.length) + 1} / {filledMessages.length}
        </span>
      )}
      <span>{previewText}</span>
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Promo Bar</div>
        <button
          className="action-btn btn-edit"
          onClick={() => showForm ? closeForm() : setShowForm(true)}
        >
          {showForm ? 'Close' : '+ Add Promo Bar'}
        </button>
      </div>

      {showForm && (
        <div className="km-form-card">
          <div className="km-form-header">
            <div className="km-form-header-icon">{editingId ? 'E' : 'P'}</div>
            <div>
              <div className="km-form-header-title">
                {editingId ? 'Edit Promo Bar' : 'Add Promo Bar'}
              </div>
              <div className="km-form-header-sub">
                Add one or more scrolling messages
              </div>
            </div>
          </div>

          <div className="km-form-body">

            {/* Live Preview */}
            <div style={{ marginBottom: 4 }}>
              <p style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 500 }}>
                LIVE PREVIEW {filledMessages.length > 1 && '— cycling through messages'}
              </p>
              {preview}
            </div>

            <form className="km-form-grid" onSubmit={handleSubmit}>

              {/* Multiple message inputs */}
              <div className="km-field km-field-full">
                <label className="km-label">
                  Promo Messages <span style={{ color: 'red' }}>*</span>
                  <span style={{ fontWeight: 400, color: '#888', fontSize: 11, marginLeft: 8 }}>
                    (each message scrolls one after another)
                  </span>
                </label>

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display:       'flex',
                      alignItems:    'center',
                      gap:           8,
                      marginBottom:  10,
                    }}
                  >
                    {/* Message number badge */}
                    <span style={{
                      minWidth:      24,
                      height:        24,
                      borderRadius:  '50%',
                      background:    'linear-gradient(45deg, #720E1E, #C9933A)',
                      color:         '#fff',
                      fontSize:      11,
                      fontWeight:    700,
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent:'center',
                      flexShrink:    0,
                    }}>
                      {index + 1}
                    </span>

                    <input
                      className="km-input"
                      type="text"
                      placeholder={`Message ${index + 1} — e.g. Get 10% OFF on orders above ₹999`}
                      value={msg}
                      onChange={e => updateMessage(index, e.target.value)}
                      style={{ flex: 1, marginBottom: 0 }}
                    />

                    {/* Remove button — always show, clears if last one */}
                    <button
                      type="button"
                      onClick={() => removeMessage(index)}
                      title="Remove this message"
                      style={{
                        width:          32,
                        height:         32,
                        border:         '1px solid #f5c6c2',
                        borderRadius:   6,
                        background:     '#fdf3f2',
                        color:          '#c0392b',
                        cursor:         'pointer',
                        fontSize:       18,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        flexShrink:     0,
                        lineHeight:     1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add another message */}
                <button
                  type="button"
                  onClick={addMessage}
                  style={{
                    display:       'flex',
                    alignItems:    'center',
                    gap:           6,
                    marginTop:     4,
                    padding:       '8px 16px',
                    border:        '1px dashed #C9933A',
                    borderRadius:  6,
                    background:    '#fffaf4',
                    color:         '#C9933A',
                    cursor:        'pointer',
                    fontSize:      13,
                    fontWeight:    600,
                    letterSpacing: '0.03em',
                  }}
                >
                  + Add Another Message
                </button>
              </div>

              {/* Status */}
              <div className="km-field">
                <label className="km-label">Status</label>
                <select
                  className="km-select"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={e => set('isActive', e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <button type="submit" className="km-btn-submit">
                {editingId ? 'Update Promo Bar' : 'Save Promo Bar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="km-loading">Loading promo bars...</p>
      ) : (
        <DataTable
          columns={['ID', 'Messages', 'Count', 'Status', 'Actions']}
          initialRows={rows}
          renderRow={(row, i) => {
            // Split stored message back into individual messages
            const parts = (row.message || '').includes('|')
              ? row.message.split('|').map(m => m.trim())
              : [row.message];

            return (
              <tr key={row.id}>
                <td className="td-id">#{i + 1}</td>

                <td style={{ maxWidth: 360 }}>
                  {parts.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          6,
                        marginBottom: i < parts.length - 1 ? 4 : 0,
                      }}
                    >
                      <span style={{
                        minWidth:      18,
                        height:        18,
                        borderRadius:  '50%',
                        background:    'linear-gradient(45deg, #720E1E, #C9933A)',
                        color:         '#fff',
                        fontSize:      9,
                        fontWeight:    700,
                        display:       'inline-flex',
                        alignItems:    'center',
                        justifyContent:'center',
                        flexShrink:    0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 13, wordBreak: 'break-word' }}>{msg}</span>
                    </div>
                  ))}
                </td>

                <td>
                  <span style={{
                    background:   '#f0f4ff',
                    color:        '#3b5bdb',
                    borderRadius: 20,
                    padding:      '3px 10px',
                    fontSize:     12,
                    fontWeight:   600,
                  }}>
                    {parts.length} msg{parts.length > 1 ? 's' : ''}
                  </span>
                </td>

                <td>
                  <span className={`status-pill ${row.isActive ? 'pill-active' : 'pill-inactive'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td>
                  <button
                    className="action-btn"
                    style={{ background: row.isActive ? '#f59e0b' : '#10b981', color: '#fff', marginRight: 4 }}
                    onClick={() => handleToggle(row)}
                  >
                    {row.isActive ? 'Deactivate' : 'Activate'}
                  </button>
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