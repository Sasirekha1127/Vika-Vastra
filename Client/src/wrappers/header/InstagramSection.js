import { useState, useEffect } from "react";
import { getAllInstagramPosts, getImageUrl } from "../../api";

const T = {
  maroon: "#720E1E",
  maroonDark: "#5A0B17",
  gold: "#c9963a",
  goldLt: "#e8b85c",
  border: "#e8ddd0",
  muted: "#7a6a6a",
  serif: "'Cormorant Garamond', serif",
  sans: "'DM Sans', sans-serif",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

const IMAGE_HEIGHT = {
  desktop: "250px",
  tablet:  "210px",
  mobile:  "180px",
};

function chunkIntoRows(posts, screenWidth) {
  if (screenWidth <= 600) {
    return posts.map((post) => ({ cols: "1fr", items: [post] }));
  } else if (screenWidth <= 900) {
    const result = [];
    for (let i = 0; i < posts.length; i += 2)
      result.push({ cols: "1fr 1fr", items: posts.slice(i, i + 2) });
    return result;
  } else {
    const result = [];
    for (let i = 0; i < posts.length; i += 3)
      result.push({ cols: "1fr 1fr 1fr", items: posts.slice(i, i + 3) });
    return result;
  }
}

function cellHeight(screenWidth) {
  if (screenWidth <= 600) return IMAGE_HEIGHT.mobile;
  if (screenWidth <= 900) return IMAGE_HEIGHT.tablet;
  return IMAGE_HEIGHT.desktop;
}

/* ── Icons (new rounded set) ─────────────────────────────────── */
const InstagramIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="6" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill={color} />
  </svg>
);

const ExternalIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

function InstaCell({ item, screenWidth, index, instagramUrl }) {
  const [hovered, setHovered] = useState(false);
  const imgSrc = getImageUrl(item.image);
  const postUrl = item.postUrl || instagramUrl;
  const height = cellHeight(screenWidth);
  const lift = hovered && screenWidth > 768;

  return (
    <div
      onMouseEnter={() => screenWidth > 768 && setHovered(true)}
      onMouseLeave={() => screenWidth > 768 && setHovered(false)}
      onClick={() => postUrl && window.open(postUrl, "_blank", "noopener,noreferrer")}
      className="ig-animate"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: `1px solid ${lift ? "rgba(201,150,58,0.7)" : T.border}`,
        borderRadius: 18,
        padding: 8,
        cursor: "pointer",
        transform: lift ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.34s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.34s ease, border-color 0.3s ease",
        boxShadow: lift
          ? "0 22px 40px rgba(114,14,30,0.16)"
          : "0 4px 14px rgba(114,14,30,0.06)",
        animationDelay: `${index * 80}ms`,
        width: "100%",
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative", height, borderRadius: 12, overflow: "hidden", background: "#f0ebe4" }}>
        <img src={imgSrc} alt={item.label}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center", display: "block",
            transform: lift ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.6s ease",
          }}
        />

        {/* Instagram badge */}
        <span style={{
          position: "absolute", top: 10, right: 10,
          width: 30, height: 30, borderRadius: 10,
          background: "rgba(114,14,30,0.85)", color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <InstagramIcon size={15} />
        </span>

        {/* Hover: View Post */}
        {screenWidth > 768 && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(114,14,30,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.28s ease",
            pointerEvents: "none",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T.goldLt, color: T.maroon,
              borderRadius: 14, padding: "9px 18px",
              fontFamily: T.sans, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em",
            }}>
              <span>View Post</span>
              <ExternalIcon size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Caption under the image */}
      <div style={{ padding: "12px 6px 6px" }}>
        <div style={{ fontFamily: T.sans, fontSize: 10.5, color: T.gold, letterSpacing: "0.1em", marginBottom: 3, fontWeight: 600 }}>
          {item.tag}
        </div>
        <div style={{ fontFamily: T.serif, fontSize: screenWidth <= 600 ? 18 : 17, color: T.maroon, fontWeight: 700, letterSpacing: "0.01em", lineHeight: 1.25 }}>
          {item.label}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow({ cols, count, screenWidth }) {
  const height = `calc(${cellHeight(screenWidth)} + 78px)`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16, marginBottom: 16 }}>
      {Array(count).fill().map((_, i) => (
        <div key={i} style={{
          height, borderRadius: 18,
          background: "linear-gradient(90deg, #f0ebe4 25%, #e8e0d5 50%, #f0ebe4 75%)",
          backgroundSize: "200% 100%",
          animation: "igShimmer 1.4s infinite",
        }} />
      ))}
    </div>
  );
}

// ─── Two account configs ─────────────────────────────────────────────────────
const INSTAGRAM_ACCOUNTS = [
  {
    handle: "@vika_vastra",
    url: "",
  },
  {
    handle: "@v_k_vastra",
    url: "",
  },
];

export function InstagramSection({ spaceBottomClass = "pb-0" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getAllInstagramPosts()
      .then((res) => setPosts(res.data || []))
      .catch((err) => console.error("Instagram posts fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const rows = chunkIntoRows(posts, screenWidth);
  const skeletonCols = screenWidth <= 600 ? "1fr" : screenWidth <= 900 ? "1fr 1fr" : "1fr 1fr 1fr";
  const skeletonCount = screenWidth <= 600 ? 1 : screenWidth <= 900 ? 2 : 3;

  let globalIndex = 0;

  return (
    <div className={spaceBottomClass} style={{ background: "linear-gradient(180deg, #ffffff 0%, #fbf5ee 100%)" }}>
      <style>{FONTS}</style>
      <style>{`
        .ig-ed-row { display: grid; gap: 16px; margin-bottom: 16px; }
        .ig-ed-row > div { min-width: 0; }

        @keyframes igFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ig-animate { animation: igFadeUp 0.5s ease both; }

        @keyframes igShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ig-cta-btn {
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }
        .ig-cta-chip {
          transition: background 0.25s ease, color 0.25s ease;
        }
        .ig-cta-btn:hover {
          background: ${T.maroon} !important;
          color: #fff !important;
          border-color: ${T.maroon} !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(114, 14, 30, 0.22) !important;
        }
        .ig-cta-btn:hover .ig-cta-chip {
          background: ${T.goldLt} !important;
          color: ${T.maroon} !important;
        }
        .ig-cta-btn:focus-visible { outline: 2px solid ${T.gold}; outline-offset: 3px; }
        .ig-ed-row > div { -webkit-tap-highlight-color: transparent; }

        @media (prefers-reduced-motion: reduce) {
          .ig-animate { animation: none; }
        }
      `}</style>

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: screenWidth <= 768 ? "40px 20px" : "64px 32px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: screenWidth <= 768 ? 32 : 44, padding: "0 16px" }}>
          <h2 style={{
            fontFamily: T.serif,
            fontSize: screenWidth <= 600 ? "30px" : "clamp(32px, 4vw, 42px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: T.maroon,
            letterSpacing: "0.02em",
            textTransform: "capitalize",
            margin: "0 0 16px",
            lineHeight: 1.15,
          }}>
            Instagram Feeds
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ width: 56, height: 1, background: "linear-gradient(90deg, transparent, rgba(201,150,58,0.8))" }} />
            <span style={{ width: 7, height: 7, background: T.gold, transform: "rotate(45deg)" }} />
            <span style={{ width: 56, height: 1, background: "linear-gradient(90deg, rgba(201,150,58,0.8), transparent)" }} />
          </div>
        </div>

        {/* Skeletons */}
        {loading && Array(screenWidth <= 600 ? 3 : 2).fill().map((_, i) => (
          <SkeletonRow key={i} cols={skeletonCols} count={skeletonCount} screenWidth={screenWidth} />
        ))}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: T.sans, fontSize: 14, color: T.muted }}>
            <InstagramIcon size={32} color={T.muted} />
            <p style={{ marginTop: 16 }}>No posts available yet.</p>
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && rows.map((row, rowIdx) => (
          <div key={rowIdx} className="ig-ed-row" style={{ gridTemplateColumns: row.cols }}>
            {row.items.map((item) => {
              const idx = globalIndex++;
              return (
                <InstaCell
                  key={item.id || idx}
                  item={item}
                  index={idx}
                  instagramUrl={INSTAGRAM_ACCOUNTS[0].url}
                  screenWidth={screenWidth}
                />
              );
            })}
          </div>
        ))}

        {/* ── CTA: two account buttons ── */}
        <div style={{ textAlign: "center", marginTop: 52 }}>

          {/* Label */}
          <p style={{
            fontFamily: T.serif,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: screenWidth <= 600 ? 18 : 20,
            color: T.maroon,
            letterSpacing: "0.02em",
            marginBottom: 18,
          }}>
            Follow us on Instagram
          </p>

          {/* Two buttons side by side (stack on mobile) */}
          <div style={{
            display: "flex",
            flexDirection: screenWidth <= 480 ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}>
            {INSTAGRAM_ACCOUNTS.map((account) => (
              <a
                key={account.handle}
                href={account.url || `https://www.instagram.com/${account.handle.replace('@', '')}/`}
                target="_blank"
                rel="noreferrer"
                className="ig-cta-btn"
                style={{
                  fontFamily: T.sans,
                  fontSize: screenWidth <= 600 ? 13 : 14,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  color: T.maroon,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 12,
                  padding: "8px 24px 8px 8px",
                  border: `1.5px solid rgba(201,150,58,0.55)`,
                  borderRadius: 16,
                  background: "#fff",
                  boxShadow: "0 4px 14px rgba(114,14,30,0.06)",
                  cursor: "pointer",
                  width: screenWidth <= 480 ? "100%" : "auto",
                  maxWidth: 280,
                  boxSizing: "border-box",
                }}
              >
                <span className="ig-cta-chip" style={{
                  width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                  background: "rgba(201,150,58,0.15)", color: T.maroon,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <InstagramIcon size={17} color={T.maroon} />
                </span>
                <span>{account.handle}</span>
              </a>
            ))}
          </div>

          <p style={{
            fontFamily: T.sans,
            fontSize: screenWidth <= 600 ? 11.5 : 12.5,
            color: T.muted,
            marginTop: 18,
            letterSpacing: "0.02em",
            padding: "0 16px",
          }}>
            Tag us{" "}
            <strong style={{ color: T.gold, fontWeight: 700 }}>#vikavastra</strong>
            {" "}to be featured in our gallery
          </p>
        </div>

      </div>
    </div>
  );
}

export default InstagramSection;