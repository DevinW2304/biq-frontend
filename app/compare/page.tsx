import Link from 'next/link';
import { fetchCachedJSON } from '@/lib/api';
import { CompareResponse } from '@/lib/types';
import { StatCard } from '@/components/StatCard';
import { TrendChart } from '@/components/TrendChart';
import { ScoreCard } from '@/components/ScoreCard';
import { ComparePlayerPicker } from '@/components/ComparePlayerPicker';

export const revalidate = 300;

function getAdvantageLabel(a: number, b: number) {
  if (a > b) return 'Player A edge';
  if (b > a) return 'Player B edge';
  return 'Even';
}

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
    <main className="page-shell space-y-10">
      <ComparePlayerPicker />

      {compare && (
        <>
          <section className="card p-6 md:p-7">
            <p className="eyebrow mb-3">Head-to-Head Snapshot</p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                gap: '1rem',
                alignItems: 'end',
              }}
            >
              <div>
                <div className="leader-name" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)' }}>
                  {compare.playerA.name}
                </div>
                <div className="leader-meta">
                  {compare.playerA.team} · {compare.playerA.position}
                </div>
              </div>

              <div
                className="display"
                style={{
                  fontSize: 'clamp(1.2rem, 2.4vw, 2rem)',
                  color: 'var(--gold)',
                  opacity: 0.92,
                }}
              >
                VS
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="leader-name" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.7rem)' }}>
                  {compare.playerB.name}
                </div>
                <div className="leader-meta">
                  {compare.playerB.team} · {compare.playerB.position}
                </div>
              </div>
            </div>

            <p
              className="serif-italic"
              style={{
                fontSize: '0.96rem',
                lineHeight: 1.8,
                color: 'var(--muted)',
                maxWidth: '900px',
                marginTop: '1.25rem',
              }}
            >
              {compare.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="/compare?a=2544&b=201939"
                className="btn btn-ghost btn-animated"
              >
                LeBron vs Curry
              </Link>
              <Link
                href="/compare?a=1629029&b=203999"
                className="btn btn-ghost btn-animated"
              >
                Luka vs Jokic
              </Link>
              <Link
                href="/compare?a=1628369&b=2544"
                className="btn btn-ghost btn-animated"
              >
                Tatum vs LeBron
              </Link>
            </div>
          </section>

          <section>
            <div
              className="grid-ruled"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
            >
              <div className="stat-block">
                <span className="stat-label">{compare.playerA.name} BIQ</span>
                <div className="stat-val gold">{compare.playerA.biqScore.toFixed(1)}</div>
                <div className="stat-sub">{compare.playerA.biqTier}</div>
              </div>

              <div className="stat-block">
                <span className="stat-label">BIQ Advantage</span>
                <div className="stat-val">
                  {Math.abs(compare.playerA.biqScore - compare.playerB.biqScore).toFixed(1)}
                </div>
                <div className="stat-sub">
                  {getAdvantageLabel(compare.playerA.biqScore, compare.playerB.biqScore)}
                </div>
              </div>

              <div className="stat-block">
                <span className="stat-label">{compare.playerB.name} BIQ</span>
                <div className="stat-val teal">{compare.playerB.biqScore.toFixed(1)}</div>
                <div className="stat-sub">{compare.playerB.biqTier}</div>
              </div>
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
                <div className="section-head">
                  <span className="section-title">{compare.playerA.name}</span>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: '1rem',
                  }}
                >
                  {compare.playerA.team} · {compare.playerA.position}
                </p>

                <p className="muted-copy" style={{ marginBottom: '1.25rem' }}>
                  {compare.playerA.insight}
                </p>

                <div
                  className="grid-ruled"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
                >
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
                <div className="section-head">
                  <span className="section-title">{compare.playerB.name}</span>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: '1rem',
                  }}
                >
                  {compare.playerB.team} · {compare.playerB.position}
                </p>

                <p className="muted-copy" style={{ marginBottom: '1.25rem' }}>
                  {compare.playerB.insight}
                </p>

                <div
                  className="grid-ruled"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
                >
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
          <div className="section-head">
            <span className="section-title">Comparison unavailable</span>
          </div>
          <p className="muted-copy">
            The selected players could not be compared right now. Try another matchup.
          </p>
        </section>
      )}
    </main>
  );
}