// BiqEngine.tsx — "THE TEARDOWN", the homepage centerpiece.
//
// BIQ's claim is that five measurable components resolve into one number, and
// that the number ranks people. This draws both: five lanes of real league data
// converging into an aperture, and then — driven entirely by scroll — coming
// apart again and landing as the top 20 board.
//
// Every tick is a real player's real component score, at every point in the
// journey. Nothing here is decorative noise. Server-safe: plain SVG plus an
// HTML overlay, no client JS. HomeMotion finds the parts by data-attribute.
//
// See docs/superpowers/specs/2026-07-28-scroll-teardown-design.md

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

/* Geometry. The viewBox spans the pinned viewport rather than the old wide
   strip, because the board has to land inside the same box the instrument
   started in. The HTML overlay positions off these numbers, so the container
   locks the aspect ratio and the SVG fills it — percentages then land exactly. */
const VB = { w: 1400, h: 900 };

/* --- phase 1 composition: the instrument --- */
const LANE_X0 = 60;
const LANE_X1 = 620;
const LANE_Y = [236, 308, 380, 452, 524];
const CX = 980;
const CY = 380;
const R = 128;

/** Where each lane lands on the aperture's left edge, in degrees. */
const LANDING = [212, 196, 180, 164, 148];

/* --- phase 3 composition: the board --- */
const BOARD_N = 20;
const ROW_H = 40;
const ROW_Y0 = 80;
/** Where a row's five component ticks land, and how far apart they sit. */
const ROW_TICK_X = 966;
const ROW_TICK_GAP = 24;
/** Row ticks are compressed so five of them clear a 40-unit row. */
export const ROW_TICK_SCALE = 0.5;

function rowCenterY(rank: number) {
  return ROW_Y0 + rank * ROW_H;
}

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

/* Vertical extent of the playhead, clear of the tallest possible tick. */
const SWEEP_Y0 = LANE_Y[0] - 30;
const SWEEP_Y1 = LANE_Y[4] + 30;

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

  /* One geometry, drawn twice — as the resting rail and as the travelling
     pulse — so the two can never drift apart. */
  const beamPaths = LANES.map((_, li) => {
    const y = LANE_Y[li];
    const [lx, ly] = polar(R, LANDING[li]);
    return `M ${LANE_X1} ${y} C ${LANE_X1 + 120} ${y}, ${lx - 110} ${ly}, ${lx.toFixed(1)} ${ly.toFixed(1)}`;
  });

  return (
    <div
      className="biq-engine"
      data-anime="engine"
      style={{ '--vb-aspect': `${VB.w} / ${VB.h}` } as CSSProperties}
    >
      <svg
        className="biq-engine-svg"
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        {/* ---- five component lanes, one tick per player ---- */}
        {LANES.map((lane, li) => {
          const y = LANE_Y[li];
          return (
            <g key={lane.key} data-anime-group="lane" data-lane={li}>
              <line
                x1={LANE_X0}
                y1={y}
                x2={LANE_X1}
                y2={y}
                stroke="var(--eng-line)"
                strokeWidth={1}
                data-anime="lane-axis"
              />
              <text
                x={LANE_X0}
                /* Lanes sit 72 apart and a tick reaches 24 either side of its
                   axis, so -42 put each label into the ticks of the lane above.
                   -32 clears both its own lane's ticks and the one above. */
                y={y - 32}
                fill="var(--eng-label)"
                style={{
                  fontFamily: 'var(--font-file)',
                  fontSize: 12,
                  letterSpacing: '0.16em',
                }}
                data-anime="lane-label"
              >
                {lane.label}
              </text>
              {players.map((p, pi) => {
                const { lo, span } = ranges[li];
                const h = 8 + ((p[lane.key] - lo) / span) * 40;
                const x = LANE_X0 + pi * step;
                /* Where this tick is headed when the field comes apart. Stored
                   as a delta so HomeMotion only ever writes a transform, and
                   the rect's x/y stay the resting truth for a no-JS page. */
                const toX = ROW_TICK_X + li * ROW_TICK_GAP - (x + tickW / 2);
                const toY = rowCenterY(pi) - y;
                return (
                  <rect
                    key={p.id}
                    x={x}
                    y={y - h / 2}
                    width={tickW}
                    height={h}
                    rx={tickW / 2}
                    fill="var(--eng-tick)"
                    data-anime="lane-tick"
                    data-lane={li}
                    /* A column shares one index across all five lanes — that is
                       what makes it one player. The teardown reads by column. */
                    data-player={pi}
                    data-to-x={toX.toFixed(1)}
                    data-to-y={toY.toFixed(1)}
                    /* Past the top 20 there is no row to land in. */
                    data-drops={pi >= BOARD_N ? '1' : undefined}
                  />
                );
              })}
            </g>
          );
        })}

        {/* ---- the read playhead ----
            Parked at x=0 and translated across the lane field by scroll, so the
            ticks it passes over are never touched geometrically. */}
        <g
          data-anime="playhead"
          data-motion-only
          style={{ transformBox: 'view-box', transformOrigin: '0px 0px' }}
        >
          <line
            x1={0}
            y1={SWEEP_Y0}
            x2={0}
            y2={SWEEP_Y1}
            stroke="var(--eng-key)"
            strokeWidth={1}
            opacity={0.55}
          />
          <path
            d={`M -4 ${SWEEP_Y0 - 9} L 4 ${SWEEP_Y0 - 9} L 0 ${SWEEP_Y0 - 2} Z`}
            fill="var(--eng-key)"
          />
        </g>

        {/* ---- convergence beams: five lanes bending into one aperture ---- */}
        {beamPaths.map((d, li) => (
          <path
            key={`beam-${LANES[li].key}`}
            d={d}
            fill="none"
            stroke="var(--eng-beam)"
            strokeWidth={1.25}
            data-anime="beam"
          />
        ))}

        {/* ---- the aperture ---- */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="var(--eng-well)"
          stroke="var(--eng-line)"
          strokeWidth={1}
          data-anime="aperture"
        />

        {/* Radial tick ring. Each tick carries its own outward direction so the
            ring can fan apart along its real radii rather than just fading. */}
        <g
          data-anime-group="ring"
          style={{ transformBox: 'view-box', transformOrigin: `${CX}px ${CY}px` }}
        >
          {Array.from({ length: RING_TICKS }, (_, i) => {
            const deg = (360 / RING_TICKS) * i;
            const long = i % 8 === 0;
            const [x0, y0] = polar(R + 8, deg);
            const [x1, y1] = polar(R + (long ? 22 : 14), deg);
            const a = (deg * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={x0.toFixed(1)}
                y1={y0.toFixed(1)}
                x2={x1.toFixed(1)}
                y2={y1.toFixed(1)}
                stroke={long ? 'var(--eng-tick)' : 'var(--eng-line)'}
                strokeWidth={long ? 1.6 : 1}
                data-anime="ring-tick"
                data-fan-x={(Math.cos(a) * 260).toFixed(1)}
                data-fan-y={(Math.sin(a) * 260).toFixed(1)}
              />
            );
          })}
        </g>

        {/* tier arcs */}
        {TIER_ARCS.map((t) => (
          <path
            key={t.from}
            d={arc(R + 36, t.from, t.to)}
            fill="none"
            stroke={t.color}
            strokeWidth={3}
            strokeLinecap="round"
            data-anime="tier-arc"
          />
        ))}

        {/* the resolved reading: a sweep proportional to the leader's BIQ */}
        <path
          d={arc(R - 16, -90, -90 + (leader.biqScore / 100) * 360)}
          fill="none"
          stroke="var(--eng-key)"
          strokeWidth={2.5}
          strokeLinecap="round"
          data-anime="verdict-arc"
        />
      </svg>

      {/* The score overlays in real type rather than SVG text, so it counts up
          cleanly and uses the display face. Positioned off the same geometry. */}
      <div
        className="biq-engine-verdict"
        data-anime-group="verdict"
        style={
          {
            '--verdict-x': `${(CX / VB.w) * 100}%`,
            '--verdict-y': `${(CY / VB.h) * 100}%`,
            '--verdict-w': `${((R * 1.7) / VB.w) * 100}%`,
          } as CSSProperties
        }
      >
        <p className="biq-mono" data-anime="engine-label" style={{ color: 'var(--eng-label)' }}>
          BIQ NO. 1
        </p>
        <p
          className="biq-display"
          data-anime="count"
          data-count-to={leader.biqScore}
          data-count-decimals={1}
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
        <p
          data-anime="engine-name"
          style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: 'var(--eng-ink)' }}
        >
          {leader.name}
        </p>
      </div>

      {/* ---- the board the object comes apart into ----
          Plain flow by default: with no JS this is simply the top 20, printed
          under the instrument. Only `.js-motion` lifts it into the stage and
          positions each row off --row-y, so the inline style carries data and
          the stylesheet decides whether it means anything. */}
      <ol className="biq-board-rows" data-anime="board">
        {board.map((p, i) => (
          <li
            key={p.id}
            className="biq-board-row"
            data-anime="board-row"
            data-rank={i}
            style={{ '--row-y': `${(rowCenterY(i) / VB.h) * 100}%` } as CSSProperties}
          >
            <Link href={`/players/${p.id}`} className="biq-board-link">
              <span className="biq-mono biq-board-rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="biq-board-name">{p.name}</span>
              <span className="biq-mono biq-board-team">{p.team}</span>
              {/* Holds open the column the five ticks fly into. */}
              <span className="biq-board-signature" aria-hidden="true" />
              <span className="biq-num biq-board-score">{p.biqScore.toFixed(1)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
