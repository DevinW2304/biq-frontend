import Link from 'next/link';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { fetchJSON } from '@/lib/api';
import { SearchPlayerResult } from '@/lib/types';

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? '';
  const results = await fetchJSON<SearchPlayerResult[]>(
    `/api/players/search?q=${encodeURIComponent(q)}`
  );

  return (
    <main className="page-shell space-y-8">
      <section className="card p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Player Search</p>
        <h1 className="mt-2 text-4xl font-bold">Find NBA players</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Search by player name, team, or position. This is the first step toward making BIQ feel like a real analytics product instead of a fixed demo.
        </p>

        <PlayerSearchBar initialValue={q} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            {q ? `Results for "${q}"` : 'Featured search results'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {results.length} player{results.length === 1 ? '' : 's'} found
          </p>
        </div>

        <div className="grid gap-4">
          {results.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="card p-5 transition hover:-translate-y-0.5 hover:border-accent"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{player.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {player.team} · {player.position}
                  </p>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                  Open Dashboard
                </span>
              </div>
            </Link>
          ))}

          {results.length === 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold">No players found</h3>
              <p className="mt-2 text-sm text-muted">
                Try searching for a different player, team, or position.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}