export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { CourtBackground } from '@/components/CourtBackground';
import { BiqTicker } from '@/components/BiqTicker';
import { fetchJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';

const features = [
  {
    num: '01',
    title: 'Player Dashboards',
    description: 'Recent form, efficiency, usage, splits, and BIQ-driven analytical context.',
  },
  {
    num: '02',
    title: 'Deep Statistical Profiles',
    description: 'Scoring, creation, workload, shot profile, and game logs — all in one place.',
  },
  {
    num: '03',
    title: 'BIQ Rankings',
    description: 'Rank players by team usefulness rather than raw box-score totals.',
  },
];

type HighlightItem = {
  label: string;
  metricLabel: string;
  accentClass: string;
  player: BIQLeaderboardEntry | null;
  value: number;
};

function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

function getBiqBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'Elite Tier', cls: 'badge-gold' };
  if (score >= 80) return { label: 'High Impact', cls: 'badge-teal' };
  return { label: 'Solid Tier', cls: 'badge-neutral' };
}

function buildBackdropPlayers(players: BIQLeaderboardEntry[]) {
  const safePlayers = players.length ? players : [];
  return [...safePlayers, ...safePlayers, ...safePlayers];
}

function getTopByMetric(
  players: BIQLeaderboardEntry[],
  metric: (player: BIQLeaderboardEntry) => number
): BIQLeaderboardEntry | null {
  if (!players.length) return null;

  return players.reduce((best, current) => {
    if (metric(current) > metric(best)) return current;
    return best;
  });
}

function buildHighlights(players: BIQLeaderboardEntry[]): HighlightItem[] {
  const bestEngine = getTopByMetric(players, (player) => player.engineScore);
  const bestCreation = getTopByMetric(players, (player) => player.creationScore);
  const bestImpact = getTopByMetric(players, (player) => player.impactScore);

  return [
    {
      label: 'Best Engine',
      metricLabel: 'Engine Score',
      accentClass: '',
      player: bestEngine,
      value: bestEngine?.engineScore ?? 0,
    },
    {
      label: 'Best Creation',
      metricLabel: 'Creation Score',
      accentClass: 'highlight-card--teal',
      player: bestCreation,
      value: bestCreation?.creationScore ?? 0,
    },
    {
      label: 'Best Impact',
      metricLabel: 'Impact Score',
      accentClass: 'highlight-card--neutral',
      player: bestImpact,
      value: bestImpact?.impactScore ?? 0,
    },
  ];
}

export default async function HomePage() {
  let biqLeaders: BIQLeaderboardEntry[] = [];
  let tickerPlayers: BIQLeaderboardEntry[] = [];

  try {
    [biqLeaders, tickerPlayers] = await Promise.all([
      fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=3'),
      fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=12'),
    ]);
  } catch (error) {
    console.error('Failed to load homepage BIQ data', error);
  }

  const avgBiq =
    biqLeaders.reduce((sum, player) => sum + player.biqScore, 0) / Math.max(biqLeaders.length, 1);

  const avgEngine =
    biqLeaders.reduce((sum, player) => sum + player.engineScore, 0) / Math.max(biqLeaders.length, 1);

  const avgImpact =
    biqLeaders.reduce((sum, player) => sum + player.impactScore, 0) / Math.max(biqLeaders.length, 1);

  const heroLeader = biqLeaders[0];
  const heroBadge = heroLeader ? getBiqBadge(heroLeader.biqScore) : null;
  const backdropPlayers = buildBackdropPlayers(tickerPlayers.slice(0, 6));
  const highlights = buildHighlights(tickerPlayers);

  return (
    <main className="page-shell space-y-10">
      <section
        className="relative overflow-hidden"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0 }}
      >
        <CourtBackground />

        <div className="hero-motion-layer" aria-hidden="true">
          <div className="hero-dribble-lane">
            <div className="hero-basketball" />
            <div className="hero-basketball-shadow" />
          </div>
        </div>

        <div className="hero-two-col relative z-10">
          <div className="hero-copy">
            <p className="eyebrow mb-4">Basketball Intelligence Quotient</p>

            <h1
              className="display hero-title-glow"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                color: 'var(--text)',
                maxWidth: '14ch',
                lineHeight: 0.93,
                marginBottom: '1.25rem',
              }}
            >
              NBA DATA,
              <br />
              SHARPER
              <br />
              VALUE.
            </h1>

            <p
              className="serif-italic"
              style={{
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--muted)',
                maxWidth: '440px',
                marginBottom: '1.75rem',
              }}
            >
              Player profiles, recent form, efficiency, burden, and BIQ rankings - all you need to evaluate your player
              (Does not inlcude the eye test!)
            </p>

            <div style={{ maxWidth: 420, marginBottom: '1.25rem' }}>
              <PlayerSearchBar />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/compare?a=2544&b=201939" className="btn btn-primary btn-animated">
                Compare Players
              </Link>
              <Link href="/players?q=" className="btn btn-ghost btn-animated">
                Explore All Players
              </Link>
            </div>
          </div>

          <div className="hero-spotlight card animated-surface">
            {backdropPlayers.length > 0 && (
              <div className="hero-spotlight-bg" aria-hidden="true">
                <div className="hero-spotlight-bg-track">
                  {backdropPlayers.map((player, index) => (
                    <div
                      className="hero-spotlight-bg-card"
                      key={`${player.id}-bg-a-${index}`}
                    >
                      <img
                        src={getPlayerHeadshotUrl(player.id)}
                        alt=""
                        width={132}
                        height={520}
                      />
                    </div>
                  ))}
                </div>

                <div className="hero-spotlight-bg-track hero-spotlight-bg-track--alt">
                  {backdropPlayers.map((player, index) => (
                    <div
                      className="hero-spotlight-bg-card"
                      key={`${player.id}-bg-b-${index}`}
                    >
                      <img
                        src={getPlayerHeadshotUrl(player.id)}
                        alt=""
                        width={132}
                        height={520}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {heroLeader && heroBadge ? (
              <>
                <div className="hero-spotlight-content">
                  <div className="hero-spotlight-top">
                    <span className="leader-rank" style={{ marginBottom: 0 }}>
                      Current BIQ Leader
                    </span>
                    <span className={`badge ${heroBadge.cls}`}>{heroBadge.label}</span>
                  </div>

                  <div className="hero-spotlight-player">
                    <div className="hero-spotlight-headshot">
                      <img
                        src={getPlayerHeadshotUrl(heroLeader.id)}
                        alt={`${heroLeader.name} headshot`}
                        width={84}
                        height={84}
                        style={{ width: 84, height: 84, objectFit: 'cover', display: 'block' }}
                      />
                    </div>

                    <div>
                      <div className="leader-name" style={{ fontSize: '2.2rem', marginBottom: 6 }}>
                        {heroLeader.name}
                      </div>
                      <div className="leader-meta" style={{ marginBottom: 0 }}>
                        {heroLeader.team}
                      </div>
                    </div>
                  </div>

                  <p className="hero-spotlight-reason">{heroLeader.reason}</p>

                  <div
                    className="grid-ruled"
                    style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
                  >
                    <div className="stat-block">
                      <span className="stat-label">BIQ</span>
                      <div className="stat-val gold">{heroLeader.biqScore.toFixed(1)}</div>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">Engine</span>
                      <div className="stat-val">{heroLeader.engineScore.toFixed(1)}</div>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">Creation</span>
                      <div className="stat-val">{heroLeader.creationScore.toFixed(1)}</div>
                    </div>
                    <div className="stat-block">
                      <span className="stat-label">Impact</span>
                      <div className="stat-val teal">{heroLeader.impactScore.toFixed(1)}</div>
                    </div>
                  </div>
                </div>

                <div className="hero-spotlight-footer">
                  <span className="section-link" style={{ fontSize: '0.62rem' }}>
                    Top ranked right now
                  </span>
                  <Link href={`/players/${heroLeader.id}`} className="btn btn-ghost">
                    View Profile
                  </Link>
                </div>
              </>
            ) : (
              <div className="muted-copy">No BIQ leader available.</div>
            )}
          </div>
        </div>
      </section>

      <section className="highlights-shell">
        <div className="highlights-grid">
          {highlights.map((item) => (
            <Link
              key={item.label}
              href={item.player ? `/players/${item.player.id}` : '/players?q='}
              className={`highlight-card ${item.accentClass}`.trim()}
            >
              <div className="highlight-card-inner">
                <div className="highlight-topline">
                  <span className="highlight-kicker">{item.label}</span>
                  <span className="highlight-live">Live Signal</span>
                </div>

                {item.player ? (
                  <>
                    <div className="highlight-main">
                      <div className="highlight-headshot">
                        <img
                          src={getPlayerHeadshotUrl(item.player.id)}
                          alt={`${item.player.name} headshot`}
                          width={62}
                          height={62}
                        />
                      </div>

                      <div>
                        <div className="highlight-name">{item.player.name}</div>
                        <div className="highlight-meta">{item.player.team}</div>
                      </div>
                    </div>

                    <div className="highlight-bottom">
                      <div className="highlight-score-wrap">
                        <span className="highlight-score-label">{item.metricLabel}</span>
                        <span className="highlight-score">{item.value.toFixed(1)}</span>
                      </div>

                      <div className="highlight-trail" aria-hidden="true">
                        <span className="highlight-puck" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="muted-copy">No highlight data available.</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BiqTicker players={tickerPlayers} />

      <section>
        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          <div className="stat-block">
            <span className="stat-label">Top 3 Avg. BIQ</span>
            <div className="stat-val gold">{avgBiq.toFixed(1)}</div>
            <div className="stat-sub">Current homepage leaders</div>
          </div>

          <div className="stat-block">
            <span className="stat-label">Top 3 Avg. Engine</span>
            <div className="stat-val">{avgEngine.toFixed(1)}</div>
            <div className="stat-sub">Shot creation + burden signal</div>
          </div>

          <div className="stat-block">
            <span className="stat-label">Top 3 Avg. Impact</span>
            <div className="stat-val teal">{avgImpact.toFixed(1)}</div>
            <div className="stat-sub">Overall influence on team utility</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">BIQ Leaders</span>
          <Link href="/players?q=" className="section-link">
            Browse all →
          </Link>
        </div>

        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {biqLeaders.map((player, index) => {
            const badge = getBiqBadge(player.biqScore);

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="leader-card home-leader-card"
              >
                <div className="leader-rank">
                  #{String(index + 1).padStart(2, '0')} BIQ Leader
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--s2)',
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    <img
                      src={getPlayerHeadshotUrl(player.id)}
                      alt={`${player.name} headshot`}
                      width={52}
                      height={52}
                      style={{ width: 52, height: 52, objectFit: 'cover', display: 'block' }}
                    />
                  </div>

                  <div>
                    <div className="leader-name">{player.name}</div>
                    <div className="leader-meta">{player.team}</div>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                    color: 'var(--muted)',
                    marginBottom: 14,
                  }}
                >
                  {player.reason}
                </p>

                <div className="leader-score-row">
                  <div>
                    <div className="leader-biq-label">BIQ Score</div>
                    <div className="leader-biq">{player.biqScore.toFixed(1)}</div>
                  </div>
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">What BIQ Measures</span>
        </div>

        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          {features.map((f) => (
            <div key={f.num} style={{ padding: '1.25rem' }}>
              <div
                className="display"
                style={{ fontSize: '2.2rem', color: 'var(--faint)', marginBottom: 10 }}
              >
                {f.num}
              </div>
              <div
                className="display"
                style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: 8 }}
              >
                {f.title}
              </div>
              <p className="muted-copy" style={{ fontSize: '0.8rem' }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}