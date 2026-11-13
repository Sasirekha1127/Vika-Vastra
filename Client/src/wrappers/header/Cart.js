import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutOne from '../../layouts/LayoutOne';
import { getCart, addToCart as apiAddToCart, removeCartItem, updateCartItem, clearCart as apiClearCart, getImageUrl } from '../../api';
import API from '../../api';
import { getStoredCustomerId, makeCartKey, normalizeCartProduct, storePendingShopAction } from '../../utils/shopActions';
import { formatVariantLabel } from '../../utils/variantDisplay';
import { getProductUrl } from '../../utils/productUrl';

const SIZE_UNITS = ['S', 'M', 'L', 'XL', 'XXL'];

const toSlug = (name) =>
    name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';


const getCustomerId = () => getStoredCustomerId();

const clearIfUserChanged = (customerId) => {
    const storedOwnerId = localStorage.getItem('cartOwnerId');
    if (storedOwnerId && storedOwnerId !== String(customerId)) {
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        localStorage.removeItem('wishlistOwnerId');
    }
    if (customerId) {
        localStorage.setItem('cartOwnerId', String(customerId));
    }
};

const makeCartId = (productId, variantId) => makeCartKey(productId, variantId);

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

  .km-sum-card  { background: var(--km-white); border-radius: var(--km-radius); border: 1px solid var(--km-border); overflow: hidden; position: sticky; top: 100px; }
  .km-sum-hd    { background: var(--km-gold-gr); padding: 18px 22px; }
  .km-sum-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 800; color: var(--km-white); }
  .km-swoosh    { height: 2px; background: rgba(255,255,255,0.25); border-radius: 2px; margin-top: 10px; }
  .km-sum-body  { padding: 22px; }

  .km-total-row   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .km-total-lbl   { font-size: 16px; font-weight: 700; color: var(--km-dark); }
  .km-total-val   { font-size: 22px; font-weight: 800; background: var(--km-gold-gr); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  .km-checkout-btn { width: 100%; padding: 14px; background: var(--km-gold-gr); color: var(--km-white); border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.04em; font-family: var(--km-font); transition: opacity .2s; }
  .km-checkout-btn:hover { opacity: 0.88; }

  .km-trust { display: flex; justify-content: center; gap: 20px; margin-top: 14px; font-size: 11px; color: var(--km-muted); font-weight: 600; letter-spacing: 0.06em; }

  .km-empty      { text-align: center; padding: 80px 20px; max-width: 380px; margin: 0 auto; }
  .km-empty-icon { font-size: 56px; margin-bottom: 18px; }
  .km-empty h4   { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: var(--km-dark); margin-bottom: 10px; }
  .km-empty p    { font-size: 14px; color: var(--km-muted); margin-bottom: 22px; }

  .km-err { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 18px; font-size: 13px; color: #b91c1c; margin-bottom: 20px; }

  .km-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 16px; color: var(--km-muted); font-family: var(--km-font); }
  .km-spinner { width: 36px; height: 36px; border: 3px solid var(--km-border); border-top-color: var(--km-gold); border-radius: 50%; animation: km-spin 0.8s linear infinite; }
  @keyframes km-spin { to { transform: rotate(360deg); } }
`;

// ─── QtyControl ───────────────────────────────────────────────────────────────
const QtyControl = ({ quantity, stock, onChange }) => {
    const maxQty = parseInt(stock ?? 999);
    return (
        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #ede8e2', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
            <button
                onClick={() => onChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                style={{ width: 34, height: 34, border: 'none', background: 'transparent', fontSize: 18, color: '#B38728', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', opacity: quantity <= 1 ? 0.4 : 1 }}
            >−</button>
            <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{quantity}</span>
            <button
                onClick={() => onChange(Math.min(maxQty, quantity + 1))}
                disabled={quantity >= maxQty}
                style={{ width: 34, height: 34, border: 'none', background: 'transparent', fontSize: 18, color: '#B38728', cursor: quantity >= maxQty ? 'not-allowed' : 'pointer', opacity: quantity >= maxQty ? 0.4 : 1 }}
            >+</button>
        </div>
    );
};

const CartSection = ({ shop }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState(null);
    const customerId = getCustomerId();
    const navigate   = useNavigate();

    useEffect(() => {
        if (!customerId) { setLoading(false); return; }

        clearIfUserChanged(customerId);

        const loadCart = async () => {
            try {
                const res   = await getCart(customerId);
                const items = res.data || [];

                if (items.length > 0) {
                    const itemsWithStock = await Promise.all(
                        items.map(async (item) => {
                            try {
                                const pRes = await API.get(`/products/${item.productId}`);
                                const prod = pRes.data || pRes.data?.data || {};
                                const stock = item.variantId ? prod.Variants?.find(variant => String(variant.id) === String(item.variantId))?.stock ?? 0 : prod.stock ?? 999;
                                const selectedVariant = item.variantId ? prod.Variants?.find(variant => String(variant.id) === String(item.variantId)) : null;
                                const variantAttributes = item.variantAttributes || selectedVariant?.attributes || null;
                                return { ...item, stock: parseInt(stock), variantAttributes, weight: item.weight || (variantAttributes ? Object.entries(variantAttributes).map(([key, value]) => `${key}: ${value}`).join(', ') : null), img: selectedVariant?.image || item.img };
                            } catch {
                                return { ...item, stock: 999 };
                            }
                        })
                    );

                    const localCart    = JSON.parse(localStorage.getItem('cart')) || [];
                    const updatedLocal = localCart.map(lc => {
                        const serverItem = itemsWithStock.find(si => String(si.productId) === String(lc.id) && String(si.variantId || '') === String(lc.variantId || ''));
                        if (serverItem) return { ...lc, stock: serverItem.stock };
                        return lc;
                    });
                    localStorage.setItem('cart', JSON.stringify(updatedLocal));
                    window.dispatchEvent(new Event('storage'));

                    setCartItems(itemsWithStock);

                } else {
                    const localCart = JSON.parse(localStorage.getItem('cart')) || [];

                    if (localCart.length > 0) {
                        for (const lc of localCart) {
                            try {
                                await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cart/add`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        customerId,
                                        productId:   lc.id,
                                        name:        lc.name,
                                        img:         lc.img,
                                        price:       lc.price,
                                        quantity:    lc.quantity,
                                        weight:      lc.weight,
                                        variantId:   lc.variantId,
                                        variantAttributes: lc.variantAttributes,
                                    }),
                                });
                            } catch (syncErr) {
                                console.error('Failed to sync item to DB:', lc.name, syncErr);
                            }
                        }

                        try {
                            const retryRes   = await getCart(customerId);
                            const retryItems = retryRes.data || [];

                            const itemsWithStock = await Promise.all(
                                retryItems.map(async (item) => {
                                    try {
                                        const pRes = await API.get(`/products/${item.productId}`);
                                        const prod = pRes.data || pRes.data?.data || {};
                                        const stock = item.variantId ? prod.Variants?.find(variant => String(variant.id) === String(item.variantId))?.stock ?? 0 : prod.stock ?? 999;
                                        const selectedVariant = item.variantId ? prod.Variants?.find(variant => String(variant.id) === String(item.variantId)) : null;
                                        const variantAttributes = item.variantAttributes || selectedVariant?.attributes || null;
                                        return { ...item, stock: parseInt(stock), variantAttributes, weight: item.weight || (variantAttributes ? Object.entries(variantAttributes).map(([key, value]) => `${key}: ${value}`).join(', ') : null), img: selectedVariant?.image || item.img };
                                    } catch {
                                        return { ...item, stock: 999 };
                                    }
                                })
                            );

                            setCartItems(itemsWithStock);
                        } catch {
                            setCartItems(
                                localCart.map(lc => ({
                                    id:        lc.cartId,
                                    productId: lc.id,
                                    name:      lc.name,
                                    img:       lc.img,
                                    price:     lc.price,
                                    quantity:  lc.quantity,
                                    weight:    lc.weight,
                                    variantId: lc.variantId,
                                    variantAttributes: lc.variantAttributes,
                                    stock:     lc.stock ?? 999,
                                }))
                            );
                        }
                    } else {
                        setCartItems([]);
                    }
                }

            } catch {
                const localCart = JSON.parse(localStorage.getItem('cart')) || [];
                if (localCart.length > 0) {
                    setCartItems(
                        localCart.map(lc => ({
                            id:        lc.cartId,
                            productId: lc.id,
                            name:      lc.name,
                            img:       lc.img,
                            price:     lc.price,
                            quantity:  lc.quantity,
                            weight:    lc.weight,
                            variantId: lc.variantId,
                            variantAttributes: lc.variantAttributes,
                            stock:     lc.stock ?? 999,
                        }))
                    );
                } else {
                    setError('Failed to load cart. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [customerId]);

    const handleProductClick = (item) => {
        const stockQty     = parseInt(item.stock ?? 999);
        const isOutOfStock = stockQty === 0;

        navigate(getProductUrl({ id: item.productId, name: item.name }), {
            state: {
                product: {
                    id:           item.productId,
                    productName:  item.name,
                    name:         item.name,
                    price:        item.price,
                    img:          getImageUrl(item.img),
                    image:        item.img,
                    salesPrice:   item.price,
                    mrp:          item.mrp || item.price,
                    weight:       item.weight,
                    variantId:    item.variantId,
                    variantAttributes: item.variantAttributes,
                    stock:        stockQty,
                    isOutOfStock: isOutOfStock,
                }
            }
        });
    };

    const handleRemove = async (id) => {
        try {
            const removedItem = cartItems.find(i => String(i.id) === String(id) || makeCartId(i.productId, i.variantId) === String(id));
            const cartItemId = removedItem?.id ?? id;
            const removed = await (shop.deleteFromCart ? shop.deleteFromCart(cartItemId) : removeCartItem(cartItemId));
            if (!removed) throw new Error('Remove failed');

            if (removedItem) {
                const localCart     = JSON.parse(localStorage.getItem('cart')) || [];
                    const removedCartId = makeCartId(removedItem.productId, removedItem.variantId);
                window.dispatchEvent(new Event('cartUpdated'));
            }

            setCartItems(prev => prev.filter(item => item.id !== id && makeCartId(item.productId, item.variantId) !== String(id)));
        } catch (err) {
            console.error('Remove cart item error:', err);
            alert('Could not remove item. Please try again.');
        }
    };

    const handleQuantityChange = async (id, newQty) => {
        const item        = cartItems.find(i => String(i.id) === String(id) || makeCartId(i.productId, i.variantId) === String(id));
        const actualStock = parseInt(item?.stock ?? 999);

        if (actualStock === 0) return;

        if (!item) return;
        const cartItemId = item.id ?? id;
        const qty = Math.min(Math.max(1, newQty), actualStock);

        try {
            const updated = await (shop.updateQuantity ? shop.updateQuantity(cartItemId, qty) : updateCartItem(cartItemId, { quantity: qty }));
            if (!updated) throw new Error('Update failed');

            setCartItems(prev => prev.map(i => i.id === id || makeCartId(i.productId, i.variantId) === String(id) ? { ...i, quantity: qty } : i));
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            const cartId    = makeCartId(item.productId, item.variantId);
            const idx       = localCart.findIndex(lc => lc.cartId === cartId);
            if (idx !== -1) {
                localCart[idx].quantity = qty;
                localStorage.setItem('cart', JSON.stringify(localCart));
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (err) {
            console.error('Update quantity error:', err);
            alert('Could not update quantity. Please try again.');
        }
    };

    const subtotal = cartItems
        .filter(item => parseInt(item.stock ?? 999) > 0)
        .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    const total = subtotal;

    const hasOutOfStockItems = cartItems.some(item => parseInt(item.stock ?? 999) === 0);

    if (loading) return (
        <LayoutOne shop={shop} headerTop="visible">
            <section className="km-page">
                <style>{KM_VARS + KM_BASE}</style>
                <div className="km-full">
                <div className="km-loader"><div className="km-spinner" /><p>Loading your cart…</p></div>
            </div>
            </section>
        </LayoutOne>
    );

    if (!customerId) return (
        <LayoutOne shop={shop} headerTop="visible">
            <section className="km-page">
                <style>{KM_VARS + KM_BASE}</style>
                <div className="km-full">
                <div className="km-empty">
                    <div className="km-empty-icon">🔒</div>
                    <h4>Please log in to view your cart</h4>
                    <p>Sign in to access your saved cart items.</p>
                    <button className="km-btn-primary" onClick={() => navigate('/login-register')}>
                        Go to Login →
                    </button>
                </div>
            </div>
            </section>
        </LayoutOne>
    );

    return (
        <LayoutOne shop={shop} headerTop="visible">
            <section className="km-page">
                <style>{KM_VARS + KM_BASE + CART_STYLES}</style>
                <div className="km-full">
                {error && <div className="km-err">{error}</div>}

                <div className="km-page-head">
                  
                    <div className="km-ph">
                        <h1>🛒 Shopping Cart</h1>
                        <p>A Heritage in Every Drape</p>
                    </div>
                   
                </div>

                {cartItems.length > 0 ? (
                    <div className="cart-layout">

                        {/* ── Cart Table ── */}
                        <div className="cart-main">
                            <div className="km-card">
                                <div className="km-card-hd">
                                    <span style={{ marginRight: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                                        🛒 Shopping Cart
                                    </span>
                                </div>

                                {hasOutOfStockItems && (
                                    <div style={{
                                        background: '#FEF2F2',
                                        border: '1px solid #FECACA',
                                        borderRadius: 10,
                                        padding: '10px 16px',
                                        margin: '12px 16px 0',
                                        fontSize: 13,
                                        color: '#B91C1C',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}>
                                        ⚠️ Some products are out of stock. Please remove them before checkout.
                                    </div>
                                )}

                                <div className="km-table-wrap">
                                    <table className="km-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 48 }}></th>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map(item => {
                                                const stockQty     = parseInt(item.stock ?? 999);
                                                const isOutOfStock = stockQty === 0;
                                                const isLowStock   = stockQty > 0 && stockQty <= 5;

                                                return (
                                                    <tr key={makeCartId(item.productId, item.variantId)} style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                                                        <td>
                                                            <button className="km-rm-btn" onClick={() => handleRemove(item.id ?? makeCartId(item.productId, item.variantId))} title="Remove">
                                                                ✕
                                                            </button>
                                                        </td>

                                                        {/* ── Product ── */}
                                                        <td>
                                                            <div className="km-prod-cell">
                                                                <div className="km-img-w" style={{ position: 'relative' }}>
                                                                    <img src={getImageUrl(item.img)} alt={item.name} />
                                                                    {isOutOfStock && (
                                                                        <div style={{
                                                                            position: 'absolute', inset: 0,
                                                                            background: 'rgba(185,28,28,0.15)',
                                                                            borderRadius: 8,
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        }}>
                                                                            <span style={{
                                                                                background: '#B91C1C', color: '#fff',
                                                                                fontSize: 9, fontWeight: 800,
                                                                                padding: '2px 5px', borderRadius: 4,
                                                                            }}>OUT OF STOCK</span>
                                                                        </div>
                                                                    )}
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
                                                                    {isOutOfStock && (
                                                                        <span style={{
                                                                            display: 'block', fontSize: 10, fontWeight: 700,
                                                                            color: '#B91C1C', background: '#FEF2F2',
                                                                            border: '1px solid #FECACA', borderRadius: 6,
                                                                            padding: '1px 6px', marginTop: 4, width: 'fit-content'
                                                                        }}>
                                                                            Out of Stock
                                                                        </span>
                                                                    )}
                                                                    {isLowStock && (
                                                                        <span style={{
                                                                            display: 'block', fontSize: 10, fontWeight: 700,
                                                                            color: '#C2410C', background: '#FFF7ED',
                                                                            border: '1px solid #FED7AA', borderRadius: 6,
                                                                            padding: '1px 6px', marginTop: 4, width: 'fit-content'
                                                                        }}>
                                                                            Only {stockQty} left!
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* ── Price ── */}
                                                        <td>
                                                            <span className="km-price">₹{item.price}</span>
                                                        </td>

                                                        {/* ── Quantity ── */}
                                                        <td>
                                                            {isOutOfStock ? (
                                                                <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>—</span>
                                                            ) : (
                                                                <QtyControl
                                                                    quantity={item.quantity}
                                                                    stock={item.stock}
                                                                    onChange={(q) => handleQuantityChange(item.id ?? makeCartId(item.productId, item.variantId), q)}
                                                                />
                                                            )}
                                                        </td>

                                                        {/* ── Subtotal ── */}
                                                        <td>
                                                            <span className="km-subtotal">
                                                                {isOutOfStock
                                                                    ? <span style={{ color: '#B91C1C', fontSize: 12, fontWeight: 700 }}>—</span>
                                                                    : `₹${(item.price * item.quantity).toFixed(2)}`
                                                                }
                                                            </span>
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
                        </div>

                        {/* ── Order Summary ── */}
                        <div className="cart-sidebar">
                            <div className="km-sum-card">
                                <div className="km-sum-hd">
                                    <div className="km-sum-title">Order Summary</div>
                                    <div className="km-swoosh" />
                                </div>
                                <div className="km-sum-body">
                                    <div className="km-total-row">
                                        <span className="km-total-lbl">Total</span>
                                        <span className="km-total-val">₹{total.toFixed(2)}</span>
                                    </div>

                                    <button
                                        className="km-checkout-btn"
                                        onClick={() => !hasOutOfStockItems && navigate('/checkout')}
                                        disabled={hasOutOfStockItems}
                                        style={{
                                            opacity: hasOutOfStockItems ? 0.5 : 1,
                                            cursor:  hasOutOfStockItems ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        Proceed to Checkout →
                                    </button>

                                    {hasOutOfStockItems && (
                                        <p style={{ fontSize: 11, color: '#B91C1C', textAlign: 'center', marginTop: 8, fontWeight: 600 }}>
                                            Please remove out-of-stock items
                                        </p>
                                    )}

                                    <div className="km-trust">
                                        <span>🔒 Secure</span>
                                        <span>🛡️ Safe Pay</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="km-empty">
                        <div className="km-empty-icon">🛒</div>
                        <h4>Your cart is empty</h4>
                        <p>Looks like you haven't added anything yet!</p>
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

const CART_STYLES = `
.cart-layout { 
  display: grid; 
  grid-template-columns: 1fr 340px; 
  gap: 24px; 
  align-items: start; 
}

@media(max-width:1024px){ 
  .cart-layout { 
    grid-template-columns: 1fr; 
  } 
}

@media (max-width: 768px) {
  .km-table thead { display: none; }

  .km-table, 
  .km-table tbody, 
  .km-table tr, 
  .km-table td { display: block; width: 100%; }

  .km-table tr {
    background: #fff;
    border: 1px solid #ede8e2;
    border-radius: 12px;
    margin-bottom: 16px;
    padding: 12px;
    position: relative;
  }

  .km-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border: none;
    font-size: 14px;
  }

  .km-table td:nth-child(2) {
    justify-content: flex-start;
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 12px;
    margin-bottom: 8px;
  }

  .km-table td:nth-child(3)::before { content: "Price";    font-weight: 600; color: #888; }
  .km-table td:nth-child(4)::before { content: "Qty";      font-weight: 600; color: #888; }
  .km-table td:nth-child(5)::before { content: "Subtotal"; font-weight: 600; color: #888; }

  .km-table td:nth-child(1) {
    position: absolute;
    top: 10px;
    right: 10px;
    width: auto;
  }

  .km-prod-cell { gap: 12px; }
  .km-img-w     { width: 60px; height: 60px; }
  .km-pname     { font-size: 15px; }
  .km-table td:nth-child(5) { justify-content: space-between; }
  .cart-sidebar { margin-top: 16px; }
}
`;

export default CartSection;

// ── Named exports required by App.js ─────────────────────────────────────────
export const useCart = (onNotLoggedIn, notify) => {
    const [cartItems, setCartItems] = useState([]);
    const customerId = getCustomerId();

    const syncLocalCart = useCallback((items) => {
        const localItems = (items || []).map((item) => ({
            cartId:    makeCartId(item.productId, item.variantId),
            id:        item.productId,
            name:      item.name,
            img:       item.img,
            price:     item.price,
            quantity:  item.quantity,
            weight:    item.weight,
            variantAttributes: item.variantAttributes,
            variantId: item.variantId,
            stock:     item.stock,
        }));
        localStorage.setItem('cart', JSON.stringify(localItems));
        window.dispatchEvent(new Event('storage'));
    }, []);

    const refreshCart = useCallback(async () => {
        const activeCustomerId = getCustomerId();
        if (!activeCustomerId) {
            setCartItems([]);
            return [];
        }

        try {
            const res = await getCart(activeCustomerId);
            const items = res.data || [];
            setCartItems(items);
            syncLocalCart(items);
            return items;
        } catch (err) {
            console.error('Cart fetch error:', err);
            notify?.('Could not load your cart. Please try again.', 'error');
            return [];
        }
    }, [notify, syncLocalCart]);

    useEffect(() => {
        refreshCart();
        const handleSync = () => refreshCart();
        window.addEventListener('authChange', handleSync);
        window.addEventListener('cartUpdated', handleSync);
        return () => {
            window.removeEventListener('authChange', handleSync);
            window.removeEventListener('cartUpdated', handleSync);
        };
    }, [refreshCart, customerId]);

    const addToCart = useCallback(async (product) => {
        const activeCustomerId = getCustomerId();
        if (!activeCustomerId) {
            storePendingShopAction('cart', product);
            onNotLoggedIn?.('cart', product);
            return false;
        }

        const payload = normalizeCartProduct(product);
        if (!payload.productId) {
            notify?.('Could not add this product to your cart.', 'error');
            return false;
        }

        const existingItem = cartItems.find((item) =>
            makeCartId(item.productId, item.variantId) === makeCartId(payload.productId, payload.variantId)
        );

        if (existingItem) {
            notify?.('Product already added to cart.', 'warning');
            return false;
        }

        if (Number(payload.stock) <= 0) {
            notify?.('This item is out of stock.', 'error');
            return false;
        }

        const desiredQuantity = Math.max(1, Number(payload.quantity) || 1);
        if (desiredQuantity > Number(payload.stock)) {
            notify?.(`Only ${payload.stock} item${payload.stock === 1 ? '' : 's'} available in stock.`, 'warning');
            return false;
        }

        try {
            const res = await apiAddToCart({ customerId: activeCustomerId, ...payload });
            const savedItem = res.data;
            setCartItems((prev) => {
                const itemKey = makeCartId(payload.productId, payload.variantId);
                const existingIndex = prev.findIndex((item) => makeCartId(item.productId, item.variantId) === itemKey);
                const next = [...prev];
                if (existingIndex >= 0) {
                    next[existingIndex] = savedItem;
                } else {
                    next.unshift(savedItem);
                }
                syncLocalCart(next);
                return next;
            });
            window.dispatchEvent(new Event('cartUpdated'));
            notify?.(`${payload.name} added to your cart.`, 'success');
            return true;
        } catch (err) {
            console.error('Add to cart error:', err);
            notify?.(err.response?.data?.error || 'Could not add item to cart. Please try again.', 'error');
            return false;
        }
    }, [cartItems, notify, onNotLoggedIn, syncLocalCart]);

    const deleteFromCart = useCallback(async (id) => {
        const item = cartItems.find((cartItem) => String(cartItem.id) === String(id));
        if (!item) return false;

        try {
            await removeCartItem(item.id);
            const next = cartItems.filter((cartItem) => cartItem.id !== item.id);
            setCartItems(next);
            syncLocalCart(next);
            notify?.(`${item.name} removed from your cart.`, 'success');
            return true;
        } catch (err) {
            console.error('Remove cart item error:', err);
            notify?.('Could not remove item from cart. Please try again.', 'error');
            return false;
        }
    }, [cartItems, notify, syncLocalCart]);

    const updateQuantity = useCallback(async (id, quantity) => {
        const item = cartItems.find((cartItem) => String(cartItem.id) === String(id));
        if (!item) return false;
        const qty = Math.max(1, Number(quantity) || 1);

        if (Number(item.stock) <= 0) {
            notify?.('This item is out of stock.', 'error');
            return false;
        }

        if (qty > Number(item.stock)) {
            notify?.(`Only ${item.stock} item${item.stock === 1 ? '' : 's'} available in stock.`, 'warning');
            return false;
        }

        try {
            const res = await updateCartItem(item.id, { quantity: qty });
            const next = cartItems.map((cartItem) => cartItem.id === item.id ? res.data : cartItem);
            setCartItems(next);
            syncLocalCart(next);
            notify?.('Cart quantity updated.', 'success');
            return true;
        } catch (err) {
            console.error('Update cart quantity error:', err);
            notify?.('Could not update cart quantity. Please try again.', 'error');
            return false;
        }
    }, [cartItems, notify, syncLocalCart]);

    const decreaseQuantity = useCallback((id) => {
        const item = cartItems.find((cartItem) => String(cartItem.id) === String(id));
        if (!item) return false;
        return updateQuantity(item.id, (item.quantity || 1) - 1);
    }, [cartItems, updateQuantity]);

    const clearCart = useCallback(async ({ silent = false } = {}) => {
        const activeCustomerId = getCustomerId();
        if (!activeCustomerId) {
            onNotLoggedIn?.();
            return false;
        }
        try {
            await apiClearCart(activeCustomerId);
            setCartItems([]);
            syncLocalCart([]);
            if (!silent) notify?.('Your cart has been cleared.', 'success');
            return true;
        } catch (err) {
            console.error('Clear cart error:', err);
            if (silent) {
                setCartItems([]);
                syncLocalCart([]);
            } else {
                notify?.('Could not clear your cart. Please try again.', 'error');
            }
            return false;
        }
    }, [notify, onNotLoggedIn, syncLocalCart]);

    return {
        cartItems,
        addToCart,
        decreaseQuantity,
        updateQuantity,
        deleteFromCart,
        clearCart,
        refreshCart,
    };
};

export const CartDrawer = () => null;
