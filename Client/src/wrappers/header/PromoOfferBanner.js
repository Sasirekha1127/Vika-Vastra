import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../api";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const PromoOfferBanner = ({ position = "new_arrivals" }) => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        let active = [];
        try {
          const res = await fetch(`${API}/middle-banners?position=${position}&t=${Date.now()}`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            active = Array.isArray(data)
              ? data.filter((b) => b.status === "Active" && (!b.position || b.position === position))
              : [];
          }
        } catch (e) {
          console.warn("middle-banners fetch failed", e);
        }

        if (!active.length) {
          if (position === "best_sellers") {
            active = [{
              id: 'default-bestsellers-banner',
              image: 'uploads/middle-banners/top-deals-middle-banner.png',
              link: '/shop',
              status: 'Active',
              position: 'best_sellers',
            }];
          } else {
            active = [{
              id: 'default-newarrivals-banner',
              image: 'uploads/middle-banners/middle-deals-banner.png',
              link: '/shop',
              status: 'Active',
              position: 'new_arrivals',
            }];
          }
        }

        if (isMounted) setBanners(active);
      } catch (err) {
        console.error("PromoOfferBanner: fetch failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBanners();
    return () => { isMounted = false; };
  }, [position]);

  // Auto rotate if multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearTimeout(timerRef.current);
  }, [current, banners.length]);

  if (loading || !banners.length) return null;

  const handleBannerClick = (banner) => {
    if (!banner) return;
    const target = banner.link || banner.shopUrl || "/shop";
    if (target.startsWith("http://") || target.startsWith("https://")) {
      window.location.href = target;
    } else {
      navigate(process.env.PUBLIC_URL + (target.startsWith("/") ? target : `/${target}`));
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40 && banners.length > 1) {
      if (diff > 0) {
        setCurrent((prev) => (prev + 1) % banners.length);
      } else {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
  };

  return (
    <>
      <style>{`
        .pob-root {
          position: relative;
          z-index: 5;
          margin-top: -105px;
          margin-bottom: 30px;
          width: 100%;
          background: transparent !important;
        }

        .pob-container {
          max-width: 1220px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          box-sizing: border-box;
          background: transparent !important;
        }

        .pob-card-wrapper {
          position: relative;
          width: 100%;
          background: transparent !important;
          border-radius: 0;
          overflow: visible;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .pob-card-wrapper:hover {
          transform: translateY(-3px);
        }

        .pob-image {
          width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
          background: transparent !important;
          border: none;
        }

        .pob-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(36, 6, 29, 0.75);
          border: 1.5px solid rgba(229, 195, 101, 0.7);
          color: #E5C365;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          padding: 0;
          opacity: 0;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .pob-card-wrapper:hover .pob-arrow {
          opacity: 1;
        }

        .pob-arrow:hover {
          background: rgba(78, 8, 21, 0.95);
          border-color: #E5C365;
          transform: translateY(-50%) scale(1.08);
        }

        .pob-arrow-prev { left: 16px; }
        .pob-arrow-next { right: 16px; }

        .pob-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 10;
        }

        .pob-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: 1px solid rgba(229, 195, 101, 0.8);
          background: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .pob-dot.is-active {
          width: 22px;
          background: #C59B27;
          box-shadow: 0 0 8px rgba(197, 155, 39, 0.7);
        }

        @media (max-width: 1024px) {
          .pob-root {
            margin-top: -85px;
            margin-bottom: 24px;
          }
        }

        @media (max-width: 768px) {
          .pob-root {
            margin-top: -55px;
            margin-bottom: 20px;
          }
          .pob-container {
            padding: 0 14px;
          }
          .pob-arrow {
            display: none !important;
          }
          .pob-dots {
            bottom: 6px;
          }
          .pob-dot {
            height: 5px;
          }
          .pob-dot.is-active {
            width: 16px;
          }
        }

        .pob-root.pob-root--bestsellers {
          margin-top: 38px;
          margin-bottom: 30px;
        }

        @media (max-width: 1024px) {
          .pob-root.pob-root--bestsellers {
            margin-top: 28px;
            margin-bottom: 22px;
          }
        }

        @media (max-width: 768px) {
          .pob-root.pob-root--bestsellers {
            margin-top: 20px;
            margin-bottom: 16px;
          }
        }

        @media (max-width: 480px) {
          .pob-root.pob-root--bestsellers {
            margin-top: 16px;
            margin-bottom: 12px;
          }
        }
      `}</style>

      <div className={`pob-root pob-root--${String(position).replace(/_/g, '')}`}>
        <div className="pob-container">
          <div
            className="pob-card-wrapper"
            onClick={() => handleBannerClick(banners[current])}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {banners.map((banner, i) => (
              <div
                key={banner.id || i}
                style={{
                  display: current === i ? "block" : "none",
                  width: "100%",
                  background: "transparent",
                }}
              >
                <img
                  src={getImageUrl(banner.image)}
                  alt={banner.title || "Offer Banner"}
                  className="pob-image"
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    background: "transparent",
                    margin: "0 auto",
                  }}
                />
              </div>
            ))}

            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous banner"
                  className="pob-arrow pob-arrow-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
                  }}
                >
                  &#10094;
                </button>
                <button
                  type="button"
                  aria-label="Next banner"
                  className="pob-arrow pob-arrow-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent((prev) => (prev + 1) % banners.length);
                  }}
                >
                  &#10095;
                </button>
                <div className="pob-dots">
                  {banners.map((banner, idx) => (
                    <button
                      key={banner.id || idx}
                      type="button"
                      aria-label={`Go to banner ${idx + 1}`}
                      className={`pob-dot ${current === idx ? "is-active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrent(idx);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PromoOfferBanner;
