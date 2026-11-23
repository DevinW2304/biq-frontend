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

/** The NBA's headshots are 260 x 190 cutouts on a transparent background. */
const CUTOUT_ASPECT = 260 / 190;

export function SubjectPhoto({
  id,
  name,
  size,
  cutout = false,
}: {
  id: number;
  name: string;
  /** Height in px; also the width, unless `cutout`. */
  size: number;
  /** Show the cutout as it is, at its own proportions, with no frame. */
  cutout?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const framed = !cutout || failed;
  const width = cutout ? Math.round(size * CUTOUT_ASPECT) : size;

  return (
    <div
      style={{
        width,
        height: size,
        overflow: 'hidden',
        flexShrink: 0,
        border: framed ? '1px solid var(--line)' : 0,
        borderRadius: framed ? 'var(--radius)' : 0,
        background: framed ? 'var(--panel)' : 'transparent',
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
          width={width}
          height={size}
          onError={() => setFailed(true)}
          // Fill the box inside its border. Sized to `size`, the reset's
          // max-width squeezed it 2px narrower than tall, and next/image
          // warned on every page with a headshot.
          style={{
            width: '100%',
            height: '100%',
            objectFit: cutout ? 'contain' : 'cover',
            objectPosition: 'center bottom',
            display: 'block',
          }}
        />
      )}
    </div>
  );
}
