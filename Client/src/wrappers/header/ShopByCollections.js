import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllCategories, getImageUrl } from "../../api"; // adjust path as needed

const CollectionCard = ({ col }) => {
  const imageUrl = getImageUrl(col.image);

  return (
    <Link to={`/shop?category=${encodeURIComponent(col.name)}`} className="shc-card">
      <div className="shc-ring">
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
        <span className="shc-glow" aria-hidden="true" />
      </div>
      <p className="shc-label">
        <span className="shc-label-text">{col.name}</span>
      </p>
    </Link>
  );
};

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="shc-card" aria-hidden="true">
    <div className="shc-ring">
      <div className="shc-disc shc-skeleton" />
    </div>
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

      {/* ── Shop by Category heading (now on top) ── */}
      <div className="shc-heading">
        <span className="shc-heading__lines shc-heading__lines--l" aria-hidden="true">
          <i className="shc-heading__far" />
          <i className="shc-heading__near" />
        </span>
        <h2 className="shc-heading__title">Shop by Category</h2>
        <span className="shc-heading__lines shc-heading__lines--r" aria-hidden="true">
          <i className="shc-heading__near" />
          <i className="shc-heading__far" />
        </span>
      </div>

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
  @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');

  :root {
    --shc-plum: #6e1a4b;
    --shc-maroon: #720E1E;
    --shc-gold-1: #f4d77f;
    --shc-gold-2: #c8962a;
    --shc-gold-3: #f1cf70;
    --shc-pink: #f0668c;
  }

  .shc-root, .shc-root * { box-sizing: border-box; }
  .shc-root {
    background:
      radial-gradient(ellipse at 50% 0%, #fff6ee 0%, rgba(255,246,238,0) 60%),
      linear-gradient(180deg, #fcefe4 0%, #fbe9dc 100%);
    padding: 36px 0 80px;
    font-family: 'Hanken Grotesk', sans-serif;
    overflow: hidden;
  }
  .shc-stage {
    position: relative;
    max-width: 1220px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .shc-stage.has-carousel { padding: 0 56px; }

  .shc-viewport { overflow: hidden; width: 100%; }

  .shc-row {
    --visible: 6;
    --gap: 40px;
    --offset: 0;
    display: flex;
    justify-content: center;
    gap: var(--gap);
    width: 100%;
    padding: 14px 0 22px;
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
    text-decoration: none;
    display: block;
  }

  /* gold gradient ring + soft golden drop shadow */
  .shc-ring {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    padding: 3px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--shc-gold-1) 0%, var(--shc-gold-2) 45%, var(--shc-gold-3) 100%);
    box-shadow:
      0 8px 16px rgba(200, 150, 42, 0.30),
      0 3px 6px rgba(114, 14, 30, 0.12);
    transition: transform .3s ease, box-shadow .3s ease;
  }
  .shc-card:hover .shc-ring,
  .shc-card:focus-visible .shc-ring {
    transform: translateY(-4px);
    box-shadow:
      0 14px 24px rgba(200, 150, 42, 0.38),
      0 4px 10px rgba(114, 14, 30, 0.18);
  }

  .shc-disc {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background: #efe3da;
    box-shadow: inset 0 0 0 1.5px rgba(255, 244, 214, 0.9);
  }
  .shc-disc img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform .5s ease;
  }
  .shc-card:hover .shc-disc img { transform: scale(1.08); }

  /* pink blurry glow on the bottom edge of the disc */
  .shc-glow {
    position: absolute;
    left: 14%;
    right: 14%;
    bottom: 3px;
    height: 14px;
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(255, 150, 185, 0.75) 0%, rgba(255, 150, 185, 0) 70%);
    filter: blur(3px);
    pointer-events: none;
    z-index: 2;
  }

  /* label */
  .shc-label {
    margin: 20px 0 0;
    text-align: center;
    line-height: 1.2;
  }
  .shc-label-text {
    position: relative;
    display: inline-block;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    letter-spacing: 0.2px;
    color: var(--shc-plum);
    transition: color .2s;
  }
  .shc-card:hover .shc-label-text { color: var(--shc-maroon); }
  .shc-card:focus-visible { outline: none; }

  /* ── Shop by Category heading ── */
  .shc-heading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin: 0 auto 14px;
    padding: 0 16px;
    max-width: 900px;
  }
  .shc-heading__title {
    margin: 0;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 26px;
    line-height: 1.1;
    letter-spacing: 0.005em;
    color: #1c0f14;
    white-space: nowrap;
    text-shadow: 0 0 0.5px rgba(28, 15, 20, 0.6);
  }
  .shc-heading__lines {
    display: flex;
    align-items: center;
    gap: 22px;
    flex: 1 1 0;
    min-width: 0;
  }
  .shc-heading__lines--l { justify-content: flex-end; }
  .shc-heading__lines--r { justify-content: flex-start; }
  .shc-heading__lines i { display: block; height: 1.5px; border-radius: 2px; }
  .shc-heading__near { flex: 0 1 70px; }
  .shc-heading__far  { flex: 0 1 150px; opacity: .55; }
  .shc-heading__lines--l .shc-heading__near { background: linear-gradient(90deg, rgba(217,178,74,0) 0%, #d9b24a 100%); }
  .shc-heading__lines--r .shc-heading__near { background: linear-gradient(90deg, #d9b24a 0%, rgba(217,178,74,0) 100%); }
  .shc-heading__lines--l .shc-heading__far  { background: linear-gradient(90deg, rgba(217,178,74,0) 0%, #d9b24a 100%); }
  .shc-heading__lines--r .shc-heading__far  { background: linear-gradient(90deg, #d9b24a 0%, rgba(217,178,74,0) 100%); }

  /* loading */
  .shc-skeleton {
    background: linear-gradient(90deg, #efe3da 25%, #f7eee8 50%, #efe3da 75%);
    background-size: 200% 100%;
    animation: shcShimmer 1.4s infinite;
  }
  .shc-skeleton-line { height: 12px; width: 65%; margin: 20px auto 0; border-radius: 4px; background: #efe3da; }
  @keyframes shcShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .shc-error { margin: 0 auto; padding: 0 20px; font-size: 14px; color: var(--shc-maroon); }

  /* arrows */
  .shc-arrow {
    position: absolute;
    top: 42%;
    transform: translateY(-50%);
    z-index: 20;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: #d4a935;
    background: #3d0711;
    border: 1.5px solid rgba(212, 169, 53, 0.55);
    box-shadow: 0 4px 14px rgba(61, 7, 17, 0.25);
    transition: background .2s ease, color .2s ease, opacity .2s ease;
  }
  .shc-arrow:hover:not(:disabled) { background: #d4a935; color: #3d0711; }
  .shc-arrow.is-disabled, .shc-arrow:disabled { opacity: 0.32; cursor: default; pointer-events: none; }
  .shc-arrow:focus-visible { outline: 2px solid var(--shc-maroon); outline-offset: 2px; }
  .shc-arrow--left  { left: 8px; }
  .shc-arrow--right { right: 8px; }

  /* pagination dots */
  .shc-dots { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 12px; }
  .shc-dot {
    width: 8px; height: 8px; border-radius: 999px; border: none; padding: 0;
    background: rgba(114, 14, 30, 0.22); cursor: pointer;
    transition: width .25s ease, background .25s ease;
  }
  .shc-dot.is-active { width: 24px; background: var(--shc-maroon); }

  @media (max-width: 1024px) {
    .shc-root { padding: 32px 0 70px; }
    .shc-stage.has-carousel { padding: 0 48px; }
    .shc-row { --visible: 4; --gap: 28px; }
  }
  @media (max-width: 768px) {
    .shc-root { padding: 28px 0 55px; }
    .shc-stage { padding: 0 16px; }
    .shc-stage.has-carousel { padding: 0 42px; }
    .shc-row { --visible: 3; --gap: 18px; }
    .shc-label { margin-top: 16px; }
    .shc-label-text { font-size: 14.5px; }
    .shc-arrow { width: 34px; height: 34px; }
    .shc-arrow--left { left: 4px; }
    .shc-arrow--right { right: 4px; }
    .shc-heading { gap: 12px; margin-bottom: 10px; }
    .shc-heading__title { font-size: 21px; }
    .shc-heading__lines { gap: 12px; }
    .shc-heading__near { flex-basis: 36px; }
    .shc-heading__far  { flex-basis: 70px; }
  }
  @media (max-width: 480px) {
    .shc-root { padding: 24px 0 45px; }
    .shc-stage { padding: 0 12px; }
    .shc-stage.has-carousel { padding: 0 38px; }
    .shc-row { --visible: 2; --gap: 16px; }
    .shc-label-text { font-size: 13.5px; }
    .shc-arrow { width: 30px; height: 30px; }
    .shc-heading { gap: 8px; }
    .shc-heading__title { font-size: 18px; }
    .shc-heading__lines { gap: 8px; }
    .shc-heading__near { flex-basis: 20px; }
    .shc-heading__far  { flex-basis: 36px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .shc-skeleton { animation: none; }
    .shc-row, .shc-disc img, .shc-ring, .shc-dot, .shc-arrow { transition: none; }
  }
`;