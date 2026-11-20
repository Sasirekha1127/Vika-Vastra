import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllCategories, getImageUrl } from "../../api"; // adjust path as needed

const WINE = "#3d0711";
const MAROON = "#720E1E";
const GOLD = "#d4a935";
const IVORY = "#fbf3ec";
const INK = "#2a1a1c";

const CollectionCard = ({ col }) => {
  const imageUrl = getImageUrl(col.image);

  return (
    <Link to={`/shop?category=${encodeURIComponent(col.name)}`} className="shc-card">
      <div className="shc-disc">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={col.name}
            loading="lazy"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
      </div>
      <p className="shc-label">{col.name}</p>
    </Link>
  );
};

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="shc-card" aria-hidden="true">
    <div className="shc-disc shc-skeleton" />
    <div className="shc-skeleton-line" />
  </div>
);

const ArrowIcon = ({ direction }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {direction === "left"
      ? <polyline points="15 18 9 12 15 6" />
      : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

const getVisibleCount = (width) => {
  if (width <= 480) return 2;
  if (width <= 768) return 3;
  if (width <= 1024) return 4;
  return 6;
};

const ShopByCollections = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    typeof window !== "undefined" ? getVisibleCount(window.innerWidth) : 6
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategories();
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Could not load Best collections.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const maxIndex = Math.max(0, categories.length - visibleCount);
  const isCarousel = !loading && !error && categories.length > visibleCount;

  useEffect(() => {
    const handleResize = () => {
      const vc = getVisibleCount(window.innerWidth);
      setVisibleCount(vc);
      setActiveIndex((prev) => Math.min(prev, Math.max(0, categories.length - vc)));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [categories.length]);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < maxIndex;

  const stepCarousel = (delta) => {
    setActiveIndex((prev) => Math.max(0, Math.min(maxIndex, prev + delta)));
  };

  const handleTouchStart = (e) => {
    if (!isCarousel) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!isCarousel || touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    touchStartXRef.current = null;
    if (diff > 40) stepCarousel(1);
    else if (diff < -40) stepCarousel(-1);
  };

  const ready = !loading && !error && categories.length > 0;
  const totalSteps = isCarousel ? maxIndex + 1 : 0;

  return (
    <section className="shc-root">
      <style>{css}</style>

      <div className={`shc-stage${isCarousel ? " has-carousel" : ""}`}>
        {ready && isCarousel && (
          <button
            type="button"
            onClick={() => stepCarousel(-1)}
            disabled={!canGoPrev}
            className={`shc-arrow shc-arrow--left${!canGoPrev ? " is-disabled" : ""}`}
            aria-label="Previous category"
          >
            <ArrowIcon direction="left" />
          </button>
        )}

        <div
          className="shc-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`shc-row${isCarousel ? " is-carousel" : ""}`}
            style={{ "--offset": activeIndex }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : error
                ? <p className="shc-error">{error}</p>
                : categories.map((cat) => <CollectionCard key={cat.id} col={cat} />)}
          </div>
        </div>

        {ready && isCarousel && (
          <button
            type="button"
            onClick={() => stepCarousel(1)}
            disabled={!canGoNext}
            className={`shc-arrow shc-arrow--right${!canGoNext ? " is-disabled" : ""}`}
            aria-label="Next category"
          >
            <ArrowIcon direction="right" />
          </button>
        )}
      </div>

      {ready && isCarousel && totalSteps > 1 && (
        <div className="shc-dots" role="tablist" aria-label="Category carousel positions">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Slide to category ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`shc-dot${activeIndex === idx ? " is-active" : ""}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ShopByCollections;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Marcellus&family=Hanken+Grotesk:wght@400;500;600&display=swap');

  .shc-root, .shc-root * { box-sizing: border-box; }
  .shc-root { background: #f8ebd7; padding: 32px 0 36px; font-family: 'Hanken Grotesk', sans-serif; overflow: hidden; }
  .shc-stage {
    position: relative;
    max-width: 1220px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .shc-stage.has-carousel {
    padding: 0 56px;
  }

  .shc-viewport {
    overflow: hidden;
    width: 100%;
  }

  .shc-row {
    --visible: 6;
    --gap: 24px;
    --offset: 0;
    display: flex;
    justify-content: center;
    gap: var(--gap);
    width: 100%;
    padding: 8px 0;
    transform: translateX(0);
    transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .shc-row.is-carousel {
    justify-content: flex-start;
    transform: translateX(calc(var(--offset) * -1 * (100% + var(--gap)) / var(--visible)));
  }

  .shc-card {
    flex: 0 0 calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible));
    width: calc((100% - (var(--visible) - 1) * var(--gap)) / var(--visible));
    padding: 6px;
    text-decoration: none;
    display: block;
  }

  /* round medallion with gold ring (inset via card padding so ring never clips) */
  .shc-disc {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    background: #efe3da;
    margin-bottom: 4px;
    box-shadow: 0 0 0 3px ${IVORY}, 0 0 0 4.5px ${GOLD};
    transition: box-shadow .25s ease, transform .25s ease;
  }
  .shc-card:hover .shc-disc, .shc-card:focus-visible .shc-disc {
    box-shadow: 0 0 0 3px ${IVORY}, 0 0 0 6px ${MAROON};
  }
  .shc-disc img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
  .shc-card:hover .shc-disc img { transform: scale(1.08); }

  .shc-label {
    margin: 14px 2px 0;
    text-align: center;
    font-family: 'Marcellus', serif;
    font-size: 16px;
    line-height: 1.3;
    color: ${INK};
    transition: color .2s;
  }
  .shc-card:hover .shc-label { color: ${MAROON}; }
  .shc-card:focus-visible { outline: none; }

  /* loading */
  .shc-skeleton { background: linear-gradient(90deg, #efe3da 25%, #f7eee8 50%, #efe3da 75%);
    background-size: 200% 100%; animation: shcShimmer 1.4s infinite; }
  .shc-skeleton-line { height: 12px; width: 65%; margin: 16px auto 0; border-radius: 4px; background: #efe3da; }
  @keyframes shcShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .shc-error { margin: 0 auto; padding: 0 20px; font-size: 14px; color: ${MAROON}; }

  /* arrows */
  .shc-arrow {
    position: absolute;
    top: 41%;
    transform: translateY(-50%);
    z-index: 20;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: ${GOLD};
    background: ${WINE};
    border: 1.5px solid rgba(212, 169, 53, 0.55);
    box-shadow: 0 4px 14px rgba(61, 7, 17, 0.25);
    transition: background .2s ease, color .2s ease, opacity .2s ease, transform .2s ease;
  }
  .shc-arrow:hover:not(:disabled) { background: ${GOLD}; color: ${WINE}; }
  .shc-arrow.is-disabled, .shc-arrow:disabled {
    opacity: 0.32;
    cursor: default;
    pointer-events: none;
  }
  .shc-arrow:focus-visible { outline: 2px solid ${MAROON}; outline-offset: 2px; }
  .shc-arrow--left  { left: 8px; }
  .shc-arrow--right { right: 8px; }

  /* pagination dots */
  .shc-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }
  .shc-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    border: none;
    padding: 0;
    background: rgba(114, 14, 30, 0.22);
    cursor: pointer;
    transition: width .25s ease, background .25s ease;
  }
  .shc-dot.is-active {
    width: 24px;
    background: ${MAROON};
  }

  @media (max-width: 1024px) {
    .shc-stage.has-carousel { padding: 0 48px; }
    .shc-row { --visible: 4; --gap: 20px; }
  }
  @media (max-width: 768px) {
    .shc-stage { padding: 0 16px; }
    .shc-stage.has-carousel { padding: 0 42px; }
    .shc-row { --visible: 3; --gap: 14px; }
    .shc-label { font-size: 14.5px; margin-top: 12px; }
    .shc-arrow { width: 34px; height: 34px; }
    .shc-arrow--left { left: 4px; }
    .shc-arrow--right { right: 4px; }
  }
  @media (max-width: 480px) {
    .shc-stage { padding: 0 12px; }
    .shc-stage.has-carousel { padding: 0 38px; }
    .shc-row { --visible: 2; --gap: 12px; }
    .shc-label { font-size: 13.5px; }
    .shc-arrow { width: 30px; height: 30px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .shc-skeleton { animation: none; }
    .shc-row, .shc-disc img, .shc-disc, .shc-dot, .shc-arrow { transition: none; }
  }
`;