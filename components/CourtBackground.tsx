'use client';

/**
 * CourtBackground
 *
 * Absolutely-positioned SVG of half-court geometry (three-point arc,
 * lane/key, free-throw circle, center circle, half-court line).
 *
 * Lines draw in using stroke-dashoffset animation defined in globals.css
 * via the `draw-court-line` keyframe. Each line gets its own --dash-len
 * CSS variable and an animation-delay for a staggered draw-in effect.
 *
 * Opacity is intentionally very low (~0.045) — it reads as textural
 * atmosphere, not a design element competing with content.
 *
 * Usage:
 *   <section className="relative overflow-hidden">
 *     <CourtBackground />
 *     <div className="relative z-10">…content…</div>
 *   </section>
 */

export function CourtBackground() {
  const lineStyle = (dashLen: number, duration: number, delay: number) => ({
    fill: 'none' as const,
    stroke: '#c9a84c',
    strokeWidth: 1,
    opacity: 0.045,
    strokeDasharray: dashLen,
    strokeDashoffset: dashLen,
    animation: `draw-court-line ${duration}s ease-out ${delay}s forwards`,
  });

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Half-court dividing line */}
      <line x1="600" y1="0" x2="600" y2="500" style={lineStyle(500, 4, 0.1)} />

      {/* Center circle */}
      <circle cx="600" cy="250" r="80" style={lineStyle(503, 4.5, 0.4)} />

      {/* Left key (lane) */}
      <path d="M 0 125 L 0 375 L 190 375 L 190 125 Z" style={lineStyle(730, 3.5, 0.8)} />

      {/* Right key (lane) */}
      <path d="M 1200 125 L 1200 375 L 1010 375 L 1010 125 Z" style={lineStyle(730, 3.5, 0.9)} />

      {/* Left free throw circle */}
      <circle cx="190" cy="250" r="72" style={lineStyle(452, 3.5, 1.3)} />

      {/* Right free throw circle */}
      <circle cx="1010" cy="250" r="72" style={lineStyle(452, 3.5, 1.4)} />

      {/* Left three-point arc */}
      <path d="M 0 60 Q 320 60 420 250 Q 320 440 0 440" style={lineStyle(820, 5, 1.6)} />

      {/* Right three-point arc */}
      <path d="M 1200 60 Q 880 60 780 250 Q 880 440 1200 440" style={lineStyle(820, 5, 1.8)} />

      {/* Left basket */}
      <circle cx="70" cy="250" r="22" style={lineStyle(138, 2.5, 2.2)} />

      {/* Right basket */}
      <circle cx="1130" cy="250" r="22" style={lineStyle(138, 2.5, 2.3)} />

      {/* Left restricted area arc */}
      <path d="M 70 228 Q 120 228 120 250 Q 120 272 70 272" style={lineStyle(140, 2, 2.6)} />

      {/* Right restricted area arc */}
      <path d="M 1130 228 Q 1080 228 1080 250 Q 1080 272 1130 272" style={lineStyle(140, 2, 2.7)} />
    </svg>
  );
}