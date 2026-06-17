import { useState } from "react";

export default function ParticlesBackground() {
  const [particles] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 8,
      drift: (Math.random() * 40 - 20).toFixed(0) + "px",
    }))
  );

  return (
    <div className="global-particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="global-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--drift": p.drift,
          }}
        />
      ))}
    </div>
  );
}