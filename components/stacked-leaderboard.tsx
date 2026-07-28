'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { Spring } from '@/lib/spring';
import { BIQLeaderboardEntry } from '@/lib/types';

// ─── constants ────────────────────────────────────────────────────────────────
const VISIBLE_SIDE = 3;

const GRADIENTS = [
  'rgba(18, 18, 19, 0.55)',
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function headshotUrl(id: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`;
}

// COURT PAPER: one accent. The chrome around the photo cards is light, so
// every former tier color collapses to the key blue.
function tierColor(_score: number): string {
  return '#2545cb';
}

// ─── StatPill ─────────────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '0.55rem 0.5rem',
        borderRadius: 'var(--r-sm)',
        background: accent ? '#e9edfa' : '#fff',
        border: `1px solid ${accent ? '#c8d3f2' : 'var(--border)'}`,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-file)',
          fontSize: '0.5rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: accent ? '#1b34a0' : 'var(--muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-file)',
          fontWeight: 600,
          fontSize: '1.05rem',
          lineHeight: 1,
          color: accent ? '#1b34a0' : 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.toFixed(1)}
      </div>
    </div>
  );
}

function NeighborRow({
  rank,
  player,
  active,
}: {
  rank: number;
  player: BIQLeaderboardEntry;
  active?: boolean;
}) {
  const tc = tierColor(player.biqScore);

  return (
    <Link
      href={`/players/${player.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '42px 1fr auto',
        gap: '0.7rem',
        alignItems: 'center',
        padding: '0.7rem 0.8rem',
        textDecoration: 'none',
        color: 'var(--text)',
        borderRadius: 'var(--r-sm)',
        border: `1px solid ${active ? '#c8d3f2' : 'var(--border)'}`,
        background: active ? '#e9edfa' : '#fff',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-file)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: active ? tc : 'var(--muted)',
          lineHeight: 1,
        }}
      >
        #{rank}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            fontWeight: 600,
            lineHeight: 1.05,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-file)',
            fontSize: '0.55rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginTop: 4,
          }}
        >
          {player.team} · {player.position}
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-file)',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: tc,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {player.biqScore.toFixed(1)}
      </div>
    </Link>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function StackedLeaderboard({
  players,
}: {
  players: BIQLeaderboardEntry[];
}) {
  const N = players.length;

  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const dragStartX = useRef(0);
  const dragStartIdx = useRef(0);

  const scRY = useRef(new Spring(-14, 60, 18, 1));
  const scRX = useRef(new Spring(6, 60, 18, 1));
  const sliderSpring = useRef(new Spring(0, 120, 20, 0.8));

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sliderFillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number) => setActiveIdx(Math.max(0, Math.min(N - 1, idx))),
    [N],
  );

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 980);
    h();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(activeIdx - 1);
      if (e.key === 'ArrowRight') goTo(activeIdx + 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [activeIdx, goTo]);

  useEffect(() => {
    let rafId: number;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (sceneRef.current) {
        sceneRef.current.style.transform =
          `rotateY(${scRY.current.step(dt)}deg) rotateX(${scRX.current.step(dt)}deg)`;
      }

      sliderSpring.current.set(activeIdx / Math.max(N - 1, 1));
      const pct = sliderSpring.current.step(dt) * 100;

      if (sliderFillRef.current) sliderFillRef.current.style.width = `${pct}%`;
      if (thumbRef.current) thumbRef.current.style.left = `${pct}%`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [N, activeIdx]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) return;
      const r = containerRef.current?.getBoundingClientRect();
      if (!r) return;
      scRY.current.set(-14 + ((e.clientX - r.left) / r.width - 0.5) * 16);
      scRX.current.set(6 + ((e.clientY - r.top) / r.height - 0.5) * -10);
    },
    [isDragging],
  );

  const onMouseLeave = useCallback(() => {
    scRY.current.set(-14);
    scRX.current.set(6);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartIdx.current = activeIdx;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [activeIdx],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      goTo(dragStartIdx.current + Math.round((dragStartX.current - e.clientX) / 78));
    },
    [isDragging, goTo],
  );

  const onPointerUp = useCallback(() => setIsDragging(false), []);

  const active = players[activeIdx];
  const tc = tierColor(active.biqScore);

  const cardRange = Array.from(
    { length: VISIBLE_SIDE * 2 + 1 },
    (_, k) => activeIdx - VISIBLE_SIDE + k,
  ).filter((i) => i >= 0 && i < N);

  const neighbors = Array.from({ length: 5 }, (_, idx) => activeIdx - 2 + idx).filter(
    (i) => i >= 0 && i < N,
  );

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        color: 'var(--text)',
        userSelect: 'none',
        isolation: 'isolate',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 1.1rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={() => goTo(activeIdx - 1)}
            disabled={activeIdx === 0}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 999,
              color: activeIdx === 0 ? 'var(--faint)' : 'var(--text)',
              cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            ‹
          </button>

          <div
            style={{
              fontFamily: 'var(--font-file)',
              fontWeight: 600,
              fontSize: '1.1rem',
              lineHeight: 1,
              color: tc,
              minWidth: 36,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            #{activeIdx + 1}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-file)',
              fontSize: '0.6rem',
              color: 'var(--muted)',
              letterSpacing: '0.1em',
            }}
          >
            / {N}
          </div>

          <button
            onClick={() => goTo(activeIdx + 1)}
            disabled={activeIdx === N - 1}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 999,
              color: activeIdx === N - 1 ? 'var(--faint)' : 'var(--text)',
              cursor: activeIdx === N - 1 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            ›
          </button>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-file)',
            fontSize: '0.55rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Drag · ← → keys · slider
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          width: '100%',
          height: isDesktop ? 400 : 350,
          perspective: '1200px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          background: 'transparent',
          transition: 'background 0.5s ease',
        }}
      >
        <div
          ref={sceneRef}
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: 0,
            height: 0,
          }}
        >
          {cardRange.map((i) => {
            const offset = i - activeIdx;
            const isActive = offset === 0;
            const player = players[i];
            const rank = i + 1;
            const ptc = tierColor(player.biqScore);
            const grad = GRADIENTS[i % GRADIENTS.length];
            const absOff = Math.abs(offset);
            const sign = Math.sign(offset) || 1;

            const xBase = isActive ? 0 : sign * (122 + absOff * 58);
            const zBase = isActive ? 0 : -(absOff * 88 + 40);
            const rotY = isActive ? 0 : -sign * (12 + absOff * 4);
            const scale = isActive ? 1 : Math.max(0.58, 1 - absOff * 0.13);
            const opacity = isActive ? 1 : Math.max(0.28, 1 - absOff * 0.22);

            const w = isActive ? (isDesktop ? 250 : 210) : isDesktop ? 190 : 150;
            const h = isActive ? (isDesktop ? 350 : 300) : isDesktop ? 278 : 228;

            return (
              <div
                key={player.id}
                onClick={() => {
                  if (!isDragging) goTo(i);
                }}
                style={{
                  position: 'absolute',
                  width: w,
                  height: h,
                  marginLeft: -w / 2,
                  marginTop: -h / 2,
                  transform: `translateX(${xBase}px) translateZ(${zBase}px) rotateY(${rotY}deg) scale(${scale})`,
                  transition:
                    'transform 0.42s cubic-bezier(0.25,1,0.5,1), opacity 0.32s ease, width 0.32s ease, height 0.32s ease, margin 0.32s ease',
                  opacity,
                  overflow: 'hidden',
                  cursor: isActive ? 'default' : 'pointer',
                  zIndex: isActive ? 10 : Math.max(1, 5 - absOff),
                  borderRadius: 'var(--r-md)',
                  outline: isActive
                    ? '2px solid #2545cb'
                    : '1px solid var(--border-strong)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${headshotUrl(player.id)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 8%',
                    opacity: isActive ? 1 : 0.68,
                    transition: 'opacity 0.35s ease',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: grad,
                    opacity: isActive ? 0.3 : 0.5,
                    mixBlendMode: 'color',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'transparent',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(11,11,12,0.72)',
                  }}
                />

                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                      border: `1px solid rgba(255,255,255,${isActive ? 0.13 : 0.05})`,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontFamily: 'var(--font-file)',
                    fontSize: '0.55rem',
                    letterSpacing: '0.1em',
                    color: rank <= 3 ? '#b7c6ff' : 'rgba(255,255,255,0.84)',
                    background: 'rgba(10,12,20,0.68)',
                    padding: '3px 8px',
                    borderRadius: 999,
                  }}
                >
                  #{rank}
                </div>

                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: '#2545cb',
                      border: '1px solid rgba(255,255,255,0.7)',
                    }}
                  />
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: isActive ? '0.8rem 0.9rem' : '0.52rem 0.62rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: isActive ? (isDesktop ? '1.42rem' : '1.12rem') : '0.84rem',
                      lineHeight: 1.06,
                      color: 'white',
                      marginBottom: 3,
                      transition: 'font-size 0.32s ease',
                    }}
                  >
                    {player.name}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-file)',
                      fontSize: '0.48rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.72)',
                      marginBottom: 7,
                    }}
                  >
                    {player.team} · {player.position}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-file)',
                        fontWeight: 600,
                        fontSize: isActive ? (isDesktop ? '1.56rem' : '1.18rem') : '0.9rem',
                        color: '#fff',
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'font-size 0.32s ease',
                      }}
                    >
                      {player.biqScore.toFixed(1)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-file)',
                        fontSize: '0.45rem',
                        color: 'rgba(255,255,255,0.62)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      BIQ
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          padding: '0.7rem 1.1rem 0.6rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '0.65rem', padding: '6px 0' }}>
          <div
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - r.left) / r.width;
              goTo(Math.round(pct * (N - 1)));
            }}
            style={{
              position: 'relative',
              height: 3,
              borderRadius: 999,
              background: 'var(--s3)',
              cursor: 'pointer',
            }}
          >
            <div
              ref={sliderFillRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                background: tc,
                width: `${(activeIdx / Math.max(N - 1, 1)) * 100}%`,
                transition: 'background 0.4s ease',
              }}
            />
            <div
              ref={thumbRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: `${(activeIdx / Math.max(N - 1, 1)) * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                borderRadius: 999,
                background: tc,
                border: '2px solid #fff',
                transition: 'background 0.4s ease',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            overflowX: 'auto',
            paddingBottom: 2,
            scrollbarWidth: 'none',
          }}
        >
          {players.map((p, i) => {
            const isA = i === activeIdx;
            const ptc = tierColor(p.biqScore);
            return (
              <button
                key={p.id}
                onClick={() => goTo(i)}
                title={`#${i + 1} ${p.name}`}
                style={{
                  flexShrink: 0,
                  width: isA ? 22 : 7,
                  height: 7,
                  borderRadius: 999,
                  background: isA ? ptc : 'var(--s3)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.22s ease, background 0.22s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          background: '#fff',
          padding: '1.05rem 1.1rem 1.15rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'minmax(0, 1.55fr) minmax(280px, 0.95fr)' : '1fr',
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '0.95rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-file)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                    }}
                  >
                    Rank #{activeIdx + 1} of {N}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 999,
                      color: '#1b34a0',
                      fontFamily: 'var(--font-file)',
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: '#e9edfa',
                    }}
                  >
                    {active.biqTier}
                  </div>
                </div>

                <div
                  className="display"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                    color: 'var(--text)',
                    marginBottom: 8,
                  }}
                >
                  {active.name}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-file)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  {active.team} · {active.position}
                </div>
              </div>

              <Link
                href={`/players/${active.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#fff',
                  background: tc,
                  borderRadius: 'var(--r-md)',
                  padding: '0.58rem 1.05rem',
                  textDecoration: 'none',
                  transition: 'background 0.3s ease, opacity 0.15s',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                }}
              >
                Full profile
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
                gap: '0.42rem',
                marginBottom: '0.95rem',
              }}
            >
              <StatPill label="BIQ" value={active.biqScore} accent />
              <StatPill label="Rank Score" value={active.biqRankScore} accent />
              <StatPill label="Star" value={active.starScore} />
              <StatPill label="Engine" value={active.engineScore} />
              <StatPill label="Burden" value={active.burdenScore} />
              <StatPill label="Creation" value={active.creationScore} />
              <StatPill label="Efficiency" value={active.efficiencyScore} />
              <StatPill label="Impact" value={active.impactScore} />
              <StatPill label="Avail." value={active.availabilityScore} />
            </div>

            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                color: 'var(--text-2)',
                lineHeight: 1.75,
                maxWidth: '78ch',
                borderLeft: '3px solid var(--signal)',
                paddingLeft: '0.85rem',
              }}
            >
              {active.reason}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '0.55rem',
              alignContent: 'start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-file)',
                fontSize: '0.55rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                marginBottom: '0.15rem',
              }}
            >
              Nearby ranks
            </div>

            {neighbors.map((idx) => (
              <NeighborRow
                key={players[idx].id}
                rank={idx + 1}
                player={players[idx]}
                active={idx === activeIdx}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}