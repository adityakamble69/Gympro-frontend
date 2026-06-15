export default function NotFound() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{
        minHeight: "100vh",
        background: "#060910",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e6edf3",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "fixed", inset: 0,
          backgroundImage: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(47,129,247,0.07), transparent)",
          pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          {/* 404 big number */}
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(80px, 20vw, 160px)",
            fontWeight: 800,
            lineHeight: 1,
            color: "#0d1117",
            textShadow: "0 0 0 1px #21262d",
            WebkitTextStroke: "1px #21262d",
            letterSpacing: "-4px",
            userSelect: "none",
          }}>404</div>

          {/* Icon */}
          <div style={{
            width: "56px", height: "56px",
            borderRadius: "14px",
            background: "rgba(47,129,247,0.1)",
            border: "1px solid rgba(47,129,247,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px",
            margin: "-12px auto 20px",
          }}>🔒</div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(18px, 4vw, 24px)",
            fontWeight: 700,
            color: "#e6edf3",
            margin: "0 0 10px",
            letterSpacing: "-0.3px",
          }}>Page Not Found</h1>

          <p style={{
            color: "#8b949e",
            fontSize: "14px",
            lineHeight: 1.6,
            maxWidth: "320px",
            margin: "0 auto 32px",
          }}>
            The page you're looking for doesn't exist or you don't have access to it.
          </p>

          <a href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "11px 24px",
            borderRadius: "8px",
            background: "#2f81f7",
            color: "#fff",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 0 20px rgba(47,129,247,0.3)",
            transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            ← Go to Login
          </a>
        </div>
      </div>
    </>
  );
}