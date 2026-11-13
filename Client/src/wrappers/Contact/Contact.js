import { useState } from "react";

import LayoutOne from "../../layouts/LayoutOne";
import { submitContact } from '../../api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&display=swap');

  :root {
    --navy: #720E1E;
    --gold: #C59B27;
    --gold-light: #e0b46a;
    --ivory: #FAF6F0;
    --text: #4A4A4A;
    --text-light: #7a7a7a;
    --border: rgba(114,14,30,0.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .contact-page {
    min-height: 100vh;
    font-family: 'Jost', sans-serif;
    color: var(--text);
  }

  .contact-body {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 0;
    max-width: 1100px;
    margin: 3.5rem auto;
    padding: 0 2rem;
    align-items: start;
  }

  .contact-info {
    padding-right: 3rem;
    border-right: 1px solid var(--border);
  }
  .info-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--navy);
    margin-bottom: 1.25rem;
  }
  .info-desc {
    font-size: 0.88rem;
    line-height: 1.75;
    color: var(--text-light);
    margin-bottom: 2.5rem;
    font-weight: 300;
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .info-icon {
    width: 40px;
    height: 40px;
    background: rgba(201,147,58,0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .info-icon svg { width: 18px; height: 18px; stroke: var(--gold); fill: none; stroke-width: 1.8; }
  .info-label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 3px;
  }
  .info-value {
    font-size: 0.88rem;
    color: var(--text);
    line-height: 1.7;
    font-weight: 300;
  }

  .contact-link {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--navy);
    text-decoration: none;
    line-height: 1.7;
    transition: color 0.2s;
  }
  .contact-link:hover {
    color: var(--gold);
    text-decoration: underline;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 2rem 0;
  }

  .map-wrap {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin-top: 0.25rem;
  }
  .map-wrap iframe {
    width: 100%;
    height: 200px;
    display: block;
    border: none;
    filter: grayscale(20%) contrast(1.05);
  }
  .map-label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 0.6rem;
  }

  .brand-block {
    background: var(--navy);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  .brand-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 0.06em;
    margin-bottom: 0.3rem;
  }
  .brand-tagline {
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-bottom: 1rem;
    font-weight: 400;
  }
  .brand-desc {
    font-size: 0.82rem;
    line-height: 1.75;
    color: rgba(255,255,255,0.65);
    font-weight: 300;
  }
  .brand-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 1rem;
  }
  .brand-badge {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gold);
    border: 1px solid rgba(201,147,58,0.35);
    border-radius: 20px;
    padding: 3px 10px;
    font-weight: 500;
  }

  .form-wrap {
    padding-left: 3rem;
  }
  .form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--navy);
    margin-bottom: 0.4rem;
  }
  .form-subtitle {
    font-size: 0.85rem;
    color: var(--text-light);
    font-weight: 300;
    margin-bottom: 2rem;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-group.full { grid-column: 1 / -1; }
  label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--navy);
    font-weight: 500;
  }
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  textarea {
    width: 100%;
    padding: 11px 14px;
    font-size: 0.88rem;
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    color: var(--text);
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }
  input::placeholder, textarea::placeholder { color: #c0bdb8; }
  input:focus, textarea:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(201,147,58,0.12);
  }
  textarea { resize: vertical; min-height: 130px; line-height: 1.65; }

  .form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .form-note {
    font-size: 0.78rem;
    color: var(--text-light);
    font-weight: 300;
  }
  .form-note span { color: var(--gold); }

  .btn-send {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 28px;
    background: var(--gold);
    color: #fff;
    font-family: 'Jost', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-send:hover { background: #b5822e; }
  .btn-send:active { transform: scale(0.98); }
  .btn-send svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2; }
  .btn-send.loading { opacity: 0.7; pointer-events: none; }

  .success-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: rgba(201,147,58,0.08);
    border: 1px solid rgba(201,147,58,0.3);
    border-radius: 8px;
    margin-top: 1.25rem;
    font-size: 0.87rem;
    color: var(--navy);
    font-weight: 400;
    animation: fadeSlide 0.3s ease;
  }
  .success-banner svg { width: 20px; height: 20px; stroke: var(--gold); fill: none; stroke-width: 2; flex-shrink: 0; }
  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: rgba(220,38,38,0.06);
    border: 1px solid rgba(220,38,38,0.18);
    border-radius: 8px;
    margin-top: 1.25rem;
    font-size: 0.87rem;
    color: #c0392b;
    font-weight: 400;
    animation: fadeSlide 0.3s ease;
  }
  .field-error { font-size: 0.75rem; color: #c0392b; margin-top: 2px; }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .banner-hide {
    animation: fadeOut 0.5s ease forwards;
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-6px); }
  }

  @media (max-width: 768px) {
    .contact-body { grid-template-columns: 1fr; }
    .contact-info { border-right: none; padding-right: 0; border-bottom: 1px solid var(--border); padding-bottom: 2rem; margin-bottom: 2rem; }
    .form-wrap { padding-left: 0; }
    .form-grid { grid-template-columns: 1fr; }
    .contact-body { padding: 0 1.5rem; }
  }
`;

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 11.5 19.79 19.79 0 01.64 2.82 2 2 0 012.62 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.64a16 16 0 006.29 6.29l1-1a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
const MapIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
);

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage({ shop }) {
  const [form, setForm]                 = useState(EMPTY);
  const [errors, setErrors]             = useState({});
  const [sent, setSent]                 = useState(false);
  const [hiding, setHiding]             = useState(false);
  const [loading, setLoading]           = useState(false);
  const [submitError, setSubmitError]   = useState('');
  const [errorHiding, setErrorHiding]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())   e.phone   = "Phone number is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (submitError) setSubmitError('');
  };

  const showSuccess = () => {
    setSent(true);
    setHiding(false);
    setTimeout(() => {
      setHiding(true);
      setTimeout(() => setSent(false), 500);
    }, 5000);
  };

  const showError = (msg) => {
    setSubmitError(msg);
    setErrorHiding(false);
    setTimeout(() => {
      setErrorHiding(true);
      setTimeout(() => setSubmitError(''), 500);
    }, 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setSubmitError('');

    submitContact({
      name:    form.name,
      email:   form.email,
      phone:   form.phone,
      subject: form.subject,
      message: form.message,
    })
      .then((res) => {
        setLoading(false);
        if (res?.data?.success) {
          setForm(EMPTY);
          showSuccess();
        } else {
          showError(res?.data?.message || 'Submission failed. Please try again.');
        }
      })
      .catch((err) => {
        setLoading(false);
        showError(err.response?.data?.message || err.message || 'Network error. Please try again.');
      });
  };

  return (
    <LayoutOne shop={shop} headerTop="visible">
      <style>{styles}</style>
      <div className="contact-page">
        <div className="contact-body">

          {/* ── Sidebar ── */}
          <aside className="contact-info">

            <div className="info-item">
              <div className="info-icon"><PhoneIcon /></div>
              <div>
                <div className="info-label">Phone / WhatsApp</div>
                <div className="info-value">
                  <a href="tel:+919482944552" className="contact-link">+91 9482944552</a>
                  <a href="https://wa.me/919482944552" className="contact-link" target="_blank" rel="noopener noreferrer">+91 9482944552</a>
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><MailIcon /></div>
              <div>
                <div className="info-label">Email</div>
                <div className="info-value">
                  <a href="mailto:vikram.25feb@gmail.com" className="contact-link">
                    vikram.25feb@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon"><MapIcon /></div>
              <div>
                <div className="info-label">Store Address</div>
                <div className="info-value" style={{ fontWeight: 700, color: 'var(--navy)' }}>
                  Vikraman.k <br />
                  Murari Enclave <br />
                  Maragondanahalli <br />
                  Electronic City phase 1 <br />
                  Bangalore - 560100 <br />
                  Karnataka
                </div>
              </div>
            </div>

            <div className="divider" />

            <div className="map-label">Find Us</div>
            <div className="map-wrap">
              {/* ✅ Updated to Elampillai store location */}
              <iframe
                title="Vika Vasthra Store Location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15559.851088494793!2d77.674!3d12.845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6c698c6a0c5b%3A0x6b4db65a5e848ad8!2sElectronic%20City%20Phase%201%2C%20Bengaluru%2C%20Karnataka%20560100!5e0!3m2!1sen!2sin!4v1"
              />
            </div>
          </aside>

          {/* ── Form ── */}
          <main className="form-wrap">
            <form className="form-grid" onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name" name="name" type="text"
                  placeholder="Priya Sharma"
                  value={form.name} onChange={handleChange}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="priya@example.com"
                  value={form.email} onChange={handleChange}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone" name="phone" type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone} onChange={handleChange}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  id="subject" name="subject" type="text"
                  placeholder="e.g. Kanjivaram silk saree enquiry"
                  value={form.subject} onChange={handleChange}
                />
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className="form-group full">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message" name="message"
                  placeholder="Tell us about the saree you're looking for — occasion, colour, fabric, budget…"
                  value={form.message} onChange={handleChange}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>

              <div className="form-footer full">
                <p className="form-note">
                  We reply within <span>24 hours</span>. You can also reach us on <span>WhatsApp</span>.
                </p>
                <button type="submit" className={`btn-send${loading ? " loading" : ""}`}>
                  {loading ? "Sending…" : (<>Send Message <SendIcon /></>)}
                </button>
              </div>

              {sent && (
                <div className={`success-banner full${hiding ? " banner-hide" : ""}`}>
                  <CheckIcon />
                  Thank you for reaching out to Vika Vasthra! We'll get back to you very soon.
                </div>
              )}

              {submitError && (
                <div className={`error-banner full${errorHiding ? " banner-hide" : ""}`}>
                  {submitError}
                </div>
              )}

            </form>
          </main>
        </div>
      </div>
    </LayoutOne>
  );
}
