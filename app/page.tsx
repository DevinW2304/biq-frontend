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

function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

function getBiqBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'Elite Tier', cls: 'badge-gold' };
  if (score >= 80) return { label: 'High Impact', cls: 'badge-teal' };
  return { label: 'Solid Tier', cls: 'badge-neutral' };
}

export default async function HomePage() {
  const [biqLeaders, tickerPlayers] = await Promise.all([
    fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=3'),
    fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=12'),
  ]);

  const avgBiq =
    biqLeaders.reduce((sum, player) => sum + player.biqScore, 0) / Math.max(biqLeaders.length, 1);

  const avgEngine =
    biqLeaders.reduce((sum, player) => sum + player.engineScore, 0) / Math.max(biqLeaders.length, 1);

  const avgImpact =
    biqLeaders.reduce((sum, player) => sum + player.impactScore, 0) / Math.max(biqLeaders.length, 1);

  const heroLeader = biqLeaders[0];
  const heroBadge = heroLeader ? getBiqBadge(heroLeader.biqScore) : null;

  return (
    <main className="page-shell space-y-10">
      <section
        className="relative overflow-hidden"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0 }}
      >
        <CourtBackground />

        <div className="hero-two-col relative z-10 animate-enter">
          <div className="hero-copy animate-stagger">
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
              Player profiles, recent form, efficiency, burden, and BIQ rankings — built for analysts,
              not just fans.
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
            {heroLeader && heroBadge ? (
              <>
                <div>
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
              <Link key={player.id} href={`/players/${player.id}`} className="leader-card home-leader-card">
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
