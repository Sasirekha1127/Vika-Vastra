/**
 * adminApi.js
 * Centralised fetch-based API helpers for the Admin Panel.
 */

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── Generic helpers ────────────────────────────────────────────────────────

const get = async (path) => {
    const response = await fetch(`${BASE}${path}`);
    if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
    return response.json();
};

const send = async (method, path, body) => {
    const options = {
        method,
        headers: {},
    };
    
    if (body instanceof FormData) {
        options.body = body;
    } else {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE}${path}`, options);
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || data.message || `${method} ${path} failed`);
    return data;
};

const del = async (path) => {
    const response = await fetch(`${BASE}${path}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || `DELETE ${path} failed`);
    return data;
};

// ─── Stock API ─────────────────────────────────────────────────────────────────
export const stockApi = {
    getAll: () => get('/stocks'),
    getById: (id) => get(`/stocks/${id}`),
    add: (data) => send('POST', '/stocks/add', data),
    update: (id, data) => send('PUT', `/stocks/update/${id}`, data),
    remove: (id) => del(`/stocks/${id}`),
};

// ─── Banners ─────────────────────────────────────────────────────────────────
export const bannerApi = {
    getAll: () => get('/banners'),
    getById: (id) => get(`/banners/${id}`),
    add: (formData) => send('POST', '/banners/add', formData),
    update: (id, formData) => send('PUT', `/banners/update/${id}`, formData),
    remove: (id) => del(`/banners/${id}`),
};

// ─── Offer Banners ────────────────────────────────────────────────────────────
export const offerBannerApi = {
    getAll: () => get('/offer-banners'),
    getById: (id) => get(`/offer-banners/${id}`),
    add: (formData) => send('POST', '/offer-banners/add', formData),
    update: (id, formData) => send('PUT', `/offer-banners/update/${id}`, formData),
    remove: (id) => del(`/offer-banners/${id}`),
};

// ─── Instagram Posts ──────────────────────────────────────────────────────────
export const instagramApi = {
    getAllPublic: () => get('/instagram-posts'),
    getAllAdmin: () => get('/instagram-posts/admin'),
    getById: (id) => get(`/instagram-posts/${id}`),
    add: (formData) => send('POST', '/instagram-posts/add', formData),
    update: (id, formData) => send('PUT', `/instagram-posts/update/${id}`, formData),
    remove: (id) => del(`/instagram-posts/${id}`),
};

// ─── Live Products ────────────────────────────────────────────────────────────
export const liveProductApi = {
    getAll: () => get('/live-products'),
    getById: (id) => get(`/live-products/${id}`),
    add: (formData) => send('POST', '/live-products/add', formData),
    update: (id, formData) => send('PUT', `/live-products/update/${id}`, formData),
    remove: (id) => del(`/live-products/${id}`),
};

// ─── Brands ───────────────────────────────────────────────────────────────────
export const brandApi = {
    getAll: () => get('/brands'),
    getById: (id) => get(`/brands/${id}`),
    add: (formData) => send('POST', '/brands/add', formData),
    update: (id, formData) => send('PUT', `/brands/update/${id}`, formData),
    remove: (id) => del(`/brands/${id}`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryApi = {
    getAll: () => get('/categories'),
    getById: (id) => get(`/categories/${id}`),
    add: (formData) => send('POST', '/categories/add', formData),
    update: (id, formData) => send('PUT', `/categories/update/${id}`, formData),
    reorder: (orderedIds) => send('PUT', '/categories/reorder', { orderedIds }),
    remove: (id) => del(`/categories/delete/${id}`),
};

// ─── Sub-Categories ───────────────────────────────────────────────────────────
export const subCategoryApi = {
    getAll: () => get('/subcategories'),
    getById: (id) => get(`/subcategories/${id}`),
    add: (formData) => send('POST', '/subcategories/add', formData),
    update: (id, formData) => send('PUT', `/subcategories/update/${id}`, formData),
    remove: (id) => del(`/subcategories/${id}`),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productApi = {
    getAll: () => get('/products'),
    getById: (id) => get(`/products/${id}`),
    add: (formData) => send('POST', '/products/add', formData),
    update: (id, formData) => send('PUT', `/products/update/${id}`, formData),
    remove: (id) => del(`/products/${id}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewApi = {
    getAll: async (includeAdmin = false) => {
        const url = includeAdmin ? `${BASE}/reviews?admin=1` : `${BASE}/reviews`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },
    add: async (data) => {
        const response = await fetch(`${BASE}/reviews/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to add review');
        return result;
    },
    update: async (id, data) => {
        const response = await fetch(`${BASE}/reviews/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update review');
        return result;
    },
    remove: async (id) => {
        const response = await fetch(`${BASE}/reviews/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to delete review');
        return result;
    },
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customerApi = {
    getAll: () => get('/customers'),
    getById: (id) => get(`/customers/${id}`),
    remove: (id) => del(`/customers/${id}`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderApi = {
    getAll: () => get('/orders'),
    getByStatus: (status) => get(`/orders?status=${status}`),
    getById: (id) => get(`/orders/${id}`),
    updateStatus: (id, data) => send('PUT', `/orders/status/${id}`, data),
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const couponApi = {
    getAll: () => get('/coupons'),
    getById: (id) => get(`/coupons/${id}`),
    add: (data) => send('POST', '/coupons/add', data),
    update: (id, data) => send('PUT', `/coupons/update/${id}`, data),
    remove: (id) => del(`/coupons/${id}`),
};

// ─── Delivery Zones ───────────────────────────────────────────────────────────
export const deliveryZoneApi = {
    getAll: () => get('/delivery-zones'),
    getById: (id) => get(`/delivery-zones/${id}`),
    add: (data) => send('POST', '/delivery-zones/add', data),
    update: (id, data) => send('PUT', `/delivery-zones/update/${id}`, data),
    remove: (id) => del(`/delivery-zones/${id}`),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactApi = {
    getAll: () => get('/contacts'),
    getById: (id) => get(`/contacts/${id}`),
    remove: (id) => del(`/contacts/${id}`),
};

// ─── Image URL helper ───────────────────────────────────────────────────────
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    if (cleanPath.startsWith('uploads/')) return `${BASE}/${cleanPath}`;
    return `${BASE}/uploads/${cleanPath}`;
};