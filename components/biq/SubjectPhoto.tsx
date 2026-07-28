// Player headshot: color, rounded, panel background, hairline border.
// Server-component safe (no hooks); import from any page.
import Image from 'next/image';

export function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
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
      }}
    >
      <Image
        src={getPlayerHeadshotUrl(id)}
        alt={`${name} headshot`}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}
