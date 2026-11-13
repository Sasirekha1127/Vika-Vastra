// src/pages/other/MyAccount.js
import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutOne from "../../layouts/LayoutOne";
import {
    getCustomerAddresses,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress
} from "../../api";

// FIX: Read ID from "user" or "customer" key — both are set on login.
// Never fall back to a hardcoded number; redirect to login instead.
const getCustomerId = () => {
    try {
        const user     = JSON.parse(localStorage.getItem("user")     || "null");
        const customer = JSON.parse(localStorage.getItem("customer") || "null");
        return user?.id ?? customer?.id ?? null;
    } catch (error) {
        console.error("Error getting customer ID:", error);
        return null;
    }
};

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const accountStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600;700&display=swap');

  .acc-page {
    background: #faf8f5;
    min-height: 70vh;
    padding: 60px 0 80px;
  }

  .gold-grad {
    background: linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gold-bar {
    height: 3px;
    background: linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
    border-radius: 2px;
  }

  .acc-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 4px;
    letter-spacing: 0.01em;
  }
  .acc-subtitle {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #B38728;
    margin: 0 0 32px;
  }

  .acc-card {
    background: #fff;
    border: 1px solid #ede8e2;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 32px rgba(179,135,40,0.06);
    margin-bottom: 16px;
  }
  .acc-card::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
  }

  .acc-profile-card {
    padding: 28px 20px 24px;
    text-align: center;
  }
  .acc-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #BF953F, #AA771C);
    color: #fff;
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
    box-shadow: 0 4px 18px rgba(179,135,40,0.30);
  }
  .acc-profile-name {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 16px;
    color: #111;
    margin: 0 0 4px;
  }
  .acc-profile-email {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #aaa;
    margin: 0;
    letter-spacing: 0.02em;
  }

  .acc-links-card {
    padding: 20px;
  }
  .acc-links-heading {
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #B38728;
    margin: 0 0 14px;
  }
  .acc-link-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 10px;
    border-radius: 5px;
    color: #444;
    text-decoration: none;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.18s, color 0.18s;
    letter-spacing: 0.02em;
  }
  .acc-link-item i {
    font-size: 17px;
    color: #B38728;
    opacity: 0.8;
    transition: opacity 0.18s;
  }
  .acc-link-item:hover {
    background: #faf4e8;
    color: #B38728;
  }
  .acc-link-item:hover i {
    opacity: 1;
  }

  .acc-details-card {
    padding: 30px 32px;
  }
  .acc-details-heading {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    color: #111;
    margin: 0 0 6px;
  }
  .acc-details-divider {
    height: 2px;
    width: 40px;
    background: linear-gradient(90deg, #BF953F, #AA771C);
    border-radius: 2px;
    margin-bottom: 24px;
  }
  .acc-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid #f3ede3;
  }
  .acc-row:last-of-type {
    border-bottom: none;
  }
  .acc-row-label {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #aaa;
  }
  .acc-row-value {
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: #222;
    font-weight: 500;
  }

  .acc-address-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    border-bottom: 2px solid #ede8e2;
    padding-bottom: 0;
  }
  .acc-address-tab {
    padding: 10px 24px;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #888;
    cursor: pointer;
    border: none;
    background: none;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    letter-spacing: 0.04em;
    position: relative;
  }
  .acc-address-tab:hover {
    color: #B38728;
  }
  .acc-address-tab.active {
    color: #B38728;
    border-bottom-color: #B38728;
  }
  .acc-address-tab .badge {
    background: #ede8e2;
    color: #666;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    margin-left: 6px;
    transition: all 0.3s ease;
  }
  .acc-address-tab.active .badge {
    background: #B38728;
    color: #fff;
  }

  .acc-address-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .acc-address-heading {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: #111;
    margin: 0;
  }

  .acc-address-list {
    margin-top: 4px;
  }
  .acc-address-item {
    background: #faf8f5;
    border: 1px solid #ede8e2;
    border-radius: 6px;
    padding: 16px 18px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .acc-address-item:hover {
    border-color: #B38728;
    box-shadow: 0 2px 12px rgba(179,135,40,0.08);
  }
  .acc-address-type-badge {
    display: inline-block;
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 12px;
    background: #ede8e2;
    color: #888;
    margin-bottom: 6px;
  }
  .acc-address-type-badge.billing {
    background: #e8f0fe;
    color: #1a56db;
  }
  .acc-address-type-badge.shipping {
    background: #fef3e8;
    color: #b45309;
  }
  .acc-address-text {
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #444;
    line-height: 1.6;
    margin: 0;
  }
  .acc-address-meta {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    color: #888;
    margin-top: 4px;
  }
  .acc-address-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
    margin-left: 12px;
  }
  .acc-address-btn {
    background: none;
    border: none;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #aaa;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 3px;
    transition: color 0.2s, background 0.2s;
  }
  .acc-address-btn:hover {
    color: #B38728;
    background: #f3ede3;
  }
  .acc-address-btn-danger:hover {
    color: #c0392b;
    background: #fdf3f2;
  }
  .acc-address-empty {
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #aaa;
    text-align: center;
    padding: 30px 0;
  }
  .acc-address-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background: transparent;
    border: 2px dashed #B38728;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #B38728;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .acc-address-add-btn:hover {
    background: #faf4e8;
    color: #8a6a1f;
  }

  .acc-edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 28px;
    padding: 12px 28px;
    background: linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
    background-size: 200% auto;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-position 0.4s ease, opacity 0.2s;
    box-shadow: 0 4px 18px rgba(179,135,40,0.22);
  }
  .acc-edit-btn:hover {
    background-position: right center;
    opacity: 0.92;
  }

  .acc-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20, 15, 5, 0.52);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    backdrop-filter: blur(2px);
  }
  .acc-modal {
    background: #fff;
    border-radius: 8px;
    width: 100%;
    max-width: 550px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 16px 64px rgba(0,0,0,0.22);
  }
  .acc-modal::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
  }
  .acc-modal-header {
    padding: 18px 24px;
    border-bottom: 1px solid #ede8e2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #faf8f5;
  }
  .acc-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: #222;
    letter-spacing: 0.02em;
  }
  .acc-modal-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #aaa;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s;
    padding: 0;
  }
  .acc-modal-close:hover { color: #B38728; }
  .acc-modal-body {
    padding: 28px 28px 32px;
  }

  .acc-field { margin-bottom: 18px; }
  .acc-field-label {
    display: block;
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 7px;
  }
  .acc-field-label span { color: #c0392b; }
  .acc-field-input-wrap { position: relative; }
  .acc-field-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #ccc;
    font-size: 15px;
    pointer-events: none;
    transition: color 0.2s;
  }
  .acc-field-input {
    width: 100%;
    padding: 12px 14px 12px 40px;
    border: 1px solid #e8e3dc;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    background: #faf8f5;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .acc-field-input:focus {
    border-color: #B38728;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(179,135,40,0.09);
  }
  .acc-field-input-wrap:focus-within .acc-field-icon { color: #B38728; }

  .acc-modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 6px;
  }
  .acc-modal-save {
    flex: 1;
    padding: 13px;
    background: linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%);
    background-size: 200% auto;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-position 0.4s, opacity 0.2s;
  }
  .acc-modal-save:hover { background-position: right center; opacity: 0.92; }
  .acc-modal-cancel {
    flex: 1;
    padding: 13px;
    background: transparent;
    color: #777;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .acc-modal-cancel:hover { border-color: #B38728; color: #B38728; }

  .acc-address-type-select {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e8e3dc;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: #1a1a1a;
    background: #faf8f5;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B38728' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    cursor: pointer;
  }
  .acc-address-type-select:focus {
    border-color: #B38728;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(179,135,40,0.09);
  }

  .acc-success-msg {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 5px;
    padding: 10px 14px;
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #166534;
    margin-bottom: 16px;
  }

  .acc-not-logged-in {
    text-align: center;
    padding: 80px 20px;
    font-family: 'Jost', sans-serif;
  }
  .acc-not-logged-in p {
    font-size: 15px;
    color: #666;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    .acc-details-card { padding: 22px 18px; }
    .acc-modal-body { padding: 20px 18px 24px; }
    .acc-address-item { flex-direction: column; gap: 8px; }
    .acc-address-actions { margin-left: 0; }
    .acc-address-tabs { overflow-x: auto; }
    .acc-address-tab { padding: 8px 14px; font-size: 11px; white-space: nowrap; }
  }
`;

const MyAccount = ({ shop }) => {
  const navigate = useNavigate();

  // FIX: Resolve customer ID at render time (not module load time),
  // so it picks up the value after login without a page reload.
  const CUSTOMER_ID = getCustomerId();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
  });

  const [editData, setEditData] = useState({ ...profile });

  const [addressForm, setAddressForm] = useState({
    type: "billing",
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    phone2: "",
    email: "",
  });

  // FIX: Redirect to login if not authenticated
  useEffect(() => {
    if (!CUSTOMER_ID) {
      navigate(process.env.PUBLIC_URL + "/login-register");
      return;
    }

    const loadCustomerData = async () => {
      try {
        // Load profile from userlogin via /api/customers/:id
        const res = await fetch(`${API_BASE}/customers/${CUSTOMER_ID}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            username: data.username || "",
            email:    data.email    || "",
            phone:    data.phone    || "",
          });
          // Pre-fill editData too so the edit modal opens with current values
          setEditData({
            username: data.username || "",
            email:    data.email    || "",
            phone:    data.phone    || "",
          });
        } else {
          console.error("Failed to load customer:", res.status);
        }

        // Load addresses
        await loadAddresses(CUSTOMER_ID);
      } catch (err) {
        console.error("Error loading customer data:", err);
      }
    };

    loadCustomerData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CUSTOMER_ID]);

  const loadAddresses = async (customerId) => {
    try {
      const response = await getCustomerAddresses(customerId);
      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error loading addresses:", err);
      setAddresses([]);
    }
  };

  const avatarLetter = profile.username?.charAt(0).toUpperCase() || "U";

  // FIX: Profile update hits /api/user/update-profile (userlogin table)
  // instead of /api/customers/update/:id (Customers table)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:       CUSTOMER_ID,
          username: editData.username,
          email:    editData.email,
          phone:    editData.phone
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.user || editData;
        const newProfile = {
          username: updated.username || editData.username,
          email:    updated.email    || editData.email,
          phone:    updated.phone    || editData.phone,
        };
        setProfile(newProfile);
        // Keep localStorage in sync
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user",     JSON.stringify({ ...stored, ...newProfile }));
        localStorage.setItem("customer", JSON.stringify({ ...stored, ...newProfile }));

        setShowEditModal(false);
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const err = await res.json();
        alert(err.error || err.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (editingAddressId) {
        response = await updateCustomerAddress(CUSTOMER_ID, editingAddressId, addressForm);
      } else {
        response = await addCustomerAddress(CUSTOMER_ID, addressForm);
      }

      if (response.data.success) {
        await loadAddresses(CUSTOMER_ID);
        setShowAddressModal(false);
        resetAddressForm();
        setSuccessMsg(editingAddressId ? "Address updated!" : "Address added!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert(response.data.message || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      alert(err.response?.data?.message || "Error saving address: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      await deleteCustomerAddress(CUSTOMER_ID, addressId);
      await loadAddresses(CUSTOMER_ID);
      setSuccessMsg("Address deleted!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error deleting address:", err);
      alert(err.response?.data?.message || "Failed to delete address");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      type:      address.type      || "billing",
      firstName: address.firstName || "",
      lastName:  address.lastName  || "",
      company:   address.company   || "",
      address1:  address.address1  || "",
      address2:  address.address2  || "",
      city:      address.city      || "",
      state:     address.state     || "",
      postcode:  address.postcode  || "",
      phone:     address.phone     || "",
      phone2:    address.phone2    || "",
      email:     address.email     || "",
    });
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({
      type: "billing", firstName: "", lastName: "", company: "",
      address1: "", address2: "", city: "", state: "",
      postcode: "", phone: "", phone2: "", email: "",
    });
  };

  const formatAddress = (addr) => {
    return [
      addr.firstName, addr.lastName, addr.company,
      addr.address1, addr.address2, addr.city, addr.state, addr.postcode,
    ].filter(Boolean).join(", ");
  };

  const getFilteredAddresses = () => {
    if (activeTab === "all") return addresses;
    return addresses.filter(addr => addr.type === activeTab);
  };

  const filteredAddresses = getFilteredAddresses();
  const billingCount  = addresses.filter(a => a.type === "billing").length;
  const shippingCount = addresses.filter(a => a.type === "shipping").length;

  // FIX: Show a proper message while redirecting instead of broken page
  if (!CUSTOMER_ID) {
    return (
      <Fragment>
        <style>{accountStyles}</style>
        <LayoutOne shop={shop} headerTop="visible">
          <div className="acc-page">
            <div className="container">
              <div className="acc-not-logged-in">
                <p>Please log in to view your account.</p>
                <Link to={process.env.PUBLIC_URL + "/login-register"} className="acc-edit-btn">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </LayoutOne>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <style>{accountStyles}</style>
      <LayoutOne shop={shop} headerTop="visible">
        <div className="acc-page">
          <div className="container">
            <h2 className="acc-title">My Account</h2>
            <p className="acc-subtitle">Manage your profile &amp; addresses</p>

            {successMsg && <div className="acc-success-msg">✅ {successMsg}</div>}

            <div className="row">
              {/* LEFT SIDEBAR */}
              <div className="col-lg-3 col-md-4" style={{ marginBottom: "24px" }}>
                <div className="acc-card">
                  <div className="acc-profile-card">
                    <div className="acc-avatar">{avatarLetter}</div>
                    <p className="acc-profile-name">{profile.username}</p>
                    <p className="acc-profile-email">{profile.email}</p>
                  </div>
                </div>

                <div className="acc-card">
                  <div className="acc-links-card">
                    <p className="acc-links-heading">Quick Links</p>
                    {[
                      { icon: "pe-7s-box2",     label: "My Orders", to: "/my-orders" },
                      { icon: "pe-7s-like",      label: "Wishlist",  to: "/wishlist"  },
                      { icon: "pe-7s-shopbag",   label: "Cart",      to: "/cart"      },
                    ].map(({ icon, label, to }) => (
                      <Link
                        key={label}
                        to={process.env.PUBLIC_URL + to}
                        className="acc-link-item"
                      >
                        <i className={icon} />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT CONTENT */}
              <div className="col-lg-9 col-md-8">
                <div className="acc-card">
                  <div className="acc-details-card">
                    <h4 className="acc-details-heading">Account Details</h4>
                    <div className="acc-details-divider" />

                    {[
                      { label: "Username", value: profile.username },
                      { label: "Email",    value: profile.email    },
                      { label: "Phone",    value: profile.phone || "—" },
                    ].map(({ label, value }) => (
                      <div key={label} className="acc-row">
                        <span className="acc-row-label">{label}</span>
                        <span className="acc-row-value">{value}</span>
                      </div>
                    ))}

                    <button
                      className="acc-edit-btn"
                      onClick={() => { setEditData({ ...profile }); setShowEditModal(true); }}
                    >
                      <i className="pe-7s-pen" style={{ fontSize: "14px" }} />
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* ── Address Section ── */}
                <div className="acc-card">
                  <div className="acc-details-card">
                    <div className="acc-address-section-header">
                      <h4 className="acc-address-heading">Saved Addresses</h4>
                      <button
                        className="acc-address-add-btn"
                        onClick={() => { resetAddressForm(); setShowAddressModal(true); }}
                      >
                        <i className="pe-7s-plus" />
                        Add Address
                      </button>
                    </div>
                    <div className="acc-details-divider" />

                    {/* Tabs */}
                    <div className="acc-address-tabs">
                      <button
                        className={`acc-address-tab ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                      >
                        All <span className="badge">{addresses.length}</span>
                      </button>
                      <button
                        className={`acc-address-tab ${activeTab === "billing" ? "active" : ""}`}
                        onClick={() => setActiveTab("billing")}
                      >
                        Billing <span className="badge">{billingCount}</span>
                      </button>
                      <button
                        className={`acc-address-tab ${activeTab === "shipping" ? "active" : ""}`}
                        onClick={() => setActiveTab("shipping")}
                      >
                        Shipping <span className="badge">{shippingCount}</span>
                      </button>
                    </div>

                    <div className="acc-address-list">
                      {filteredAddresses.length === 0 ? (
                        <div className="acc-address-empty">
                          {activeTab === "all"
                            ? "No saved addresses yet."
                            : `No ${activeTab} addresses saved yet.`}
                          <br />
                          <button
                            className="acc-address-add-btn"
                            onClick={() => {
                              resetAddressForm();
                              setAddressForm(prev => ({ ...prev, type: activeTab === "all" ? "billing" : activeTab }));
                              setShowAddressModal(true);
                            }}
                            style={{ marginTop: 12 }}
                          >
                            <i className="pe-7s-plus" />
                            Add {activeTab === "all" ? "Address" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Address
                          </button>
                        </div>
                      ) : (
                        filteredAddresses.map((addr) => (
                          <div key={addr.id} className="acc-address-item">
                            <div style={{ flex: 1 }}>
                              <span className={`acc-address-type-badge ${addr.type}`}>
                                {addr.type === "billing" ? "Billing" : "Shipping"}
                              </span>
                              <p className="acc-address-text">{formatAddress(addr)}</p>
                              <div className="acc-address-meta">
                                {addr.phone && <span>📞 {addr.phone}</span>}
                                {addr.phone && addr.email && <span style={{ margin: "0 6px" }}>•</span>}
                                {addr.email && <span>✉ {addr.email}</span>}
                              </div>
                            </div>
                            <div className="acc-address-actions">
                              <button
                                className="acc-address-btn"
                                onClick={() => handleEditAddress(addr)}
                              >
                                Edit
                              </button>
                              <button
                                className="acc-address-btn acc-address-btn-danger"
                                onClick={() => handleDeleteAddress(addr.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── EDIT PROFILE MODAL ── */}
        {showEditModal && (
          <div className="acc-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
            <div className="acc-modal">
              <div className="acc-modal-header">
                <span className="acc-modal-title">Edit Profile</span>
                <button className="acc-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
              </div>
              <div className="acc-modal-body">
                <form onSubmit={handleSaveProfile}>
                  {[
                    { label: "Username", key: "username", type: "text",  icon: "pe-7s-user", required: true  },
                    { label: "Email",    key: "email",    type: "email", icon: "pe-7s-mail", required: true  },
                    { label: "Phone",    key: "phone",    type: "tel",   icon: "pe-7s-call", required: false },
                  ].map(({ label, key, type, icon, required }) => (
                    <div key={key} className="acc-field">
                      <label className="acc-field-label">
                        {label} {required && <span>*</span>}
                      </label>
                      <div className="acc-field-input-wrap">
                        <i className={`${icon} acc-field-icon`} />
                        <input
                          type={type}
                          className="acc-field-input"
                          value={editData[key]}
                          onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                          required={required}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="acc-modal-actions">
                    <button type="submit" className="acc-modal-save" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" className="acc-modal-cancel" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── ADDRESS MODAL ── */}
        {showAddressModal && (
          <div className="acc-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowAddressModal(false); }}>
            <div className="acc-modal">
              <div className="acc-modal-header">
                <span className="acc-modal-title">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </span>
                <button className="acc-modal-close" onClick={() => setShowAddressModal(false)}>✕</button>
              </div>
              <div className="acc-modal-body">
                <form onSubmit={handleSaveAddress}>
                  <div className="acc-field">
                    <label className="acc-field-label">Address Type <span>*</span></label>
                    <select
                      className="acc-address-type-select"
                      value={addressForm.type}
                      onChange={e => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="billing">Billing Address</option>
                      <option value="shipping">Shipping Address</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <div className="acc-field">
                      <label className="acc-field-label">First Name <span>*</span></label>
                      <input
                        className="acc-field-input"
                        style={{ paddingLeft: "14px" }}
                        value={addressForm.firstName}
                        onChange={e => setAddressForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="acc-field">
                      <label className="acc-field-label">Last Name <span>*</span></label>
                      <input
                        className="acc-field-input"
                        style={{ paddingLeft: "14px" }}
                        value={addressForm.lastName}
                        onChange={e => setAddressForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-field-label">Company</label>
                    <input
                      className="acc-field-input"
                      style={{ paddingLeft: "14px" }}
                      value={addressForm.company}
                      onChange={e => setAddressForm(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>

                  <div className="acc-field">
                    <label className="acc-field-label">Street Address <span>*</span></label>
                    <input
                      className="acc-field-input"
                      style={{ paddingLeft: "14px" }}
                      placeholder="House number and street name"
                      value={addressForm.address1}
                      onChange={e => setAddressForm(prev => ({ ...prev, address1: e.target.value }))}
                      required
                    />
                    <input
                      className="acc-field-input"
                      style={{ paddingLeft: "14px", marginTop: "8px" }}
                      placeholder="Apartment, suite, unit (optional)"
                      value={addressForm.address2}
                      onChange={e => setAddressForm(prev => ({ ...prev, address2: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <div className="acc-field">
                      <label className="acc-field-label">City <span>*</span></label>
                      <input
                        className="acc-field-input"
                        style={{ paddingLeft: "14px" }}
                        value={addressForm.city}
                        onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="acc-field">
                      <label className="acc-field-label">State <span>*</span></label>
                      <input
                        className="acc-field-input"
                        style={{ paddingLeft: "14px" }}
                        value={addressForm.state}
                        onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-field-label">Postcode / ZIP <span>*</span></label>
                    <input
                      className="acc-field-input"
                      style={{ paddingLeft: "14px" }}
                      value={addressForm.postcode}
                      onChange={e => setAddressForm(prev => ({ ...prev, postcode: e.target.value }))}
                      required
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <div className="acc-field">
                      <label className="acc-field-label">Phone <span>*</span></label>
                      <input
                        className="acc-field-input"
                        style={{ paddingLeft: "14px" }}
                        value={addressForm.phone}
                        onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="acc-field">
                      <label className="acc-field-label">Alternate Phone</label>
                      <input
                        className="acc-field-input"
                        style={{ paddingLeft: "14px" }}
                        value={addressForm.phone2}
                        onChange={e => setAddressForm(prev => ({ ...prev, phone2: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="acc-field">
                    <label className="acc-field-label">Email Address <span>*</span></label>
                    <input
                      type="email"
                      className="acc-field-input"
                      style={{ paddingLeft: "14px" }}
                      value={addressForm.email}
                      onChange={e => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="acc-modal-actions">
                    <button type="submit" className="acc-modal-save" disabled={loading}>
                      {loading ? "Saving..." : (editingAddressId ? "Update Address" : "Add Address")}
                    </button>
                    <button type="button" className="acc-modal-cancel" onClick={() => setShowAddressModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </LayoutOne>
    </Fragment>
  );
};

export default MyAccount;