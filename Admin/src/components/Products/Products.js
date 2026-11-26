import { uploadBulkProducts } from "./bulkProducts";
// admin/Products.jsx  —  full replacement
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import DataTable from '../DataTable/DataTable';
import Swal from 'sweetalert2';
import normalizeOptionValues from './normalizeOptionValues';
import syncVariantOptions from './syncVariantOptions';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const KM = {
  orange: '#F15A24', orangeLight: '#FEF0EB',
  blue: '#1A3A6B',   blueLight: '#EEF2F9',
  green: '#39B54A',
  teal: '#00B4D8',
  border: '#E5E7EB',
  text: '#1A1A2E',   muted: '#6B7280', bg: '#F9FAFB',
  red: '#EF4444',    redLight: '#FEF2F2',
};

function stockColor(qty) {
  if (qty > 200) return KM.green;
  if (qty > 50)  return '#F59E0B';
  return '#EF4444';
}

// ── Shared style objects ──────────────────────────────────────────────────────
const formCard   = { background: '#fff', border: `1px solid ${KM.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 };
const formHeader = { background: KM.blue, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10 };
const headerIcon = { width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 600 };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 5 };
const labelStyle = { fontSize: 11, fontWeight: 500, color: KM.muted, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { padding: '9px 12px', border: `1px solid ${KM.border}`, borderRadius: 8, fontSize: 13, color: KM.text, background: '#fff', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' };
const submitBtn  = { gridColumn: 'span 2', padding: 11, background: KM.orange, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 };
const PRODUCT_TABLE_COLUMNS = ['ID', 'Image', 'Product / SKU', 'Brand', 'Price', 'GST', 'Stock', 'Category', 'Actions'];

// ── Initial form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  productName: '', sku: '', categoryId: '', brandId: '',
  shortDescription: '', longDescription: '',
  mrp: '', salesPrice: '', stock: '0', gstType: 'exclusive', gstRate: '0',
  isNewArrival: false, isBestSeller: false,
  variantOptions: [
    { name: 'Color', values: [] },
    { name: 'Size', values: [] },
    { name: 'Age', values: [] },
    { name: 'Metre', values: [] },
  ],
};

function normalizeVariantOptions(product) {
  const presets = [
    { name: 'Color', field: 'colors', values: normalizeOptionValues(product.colors) },
    { name: 'Size', field: 'sizes', values: normalizeOptionValues(product.sizes) },
    { name: 'Age', field: 'ages', values: normalizeOptionValues(product.ages) },
    { name: 'Metre', field: 'metres', values: normalizeOptionValues(product.metres) },
  ];
  const names = [...new Set((product.Variants || []).flatMap(variant => Object.keys(variant.attributes || {}).filter(name => name.toLowerCase() !== 'default')))];
  return presets.filter(option => option.values.length > 0 || product[option.field] == null).map(option => {
    const variantValues = (product.Variants || []).map(variant => Object.entries(variant.attributes || {}).find(([key]) => key.toLowerCase() === option.name.toLowerCase())?.[1]).filter(value => value != null).map(String);
    return { ...option, values: [...new Set([...option.values, ...variantValues].map(value => String(value).trim().toLowerCase()))] };
  }).concat(names.filter(name => !presets.some(option => option.name.toLowerCase() === name.toLowerCase())).map(name => ({
    name,
    values: [...new Set((product.Variants || []).map(variant => variant.attributes?.[name]).filter(value => value != null).map(String))],
  })));
}

function BulkImagePreview({ entry, disabled, onRemove }) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(entry.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.file]);
  return <div className="bulk-image-card">
    <img src={preview || undefined} alt={entry.file.name} />
    <button type="button" disabled={disabled} className="bulk-image-remove" aria-label={`Remove ${entry.file.name}`} onClick={onRemove}>&times;</button>
    <div title={entry.file.name}>{entry.file.name}</div>
  </div>;
}

function VariantImageUpload({ variant, onChange }) {
  const fileInput = useRef(null);
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!variant.imageFile) { setPreview(null); return; }
    const url = URL.createObjectURL(variant.imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [variant.imageFile]);
  const image = preview || resolveImageSrc(variant.image);
  return <div className="variant-image-upload">
    <div className="variant-image-preview">
      <button type="button" className="variant-image-choose" aria-label={image ? 'Change variant image' : 'Upload variant image'} title={image ? 'Change image' : 'Upload image'} onClick={() => fileInput.current?.click()}>
        {image ? <img src={image} alt="Variant preview" /> : <span aria-hidden="true">+</span>}
      </button>
      {image && <button type="button" className="variant-image-remove" aria-label="Remove variant image" title="Remove image" onClick={() => onChange({ image: null, imageFile: null })}>&times;</button>}
    </div>
      <input ref={fileInput} type="file" accept="image/*" aria-label="Variant image" hidden onChange={event => {
        const file = event.target.files?.[0];
        if (file && (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
          Swal.fire('Invalid image', 'Choose an image smaller than 10 MB.', 'error');
        } else if (file) onChange({ imageFile: file });
        event.target.value = '';
      }} />
  </div>;
}

function VariantOptionEditor({ option, onChange, onRemove }) {
  const [draft, setDraft] = useState('');
  const addValue = () => {
    const value = draft.trim();
    if (!value || option.values.some(item => String(item).toLowerCase() === value.toLowerCase())) return;
    onChange({ ...option, values: [...option.values, value] });
    setDraft('');
  };
  return <div className="product-variant-option">
    <input style={inputStyle} aria-label="Option name" placeholder="Option name" value={option.name} onChange={event => onChange({ ...option, name: event.target.value })} />
    <div className="product-variant-values">
      <div className="product-variant-chips">
        {option.values.map(value => <span key={value} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 6, background: '#F3F4F6', padding: '5px 8px', fontSize: 12 }}>{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => onChange({ ...option, values: option.values.filter(item => item !== value) })} style={{ border: 0, background: 'none', color: KM.muted, cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</button></span>)}
      </div>
      <div className="product-variant-add"><input style={inputStyle} aria-label={`Add ${option.name || 'option'} value`} placeholder="Add a value" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addValue(); } }} /><button type="button" className="action-btn btn-edit" onClick={addValue}>Add</button></div>
    </div>
    <button type="button" aria-label={`Remove ${option.name || 'option'}`} title="Remove option" className="action-btn btn-del" onClick={onRemove}>×</button>
  </div>;
}

// ── Helper: resolve image src ─────────────────────────────────────────────────
const resolveImageSrc = (image) => {
  if (!image) return null;
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  const base = (API || '').replace(/\/$/, '');
  return `${base}${image.startsWith('/') ? image : `/${image}`}`;
};

// ── GalleryUploader sub-component ─────────────────────────────────────────────
// Shows existing gallery images (kept / to-be-deleted) + a drag-drop zone for
// new uploads. Calls back with { newFiles, keepIds } on every change.
function GalleryUploader({ existingImages = [], onChange }) {
  // existingImages: [{ id, url }]  — already saved in DB
  const [kept,     setKept]     = useState(existingImages);   // existing images to keep
  const [newFiles, setNewFiles] = useState([]);               // new File objects
  const [previews, setPreviews] = useState([]);               // object-URLs for newFiles
  const inputRef = useRef();

  // When the parent opens edit mode it passes fresh existingImages —
  // reset local state to match.
  useEffect(() => {
    setKept(existingImages);
    setNewFiles([]);
    setPreviews([]);
  }, [JSON.stringify(existingImages)]); // eslint-disable-line

  // Notify parent whenever kept or newFiles changes
  useEffect(() => {
    onChange({ newFiles, keepIds: kept.map(i => i.id) });
  }, [kept, newFiles]); // eslint-disable-line

  const handleFilePick = (files) => {
    const picked = Array.from(files);
    const urls   = picked.map(f => URL.createObjectURL(f));
    setNewFiles(prev => [...prev, ...picked]);
    setPreviews(prev => [...prev, ...urls]);
  };

  const removeExisting = (id) => setKept(prev => prev.filter(i => i.id !== id));
  const removeNew      = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFilePick(e.dataTransfer.files);
  };

  const totalCount = kept.length + newFiles.length;

  return (
    <div>
      {/* Thumbnail grid */}
      {totalCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {/* Existing kept images */}
          {kept.map(img => (
            <div key={img.id} style={{ position: 'relative', width: 64, height: 64 }}>
              <img
                src={resolveImageSrc(img.url)}
                alt=""
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1.5px solid ${KM.border}` }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => removeExisting(img.id)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: KM.red, color: '#fff', border: 'none',
                  fontSize: 10, lineHeight: '18px', textAlign: 'center',
                  cursor: 'pointer', fontWeight: 700, padding: 0,
                }}
              >✕</button>
            </div>
          ))}
          {/* New (unsaved) images */}
          {previews.map((src, idx) => (
            <div key={`new-${idx}`} style={{ position: 'relative', width: 64, height: 64 }}>
              <img
                src={src}
                alt=""
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1.5px dashed ${KM.teal}` }}
              />
              <button
                type="button"
                onClick={() => removeNew(idx)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#888', color: '#fff', border: 'none',
                  fontSize: 10, lineHeight: '18px', textAlign: 'center',
                  cursor: 'pointer', fontWeight: 700, padding: 0,
                }}
              >✕</button>
              {/* "new" badge */}
              <span style={{
                position: 'absolute', bottom: 2, left: 2,
                fontSize: 8, background: KM.teal, color: '#fff',
                borderRadius: 3, padding: '1px 4px', fontWeight: 700,
              }}>NEW</span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${KM.teal}`, borderRadius: 8, padding: 16,
          textAlign: 'center', background: '#F0FAFE', cursor: 'pointer',
          transition: 'background .15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFilePick(e.target.files)}
        />
        <span style={{ color: KM.muted, fontSize: 13 }}>
          {totalCount === 0
            ? '📷  Click or drag images here to add gallery photos'
            : `📷  Add more images  (${totalCount} so far)`}
        </span>
      </div>
      {totalCount > 0 && (
        <p style={{ fontSize: 11, color: KM.muted, marginTop: 4 }}>
          {kept.length} existing · {newFiles.length} new · click ✕ to remove
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function Products({ showToast }) {
  const location = useLocation();

  const [rows,          setRows]          = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [brands,        setBrands]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [editingId,     setEditingId]     = useState(null);
  const [formData,      setFormData]      = useState(EMPTY_FORM);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkImages, setBulkImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [stockEditedAtParent, setStockEditedAtParent] = useState(false);
  const savingRef = useRef(false);
  const bulkInput = useRef(null);
  const [variantRows, setVariantRows] = useState([]);

  // Gallery state managed by GalleryUploader; we hold the callback result here
  const [galleryState,     setGalleryState]     = useState({ newFiles: [], keepIds: [] });
  // Existing gallery images for the product being edited
  const [existingGallery,  setExistingGallery]  = useState([]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/products`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => { try { const r = await fetch(`${API}/categories`); const d = await r.json(); setCategories(Array.isArray(d) ? d : []); } catch { } };
  const fetchBrands     = async () => { try { const r = await fetch(`${API}/brands`);     const d = await r.json(); setBrands(Array.isArray(d) ? d : []); } catch { } };

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setBulkMode(false);
    setBulkImages([]);
    setEditingId(null);
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setVariantRows([]);
    setStockEditedAtParent(false);
    setImageFile(null);
    setImagePreview(null);
    setExistingGallery([]);
    setGalleryState({ newFiles: [], keepIds: [] });
  };

  // ── Open add ──────────────────────────────────────────────────────────────
  const handleAddClick = () => {
    if (showForm) { resetForm(); return; }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Open edit ─────────────────────────────────────────────────────────────
  const handleEditClick = (product) => {
    setStockEditedAtParent(false);
    setBulkMode(false);
    setBulkImages([]);
    product = { ...product, Variants: (product.Variants || []).map(variant => {
      let attributes = variant.attributes;
      if (typeof attributes === 'string') {
        try { attributes = JSON.parse(attributes); } catch { attributes = {}; }
      }
      return { ...variant, attributes: attributes && typeof attributes === 'object' && !Array.isArray(attributes) ? attributes : {} };
    }) };
    setVariantRows((product.Variants || []).map(variant => ({
      ...variant,
      mrp: variant.mrp ?? product.mrp ?? '',
      salesPrice: variant.salesPrice ?? product.salesPrice,
      stock: String(variant.stock ?? 0),
      sku: variant.sku || '',
      attributes: variant.attributes || {},
    })));
    setEditingId(product.id);
    setFormData({
      productName:      product.productName,
      sku:              product.sku || '',
      categoryId:       product.categoryId    || '',
      brandId:          product.brandId       || '',
      shortDescription: product.shortDescription || '',
      longDescription:  product.longDescription  || '',
      mrp:              product.mrp?.toString()       || '',
      salesPrice:       product.salesPrice?.toString() || '',
      gstType: product.gstType || 'exclusive',
      gstRate: product.gstRate?.toString() || '0',
      stock:            product.stock?.toString()      || '0',
      isNewArrival:     !!product.isNewArrival,
      isBestSeller:     !!product.isBestSeller,
      variantOptions: product.Variants?.length
        ? syncVariantOptions(normalizeVariantOptions(product), product.Variants)
        : normalizeVariantOptions(product),
    });
    setImagePreview(product.image || null);
    setImageFile(null);

    // Pre-populate gallery with existing Images association
    const imgs = (product.Images || []).map(img => ({
      id:  img.id,
      url: img.url,
    }));
    setExistingGallery(imgs);
    setGalleryState({ newFiles: [], keepIds: imgs.map(i => i.id) });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (savingRef.current) return;
    if (bulkMode && !bulkImages.length) { showToast("Images required", "Select images for bulk upload."); return; }

    const priceValue = parseFloat(formData.salesPrice || formData.mrp || 0);
    const mrpValue   = parseFloat(formData.mrp || 0);
    const stockValue = parseInt(formData.stock || 0, 10);

    if (!formData.productName.trim())  { showToast('Validation Error', 'Product name is required.');                     return; }
    if (!formData.sku.trim())          { showToast('Validation Error', 'SKU code is required.');                          return; }
    if (!formData.categoryId)          { showToast('Validation Error', 'Please select a category.');                     return; }
    if (mrpValue <= 0 || priceValue <= 0) { showToast('Validation Error', 'MRP and Sale Price must be greater than zero.'); return; }
    if (stockValue < 0)                { showToast('Validation Error', 'Stock cannot be negative.');                     return; }

    const data = new FormData();
    const defaultAttributes = Object.fromEntries(formData.variantOptions.filter(option => option.name.trim() && option.values.length).map(option => [option.name.trim(), option.values]));
    let variantCombinations = editingId
      ? variantRows.map(variant => ({ id: variant.id, sku: variant.sku, mrp: variant.mrp, salesPrice: variant.salesPrice, stock: Number(variant.stock) || 0, isActive: variant.isActive !== false, attributes: variant.attributes, image: variant.image }))
      : variantRows.length
        ? variantRows.map(variant => ({ sku: variant.sku, mrp: variant.mrp, salesPrice: variant.salesPrice, stock: Number(variant.stock) || 0, isActive: variant.isActive !== false, attributes: variant.attributes, image: variant.image }))
      : Object.entries(defaultAttributes).reduce((rows, [name, values]) => rows.flatMap(row => values.map(value => ({ ...row, [name]: value }))), [{}]).map((attributes, index) => ({ sku: index === 0 ? formData.sku : '', mrp: mrpValue, salesPrice: priceValue, stock: stockValue, attributes: Object.keys(attributes).length ? attributes : { Default: 'Standard' } }));
    if (variantCombinations.length && stockEditedAtParent) {
      const activeIndexes = variantCombinations.map((variant, index) => variant.isActive !== false ? index : -1).filter(index => index >= 0);
      if (activeIndexes.length) {
        const firstActiveIndex = activeIndexes[0];
        variantCombinations = variantCombinations.map((variant, index) => {
          if (variant.isActive === false) return variant;
          return { ...variant, stock: index === firstActiveIndex ? stockValue : 0 };
        });
      }
    }
    variantRows.forEach((variant, index) => {
      if (variant.imageFile) data.append(`variantImage_${index}`, variant.imageFile);
    });
    data.append('initialVariant', JSON.stringify({
      productId: editingId || null,
      sku: formData.sku,
      mrp: mrpValue,
      salesPrice: priceValue,
      stock: stockValue,
      variants: variantCombinations,
    }));
    Object.keys(formData).forEach((key) => {
      if (key !== 'variantOptions') data.append(key, formData[key]);
    });
    const optionsByName = Object.fromEntries(formData.variantOptions.map(option => [option.name.trim().toLowerCase(), option.values]));
    Object.entries({ colors: 'color', sizes: 'size', ages: 'age', metres: 'metre' }).forEach(([field, name]) => data.append(field, JSON.stringify(optionsByName[name] || [])));

    // Main image
    if (imageFile) data.append('image', imageFile);

    // Gallery: new files
    galleryState.newFiles.forEach(f => data.append('gallery', f));

    // Gallery: IDs to keep (so backend knows which to delete)
    if (editingId) {
      data.append('keepImageIds', JSON.stringify(galleryState.keepIds));
    }

    const method = editingId ? 'PUT' : 'POST';
    const url    = editingId
      ? `${API}/products/update/${editingId}`
      : `${API}/products/add`;

    if (bulkMode && !editingId) {
      savingRef.current = true;
      setSaving(true);
      setBulkProgress(0);
      try {
        const results = await uploadBulkProducts(data, bulkImages, url, setBulkProgress);
        const failed = results.filter(result => !result.success);
        const count = results.length - failed.length;
        setBulkImages(failed.map(result => result.entry));
        showToast(failed.length ? 'Bulk upload incomplete' : 'Products added!', `${count} products added with the shared details.${failed.length ? ` ${failed.length} failed: ${failed[0].error}. Only failed images remain for retry.` : ''}`);
        if (!failed.length) resetForm();
        await fetchProducts();
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
      return;
    }

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        const result = await res.json();
        if (editingId && Array.isArray(result.variants)) setVariantRows(result.variants);
        showToast(editingId ? 'Updated!' : 'Added!', editingId ? 'Product updated successfully.' : 'New product added.');
        resetForm();
        fetchProducts();
      } else {
        const err = await res.json();
        showToast('Failed', err.error || 'Operation could not be completed.');
      }
    } catch {
      showToast('Server Error', 'Something went wrong. Try again.');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this product? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        showToast('Deleted!', 'Product removed successfully.');
      }
    } catch {
      showToast('Error', 'Could not complete the delete action.');
    }
  }, [showToast]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Section header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="section-title">Products Management</div>
        </div>
        <button className="action-btn btn-edit" disabled={saving} onClick={handleAddClick}>
          {showForm ? 'Close' : '+ Add Product'}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div style={formCard}>
          <div style={formHeader}>
            <div style={headerIcon}>P</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
                Manage product details, inventory, and gallery images
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 24px 28px' }}>
            <form onSubmit={handleSubmit} className="product-form-grid" style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>

              {!editingId && <label style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: KM.bg, borderRadius: 8 }}>
                <input type="checkbox" role="switch" checked={bulkMode} disabled={saving} onChange={event => setBulkMode(event.target.checked)} />
                <span><strong>Bulk upload</strong><small style={{ display: 'block', color: KM.muted }}>One product per image, with shared details and unique SKUs generated from the SKU prefix.</small></span>
              </label>}
              {bulkMode && <div style={{ gridColumn: 'span 2', padding: 16, border: `1px dashed ${KM.teal}`, borderRadius: 8 }}>
                <label style={labelStyle}>Product images (one image per product)</label>
                <button type="button" className="bulk-image-picker" disabled={saving} onClick={() => bulkInput.current?.click()}><strong>+ Choose product images</strong><span>One product per image ? Up to 10 MB each</span></button>
                <input ref={bulkInput} hidden type="file" multiple accept="image/*" disabled={saving} onChange={event => {
                  const files = Array.from(event.target.files || []);
                  if (files.some(file => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
                    showToast('Invalid images', 'Choose images up to 10 MB each.');
                  } else {
                    const batch = Date.now().toString(36);
                    setBulkImages(current => [...current, ...files.filter(file => !current.some(entry => entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified)).map((file, index) => ({ file, suffix: `${batch}-${index + 1}` }))]);
                  }
                  event.target.value = '';
                }} />
                <p style={{ margin: '10px 0', fontSize: 13 }}>{bulkImages.length} images selected - {bulkImages.length} products will be created.</p>
                <div className="bulk-image-grid">{bulkImages.map(entry => <BulkImagePreview key={entry.suffix} entry={entry} disabled={saving} onRemove={() => setBulkImages(current => current.filter(item => item !== entry))} />)}</div>
              </div>}
              {/* Product Name */}
              <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>Product Name *</label>
                <input style={inputStyle} type="text" required value={formData.productName}
                  onChange={e => setFormData({ ...formData, productName: e.target.value })} />
              </div>

              <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>Unique SKU Code *</label>
                <input style={inputStyle} type="text" required maxLength={64}
                  placeholder="e.g. SAREE-0001" value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })} />
              </div>

              {/* Category */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Category *</label>
                <select style={inputStyle} required value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Brand */}
              <div style={fieldStyle}>
                <label style={labelStyle}>Brand</label>
                <select style={inputStyle} value={formData.brandId}
                  onChange={e => setFormData({ ...formData, brandId: e.target.value })}>
                  <option value="">Select Brand (Optional)</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
                </select>
              </div>

              {/* Short Description */}
              <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>Short Description</label>
                <input style={inputStyle} type="text" maxLength={300}
                  placeholder="Brief product summary (max 300 characters)"
                  value={formData.shortDescription}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
                <span style={{ fontSize: 11, color: KM.muted, textAlign: 'right' }}>{formData.shortDescription.length}/300</span>
              </div>

              {/* Long Description */}
              <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>Long Description</label>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Detailed product description, features, usage instructions…"
                  value={formData.longDescription}
                  onChange={e => setFormData({ ...formData, longDescription: e.target.value })} />
              </div>

              {/* Pricing */}
              <div style={fieldStyle}>
                <label style={labelStyle}>MRP *</label>
                <input style={inputStyle} type="number" min="0" step="0.01" required
                  value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Sale Price *</label>
                <input style={inputStyle} type="number" min="0" step="0.01" required
                  value={formData.salesPrice} onChange={e => setFormData({ ...formData, salesPrice: e.target.value })} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>GST Price Type</label>
                <select style={inputStyle} value={formData.gstType} onChange={e => setFormData({ ...formData, gstType: e.target.value })}>
                  <option value="exclusive">GST exclusive (added to price)</option>
                  <option value="inclusive">GST inclusive (included in price)</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>GST Rate (%)</label>
                <input style={inputStyle} type="number" min="0" max="100" step="0.01" value={formData.gstRate} onChange={e => setFormData({ ...formData, gstRate: e.target.value })} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Stock *</label>
                <input style={inputStyle} type="number" min="0" step="1" required
                  value={formData.stock} onChange={e => {
                    const value = e.target.value;
                    setStockEditedAtParent(true);
                    setFormData(current => ({ ...current, stock: value }));
                    if (variantRows.length) {
                      const target = Math.max(0, parseInt(value || 0, 10));
                      setVariantRows(current => {
                        const active = current.map((variant, index) => variant.isActive !== false ? index : -1).filter(index => index >= 0);
                        if (!active.length) return current;
                        return current.map((variant, index) => {
                          if (variant.isActive === false) return variant;
                          return { ...variant, stock: String(index === active[0] ? target : 0) };
                        });
                      });
                    }
                  }} />
              </div>

              <div className="product-variants-section is-open" style={{ ...fieldStyle, gridColumn: 'span 2', border: `1px solid ${KM.border}`, borderRadius: 10, padding: 16, background: '#fff' }}>
                <div className="product-variants-header">
                  <div><div className="product-variants-title">Variants</div><div className="product-variants-description">Add option groups, then generate and edit sellable variants.</div></div>
                  <div className="product-variants-actions"><button type="button" className="action-btn btn-edit" onClick={() => setFormData(current => ({ ...current, variantOptions: [...current.variantOptions, { name: '', values: [] }] }))}>+ Add custom option</button></div>
                </div>
                <div className="product-variants-content">
                <div style={{ display: 'grid', gap: 10 }}>
                  {formData.variantOptions.map((option, optionIndex) => (
                    <VariantOptionEditor key={optionIndex} option={option} onChange={next => setFormData(current => ({ ...current, variantOptions: current.variantOptions.map((item, i) => i === optionIndex ? next : item) }))} onRemove={() => setFormData(current => ({ ...current, variantOptions: current.variantOptions.filter((_, i) => i !== optionIndex) }))} />
                  ))}
                </div>
                <div style={{ marginTop: 12 }}><button type="button" className="action-btn btn-edit" onClick={() => {
                    const options = formData.variantOptions.filter(option => option.name.trim() && option.values.length);
                    const combos = options.reduce((rows, option) => rows.flatMap(row => option.values.map(value => ({ ...row, [option.name.trim()]: value }))), [{}]);
                    const combinationKey = attributes => JSON.stringify(Object.entries(attributes || {}).map(([key, value]) => [key.trim().toLowerCase(), String(value).trim().toLowerCase()]).sort(([a], [b]) => a.localeCompare(b)));
                    const existing = new Map(variantRows.map(row => [combinationKey(row.attributes), row]));
                    const rows = combos.map((attributes, index) => {
                      const match = existing.get(combinationKey(attributes));
                      if (match) return { ...match, attributes };
                      const inherited = variantRows.find(row => Object.keys(row.attributes || {}).every(key => key.toLowerCase() === 'default'));
                      return { ...(inherited || {}), sku: inherited?.sku || (index === 0 ? formData.sku : `${formData.sku}-${index + 1}`), mrp: inherited?.mrp ?? formData.mrp, salesPrice: inherited?.salesPrice ?? formData.salesPrice, stock: inherited?.stock ?? formData.stock, isActive: true, attributes: Object.keys(attributes).length ? attributes : { Default: 'Standard' } };
                    });
                    setVariantRows(rows);
                  }}>Generate variants</button></div>
                {variantRows.length > 0 && <div style={{ marginTop: 14, border: `1px solid ${KM.border}`, borderRadius: 8, overflowX: 'auto' }}>
                  <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, background: KM.bg }}>{variantRows.length} variant{variantRows.length === 1 ? '' : 's'}</div>
                  {variantRows.map((variant, index) => {
                    const rowId = variant.id || `new-${index}`;
                    const summary = Object.entries(variant.attributes || {}).filter(([key]) => key.toLowerCase() !== 'default').map(([key, value]) => `${key}: ${value}`).join(' / ') || 'Default';
                    return <section key={rowId} className="product-variant-card is-open">
                      <div className="product-variant-toggle"><span>{summary}</span></div>
                      <div className="product-variant-panel">
                        <div className="product-variant-row">
                          <VariantImageUpload variant={variant} onChange={changes => setVariantRows(current => current.map((item, i) => i === index ? { ...item, ...changes } : item))} />
                          <label className="product-variant-field"><span>SKU</span><input style={inputStyle} aria-label="Variant SKU" placeholder="SKU" value={variant.sku} onChange={event => setVariantRows(current => current.map((item, i) => i === index ? { ...item, sku: event.target.value } : item))} /></label>
                          <label className="product-variant-field"><span>MRP</span><input style={inputStyle} aria-label="Variant MRP" type="number" min="0" step="0.01" placeholder="MRP" value={variant.mrp ?? ''} onChange={event => setVariantRows(current => current.map((item, i) => i === index ? { ...item, mrp: event.target.value } : item))} /></label>
                          <label className="product-variant-field"><span>Sale price</span><input style={inputStyle} aria-label="Variant sale price" type="number" min="0" step="0.01" placeholder="Sale price" value={variant.salesPrice ?? ''} onChange={event => setVariantRows(current => current.map((item, i) => i === index ? { ...item, salesPrice: event.target.value } : item))} /></label>
                          <label className="product-variant-field"><span>Qty</span><input style={inputStyle} aria-label="Variant quantity" type="number" min="0" placeholder="Qty" value={variant.stock} onChange={event => {
                            const value = event.target.value;
                            setStockEditedAtParent(false);
                            setVariantRows(current => {
                              const updated = current.map((item, i) => i === index ? { ...item, stock: value } : item);
                              const total = updated.reduce((sum, item) => sum + (item.isActive !== false ? Math.max(0, parseInt(item.stock || 0, 10) || 0) : 0), 0);
                              setFormData(form => ({ ...form, stock: String(total) }));
                              return updated;
                            });
                          }} /></label>
                          <button type="button" className="variant-row-remove" title="Remove variant" aria-label="Remove variant" onClick={() => {
                            const remaining = variantRows.filter((_, i) => i !== index);
                            setVariantRows(remaining);
                            setFormData(current => ({ ...current, variantOptions: syncVariantOptions(current.variantOptions, remaining) }));
                          }} style={{ width: 32, height: 32, border: 0, borderRadius: 6, color: KM.red, background: KM.redLight, cursor: 'pointer', fontSize: 19, display: 'grid', placeItems: 'center', lineHeight: 1 }}>X</button>
                        </div>
                      </div>
                    </section>;
                  })}
                  <button type="button" onClick={() => setVariantRows(current => [...current, { sku: `${formData.sku}-${current.length + 1}`, mrp: formData.mrp, salesPrice: formData.salesPrice, stock: formData.stock, isActive: true, attributes: {} }])} style={{ margin: 10, border: 0, background: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 12 }}>+ Add variant row</button>
                </div>}
                <div style={{ fontSize: 11, color: KM.muted, marginTop: 10 }}>Color, Size, Age and Metre are ready to use. Remove any group with × or add a custom option.</div>
                </div>
              </div>

              {/* Flags */}
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 20, padding: '12px 14px', background: KM.orangeLight, borderRadius: 8 }}>
                {[{ key: 'isNewArrival', label: 'New Arrival' }, { key: 'isBestSeller', label: 'Best Seller' }].map(item => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData[item.key]}
                      onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })} />
                    {item.label}
                  </label>
                ))}
              </div>

              {/* ── Main Product Image ──────────────────────────────────────── */}
              {!bulkMode && <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>Main Product Image</label>
                {(imagePreview && !imageFile) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <img src={resolveImageSrc(imagePreview)} alt="Current product" width={56} height={72}
                      onError={e => { e.target.style.display = 'none'; }}
                      style={{ borderRadius: 8, objectFit: 'cover', objectPosition: 'center top', border: `1.5px solid ${KM.border}` }} />
                    <div>
                      <div style={{ fontSize: 11, color: KM.muted }}>Current main image</div>
                      <button type="button" onClick={() => setImagePreview(null)}
                        style={{ marginTop: 3, fontSize: 11, color: KM.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                )}
                <div style={{ border: `1.5px dashed ${KM.teal}`, borderRadius: 8, padding: 18, textAlign: 'center', background: '#F0FAFE', position: 'relative', cursor: 'pointer' }}>
                  <input type="file" accept="image/*"
                    onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(null); } }}
                    style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }} />
                  {imageFile
                    ? <span style={{ color: KM.green, fontWeight: 600 }}>✓ {imageFile.name}</span>
                    : <span style={{ color: KM.muted }}>{imagePreview ? 'Click to replace main image' : 'Click to upload main product image'}</span>}
                </div>
              </div>}

              {/* ── Gallery Images ──────────────────────────────────────────── */}
              {!bulkMode && <div style={{ ...fieldStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>
                  Gallery Images
                  <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, color: KM.teal }}>(shown in image selector on product page)</span>
                </label>
                <GalleryUploader
                  existingImages={existingGallery}
                  onChange={setGalleryState}
                />
              </div>}

              {/* Submit */}
              <button type="submit" disabled={saving} style={{ ...submitBtn, opacity: saving ? 0.6 : 1 }}>
                {saving ? `Saving ${bulkProgress} / ${bulkImages.length} products...` : editingId ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? (
        <p style={{ padding: 20, color: KM.muted }}>Loading products…</p>
      ) : (
        <DataTable
          columns={PRODUCT_TABLE_COLUMNS}
          initialRows={rows}
          memoizeRows
          renderRow={(row, i) => {
            const priceValue     = Number(row.salesPrice || row.mrp || 0);
            const stockValue     = Array.isArray(row.Variants) && row.Variants.length
              ? row.Variants.filter(variant => variant.isActive !== false).reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0)
              : Number(row.stock || 0);
            const hasPricingIssue = priceValue <= 0 || Number(row.mrp || 0) <= 0;
            const galleryCount   = row.Images?.length || 0;

            return (
              <tr key={row.id}>
                <td style={{ color: KM.muted }}>#{i + 1}</td>

                <td>
                  {row.image ? (
                    <img src={resolveImageSrc(row.image)} alt="" width="42" height="54"
                      onError={e => { e.target.style.display = 'none'; }}
                      style={{ borderRadius: 6, objectFit: 'cover', objectPosition: 'center top' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: KM.bg, border: `1px solid ${KM.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: KM.muted }}>📦</div>
                  )}
                </td>

                <td>
                  <div style={{ fontWeight: 600 }}>{row.productName}</div>
                  <div style={{ fontSize: 11, color: KM.teal, marginTop: 2 }}>SKU: {row.sku || '—'}</div>
                  {row.shortDescription && (
                    <div style={{ fontSize: 11, color: KM.muted, marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.shortDescription}</div>
                  )}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {row.isNewArrival  && <span style={{ fontSize: 10, background: '#DCFCE7', color: '#16A34A', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>New</span>}
                    {row.isBestSeller  && <span style={{ fontSize: 10, background: '#FEF9C3', color: '#CA8A04', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>Best Seller</span>}
                    {hasPricingIssue   && <span style={{ fontSize: 10, background: KM.redLight, color: KM.red, borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>⚠ Missing Price</span>}
                    {galleryCount > 0  && <span style={{ fontSize: 10, background: '#E0F2FE', color: '#0369A1', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>🖼 {galleryCount} photo{galleryCount !== 1 ? 's' : ''}</span>}
                  </div>
                </td>

                <td style={{ fontSize: 12, color: KM.teal, fontWeight: 500 }}>{row.Brand?.brandName || '—'}</td>

                <td style={{ fontWeight: 700, color: priceValue === 0 ? KM.red : KM.text }}>
                  {priceValue === 0 ? '⚠ ₹0.00' : `₹${priceValue.toFixed(2)}`}
                </td>

                <td><span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '4px 9px', background: '#EFF6FF', color: '#1D4ED8', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{Number(row.gstRate || 0)}% GST</span></td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: stockValue === 0 ? '#dc2626' : stockColor(stockValue) }} />
                    <span style={{ fontWeight: 700, color: stockValue === 0 ? '#dc2626' : KM.text }}>{stockValue}</span>
                  </div>
                </td>

                <td>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{row.Category?.name || 'N/A'}</div>
                </td>

                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="action-btn btn-edit" disabled={saving} onClick={() => handleEditClick(row)}>Edit</button>
                    <button className="action-btn btn-del"  onClick={() => handleDelete(row.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      )}
    </div>
  );
}
