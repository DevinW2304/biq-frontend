// app/page.tsx — COURT PAPER homepage. Same data flow as before:
// server component, fetchCachedJSON, revalidate 300.

export const revalidate = 300;

import Link from 'next/link';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { BiqTicker } from '@/components/BiqTicker';
import { fetchCachedJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MeterBar, ScoreMeter, SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

const METHOD_SECTIONS = [
  {
    title: 'Player dashboards',
    description: 'Recent form, efficiency, usage, splits, and BIQ-driven analytical context.',
  },
  {
    title: 'Deep statistical profiles',
    description: 'Scoring, creation, workload, shot profile, and game logs: one file per player.',
  },
  {
    title: 'BIQ rankings',
    description: 'Players ranked by team usefulness rather than raw box-score totals.',
  },
];

function getTopByMetric(
  players: BIQLeaderboardEntry[],
  metric: (player: BIQLeaderboardEntry) => number,
): BIQLeaderboardEntry | null {
  if (!players.length) return null;
  return players.reduce((best, current) => (metric(current) > metric(best) ? current : best));
}

export default async function HomePage() {
  let tickerPlayers: BIQLeaderboardEntry[] = [];

  try {
    tickerPlayers = await fetchCachedJSON<BIQLeaderboardEntry[]>(
      '/api/players/biq-leaders?limit=12',
      300,
    );
  } catch (error) {
    console.error('Failed to load homepage BIQ data', error);
  }

  const board = tickerPlayers.slice(0, 10);
  const heroLeader = board[0];

  const signals = [
    { label: 'BEST ENGINE', player: getTopByMetric(tickerPlayers, (p) => p.engineScore), value: (p: BIQLeaderboardEntry) => p.engineScore },
    { label: 'BEST CREATION', player: getTopByMetric(tickerPlayers, (p) => p.creationScore), value: (p: BIQLeaderboardEntry) => p.creationScore },
    { label: 'BEST IMPACT', player: getTopByMetric(tickerPlayers, (p) => p.impactScore), value: (p: BIQLeaderboardEntry) => p.impactScore },
  ];

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- 1. HERO ---------------- */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: 48,
          padding: '72px 0 64px',
        }}
      >
        <div>
          <p className="biq-mono">Basketball Intelligence Quotient · 2025-26</p>
          <h1 className="biq-display biq-hero-size" style={{ marginTop: 16, maxWidth: '14ch' }}>
            One number for what a player is worth.
          </h1>
          <p style={{ marginTop: 20, maxWidth: '48ch', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
            BIQ blends workload, creation, efficiency, impact, and availability into a single
            current-season score, then shows its work.
          </p>

          <div style={{ maxWidth: 460 }}>
            <PlayerSearchBar />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
            <Link href="/compare?a=2544&b=201939" className="biq-btn">
              Open a comparison
            </Link>
            <Link href="/players?q=" className="biq-btn-ghost">
              Browse all players
            </Link>
          </div>
        </div>

        {heroLeader ? (
          <Link
            href={`/players/${heroLeader.id}`}
            className="biq-card"
            style={{ display: 'block', padding: 28 }}
          >
            <p className="biq-mono">No. 1 on the board</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '20px 0 24px' }}>
              <SubjectPhoto id={heroLeader.id} name={heroLeader.name} size={88} />
              <div style={{ minWidth: 0 }}>
                <p className="biq-display" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>
                  {heroLeader.name}
                </p>
                <p style={{ marginTop: 4, fontSize: 14, color: 'var(--fog)' }}>
                  {heroLeader.team} · {heroLeader.position}
                </p>
              </div>
            </div>
            <ScoreMeter
              value={heroLeader.biqScore}
              label="BIQ SCORE"
              tier={heroLeader.biqTier || 'On the board'}
              size="xl"
            />
            <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {heroLeader.reason}
            </p>
            <p className="biq-link" style={{ marginTop: 16, fontSize: 14 }}>
              View full profile
            </p>
          </Link>
        ) : (
          <div className="biq-card" style={{ padding: 28 }}>
            <p className="biq-mono">The board</p>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              Leaderboard data is warming up. Search a player to get started.
            </p>
          </div>
        )}
      </section>

      {/* ---------------- 2. THE BOARD (top 10) ------------------ */}
      <section style={{ padding: '48px 0' }}>
        <SectionHeader
          label="Top ten by BIQ"
          title="The board"
          action={
            <Link href="/leaderboard" className="biq-link" style={{ fontSize: 14 }}>
              Full leaderboard
            </Link>
          }
        />
        <ol style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
          {board.map((player, index) => (
            <li key={player.id} className="biq-row">
              <Link
                href={`/players/${player.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5rem 52px 1fr minmax(120px, 200px)',
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
                  <span
                    style={{
                      display: 'block',
                      marginTop: 3,
                      fontSize: 13,
                      color: 'var(--fog)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {player.team} · {player.reason}
                  </span>
                </span>
                <span style={{ justifySelf: 'stretch' }}>
                  <span
                    className="biq-num biq-signal"
                    style={{ display: 'block', fontSize: 22, fontWeight: 600, textAlign: 'right' }}
                  >
                    {player.biqScore.toFixed(1)}
                  </span>
                  <span style={{ display: 'block', marginTop: 6 }}>
                    <MeterBar value={player.biqScore} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- 3. COMPONENT LEADERS ------ */}
      <section style={{ padding: '48px 0' }}>
        <SectionHeader label="Leaders by component" title="Live signals" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          {signals.map((s) => (
            <Link
              key={s.label}
              href={s.player ? `/players/${s.player.id}` : '/players?q='}
              className="biq-card"
              style={{ padding: 24, display: 'block' }}
            >
              <p className="biq-mono">{s.label}</p>
              {s.player ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0 18px' }}>
                    <SubjectPhoto id={s.player.id} name={s.player.name} size={48} />
                    <div style={{ minWidth: 0 }}>
                      <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>{s.player.name}</p>
                      <p style={{ marginTop: 2, fontSize: 13, color: 'var(--fog)' }}>{s.player.team}</p>
                    </div>
                  </div>
                  <span className="biq-num biq-signal" style={{ fontSize: 30, fontWeight: 600 }}>
                    {s.value(s.player).toFixed(1)}
                  </span>
                  <div style={{ marginTop: 8 }}>
                    <MeterBar value={s.value(s.player)} />
                  </div>
                </>
              ) : (
                <p style={{ marginTop: 16, fontSize: 14, color: 'var(--fog)' }}>No signal on record.</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <BiqTicker players={tickerPlayers} />

      {/* ---------------- 4. WHAT BIQ MEASURES --------------------------- */}
      <section style={{ padding: '56px 0 72px' }}>
        <SectionHeader label="How the score reads" title="What BIQ measures" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          {METHOD_SECTIONS.map((m) => (
            <div key={m.title} className="biq-card" style={{ padding: 24 }}>
              <h3 className="biq-display" style={{ fontSize: 19, fontWeight: 600 }}>
                {m.title}
              </h3>
              <p style={{ marginTop: 10, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.7 }}>
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SpeedInsights />
    </main>
  );
}
