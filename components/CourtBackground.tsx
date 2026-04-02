'use client';

/**
 * CourtBackground
 *
 * Absolutely-positioned SVG court geometry with animated draw-in lines.
 * Enhanced with more court details, subtle glow filters, and richer geometry.
 *
 * Usage:
 *   <section className="relative overflow-hidden">
 *     <CourtBackground />
 *     <div className="relative z-10">…content…</div>
 *   </section>
 */

export function CourtBackground() {
  const lineStyle = (dashLen: number, duration: number, delay: number, opacity = 0.05) => ({
    fill: 'none' as const,
    stroke: '#c9a84c',
    strokeWidth: 1,
    opacity,
    strokeDasharray: dashLen,
    strokeDashoffset: dashLen,
    animation: `draw-court-line ${duration}s ease-out ${delay}s forwards`,
  });

  const faintStyle = (dashLen: number, duration: number, delay: number) =>
    lineStyle(dashLen, duration, delay, 0.028);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle glow filter for key court lines */}
        <filter id="court-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Far background: faint full court boundary ── */}
      <rect x="20" y="20" width="1160" height="460" style={faintStyle(3280, 8, 0)} />

      {/* ── Half-court dividing line ── */}
      <line x1="600" y1="0" x2="600" y2="500" style={lineStyle(500, 4, 0.15)} />

      {/* ── Center circle (outer) ── */}
      <circle cx="600" cy="250" r="90" style={lineStyle(566, 5, 0.5)} />

      {/* ── Center circle (inner, faint) ── */}
      <circle cx="600" cy="250" r="36" style={faintStyle(226, 3, 0.8)} />

      {/* ── Center court dot ── */}
      <circle cx="600" cy="250" r="6" style={{ fill: 'rgba(201,168,76,0.07)', stroke: 'none' }} />

      {/* ── LEFT SIDE ── */}

      {/* Left key (lane) */}
      <path d="M 0 135 L 0 365 L 190 365 L 190 135 Z" style={lineStyle(710, 3.5, 0.9)} />

      {/* Left lane blocks (inside lane - tick marks) */}
      {[155, 180, 210, 240, 270, 295, 320, 345].map((y) => (
        <line key={y} x1="190" y1={y} x2="204" y2={y} style={faintStyle(28, 1.5, 1.8)} />
      ))}

      {/* Left free throw circle */}
      <circle cx="190" cy="250" r="76" style={lineStyle(478, 3.8, 1.4)} />

      {/* Left three-point arc */}
      <path d="M 0 68 Q 310 68 418 250 Q 310 432 0 432" style={lineStyle(830, 5.5, 1.7)} />

      {/* Left corner three tick marks */}
      <line x1="0" y1="68" x2="22" y2="68" style={faintStyle(44, 1.5, 2.4)} />
      <line x1="0" y1="432" x2="22" y2="432" style={faintStyle(44, 1.5, 2.4)} />

      {/* Left basket (rim) */}
      <circle cx="70" cy="250" r="22" style={lineStyle(138, 2.5, 2.3)} />

      {/* Left backboard */}
      <line x1="28" y1="220" x2="28" y2="280" style={lineStyle(60, 1.5, 2.5)} />

      {/* Left restricted area arc */}
      <path d="M 70 225 Q 128 225 128 250 Q 128 275 70 275" style={lineStyle(148, 2.2, 2.7)} />

      {/* ── RIGHT SIDE ── */}

      {/* Right key (lane) */}
      <path d="M 1200 135 L 1200 365 L 1010 365 L 1010 135 Z" style={lineStyle(710, 3.5, 1.0)} />

      {/* Right lane blocks */}
      {[155, 180, 210, 240, 270, 295, 320, 345].map((y) => (
        <line key={y} x1="1010" y1={y} x2="996" y2={y} style={faintStyle(28, 1.5, 1.9)} />
      ))}

      {/* Right free throw circle */}
      <circle cx="1010" cy="250" r="76" style={lineStyle(478, 3.8, 1.5)} />

      {/* Right three-point arc */}
      <path d="M 1200 68 Q 890 68 782 250 Q 890 432 1200 432" style={lineStyle(830, 5.5, 1.9)} />

      {/* Right corner three tick marks */}
      <line x1="1200" y1="68" x2="1178" y2="68" style={faintStyle(44, 1.5, 2.5)} />
      <line x1="1200" y1="432" x2="1178" y2="432" style={faintStyle(44, 1.5, 2.5)} />

      {/* Right basket */}
      <circle cx="1130" cy="250" r="22" style={lineStyle(138, 2.5, 2.4)} />

      {/* Right backboard */}
      <line x1="1172" y1="220" x2="1172" y2="280" style={lineStyle(60, 1.5, 2.6)} />

      {/* Right restricted area arc */}
      <path d="M 1130 225 Q 1072 225 1072 250 Q 1072 275 1130 275" style={lineStyle(148, 2.2, 2.8)} />
    </svg>
  );
}