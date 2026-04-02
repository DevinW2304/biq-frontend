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
      className="overflow-hidden border-y"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--s1)',
        padding: '7px 0',
      }}
    >
      <div className="ticker-track">
        {items.map((player, i) => (
          <span key={`${player.id}-${i}`} className="ticker-item">
            <span>{player.name}</span>
            <span className="ticker-val">BIQ</span>
            <span className="ticker-up">{player.biqScore.toFixed(1)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}