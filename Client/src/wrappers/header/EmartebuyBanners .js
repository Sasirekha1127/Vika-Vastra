import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const themes = [
  {
    overlayColor: "rgba(30,10,0,0.48)",
    ctaColor: "rgba(201,146,42,0.25)",
    ctaBorder: "rgba(201,146,42,0.7)",
    offColor: "rgba(255,255,255,0.75)",
    uptoColor: "rgba(255,255,255,0.65)",
  },
  {
    overlayColor: "rgba(10,5,30,0.50)",
    ctaColor: "rgba(100,140,220,0.25)",
    ctaBorder: "rgba(140,100,255,0.7)",
    offColor: "rgba(200,180,255,0.8)",
    uptoColor: "rgba(210,195,255,0.7)",
  },
  {
    overlayColor: "rgba(60,5,20,0.48)",
    ctaColor: "rgba(255,100,120,0.25)",
    ctaBorder: "rgba(255,150,160,0.7)",
    offColor: "rgba(255,210,200,0.85)",
    uptoColor: "rgba(255,210,200,0.7)",
  },
  {
    overlayColor: "rgba(5,30,15,0.50)",
    ctaColor: "rgba(60,180,100,0.25)",
    ctaBorder: "rgba(80,200,120,0.7)",
    offColor: "rgba(200,255,220,0.85)",
    uptoColor: "rgba(180,255,210,0.7)",
  },
];

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${API}/${clean}`;
};

const parseDiscount = (discountLabel) => {
  if (!discountLabel) return { offerLabel: "", offer: "", offText: "" };
  const match = discountLabel.match(/^([A-Za-z]+\s*)?([\d]+\s*%|\d+)\s*(.*)$/i);
  if (match) {
    return {
      offerLabel: (match[1] || "").trim(),
      offer:      (match[2] || discountLabel).trim(),
      offText:    (match[3] || "").trim(),
    };
  }
  return { offerLabel: "", offer: discountLabel, offText: "" };
};

const isNumericOffer = (offer) => /^\d+\s*%?$/.test(offer.trim());

// Responsive breakpoints
const getVisibleCount = (width) => {
  if (width < 640) return 1;      // Mobile
  if (width < 1024) return 2;     // Tablet
  return 3;                        // Desktop
};

// ── Single Banner ────────────────────────────────────────────────
function Banner({ data, theme, onNavigate, onShopUrl }) {
  const { offerLabel, offer, offText } = parseDiscount(data.discountLabel);
  const imageUrl = getImageUrl(data.image);
  const largeOffer = offer && isNumericOffer(offer);

  const titleWords = data.title ? data.title.split(" ") : [""];
  const mid   = Math.ceil(titleWords.length / 2);
  const line1 = titleWords.slice(0, mid).join(" ");
  const line2 = titleWords.slice(mid).join(" ");

  const ctaLabel = data.brandTag
    ? `Shop ${data.brandTag} →`
    : (data.content || "Shop Now →");

  const titleColor    = data.titleColor    || "#ffffff";
  const discountColor = data.discountColor || "#f5d78e";

  return (
    <div
      onClick={onNavigate}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        minHeight: "clamp(220px, 40vh, 400px)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={data.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${theme.overlayColor} 0%, rgba(0,0,0,0.18) 100%)`,
        }}
      />

      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        viewBox="0 0 300 200"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width="300" height="2" fill="rgba(201,146,42,0.6)" />
        <rect x="0" y="198" width="300" height="2" fill="rgba(201,146,42,0.6)" />
        <path d="M10 10L28 10M10 10L10 28"        fill="none" stroke="rgba(201,146,42,0.6)" strokeWidth="1.5" />
        <path d="M290 10L272 10M290 10L290 28"    fill="none" stroke="rgba(201,146,42,0.6)" strokeWidth="1.5" />
        <path d="M10 190L28 190M10 190L10 172"    fill="none" stroke="rgba(201,146,42,0.6)" strokeWidth="1.5" />
        <path d="M290 190L272 190M290 190L290 172" fill="none" stroke="rgba(201,146,42,0.6)" strokeWidth="1.5" />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(16px, 4vw, 20px) clamp(16px, 4vw, 22px)",
        }}
      >
        {data.brandTag && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.55)",
              border: `1px solid ${theme.ctaBorder}`,
              borderRadius: 0,
              padding: "clamp(3px, 1vw, 4px) clamp(8px, 2vw, 10px)",
              width: "fit-content",
              marginBottom: "clamp(8px, 2vw, 10px)",
              backdropFilter: "blur(6px)",
              borderLeft: `3px solid ${discountColor}`,
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(9px, 2vw, 11px)",
                letterSpacing: "clamp(2px, 0.5vw, 3px)",
                textTransform: "uppercase",
                color: discountColor,
                fontWeight: 700,
              }}
            >
              {data.brandTag}
            </span>
          </div>
        )}

        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(14px, 3vw, 22px)",
            fontWeight: 900,
            color: titleColor,
            lineHeight: 1.15,
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            marginBottom: "clamp(2px, 1vw, 4px)",
          }}
        >
          {line1}
          {line2 && <><br />{line2}</>}
        </div>

        {data.subtitle && (
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(14px, 2.5vw, 18px)",
            color: "rgba(255,255,255,0.82)",
            letterSpacing: "0.3px",
            marginBottom: "clamp(6px, 1.5vw, 8px)",
          }}>
            {data.subtitle}
          </div>
        )}

        {offer && (
          <div style={{ 
            display: "flex", 
            alignItems: "baseline", 
            gap: "clamp(2px, 1vw, 4px)", 
            marginBottom: "clamp(10px, 2.5vw, 14px)", 
            flexWrap: "wrap" 
          }}>
            {offerLabel && largeOffer && (
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(14px, 3vw, 20px)",
                letterSpacing: "clamp(1px, 0.4vw, 2px)",
                textTransform: "uppercase",
                color: discountColor,
                alignSelf: "flex-end",
                paddingBottom: "clamp(3px, 1vw, 6px)",
                whiteSpace: "nowrap",
              }}>
                {offerLabel}
              </span>
            )}

            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: largeOffer
                ? "clamp(32px, 8vw, 70px)"
                : "clamp(16px, 2.8vw, 26px)",
              fontWeight: largeOffer ? 400 : 700,
              color: discountColor,
              lineHeight: 1.15,
              textShadow: "0 2px 18px rgba(0,0,0,0.7)",
              letterSpacing: largeOffer ? "-0.5px" : "0.5px",
              whiteSpace: largeOffer ? "nowrap" : "normal",
              wordBreak: "break-word",
            }}>
              {offer}
            </span>

            {offText && largeOffer && (
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(12px, 2.5vw, 20px)",
                letterSpacing: "clamp(1px, 0.5vw, 3px)",
                textTransform: "uppercase",
                color: discountColor,
                alignSelf: "flex-end",
                paddingBottom: "clamp(4px, 1.5vw, 8px)",
                whiteSpace: "nowrap",
              }}>
                {offText}
              </span>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onShopUrl(); }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(8px, 2vw, 10px)",
              letterSpacing: "clamp(1.5px, 0.5vw, 2.5px)",
              textTransform: "uppercase",
              color: "#fff",
              border: `0.5px solid ${theme.ctaBorder}`,
              background: theme.ctaColor,
              padding: "clamp(5px, 1.5vw, 7px) clamp(12px, 3vw, 16px)",
              borderRadius: 2,
              cursor: "pointer",
              fontWeight: 600,
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.ctaBorder;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.ctaColor;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────
function BannerSkeleton() {
  return (
    <div style={{
      borderRadius: 12,
      minHeight: "clamp(220px, 40vh, 400px)",
      flexShrink: 0,
      background: "linear-gradient(90deg, #1a0a00 25%, #2a1500 50%, #1a0a00 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }} />
  );
}

// ── Navigation Arrows ───────────────────────────────────────────
function NavigationArrows({ onPrev, onNext, visible }) {
  if (visible <= 1) return null;
  
  return (
    <>
      <button
        onClick={onPrev}
        className="emb-banner-arrow-left"
        style={{
          position: "absolute",
          left: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(32px, 6vw, 40px)",
          height: "clamp(32px, 6vw, 40px)",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(201,146,42,0.5)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,146,42,0.8)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.6)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button
        onClick={onNext}
        className="emb-banner-arrow-right"
        style={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(32px, 6vw, 40px)",
          height: "clamp(32px, 6vw, 40px)",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(201,146,42,0.5)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(201,146,42,0.8)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0,0,0,0.6)";
          e.currentTarget.style.transform = "translateY(-50%) scale(1)";
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </>
  );
}

// ── Dots Navigation ─────────────────────────────────────────────
function DotsNavigation({ current, total, onDotClick }) {
  if (total <= 1) return null;
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "clamp(6px, 2vw, 10px)",
      marginTop: "clamp(16px, 4vw, 24px)",
      flexWrap: "wrap",
    }}>
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onDotClick(idx)}
          style={{
            width: current === idx ? "clamp(20px, 4vw, 28px)" : "clamp(8px, 2vw, 10px)",
            height: "clamp(8px, 2vw, 10px)",
            borderRadius: current === idx ? "clamp(10px, 2vw, 14px)" : "50%",
            background: current === idx 
              ? "rgba(201,146,42,0.9)" 
              : "rgba(201,146,42,0.3)",
            border: current === idx 
              ? "none" 
              : "1px solid rgba(201,146,42,0.5)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Carousel ─────────────────────────────────────────────────
const AUTO_SCROLL_INTERVAL = 2000;

export default function EmartebuyBannersRow({ spaceTopClass, spaceBottomClass }) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isHovered, setIsHovered] = useState(false);
  
  const trackRef = useRef(null);
  const wrapRef  = useRef(null);
  const autoScrollRef = useRef(null);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setVisibleCount(getVisibleCount(width));
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch banners
  useEffect(() => {
    fetch(`${API}/offer-banners`)
      .then(r => r.json())
      .then(data => {
        setBanners(data.filter(b => b.status === "Active"));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load offer banners:", err);
        setLoading(false);
      });
  }, []);

  const items = loading ? [0, 1, 2, 3] : banners;
  const total = items.length;
  const maxIndex = Math.max(0, total - visibleCount);
  const GAP = typeof window !== 'undefined' && window.innerWidth < 640 ? 12 : 16;

  const cardWidth = () => {
    if (!wrapRef.current) return 0;
    return (wrapRef.current.offsetWidth - GAP * (visibleCount - 1)) / visibleCount;
  };

  const snapOffset = (idx) => idx * (cardWidth() + GAP);

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(idx, maxIndex));
    setCurrentIndex(clamped);
  };

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      goTo(currentIndex + 1);
    } else {
      goTo(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      goTo(maxIndex);
    }
  };

  // Auto-scroll logic with hover pause
  useEffect(() => {
    if (loading || banners.length === 0 || isHovered) return;
    
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
    
    autoScrollRef.current = setInterval(() => {
      if (currentIndex < maxIndex) {
        goTo(currentIndex + 1);
      } else {
        goTo(0);
      }
    }, AUTO_SCROLL_INTERVAL);
    
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [loading, banners.length, maxIndex, currentIndex, isHovered]);

  const translateX = snapOffset(currentIndex);

  const handleNavigate = (banner) => {
    const target = banner.link;
    if (target) {
      target.startsWith("http") ? window.open(target, "_blank") : navigate(target);
    } else {
      navigate("/shop");
    }
  };

  const handleShopUrl = (banner) => {
    const target = banner.shopUrl || banner.link;
    if (target) {
      target.startsWith("http") ? window.open(target, "_blank") : navigate(target);
    } else {
      navigate("/shop");
    }
  };

  const dotCount = Math.max(1, total - visibleCount + 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .banner-container {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>

      <div
        className={`${spaceTopClass || ""} ${spaceBottomClass || ""} banner-container`}
        style={{
          width: "100%",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "clamp(40px, 8vh, 90px) clamp(12px, 4vw, 16px) clamp(20px, 4vh, 25px) clamp(12px, 4vw, 16px)",
          boxSizing: "border-box",
        }}
      >
        <div 
          style={{ 
            position: "relative",
            padding: visibleCount > 1 ? "0 clamp(20px, 4vw, 30px)" : 0,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Arrows */}
          {!loading && banners.length > visibleCount && (
            <NavigationArrows 
              onPrev={prevSlide} 
              onNext={nextSlide} 
              visible={visibleCount}
            />
          )}

          {/* Clip window */}
          <div ref={wrapRef} style={{ overflow: "hidden", borderRadius: 12 }}>
            <div
              ref={trackRef}
              style={{
                display: "flex",
                gap: GAP,
                transform: `translateX(-${translateX}px)`,
                transition: "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
                willChange: "transform",
              }}
            >
              {loading
                ? Array(visibleCount).fill().map((_, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        flex: `0 0 calc(${100 / visibleCount}% - ${GAP * (visibleCount - 1) / visibleCount}px)`,
                        minWidth: 0,
                      }}
                    >
                      <BannerSkeleton />
                    </div>
                  ))
                : banners.map((b, i) => (
                    <div 
                      key={b.id} 
                      style={{ 
                        flex: `0 0 calc(${100 / visibleCount}% - ${GAP * (visibleCount - 1) / visibleCount}px)`,
                        minWidth: 0,
                      }}
                    >
                      <Banner
                        data={b}
                        theme={themes[i % themes.length]}
                        onNavigate={() => handleNavigate(b)}
                        onShopUrl={() => handleShopUrl(b)}
                      />
                    </div>
                  ))
              }
            </div>
          </div>

         
        </div>
      </div>
    </>
  );
}