import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import logo from "../../assets/AJNLogo.png";

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [{
      id: 'dashboard', label: 'Dashboard', icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    }],
  },
  {
    section: 'Marketing',
    items: [
      {
        id: 'promo-bar', label: 'Promo Bar', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="10" rx="2" />
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="13" y1="12" x2="18" y2="12" />
            <circle cx="11.5" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        )
      },
      {
        id: 'banners', label: 'Banners', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        )
      },
      {
        id: 'middle-banner', label: 'Middle Banner', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        )
      },
      {
        id: 'offer-banners', label: 'Offer Banners', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
        )
      },
      // { id: 'live-products', label: 'What More Live', icon: (
      //   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      //     <circle cx="12" cy="12" r="10"/>
      //     <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
      //   </svg>
      // )},
      {
        id: 'instagram-posts', label: 'Instagram Posts', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        )
      },
    ],
  },
  {
    section: 'Products',
    items: [
      {
        id: 'categories', label: 'Categories', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 20h16M4 4h6l2 3h8v13H4z" />
          </svg>
        )
      },
      // { id: 'brands', label: 'Brands', icon: (
      //   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      //     <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      //   </svg>
      // )},
      {
        id: 'products', label: 'Products', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 4v10" />
          </svg>
        )
      },
      {
        id: 'stock', label: 'Product Stock', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2" />
          </svg>
        )
      },
    ],
  },
  {
    section: 'Delivery',
    items: [
      {
        id: 'delivery-zones', label: 'Delivery Zones', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        )
      },
      {
        id: 'coupons', label: 'Coupons', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 5l-1.76 1.76a2 2 0 0 0 0 2.83l1.41 1.41a2 2 0 0 0 2.83 0L19 9.24" />
            <path d="M21 11.5V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3.5" />
            <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="3 3" />
          </svg>
        )
      },
    ],
  },
  {
    section: 'Orders',
    items: [
      {
        id: 'orders_new', label: 'New Orders', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M3 12h18" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        )
      },
      {
        id: 'orders_confirmed', label: 'Confirmed Orders', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )
      },
      {
        id: 'orders_shipped', label: 'Shipped Orders', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      },
      {
        id: 'orders_delivery', label: 'Out for Delivery', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        )
      },
      {
        id: 'orders_delivered', label: 'Delivered Orders', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
      }
    ],
  },
  {
    section: 'Product Review',
    items: [
      {
        id: 'reviews', label: 'Reviews', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )
      },
    ],
  },
  {
    section: 'Users',
    items: [
      {
        id: 'customers', label: 'Customers', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
    ],
  },
  {
    section: 'Support',
    items: [
      {
        id: 'contacts', label: 'Contact Requests', icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        )
      },
    ],
  },
];

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const activePage = location.pathname.split('/')[1] || 'dashboard';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoText}>
          <div className={styles.logoK}><img src={logo} alt="" /></div>
          <div>
            <div className={styles.logoName}>Vika Vastra</div>
            <div className={styles.logoSub}>ADMIN PANEL</div>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <div className={styles.navSection}>{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.id}
                to={`/${item.id}`}
                className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.logoutIcon}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
