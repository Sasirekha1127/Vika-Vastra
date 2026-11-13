import { useState, useEffect } from 'react';

export default function ImageModal({ image, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.3, 0.7));
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoomLevel(1);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'kmFadeIn 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes kmFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Main Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '92vw',
          maxHeight: '92vh',
          background: '#131f33',
          borderRadius: 16,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            background: '#1a273e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            gap: 16,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              🖼️ {image.title || 'Product Image Preview'}
            </span>
            {image.subtitle && (
              <span style={{ color: '#00b894', fontSize: 12, marginTop: 2, fontWeight: 600 }}>
                {image.subtitle}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Zoom Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#0d1524',
                borderRadius: 8,
                padding: '2px 4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: 15,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 4,
                }}
              >
                ➖
              </button>
              <span
                onClick={handleResetZoom}
                title="Click to Reset Zoom (100%)"
                style={{
                  color: '#00b894',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '0 6px',
                  cursor: 'pointer',
                  minWidth: 46,
                  textAlign: 'center',
                  userSelect: 'none',
                }}
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e2e8f0',
                  fontSize: 15,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 4,
                }}
              >
                ➕
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Display Image Box */}
        <div
          style={{
            position: 'relative',
            overflow: 'auto',
            maxHeight: 'calc(80vh - 60px)',
            maxWidth: '100%',
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0b1320',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={image.src}
            alt={image.title || 'Product'}
            style={{
              maxHeight: '68vh',
              maxWidth: '82vw',
              objectFit: 'contain',
              borderRadius: 8,
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'center center',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
              cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(prev => (prev === 1 ? 1.8 : 1));
            }}
          />
        </div>

        {/* Footer info bar */}
        {(image.details || image.weight) && (
          <div
            style={{
              width: '100%',
              padding: '10px 20px',
              background: '#1a273e',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#cbd5e1',
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          >
            <span>{image.details}</span>
            <span style={{ fontSize: 11, color: '#8fa0bd' }}>
              💡 Click image to toggle 180% zoom or use controls
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
