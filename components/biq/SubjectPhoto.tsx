// Player headshot: color, rounded, panel background, hairline border.
// A client component only so it can fall back to initials when the NBA CDN
// has no headshot (rookies and two-way players often don't), instead of the
// browser's broken-image icon. Safe to render from server components.
'use client';

import { useState } from 'react';
import Image from 'next/image';

export function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s'-]/gu, '').split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

export function SubjectPhoto({
  id,
  name,
  size,
}: {
  id: number;
  name: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        background: 'var(--panel)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {failed ? (
        <span
          role="img"
          aria-label={`${name} (no headshot)`}
          className="biq-mono"
          style={{ fontSize: Math.max(10, Math.round(size * 0.3)), letterSpacing: '0.04em', color: 'var(--fog)' }}
        >
          {initials(name)}
        </span>
      ) : (
        <Image
          src={getPlayerHeadshotUrl(id)}
          alt={`${name} headshot`}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
    </div>
  );
}
