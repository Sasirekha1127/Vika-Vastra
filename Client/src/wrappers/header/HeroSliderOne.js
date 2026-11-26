import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllBanners, getImageUrl } from '../../api'

const GOLD       = 'linear-gradient(45deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)'
const GOLD_HOVER = 'linear-gradient(45deg, #AA771C 0%, #FBF5B7 25%, #BF953F 50%, #FCF6BA 75%, #B38728 100%)'

const HeroSliderOne = () => {
  const [slides, setSlides]   = useState([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data } = await getAllBanners()
        const active = data.filter(b => b.status === 'Active')
        setSlides(active)
      } catch (err) {
        console.error('HeroSliderOne: failed to load banners', err)
      }
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (!slides.length) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(
      () => setCurrent(prev => (prev + 1) % slides.length),
      5000
    )
    return () => clearTimeout(timerRef.current)
  }, [current, slides])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrent(prev => (prev + 1) % slides.length)
      } else {
        setCurrent(prev => (prev - 1 + slides.length) % slides.length)
      }
    }
  }

  const handleBannerClick = (slide) => {
    const link = slide.link || '/shop'
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.location.href = link
    } else {
      navigate(process.env.PUBLIC_URL + (link.startsWith('/') ? link : `/${link}`))
    }
  }

  if (!slides.length) return null

  return (
    <>
      <style>
        {`
          .hero-slider-container {
            width: 100% !important;
            max-width: 100% !important;
            aspect-ratio: 2048 / 768 !important;
            height: auto !important;
            min-height: auto !important;
            position: relative !important;
            overflow: hidden !important;
            display: block !important;
            background-color: #1a0510;
            user-select: none;
          }

          @supports not (aspect-ratio: 2048 / 768) {
            .hero-slider-container {
              height: 37.5vw !important;
            }
          }

          .hero-slider-container img,
          .hero-slider-image {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
            display: block !important;
          }

          .hero-slider-arrow {
            opacity: 0;
            transition: all 0.3s ease !important;
          }

          .hero-slider-container:hover .hero-slider-arrow {
            opacity: 1;
          }

          @media (max-width: 767px) {
            .hero-slider-arrow {
              display: none !important;
            }
            .hero-slider-dots {
              bottom: 8px !important;
              gap: 6px !important;
            }
            .hero-slider-dots button {
              height: 5px !important;
            }
          }

          .hero-slider-container::before {
            display: none !important;
          }
        `}
      </style>

      <div
        className="hero-slider-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          aspectRatio: '2048 / 768',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#1a0510',
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id || i}
            onClick={() => handleBannerClick(slide)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: current === i ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              pointerEvents: current === i ? 'auto' : 'none',
              cursor: 'pointer',
            }}
          >
            <img
              src={getImageUrl(slide.image)}
              alt={slide.title || `Vika Vastra Banner ${i + 1}`}
              className="hero-slider-image"
              loading={i === 0 ? 'eager' : 'lazy'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                display: 'block',
              }}
            />

            {slide.title && (
              <div
                className="hero-slider-content"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8%',
                  background: 'linear-gradient(to left, rgba(0,0,0,0.45) 0%, transparent 60%)',
                }}
              >
                <div
                  className="hero-slider-text-wrapper"
                  style={{
                    maxWidth: 580,
                    textAlign: 'right',
                    opacity: current === i ? 1 : 0,
                    transform: current === i ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
                  }}
                >
                  {slide.subtitle && (
                    <p
                      className="hero-slider-subtitle"
                      style={{
                        fontSize: 'clamp(10px, 1.2vw, 14px)',
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        color: '#E5C365',
                        marginBottom: 12,
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontWeight: 600,
                        textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                      }}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  <h1
                    className="hero-slider-title"
                    style={{
                      fontSize: 'clamp(20px, 3.5vw, 48px)',
                      fontWeight: 700,
                      lineHeight: 1.15,
                      marginBottom: 14,
                      color: '#ffffff',
                      fontFamily: "'Playfair Display', Georgia, serif",
                      textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
                    }}
                  >
                    {slide.title}
                  </h1>

                  {slide.content && (
                    <p
                      className="hero-slider-content-text"
                      style={{
                        fontSize: 'clamp(11px, 1.2vw, 15px)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line',
                        color: '#f0ece6',
                        maxWidth: 420,
                        marginLeft: 'auto',
                        marginBottom: 20,
                        textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
                      }}
                    >
                      {slide.content}
                    </p>
                  )}

                  <div>
                    <button
                      className="hero-slider-button"
                      type="button"
                      style={{
                        padding: '10px 28px',
                        fontSize: 'clamp(11px, 1vw, 13px)',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        background: GOLD,
                        color: '#1a1a1a',
                        border: 'none',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'background 0.3s ease, transform 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = GOLD_HOVER
                        e.currentTarget.style.transform = 'scale(1.03)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = GOLD
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              className="hero-slider-arrow hero-slider-prev"
              onClick={(e) => {
                e.stopPropagation()
                setCurrent(prev => (prev - 1 + slides.length) % slides.length)
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: 18,
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(36, 6, 29, 0.65)',
                border: '1.5px solid rgba(229, 195, 101, 0.7)',
                color: '#E5C365',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
                padding: 0,
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(78, 8, 21, 0.9)'
                e.currentTarget.style.borderColor = '#E5C365'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(36, 6, 29, 0.65)'
                e.currentTarget.style.borderColor = 'rgba(229, 195, 101, 0.7)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              &#10094;
            </button>

            <button
              type="button"
              aria-label="Next banner"
              className="hero-slider-arrow hero-slider-next"
              onClick={(e) => {
                e.stopPropagation()
                setCurrent(prev => (prev + 1) % slides.length)
              }}
              style={{
                position: 'absolute',
                top: '50%',
                right: 18,
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'rgba(36, 6, 29, 0.65)',
                border: '1.5px solid rgba(229, 195, 101, 0.7)',
                color: '#E5C365',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
                padding: 0,
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(78, 8, 21, 0.9)'
                e.currentTarget.style.borderColor = '#E5C365'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(36, 6, 29, 0.65)'
                e.currentTarget.style.borderColor = 'rgba(229, 195, 101, 0.7)'
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
              }}
            >
              &#10095;
            </button>

            <div
              className="hero-slider-dots"
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                zIndex: 10,
              }}
            >
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  aria-label={`Go to banner ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrent(idx)
                  }}
                  style={{
                    width: current === idx ? 26 : 8,
                    height: 8,
                    borderRadius: 999,
                    border: '1px solid rgba(229, 195, 101, 0.8)',
                    background: current === idx ? '#C59B27' : 'rgba(255, 255, 255, 0.45)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: current === idx ? '0 0 10px rgba(197, 155, 39, 0.7)' : 'none',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default HeroSliderOne
