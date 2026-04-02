'use client';

import { BIQLeaderboardEntry } from '@/lib/types';

interface BiqTickerProps {
  players: BIQLeaderboardEntry[];
}

export function BiqTicker({ players }: BiqTickerProps) {
  if (!players?.length) return null;

  const items = [...players, ...players];

  return (
    <div
      className="ticker-wrapper"
      style={{
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--s1)',
        position: 'relative',
      }}
    >
      {/* Fade edges */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 80,
          background: 'linear-gradient(90deg, var(--s1), transparent)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 80,
          background: 'linear-gradient(-90deg, var(--s1), transparent)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* Label pill */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          background: 'var(--gold)',
          color: '#060709',
          fontFamily: 'var(--font-condensed)',
          fontWeight: 800,
          fontSize: '0.55rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          padding: '3px 10px',
          pointerEvents: 'none',
        }}
      >
        Live BIQ
      </div>

      <div className="ticker-track">
        {items.map((player, i) => (
          <span key={`${player.id}-${i}`} className="ticker-item">
            <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{player.name}</span>
            <span
              className="ticker-sep"
              style={{
                color: 'var(--faint)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
              }}
            >
              ·
            </span>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
              }}
            >
              BIQ
            </span>
            <span className="ticker-up" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.04em' }}>
              {player.biqScore.toFixed(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}