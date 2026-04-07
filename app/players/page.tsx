import Link from 'next/link';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { fetchCachedJSON, fetchLiveJSON } from '@/lib/api';
import { SearchPlayerResult, BIQLeaderboardEntry } from '@/lib/types';

import { SpeedInsights } from "@vercel/speed-insights/next"
export const revalidate = 300;

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

  return (
    <main className="page-shell space-y-8">
      <section className="card p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Player Search</p>
        <h1 className="mt-2 text-4xl font-bold">Find active NBA players</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Search current active NBA players only. When no search is entered, this page defaults
          to the current BIQ leaderboard so the player index feels tied to the model instead of a
          generic directory.
        </p>

        <PlayerSearchBar initialValue={q} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            {q ? `Results for "${q}"` : 'Current BIQ leaderboard players'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {results.length}{' '}
            {q
              ? `active player${results.length === 1 ? '' : 's'} found`
              : `leaderboard player${results.length === 1 ? '' : 's'} shown`}
          </p>
        </div>

        <div className="grid gap-4">
          {results.map((player) => {
            const isLeaderboardEntry = 'biqRankScore' in player;

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="card p-5 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{player.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {player.team} · {player.position}
                    </p>

                    {isLeaderboardEntry && (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-accent">
                        BIQ Leaderboard · {(player as BIQLeaderboardEntry).biqTier}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isLeaderboardEntry && (
                      <div className="text-right">
                        <div className="text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                          Rank Score
                        </div>
                        <div className="text-lg font-semibold text-accent">
                          {(player as BIQLeaderboardEntry).biqRankScore.toFixed(1)}
                        </div>
                      </div>
                    )}

                    <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                      Open Dashboard
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {results.length === 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold">
                {q ? 'No active players found' : 'No leaderboard players found'}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {q
                  ? 'Try searching for a current NBA player by name.'
                  : 'The BIQ leaderboard is currently unavailable.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}