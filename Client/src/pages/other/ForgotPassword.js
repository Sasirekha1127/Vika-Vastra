// src/pages/other/ForgotPassword.js
import { Fragment, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import LayoutOne from "../../layouts/LayoutOne";
import { requestPasswordReset, verifyOtp, resetPassword } from "../../api";

const forgotPasswordStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');

  .fp-page {
    background: #F8F6F2;
    min-height: 80vh;
    display: flex;
    align-items: center;
    padding: 60px 0;
  }
  .fp-card {
    background: #F8F6F2;
    border: 1px solid #e7dfd2;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 48px rgba(26,16,64,0.08);
    max-width: 480px;
    margin: 0 auto;
  }
  .fp-card::before {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, #720E1E 0%, #C59B27 100%);
  }
  .fp-body { padding: 36px 40px 40px; }
  .fp-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #720E1E;
    margin-bottom: 8px;
    text-align: center;
  }
  .fp-subtitle {
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: #888;
    text-align: center;
    margin-bottom: 28px;
  }
  .fp-field { margin-bottom: 20px; }
  .fp-label {
    display: block;
    font-family: 'Jost', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 7px;
  }
  .fp-input-wrap { position: relative; }
  .fp-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #bbb;
    font-size: 16px;
    pointer-events: none;
  }
  .fp-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    border: 1px solid #e8e3dc;
    border-radius: 4px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: #4A4A4A;
    background: #F8F6F2;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
  }
  .fp-input:focus {
    border-color: #C9933A;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(201,147,58,0.14);
  }
  .fp-input-wrap:focus-within .fp-input-icon { color: #C9933A; }
  .fp-btn {
    display: block;
    width: 100%;
    padding: 14px;
    text-align: center;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #fff;
    background: rgb(197, 155, 39);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease, opacity 0.2s;
  }
  .fp-btn:hover { background: #A8801D; opacity: 0.95; }
  .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .fp-resend {
    text-align: center;
    margin-top: 16px;
  }
  .fp-resend button {
    background: none;
    border: none;
    color: #C9933A;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
  }
  .fp-resend button:disabled { color: #ccc; cursor: not-allowed; }
  .fp-back-link { text-align: center; margin-top: 24px; }
  .fp-back-link a {
    color: #888;
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    text-decoration: none;
  }
  .fp-back-link a:hover { color: #C9933A; }

  @keyframes toastSlideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
  @keyframes toastSlideOut {
    from { transform: translateX(0);   opacity: 1; }
    to   { transform: translateX(100%); opacity: 0; }
  }

  @media (max-width: 600px) { .fp-body { padding: 28px 20px 32px; } }
`;

// ─── Brand-matched Toast ──────────────────────────────────────────────────────
const TOAST_THEMES = {
  success: {
    bg:          "#38050E",                                          // Navy
    border:      "#C9933A",                                          // Gold border accent
    progressBar: "#C9933A",                                          // Gold
    iconBg:      "rgba(201,147,58,0.18)",
    iconColor:   "#C9933A",
    titleColor:  "#F8F6F2",
    textColor:   "rgba(248,246,242,0.85)",
    label:       "Success",
  },
  error: {
    bg:          "#38050E",
    border:      "#e05252",
    progressBar: "#e05252",
    iconBg:      "rgba(224,82,82,0.18)",
    iconColor:   "#e05252",
    titleColor:  "#F8F6F2",
    textColor:   "rgba(248,246,242,0.85)",
    label:       "Error",
  },
  warning: {
    bg:          "#38050E",
    border:      "#C9933A",
    progressBar: "#C9933A",
    iconBg:      "rgba(201,147,58,0.18)",
    iconColor:   "#C9933A",
    titleColor:  "#F8F6F2",
    textColor:   "rgba(248,246,242,0.85)",
    label:       "Warning",
  },
  info: {
    bg:          "#38050E",
    border:      "#C9933A",
    progressBar: "#C9933A",
    iconBg:      "rgba(201,147,58,0.18)",
    iconColor:   "#C9933A",
    titleColor:  "#F8F6F2",
    textColor:   "rgba(248,246,242,0.85)",
    label:       "Info",
  },
};

const TOAST_ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4M12 17h.01M12 3L2 21h20L12 3z" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const ModernToast = ({ message, type = "info", onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress,  setProgress]  = useState(100);
  const onCloseRef = useRef(onClose);

  // Keep ref current without re-triggering the effect
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!message) return;

    setIsExiting(false);
    setProgress(100);

    const startTime = Date.now();
    const duration  = 5000;

    const interval = setInterval(() => {
      const elapsed   = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 16);

    const exitTimer  = setTimeout(() => setIsExiting(true),                duration - 300);
    const closeTimer = setTimeout(() => { onCloseRef.current?.(); },       duration);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [message]); // ← only re-run when message changes, NOT when onClose changes

  if (!message) return null;

  const theme = TOAST_THEMES[type] || TOAST_THEMES.info;

  return (
    <div style={{
      position:  "fixed",
      top:       "24px",
      right:     "24px",
      zIndex:    99999,
      animation: isExiting
        ? "toastSlideOut 0.3s ease forwards"
        : "toastSlideIn 0.4s cubic-bezier(0.68,-0.55,0.265,1.55)",
      maxWidth: "400px",
      minWidth: "300px",
    }}>
      <div style={{
        background:   theme.bg,
        borderRadius: "10px",
        overflow:     "hidden",
        boxShadow:    "0 8px 32px rgba(26,16,64,0.28)",
        border:       `1px solid ${theme.border}`,
      }}>
        {/* Gold top accent line */}
        <div style={{
          height:     "3px",
          background: `linear-gradient(90deg, #720E1E 0%, ${theme.border} 100%)`,
        }} />

        <div style={{
          display:    "flex",
          alignItems: "center",
          gap:        "12px",
          padding:    "14px 16px",
        }}>
          {/* Icon */}
          <div style={{
            width:          "34px",
            height:         "34px",
            background:     theme.iconBg,
            border:         `1px solid ${theme.border}`,
            borderRadius:   "8px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
            color:          theme.iconColor,
          }}>
            {TOAST_ICONS[type] || TOAST_ICONS.info}
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily:    "'Jost', sans-serif",
              fontWeight:    700,
              fontSize:      "13px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color:         theme.titleColor,
              marginBottom:  "3px",
            }}>
              {theme.label}
            </div>
            <div style={{
              fontFamily: "'Jost', sans-serif",
              fontSize:   "13px",
              color:      theme.textColor,
              lineHeight: 1.45,
            }}>
              {message}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => { onCloseRef.current?.(); }}
            style={{
              background:     "rgba(248,246,242,0.08)",
              border:         "1px solid rgba(248,246,242,0.12)",
              borderRadius:   "6px",
              width:          "26px",
              height:         "26px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
              color:          "rgba(248,246,242,0.6)",
              flexShrink:     0,
              transition:     "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = "rgba(201,147,58,0.18)";
              e.currentTarget.style.borderColor = "#C9933A";
              e.currentTarget.style.color       = "#C9933A";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = "rgba(248,246,242,0.08)";
              e.currentTarget.style.borderColor = "rgba(248,246,242,0.12)";
              e.currentTarget.style.color       = "rgba(248,246,242,0.6)";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "rgba(248,246,242,0.08)" }}>
          <div style={{
            height:     "100%",
            background: theme.progressBar,
            width:      `${progress}%`,
            transition: "width 0.016s linear",
          }} />
        </div>
      </div>
    </div>
  );
};
// ─── ForgotPassword ───────────────────────────────────────────────────────────
const ForgotPassword = ({ shop }) => {
  const navigate = useNavigate();
  const [step,            setStep]            = useState(1);
  const [email,           setEmail]           = useState("");
  const [otp,             setOtp]             = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [countdown,       setCountdown]       = useState(0);
  const [toast,           setToast]           = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) { showToast("Please enter your email address", "error"); return; }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      showToast("OTP sent to your email!", "success");
      setStep(2);
      setCountdown(60);
    } catch (err) {
      showToast(err.response?.data?.message || "Email not found or server error", "error");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { showToast("Please enter a valid 6-digit OTP", "error"); return; }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      showToast("OTP verified successfully!", "success");
      setStep(3);
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid or expired OTP", "error");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    if (newPassword !== confirmPassword) { showToast("Passwords do not match", "error"); return; }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      showToast("Password reset successful! Redirecting to login...", "success");
      setTimeout(() => navigate("/login-register"), 2000);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset password", "error");
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await requestPasswordReset(email);
      showToast("New OTP sent!", "success");
      setCountdown(60);
    } catch {
      showToast("Failed to resend OTP", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <Fragment>
      <style>{forgotPasswordStyles}</style>
   
      <LayoutOne shop={shop} headerTop="visible">
        {toast && (
          <ModernToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="fp-page">
          <div className="container">
            <div className="fp-card">
              <div className="fp-body">
                <h1 className="fp-title">Forgot Password?</h1>
                <p className="fp-subtitle">
                  {step === 1 && "Enter your email to receive an OTP"}
                  {step === 2 && "Enter the 6-digit code sent to your email"}
                  {step === 3 && "Create a new password"}
                </p>

                {step === 1 && (
                  <form onSubmit={handleRequestOtp}>
                    <div className="fp-field">
                      <label className="fp-label">Email Address</label>
                      <div className="fp-input-wrap">
                        <input
                          className="fp-input" type="email" placeholder="you@example.com"
                          value={email} onChange={e => setEmail(e.target.value)} required
                        />
                        <i className="pe-7s-mail fp-input-icon" />
                      </div>
                    </div>
                    <button type="submit" className="fp-btn" disabled={loading}>
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="fp-field">
                      <label className="fp-label">Enter OTP</label>
                      <div className="fp-input-wrap">
                        <input
                          className="fp-input"
                          type="text" placeholder="000000" maxLength="6"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                          style={{ fontSize:"24px", fontWeight:"600", letterSpacing:"8px", textAlign:"center" }}
                          required
                        />
                        <i className="pe-7s-key fp-input-icon" />
                      </div>
                    </div>
                    <button type="submit" className="fp-btn" disabled={loading || otp.length !== 6}>
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <div className="fp-resend">
                      <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || loading}>
                        {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="fp-field">
                      <label className="fp-label">New Password</label>
                      <div className="fp-input-wrap">
                        <input
                          className="fp-input" type="password" placeholder="Min. 8 characters"
                          value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                        />
                        <i className="pe-7s-lock fp-input-icon" />
                      </div>
                    </div>
                    <div className="fp-field">
                      <label className="fp-label">Confirm Password</label>
                      <div className="fp-input-wrap">
                        <input
                          className="fp-input" type="password" placeholder="Confirm your password"
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                        />
                        <i className="pe-7s-lock fp-input-icon" />
                      </div>
                    </div>
                    <button type="submit" className="fp-btn" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}

                <div className="fp-back-link">
                  <Link to="/login-register">← Back to Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutOne>
    </Fragment>
  );
};

export default ForgotPassword;