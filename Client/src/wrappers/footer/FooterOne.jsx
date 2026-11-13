import PropTypes from "prop-types";
import clsx from "clsx";
import { Link } from "react-router-dom";

const MAROON = "#720E1E";
const GOLD = "#C59B27";
const GOLD_LIGHT = "#DFB143";
const GOLD_BORDER = "rgba(197,155,39,0.35)";
const TEXT_LIGHT = "#FAF7F2";
const TEXT_MUTED_LIGHT = "rgba(250, 247, 242, 0.82)";

const FooterOne = ({
  backgroundColorClass,
  spaceTopClass,
  spaceBottomClass,
  spaceLeftClass,
  spaceRightClass,
  containerClass,
  extraFooterClass,
}) => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

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
          justify-content: space-evenly;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          text-align: center;
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
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
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
          .footer-links-list li a,
          .footer-address-text { font-size: 12px !important; }
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
          .footer-links-list { text-align: center !important; }
          .footer-links-list li { text-align: center !important; }
          .footer-links-list li a { justify-content: center !important; }
          .footer-social-icons { align-items: center !important; }
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
          .footer-links-list li a,
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
          .footer-links-list li a,
          .footer-address-text { font-size: 14px !important; }
          .footer-logo-main { font-size: 26px !important; }
          .footer-logo-sub { font-size: 9.5px !important; letter-spacing: 0.21em !important; }
          .footer-copyright-bar p,
          .footer-payment-info span { font-size: 13px !important; }
        }

        @media print {
          .footer-area { display: none !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-links-list li a,
          .footer-social-icons a { transition: none !important; }
        }
      `}</style>

      <footer
        className={clsx(
          "footer-area",
          backgroundColorClass,
          spaceTopClass,
          spaceBottomClass,
          extraFooterClass,
          spaceLeftClass,
          spaceRightClass
        )}
        style={{
          backgroundColor: "#720e1e",
          borderTop: `1.5px solid ${GOLD_BORDER}`,
          padding: "60px 0 0px 0",
        }}
      >
        <div className={containerClass || "container"}>
          <div className="footer-main-grid">

            {/* Column 1: Brand Logo & Tagline */}
            <div style={{ textAlign: "left" }}>
              <Link
                to={process.env.PUBLIC_URL + "/"}
                className="footer-brand-logo"
                style={{ display: "inline-block", marginBottom: "14px", textDecoration: "none" }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: "15px" }}>
                  <div
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
                        fontFamily: "'Cinzel Decorative', 'Cinzel', Georgia, serif",
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        lineHeight: 1.15,
                        whiteSpace: "nowrap",
                        textShadow: "0 2px 12px rgba(223, 177, 67, 0.4)",
                      }}
                    >
                      <span style={{ color: "#FFFFFF" }}>VIKA </span>
                      <span style={{ color: GOLD_LIGHT }}>VASTRA</span>
                    </div>
                    <div
                      className="footer-logo-sub"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
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
                  fontFamily: "'DM Sans', sans-serif",
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
            <div style={{ textAlign: "left" }}>
              <h3 className="footer-heading">Quick Links</h3>
              <ul className="footer-links-list">
                {[
                  { label: "Home",       to: "/" },
                  { label: "About",      to: "/about" },
                  { label: "Shop",       to: "/shop" },
                  { label: "Contact us", to: "/contact" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={process.env.PUBLIC_URL + item.to}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: TEXT_LIGHT,
                        fontSize: "13.5px",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = GOLD_LIGHT;
                        e.currentTarget.style.transform = "translateX(3px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = TEXT_LIGHT;
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <span style={{ fontSize: "11px", color: GOLD, opacity: 0.9, marginRight: "2px" }}>›</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Support */}
            <div style={{ textAlign: "left" }}>
              <h3 className="footer-heading">Customer Support</h3>
              <ul className="footer-links-list">
                {[
                  { label: "Shipping Policy",    to: "/shipping-policy" },
                  { label: "Return Policy",      to: "/return-policy" },
                  { label: "Privacy Policy",     to: "/privacy-policy" },
                  { label: "Terms & Conditions", to: "/terms" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={process.env.PUBLIC_URL + item.to}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: TEXT_LIGHT,
                        fontSize: "13.5px",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = GOLD_LIGHT;
                        e.currentTarget.style.transform = "translateX(3px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = TEXT_LIGHT;
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <span style={{ fontSize: "11px", color: GOLD, opacity: 0.9, marginRight: "2px" }}>›</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact & Address */}
            <div style={{ textAlign: "left" }}>
              <h3 className="footer-heading">Contact & Address</h3>
              <div
                className="footer-address-text"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: TEXT_LIGHT,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                  textAlign: "left",
                }}
              >
                <div style={{ marginBottom: "12px", color: TEXT_LIGHT }}>
                  <strong style={{ color: GOLD_LIGHT, display: "block", fontSize: "14px", marginBottom: "3px" }}>Vikraman.k</strong>
                  Murari Enclave,<br />
                  Maragondanahalli,<br />
                  Electronic City phase 1,<br />
                  Bangalore - 560100,<br />
                  Karnataka
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
                  {/* Clickable Phone Call */}
                  <a
                    href="tel:+919482944552"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: TEXT_LIGHT,
                      textDecoration: "none",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                      width: "fit-content",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = GOLD_LIGHT;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = TEXT_LIGHT;
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                    title="Click to call +91 9482944552"
                  >
                    <span style={{ fontSize: "14px", color: GOLD_LIGHT }}>📞</span>
                    <span>+91 9482944552</span>
                  </a>

                  {/* Clickable WhatsApp */}
                  <a
                    href="https://wa.me/919482944552"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#4ade80",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                      width: "fit-content",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#86efac";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#4ade80";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                    title="Chat on WhatsApp"
                  >
                    <i className="fa fa-whatsapp" style={{ fontSize: "15px" }}></i>
                    <span>WhatsApp Chat</span>
                  </a>

                  {/* Clickable Email */}
                  <a
                    href="mailto:vikram.25feb@gmail.com"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: TEXT_LIGHT,
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      wordBreak: "break-all",
                      transition: "all 0.2s ease",
                      width: "fit-content",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = GOLD_LIGHT;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = TEXT_LIGHT;
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                    title="Click to send email"
                  >
                    <span style={{ fontSize: "14px", color: GOLD_LIGHT }}>✉️</span>
                    <span>vikram.25feb@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 5: Social Media — Instagram only */}
            <div style={{ textAlign: "left" }}>
              <h3 className="footer-heading">Social Media</h3>
              <div className="footer-social-icons">
                {[
                  { label: "@ajn_elampillai", url: "https://www.instagram.com/ajn_elampillai/" },
                  { label: "@jst_elampillai", url: "https://www.instagram.com/jst_elampillai/" },
                ].map((account, idx) => (
                  <a
                    key={idx}
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 14px 7px 11px",
                      borderRadius: "20px",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(197, 155, 39, 0.35)",
                      color: TEXT_LIGHT,
                      textDecoration: "none",
                      fontSize: "12.5px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      width: "fit-content",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = GOLD_LIGHT;
                      e.currentTarget.style.backgroundColor = "rgba(197, 155, 39, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = TEXT_LIGHT;
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                    }}
                  >
                    <i className="fa fa-instagram" style={{ fontSize: "15px", color: GOLD_LIGHT }}></i>
                    {account.label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div style={{ backgroundColor: "#5A0B17", padding: "15px 0", borderTop: `1px solid ${GOLD_BORDER}` }}>
          <div className={containerClass || "container"}>
            <div className="footer-copyright-bar">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(250, 247, 242, 0.75)", margin: 0, textAlign: "center" }}>
                Copyright © {new Date().getFullYear()} Vika Vastra | All Rights Reserved.
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
