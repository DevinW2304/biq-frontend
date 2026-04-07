export const revalidate = 300;

import Image from 'next/image';
import Link from 'next/link';
import { fetchCachedJSON } from '@/lib/api';
import { PlayerProfile } from '@/lib/types';
import { GameLogTable } from '@/components/GameLogTable';
import { SplitTile } from '@/components/SplitTile';
import { StatCard } from '@/components/StatCard';
import { TrendChart } from '@/components/TrendChart';


import { SpeedInsights } from "@vercel/speed-insights/next"

function buildPlayerTagline(player: PlayerProfile) {
  if (player.biqScore >= 90) return 'An elite franchise-level utility profile with top-tier BIQ support.';
  if (player.biqScore >= 80) return 'A high-level team utility profile backed by strong BIQ indicators.';
  if (player.recentFormScore >= 88) return 'Playing at a high level with strong recent form and measurable season impact.';
  return 'A productive season profile with enough detail to support deeper BIQ evaluation.';
}

function getBiqBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'Elite Tier', cls: 'badge-gold' };
  if (score >= 80) return { label: 'High Impact', cls: 'badge-teal' };
  if (score >= 70) return { label: 'Solid Tier', cls: 'badge-neutral' };
  return { label: 'Developing', cls: 'badge-neutral' };
}

function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await fetchCachedJSON<PlayerProfile>(`/api/players/${params.id}`, 300);
  const headshotUrl = getPlayerHeadshotUrl(player.id);
  const biqBadge = getBiqBadge(player.biqScore);

  return (
    <main className="page-shell space-y-8">
      <section className="player-hero-shell" style={{ border: '1px solid var(--border)' }}>
        <div
          style={{
            borderBottom: '1px solid var(--border)',
            padding: '1.75rem 1.75rem 1.5rem',
            background: 'linear-gradient(to right, rgba(201,168,76,0.04), transparent 60%)',
          }}
        >
          <div
            className="player-hero-header-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1.5rem',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--s2)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <Image
                src={headshotUrl}
                alt={`${player.name} headshot`}
                width={120}
                height={120}
                style={{ width: 120, height: 120, objectFit: 'cover', display: 'block' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                <span className={`badge ${biqBadge.cls}`}>{biqBadge.label}</span>
                <span className="badge badge-neutral">{player.position}</span>
              </div>

              <h1
                className="display"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--text)', marginBottom: 6 }}
              >
                {player.name}
              </h1>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginBottom: 12,
                }}
              >
                {player.team}
              </p>

              <p className="muted-copy" style={{ maxWidth: 520 }}>
                {buildPlayerTagline(player)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
            <Link href={`/compare?a=${player.id}&b=201939`} className="btn btn-primary">
              Compare Player
            </Link>
            <Link href="/players?q=" className="btn btn-ghost">
              Back to Search
            </Link>
          </div>
        </div>

        <div
          className="grid-ruled player-metric-strip"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', border: 'none', borderTop: '1px solid var(--border)' }}
        >
          {[
            { label: 'BIQ Score', value: player.biqScore.toFixed(1), sub: player.biqTier, gold: true },
            { label: 'Recent Form', value: player.recentFormScore.toFixed(1), sub: 'Weighted signal' },
            { label: 'Consistency', value: player.consistencyScore.toFixed(1), sub: 'Game-to-game stability' },
          ].map((m) => (
            <div key={m.label} className="stat-block" style={{ background: 'var(--bg)' }}>
              <span className="stat-label">{m.label}</span>
              <p className={`stat-val ${m.gold ? 'gold' : ''}`}>{m.value}</p>
              <p className="stat-sub">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="section-head">
          <span className="section-title">BIQ Breakdown</span>
        </div>
        <p className="muted-copy mb-5">
          BIQ combines availability, efficiency, impact, team context, and box-score burden into one team-utility score.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {player.biqBreakdown.map((component) => (
            <div key={component.label} className="biq-bar-row">
              <span className="biq-bar-label">{component.label}</span>
              <div className="biq-bar-track">
                <div className="biq-bar-fill" style={{ width: `${component.score}%` }} />
              </div>
              <span className="biq-bar-num">{component.score.toFixed(0)}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--faint)',
                  letterSpacing: '0.1em',
                  minWidth: 52,
                  textAlign: 'right',
                  display: 'none',
                }}
                className="md:inline"
              >
                {Math.round(component.weight * 100)}% wt
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="section-title">Core Season Indicators</span>
        </div>
        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
        >
          {player.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <TrendChart data={player.recentTrend} title="Recent Scoring Trend" />

      <section className="player-insight-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1.2fr 0.8fr' }}>
        <div className="card-ruled">
          <p className="eyebrow mb-3">BIQ Insight</p>
          <h2 className="display" style={{ fontSize: '1.5rem', marginBottom: '0.875rem' }}>
            What the profile suggests
          </h2>
          <p className="muted-copy">{player.insight}</p>
        </div>

        <div className="card p-5">
          <p className="eyebrow mb-3">Context Splits</p>
          <h2 className="display" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Situational production
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {player.splits.map((split) => (
              <SplitTile key={split.label} label={split.label} value={split.value} />
            ))}
          </div>
        </div>
      </section>

      {player.analyticsBlocks.map((block) => (
        <section key={block.title}>
          <div className="section-head">
            <span className="section-title">{block.title}</span>
          </div>
          <div
            className="grid-ruled"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
          >
            {block.stats.map((stat) => (
              <StatCard key={`${block.title}-${stat.label}`} {...stat} />
            ))}
          </div>
        </section>
      ))}

      <section>
        <div className="section-head">
          <span className="section-title">Game Log</span>
        </div>
        <GameLogTable rows={player.gameLog} />
      </section>
    </main>
  );
}