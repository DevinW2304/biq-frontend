// BiqEngine.tsx — the homepage instrument and the board under it.
//
// BIQ's claim is that five measurable components resolve into one number, and
// that the number ranks people. This draws both: five lanes of real league data
// converging into an aperture that reads the leader's score, then the top 20
// printed underneath.
//
// Every tick is a real player's real component score. Nothing here is
// decorative noise. Static and server-safe: plain SVG plus an HTML overlay.

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { BIQLeaderboardEntry } from '@/lib/types';

const LANES = [
  { key: 'burdenScore', label: 'WORKLOAD' },
  { key: 'creationScore', label: 'CREATION' },
  { key: 'efficiencyScore', label: 'EFFICIENCY' },
  { key: 'impactScore', label: 'IMPACT' },
  { key: 'availabilityScore', label: 'AVAILABILITY' },
] as const;

/* Geometry, in viewBox units. The viewBox is cropped to the drawing itself
   (lane labels at the top-left through the tier arcs at the right), so the
   instrument takes no more height than it needs. The HTML overlay positions
   off these numbers, so the container locks the aspect ratio and the SVG
   fills it — percentages then land exactly. */
const VB = { x: 20, y: 180, w: 1166, h: 380 };

const LANE_X0 = 60;
const LANE_X1 = 620;
const LANE_Y = [236, 308, 380, 452, 524];
const CX = 980;
const CY = 380;
const R = 128;

/** Where each lane lands on the aperture's left edge, in degrees. */
const LANDING = [212, 196, 180, 164, 148];

const BOARD_N = 20;

function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function arc(r: number, from: number, to: number) {
  const [x0, y0] = polar(r, from);
  const [x1, y1] = polar(r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/* The four BIQ tiers, as arc segments around the aperture. Categorical data
   earns categorical color — the rest of the instrument stays blue and bone. */
const TIER_ARCS = [
  { from: -92, to: -14, color: 'var(--eng-key)' },
  { from: -4, to: 74, color: 'var(--eng-teal)' },
  { from: 84, to: 162, color: 'var(--eng-amber)' },
  { from: 172, to: 250, color: 'var(--eng-dim)' },
];

const RING_TICKS = 96;

export function BiqEngine({
  players,
  leader,
}: {
  players: BIQLeaderboardEntry[];
  leader: BIQLeaderboardEntry;
}) {
  const n = players.length;
  if (!n) return null;

  const step = (LANE_X1 - LANE_X0) / n;
  const tickW = Math.max(1.6, Math.min(5, step * 0.5));
  const board = players.slice(0, BOARD_N);

  /* Every player on the board scores high, so a raw 0-100 mapping flattens
     the lanes into a solid block. Normalising each component to its own
     observed range makes the real spread legible — the values are unchanged,
     only the scale is per-component. */
  const ranges = LANES.map((lane) => {
    const vs = players.map((p) => p[lane.key]);
    const lo = Math.min(...vs);
    const hi = Math.max(...vs);
    return { lo, span: hi - lo || 1 };
  });

  const beamPaths = LANES.map((_, li) => {
    const y = LANE_Y[li];
    const [lx, ly] = polar(R, LANDING[li]);
    return `M ${LANE_X1} ${y} C ${LANE_X1 + 120} ${y}, ${lx - 110} ${ly}, ${lx.toFixed(1)} ${ly.toFixed(1)}`;
  });

  return (
    <>
      <div
        className="biq-engine"
        style={{ '--vb-aspect': `${VB.w} / ${VB.h}` } as CSSProperties}
      >
        <svg
          className="biq-engine-svg"
          viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          {/* ---- five component lanes, one tick per player ---- */}
          {LANES.map((lane, li) => {
            const y = LANE_Y[li];
            const { lo, span } = ranges[li];
            return (
              <g key={lane.key}>
                <line x1={LANE_X0} y1={y} x2={LANE_X1} y2={y} stroke="var(--eng-line)" strokeWidth={1} />
                <text
                  x={LANE_X0}
                  /* Lanes sit 72 apart and a tick reaches 24 either side of its
                     axis; -32 clears both its own lane's ticks and the one above. */
                  y={y - 32}
                  fill="var(--eng-label)"
                  style={{ fontFamily: 'var(--font-file)', fontSize: 12, letterSpacing: '0.16em' }}
                >
                  {lane.label}
                </text>
                {players.map((p, pi) => {
                  const h = 8 + ((p[lane.key] - lo) / span) * 40;
                  return (
                    <rect
                      key={p.id}
                      x={LANE_X0 + pi * step}
                      y={y - h / 2}
                      width={tickW}
                      height={h}
                      rx={tickW / 2}
                      fill="var(--eng-tick)"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* ---- convergence beams: five lanes bending into one aperture ---- */}
          {beamPaths.map((d, li) => (
            <path
              key={`beam-${LANES[li].key}`}
              d={d}
              fill="none"
              stroke="var(--eng-beam)"
              strokeWidth={1.25}
            />
          ))}

          {/* ---- the aperture ---- */}
          <circle cx={CX} cy={CY} r={R} fill="var(--eng-well)" stroke="var(--eng-line)" strokeWidth={1} />

          {/* radial tick ring */}
          {Array.from({ length: RING_TICKS }, (_, i) => {
            const deg = (360 / RING_TICKS) * i;
            const long = i % 8 === 0;
            const [x0, y0] = polar(R + 8, deg);
            const [x1, y1] = polar(R + (long ? 22 : 14), deg);
            return (
              <line
                key={i}
                x1={x0.toFixed(1)}
                y1={y0.toFixed(1)}
                x2={x1.toFixed(1)}
                y2={y1.toFixed(1)}
                stroke={long ? 'var(--eng-tick)' : 'var(--eng-line)'}
                strokeWidth={long ? 1.6 : 1}
              />
            );
          })}

          {/* tier arcs */}
          {TIER_ARCS.map((t) => (
            <path
              key={t.from}
              d={arc(R + 36, t.from, t.to)}
              fill="none"
              stroke={t.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}

          {/* the resolved reading: a sweep proportional to the leader's BIQ */}
          <path
            d={arc(R - 16, -90, -90 + (leader.biqScore / 100) * 360)}
            fill="none"
            stroke="var(--eng-key)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </svg>

        {/* The score overlays in real type rather than SVG text, so it uses the
            display face. Positioned off the same geometry as the aperture. */}
        <div
          className="biq-engine-verdict"
          style={
            {
              '--verdict-x': `${((CX - VB.x) / VB.w) * 100}%`,
              '--verdict-y': `${((CY - VB.y) / VB.h) * 100}%`,
              '--verdict-w': `${((R * 1.7) / VB.w) * 100}%`,
            } as CSSProperties
          }
        >
          <p className="biq-mono" style={{ color: 'var(--eng-label)' }}>
            BIQ NO. 1
          </p>
          <p
            className="biq-display"
            style={{
              fontSize: 'clamp(38px, 5.2vw, 78px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginTop: 6,
              color: 'var(--eng-key)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {leader.biqScore.toFixed(1)}
          </p>
          <p style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: 'var(--eng-ink)' }}>
            {leader.name}
          </p>
        </div>
      </div>

      {/* ---- the board ---- */}
      <p id="biq-board-label" className="biq-mono biq-board-label">
        Top {board.length} by BIQ
      </p>
      <ol className="biq-board-rows" aria-labelledby="biq-board-label">
        {board.map((p, i) => (
          <li key={p.id} className="biq-board-row">
            <Link href={`/players/${p.id}`} className="biq-board-link">
              <span className="biq-mono biq-board-rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="biq-board-name">{p.name}</span>
              <span className="biq-mono biq-board-team">{p.team}</span>
              <span className="biq-num biq-board-score">{p.biqScore.toFixed(1)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
