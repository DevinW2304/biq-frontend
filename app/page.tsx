// app/page.tsx — COURT PAPER homepage. Same data flow as before:
// server component, fetchCachedJSON, revalidate 300.

export const revalidate = 300;

import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { BiqTicker } from '@/components/BiqTicker';
import { fetchCachedJSON, fetchCurrentSeason } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MeterBar, SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { JsonLd } from '@/components/JsonLd';
import { DarkNavSwitch } from '@/components/biq/DarkNavSwitch';

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

export const metadata: Metadata = {
  title: { absolute: 'BIQ // Basketball Intelligence' },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'BIQ // Basketball Intelligence',
    description: SITE_DESCRIPTION,
    url: '/',
  },
};

// Lets search engines offer a sitelinks search box that lands on /players.
const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/players?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default async function HomePage() {
  const season = await fetchCurrentSeason();
  let tickerPlayers: BIQLeaderboardEntry[] = [];

  try {
    // 25 is the backend's cap (26+ returns 422). The board shows the top 20;
    // the component leaders below are picked from all 25.
    tickerPlayers = await fetchCachedJSON<BIQLeaderboardEntry[]>(
      '/api/players/biq-leaders?limit=25',
      300,
    );
  } catch (error) {
    console.error('Failed to load homepage BIQ data', error);
  }

  const board = tickerPlayers.slice(0, 20);

  const signals = [
    { label: 'BEST ENGINE', player: getTopByMetric(tickerPlayers, (p) => p.engineScore), value: (p: BIQLeaderboardEntry) => p.engineScore },
    { label: 'BEST CREATION', player: getTopByMetric(tickerPlayers, (p) => p.creationScore), value: (p: BIQLeaderboardEntry) => p.creationScore },
    { label: 'BEST IMPACT', player: getTopByMetric(tickerPlayers, (p) => p.impactScore), value: (p: BIQLeaderboardEntry) => p.impactScore },
  ];

  return (
    <main
      className="biq-page biq-home"
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
    >
      <JsonLd data={WEBSITE_JSON_LD} />

      {/* ---------------- 1. HERO — the dark stage ---------------- */}
      <section className="biq-hero-dark" style={{ padding: '44px 0 64px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            alignItems: 'end',
            gap: 40,
          }}
        >
          <div>
            <p className="biq-mono">
              Basketball Intelligence Quotient{season ? ` · ${season}` : ''}
            </p>
            <h1
              className="biq-display biq-hero-size"
              style={{ marginTop: 16, maxWidth: '13ch' }}
            >
              One number for what a player is worth.
            </h1>
          </div>

          <div>
            <p
              className="biq-hero-copy"
              style={{ maxWidth: '46ch', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}
            >
              BIQ blends workload, creation, efficiency, impact, and availability into a single
              current-season score, then shows its work.
            </p>

            <div style={{ maxWidth: 460, marginTop: 4 }}>
              <PlayerSearchBar />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <Link href="/compare?a=2544&b=201939" className="biq-btn">
                Open a comparison
              </Link>
              <Link href="/players" className="biq-btn-ghost">
                Browse all players
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* ---------------- 2. THE BOARD — top 20, still on the dark stage ----------------
          Ordered by rank score (the leaderboard's order), so rank score is the
          headline number; BIQ alone would read out of order down the list. */}
      {board.length ? (
        <section className="biq-hero-dark biq-dark-end" style={{ padding: '0 0 240px' }}>
          <div className="biq-board-head">
            <p id="biq-board-label" className="biq-mono">
              Top {board.length} by rank score
            </p>
            <Link href="/leaderboard" className="biq-link" style={{ fontSize: 14 }}>
              Full leaderboard →
            </Link>
          </div>
          <ol className="biq-board-rows" aria-labelledby="biq-board-label">
            {board.map((p, i) => (
              <li key={p.id} className="biq-board-row">
                <Link href={`/players/${p.id}`} className="biq-board-link">
                  <span className="biq-mono biq-board-rank">{String(i + 1).padStart(2, '0')}</span>
                  <span className="biq-board-name">{p.name}</span>
                  <span className="biq-mono biq-board-team">{p.team}</span>
                  <span className="biq-board-score">
                    <span className="biq-num">{p.biqRankScore.toFixed(1)}</span>
                    <span className="biq-mono biq-board-biq">BIQ {p.biqScore.toFixed(1)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
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
              href={s.player ? `/players/${s.player.id}` : '/players'}
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
                  <span
                    className="biq-num biq-signal"
                    style={{ fontSize: 30, fontWeight: 600 }}
                  >
                    {s.value(s.player).toFixed(1)}
                  </span>
                  <div style={{ marginTop: 8 }}>
                    <MeterBar value={s.value(s.player)} still />
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
            <div
              key={m.title}
              className="biq-card"
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

      <DarkNavSwitch />
      <SpeedInsights />
    </main>
  );
}
