// app/teams/page.tsx — COURT PAPER team index: every team ranked by net
// rating. Server component; the list filters client-side in TeamIndex.
export const revalidate = 300;

import { fetchCachedJSON, fetchCurrentSeason } from '@/lib/api';
import { pageMetadata } from '@/lib/site';
import type { TeamLeaderboardEntry } from '@/lib/types';
import { SectionHeader } from '@/components/biq/BiqKit';
import { TeamIndex } from '@/components/TeamIndex';

export const metadata = pageMetadata({
  title: 'NBA teams',
  description: 'Every NBA team ranked by net rating, with record, offense, defense and a dashboard for each.',
  path: '/teams',
});

export default async function TeamsPage() {
  // This page is prerendered, so a backend outage during a build must not
  // fail the build; render the empty state and let revalidation recover it.
  const [teams, season] = await Promise.all([
    fetchCachedJSON<TeamLeaderboardEntry[]>('/api/teams/leaders?limit=30', 300).catch((error) => {
      console.error('Failed to load teams', error);
      return null;
    }),
    fetchCurrentSeason(),
  ]);
  const ranked = [...(teams ?? [])].sort((a, b) => b.netRating - a.netRating);

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">Team index{season ? ` · ${season}` : ''}</p>
        <h1 className="biq-display biq-hero-size" style={{ marginTop: 12, maxWidth: '16ch' }}>
          Every team, ranked by net rating
        </h1>
        <p style={{ marginTop: 18, maxWidth: '60ch', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          Net rating is points scored minus points allowed per 100 possessions, the cleanest single
          read on how good a team has been. Open any team for its full profile and roster.
        </p>
      </section>

      {/* ---------------- THE LIST ---------------- */}
      <section style={{ padding: '0 0 88px' }}>
        <SectionHeader label="Net rating, best first" title={teams ? `All ${ranked.length} teams` : 'Teams'} />
        {teams ? (
          <TeamIndex teams={ranked} />
        ) : (
          <div className="biq-card" style={{ padding: 28, marginTop: 24 }}>
            <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
              Team data didn&apos;t load
            </p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              The stats service isn&apos;t responding. This page retries on its own every few
              minutes.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
