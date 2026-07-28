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
      {/* Live label: key blue marks live data */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          background: 'var(--key)',
          color: '#fff',
          fontFamily: 'var(--font-file)',
          fontWeight: 600,
          fontSize: '0.55rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '3px 12px',
          borderRadius: 999,
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
                fontFamily: 'var(--font-file)',
                fontSize: '0.6rem',
                fontWeight: 500,
                letterSpacing: '0.14em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
              }}
            >
              BIQ
            </span>
            <span className="ticker-up" style={{ fontFamily: 'var(--font-file)', fontSize: '0.85rem' }}>
              {player.biqScore.toFixed(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}