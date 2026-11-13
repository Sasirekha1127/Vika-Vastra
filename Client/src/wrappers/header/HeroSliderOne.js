import React, { useState, useEffect, useRef } from 'react'
import { getAllBanners, getImageUrl } from '../../api'

const GOLD       = 'linear-gradient(45deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)'
const GOLD_HOVER = 'linear-gradient(45deg, #AA771C 0%, #FBF5B7 25%, #BF953F 50%, #FCF6BA 75%, #B38728 100%)'

const HeroSliderOne = () => {
  const [slides, setSlides]   = useState([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

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
      4500
    )
    return () => clearTimeout(timerRef.current)
  }, [current, slides])

  if (!slides.length) return null

  return (
    <>
      <style>
        {`
          /* Force full width for all images */
          .hero-slider-container {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
          }
          
          /* Ensure images take full width */
          .hero-slider-container img {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
          }
          
          /* Fix for all slide divs */
          .hero-slider-container > div {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* iPad Mini (768px - 1024px) */
          @media (min-width: 768px) and (max-width: 1024px) {
            .hero-slider-container {
              height: 70vh !important;
              min-height: 600px !important;
              width: 100% !important;
            }
            
            .hero-slider-image {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              object-position: center center !important;
            }
            
            .hero-slider-content {
              padding-right: 8% !important;
              padding-left: 8% !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 450px !important;
            }
            
            .hero-slider-subtitle {
              font-size: 11px !important;
              letter-spacing: 3px !important;
              margin-bottom: 25px !important;
            }
            
            .hero-slider-title {
              white-space: normal !important;
              word-wrap: break-word !important;
              margin-bottom: 20px !important;
              font-size: clamp(32px, 5vw, 48px) !important;
              line-height: 1.2 !important;
            }
            
            .hero-slider-content-text {
              margin-bottom: 35px !important;
              font-size: 13px !important;
              line-height: 1.6 !important;
            }
            
            .hero-slider-button {
              padding: 12px 28px !important;
              font-size: 13px !important;
              letter-spacing: 1.5px !important;
            }
          }
          
          /* iPad Air (820px - 1180px) */
          @media (min-width: 820px) and (max-width: 1180px) {
            .hero-slider-container {
              height: 75vh !important;
              min-height: 650px !important;
              width: 100% !important;
            }
            
            .hero-slider-image {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              object-position: center center !important;
            }
            
            .hero-slider-content {
              padding-right: 10% !important;
              padding-left: 10% !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 480px !important;
            }
            
            .hero-slider-subtitle {
              font-size: 12px !important;
              letter-spacing: 3.5px !important;
              margin-bottom: 28px !important;
            }
            
            .hero-slider-title {
              white-space: normal !important;
              word-wrap: break-word !important;
              margin-bottom: 22px !important;
              font-size: clamp(36px, 5.5vw, 52px) !important;
              line-height: 1.2 !important;
            }
            
            .hero-slider-content-text {
              margin-bottom: 38px !important;
              font-size: 14px !important;
              line-height: 1.6 !important;
            }
            
            .hero-slider-button {
              padding: 12px 30px !important;
              font-size: 13px !important;
              letter-spacing: 1.5px !important;
            }
          }
          
          /* iPad Pro 11" (834px - 1194px) */
          @media (min-width: 834px) and (max-width: 1194px) {
            .hero-slider-container {
              height: 75vh !important;
              min-height: 700px !important;
              width: 100% !important;
            }
            
            .hero-slider-image {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              object-position: center center !important;
            }
            
            .hero-slider-content {
              padding-right: 10% !important;
              padding-left: 10% !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 500px !important;
            }
            
            .hero-slider-subtitle {
              font-size: 12px !important;
              letter-spacing: 4px !important;
              margin-bottom: 30px !important;
            }
            
            .hero-slider-title {
              white-space: normal !important;
              word-wrap: break-word !important;
              margin-bottom: 24px !important;
              font-size: clamp(38px, 5.5vw, 55px) !important;
              line-height: 1.2 !important;
            }
            
            .hero-slider-content-text {
              margin-bottom: 40px !important;
              font-size: 14px !important;
              line-height: 1.6 !important;
            }
            
            .hero-slider-button {
              padding: 14px 32px !important;
              font-size: 14px !important;
              letter-spacing: 1.5px !important;
            }
          }
          
          /* iPad Pro 12.9" (1024px - 1366px) */
          @media (min-width: 1024px) and (max-width: 1366px) {
            .hero-slider-container {
              height: 80vh !important;
              min-height: 750px !important;
              width: 100% !important;
            }
            
            .hero-slider-image {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              object-position: center center !important;
            }
            
            .hero-slider-content {
              padding-right: 12% !important;
              padding-left: 12% !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 550px !important;
            }
            
            .hero-slider-subtitle {
              font-size: 13px !important;
              letter-spacing: 4px !important;
              margin-bottom: 32px !important;
            }
            
            .hero-slider-title {
              white-space: normal !important;
              word-wrap: break-word !important;
              margin-bottom: 25px !important;
              font-size: clamp(42px, 6vw, 62px) !important;
              line-height: 1.2 !important;
            }
            
            .hero-slider-content-text {
              margin-bottom: 42px !important;
              font-size: 15px !important;
              line-height: 1.6 !important;
            }
            
            .hero-slider-button {
              padding: 14px 34px !important;
              font-size: 14px !important;
              letter-spacing: 2px !important;
            }
          }
          
          /* All iPads Landscape Orientation */
          @media (min-width: 768px) and (max-width: 1366px) and (orientation: landscape) {
            .hero-slider-container {
              height: 100vh !important;
              min-height: 500px !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 60% !important;
            }
            
            .hero-slider-title {
              font-size: clamp(30px, 4vw, 48px) !important;
              margin-bottom: 18px !important;
            }
            
            .hero-slider-subtitle {
              margin-bottom: 18px !important;
            }
            
            .hero-slider-content-text {
              margin-bottom: 28px !important;
              font-size: 13px !important;
            }
            
            .hero-slider-button {
              padding: 10px 26px !important;
              font-size: 12px !important;
            }
          }
          
          /* All iPads Portrait Orientation */
          @media (min-width: 768px) and (max-width: 1366px) and (orientation: portrait) {
            .hero-slider-container {
              height: 60vh !important;
              min-height: 650px !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 80% !important;
            }
          }
          
          /* Mobile styles */
          @media (max-width: 767px) {
            .hero-slider-container {
              height: 60vh !important;
              min-height: 500px !important;
              width: 100% !important;
            }
            
            .hero-slider-image {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              object-position: center center !important;
            }
            
            .hero-slider-content {
              padding-right: 5% !important;
              padding-left: 5% !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 90% !important;
            }
            
            .hero-slider-subtitle {
              font-size: 10px !important;
              letter-spacing: 3px !important;
              margin-bottom: 20px !important;
            }
            
            .hero-slider-title {
              white-space: normal !important;
              word-wrap: break-word !important;
              margin-bottom: 20px !important;
              font-size: clamp(28px, 6vw, 42px) !important;
            }
            
            .hero-slider-content-text {
              margin-bottom: 30px !important;
              font-size: 12px !important;
            }
            
            .hero-slider-button {
              padding: 10px 24px !important;
              font-size: 12px !important;
              letter-spacing: 1.5px !important;
            }
          }
          
          /* Small mobile styles */
          @media (max-width: 480px) {
            .hero-slider-container {
              height: 60vh !important;
              min-height: 450px !important;
              width: 100% !important;
            }
            
            .hero-slider-image {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              object-position: center center !important;
            }
            
            .hero-slider-content {
              padding-right: 15px !important;
              padding-left: 15px !important;
            }
            
            .hero-slider-text-wrapper {
              max-width: 100% !important;
            }
            
            .hero-slider-subtitle {
              font-size: 9px !important;
              letter-spacing: 2px !important;
              margin-bottom: 15px !important;
            }
            
            .hero-slider-title {
              font-size: clamp(24px, 7vw, 32px) !important;
              margin-bottom: 15px !important;
            }
            
            .hero-slider-content-text {
              font-size: 11px !important;
              margin-bottom: 25px !important;
              line-height: 1.5 !important;
            }
            
            .hero-slider-button {
              padding: 8px 20px !important;
              font-size: 11px !important;
              letter-spacing: 1px !important;
            }
          }
          
          /* Desktop styles */
          @media (min-width: 1367px) {
            .hero-slider-container {
              height: 100vh !important;
            }
            
            .hero-slider-title {
              white-space: nowrap !important;
            }
          }
          
          /* Remove black overlay for all devices */
          .hero-slider-container::before {
            display: none !important;
          }
          
          /* Fix any parent container restrictions */
          .hero-slider-container,
          .hero-slider-container * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        `}
      </style>
      
      <div 
        className="hero-slider-container"
        style={{ 
          width: '100%', 
          height: '100vh', 
          overflow: 'hidden', 
          position: 'relative' 
        }}
      >

        {slides.map((slide, i) => (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: current === i ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: current === i ? 'auto' : 'none',
            }}
          >
            <img
              src={getImageUrl(slide.image)}
              alt={slide.title}
              className="hero-slider-image"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
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
                  paddingRight: '10%',
                }}
              >
                <div 
                  className="hero-slider-text-wrapper"
                  style={{
                    maxWidth: 620,
                    textAlign: 'right',
                    opacity: current === i ? 1 : 0,
                    transform: current === i ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'opacity 1s ease 0.4s, transform 1s ease 0.4s',
                  }}>

                  {slide.subtitle && (
                    <p 
                      className="hero-slider-subtitle"
                      style={{
                        fontSize: 13,
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                        color: '#E5C365',
                        marginBottom: 24,
                        fontWeight: 700,
                        textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      {slide.subtitle}
                    </p>
                  )}

                  <h1 
                    className="hero-slider-title"
                    style={{
                      fontSize: 'clamp(28px, 5vw, 62px)',
                      fontWeight: 700,
                      lineHeight: 1.15,
                      marginBottom: 24,
                      color: '#ffffff',
                      fontFamily: 'Georgia, serif',
                      textShadow: '2px 2px 8px rgba(0,0,0,0.45)',
                    }}
                  >
                    {slide.title}
                  </h1>

                  {slide.content && (
                    <p 
                      className="hero-slider-content-text"
                      style={{
                        fontSize: 'clamp(13px, 1.5vw, 16px)',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                        color: '#f0ece6',
                        maxWidth: 460,
                        marginLeft: 'auto',
                        marginBottom: 40,
                        textShadow: '1px 1px 4px rgba(0,0,0,0.45)',
                      }}
                    >
                      {slide.content}
                    </p>
                  )}

                  {slide.link && (
                    <div>
                      <button
                        className="hero-slider-button"
                        onClick={() => window.location.href = slide.link}
                        style={{
                          padding: '12px 32px',
                          fontSize: 14,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          fontWeight: 700,
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
                  )}

                </div>
              </div>
            )}
          </div>
        ))}

        {slides.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              zIndex: 10,
            }}
          >
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                aria-label={`Go to banner ${idx + 1}`}
                onClick={() => setCurrent(idx)}
                style={{
                  width: current === idx ? 28 : 10,
                  height: 10,
                  borderRadius: 999,
                  border: '1px solid rgba(229, 195, 101, 0.7)',
                  background: current === idx ? '#C59B27' : 'rgba(255, 255, 255, 0.35)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: current === idx ? '0 0 10px rgba(197, 155, 39, 0.6)' : 'none',
                }}
              />
            ))}
          </div>
        )}

      </div>
    </>
  )
}

export default HeroSliderOne