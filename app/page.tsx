// app/page.tsx — COURT PAPER homepage. Same data flow as before:
// server component, fetchCachedJSON, revalidate 300.

export const revalidate = 300;

import Link from 'next/link';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { BiqTicker } from '@/components/BiqTicker';
import { fetchCachedJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MeterBar, SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { HomeMotion } from '@/components/biq/motion/HomeMotion';
import { BiqEngine } from '@/components/biq/motion/BiqEngine';

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
    // 25 is the backend's cap (26+ returns 422). Every tick in the hero
    // instrument is one of these real players, so this sets its density.
    tickerPlayers = await fetchCachedJSON<BIQLeaderboardEntry[]>(
      '/api/players/biq-leaders?limit=25',
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
    <main
      className="biq-page"
      data-anime-root
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
    >
      {/* ---------------- 1. HERO — the dark stage ---------------- */}
      <section className="biq-hero-dark" data-anime="hero" style={{ padding: '44px 0 64px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            alignItems: 'end',
            gap: 40,
          }}
        >
          <div>
            <p className="biq-mono" data-anime="hero-eyebrow" data-anime-hide>
              Basketball Intelligence Quotient · 2025-26
            </p>
            <h1
              className="biq-display biq-hero-size"
              data-anime="hero-headline"
              data-anime-hide
              style={{ marginTop: 16, maxWidth: '13ch' }}
            >
              One number for what a player is worth.
            </h1>
          </div>

          <div>
            <p
              className="biq-hero-copy"
              data-anime="hero-body"
              data-anime-hide
              style={{ maxWidth: '46ch', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}
            >
              BIQ blends workload, creation, efficiency, impact, and availability into a single
              current-season score, then shows its work.
            </p>

            <div data-anime="hero-search" data-anime-hide style={{ maxWidth: 460, marginTop: 4 }}>
              <PlayerSearchBar />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <Link href="/compare?a=2544&b=201939" className="biq-btn" data-anime="hero-cta" data-anime-hide>
                Open a comparison
              </Link>
              <Link href="/players?q=" className="biq-btn-ghost" data-anime="hero-cta" data-anime-hide>
                Browse all players
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ---------------- 2. THE TEARDOWN — the scroll stage ----------------
          A tall section whose sticky child is what the reader watches. Scroll
          across it scrubs the instrument apart and lands the top 20. Both the
          height and the pin are `.js-motion` only, so a no-JS page gets plain
          flow instead of four viewports of nothing. */}
      {heroLeader ? (
        <section className="biq-hero-dark biq-stage" data-anime="stage">
          <div className="biq-stage-pin">
            <BiqEngine players={tickerPlayers} leader={heroLeader} />

          </div>
        </section>
      ) : (
        <section className="biq-hero-dark biq-dark-end" style={{ padding: '0 0 240px' }}>
          <div className="biq-card" style={{ padding: 28 }}>
            <p className="biq-mono">The board</p>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              Leaderboard data is warming up. Search a player to get started.
            </p>
          </div>
        </section>
      )}

      {/* The stage's caption, on the far side of the pin — it reads as the
          board's footer once the teardown has landed. */}
      {heroLeader ? (
        <section className="biq-hero-dark biq-dark-end" style={{ padding: '0 0 240px' }}>
          <div
            data-anime="engine-footer"
            data-anime-hide
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <span className="biq-mono">
              Five components · {tickerPlayers.length} players · live
            </span>
            <Link href="/leaderboard" className="biq-link" style={{ fontSize: 14 }}>
              Full leaderboard →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ---------------- 3. COMPONENT LEADERS ------ */}
      <section style={{ padding: '48px 0' }}>
        <SectionHeader label="Leaders by component" title="Live signals" driven />
        <div
          data-anime="signal-grid"
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
              data-anime="signal-card"
              data-anime-hide
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
                  <span
                    className="biq-num biq-signal"
                    data-anime="count"
                    data-count-to={s.value(s.player)}
                    data-count-decimals={1}
                    style={{ fontSize: 30, fontWeight: 600 }}
                  >
                    {s.value(s.player).toFixed(1)}
                  </span>
                  <div style={{ marginTop: 8 }}>
                    <MeterBar value={s.value(s.player)} driven />
                  </div>
                </>
              ) : (
                <p style={{ marginTop: 16, fontSize: 14, color: 'var(--fog)' }}>No signal on record.</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <BiqTicker players={tickerPlayers.slice(0, 14)} />

      {/* ---------------- 4. WHAT BIQ MEASURES --------------------------- */}
      <section style={{ padding: '56px 0 72px' }}>
        <SectionHeader label="How the score reads" title="What BIQ measures" driven />
        <div
          data-anime="method-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          {METHOD_SECTIONS.map((m) => (
            <div
              key={m.title}
              className="biq-card"
              data-anime="method-card"
              data-anime-hide
              style={{ padding: 24 }}
            >
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

      <HomeMotion />
      <SpeedInsights />
    </main>
  );
}
