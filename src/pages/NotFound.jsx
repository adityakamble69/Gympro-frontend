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
            fontSize: "clamp(90px, 20vw, 179px)",
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
            fontSize: "27px",
            margin: "-12px auto 20px",
          }}>🔒</div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(20px, 4vw, 27px)",
            fontWeight: 700,
            color: "#e6edf3",
            margin: "0 0 10px",
            letterSpacing: "-0.3px",
          }}>Page Not Found</h1>

          <p style={{
            color: "#8b949e",
            fontSize: "16px",
            lineHeight: 1.6,
            maxWidth: "320px",
            margin: "0 auto 32px",
          }}>
            The page you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    </>
  );
}