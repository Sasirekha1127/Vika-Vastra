import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * ProductImageViewer
 * Custom fullscreen image preview layer with interactive zoom & pan.
 * Does NOT use any Bootstrap modal, popup dialog, or generic modal component.
 */
const ProductImageViewer = ({
  isOpen,
  onClose,
  images = [],
  activeImage,
  onSelectImage,
  title = "Product Image"
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const touchStartRef = useRef({ dist: null, pos: { x: 0, y: 0 }, initialScale: 1 });

  // Reset zoom and pan when image or open state changes
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetZoom();
    }
  }, [isOpen, activeImage, resetZoom]);

  // Prevent background scrolling while preview layer is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Gallery navigation helpers
  const currentIndex = images.indexOf(activeImage);
  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    const prevIdx = currentIndex <= 0 ? images.length - 1 : currentIndex - 1;
    onSelectImage(images[prevIdx]);
    resetZoom();
  }, [currentIndex, hasMultiple, images, onSelectImage, resetZoom]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    const nextIdx = currentIndex === -1 || currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onSelectImage(images[nextIdx]);
    resetZoom();
  }, [currentIndex, hasMultiple, images, onSelectImage, resetZoom]);

  // Keyboard controls: ESC to close, arrows to navigate, +/- to zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setScale((prev) => Math.min(4, Math.round((prev + 0.4) * 10) / 10));
      } else if (e.key === "-") {
        e.preventDefault();
        setScale((prev) => {
          const next = Math.max(1, Math.round((prev - 0.4) * 10) / 10);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext, resetZoom]);

  // Track fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Zoom In / Out Handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(4, Math.round((prev + 0.4) * 10) / 10));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1, Math.round((prev - 0.4) * 10) / 10);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const zoomFactor = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(4, Math.max(1, Math.round((prev + zoomFactor) * 100) / 100));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Drag & Pan Handlers (Mouse)
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const maxBound = 600 * (scale - 1);
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Bound movement
    const clampedX = Math.max(-maxBound, Math.min(maxBound, newX));
    const clampedY = Math.max(-maxBound, Math.min(maxBound, newY));
    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click to toggle zoom (1x <-> 2.2x)
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.2);
    }
  };

  // Touch handlers for mobile (pinch-to-zoom & drag)
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        dist,
        pos: { ...position },
        initialScale: scale
      };
    } else if (e.touches.length === 1 && scale > 1) {
      touchStartRef.current = {
        dist: null,
        pos: {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y
        },
        initialScale: scale
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartRef.current.dist) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleMultiplier = currentDist / touchStartRef.current.dist;
      const nextScale = Math.min(4, Math.max(1, touchStartRef.current.initialScale * scaleMultiplier));
      setScale(Math.round(nextScale * 100) / 100);
      if (nextScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      e.preventDefault();
      const newX = e.touches[0].clientX - touchStartRef.current.pos.x;
      const newY = e.touches[0].clientY - touchStartRef.current.pos.y;
      const maxBound = 600 * (scale - 1);
      setPosition({
        x: Math.max(-maxBound, Math.min(maxBound, newX)),
        y: Math.max(-maxBound, Math.min(maxBound, newY))
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      touchStartRef.current.dist = null;
      if (scale <= 1) {
        resetZoom();
      }
    }
  };

  if (!isOpen) return null;

  const currentDisplayImage = activeImage || (images && images[0]);

  const modalContent = (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Product Image Viewer"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        background: "rgba(10, 12, 22, 0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
        touchAction: scale > 1 ? "none" : "auto",
        animation: "customViewerFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <style>{`
        @keyframes customViewerFadeIn {
          from { opacity: 0; transform: scale(0.985); }
          to { opacity: 1; transform: scale(1); }
        }
        .viewer-btn {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s ease, transform 0.15s ease, border-color 0.18s ease;
          padding: 8px 12px;
          font-size: 14px;
          line-height: 1;
        }
        .viewer-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }
        .viewer-btn:active {
          transform: scale(0.96);
        }
        .viewer-btn-close:hover {
          background: #e74c3c !important;
          border-color: #e74c3c !important;
        }
        .viewer-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }
        .viewer-nav-btn:hover {
          background: rgba(255, 255, 255, 0.32);
          transform: translateY(-50%) scale(1.1);
        }
        .viewer-thumb {
          width: 52px;
          height: 52px;
          border-radius: 6px;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.6;
          transition: all 0.2s ease;
        }
        .viewer-thumb:hover {
          opacity: 0.9;
          transform: scale(1.06);
        }
        .viewer-thumb.active {
          border-color: #C9933A;
          opacity: 1;
          box-shadow: 0 0 10px rgba(201, 147, 58, 0.5);
        }
      `}</style>

      {/* ── TOP HEADER / TOOLBAR ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
          zIndex: 10,
          flexWrap: "wrap",
          gap: 12
        }}
      >
        {/* Title & Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <span style={{ color: "#ffffff", fontSize: 15, fontWeight: 600 }}>{title}</span>
          </div>
          {hasMultiple && (
            <span
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                color: "#e2e2e8",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 9px",
                borderRadius: 12
              }}
            >
              {currentIndex + 1} / {images.length}
            </span>
          )}
          <span
            style={{
              background: scale > 1 ? "#C9933A" : "rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 12,
              transition: "all 0.2s ease"
            }}
          >
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Zoom Out Button */}
          <button
            type="button"
            className="viewer-btn"
            onClick={handleZoomOut}
            title="Zoom Out (−)"
            aria-label="Zoom Out"
            disabled={scale <= 1}
            style={{ opacity: scale <= 1 ? 0.45 : 1, cursor: scale <= 1 ? "not-allowed" : "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            className="viewer-btn"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
            disabled={scale >= 4}
            style={{ opacity: scale >= 4 ? 0.45 : 1, cursor: scale >= 4 ? "not-allowed" : "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>

          {/* Reset Zoom Button */}
          <button
            type="button"
            className="viewer-btn"
            onClick={resetZoom}
            title="Reset Zoom (1:1)"
            aria-label="Reset Zoom"
            style={{ fontWeight: 600, fontSize: 13, gap: 5 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <span>Reset</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="viewer-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Toggle"}
            aria-label="Fullscreen Toggle"
          >
            {isFullscreen ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            )}
          </button>

          {/* Close Button (×) */}
          <button
            type="button"
            className="viewer-btn viewer-btn-close"
            onClick={onClose}
            title="Close Preview (ESC)"
            aria-label="Close Preview"
            style={{ width: 38, height: 38, padding: 0, fontSize: 20, fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── CENTER IMAGE VIEWPORT ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          width: "100%",
          height: "100%"
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Image Navigation Button */}
        {hasMultiple && (
          <button
            type="button"
            className="viewer-nav-btn"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            style={{ left: 24 }}
            title="Previous image (Left Arrow)"
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* Enlarged Product Image */}
        {currentDisplayImage ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in"
            }}
            onDoubleClick={handleDoubleClick}
          >
            <img
              ref={imgRef}
              src={currentDisplayImage}
              alt={title}
              draggable={false}
              style={{
                maxWidth: "calc(100vw - 120px)",
                maxHeight: "calc(100vh - 180px)",
                objectFit: "contain",
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)",
                transformOrigin: "center center",
                pointerEvents: "auto",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
                borderRadius: 4
              }}
            />
          </div>
        ) : (
          <div style={{ color: "#aaa", fontSize: 18 }}>No image available</div>
        )}

        {/* Next Image Navigation Button */}
        {hasMultiple && (
          <button
            type="button"
            className="viewer-nav-btn"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            style={{ right: 24 }}
            title="Next image (Right Arrow)"
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>

      {/* ── BOTTOM CONTROLS & THUMBNAILS ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px 20px",
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
          zIndex: 10
        }}
      >
        {/* Interaction Hint */}
        <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 12, letterSpacing: 0.3 }}>
          {scale > 1
            ? "Click & drag or swipe to pan • Scroll to zoom • Double-click to reset"
            : "Scroll or pinch to zoom in • Double-click for 2x • ESC to close"}
        </div>

        {/* Thumbnail Navigation Strip */}
        {hasMultiple && (
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              maxWidth: "90vw",
              padding: "4px 8px"
            }}
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className={`viewer-thumb ${img === activeImage ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectImage(img);
                  resetZoom();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductImageViewer;
