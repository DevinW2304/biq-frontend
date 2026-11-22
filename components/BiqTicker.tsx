'use client';

import { BIQLeaderboardEntry } from '@/lib/types';

interface BiqTickerProps {
  players: BIQLeaderboardEntry[];
}

export function BiqTicker({ players }: BiqTickerProps) {
  if (!players?.length) return null;

  // The list runs twice so the loop is seamless; the second copy is only
  // there for the animation, so screen readers skip it.
  const items = [...players, ...players];

  return (
    <div className="ticker-wrapper">
      {/* The label holds its own cell at the left edge, so the names scroll
          beside it rather than underneath it. */}
      <div className="ticker-label">
        <span className="ticker-label-pill">Live BIQ</span>
      </div>

      <div className="ticker-viewport">
        <div className="ticker-track">
          {items.map((player, i) => (
            <span
              key={`${player.id}-${i}`}
              className="ticker-item"
              aria-hidden={i >= players.length ? true : undefined}
            >
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
    </div>
  );
}
