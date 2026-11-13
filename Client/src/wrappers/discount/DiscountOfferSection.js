import React, { useState, useEffect, Fragment } from "react";
import "./discount-offer.css";




const FILTERS = ["All", "Silk", "Cotton", "Handloom", "Designer"];

/* ─────────────────────────────────────────────
   COUNTDOWN TIMER
───────────────────────────────────────────── */
const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 8, m: 41, s: 8 });

  useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = n => String(n).padStart(2, "0");

  return (
    <div className="do-timer">
      <span className="do-timer__label">⏱ Sale ends in</span>
      {[time.h, time.m, time.s].map((val, i) => (
        <Fragment key={i}>
          <span className="do-timer__block">{pad(val)}</span>
          {i < 2 && <span className="do-timer__sep">:</span>}
        </Fragment>
      ))}
      <span className="do-timer__label">— Don't miss out!</span>
    </div>
  );
};




/* ─────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────── */
const DiscountOfferSection = ({ spaceTopClass = "", spaceBottomClass = "" }) => {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className={`do-section ${spaceTopClass} ${spaceBottomClass}`}>
      <div className="container">

     {/* ── Hero Banner ── */}
<div className="do-hero">

  {/* LEFT CONTENT */}
  <div className="do-hero__content">
    <div className="do-hero__circles" aria-hidden="true">
      {[0,1,2,3].map(i => (
        <span
          key={i}
          className={`do-hero__circle do-hero__circle--${i}`}
        />
      ))}
    </div>

    <span className="do-hero__eyebrow">
      ✦ FESTIVE SALE 2025 ✦
    </span>

    <h2 className="do-hero__title">
      Grand Saree Utsav
    </h2>

    <p className="do-hero__subtitle">
      Up to 60% off on Silk, Cotton &amp; Designer Sarees
    </p>

    <button className="do-hero__cta">
      Shop Now ↗
    </button>

    <div className="do-hero__timer-wrap">
      <CountdownTimer />
    </div>
  </div>

 {/* RIGHT IMAGE */}
<div className="do-hero__image">
  <img
    src="/assets/img/discountbannerimg/saree.jfif"
    alt="Saree Model"
  />
</div>

</div>

      </div>
    </div>
  );
};

export default DiscountOfferSection;