import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import ScrollToTop from "./helpers/scroll-top";

import { useCart } from "./wrappers/header/Cart";
import { useWishlist } from "./wrappers/header/Wishlist";
import { isLoggedIn } from "./utils/Auth";
import { storePendingShopAction } from "./utils/shopActions";
import ForgotPassword from "./pages/other/ForgotPassword";

const HomeCosmetics = lazy(() => import("./wrappers/header/HomeCosmetics"));
const About = lazy(() => import("./wrappers/About/About"));
const ShopGridStandard = lazy(() => import("./wrappers/Shop/ShopGridStandard"));
const ProductView = lazy(() => import("./wrappers/Shop/Productview"));
const Contact = lazy(() => import("./wrappers/Contact/Contact"));
const MyAccount = lazy(() => import("./pages/other/MyAccount"));
const LoginRegister = lazy(() => import("./pages/other/LoginRegister"));
const CartPage = lazy(() => import("./wrappers/header/Cart"));
const WishlistPage = lazy(() => import("./wrappers/header/Wishlist"));
const Checkout = lazy(() => import("./pages/other/Checkout"));
const ThankYou = lazy(() => import("./pages/other/Thankyou"));
const MyOrders = lazy(() => import("./pages/other/Myorders"));
const PolicyPage = lazy(() => import("./pages/other/PolicyPage"));

const DEFAULT_CURRENCY = { currencySymbol: "₹", currencyRate: 1 };

const AppToast = ({ toast }) => {
  if (!toast) return null;

  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";

  return (
    <>
      <style>{`
        @keyframes appToastIn {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 99999,
          background: isError ? "#fff5f5" : isWarning ? "#fffaf0" : "#720E1E",
          color: isError ? "#b42318" : isWarning ? "#8a5a00" : "#F8F6F2",
          border: `1px solid ${isError ? "#fecaca" : isWarning ? "#f4d58d" : "#C9933A"}`,
          padding: "12px 20px",
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "'Jost', sans-serif",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          animation: "appToastIn 0.3s ease",
          minWidth: 260,
          maxWidth: 360,
        }}
      >
        <span style={{ color: isError ? "#b42318" : "#C9933A", fontWeight: 800 }}>
          {isError ? "!" : isWarning ? "i" : "OK"}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{toast.title}</div>
          <div style={{ fontSize: 11, opacity: 0.92 }}>{toast.message}</div>
        </div>
      </div>
    </>
  );
};

const Preloader = () => (
  <div className="flone-preloader-wrapper">
    <div className="flone-preloader">
      <span />
      <span />
    </div>
  </div>
);

const AppInner = () => {
  const navigate = useNavigate();
  const [appToast, setAppToast] = useState(null);
  const toastActiveRef = useRef(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success", title) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const fallbackTitle = type === "error" ? "Error" : type === "warning" ? "Please note" : "Success";
    setAppToast({ message, type, title: title || fallbackTitle });
    toastTimerRef.current = setTimeout(() => setAppToast(null), 2800);
  }, []);

  const handleNotLoggedIn = useCallback(
    (action, product) => {
      if (isLoggedIn()) return;
      if (action && product) storePendingShopAction(action, product);
      if (toastActiveRef.current) return;

      toastActiveRef.current = true;
      showToast("Please login to continue. Redirecting...", "warning", "Login Required");

      setTimeout(() => {
        toastActiveRef.current = false;
        navigate(process.env.PUBLIC_URL + "/login-register");
      }, 1200);
    },
    [navigate, showToast]
  );

  const cart = useCart(handleNotLoggedIn, showToast);
  const wishlist = useWishlist(handleNotLoggedIn, showToast);

  const shop = {
    cartItems: cart.cartItems,
    addToCart: cart.addToCart,
    decreaseQuantity: cart.decreaseQuantity,
    updateQuantity: cart.updateQuantity,
    deleteFromCart: cart.deleteFromCart,
    clearCart: cart.clearCart,
    refreshCart: cart.refreshCart,

    wishlistItems: wishlist.wishlistItems,
    addToWishlist: wishlist.addToWishlist,
    deleteFromWishlist: wishlist.deleteFromWishlist,
    refreshWishlist: wishlist.refreshWishlist,

    currency: DEFAULT_CURRENCY,
    openCartDrawer: () => navigate(process.env.PUBLIC_URL + "/cart"),
    openWishlistDrawer: () => navigate(process.env.PUBLIC_URL + "/wishlist"),
    onNotLoggedIn: handleNotLoggedIn,
    showToast,
  };

  return (
    <ScrollToTop>
      <Suspense fallback={<Preloader />}>
        <Routes>
          <Route path={process.env.PUBLIC_URL + "/"} element={<HomeCosmetics shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/home-cosmetics"} element={<HomeCosmetics shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/shop"} element={<ShopGridStandard shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/product/:id"} element={<ProductView shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/about"} element={<About shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/contact"} element={<Contact shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/my-account"} element={<MyAccount shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/login-register"} element={<LoginRegister shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/cart"} element={<CartPage shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/wishlist"} element={<WishlistPage shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/checkout"} element={<Checkout shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/thank-you"} element={<ThankYou shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/my-orders"} element={<MyOrders shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/forgot-password"} element={<ForgotPassword shop={shop} />} />
          <Route path={process.env.PUBLIC_URL + "/shipping-policy"} element={<PolicyPage shop={shop} />} />
<Route path={process.env.PUBLIC_URL + "/return-policy"} element={<PolicyPage shop={shop} />} />
<Route path={process.env.PUBLIC_URL + "/privacy-policy"} element={<PolicyPage shop={shop} />} />
<Route path={process.env.PUBLIC_URL + "/terms"} element={<PolicyPage shop={shop} />} />
        </Routes>
      </Suspense>
      <AppToast toast={appToast} />
    </ScrollToTop>
  );
};

const App = () => (
  <Router>
    <AppInner />
  </Router>
);

export default App;
