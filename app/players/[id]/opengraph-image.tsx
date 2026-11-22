import { fetchCachedJSON } from '@/lib/api';
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from '@/lib/og';
import type { PlayerProfile } from '@/lib/types';
import { isRated, joinMeta, knownPosition, teamLabel } from '@/lib/format';

export const alt = 'BIQ player profile';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 300;

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const player = await fetchCachedJSON<PlayerProfile>(`/api/players/${params.id}`, 300);
    return await ogCard({
      eyebrow: 'BIQ player profile',
      title: player.name,
      meta: joinMeta(teamLabel(player), knownPosition(player.position)),
      // An ungraded player's 50.0 is a placeholder; leave the score off.
      score: isRated(player) ? { value: player.biqScore, label: player.biqTier || 'BIQ' } : undefined,
    });
  } catch {
    // A share preview should never be a broken image; fall back to the brand card.
    return ogCard({
      eyebrow: 'BIQ player profile',
      title: 'One number for what a player is worth.',
    });
  }
}
