// app/teams/[id]/page.tsx — COURT PAPER team dashboard.
export const revalidate = 300;

import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, fetchCachedJSON, fetchCurrentSeason } from '@/lib/api';
import { pageMetadata } from '@/lib/site';
import { TeamProfile } from '@/lib/types';
import { SectionHeader } from '@/components/biq/BiqKit';
import { RuleGrid, StatCell } from '@/components/biq/StatGrid';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

// Shared by generateMetadata and the page; Next dedupes the identical fetch.
function fetchTeam(id: string) {
  return fetchCachedJSON<TeamProfile>(`/api/teams/${id}`, 300);
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!/^\d+$/.test(params.id)) return { title: 'Team not found' };
  try {
    const team = await fetchTeam(params.id);
    return pageMetadata({
      title: `${team.name} dashboard`,
      description: `${team.name} (${team.conference}, ${team.division}): season record, efficiency profile and roster BIQ.`,
      path: `/teams/${team.id}`,
    });
  } catch {
    return { title: 'Team dashboard' };
  }
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  // The API 422s on non-numeric ids; that's a missing page, not an outage.
  if (!/^\d+$/.test(params.id)) notFound();

  const season = await fetchCurrentSeason();
  let team: TeamProfile;
  try {
    team = await fetchTeam(params.id);
  } catch (error) {
    // Only a real 404 means the team doesn't exist; anything else is an outage.
    if (error instanceof ApiError && error.isNotFound) notFound();
    console.error(`Failed to load team ${params.id}`, error);
    throw error;
  }
  const roster = team.rosterPreview ?? [];
  const alignment = [team.conference, team.division].filter(Boolean).join(' · ');

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">Team dashboard{season ? ` · ${season}` : ''}</p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 28, minWidth: 0 }}>
          <span
            aria-hidden="true"
            className="biq-num"
            style={{
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              width: 'clamp(72px, 10vw, 132px)',
              aspectRatio: '1',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              background: 'var(--panel)',
              fontSize: 'clamp(18px, 2.4vw, 30px)',
              fontWeight: 600,
            }}
          >
            {team.abbreviation}
          </span>
          <div style={{ minWidth: 0 }}>
            <h1 className="biq-display biq-hero-size">{team.name}</h1>
            {alignment ? (
              <p style={{ marginTop: 8, fontSize: 15, color: 'var(--fog)' }}>{alignment}</p>
            ) : null}
          </div>
        </div>

        {team.lineupInsight ? (
          <div
            className="biq-card"
            style={{ marginTop: 32, maxWidth: 860, padding: '20px 24px', borderLeft: '3px solid var(--key)' }}
          >
            <p className="biq-mono" style={{ marginBottom: 10 }}>Team read</p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)' }}>{team.lineupInsight}</p>
          </div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <Link href="/teams" className="biq-btn-ghost">
            All teams
          </Link>
        </div>
      </section>

      {/* ---------------- PROFILE ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Season to date" title="Team profile" />
        <div style={{ marginTop: 24 }}>
          <RuleGrid min={180}>
            {team.stats.map((stat) => (
              <StatCell key={stat.label} {...stat} />
            ))}
          </RuleGrid>
        </div>
      </section>

      {/* ---------------- ROSTER ---------------- */}
      <section style={{ padding: '40px 0 88px' }}>
        <SectionHeader label={`${roster.length} players`} title="Roster" />
        {roster.length > 0 ? (
          <ul className="biq-ledger">
            {roster.map((player) => (
              <li key={player.id} className="biq-row">
                <Link
                  href={`/players/${player.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px minmax(0, 1fr) auto',
                    alignItems: 'center',
                    gap: 20,
                    padding: '14px 8px',
                  }}
                >
                  <SubjectPhoto id={player.id} name={player.name} size={52} />
                  <span style={{ minWidth: 0 }}>
                    <span className="biq-ledger-name">{player.name}</span>
                    <span className="biq-ledger-meta">
                      {[player.number ? `#${player.number}` : '', player.position].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="biq-link" style={{ fontSize: 14 }}>
                    Open profile
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="biq-card" style={{ padding: 28, marginTop: 24 }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              This team&apos;s roster hasn&apos;t been synced yet. Every player is still in
              the <Link href="/players" className="biq-link">player index</Link>.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
