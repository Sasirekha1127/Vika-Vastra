// src/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', BASE_URL);

const API = axios.create({
    baseURL: `${BASE_URL}`,
});

// =====================
// Products
// =====================
export const getAllProducts      = ()             => API.get('/products');
export const addProduct         = (formData)     => API.post('/products/add', formData);
export const updateProduct      = (id, formData) => API.put(`/products/update/${id}`, formData);
export const deleteProduct      = (id)           => API.delete(`/products/${id}`);
export const getProductById     = (id)           => API.get(`/products/${id}`);
export const getNewArrivals     = ()             => API.get('/products/new-arrivals');
export const getBestSellers     = ()             => API.get('/products/best-sellers');

export const getProductsForDropdown = () =>
  API.get('/products', { params: { limit: 1000, fields: 'id,name' } });

// =====================
// Categories
// =====================
export const getAllCategories  = ()             => API.get('/categories');
export const addCategory       = (formData)     => API.post('/categories/add', formData);
export const updateCategory    = (id, formData) => API.put(`/categories/update/${id}`, formData);
export const deleteCategory    = (id)           => API.delete(`/categories/delete/${id}`);

// =====================
// Subcategories
// =====================
export const getAllSubCategories  = ()             => API.get('/subcategories');
export const addSubCategory       = (formData)     => API.post('/subcategories/add', formData);
export const updateSubCategory    = (id, formData) => API.put(`/subcategories/update/${id}`, formData);
export const deleteSubCategory    = (id)           => API.delete(`/subcategories/${id}`);

// =====================
// Brands
// =====================
export const getAllBrands  = ()             => API.get('/brands');
export const addBrand     = (formData)     => API.post('/brands/add', formData);
export const updateBrand  = (id, formData) => API.put(`/brands/update/${id}`, formData);
export const deleteBrand  = (id)           => API.delete(`/brands/${id}`);

// =====================
// Reviews
// =====================
export const getAllReviews  = (admin = false) =>
  API.get('/reviews', { params: admin ? { admin: 1 } : {} });

export const canReview = (params) =>
  API.get('/reviews/can-review', { params });

export const addReview = (data) => API.post('/reviews', data);
export const updateReview  = (id, data)  => API.put(`/reviews/update/${id}`, data);
export const deleteReview  = (id)        => API.delete(`/reviews/${id}`);

// =====================
// Cart
// =====================
export const getCart        = (customerId) => API.get(`/cart/customer/${customerId}`);
export const addToCart      = (data)       => API.post('/cart/add', data);
export const updateCartItem = (id, data)   => API.put(`/cart/update/${id}`, data);
export const removeCartItem = (id)         => API.delete(`/cart/${id}`);
export const clearCart      = (customerId) => API.delete(`/cart/clear/${customerId}`);

// =====================
// Wishlist
// =====================
export const getWishlist        = (customerId)     => API.get(`/wishlist/${customerId}`);
export const addToWishlist      = (data)           => API.post('/wishlist/add', data);
export const removeFromWishlist = (id)             => API.delete(`/wishlist/${id}`);
export const moveToCart         = (wishlistItemId) => API.post(`/wishlist/move-to-cart/${wishlistItemId}`);

// =====================
// Auth
// =====================
export const registerUser = (data) => API.post('/user/register', data);
export const verifyRegistrationOtp = (email, otp) => API.post('/user/verify-registration-otp', { email, otp });
export const loginUser    = (data) => API.post('/user/login', data);

// =====================
// Password Reset APIs
// =====================
export const requestPasswordReset = (email) => 
  API.post('/password-reset/forgot-password', { email });

export const verifyOtp = (email, otp) => 
  API.post('/password-reset/verify-otp', { email, otp });

export const resetPassword = (email, otp, newPassword) => 
  API.post('/password-reset/reset-password', { email, otp, newPassword });

// =====================
// Banners
// =====================
export const getAllBanners   = ()             => API.get('/banners');
export const getBannerById   = (id)           => API.get(`/banners/${id}`);
export const addBanner       = (formData)     => API.post('/banners/add', formData);
export const updateBanner    = (id, formData) => API.put(`/banners/update/${id}`, formData);
export const deleteBanner    = (id)           => API.delete(`/banners/${id}`);

// =====================
// Offer Banners
// =====================
export const getAllOfferBanners  = ()             => API.get('/offer-banners');
export const getOfferBannerById  = (id)           => API.get(`/offer-banners/${id}`);
export const addOfferBanner      = (formData)     => API.post('/offer-banners/add', formData);
export const updateOfferBanner   = (id, formData) => API.put(`/offer-banners/update/${id}`, formData);
export const deleteOfferBanner   = (id)           => API.delete(`/offer-banners/${id}`);

// =====================
// Live Products
// =====================
export const getAllLiveProducts  = ()             => API.get('/live-products');
export const getLiveProductById  = (id)           => API.get(`/live-products/${id}`);
export const addLiveProduct      = (formData)     => API.post('/live-products/add', formData);
export const updateLiveProduct   = (id, formData) => API.put(`/live-products/update/${id}`, formData);
export const deleteLiveProduct   = (id)           => API.delete(`/live-products/${id}`);

// =====================
// Instagram Posts
// =====================
export const getAllInstagramPosts   = ()             => API.get('/instagram-posts');
export const getInstagramPostById   = (id)           => API.get(`/instagram-posts/${id}`);
export const addInstagramPost       = (formData)     => API.post('/instagram-posts/add', formData);
export const updateInstagramPost    = (id, formData) => API.put(`/instagram-posts/update/${id}`, formData);
export const deleteInstagramPost    = (id)           => API.delete(`/instagram-posts/${id}`);

// =====================
// Contact / Enquiries
// =====================
export const submitContact      = (data) => API.post('/contact/submit', data);
export const fetchContactsAdmin = ()     => API.get('/contact/all');

// =====================
// Customer Addresses - ADD THESE
// =====================
export const getCustomerAddresses = (customerId) => 
    API.get(`/customers/${customerId}/addresses`);

export const addCustomerAddress = (customerId, addressData) => 
    API.post(`/customers/${customerId}/addresses`, addressData);

export const updateCustomerAddress = (customerId, addressId, addressData) => 
    API.put(`/customers/${customerId}/addresses/${addressId}`, addressData);

export const deleteCustomerAddress = (customerId, addressId) => 
    API.delete(`/customers/${customerId}/addresses/${addressId}`);

// =====================
// Image helper
// =====================
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    if (cleanPath.startsWith('uploads/')) {
        return `${BASE_URL}/${cleanPath}`;
    }

    return `${BASE_URL}/uploads/${cleanPath}`;
};

export default API;
