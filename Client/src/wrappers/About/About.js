import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroBannerImg from "../../assets/img/about/about-hero-banner.jpeg";
import saree1 from "../../assets/img/about/saree1.jpeg";
import saree2 from "../../assets/img/about/saree2.jpeg";
import saree3 from "../../assets/img/about/saree3.jpeg";
import saree4 from "../../assets/img/about/saree4.jpeg";
import saree5 from "../../assets/img/about/saree5.jpeg";
import saree6 from "../../assets/img/about/saree6.jpeg";
import saree7 from "../../assets/img/about/saree7.jpeg";
import saree8 from "../../assets/img/about/saree8.jpeg";
import saree9 from "../../assets/img/about/saree9.jpeg";
import saree10 from "../../assets/img/about/saree10.jpeg";
import FooterOne from "../footer/FooterOne";
import HeaderOne from "../header/HeaderOne";


/* ── Brand tokens (matches HeaderOne) ─────────────────────── */
const C = {
  gold:         "#C59B27",
  goldLt:       "#F8F6F2",
  goldGradient: "linear-gradient(45deg, #720E1E 0%, #C59B27 100%)",
  goldGlow:     "linear-gradient(135deg, #C9933A 0%, #E8B865 50%, #C9933A 100%)",
  dark:         "#720E1E",
  muted:        "#4A4A4A",
  border:       "#e7dfd2",
  white:        "#F8F6F2",
  cream:        "#FAF7F2",
};

/* ── Counter hook ──────────────────────────────────────────── */
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

/* ── Intersection observer hook ───────────────────────────── */
const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ value, label, suffix = "", prefix = "", duration = 2200 }) => {
  const [ref, inView] = useInView(0.3);
  const count = useCounter(value, duration, inView);
  return (
    <div ref={ref} style={{
      flex: "1 1 160px",
      textAlign: "center",
      padding: "32px 20px",
      borderRight: `1px solid ${C.border}`,
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 48,
        fontWeight: 800,
        lineHeight: 1,
        background: C.goldGradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: 8,
      }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 12,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.muted,
        fontWeight: 500,
      }}>{label}</div>
    </div>
  );
};

/* ── Timeline Item ─────────────────────────────────────────── */
const TimelineItem = ({ year, title, desc, align }) => {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} style={{
      display: "flex",
      justifyContent: align === "left" ? "flex-start" : "flex-end",
      marginBottom: 48,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(30px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
    }}>
      <div style={{
        width: "44%",
        background: C.white,
        border: `1px solid ${C.border}`,
        borderTop: `3px solid ${C.gold}`,
        borderRadius: 4,
        padding: "28px 32px",
        position: "relative",
      }}>
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: C.gold,
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 8,
        }}>{year}</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 700,
          color: C.dark,
          marginBottom: 10,
        }}>{title}</div>
        <div style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 14,
          color: C.muted,
          lineHeight: 1.75,
        }}>{desc}</div>
      </div>
    </div>
  );
};

/* ── Value Card (legacy, unused now) ───────────────────────── */
const ValueCard = ({ icon, title, desc }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "1 1 220px",
        padding: "36px 28px",
        background: hover ? C.dark : C.white,
        border: `1px solid ${hover ? C.dark : C.border}`,
        borderRadius: 4,
        transition: "background 0.35s, border-color 0.35s",
        cursor: "default",
      }}
    >
      <div style={{
        fontSize: 32,
        marginBottom: 16,
        filter: hover ? "grayscale(0) brightness(1.2)" : "none",
        transition: "filter 0.3s",
      }}>{icon}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 17,
        fontWeight: 700,
        color: hover ? C.gold : C.dark,
        marginBottom: 10,
        transition: "color 0.3s",
      }}>{title}</div>
      <div style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: 13.5,
        color: hover ? "#c8b89a" : C.muted,
        lineHeight: 1.7,
        transition: "color 0.3s",
      }}>{desc}</div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   NEW: Core Values (clean, professional split layout)
══════════════════════════════════════════════════════════════ */
const CORE_VALUES = [
  {
    title: "Authentic craftsmanship",
    desc: "Every saree is made by artisan hands carrying generations of tradition, with no compromise on weave quality or fabric.",
    paths: ["M4 4h16v16H4z", "M4 12h16", "M12 4v16", "M8 4v16", "M16 4v16"],
  },
  {
    title: "Sustainable sourcing",
    desc: "Natural dyes and eco-conscious weaving, so the beauty of a saree never costs the earth.",
    paths: ["M5 19C5 9 11 4 20 4c0 9-5 15-15 15z", "M5 19L13 11"],
  },
  {
    title: "Artisan empowerment",
    desc: "Fair prices and long-term contracts. We work as partners with our weavers, not as a marketplace.",
    paths: ["M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"],
  },
  {
    title: "Premium experience",
    desc: "From packaging to delivery, every step is designed to feel like receiving a gift.",
    paths: ["M4 10h16v10H4z", "M3 7h18v3H3z", "M12 7v13", "M12 7C10 4 7 4 7 6s3 1 5 1c2 0 5 1 5-1s-3-2-5 1"],
  },
];

const CoreValuesPro = () => {
  const [ref, inView] = useInView(0.15);

  return (
    <section ref={ref} className={`cvp${inView ? " in" : ""}`}>
      <style>{`
        .cvp {
          background: #FFFFFF;
          padding: 100px 0 120px;
          font-family: 'Jost', sans-serif;
          overflow: hidden;
        }
        .cvp-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
        }

        .cvp-head {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 52px;
        }
        .cvp-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C59B27;
          background: #FDF9F0;
          border: 1px solid rgba(197, 155, 39, 0.35);
          padding: 5px 16px;
          border-radius: 999px;
          margin-bottom: 18px;
        }
        .cvp-head h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 3.8vw, 48px);
          font-weight: 700;
          line-height: 1.15;
          color: #240207;
          margin: 0 0 16px;
        }
        .cvp-head p {
          font-size: 16px;
          line-height: 1.75;
          color: #6A5B54;
          margin: 0 auto;
        }

        /* ── 4 Commitments Grid ── */
        .cvp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 56px;
        }
        .cvp-item {
          position: relative;
          background: #FAF7F2;
          border: 1px solid #ECE4D7;
          border-radius: 12px;
          padding: 30px 22px;
          transition: all 0.35s ease;
          display: flex;
          flex-direction: column;
        }
        .cvp-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(36, 2, 7, 0.08);
          border-color: #C59B27;
          background: #FFFFFF;
        }
        .cvp-item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #720E1E, #C59B27);
          border-radius: 12px 12px 0 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .cvp-item:hover::before {
          opacity: 1;
        }

        .cvp-ic {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #F2EBE0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          transition: all 0.3s ease;
        }
        .cvp-ic svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: #720E1E;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.3s;
        }
        .cvp-item:hover .cvp-ic {
          background: #720E1E;
        }
        .cvp-item:hover .cvp-ic svg {
          stroke: #F8F6F2;
        }

        .cvp-item h3 {
          font-family: 'Playfair Display', serif;
          font-size: 19px;
          font-weight: 700;
          color: #240207;
          margin: 0 0 10px;
          line-height: 1.3;
        }
        .cvp-item p {
          font-size: 13.5px;
          line-height: 1.7;
          color: #6A5B54;
          margin: 0;
          flex-grow: 1;
        }

        /* ── Full Width Image Showcase ── */
        .cvp-media {
          position: relative;
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 24px 56px rgba(36, 2, 7, 0.15);
          border: 1.5px solid rgba(197, 155, 39, 0.45);
        }
        .cvp-frame {
          width: 100%;
          height: clamp(380px, 48vw, 560px);
          background: #F1E9DB;
          position: relative;
          overflow: hidden;
        }
        .cvp-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          display: block;
          transition: transform 1.2s ease;
        }
        .cvp-media:hover .cvp-frame img {
          transform: scale(1.03);
        }

        .cvp-note {
          position: absolute;
          left: 28px;
          bottom: 28px;
          max-width: 320px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-left: 4px solid #C59B27;
          border-radius: 8px;
          padding: 18px 22px;
          box-shadow: 0 16px 36px rgba(36, 2, 7, 0.25);
          transition: transform 0.3s ease;
        }
        .cvp-note b {
          display: block;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #720E1E;
          margin-bottom: 4px;
        }
        .cvp-note span {
          font-size: 13px;
          line-height: 1.6;
          color: #55443B;
        }

        .cvp-cta-wrap {
          text-align: center;
          margin-top: 48px;
        }
        .cvp-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 34px;
          background: rgb(197, 155, 39);
          color: #FFFFFF;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 14px rgba(197, 155, 39, 0.35);
          transition: all 0.3s ease;
        }
        .cvp-cta:hover {
          background: #A8801D;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(197, 155, 39, 0.45);
        }

        @media (max-width: 1024px) {
          .cvp-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (max-width: 768px) {
          .cvp { padding: 70px 0 80px; }
          .cvp-grid { grid-template-columns: 1fr; gap: 16px; margin-bottom: 36px; }
          .cvp-frame { height: 280px; }
          .cvp-note { left: 16px; bottom: 16px; right: 16px; max-width: none; }
        }
      `}</style>

      <div className="cvp-container">
        <div className="cvp-head">
          <span className="cvp-pill">✦ Our Core Values ✦</span>
          <h2>Built on craft, fair trade and care</h2>
          <p>Four commitments guide every saree we source and every weaver we work with.</p>
        </div>

        <div className="cvp-grid">
          {CORE_VALUES.map((v) => (
            <div key={v.title} className="cvp-item">
              <div className="cvp-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {v.paths.map((d, i) => <path key={i} d={d} />)}
                </svg>
              </div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="cvp-media">
          <div className="cvp-frame">
            <img src={saree1} alt="Handloom silk saree packaged in Vika Vasthra signature royal keepsake box" />
          </div>
          <div className="cvp-note">
            <b>7-point quality check</b>
            <span>Every saree is inspected before it ships in our keepsake box.</span>
          </div>
        </div>

        <div className="cvp-cta-wrap">
          <Link to="/shop" className="cvp-cta">
            Shop the collection <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ── 6-Year Milestone Data (2020 – 2026) ─────────────────── */
const MILESTONES = [
  {
    year: "2020",
    label: "2020 · The Beginning",
    title: "The Humble Loom",
    subtitle: "40 Looms · 200 Founding Drapes",
    desc: "Vika Vasthra was born with a curated collection of 40 handloom sarees sourced directly from Kanchipuram master weavers. Our first 200 orders shipped within the founding month — a dream turned into living heritage.",
    stat1: "40 Looms Curated",
    stat2: "200 Founding Drapes",
    img: saree4,
    imgAlt: "Vika Vasthra first saree delivery packaging — 2020",
    badge: "Founding Year",
  },
  {
    year: "2021",
    label: "2021 · Expanding Roots",
    title: "Weaving Across Regions",
    subtitle: "Banarasi & Chanderi · 100+ Looms",
    desc: "We expanded into Banarasi silk and Chanderi collections, crossing 3,000 successful deliveries. Artisan partnerships grew to 100+ weaver families as word of our uncompromising quality spread across South India.",
    stat1: "100+ Artisan Families",
    stat2: "3,000 Orders Crossed",
    img: saree5,
    imgAlt: "Mustard yellow handloom saree — Vika Vasthra 2021 collection",
    badge: "Regional Expansion",
  },
  {
    year: "2022",
    label: "2022 · Going Digital",
    title: "The Digital Boutique",
    subtitle: "8,000 Orders · Digital Experience",
    desc: "Launch of our bespoke e-commerce platform with high-definition drape view and curated silk consultations. We crossed 8,000 cumulative orders, connecting rural loom clusters with silk connoisseurs across metro cities.",
    stat1: "8,000 Orders Delivered",
    stat2: "Digital Boutique Launch",
    img: saree6,
    imgAlt: "Orange Kanchipuram silk saree — Vika Vasthra 2022",
    badge: "Digital Platform",
  },
  {
    year: "2023",
    label: "2023 · Bridal Editions",
    title: "Heirloom Bridal Collections",
    subtitle: "15,000 Orders · Sold Out in 72 Hrs",
    desc: "Introduced our bridal and festive exclusive handloom collections featuring real tested zari. Our wedding season collections sold out within 72 hours, cementing Vika Vasthra in Indian bridal trousseaus.",
    stat1: "15,000 Orders Delivered",
    stat2: "Sold Out in 72 Hours",
    img: saree7,
    imgAlt: "Premium multicolour saree collection — Vika Vasthra 2023",
    badge: "Bridal Prestige",
  },
  {
    year: "2024",
    label: "2024 · National Reach",
    title: "Pan-India Recognition",
    subtitle: "19,000 Orders · All Pin Codes",
    desc: "Vika Vasthra expanded delivery to every pin code across India and international NRI destinations. Exclusive collaborative designer series with master weavers brought rare heritage motifs back to life.",
    stat1: "19,000 Orders Delivered",
    stat2: "Pan-India Express Delivery",
    img: saree8,
    imgAlt: "Lavender tissue silk saree — Vika Vasthra 2024 national launch",
    badge: "Pan-India Reach",
  },
  {
    year: "2025",
    label: "2025 · 21,900 Orders ★",
    title: "A Historic Golden Milestone",
    subtitle: "21,900 Orders · 500+ Weaver Families",
    desc: "A landmark golden year — celebrating over 21,900 orders delivered and 500+ master weaver families supported with above-market fair wages. Launched our celebrated Tissue Silk and Pure Kanchipuram Zari lines.",
    stat1: "21,900 Orders Delivered",
    stat2: "500+ Artisan Families",
    img: saree9,
    imgAlt: "Exclusive zari Kanchipuram saree — Vika Vasthra 2025 milestone",
    milestone: true,
    badge: "★ Landmark Milestone",
  },
  {
    year: "2026",
    label: "2026 · Present & Beyond",
    title: "Still Weaving, Still Cherished",
    subtitle: "Six Years of Pure Handloom Legacy",
    desc: "Six years of untamed excellence. Vika Vasthra continues to champion authentic Indian craftsmanship — deepening weaver bonds, reviving ancient motifs, and dressing generations of women in pure elegance.",
    stat1: "6+ Years of Excellence",
    stat2: "98% Customer Happiness",
    img: saree10,
    imgAlt: "Traditional wooden handloom with pure silk sarees stack and weaving shuttle — Vika Vasthra 2026 present legacy",
    badge: "Present & Future",
  },
];

/* ══════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════ */
const AboutPage = ({ shop }) => {  /* ← FIX: accept shop prop */
  const [heroRef, heroIn] = useInView(0.1);
  const [activeMilestone, setActiveMilestone] = useState(5); // default to 2025 milestone

  return (
    <>
      <HeaderOne shop={shop} />  {/* ← FIX: pass shop prop down */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;0,800;1,700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.cream}; }
        .emb-about-divider {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 24px;
        }
        .emb-about-divider::before, .emb-about-divider::after {
          content: ""; flex: 1; height: 1px; background: ${C.border};
        }
        .emb-about-divider::before { flex: none; width: 40px; }

        .emb-hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(197, 155, 39, 0.5) !important;
          background: linear-gradient(135deg, #D4AF37 0%, #F5D77F 52%, #D4AF37 100%) !important;
        }
        .emb-hero-secondary-btn:hover {
          background: rgba(197, 155, 39, 0.16) !important;
          border-color: rgba(197, 155, 39, 0.7) !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
        }
        .emb-hero-img-wrap:hover .emb-hero-img {
          transform: scale(1.04);
        }

        /* ── Story Section Redesign (Where Tradition Meets Elegance) ── */
        .emb-story-wrapper {
          position: relative;
          background: linear-gradient(180deg, #FAF7F2 0%, #F5EFEB 50%, #FAF7F2 100%);
          border-top: 1px solid rgba(197, 155, 39, 0.25);
          border-bottom: 1px solid rgba(197, 155, 39, 0.25);
          overflow: hidden;
        }
        .emb-story-card {
          background: #FFFFFF;
          border: 1px solid rgba(197, 155, 39, 0.22);
          border-radius: 14px;
          padding: 24px 26px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(114, 14, 30, 0.04);
          position: relative;
          overflow: hidden;
        }
        .emb-story-card:hover {
          transform: translateY(-4px);
          border-color: rgba(197, 155, 39, 0.6);
          box-shadow: 0 14px 32px rgba(114, 14, 30, 0.1);
        }
        .emb-story-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #C59B27 0%, #720E1E 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .emb-story-card:hover::before {
          opacity: 1;
        }
        .emb-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }

        /* ── Milestone Timeline New UI ── */
        .emb-timeline-wrapper {
          position: relative;
          background: linear-gradient(180deg, #F9F5EE 0%, #FFFFFF 50%, #F8F3EA 100%);
          border-top: 1px solid rgba(197, 155, 39, 0.25);
          border-bottom: 1px solid rgba(197, 155, 39, 0.25);
        }
        .emb-year-pill-btn {
          border: 1px solid rgba(197, 155, 39, 0.35);
          background: #FFFFFF;
          color: #720E1E;
          border-radius: 30px;
          padding: 9px 18px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .emb-year-pill-btn:hover {
          border-color: #C59B27;
          background: rgba(197, 155, 39, 0.12);
          transform: translateY(-2px);
        }
        .emb-year-pill-btn.active {
          background: linear-gradient(135deg, #720E1E 0%, #3D040E 100%);
          color: #F8F6F2;
          border-color: #C59B27;
          box-shadow: 0 6px 18px rgba(114, 14, 30, 0.35);
          transform: translateY(-2px);
        }
        .emb-milestone-spotlight {
          background: #FFFFFF;
          border: 1.5px solid rgba(197, 155, 39, 0.35);
          border-radius: 20px;
          box-shadow: 0 20px 48px -10px rgba(114, 14, 30, 0.12);
          overflow: hidden;
          transition: all 0.35s ease;
        }
        .emb-milestone-card {
          background: #FFFFFF;
          border: 1px solid rgba(197, 155, 39, 0.22);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .emb-milestone-card:hover {
          transform: translateY(-4px);
          border-color: rgba(197, 155, 39, 0.6);
          box-shadow: 0 10px 24px rgba(114, 14, 30, 0.08);
        }
        .emb-milestone-card.active-card {
          border-color: #C59B27;
          background: linear-gradient(180deg, #FAF6EE 0%, #FFFFFF 100%);
          box-shadow: 0 10px 26px rgba(197, 155, 39, 0.25);
        }
        .emb-milestone-card.active-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #720E1E, #C59B27);
        }

        @media (max-width: 991px) {
          .emb-hero-inner { flex-direction: column !important; text-align: center; gap: 40px !important; }
          .emb-hero-title { font-size: 42px !important; }
          .emb-hero-img-wrap { flex: unset !important; width: 100% !important; max-width: 380px; margin: 20px auto 0 !important; }
          .emb-hero-pad { padding: 60px 20px 40px !important; }
          .emb-hero-btn-row { justify-content: center !important; }
          .emb-hero-feat-row { justify-content: center !important; }
          .emb-story-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .emb-story-img-col { max-width: 480px; margin: 0 auto; }
          .emb-spotlight-inner { flex-direction: column !important; }
          .emb-spotlight-img { width: 100% !important; min-height: 300px !important; height: 320px !important; flex: unset !important; }
        }
        @media (max-width: 768px) {
          .emb-hero-title { font-size: 34px !important; }
          .emb-hero-inner { flex-direction: column !important; }
          .emb-hero-img-wrap { flex: unset !important; width: 100% !important; margin-top: 24px; }
          .emb-stats-row { flex-direction: column; }
          .emb-stats-row > div { border-right: none !important; border-bottom: 1px solid ${C.border}; }
          .emb-values-row { flex-direction: column; }
          .emb-founders-row { flex-direction: column; }
          .emb-timeline-item { justify-content: center !important; }
          .emb-timeline-item > div { width: 90% !important; }
          .emb-section-pad { padding: 60px 20px !important; }
          .emb-hero-pad { padding: 50px 18px 40px !important; }
          .emb-story-card { padding: 20px 18px !important; }
          .emb-year-pill-btn { padding: 7px 14px !important; font-size: 11.5px !important; }
          .emb-spotlight-content { padding: 24px 20px !important; }
        }
      `}</style>

      {/* ═══ HERO BANNER (RE-DESIGNED) ══════════════════════════ */}
      <section style={{
        background: "linear-gradient(135deg, #240207 0%, #3D040E 40%, #2A0309 75%, #150104 100%)",
        padding: "90px 60px 70px",
        position: "relative",
        overflow: "hidden",
        borderBottom: "2px solid rgba(197, 155, 39, 0.4)",
      }} className="emb-hero-pad">

        {/* Ambient gold radial glow behind the showcase */}
        <div style={{
          position: "absolute", top: "10%", right: "5%",
          width: 550, height: 550, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,155,39,0.16) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: "10%",
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(114,14,30,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Decorative corner borders */}
        <div style={{
          position: "absolute", top: 20, left: 24, width: 36, height: 36,
          borderTop: "1.5px solid rgba(197,155,39,0.4)", borderLeft: "1.5px solid rgba(197,155,39,0.4)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 20, right: 24, width: 36, height: 36,
          borderTop: "1.5px solid rgba(197,155,39,0.4)", borderRight: "1.5px solid rgba(197,155,39,0.4)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1140,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 56,
          position: "relative",
        }} className="emb-hero-inner">
          {/* LEFT: text & editorial storytelling */}
          <div ref={heroRef} style={{ flex: "1 1 540px" }}>
            {/* Heritage Eyebrow Pill */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "rgba(197, 155, 39, 0.12)",
              border: "1px solid rgba(197, 155, 39, 0.45)",
              borderRadius: 30,
              marginBottom: 22,
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}>
              <span style={{ color: "#E5C365", fontSize: 10 }}>✦</span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                letterSpacing: "0.22em",
                color: "#F6E9C8",
                textTransform: "uppercase",
                fontWeight: 600,
              }}>
                A Heritage In Every Drape · Estd. 2020
              </span>
              <span style={{ color: "#E5C365", fontSize: 10 }}>✦</span>
            </div>

            <h1 className="emb-hero-title" style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.08,
              color: "#FFFFFF",
              marginBottom: 22,
              letterSpacing: "-0.01em",
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
            }}>
              Weaving Timeless Stories<br />
              <span style={{
                background: "linear-gradient(135deg, #E5C365 0%, #FFF3D1 45%, #C59B27 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>In Every Thread of Silk</span>
            </h1>

            <p style={{
              fontFamily: "'DM Sans', 'Jost', sans-serif",
              fontSize: 15.5,
              color: "#E2D3BE",
              lineHeight: 1.85,
              maxWidth: 520,
              fontWeight: 300,
              marginBottom: 32,
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
            }}>
              Vika Vasthra is an authentic luxury saree house founded on reverence for India's master weavers. 
              From the sacred temple looms of Kanchipuram to hand-spun pure Banarasi zaris, every drape is a celebration 
              of royal grace, heirloom purity, and timeless elegance.
            </p>

            {/* CTA Action Buttons */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 32,
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
            }} className="emb-hero-btn-row">
              <Link
                to="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 30px",
                  background: "linear-gradient(135deg, #C59B27 0%, #E5C365 52%, #CFA23A 100%)",
                  color: "#32040C",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: 30,
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(197, 155, 39, 0.38)",
                  transition: "all 0.25s ease",
                }}
                className="emb-hero-cta"
              >
                <span>Explore Sarees</span>
                <span style={{ fontSize: 16 }}>→</span>
              </Link>

              <button
                type="button"
                onClick={() => document.getElementById("our-story")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 26px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#F6E9C8",
                  border: "1px solid rgba(197, 155, 39, 0.45)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  borderRadius: 30,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                className="emb-hero-secondary-btn"
              >
                <span>Our Heritage</span>
                <span style={{ color: "#E5C365" }}>✦</span>
              </button>
            </div>

            {/* Quick highlight points */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              flexWrap: "wrap",
              paddingTop: 22,
              borderTop: "1px dashed rgba(197, 155, 39, 0.3)",
              opacity: heroIn ? 1 : 0,
              transition: "opacity 0.8s ease 0.4s",
            }} className="emb-hero-feat-row">
              {[
                "100% Authentic Handloom",
                "Pure Mulberry Silk & Zari",
                "Direct Artisan Looms",
              ].map((feat, idx) => (
                <div key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "#E8DAC6", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                  <span style={{ color: "#E5C365", fontSize: 11 }}>◆</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Temple Arch Saree Showcase */}
          <div
            style={{
              flex: "0 0 420px",
              position: "relative",
              opacity: heroIn ? 1 : 0,
              transform: heroIn ? "translateY(0)" : "translateY(36px)",
              transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s",
            }}
            className="emb-hero-img-wrap"
          >
            {/* Double Gold Zari Arch Outline */}
            <div
              style={{
                position: "absolute",
                top: -12,
                left: -12,
                right: -12,
                bottom: -12,
                border: "1.5px solid rgba(197, 155, 39, 0.5)",
                borderRadius: "212px 212px 24px 24px",
                pointerEvents: "none",
              }}
            />

            {/* Main Arch Frame */}
            <div
              style={{
                borderRadius: "200px 200px 16px 16px",
                overflow: "hidden",
                border: "2px solid rgba(197, 155, 39, 0.8)",
                boxShadow: "0 20px 48px rgba(0, 0, 0, 0.5), 0 0 35px rgba(197, 155, 39, 0.2)",
                position: "relative",
                background: "#180104",
              }}
            >
              <img
                src={heroBannerImg}
                alt="Vika Vasthra royal golden silk saree editorial photoshoot in South Indian temple courtyard"
                style={{
                  width: "100%",
                  height: 520,
                  objectFit: "cover",
                  objectPosition: "center 25%",
                  display: "block",
                  transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="emb-hero-img"
              />
              {/* Subtle bottom vignette */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(20, 2, 5, 0.65) 0%, rgba(20, 2, 5, 0.05) 45%, transparent 100%)",
                pointerEvents: "none",
              }} />
            </div>

            {/* Floating Luxury Handloom Seal Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: -20,
                background: "linear-gradient(135deg, #C59B27 0%, #E5C365 52%, #CFA23A 100%)",
                color: "#2C0308",
                padding: "12px 20px",
                borderRadius: 14,
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#2C0308", color: "#E5C365",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}>
                ✦
              </div>
              <div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#2C0308",
                  lineHeight: 1.2,
                }}>
                  Royal Handloom Silk
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#4A0713",
                  lineHeight: 1.2,
                  marginTop: 2,
                }}>
                  A Heritage in Every Drape
                </div>
              </div>
            </div>

            {/* Top-Right Established Stamp */}
            <div
              style={{
                position: "absolute",
                top: 18,
                right: -16,
                background: "rgba(36, 2, 7, 0.88)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(197, 155, 39, 0.6)",
                color: "#E5C365",
                borderRadius: 30,
                padding: "7px 14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35)",
              }}
            >
              <span>Authentic Silk</span>
              <span>✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═════════════════════════════════════════ */}
      <div style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
        }} className="emb-stats-row">
          <StatCard value={21900} label="Orders Delivered" duration={2500} />
          <StatCard value={6}     label="Years of Excellence" suffix="+" duration={1200} />
          <StatCard value={500}   label="Artisan Partnerships" suffix="+" duration={1800} />
          <StatCard value={98}    label="Happy Customers" suffix="%" duration={1500} />
        </div>
      </div>

      {/* ═══ OUR STORY (REDESIGNED LUXURY ATELIER UI) ═════════ */}
      <section id="our-story" className="emb-story-wrapper emb-section-pad" style={{ padding: "100px 50px 90px", position: "relative" }}>
        
        {/* Ambient background watermark & glows */}
        <div style={{
          position: "absolute", top: -80, right: -60,
          width: 450, height: 450, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197, 155, 39, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 450, height: 450, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(114, 14, 30, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          
          {/* Section Header */}
          <div style={{ maxWidth: 820, margin: "0 auto 60px", textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 22px",
              background: "rgba(114, 14, 30, 0.05)",
              border: "1px solid rgba(197, 155, 39, 0.4)",
              borderRadius: 30,
              marginBottom: 20,
            }}>
              <span style={{ color: "#C59B27", fontSize: 13 }}>✦</span>
              <span style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 11.5,
                letterSpacing: "0.24em",
                color: "#720E1E",
                fontWeight: 700,
                textTransform: "uppercase",
              }}>Chapter I · Our Story · Estd. 2020</span>
              <span style={{ color: "#C59B27", fontSize: 13 }}>✦</span>
            </div>

            <h2 style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: "clamp(32px, 4.2vw, 48px)",
              fontWeight: 700,
              color: "#240207",
              lineHeight: 1.18,
              letterSpacing: "-0.01em",
              marginBottom: 18,
            }}>
              Where Tradition Meets{" "}
              <span style={{
                background: "linear-gradient(135deg, #720E1E 0%, #C59B27 60%, #E8B865 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Timeless Elegance
              </span>
            </h2>

            {/* Decorative flourish */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 1, background: "linear-gradient(to right, transparent, #C59B27)" }} />
              <span style={{ color: "#C59B27", fontSize: 13 }}>❖</span>
              <div style={{ width: 44, height: 1, background: "linear-gradient(to left, transparent, #C59B27)" }} />
            </div>

            <p style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 15.5,
              color: "#5C4A42",
              lineHeight: 1.85,
              fontWeight: 400,
              maxWidth: 740,
              margin: "0 auto",
            }}>
              Vika Vasthra was born in 2020 with a single, passionate mission — to revive the romance of authentic Indian handlooms. 
              Founded during a transformative era, our atelier stands as a living celebration of master weavers, 
              bringing ancestral Kanchipuram and Banarasi silk treasures directly from authentic looms to discerning women worldwide.
            </p>
          </div>

          {/* Main Grid: Left = Visual Atelier Arch & Quote Plaque, Right = Craftsmanship Bento Pillars */}
          <div className="emb-story-grid">
            
            {/* Left Column: Architectural Arch & Floating Parchment Quote */}
            <div className="emb-story-img-col" style={{ position: "relative" }}>
              
              {/* Outer decorative gold frame */}
              <div style={{
                position: "relative",
                padding: 12,
                background: "linear-gradient(135deg, rgba(197, 155, 39, 0.35) 0%, rgba(114, 14, 30, 0.2) 100%)",
                borderRadius: "200px 200px 24px 24px",
                boxShadow: "0 24px 50px -12px rgba(46, 5, 13, 0.22)",
              }}>
                
                {/* Arch container */}
                <div style={{
                  position: "relative",
                  borderRadius: "190px 190px 16px 16px",
                  overflow: "hidden",
                  height: 480,
                  background: "#240207",
                }}>
                  <img
                    src={saree3}
                    alt="Royal Red Zari Handloom Saree — Vika Vasthra"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                      transition: "transform 0.6s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  />

                  {/* Gradient shadow for depth */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(36, 2, 7, 0.85) 0%, rgba(36, 2, 7, 0.2) 45%, transparent 100%)",
                    pointerEvents: "none",
                  }} />

                  {/* Top Seal Stamp */}
                  <div style={{
                    position: "absolute",
                    top: 24,
                    right: 24,
                    background: "rgba(36, 2, 7, 0.85)",
                    border: "1.5px solid #C59B27",
                    borderRadius: "50%",
                    width: 76,
                    height: 76,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                    textAlign: "center",
                  }}>
                    <span style={{ color: "#E8B865", fontSize: 13, lineHeight: 1 }}>✦</span>
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 8.5,
                      letterSpacing: "0.14em",
                      color: "#FAF7F2",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}>PURE SILK</span>
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 7.5,
                      color: "#C59B27",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                    }}>CERTIFIED</span>
                  </div>
                </div>

                {/* Overlapping Founders' Manifesto Card */}
                <div style={{
                  position: "relative",
                  marginTop: -64,
                  marginLeft: 16,
                  marginRight: 16,
                  background: "#FFFFFF",
                  borderRadius: 14,
                  padding: "24px 26px 20px",
                  border: "1.5px solid rgba(197, 155, 39, 0.4)",
                  boxShadow: "0 18px 36px -10px rgba(114, 14, 30, 0.2)",
                  zIndex: 3,
                }}>
                  {/* Gold quote watermark */}
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 48,
                    lineHeight: 0.8,
                    color: "rgba(197, 155, 39, 0.35)",
                    marginBottom: 4,
                  }}>“</div>
                  
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16,
                    fontStyle: "italic",
                    fontWeight: 700,
                    color: "#2E050D",
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                  }}>
                    We didn’t just want to sell sarees. We wanted every woman to drape 
                    the living heritage, emotion, and soul of the master artisan who wove it.
                  </p>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid rgba(197, 155, 39, 0.2)",
                    paddingTop: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        color: "#720E1E",
                        textTransform: "uppercase",
                      }}>— Founders, Vika Vasthra</div>
                      <div style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        color: "#8A7970",
                      }}>Bengaluru, India</div>
                    </div>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 10px",
                      background: "rgba(197, 155, 39, 0.12)",
                      borderRadius: 12,
                    }}>
                      <span style={{ color: "#C59B27", fontSize: 11 }}>✦</span>
                      <span style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#720E1E",
                        letterSpacing: "0.08em",
                      }}>ESTD 2020</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: 3 Luxury Craftsmanship Bento Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {[
                {
                  icon: "✦",
                  badge: "Kanchipuram · Arani · Banarasi",
                  title: "Direct Master Weaver Curation",
                  body: "Every drape in our collection is personally sourced from generational master weavers. We hand-select genuine mulberry silk and authentic zari tested for purity, ensuring heirloom longevity in every thread.",
                  highlight: "100% Handpicked Authentic Silk",
                  number: "01",
                },
                {
                  icon: "❖",
                  badge: "Fair Wages & Dignified Craft",
                  title: "Artisan-First Philosophy",
                  body: "We partner directly with over 500 weaver families, eliminating exploitative middlemen. By paying above-market fair compensation, we ensure the sacred legacy of handloom weaving continues to thrive.",
                  highlight: "500+ Artisan Families Empowered",
                  number: "02",
                },
                {
                  icon: "✦",
                  badge: "Loom to Living Room Worldwide",
                  title: "Heirloom Quality, Royal Experience",
                  body: "With over 21,900+ sarees delivered across India and worldwide, each piece undergoes a stringent 7-point quality inspection before being lovingly packaged in our signature royal keepsake box.",
                  highlight: "21,900+ Drapes Delivered · 98% Happy",
                  number: "03",
                },
              ].map((card, idx) => (
                <div key={idx} className="emb-story-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(114, 14, 30, 0.08) 0%, rgba(197, 155, 39, 0.18) 100%)",
                        border: "1px solid rgba(197, 155, 39, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#720E1E",
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {card.icon}
                      </div>
                      <span style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        fontWeight: 700,
                        color: "#C59B27",
                        textTransform: "uppercase",
                      }}>
                        {card.badge}
                      </span>
                    </div>

                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "rgba(114, 14, 30, 0.25)",
                      lineHeight: 1,
                    }}>
                      {card.number}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2E050D",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}>
                    {card.title}
                  </h3>

                  <p style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 14,
                    color: "#5C4A42",
                    lineHeight: 1.75,
                    fontWeight: 400,
                    marginBottom: 16,
                  }}>
                    {card.body}
                  </p>

                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    background: "rgba(114, 14, 30, 0.04)",
                    border: "1px solid rgba(197, 155, 39, 0.3)",
                    borderRadius: 20,
                  }}>
                    <span style={{ color: "#C59B27", fontSize: 10 }}>✦</span>
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#720E1E",
                      letterSpacing: "0.04em",
                    }}>
                      {card.highlight}
                    </span>
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* Bottom Trust & Authenticity Ribbon */}
          <div style={{
            marginTop: 64,
            padding: "20px 30px",
            background: "#FFFFFF",
            border: "1px solid rgba(197, 155, 39, 0.3)",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(114, 14, 30, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 16,
          }}>
            {[
              { icon: "✦", text: "100% Handcrafted Indian Silk" },
              { icon: "❖", text: "Direct Artisan Loom Fair Trade" },
              { icon: "✦", text: "Rigorous 7-Point Quality Testing" },
              { icon: "❖", text: "Royal Keepsake Unboxing Experience" },
            ].map((pill, pIdx) => (
              <div key={pIdx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#C59B27", fontSize: 12 }}>{pill.icon}</span>
                <span style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#2E050D",
                  letterSpacing: "0.02em",
                }}>
                  {pill.text}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ OUR JOURNEY (SAREE PLEATS) ════════════════════════════ */}
      <section id="our-journey" className="jp" aria-label="Our journey">
        <style>{`
          .jp{--maroon:#720E1E;--maroon-dk:#240207;--gold:#C59B27;--gold-lt:#E8B865;--sand:#F1E9DB;--muted:#5C4A42;
            background:var(--sand);padding:96px 40px;font-family:'Jost',sans-serif}
          .jp *{box-sizing:border-box}
          .jp-in{max-width:1240px;margin:0 auto}
          .jp-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:40px}
          .jp-head h2{margin:0;font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(34px,5vw,58px);line-height:1.08;color:var(--maroon)}
          .jp-head p{margin:0;font-size:14.5px;color:var(--muted)}

          .jp-row{display:flex;gap:6px;height:580px}
          .jp-p{position:relative;flex:1 1 0;min-width:0;overflow:hidden;cursor:pointer;background:var(--maroon-dk);
            transition:flex-grow .7s cubic-bezier(.65,0,.25,1);outline:none}
          .jp-p.on{flex-grow:8;cursor:default}
          .jp-p:focus-visible{box-shadow:inset 0 0 0 3px var(--gold)}
          .jp-p img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .7s ease,filter .5s ease}
          .jp-p:not(.on) img{filter:saturate(.7) brightness(.8)}
          .jp-p:not(.on):hover img{filter:saturate(1) brightness(.95)}
          .jp-p::after{content:"";position:absolute;inset:0;pointer-events:none;
            background:linear-gradient(to top,rgba(36,2,7,.88) 0%,rgba(36,2,7,.25) 55%,rgba(36,2,7,.05) 100%)}
          /* pleat lines on closed panels */
          .jp-p:not(.on)::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
            background:linear-gradient(90deg,rgba(255,255,255,.14),transparent 30%,rgba(0,0,0,.18))}

          .jp-yr{position:absolute;left:0;right:0;bottom:22px;z-index:2;text-align:center;color:var(--gold-lt);
            font-family:'Playfair Display',serif;font-weight:700;font-size:22px;writing-mode:vertical-rl;transform:rotate(180deg);
            margin:0 auto;width:fit-content;transition:opacity .3s}
          .jp-p.on .jp-yr{opacity:0}
          .jp-star{position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:2;color:var(--gold-lt);font-size:14px}
          .jp-p.on .jp-star{display:none}

          .jp-body{position:absolute;left:0;bottom:0;z-index:2;width:min(560px,100%);padding:40px 44px;color:#FAF7F2;
            opacity:0;transform:translateY(16px);transition:opacity .4s ease,transform .5s ease}
          .jp-p.on .jp-body{opacity:1;transform:none;transition-delay:.35s}
          .jp-big{font-family:'Playfair Display',serif;font-weight:800;font-size:clamp(64px,9vw,120px);line-height:.9;color:var(--gold-lt);margin-bottom:14px}
          .jp-badge{display:inline-block;margin-bottom:10px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:var(--gold);color:var(--maroon-dk)}
          .jp-body h3{margin:0 0 10px;font-family:'Playfair Display',serif;font-weight:700;font-size:28px;line-height:1.2;color:#fff}
          .jp-body p{margin:0 0 16px;font-size:15px;line-height:1.8;color:#eadbcc;max-width:480px}
          .jp-facts{display:flex;gap:22px;flex-wrap:wrap;margin:0;padding:0;list-style:none}
          .jp-facts li{font-size:13px;font-weight:600;color:var(--gold-lt);padding-top:10px;border-top:1px solid rgba(232,184,101,.5)}

          @media (max-width:860px){
            .jp{padding:64px 20px}
            .jp-row{flex-direction:column;height:auto}
            .jp-p{flex:none;height:64px;transition:height .6s cubic-bezier(.65,0,.25,1)}
            .jp-p.on{height:500px}
            .jp-yr{writing-mode:horizontal-tb;transform:none;left:20px;right:auto;bottom:auto;top:50%;margin:0;translate:0 -50%;font-size:20px}
            .jp-star{top:50%;left:auto;right:20px;transform:translateY(-50%)}
            .jp-body{padding:24px 22px}
            .jp-big{font-size:68px}
            .jp-body h3{font-size:23px}
          }
          @media (prefers-reduced-motion:reduce){.jp *{transition:none!important}}
        `}</style>

        <div className="jp-in">
          <div className="jp-head">
            <h2>Six years, one golden thread</h2>
            <p>Tap a pleat to open that year.</p>
          </div>

          <div className="jp-row" role="tablist" aria-label="Years">
            {MILESTONES.map((m, i) => {
              const on = i === activeMilestone;
              return (
                <div
                  key={i}
                  role="tab"
                  tabIndex={0}
                  aria-selected={on}
                  className={`jp-p${on ? " on" : ""}`}
                  onClick={() => setActiveMilestone(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveMilestone(i); }
                    if (e.key === "ArrowRight") setActiveMilestone((p) => Math.min(p + 1, MILESTONES.length - 1));
                    if (e.key === "ArrowLeft") setActiveMilestone((p) => Math.max(p - 1, 0));
                  }}
                >
                  <img src={m.img} alt={on ? (m.imgAlt || m.title) : ""} />
                  {m.milestone && <span className="jp-star" aria-hidden="true">★</span>}
                  <span className="jp-yr">{String(m.year).slice(0, 4)}</span>

                  <div className="jp-body">
                    <div className="jp-big" aria-hidden="true">{String(m.year).slice(0, 4)}</div>
                    {m.badge && <span className="jp-badge">{m.badge}</span>}
                    <h3>{m.title}</h3>
                    <p>{m.desc}</p>
                    <ul className="jp-facts">
                      {m.stat1 && <li>{m.stat1}</li>}
                      {m.stat2 && <li>{m.stat2}</li>}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CORE VALUES (NEW PROFESSIONAL) ═══════════════ */}
      <CoreValuesPro />

      <FooterOne />
    </>
  );
};

export default AboutPage;