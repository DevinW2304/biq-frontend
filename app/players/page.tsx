// app/players/page.tsx — COURT PAPER player index: search plus results as
// ranked list rows. Server component; data flow unchanged
// (fetchLiveJSON for searches, fetchCachedJSON leaderboard default).

export const revalidate = 300;

import Link from 'next/link';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { fetchCachedJSON, fetchLiveJSON } from '@/lib/api';
import { SearchPlayerResult, BIQLeaderboardEntry } from '@/lib/types';
import { MeterBar, SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? '').trim();

  const results = q
    ? await fetchLiveJSON<SearchPlayerResult[]>(
        `/api/players/search?q=${encodeURIComponent(q)}`
      )
    : await fetchCachedJSON<BIQLeaderboardEntry[]>(
        '/api/players/biq-leaders?limit=12',
        300
      );

  const countLine = q
    ? `${results.length} active player${results.length === 1 ? '' : 's'} found`
    : `${results.length} leaderboard player${results.length === 1 ? '' : 's'} shown`;

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- SEARCH ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">Player index · 2025-26</p>
        <h1 className="biq-display biq-h2-size" style={{ marginTop: 12 }}>
          Find active NBA players
        </h1>
        <p style={{ marginTop: 14, maxWidth: '60ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          Search current active NBA players. With no search entered, this page shows the current
          BIQ leaderboard so the index stays tied to the model instead of a generic directory.
        </p>
        <div style={{ maxWidth: 460 }}>
          <PlayerSearchBar initialValue={q} />
        </div>
      </section>

      {/* ---------------- RESULTS ---------------- */}
      <section style={{ padding: '0 0 88px' }}>
        <SectionHeader
          label={countLine}
          title={q ? `Results for "${q}"` : 'Current BIQ leaderboard'}
        />

        <ol style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
          {results.map((player, index) => {
            const entry = 'biqRankScore' in player ? (player as BIQLeaderboardEntry) : null;

            return (
              <li key={player.id} className="biq-row">
                <Link
                  href={`/players/${player.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: entry
                      ? '2.5rem 52px 1fr minmax(120px, 200px)'
                      : '2.5rem 52px 1fr auto',
                    alignItems: 'center',
                    gap: 20,
                    padding: '14px 8px',
                  }}
                >
                  <span className="biq-rank" style={{ fontSize: 15 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <SubjectPhoto id={player.id} name={player.name} size={52} />
                  <span style={{ minWidth: 0 }}>
                    <span
                      className="biq-display"
                      style={{ display: 'block', fontSize: 'clamp(17px, 1.8vw, 21px)', fontWeight: 600 }}
                    >
                      {player.name}
                    </span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 13, color: 'var(--fog)' }}>
                      {player.team} · {player.position}
                      {entry ? ` · ${entry.biqTier}` : ''}
                    </span>
                  </span>
                  {entry ? (
                    <span style={{ justifySelf: 'stretch' }}>
                      <span
                        className="biq-num biq-signal"
                        style={{ display: 'block', fontSize: 22, fontWeight: 600, textAlign: 'right' }}
                      >
                        {entry.biqRankScore.toFixed(1)}
                      </span>
                      <span style={{ display: 'block', marginTop: 6 }}>
                        <MeterBar value={entry.biqRankScore} />
                      </span>
                      <span className="biq-mono" style={{ display: 'block', marginTop: 6, fontSize: 9, textAlign: 'right' }}>
                        Rank score
                      </span>
                    </span>
                  ) : (
                    <span className="biq-link" style={{ justifySelf: 'end', fontSize: 14 }}>
                      Open profile
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>

        {results.length === 0 && (
          <div className="biq-card" style={{ padding: 28, marginTop: 24 }}>
            <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
              {q ? 'No active players found' : 'No leaderboard players found'}
            </p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {q
                ? 'Try searching for a current NBA player by name.'
                : 'The BIQ leaderboard is currently unavailable.'}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
