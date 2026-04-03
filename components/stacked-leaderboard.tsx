'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { Spring } from '@/lib/spring';
import { BIQLeaderboardEntry } from '@/lib/types';

// ─── constants ────────────────────────────────────────────────────────────────
const VISIBLE_SIDE = 3;

const GRADIENTS = [
  'linear-gradient(160deg,rgba(214,178,94,0.55) 0%,rgba(180,80,40,0.30) 100%)',
  'linear-gradient(160deg,rgba(56,189,248,0.50) 0%,rgba(99,55,255,0.30) 100%)',
  'linear-gradient(160deg,rgba(168,85,247,0.50) 0%,rgba(236,72,153,0.30) 100%)',
  'linear-gradient(160deg,rgba(16,185,129,0.48) 0%,rgba(56,189,248,0.30) 100%)',
  'linear-gradient(160deg,rgba(236,72,153,0.50) 0%,rgba(245,158,11,0.30) 100%)',
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function headshotUrl(id: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`;
}

function tierColor(score: number): string {
  if (score >= 90) return '#D6B25E';
  if (score >= 80) return '#38BDF8';
  if (score >= 70) return '#A855F7';
  return '#6B7280';
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
        background: accent ? 'rgba(214,178,94,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${accent ? 'rgba(214,178,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.46rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: accent ? 'rgba(214,178,94,0.82)' : 'rgba(255,255,255,0.56)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          lineHeight: 1,
          color: accent ? '#D6B25E' : 'white',
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
        color: 'white',
        border: `1px solid ${active ? `${tc}44` : 'rgba(255,255,255,0.07)'}`,
        background: active ? `${tc}12` : 'rgba(255,255,255,0.025)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          color: active ? tc : 'rgba(255,255,255,0.78)',
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
            lineHeight: 1.05,
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {player.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.44rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.50)',
            marginTop: 4,
          }}
        >
          {player.team} · {player.position}
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
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
        background: '#07080f',
        color: 'white',
        userSelect: 'none',
        isolation: 'isolate',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 1.1rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(4,5,12,0.5)',
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
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: activeIdx === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.88)',
              cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
              borderRadius: 2,
            }}
          >
            ‹
          </button>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              letterSpacing: '0.04em',
              lineHeight: 1,
              color: tc,
              transition: 'color 0.3s ease',
              minWidth: 36,
              textAlign: 'center',
            }}
          >
            #{activeIdx + 1}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.48rem',
              color: 'rgba(255,255,255,0.44)',
              letterSpacing: '0.12em',
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
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: activeIdx === N - 1 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.88)',
              cursor: activeIdx === N - 1 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
              borderRadius: 2,
            }}
          >
            ›
          </button>
        </div>

        <div
          style={{
            fontSize: '0.46rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)',
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
          background: `radial-gradient(ellipse 54% 62% at 50% 58%, ${tc}16 0%, transparent 72%)`,
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
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: isActive ? 'default' : 'pointer',
                  zIndex: isActive ? 10 : Math.max(1, 5 - absOff),
                  outline: isActive
                    ? `1px solid ${ptc}55`
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isActive
                    ? `0 34px 72px rgba(0,0,0,0.72), 0 0 0 1px ${ptc}22, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : `0 10px 24px rgba(0,0,0,0.42)`,
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
                    background: 'linear-gradient(to bottom, rgba(4,5,12,0.30) 0%, transparent 24%)',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to bottom, transparent 20%, rgba(4,5,12,0.72) 52%, rgba(4,5,12,0.985) 100%)',
                  }}
                />

                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 12,
                    border: `1px solid rgba(255,255,255,${isActive ? 0.13 : 0.05})`,
                    pointerEvents: 'none',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.14em',
                    color: rank <= 3 ? ptc : 'rgba(255,255,255,0.84)',
                    background: 'rgba(4,5,12,0.68)',
                    padding: '3px 7px',
                    backdropFilter: 'blur(8px)',
                    border: rank <= 3 ? `1px solid ${ptc}44` : '1px solid rgba(255,255,255,0.09)',
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
                      borderRadius: '50%',
                      background: ptc,
                      boxShadow: `0 0 12px ${ptc}`,
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
                      textShadow: '0 2px 10px rgba(0,0,0,0.7)',
                    }}
                  >
                    {player.name}
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.42rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.62)',
                      marginBottom: 7,
                    }}
                  >
                    {player.team} · {player.position}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: isActive ? (isDesktop ? '1.56rem' : '1.18rem') : '0.9rem',
                        color: ptc,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                        transition: 'font-size 0.32s ease',
                      }}
                    >
                      {player.biqScore.toFixed(1)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.4rem',
                        color: 'rgba(255,255,255,0.52)',
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
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(4,5,12,0.6)',
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
              background: 'rgba(255,255,255,0.1)',
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
                background: `linear-gradient(90deg, ${tc}, rgba(255,255,255,0.35))`,
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
                borderRadius: '50%',
                background: tc,
                border: '2px solid rgba(255,255,255,0.85)',
                boxShadow: `0 0 14px ${tc}99`,
                transition: 'background 0.4s ease, box-shadow 0.4s ease',
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
                  borderRadius: isA ? 3.5 : '50%',
                  background: isA ? ptc : 'rgba(255,255,255,0.16)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width 0.22s ease, background 0.22s ease, box-shadow 0.22s ease',
                  boxShadow: isA ? `0 0 8px ${ptc}88` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(4,5,12,0.92)',
          backdropFilter: 'blur(20px)',
          padding: '1.05rem 1.1rem 1.15rem',
          marginTop: -8,
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
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.46)',
                    }}
                  >
                    Rank #{activeIdx + 1} of {N}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      border: `1px solid ${tc}44`,
                      color: tc,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.48rem',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      background: `${tc}12`,
                      transition:
                        'color 0.3s ease, border-color 0.3s ease, background 0.3s ease',
                    }}
                  >
                    {active.biqTier}
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem, 3vw, 2.35rem)',
                    lineHeight: 1,
                    letterSpacing: '0.03em',
                    color: tc,
                    marginBottom: 8,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {active.name}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.54rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.62)',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#07080f',
                  background: tc,
                  padding: '0.58rem 1.05rem',
                  textDecoration: 'none',
                  transition: 'background 0.3s ease, opacity 0.15s',
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                }}
              >
                Full Profile →
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
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '0.88rem',
                color: 'rgba(255,255,255,0.78)',
                lineHeight: 1.75,
                maxWidth: '78ch',
                borderLeft: `2px solid ${tc}44`,
                paddingLeft: '0.85rem',
                transition: 'border-color 0.3s ease',
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
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.40)',
                marginBottom: '0.15rem',
              }}
            >
              Nearby Ranks
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