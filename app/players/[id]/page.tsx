import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCachedJSON } from '@/lib/api';
import { PlayerProfile } from '@/lib/types';
import { GameLogTable } from '@/components/GameLogTable';
import { SplitTile } from '@/components/SplitTile';
import { StatCard } from '@/components/StatCard';
import { TrendChart } from '@/components/TrendChart';

export const revalidate = 300;

function buildPlayerTagline(player: PlayerProfile) {
  if (player.biqScore >= 90) return 'An elite franchise-level utility profile with top-tier BIQ support.';
  if (player.biqScore >= 80) return 'A high-level team utility profile backed by strong BIQ indicators.';
  if (player.recentFormScore >= 88) return 'Playing at a high level with strong recent form and measurable season impact.';
  return 'A productive season profile with enough detail to support deeper BIQ evaluation.';
}

function getBiqBadge(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Elite Tier', color: 'var(--gold)' };
  if (score >= 80) return { label: 'High Impact', color: 'var(--teal)' };
  if (score >= 70) return { label: 'Solid Tier', color: 'var(--muted)' };
  return { label: 'Developing', color: 'var(--muted)' };
}

function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  let player: PlayerProfile | null = null;

  try {
    player = await fetchCachedJSON<PlayerProfile>(`/api/players/${params.id}`, 300);
  } catch (error) {
    console.error(`Failed to load player ${params.id}`, error);
    notFound();
  }

  if (!player) notFound();

  const headshotUrl = getPlayerHeadshotUrl(player.id);
  const biqBadge = getBiqBadge(player.biqScore);

  return (
    <main className="page-shell" style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Top band */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '1.75rem',
        }}>
          {/* Headshot */}
          <div style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            overflow: 'hidden',
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <Image
              src={headshotUrl}
              alt={`${player.name} headshot`}
              width={96}
              height={96}
              style={{ width: 96, height: 96, objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Name block */}
          <div>
            {/* Badges row */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 99,
                background: 'color-mix(in srgb, var(--gold) 12%, transparent)',
                color: biqBadge.color,
                border: `1px solid color-mix(in srgb, ${biqBadge.color} 30%, transparent)`,
              }}>
                {biqBadge.label}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: 99,
                background: 'var(--s2)',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
              }}>
                {player.position}
              </span>
            </div>

            {/* Player name — no cursive, clean sans */}
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1.1,
              marginBottom: 6,
              fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            }}>
              {player.name}
            </h1>

            {/* Team */}
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 10,
            }}>
              {player.team}
            </p>

            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5, maxWidth: 500 }}>
              {buildPlayerTagline(player)}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{
          padding: '0 1.75rem 1.25rem',
          display: 'flex',
          gap: 8,
        }}>
          <Link href={`/compare?a=${player.id}&b=201939`} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
            Compare Player
          </Link>
          <Link href="/players?q=" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
            ← Back to Search
          </Link>
        </div>

        {/* Metric strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--border)',
        }}>
          {[
            { label: 'BIQ Score', value: player.biqScore.toFixed(1), sub: player.biqTier, highlight: true },
            { label: 'Recent Form', value: player.recentFormScore.toFixed(1), sub: 'Weighted signal' },
            { label: 'Consistency', value: player.consistencyScore.toFixed(1), sub: 'Game-to-game stability' },
          ].map((m, i) => (
            <div key={m.label} style={{
              padding: '1.25rem 1rem',
              borderRight: i < 2 ? '1px solid var(--border)' : undefined,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
                {m.label}
              </p>
              <p style={{
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: m.highlight ? 'var(--gold, #C9A84C)' : 'var(--text)',
                lineHeight: 1,
                marginBottom: 4,
              }}>
                {m.value}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BIQ Breakdown ── */}
      <section style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
        <SectionHeader title="BIQ Breakdown" />
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          BIQ combines availability, efficiency, impact, team context, and box-score burden into one team-utility score.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {(player.biqBreakdown ?? []).map((component) => (
            <div key={component.label} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 36px', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>
                {component.label}
              </span>
              <div style={{ height: 6, background: 'var(--s2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${component.score}%`,
                  background: 'linear-gradient(to right, var(--gold, #C9A84C), color-mix(in srgb, var(--gold, #C9A84C) 60%, var(--teal, #4ECDC4)))',
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                {component.score.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Season Stats ── */}
      <section>
        <SectionHeader title="Core Season Indicators" />
        <div className="grid-ruled" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {(player.stats ?? []).map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* ── Trend ── */}
      <TrendChart data={player.recentTrend ?? []} title="Recent Scoring Trend" />

      {/* ── Insight + Splits ── */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
        <section style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold, #C9A84C)', marginBottom: 8 }}>
            BIQ Insight
          </p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
            What the profile suggests
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>{player.insight}</p>
        </section>

        <section style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Context Splits
          </p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Situational production
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(player.splits ?? []).map((split) => (
              <SplitTile key={split.label} label={split.label} value={split.value} />
            ))}
          </div>
        </section>
      </div>

      {/* ── Analytics blocks ── */}
      {(player.analyticsBlocks ?? []).map((block) => (
        <section key={block.title}>
          <SectionHeader title={block.title} />
          <div className="grid-ruled" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {block.stats.map((stat) => (
              <StatCard key={`${block.title}-${stat.label}`} {...stat} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Game Log ── */}
      <section>
        <SectionHeader title="Game Log" />
        <GameLogTable rows={player.gameLog ?? []} />
      </section>
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <h2 style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
      }}>
        {title}
      </h2>
    </div>
  );
}