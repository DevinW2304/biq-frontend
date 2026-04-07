import Link from 'next/link';
import { fetchCachedJSON } from '@/lib/api';
import { CompareResponse } from '@/lib/types';
import { StatCard } from '@/components/StatCard';
import { TrendChart } from '@/components/TrendChart';
import { ScoreCard } from '@/components/ScoreCard';
import { ComparePlayerPicker } from '@/components/ComparePlayerPicker';

export const revalidate = 300;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const playerA = searchParams.a?.trim();
  const playerB = searchParams.b?.trim();

  let compare: CompareResponse | null = null;

  if (playerA && playerB) {
    try {
      compare = await fetchCachedJSON<CompareResponse>(
        `/api/compare?player_a=${encodeURIComponent(playerA)}&player_b=${encodeURIComponent(playerB)}`,
        300
      );
    } catch (error) {
      console.error('Failed to load compare data', error);
    }
  }

  return (
    <main className="page-shell space-y-8">
      <ComparePlayerPicker />

      {compare && (
        <>
          <section className="card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">Player Comparison</p>
            <h1 className="mt-2 text-4xl font-bold">
              {compare.playerA.name} vs {compare.playerB.name}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{compare.summary}</p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="/compare?a=2544&b=201939"
                className="rounded-full border border-border px-4 py-2 hover:border-accent"
              >
                LeBron vs Curry
              </Link>
              <Link
                href="/compare?a=1629029&b=203999"
                className="rounded-full border border-border px-4 py-2 hover:border-accent"
              >
                Luka vs Jokic
              </Link>
              <Link
                href="/compare?a=1628369&b=2544"
                className="rounded-full border border-border px-4 py-2 hover:border-accent"
              >
                Tatum vs LeBron
              </Link>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <ScoreCard
              label={`${compare.playerA.name} Form`}
              value={compare.playerA.recentFormScore.toFixed(1)}
              description="Recent form score based on current-season momentum and recent output."
            />
            <ScoreCard
              label={`${compare.playerB.name} Form`}
              value={compare.playerB.recentFormScore.toFixed(1)}
              description="Recent form score based on current-season momentum and recent output."
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-2xl font-semibold">{compare.playerA.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {compare.playerA.team} · {compare.playerA.position}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {compare.playerA.stats.map((stat) => (
                    <StatCard key={`${compare.playerA.id}-${stat.label}`} {...stat} />
                  ))}
                </div>
              </div>

              <TrendChart
                data={compare.playerA.recentTrend}
                title={`${compare.playerA.name} Recent Trend`}
              />
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-2xl font-semibold">{compare.playerB.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {compare.playerB.team} · {compare.playerB.position}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {compare.playerB.stats.map((stat) => (
                    <StatCard key={`${compare.playerB.id}-${stat.label}`} {...stat} />
                  ))}
                </div>
              </div>

              <TrendChart
                data={compare.playerB.recentTrend}
                title={`${compare.playerB.name} Recent Trend`}
              />
            </div>
          </section>
        </>
      )}

      {!compare && playerA && playerB && (
        <section className="card p-6">
          <h2 className="text-2xl font-semibold">Comparison unavailable</h2>
          <p className="mt-3 text-sm text-muted">
            The selected players could not be compared right now. Try another matchup.
          </p>
        </section>
      )}
    </main>
  );
}