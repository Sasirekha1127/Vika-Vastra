import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Link } from "react-router-dom";

const GOLD = "#C59B27";
const GOLD_LIGHT = "#DFB143";
const GOLD_BORDER = "rgba(197,155,39,0.35)";
const TEXT_LIGHT = "#FAF7F2";

/* plum palette taken from the reference screenshot */
const PLUM_MID = "#5a0b53";
const PLUM_DEEP = "#3f063e";
const PLUM_EDGE = "#34052f";
const PLUM_BAR = "rgba(38, 3, 36, 0.62)";

/* ── Decorative flower (soft petals, corner ornament) ── */
const FlowerDecor = ({ id }) => (
  <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-g`} cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#7a1a72" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#5d0d57" stopOpacity="0.85" />
      </radialGradient>
      <radialGradient id={`${id}-c`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8d2a84" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#6a1363" stopOpacity="0.6" />
      </radialGradient>
    </defs>
    <g transform="translate(120 120)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path
          key={`o${a}`}
          transform={`rotate(${a})`}
          d="M0 0 C-26 -34 -22 -88 0 -112 C22 -88 26 -34 0 0 Z"
          fill={`url(#${id}-g)`}
          opacity="0.9"
        />
      ))}
      {[22, 67, 112, 157, 202, 247, 292, 337].map((a) => (
        <path
          key={`i${a}`}
          transform={`rotate(${a})`}
          d="M0 0 C-17 -22 -14 -58 0 -74 C14 -58 17 -22 0 0 Z"
          fill={`url(#${id}-c)`}
          opacity="0.85"
        />
      ))}
      <circle r="9" fill="#9a3590" opacity="0.7" />
    </g>
  </svg>
);

/* ── Small reusable link with sliding chevron ── */
const FooterLink = ({ to, children }) => (
  <Link to={process.env.PUBLIC_URL + to} className="footer-link">
    <span className="footer-link-chevron">›</span>
    {children}
  </Link>
);

const FooterOne = ({
  backgroundColorClass,
  spaceTopClass,
  spaceBottomClass,
  spaceLeftClass,
  spaceRightClass,
  containerClass,
  extraFooterClass,
}) => {
  const footerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  /* Start the entrance sequence once the footer scrolls into view */
  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Shop", to: "/shop" },
    { label: "Contact us", to: "/contact" },
  ];

  const supportLinks = [
    { label: "Shipping Policy", to: "/shipping-policy" },
    { label: "Return Policy", to: "/return-policy" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  const instagramAccounts = [
    { label: "@vika_vastra", url: "" },
    { label: "@v_ka_vasthra", url: "" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Poppins:wght@300;400;500;600;700&display=swap');

        /* ── plum footer background (gradient + fine vertical stripes) ── */
        .footer-area {
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', sans-serif !important;
          font-weight: 400 !important;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.022) 0px,
              rgba(255, 255, 255, 0.022) 1px,
              rgba(0, 0, 0, 0.03) 1px,
              rgba(0, 0, 0, 0.03) 3px
            ),
            radial-gradient(ellipse at 50% 35%, ${PLUM_MID} 0%, ${PLUM_DEEP} 62%, ${PLUM_EDGE} 100%) !important;
          background-color: ${PLUM_DEEP} !important;
        }

        /* ───────────── ANIMATIONS ───────────── */

        /* 1. Gold light sweeping along the top border (runs once, then every 9s) */
        .footer-area::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          width: 100%;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(90deg, transparent 0%, ${GOLD_LIGHT} 50%, transparent 100%);
          background-size: 35% 100%;
          background-repeat: no-repeat;
          background-position: -40% 0;
        }
        .footer-area.is-visible::before {
          animation: footerSweep 9s ease-in-out 0.4s infinite;
        }
        @keyframes footerSweep {
          0%   { background-position: -40% 0; }
          22%  { background-position: 140% 0; }
          100% { background-position: 140% 0; }
        }

        /* 2. Orchestrated entrance — each block rises in, one after another */
        .footer-reveal {
          opacity: 0;
          transform: translateY(22px);
        }
        .footer-area.is-visible .footer-reveal {
          animation: footerRise 0.8s cubic-bezier(0.22, 0.8, 0.28, 1) both;
          animation-delay: calc(var(--i, 0) * 130ms + 150ms);
        }
        @keyframes footerRise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* 3. Heading underline draws itself in gold */
        .footer-heading { position: relative; }
        .footer-heading::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -1.5px;
          height: 1.5px;
          width: 0;
          background: ${GOLD_LIGHT};
        }
        .footer-area.is-visible .footer-heading::after {
          animation: footerDraw 0.9s ease-out both;
          animation-delay: calc(var(--i, 0) * 130ms + 700ms);
        }
        @keyframes footerDraw {
          from { width: 0; }
          to   { width: 46px; }
        }

        /* 4. Slow drifting flowers (ambient, kept subtle) */
        .footer-flower-svg {
          width: 100%;
          height: 100%;
          display: block;
          will-change: transform;
        }
        .footer-flower--tr .footer-flower-svg { animation: flowerSpin 90s linear infinite; }
        .footer-flower--bl .footer-flower-svg { animation: flowerSpinRev 110s linear infinite; }
        .footer-flower--br .footer-flower-svg { animation: flowerBreathe 14s ease-in-out infinite; }
        @keyframes flowerSpin    { to { transform: rotate(360deg); } }
        @keyframes flowerSpinRev { to { transform: rotate(-360deg); } }
        @keyframes flowerBreathe {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50%      { transform: scale(1.07) rotate(8deg); }
        }

        /* 5. Gold shimmer travelling across the brand name */
        .footer-logo-shimmer {
          background: linear-gradient(100deg, ${GOLD} 0%, ${GOLD_LIGHT} 35%, #fff3c9 50%, ${GOLD_LIGHT} 65%, ${GOLD} 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          filter: drop-shadow(0 2px 8px rgba(223, 177, 67, 0.35));
        }
        .footer-area.is-visible .footer-logo-shimmer {
          animation: logoShimmer 6s ease-in-out 1.2s infinite;
        }
        @keyframes logoShimmer {
          0%   { background-position: 100% 0; }
          40%  { background-position: 0% 0; }
          100% { background-position: 0% 0; }
        }

        /* 6. Logo tile reacts to hover */
        .footer-logo-tile { transition: transform 0.35s cubic-bezier(0.22, 0.8, 0.28, 1), box-shadow 0.35s ease; }
        .footer-brand-logo:hover .footer-logo-tile {
          transform: translateY(-3px) rotate(-3deg);
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.35), 0 0 0 2px ${GOLD_BORDER};
        }

        /* 7. WhatsApp icon pulse ring */
        .footer-wa-icon { position: relative; display: inline-flex; }
        .footer-wa-icon::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid #4ade80;
          opacity: 0;
          animation: waPulse 2.8s ease-out infinite;
        }
        @keyframes waPulse {
          0%   { transform: scale(0.7); opacity: 0.7; }
          70%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        /* ───────────── LINKS & HOVERS ───────────── */
        .footer-link {
          font-family: 'Poppins', sans-serif;
          font-weight: 400;
          color: ${TEXT_LIGHT};
          font-size: 13.5px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          position: relative;
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 17px;
          right: 0;
          bottom: -2px;
          height: 1px;
          background: ${GOLD_LIGHT};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .footer-link-chevron {
          font-size: 11px;
          color: ${GOLD};
          opacity: 0.9;
          margin-right: 2px;
          transition: transform 0.25s ease;
        }
        .footer-link:hover,
        .footer-link:focus-visible { color: ${GOLD_LIGHT}; transform: translateX(3px); outline: none; }
        .footer-link:hover::after,
        .footer-link:focus-visible::after { transform: scaleX(1); }
        .footer-link:hover .footer-link-chevron,
        .footer-link:focus-visible .footer-link-chevron { transform: translateX(3px); }

        .footer-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: ${TEXT_LIGHT};
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
          width: fit-content;
          transition: color 0.25s ease, transform 0.25s ease;
        }
        .footer-contact-link:hover,
        .footer-contact-link:focus-visible { color: ${GOLD_LIGHT}; transform: translateX(4px); outline: none; }
        .footer-contact-link--wa { color: #4ade80; }
        .footer-contact-link--wa:hover,
        .footer-contact-link--wa:focus-visible { color: #86efac; }
        .footer-contact-link--mail { font-size: 13px; word-break: break-all; }

        .footer-social-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px 7px 11px;
          border-radius: 20px;
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid ${GOLD_BORDER};
          color: ${TEXT_LIGHT};
          text-decoration: none;
          font-size: 12.5px;
          font-family: 'Poppins', sans-serif;
          font-weight: 400;
          width: fit-content;
          transition: color 0.25s ease, background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }
        .footer-social-pill i { font-size: 15px; color: ${GOLD_LIGHT}; transition: transform 0.35s ease; }
        .footer-social-pill:hover,
        .footer-social-pill:focus-visible {
          color: ${GOLD_LIGHT};
          background-color: rgba(197, 155, 39, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
          outline: none;
        }
        .footer-social-pill:hover i,
        .footer-social-pill:focus-visible i { transform: rotate(-12deg) scale(1.2); }

        .footer-dev-link { color: ${GOLD_LIGHT}; text-decoration: none; font-weight: 600; transition: color 0.2s ease; }
        .footer-dev-link:hover { color: #FFFFFF; text-decoration: underline; }

        /* ───────────── LAYOUT ───────────── */

        /* corner flowers */
        .footer-flower {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          opacity: 0.8;
        }
        .footer-flower--tr { top: -70px; right: -60px; width: 260px; height: 260px; transform: rotate(18deg); }
        .footer-flower--bl { bottom: 20px; left: -80px; width: 230px; height: 230px; transform: rotate(-14deg); }
        .footer-flower--br { bottom: 10px; right: -70px; width: 210px; height: 210px; transform: rotate(32deg); opacity: 0.65; }

        .footer-content { position: relative; z-index: 1; }

        .footer-main-grid {
          display: grid;
          grid-template-columns: minmax(275px, 1.45fr) 0.9fr 1fr 1.15fr 0.95fr;
          gap: 28px;
          margin-bottom: 50px;
          text-align: left;
        }

        .footer-social-icons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: flex-start;
        }

        .footer-copyright-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .footer-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
        }

        .footer-links-list li {
          margin-bottom: 10px;
          text-align: left;
        }

        .footer-heading {
          color: ${GOLD_LIGHT};
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1.5px solid ${GOLD_BORDER};
          text-align: left;
        }

        @media (max-width: 1199px) {
          .footer-main-grid {
            grid-template-columns: minmax(265px, 1.4fr) 1fr 1fr;
            gap: 28px;
          }
        }

        @media (max-width: 992px) {
          .footer-main-grid {
            grid-template-columns: minmax(255px, 1.35fr) 1fr 1fr;
            gap: 28px;
            margin-bottom: 40px;
          }
          .footer-area { padding: 50px 0 0 0 !important; }
          .footer-flower--tr { width: 210px; height: 210px; }
          .footer-flower--bl { width: 190px; height: 190px; }
          .footer-flower--br { width: 170px; height: 170px; }
        }

        @media (max-width: 768px) {
          .footer-main-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-bottom: 35px;
          }
          .footer-copyright-bar {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
          .footer-copyright-bar p { text-align: center !important; }
          .footer-area { padding: 40px 0 0 0 !important; }
          .footer-heading { font-size: 12px; margin-bottom: 15px; padding-bottom: 8px; }
          .footer-links-list li { margin-bottom: 8px; }
          .footer-link,
          .footer-address-text { font-size: 12px !important; }
          .footer-flower--tr { width: 170px; height: 170px; top: -50px; right: -50px; }
          .footer-flower--bl { width: 150px; height: 150px; left: -60px; }
          .footer-flower--br { width: 140px; height: 140px; right: -50px; }
        }

        @media (max-width: 576px) {
          .footer-main-grid {
            grid-template-columns: 1fr;
            gap: 30px;
            margin-bottom: 30px;
            text-align: center !important;
          }
          .footer-main-grid > div { text-align: center !important; }
          .footer-heading {
            text-align: center !important;
            font-size: 13px;
            display: inline-block;
            width: auto;
            min-width: 200px;
          }
          /* centre the drawn underline on mobile */
          .footer-heading::after { left: 50%; margin-left: -23px; }
          .footer-links-list { text-align: center !important; }
          .footer-links-list li { text-align: center !important; }
          .footer-links-list li a { justify-content: center !important; }
          .footer-social-icons { align-items: center !important; }
          .footer-contact-wrap { align-items: center !important; }
          .footer-brand-logo {
            margin: 0 auto 14px !important;
            display: inline-block !important;
            text-align: left !important;
          }
          .footer-brand-desc {
            margin: 6px auto 0 !important;
            text-align: center !important;
          }
          .footer-brand-text { text-align: center !important; }
          .footer-address-text { text-align: center !important; }
          .footer-copyright-bar { flex-direction: column; text-align: center; gap: 10px; }
          .footer-copyright-bar p { font-size: 11px !important; text-align: center !important; }
          .footer-payment-info { justify-content: center !important; }
          .footer-area { padding: 35px 0 0 0 !important; }
          .footer-logo-main { font-size: 22px !important; }
          .footer-logo-sub { font-size: 8px !important; letter-spacing: 0.16em !important; }
        }

        @media (max-width: 375px) {
          .footer-main-grid { gap: 25px; }
          .footer-heading { font-size: 12px; letter-spacing: 0.15em; }
          .footer-link,
          .footer-address-text { font-size: 11px !important; }
          .footer-social-icons { gap: 8px; }
          .footer-logo-main { font-size: 20px !important; }
          .footer-logo-sub { font-size: 7px !important; letter-spacing: 0.12em !important; }
        }

        @media (max-width: 768px) and (orientation: landscape) {
          .footer-main-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .footer-area { padding: 30px 0 0 0 !important; }
        }

        @media (min-width: 768px) and (max-width: 992px) and (orientation: landscape) {
          .footer-main-grid { grid-template-columns: repeat(3, 1fr); gap: 25px; }
        }

        @media (min-width: 1920px) {
          .footer-main-grid { gap: 40px; margin-bottom: 60px; }
          .footer-heading { font-size: 15px; margin-bottom: 25px; }
          .footer-link,
          .footer-address-text { font-size: 14px !important; }
          .footer-logo-main { font-size: 26px !important; }
          .footer-logo-sub { font-size: 9.5px !important; letter-spacing: 0.21em !important; }
          .footer-copyright-bar p,
          .footer-payment-info span { font-size: 13px !important; }
          .footer-flower--tr { width: 320px; height: 320px; }
          .footer-flower--bl { width: 280px; height: 280px; }
          .footer-flower--br { width: 260px; height: 260px; }
        }

        @media print {
          .footer-area { display: none !important; }
        }

        /* Respect users who turn motion off */
        @media (prefers-reduced-motion: reduce) {
          .footer-area *,
          .footer-area::before,
          .footer-area *::before,
          .footer-area *::after {
            animation: none !important;
            transition: none !important;
          }
          .footer-reveal { opacity: 1 !important; transform: none !important; }
          .footer-heading::after { width: 46px; }
          .footer-logo-shimmer { background-position: 0% 0; }
        }
      `}</style>

      <footer
        ref={footerRef}
        className={clsx(
          "footer-area",
          visible && "is-visible",
          backgroundColorClass,
          spaceTopClass,
          spaceBottomClass,
          extraFooterClass,
          spaceLeftClass,
          spaceRightClass
        )}
        style={{
          borderTop: `1.5px solid ${GOLD_BORDER}`,
          padding: "60px 0 0px 0",
        }}
      >
        {/* corner flower decorations */}
        <span className="footer-flower footer-flower--tr" aria-hidden="true">
          <span className="footer-flower-svg"><FlowerDecor id="ftrTR" /></span>
        </span>
        <span className="footer-flower footer-flower--bl" aria-hidden="true">
          <span className="footer-flower-svg"><FlowerDecor id="ftrBL" /></span>
        </span>
        <span className="footer-flower footer-flower--br" aria-hidden="true">
          <span className="footer-flower-svg"><FlowerDecor id="ftrBR" /></span>
        </span>

        <div className={clsx(containerClass || "container", "footer-content")}>
          <div className="footer-main-grid">

            {/* Column 1: Brand Logo & Tagline */}
            <div className="footer-reveal" style={{ textAlign: "left", "--i": 0 }}>
              <Link
                to={process.env.PUBLIC_URL + "/"}
                className="footer-brand-logo"
                style={{ display: "inline-block", marginBottom: "14px", textDecoration: "none" }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: "15px" }}>
                  <div
                    className="footer-logo-tile"
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "16px",
                      background: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px",
                      boxShadow: "0 6px 18px rgba(0, 0, 0, 0.22)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/vika-icon.png"}
                      alt="Vika Vastra"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div
                      className="footer-logo-main"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        lineHeight: 1.15,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ color: "#FFFFFF" }}>VIKA </span>
                      <span className="footer-logo-shimmer">VASTRA</span>
                    </div>
                    <div
                      className="footer-logo-sub"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 8.5,
                        letterSpacing: "0.20em",
                        color: GOLD_LIGHT,
                        textTransform: "uppercase",
                        fontWeight: 600,
                        marginTop: 5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      A HERITAGE IN EVERY DRAPE
                    </div>
                  </div>
                </div>
              </Link>
              <p
                className="footer-brand-desc"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  fontSize: "13px",
                  lineHeight: "1.65",
                  color: "rgba(250, 247, 242, 0.88)",
                  margin: "4px 0 0 0",
                  maxWidth: "265px",
                }}
              >
                Discover authentic luxury sarees woven with timeless tradition, elegance, and artisanal craftsmanship.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-reveal" style={{ textAlign: "left", "--i": 1 }}>
              <h3 className="footer-heading">Quick Links</h3>
              <ul className="footer-links-list">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <FooterLink to={item.to}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Support */}
            <div className="footer-reveal" style={{ textAlign: "left", "--i": 2 }}>
              <h3 className="footer-heading">Customer Support</h3>
              <ul className="footer-links-list">
                {supportLinks.map((item) => (
                  <li key={item.label}>
                    <FooterLink to={item.to}>{item.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact & Address */}
            <div className="footer-reveal" style={{ textAlign: "left", "--i": 3 }}>
              <h3 className="footer-heading">Contact & Address</h3>
              <div
                className="footer-address-text"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 400,
                  color: TEXT_LIGHT,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                  textAlign: "left",
                }}
              >
                <div style={{ marginBottom: "12px", color: TEXT_LIGHT }}>
                  <strong style={{ color: GOLD_LIGHT, display: "block", fontSize: "14px", marginBottom: "3px" }}>Vikraman.k</strong>
                  Electronic City phase 1,<br />
                  Bangalore - 560100,<br />
                  Karnataka
                </div>

                <div
                  className="footer-contact-wrap"
                  style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}
                >
                  <a
                    href="tel:+919482944552"
                    className="footer-contact-link"
                    title="Click to call +91 9482944552"
                  >
                    <span style={{ fontSize: "14px", color: GOLD_LIGHT }}>📞</span>
                    <span>+91 9482944552</span>
                  </a>

                  <a
                    href="https://wa.me/919482944552"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-contact-link footer-contact-link--wa"
                    title="Chat on WhatsApp"
                  >
                    <span className="footer-wa-icon">
                      <i className="fa fa-whatsapp" style={{ fontSize: "15px" }}></i>
                    </span>
                    <span>WhatsApp Chat</span>
                  </a>

                  <a
                    href="mailto:vikram.25feb@gmail.com"
                    className="footer-contact-link footer-contact-link--mail"
                    title="Click to send email"
                  >
                    <span style={{ fontSize: "14px", color: GOLD_LIGHT }}>✉️</span>
                    <span>vikram.25feb@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 5: Social Media — Instagram only */}
            <div className="footer-reveal" style={{ textAlign: "left", "--i": 4 }}>
              <h3 className="footer-heading">Social Media</h3>
              <div className="footer-social-icons">
                {instagramAccounts.map((account) => (
                  <a
                    key={account.label}
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-pill"
                  >
                    <i className="fa fa-instagram"></i>
                    {account.label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          className="footer-reveal"
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: PLUM_BAR,
            padding: "15px 0",
            borderTop: `1px solid ${GOLD_BORDER}`,
            "--i": 5,
          }}
        >
          <div className={containerClass || "container"}>
            <div className="footer-copyright-bar">
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(250, 247, 242, 0.75)", margin: 0 }}>
                Copyright © {new Date().getFullYear()} Vika Vastra | All Rights Reserved.
              </p>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(250, 247, 242, 0.75)", margin: 0 }}>
                Developed by{" "}
                <a
                  href="https://saitechnosolutions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-dev-link"
                  title="Sai Techno Solutions Pvt. Ltd"
                >
                  Sai Techno Solutions Pvt. Ltd
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

FooterOne.propTypes = {
  backgroundColorClass: PropTypes.string,
  containerClass:       PropTypes.string,
  extraFooterClass:     PropTypes.string,
  spaceBottomClass:     PropTypes.string,
  spaceTopClass:        PropTypes.string,
  spaceLeftClass:       PropTypes.string,
  spaceRightClass:      PropTypes.string,
};

export default FooterOne;