import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LayoutOne from "../../layouts/LayoutOne";
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist, getImageUrl, getCart } from '../../api';
import API from '../../api';
import { getStoredCustomerId, normalizeWishlistProduct, storePendingShopAction } from '../../utils/shopActions';
import { formatVariantLabel } from '../../utils/variantDisplay';
import { getProductUrl } from '../../utils/productUrl';

const SIZE_UNITS = ['S', 'M', 'L', 'XL', 'XXL'];

const toSlug = (name) =>
    name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';


const getCustomerId = () => getStoredCustomerId();

const clearIfUserChanged = (customerId) => {
    const storedOwnerId = localStorage.getItem('wishlistOwnerId');
    if (storedOwnerId && storedOwnerId !== String(customerId)) {
        localStorage.removeItem('wishlist');
        localStorage.removeItem('cart');
        localStorage.removeItem('cartOwnerId');
    }
    if (customerId) {
        localStorage.setItem('wishlistOwnerId', String(customerId));
    }
};

/* ── Colour tokens (matches HeaderOne) ── */
const KM_VARS = `
  :root {
    --km-gold:     rgb(197, 155, 39);
    --km-gold-lt:  #F8F6F2;
    --km-gold-gr:  rgb(197, 155, 39);
    --km-dark:     #720E1E;
    --km-mid:      #4A4A4A;
    --km-muted:    #4A4A4A;
    --km-border:   #e7dfd2;
    --km-white:    #F8F6F2;
    --km-radius:   12px;
    --km-font:     'Jost', sans-serif;
  }
`;

const KM_BASE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Jost:wght@300;400;500;600&display=swap');

  .km-page { background: #f9f6f2; min-height: 100vh; padding: 32px 0 64px; font-family: var(--km-font); }
  .km-full { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

  .km-page-head { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
  .km-breadcrumb { font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(26,16,64,0.55); font-weight: 600; cursor: default; }
  .km-breadcrumb span { cursor: pointer; }
  .km-breadcrumb span + span::before { content: ' / '; color: rgba(26,16,64,0.45); }
  .km-ph { text-align: left; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .km-ph h1 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; background: var(--km-gold-gr); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; line-height: 1.05; }
  .km-ph p  { font-size: 10px; color: var(--km-dark); letter-spacing: 0.08em; margin: 0; max-width: 820px; }
  .km-page-headline-divider { width: 100%; height: 1px; background: rgba(26,16,64,0.08); margin-top: 22px; }

  .km-card    { background: var(--km-white); border-radius: var(--km-radius); border: 1px solid var(--km-border); overflow: hidden; }
  .km-card-hd { background: var(--km-gold-gr); padding: 14px 20px; display: flex; align-items: center; gap: 10px; }
  .km-card-ft { padding: 16px 20px; border-top: 1px solid var(--km-border); display: flex; justify-content: flex-end; }

  .km-table-wrap { overflow-x: auto; }
  .km-table { width: 100%; border-collapse: collapse; font-family: var(--km-font); }
  .km-table thead tr { background: var(--km-gold-lt); }
  .km-table th { padding: 13px 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--km-gold); border-bottom: 2px solid var(--km-border); text-align: left; white-space: nowrap; }
  .km-table td { padding: 14px 16px; border-bottom: 1px solid var(--km-border); vertical-align: middle; font-size: 14px; color: var(--km-dark); }
  .km-table tr:last-child td { border-bottom: none; }
  .km-table tr:hover td { background: var(--km-gold-lt); }

  .km-prod-cell { display: flex; align-items: center; gap: 14px; }
  .km-img-w     { width: 70px; height: 70px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--km-border); }
  .km-img-w img { width: 100%; height: 100%; object-fit: cover; }
  .km-pname     { font-size: 14px; font-weight: 600; color: var(--km-dark); display: block; }
  .km-pname:hover { color: var(--km-gold); }
  .km-variant-label { display: inline-flex; align-items: center; margin-top: 5px; padding: 3px 9px; border: 1px solid #ead9bb; border-radius: 999px; background: #fffaf0; color: #76521c; font-size: 11px; font-weight: 600; line-height: 1.35; }

  .km-price    { font-size: 15px; font-weight: 700; color: var(--km-dark); }
  .km-subtotal { font-size: 15px; font-weight: 700; color: var(--km-gold); }

  .km-rm-btn { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #fecaca; background: #fef2f2; color: #b91c1c; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; transition: all .15s; }
  .km-rm-btn:hover { background: #b91c1c; color: #fff; border-color: #b91c1c; }

  .km-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: var(--km-gold-gr); color: var(--km-white); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: 0.04em; font-family: var(--km-font); transition: opacity .2s; }
  .km-btn-primary:hover { opacity: 0.88; }
  .km-btn-outline { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: transparent; color: var(--km-gold); border: 1.5px solid var(--km-gold); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; letter-spacing: 0.04em; font-family: var(--km-font); transition: all .2s; }
  .km-btn-outline:hover { background: var(--km-gold-lt); }
  .km-btn-orange { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: var(--km-gold-gr); color: var(--km-white); border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; font-family: var(--km-font); transition: opacity .2s; white-space: nowrap; }
  .km-btn-orange:hover  { opacity: 0.88; }
  .km-btn-orange.added  { background: linear-gradient(45deg, #16a34a, #4ade80); }

  .km-in  { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #16a34a; }
  .km-out { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #b91c1c; }
  .km-din { width: 7px; height: 7px; border-radius: 50%; background: #16a34a; display: inline-block; }
  .km-dout{ width: 7px; height: 7px; border-radius: 50%; background: #b91c1c; display: inline-block; }

  .km-empty      { text-align: center; padding: 80px 20px; max-width: 380px; margin: 0 auto; }
  .km-empty-icon { font-size: 56px; margin-bottom: 18px; }
  .km-empty h4   { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: var(--km-dark); margin-bottom: 10px; }
  .km-empty p    { font-size: 14px; color: var(--km-muted); margin-bottom: 22px; }

  .km-err { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 18px; font-size: 13px; color: #b91c1c; margin-bottom: 20px; }

  .km-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 16px; color: var(--km-muted); font-family: var(--km-font); }
  .km-spinner { width: 36px; height: 36px; border: 3px solid var(--km-border); border-top-color: var(--km-gold); border-radius: 50%; animation: km-spin 0.8s linear infinite; }
  @keyframes km-spin { to { transform: rotate(360deg); } }
`;

// ── Toast Component ──
const Toast = ({ toast }) => {
    if (!toast) return null;
    const isError   = toast.type === 'error';
    const isWarning = toast.type === 'warning';
    return (
        <div style={{
            position:     'fixed',
            top:          24,
            right:        24,
            zIndex:       9999,
            background:   isError ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0FDF4',
            border:       `1.5px solid ${isError ? '#FECACA' : isWarning ? '#FDE68A' : '#BBF7D0'}`,
            borderRadius: 12,
            padding:      '14px 20px',
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            boxShadow:    '0 4px 24px rgba(0,0,0,0.10)',
            minWidth:     260,
            animation:    'toast-in 0.3s ease',
        }}>
            <span style={{ fontSize: 20 }}>
                {isError ? '❌' : isWarning ? '⚠️' : '✅'}
            </span>
            <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: isError ? '#B91C1C' : isWarning ? '#92400E' : '#15803D' }}>
                    {toast.title}
                </div>
                {toast.msg && (
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{toast.msg}</div>
                )}
            </div>
            <style>{`@keyframes toast-in { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

const WishListSection = ({ shop }) => {
    const [items,       setItems]       = useState([]);
    const [cartIds,     setCartIds]     = useState(new Set());
    const [loading,     setLoading]     = useState(true);
    const [removing,    setRemoving]    = useState(null);
    const [addedToCart, setAddedToCart] = useState(null);
    const [error,       setError]       = useState(null);
    const [toast,       setToast]       = useState(null);
    const customerId = getCustomerId();
    const navigate   = useNavigate();

    const showToast = (title, msg = '', type = 'success') => {
        setToast({ title, msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        if (!customerId) return;
        const handleStorage = () => { loadData(); };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    const loadData = async () => {
        setLoading(true);
        clearIfUserChanged(customerId);

        try {
            const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

            const [wRes, cRes] = await Promise.all([
                getWishlist(customerId),
                getCart(customerId),
            ]);

            const apiItems  = wRes.data  || [];
            const cartItems = cRes.data  || [];

            const variantsByProduct = new Map();
            await Promise.all(apiItems.map(async (item) => {
                try {
                    const response = await API.get(`/products/${item.productId}`);
                    const product = response.data?.product || response.data?.data || response.data;
                    variantsByProduct.set(String(item.productId), product?.Variants || product?.variants || []);
                } catch {
                    variantsByProduct.set(String(item.productId), []);
                }
            }));
            const enrichedItems = apiItems.map(item => {
                if (item.Variant?.attributes) return { ...item, variantId: item.variantId || item.Variant.id, variantAttributes: item.Variant.attributes, weight: item.weight || Object.entries(item.Variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', '), img: item.Variant.image || item.img, price: item.Variant.salesPrice ?? item.price, stock: item.Variant.stock ?? item.stock };
                if (item.variantId || item.variantAttributes) return item;
                const firstVariant = variantsByProduct.get(String(item.productId))?.[0];
                return firstVariant ? { ...item, variantId: firstVariant.id, variantAttributes: firstVariant.attributes, weight: Object.entries(firstVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', '), img: firstVariant.image || item.img, price: firstVariant.salesPrice ?? item.price, stock: firstVariant.stock } : item;
            });

            const ids = new Set(cartItems.map(c => `${c.productId}:${c.variantId || 'base'}`));
            setCartIds(ids);

            const apiProductIds = new Set(enrichedItems.map(i => `${i.productId}:${i.variantId || 'base'}`));
            const localOnly = localWishlist
                .filter(i => !apiProductIds.has(`${i.productId || i.id}:${i.variantId || 'base'}`))
                .map(i => ({
                    ...i,
                    productId: i.id,
                    name:      i.productName || i.name,
                }));

            const merged = [...enrichedItems, ...localOnly];
            setItems(merged);
        } catch {
            setError("Failed to load wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!customerId) return;
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    const handleProductClick = (item) => {
        navigate(getProductUrl({ id: item.productId, name: item.name }), {
            state: {
                product: {
                    id:          item.productId,
                    productName: item.name,
                    name:        item.name,
                    price:       item.price,
                    img:         getImageUrl(item.img),
                    image:       item.img,
                    salesPrice:  item.price,
                    mrp:         item.mrp || item.price,
                    weight:      item.weight,
                    variantId:   item.variantId,
                    variantAttributes: item.variantAttributes,
                }
            }
        });
    };

    const handleRemove = async (id) => {
        setRemoving(id);
        try {
            const item = items.find(i => i.id === id);
            if (item) {
                const removed = await (shop.deleteFromWishlist ? shop.deleteFromWishlist(id) : removeFromWishlist(id));
                if (!removed) {
                    const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                    const productId     = item?.productId;
                    const updated       = localWishlist.filter(i => String(i.id) !== String(productId));
                    localStorage.setItem('wishlist', JSON.stringify(updated));
                }
            }

            const localWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const productId     = item?.productId;
            const updated       = localWishlist.filter(i => String(i.id) !== String(productId));
            localStorage.setItem('wishlist', JSON.stringify(updated));
            window.dispatchEvent(new Event('wishlistUpdated'));
            if (!shop.deleteFromWishlist) {
                showToast('Removed from wishlist', `${item?.name} has been removed.`, 'success');
            }

            setTimeout(() => {
                setItems(prev => prev.filter(i => i.id !== id));
                setRemoving(null);
            }, 300);
        } catch {
            setRemoving(null);
            showToast('Error', 'Could not remove item. Please try again.', 'error');
        }
    };

    const handleAddToCart = async (item) => {
        const stockQty = parseInt(item.stock ?? 999);

        if (stockQty === 0) {
            showToast('Out of Stock', 'This item is currently out of stock.', 'error');
            return;
        }

        const price = parseFloat(item.price) || 0;
        const cartId = `${item.productId}:${item.variantId || 'base'}`;

        if (cartIds.has(cartId)) {
            showToast('Already in Cart!', `${item.name} is already in your cart.`, 'warning');
            return;
        }

        setAddedToCart(item.id);
        try {
            const productToCart = {
                id:          item.productId,
                productId:   item.productId,
                name:        item.name,
                img:         item.img,
                price,
                quantity:    1,
                stock:       stockQty,
                variantId: item.variantId || null,
                variantAttributes: item.variantAttributes || null,
                weight: item.weight || '',
            };

            const added = await shop.addToCart(productToCart);
            if (!added) {
                setAddedToCart(null);
                return;
            }

                setCartIds(prev => new Set([...prev, cartId]));
          
            window.dispatchEvent(new Event('cartUpdated'));
            await Promise.allSettled([shop?.refreshCart?.(), shop?.refreshWishlist?.()]);
        } catch {
            showToast('Error', 'Could not add to cart. Please try again.', 'error');
        }
        setTimeout(() => setAddedToCart(null), 1500);
    };

    // ── Guard: Not logged in ──
    if (!customerId) return (
        <LayoutOne shop={shop} headerTop="visible">
            <section className="km-page">
                <style>{KM_VARS + KM_BASE}</style>
                <div className="km-full">
                <div className="km-empty">
                    <div className="km-empty-icon">🔒</div>
                    <h4>Please log in to view your wishlist</h4>
                    <p>Sign in to access your saved wishlist items.</p>
                    <button className="km-btn-primary" onClick={() => navigate('/login-register')}>
                        Go to Login →
                    </button>
                </div>
            </div>
            </section>
        </LayoutOne>
    );

    if (loading) return (
        <LayoutOne shop={shop} headerTop="visible">
            <section className="km-page">
                <style>{KM_VARS + KM_BASE}</style>
                <div className="km-full">
                <div className="km-loader"><div className="km-spinner" /><p>Loading your wishlist…</p></div>
            </div>
            </section>
        </LayoutOne>
    );

    return (
        <LayoutOne shop={shop} headerTop="visible">
            <section className="km-page">
                <Toast toast={toast} />
            <style>{KM_VARS + KM_BASE + WL_STYLES}</style>
            <div className="km-full">
                {error && <div className="km-err">{error}</div>}

                <div className="km-page-head">
                    
                    <div className="km-ph">
                        <h1>♥ My Wishlist</h1>
                        <p>Items you love, saved for later</p>
                    </div>
                  
                </div>

                {items.length > 0 ? (
                    <div className="km-card">
                        <div className="km-card-hd">
                            <span style={{ marginRight: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                                ♥ Wishlist
                            </span>
                        </div>

                        <div className="km-table-wrap">
                            <table className="km-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 48 }}></th>
                                        <th>Product Details</th>
                                        <th>Price</th>
                                        <th>Availability</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => {
                                        const stockQty     = parseInt(item.stock ?? 999);
                                        const isOutOfStock = stockQty === 0;
                                        const isLowStock   = stockQty > 0 && stockQty <= 5;

                                        const cartId    = `${item.productId}:${item.variantId || 'base'}`;
                                        const isInCart  = cartIds.has(cartId);

                                        return (
                                            <tr
                                                key={item.id}
                                                style={{
                                                    opacity:    removing === item.id ? 0 : isOutOfStock ? 0.6 : 1,
                                                    transform:  removing === item.id ? 'translateX(-16px)' : 'none',
                                                    transition: 'all 0.3s',
                                                }}
                                            >
                                                {/* ── Remove ── */}
                                                <td>
                                                    <button className="km-rm-btn" onClick={() => handleRemove(item.id)} title="Remove from wishlist">
                                                        ✕
                                                    </button>
                                                </td>

                                                {/* ── Product ── */}
                                                <td>
                                                    <div className="km-prod-cell">
                                                        <div className="km-img-w">
                                                            <img src={getImageUrl(item.img)} alt={item.name} />
                                                        </div>
                                                        <div>
                                                            <span
                                                                className="km-pname"
                                                                onClick={() => handleProductClick(item)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {item.name}
                                                            </span>
                                                            {formatVariantLabel(item) && <span className="km-variant-label">{formatVariantLabel(item)}</span>}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ── Price ── */}
                                                <td>
                                                    <span className="km-price">₹{item.price}</span>
                                                </td>

                                                {/* ── Availability ── */}
                                                <td>
                                                    {isOutOfStock ? (
                                                        <span className="km-out">
                                                            <span className="km-dout" />
                                                            Out of Stock
                                                        </span>
                                                    ) : isLowStock ? (
                                                        <span style={{ color: '#C2410C', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                                                            Only {stockQty} left!
                                                        </span>
                                                    ) : (
                                                        <span className="km-in">
                                                            <span className="km-din" />
                                                            In Stock
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {isInCart ? (
                                                        <button
                                                            className="km-btn-outline"
                                                            onClick={() => navigate('/cart')}
                                                            style={{
                                                                display:      'inline-flex',
                                                                alignItems:   'center',
                                                                gap:          6,
                                                                fontSize:     13,
                                                                padding:      '7px 14px',
                                                                borderRadius: 8,
                                                                cursor:       'pointer',
                                                                whiteSpace:   'nowrap',
                                                            }}
                                                        >
                                                            🛒 Go to Cart
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={`km-btn-orange ${addedToCart === item.id ? 'added' : ''}`}
                                                            disabled={isOutOfStock}
                                                            onClick={() => handleAddToCart(item)}
                                                            style={{
                                                                opacity: isOutOfStock ? 0.5 : 1,
                                                                cursor:  isOutOfStock ? 'not-allowed' : 'pointer',
                                                            }}
                                                        >
                                                            {addedToCart === item.id ? (
                                                                <>✓ Added!</>
                                                            ) : isOutOfStock ? (
                                                                <>✕ Out of Stock</>
                                                            ) : (
                                                                <>🛒 Add to Cart</>
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="km-card-ft">
                            <button className="km-btn-outline" onClick={() => navigate('/shop')}>
                                ← Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="km-empty">
                        <div className="km-empty-icon">♥</div>
                        <h4>Your wishlist is empty</h4>
                        <p>Add items you love to keep track of them!</p>
                        <button className="km-btn-primary" onClick={() => navigate('/shop')}>
                            Go to Shop →
                        </button>
                    </div>
                )}
            </div>
            </section>
        </LayoutOne>
    );
};

const WL_STYLES = `
  @media (max-width: 768px) {
    .km-table-wrap { border: none; }

    .km-table thead { display: none; }

    .km-table, .km-table tbody, .km-table tr, .km-table td {
      display: block;
      width: 100%;
    }

    .km-table tr {
      background: #fff;
      border: 1px solid #ede8e2;
      border-radius: 12px;
      margin-bottom: 16px;
      padding: 12px;
      position: relative;
    }

    .km-table td {
      text-align: right;
      padding: 8px 0;
      border: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    .km-table td:nth-child(2) {
      justify-content: flex-start;
      border-bottom: 1px solid #f5f5f5;
      padding-bottom: 12px;
      margin-bottom: 8px;
    }

    .km-table td:nth-child(3)::before { content: "Price";        font-weight: 600; color: #888; }
    .km-table td:nth-child(4)::before { content: "Availability"; font-weight: 600; color: #888; }
    .km-table td:nth-child(5)::before { content: "Action";      font-weight: 600; color: #888; }

    .km-table td:nth-child(1) {
      position: absolute;
      top: 10px;
      right: 10px;
      width: auto;
      z-index: 10;
    }

    .km-table td:nth-child(6) {
      margin-top: 10px;
      display: block;
    }

    .km-table td:nth-child(6) button {
      width: 100%;
      justify-content: center;
      padding: 12px;
    }

    .km-prod-cell { gap: 12px; }
    .km-img-w     { width: 60px; height: 60px; }
    .km-pname     { font-size: 15px; max-width: 180px; text-align: left; }
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0)     scale(1);    }
  }
`;

export default WishListSection;

// ── Named exports required by App.js ─────────────────────────────────────────
export const useWishlist = (onNotLoggedIn, notify) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const customerId = getCustomerId();

    const syncLocalWishlist = useCallback((items) => {
        const localItems = (items || []).map((item) => ({
            id:          item.productId,
            wishlistId:  item.id,
            productId:   item.productId,
            name:        item.name,
            productName: item.name,
            img:         item.img,
            image:       item.img,
            price:       item.price,
            weight:      item.weight,
            variantId:   item.variantId,
            variantAttributes: item.variantAttributes,
            stock:       item.stock,
        }));
        localStorage.setItem('wishlist', JSON.stringify(localItems));
        window.dispatchEvent(new Event('storage'));
    }, []);

    const refreshWishlist = useCallback(async () => {
        const activeCustomerId = getCustomerId();
        if (!activeCustomerId) {
            setWishlistItems([]);
            return [];
        }

        try {
            const res = await getWishlist(activeCustomerId);
            const items = res.data || [];
            setWishlistItems(items);
            syncLocalWishlist(items);
            return items;
        } catch (err) {
            console.error('Wishlist fetch error:', err);
            notify?.('Could not load your wishlist. Please try again.', 'error');
            return [];
        }
    }, [notify, syncLocalWishlist]);

    useEffect(() => {
        refreshWishlist();
        const handleSync = () => refreshWishlist();
        window.addEventListener('authChange', handleSync);
        window.addEventListener('wishlistUpdated', handleSync);
        return () => {
            window.removeEventListener('authChange', handleSync);
            window.removeEventListener('wishlistUpdated', handleSync);
        };
    }, [refreshWishlist, customerId]);

    const addToWishlist = useCallback(async (product) => {
        const activeCustomerId = getCustomerId();
        if (!activeCustomerId) {
            storePendingShopAction('wishlist', product);
            onNotLoggedIn?.('wishlist', product);
            return false;
        }

        const payload = normalizeWishlistProduct(product);
        if (!payload.productId) {
            notify?.('Could not add this product to your wishlist.', 'error');
            return false;
        }

        try {
            const res = await apiAddToWishlist({ customerId: activeCustomerId, ...payload });
            const savedItem = res.data;
            setWishlistItems((prev) => {
                const existingIndex = prev.findIndex((item) => String(item.productId) === String(payload.productId) && String(item.variantId || '') === String(payload.variantId || ''));
                const next = [...prev];
                if (existingIndex >= 0) {
                    next[existingIndex] = savedItem;
                } else {
                    next.unshift(savedItem);
                }
                syncLocalWishlist(next);
                return next;
            });
            window.dispatchEvent(new Event('wishlistUpdated'));
            notify?.(
                savedItem.alreadyExists ? `${payload.name} is already in your wishlist.` : `${payload.name} added to your wishlist.`,
                savedItem.alreadyExists ? 'warning' : 'success'
            );
            return true;
        } catch (err) {
            console.error('Add wishlist error:', err);
            notify?.(err.response?.data?.error || 'Could not add item to wishlist. Please try again.', 'error');
            return false;
        }
    }, [notify, onNotLoggedIn, syncLocalWishlist]);

    const deleteFromWishlist = useCallback(async (id) => {
        const item = wishlistItems.find((wishlistItem) => String(wishlistItem.id) === String(id) || String(wishlistItem.productId) === String(id));
        if (!item) return false;

        try {
            await removeFromWishlist(item.id);
            const next = wishlistItems.filter((wishlistItem) => wishlistItem.id !== item.id);
            setWishlistItems(next);
            syncLocalWishlist(next);
            window.dispatchEvent(new Event('wishlistUpdated'));
            notify?.(`${item.name} removed from your wishlist.`, 'success');
            return true;
        } catch (err) {
            console.error('Remove wishlist item error:', err);
            notify?.('Could not remove item from wishlist. Please try again.', 'error');
            return false;
        }
    }, [wishlistItems, notify, syncLocalWishlist]);

    return {
        wishlistItems,
        addToWishlist,
        deleteFromWishlist,
        refreshWishlist,
    };
};

export const WishlistDrawer = () => null;
