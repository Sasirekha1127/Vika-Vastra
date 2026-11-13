// src/components/Deliveryzones/Deliveryzones.js
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const DZ_STYLES = `
  /* ── Page ── */
  .dz-page { padding: 24px; background: #F8F6F2; min-height: 100vh; font-family: inherit; }

  /* ── Stats ── */
  .dz-stats { display:flex; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
  .dz-stat {
    background: #fff;
    border-radius: 10px;
    padding: 14px 20px;
    flex: 1;
    min-width: 120px;
    border: 1px solid #E0D9CC;
    border-top: 3px solid #720E1E;
    box-shadow: 0 2px 8px rgba(26,16,64,0.06);
  }
  .dz-stat-val { font-size: 24px; font-weight: 700; color: #720E1E; line-height: 1; }
  .dz-stat-lbl { font-size: 11px; color: #9CA3AF; margin-top: 5px; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .dz-stat-gold .dz-stat-val { color: #C9933A; }
  .dz-stat-gold { border-top-color: #C9933A; }

  /* ── Controls ── */
  .dz-controls { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .dz-search {
    flex: 1; min-width: 180px;
    padding: 9px 14px;
    border: 1px solid #D9CFC0;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    color: #4A4A4A;
    background: #fff;
    transition: border-color .2s;
  }
  .dz-search:focus { border-color: #720E1E; box-shadow: 0 0 0 3px rgba(26,16,64,0.08); }

  .dz-btn-add {
    padding: 9px 20px;
    background: #720E1E;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    transition: background .2s, transform .1s;
  }
  .dz-btn-add:hover { background: #2a1f60; transform: translateY(-1px); }
  .dz-btn-add:active { transform: translateY(0); }
  .dz-btn-add:disabled { opacity: .45; cursor: not-allowed; transform: none; }

  /* ── Filter info ── */
  .dz-filter-info { font-size: 12px; color: #9CA3AF; margin-bottom: 10px; }
  .dz-filter-info strong { color: #4A4A4A; }
  .dz-clear-filter { font-size: 12px; color: #C9933A; cursor: pointer; text-decoration: underline; margin-left: 8px; }

  /* ── Card & Table ── */
  .dz-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #E0D9CC;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(26,16,64,0.07);
  }
  .dz-card-header {
    background: #720E1E;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .dz-card-header-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -.01em;
  }
  .dz-card-header-count {
    font-size: 11px;
    font-weight: 700;
    background: rgba(201,147,58,0.25);
    color: #C9933A;
    padding: 2px 9px;
    border-radius: 20px;
    border: 1px solid rgba(201,147,58,0.4);
  }
  .dz-table { width: 100%; border-collapse: collapse; }
  .dz-table th {
    padding: 11px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #720E1E;
    background: #F5F0E8;
    border-bottom: 1px solid #E0D9CC;
    letter-spacing: .07em;
    text-transform: uppercase;
  }
  .dz-table td {
    padding: 13px 16px;
    font-size: 13px;
    color: #4A4A4A;
    border-bottom: 1px solid #F5F0E8;
    background: #fff;
    vertical-align: middle;
    transition: background .15s;
  }
  .dz-table tbody tr:last-child td { border-bottom: none; }
  .dz-table tbody tr:hover td { background: #FDFAF5; }

  /* ── Badges ── */
  .dz-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .dz-badge-active   { background: #ECFDF5; color: #065F46; }
  .dz-badge-inactive { background: #FFF7ED; color: #9A3412; }

  /* ── Charge ── */
  .dz-charge      { font-size: 13px; font-weight: 700; color: #720E1E; }
  .dz-charge-free { color: #065F46; }

  /* ── Action Buttons ── */
  .dz-act-row { display: flex; gap: 6px; }
  .dz-btn-edit {
    padding: 5px 13px;
    background: #F5F0E8;
    color: #720E1E;
    border: 1px solid #D9CFC0;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s, color .15s;
  }
  .dz-btn-edit:hover { background: #720E1E; color: #fff; border-color: #720E1E; }
  .dz-btn-del {
    padding: 5px 13px;
    background: transparent;
    color: #DC2626;
    border: 1px solid #FECACA;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s;
  }
  .dz-btn-del:hover { background: #FEF2F2; }

  /* ── Empty / Loader ── */
  .dz-empty { text-align: center; padding: 48px 24px; color: #9CA3AF; font-size: 13px; }
  .dz-empty-icon { font-size: 40px; margin-bottom: 10px; }
  .dz-loader { text-align: center; padding: 40px; color: #9CA3AF; font-size: 13px; }

  /* ── Modal Overlay ── */
  .dz-overlay {
    position: fixed; inset: 0;
    background: rgba(26,16,64,0.5);
    z-index: 9998;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    backdrop-filter: blur(2px);
  }
  .dz-modal {
    background: #fff;
    border-radius: 14px;
    width: 100%; max-width: 420px;
    border: 1px solid #E0D9CC;
    overflow: hidden;
    animation: dz-pop .2s ease;
    box-shadow: 0 20px 50px rgba(26,16,64,0.2);
  }
  @keyframes dz-pop { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }

  .dz-modal-hd {
    background: #720E1E;
    padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .dz-modal-title { font-size: 15px; font-weight: 700; color: #fff; }
  .dz-modal-close {
    background: rgba(255,255,255,0.15); border: none;
    color: #fff; font-size: 18px; cursor: pointer;
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    line-height: 1; padding: 0; transition: background .15s;
  }
  .dz-modal-close:hover { background: rgba(255,255,255,0.28); }

  .dz-modal-body { padding: 20px; }
  .dz-modal-field { margin-bottom: 15px; }
  .dz-modal-lbl { font-size: 11px; font-weight: 700; color: #720E1E; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: .05em; }
  .dz-modal-input, .dz-modal-select {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid #D9CFC0;
    border-radius: 8px;
    font-size: 13px; color: #4A4A4A;
    outline: none; box-sizing: border-box;
    font-family: inherit; background: #fff;
    transition: border-color .2s, box-shadow .2s;
  }
  .dz-modal-input:focus, .dz-modal-select:focus {
    border-color: #720E1E;
    box-shadow: 0 0 0 3px rgba(26,16,64,0.08);
  }
  .dz-modal-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%231A1040' viewBox='0 0 256 256'%3E%3Cpath d='M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
    padding-right: 32px;
  }
  .dz-modal-input-readonly { background: #F8F6F2; color: #9CA3AF; cursor: not-allowed; }
  .dz-modal-err { font-size: 12px; color: #DC2626; margin-bottom: 12px; background: #FEF2F2; padding: 8px 12px; border-radius: 6px; border: 1px solid #FECACA; }
  .dz-modal-hint { font-size: 11px; color: #9CA3AF; margin-top: 5px; }

  /* ── Toggle ── */
  .dz-toggle-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .dz-toggle-lbl { font-size: 13px; font-weight: 600; color: #4A4A4A; }
  .dz-switch { position: relative; width: 38px; height: 22px; flex-shrink: 0; }
  .dz-switch input { opacity: 0; width: 0; height: 0; }
  .dz-slider { position: absolute; inset: 0; background: #D9CFC0; border-radius: 20px; cursor: pointer; transition: background .2s; }
  .dz-slider::before { content:''; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
  input:checked + .dz-slider { background: #C9933A; }
  input:checked + .dz-slider::before { transform: translateX(16px); }

  /* ── Modal Footer ── */
  .dz-modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 20px; }
  .dz-btn-cancel {
    padding: 9px 18px; background: #F8F6F2; color: #4A4A4A;
    border: 1px solid #D9CFC0; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: background .15s;
  }
  .dz-btn-cancel:hover { background: #EDE8DE; }
  .dz-btn-save {
    padding: 9px 22px; background: #C9933A; color: #fff;
    border: none; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    transition: background .2s, transform .1s;
    box-shadow: 0 3px 10px rgba(201,147,58,0.3);
  }
  .dz-btn-save:hover { background: #b07e2a; transform: translateY(-1px); }
  .dz-btn-save:active { transform: translateY(0); }
  .dz-btn-save:disabled { opacity: .4; cursor: not-allowed; transform: none; }

  /* ── Confirm Dialog ── */
  .dz-confirm-overlay {
    position: fixed; inset: 0;
    background: rgba(26,16,64,0.5);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    backdrop-filter: blur(2px);
  }
  .dz-confirm-box {
    background: #fff; border-radius: 14px;
    padding: 28px 24px 22px; max-width: 320px; width: 100%;
    border: 1px solid #E0D9CC; text-align: center;
    box-shadow: 0 20px 50px rgba(26,16,64,0.2);
    animation: dz-pop .2s ease;
  }
  .dz-confirm-icon { font-size: 40px; margin-bottom: 12px; }
  .dz-confirm-title { font-size: 16px; font-weight: 700; color: #720E1E; margin-bottom: 6px; }
  .dz-confirm-text { font-size: 13px; color: #9CA3AF; margin-bottom: 20px; }
  .dz-confirm-btns { display: flex; gap: 8px; justify-content: center; }
  .dz-confirm-cancel {
    padding: 9px 20px; background: #F8F6F2; color: #4A4A4A;
    border: 1px solid #D9CFC0; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
  }
  .dz-confirm-delete {
    padding: 9px 20px; background: #FEF2F2; color: #DC2626;
    border: 1px solid #FECACA; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer;
  }
  .dz-confirm-delete:hover { background: #DC2626; color: #fff; }
`;

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ stateName, onConfirm, onCancel }) => (
  <div className="dz-confirm-overlay" onClick={onCancel}>
    <div className="dz-confirm-box" onClick={e => e.stopPropagation()}>
      <div className="dz-confirm-icon">🗑️</div>
      <div className="dz-confirm-title">Delete Zone?</div>
      <div className="dz-confirm-text">"{stateName}" will be removed permanently.</div>
      <div className="dz-confirm-btns">
        <button className="dz-confirm-cancel" onClick={onCancel}>Cancel</button>
        <button className="dz-confirm-delete" onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const EMPTY_FORM = { state: '', charge: '', is_active: true };

const DeliveryZones = ({ showToast }) => {
  const [zones,       setZones]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [formErr,     setFormErr]     = useState('');
  const [saving,      setSaving]      = useState(false);
  const [confirmZone, setConfirmZone] = useState(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/delivery-zones`);
      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
    } catch { setZones([]); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const configuredStates = new Set(zones.map(z => z.state).filter(Boolean));
  const availableToAdd   = INDIAN_STATES.filter(s => !configuredStates.has(s));

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormErr(''); setModal(true); };
  const openEdit   = (zone) => {
    setEditing(zone);
    setForm({ state: zone.state || '', charge: String(zone.charge), is_active: zone.is_active });
    setFormErr(''); setModal(true);
  };
  const closeModal = () => { setModal(false); setFormErr(''); };

  const handleSave = async () => {
    if (!form.state.trim())                                                        { setFormErr('Please select a state.'); return; }
    if (form.charge === '' || isNaN(parseFloat(form.charge)) || parseFloat(form.charge) < 0) { setFormErr('Enter a valid delivery charge (0 or more).'); return; }
    setSaving(true); setFormErr('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url    = editing
        ? `${API_BASE_URL}/delivery-zones/${editing.id}`
        : `${API_BASE_URL}/delivery-zones`;
      const res  = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: form.state.trim(), district: form.state.trim(), charge: parseFloat(form.charge), is_active: form.is_active }),
      });
      const data = await res.json();
      if (!data.success) { setFormErr(data.message || 'Failed to save.'); return; }
      closeModal(); await fetchZones();
      showToast(editing ? 'Zone Updated!' : 'Zone Added!', `"${form.state}" saved successfully.`);
    } catch { setFormErr('Server error. Try again.'); }
    finally  { setSaving(false); }
  };

  const handleDelete  = (zone) => setConfirmZone(zone);
  const confirmDelete = async () => {
    const zone = confirmZone; setConfirmZone(null);
    try {
      const res  = await fetch(`${API_BASE_URL}/delivery-zones/${zone.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setZones(prev => prev.filter(z => z.id !== zone.id)); showToast('Deleted!', `"${zone.state}" removed successfully.`); }
      else { showToast('Delete Failed', 'Could not delete this zone.'); }
    } catch { showToast('Server Error', 'Something went wrong. Try again.'); }
  };

  const filtered    = zones.filter(z => z.state?.toLowerCase().includes(search.toLowerCase()));
  const activeCount = zones.filter(z => z.is_active).length;
  const freeCount   = zones.filter(z => parseFloat(z.charge) === 0).length;
  const avgCharge   = zones.length ? (zones.reduce((s, z) => s + parseFloat(z.charge), 0) / zones.length).toFixed(0) : 0;

  return (
    <div className="dz-page">
      <style>{DZ_STYLES}</style>

      {/* ── Confirm Delete ── */}
      {confirmZone && (
        <ConfirmDialog stateName={confirmZone.state} onConfirm={confirmDelete} onCancel={() => setConfirmZone(null)} />
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="dz-overlay" onClick={closeModal}>
          <div className="dz-modal" onClick={e => e.stopPropagation()}>
            <div className="dz-modal-hd">
              <span className="dz-modal-title">{editing ? 'Edit Delivery Zone' : 'Add Delivery Zone'}</span>
              <button className="dz-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="dz-modal-body">
              <div className="dz-modal-field">
                <label className="dz-modal-lbl">State *</label>
                {editing ? (
                  <input className="dz-modal-input dz-modal-input-readonly" value={form.state} readOnly />
                ) : (
                  <>
                    <select className="dz-modal-select" value={form.state}
                      onChange={e => { setForm(p => ({ ...p, state: e.target.value })); setFormErr(''); }}>
                      <option value="">— Select State —</option>
                      {availableToAdd.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="dz-modal-hint">Only states without an existing zone are listed.</div>
                  </>
                )}
              </div>
              <div className="dz-modal-field">
                <label className="dz-modal-lbl">Delivery Charge (₹) *</label>
                <input className="dz-modal-input" type="number" min="0" step="0.01"
                  placeholder="Enter 0 for free delivery" value={form.charge} autoFocus={!!editing}
                  onChange={e => { setForm(p => ({ ...p, charge: e.target.value })); setFormErr(''); }} />
              </div>
              {formErr && <div className="dz-modal-err">⚠ {formErr}</div>}
              <div className="dz-toggle-row">
                <span className="dz-toggle-lbl">Active</span>
                <label className="dz-switch">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                  <span className="dz-slider" />
                </label>
                <span style={{ fontSize: 12, fontWeight: 600, color: form.is_active ? '#065F46' : '#9A3412' }}>
                  {form.is_active ? 'Visible in checkout' : 'Hidden from checkout'}
                </span>
              </div>
            </div>
            <div className="dz-modal-footer">
              <button className="dz-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="dz-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Zone' : 'Add Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

     
      {/* ── Search + Add ── */}
      <div className="dz-controls">
        <input className="dz-search" placeholder="Search state…" value={search}
          onChange={e => setSearch(e.target.value)} />
        <button className="dz-btn-add" onClick={openCreate}
          disabled={availableToAdd.length === 0}
          title={availableToAdd.length === 0 ? 'All states are already configured' : ''}>
          + Add Zone
        </button>
      </div>

      {search && (
        <div className="dz-filter-info">
          Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for "
          <strong>{search}</strong>"
          <span className="dz-clear-filter" onClick={() => setSearch('')}>✕ Clear</span>
        </div>
      )}

      {/* ── Table ── */}
      <div className="dz-card">
  
        {loading ? (
          <div className="dz-loader">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="dz-empty">
            <div className="dz-empty-icon">📭</div>
            <p>{search ? `No states matching "${search}".` : 'No delivery zones configured yet.'}</p>
          </div>
        ) : (
          <table className="dz-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>State</th>
                <th>Delivery Charge</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((zone, idx) => (
                <tr key={zone.id}>
                  <td style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>{idx + 1}</td>
                  <td><strong style={{ color: '#720E1E' }}>{zone.state}</strong></td>
                  <td>
                    <span className={`dz-charge ${parseFloat(zone.charge) === 0 ? 'dz-charge-free' : ''}`}>
                      {parseFloat(zone.charge) === 0 ? '✓ Free' : `₹${parseFloat(zone.charge).toFixed(2)}`}
                    </span>
                  </td>
                  <td>
                    <span className={`dz-badge ${zone.is_active ? 'dz-badge-active' : 'dz-badge-inactive'}`}>
                      {zone.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="dz-act-row">
                      <button className="dz-btn-edit" onClick={() => openEdit(zone)}>Edit</button>
                      <button className="dz-btn-del"  onClick={() => handleDelete(zone)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeliveryZones;