import { useState } from "react";
import api from "../services/api";
import { FaDumbbell, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) onLogin(res.data.token, res.data.admin);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`

      /* Autofill fix — YAHAN ADD KARO */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px #111111 inset !important;
    -webkit-text-fill-color: #f0f0f0 !important;
    caret-color: #f0f0f0;
  }
        /* ── AMOLED Black Color System ── */
        :root {
          --black:        #000000;
          --bg-base:      #000000;
          --bg-surface:   #0a0a0a;
          --bg-card:      #111111;
          --bg-elevated:  #1a1a1a;
          --bg-input:     #141414;
          --border-dim:   rgba(255,255,255,0.06);
          --border-glow:  rgba(59,130,246,0.35);
          --border-input: rgba(255,255,255,0.09);
          --blue:         #3b82f6;
          --blue-bright:  #60a5fa;
          --blue-dim:     rgba(59,130,246,0.08);
          --cyan:         #06b6d4;
          --text-primary: #f0f0f0;
          --text-sub:     #888888;
          --text-muted:   #555555;
          --red:          #f87171;
          --red-bg:       rgba(248,113,113,0.06);
        }

        @keyframes meshMove {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); }
          33%  { transform: translate(40px,-30px) rotate(120deg) scale(1.05); }
          66%  { transform: translate(-25px,25px) rotate(240deg) scale(0.97); }
          100% { transform: translate(0,0) rotate(360deg) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulseGlow {
          0%,100% { opacity:0.4; }
          50%      { opacity:0.8; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        * { box-sizing: border-box; margin:0; padding:0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          background: var(--black);
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Scanline effect — subtle */
        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Left Panel ── */
        .login-left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-dim);
          position: relative;
          overflow: hidden;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.035;
          background-image:
            linear-gradient(rgba(59,130,246,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .panel-divider {
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.25) 50%, transparent 100%);
        }

        /* ── Right Panel ── */
        .login-right-panel {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 48px;
          background: var(--black);
          position: relative;
          z-index: 1;
        }

        /* Logo badge */
        .logo-badge {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(59,130,246,0.3), 0 8px 28px rgba(59,130,246,0.4);
        }

        /* Input */
        .login-input {
          width: 100%;
          padding: 13px 16px;
          background: var(--bg-input);
          border: 1px solid var(--border-input);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          letter-spacing: 0.01em;
        }
        .login-input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1), inset 0 0 0 1px rgba(59,130,246,0.05);
          background: #161616;
        }
        .login-input::placeholder { color: var(--text-muted); }

        /* Feature rows */
        .feature-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border-radius: 10px;
          background: var(--blue-dim);
          border: 1px solid rgba(59,130,246,0.1);
          margin-bottom: 8px;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity: 0;
        }

        /* Stats */
        .stat-pill {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 8px;
          border-radius: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border-dim);
        }

        /* Sign-in button */
        .sign-in-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0ea5e9 100%);
          background-size: 200% auto;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 24px rgba(59,130,246,0.3), 0 1px 0 rgba(255,255,255,0.06) inset;
          margin-top: 4px;
        }
        .sign-in-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-1px);
          box-shadow: 0 8px 36px rgba(59,130,246,0.45);
        }
        .sign-in-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .sign-in-btn:disabled {
          background: var(--bg-elevated);
          color: var(--text-muted);
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Divider line */
        .field-divider { height:1px; background: var(--border-dim); margin: 4px 0; }

        /* Error */
        .error-box {
          padding: 11px 14px;
          border-radius: 9px;
          background: var(--red-bg);
          border: 1px solid rgba(248,113,113,0.15);
          color: var(--red);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .login-left-panel  { display: none !important; }
          .login-right-panel { width: 100% !important; padding: 40px 24px !important; min-height: 100vh; justify-content: center; }
          .login-headline    { font-size: 26px !important; }
          .login-mobile-logo { display: flex !important; }
        }
        @media (max-width: 480px) {
          .login-right-panel { padding: 32px 20px !important; }
        }
        .login-mobile-logo { display: none; }
      `}</style>

      <div className="login-root">
        {/* Scanline */}
        <div className="scanline" />

        {/* Deep ambient blobs */}
        <div style={{
          position: "fixed", top: "-180px", left: "-180px",
          width: "480px", height: "480px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,78,216,0.14) 0%, transparent 70%)",
          animation: "meshMove 22s ease-in-out infinite",
          pointerEvents: "none", zIndex: 0
        }} />
        <div style={{
          position: "fixed", bottom: "-120px", right: "-80px",
          width: "360px", height: "360px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
          animation: "meshMove 16s ease-in-out infinite reverse",
          pointerEvents: "none", zIndex: 0
        }} />

        {/* ── LEFT PANEL ── */}
        <div className="login-left-panel">
          <div className="grid-bg" />
          <div className="panel-divider" />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "13px", marginBottom: "60px" }}>
              <div className="logo-badge">
                <FaDumbbell style={{ color: "#fff", fontSize: "19px" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "21px", color: "var(--text-primary)", letterSpacing: "0.01em" }}>
                  Workout World Gym
                </div>
                <div style={{ fontSize: "9px", color: "var(--blue-bright)", letterSpacing: "0.14em", opacity: 0.7, marginTop: "2px" }}>
                  MANAGEMENT SYSTEM
                </div>
              </div>
            </div>

            {/* Headline */}
            <div style={{ fontSize: "12px", color: "var(--blue-bright)", letterSpacing: "0.16em", fontWeight: 600, marginBottom: "14px", opacity: 0.7 }}>
              ADMIN PORTAL
            </div>
            <h1 style={{
              fontSize: "50px", fontWeight: 800,
              color: "var(--text-primary)", lineHeight: 1.04,
              marginBottom: "18px", letterSpacing: "-2px"
            }}>
              Manage Your<br />
              <span style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>Gym Smarter.</span>
            </h1>
            <p style={{ color: "var(--text-sub)", fontSize: "16px", maxWidth: "340px", lineHeight: 1.8, marginBottom: "44px" }}>
              Members, attendance, payments, and analytics — all in one powerful dashboard.
            </p>

            {/* Features */}
            {[
              ["👥", "Member & Trainer Management"],
              ["📊", "Real-time Analytics & Reports"],
              ["💳", "Payments & Membership Tracking"],
            ].map(([icon, text], i) => (
              <div key={text} className="feature-row" style={{ animationDelay: `${0.08 + i * 0.1}s` }}>
                <span style={{ fontSize: "17px" }}>{icon}</span>
                <span style={{ fontSize: "15px", color: "var(--text-sub)", fontWeight: 500 }}>{text}</span>
              </div>
            ))}

            {/* Stats */}
            <div style={{ display: "flex", gap: "10px", marginTop: "36px" }}>
              {[["500+", "Members"], ["99%", "Uptime"], ["24/7", "Access"]].map(([val, label]) => (
                <div key={label} className="stat-pill">
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--blue-bright)", letterSpacing: "-0.5px" }}>{val}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: "3px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right-panel">
          <div style={{ animation: "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) forwards" }}>

            {/* Mobile logo */}
            <div className="login-mobile-logo" style={{ alignItems: "center", gap: "10px", marginBottom: "32px" }}>
              <div className="logo-badge" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
                <FaDumbbell style={{ color: "#fff", fontSize: "16px" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>Workout World Gym</div>
                <div style={{ fontSize: "8px", color: "var(--blue-bright)", letterSpacing: "0.12em", opacity: 0.7 }}>MANAGEMENT SYSTEM</div>
              </div>
            </div>

            {/* Form icon */}
            <div style={{
              width: "50px", height: "50px", borderRadius: "14px",
              background: "var(--bg-card)",
              border: "1px solid rgba(59,130,246,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "28px",
              boxShadow: "0 4px 20px rgba(59,130,246,0.12)"
            }}>
              <FaDumbbell style={{ color: "var(--blue-bright)", fontSize: "21px" }} />
            </div>

            <h2 className="login-headline" style={{
              fontSize: "31px", fontWeight: 800,
              color: "var(--text-primary)", marginBottom: "6px",
              letterSpacing: "-0.7px"
            }}>Welcome back</h2>
            <p style={{ color: "var(--text-sub)", marginBottom: "36px", fontSize: "16px" }}>
              Sign in to your admin account
            </p>

            {/* Grouped input card */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Email + Password grouped card */}
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-dim)",
                borderRadius: "12px",
                overflow: "hidden",
              }}>
                {/* Email */}
                <div style={{ padding: "14px 16px 0" }}>
                  <label style={{
                    display: "block", marginBottom: "6px", fontSize: "11px",
                    fontWeight: 700, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.12em"
                  }}>Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@gym.com" required
                    className="login-input"
                    style={{
                      background: "transparent",
                      border: "none",
                      borderRadius: 0,
                      padding: "2px 0 12px",
                      fontSize: "17px",
                      boxShadow: "none",
                    }}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>

                {/* Divider */}
                <div className="field-divider" />

                {/* Password */}
                <div style={{ padding: "14px 16px 14px" }}>
                  <label style={{
                    display: "block", marginBottom: "6px", fontSize: "11px",
                    fontWeight: 700, color: "var(--text-muted)",
                    textTransform: "uppercase", letterSpacing: "0.12em"
                  }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="login-input"
                      style={{
                        background: "transparent",
                        border: "none",
                        borderRadius: 0,
                        padding: "2px 40px 0 0",
                        fontSize: "17px",
                        boxShadow: "none",
                      }}
                      onFocus={() => setFocusedField("pass")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute", right: "0", top: "2px",
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-muted)", fontSize: "16px",
                        display: "flex", alignItems: "center", padding: "0",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--blue-bright)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <span style={{ fontSize: "17px" }}>⚠️</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="sign-in-btn">
                {loading
                  ? <span style={{ opacity: 0.7 }}>Signing in…</span>
                  : "SIGN IN  →"
                }
              </button>
            </form>

            <p style={{
              color: "#f0f0f0", fontSize: "11px",
              marginTop: "32px", textAlign: "center",
              letterSpacing: "0.08em", fontWeight: 700
            }}>
              WORKOUT WORLD GYM • v2.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}