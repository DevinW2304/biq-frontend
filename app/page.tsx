// app/page.tsx — the homepage: the headline and search beside BIQ's starting
// five, then the top 20, the ticker, and a link to how BIQ works. Server
// component, fetchCachedJSON, revalidate 300.

export const revalidate = 300;

import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { BiqTicker } from '@/components/BiqTicker';
import { fetchCachedJSON, fetchSeasonInfo } from '@/lib/api';
import { formatShortDate } from '@/lib/format';
import { BIQLeaderboardEntry } from '@/lib/types';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { JsonLd } from '@/components/JsonLd';
import { StartingFive } from '@/components/StartingFive';
import { startingFive } from '@/lib/lineup';

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

/**
 * Every player who meets the leaderboard bar, best first. The starting five is
 * picked from all of them; a backend from before the cap went to 150 answers
 * that with a 422, so fall back to the top 25 rather than an empty page.
 */
async function loadLeaders(): Promise<BIQLeaderboardEntry[]> {
  for (const limit of [150, 25]) {
    try {
      return await fetchCachedJSON<BIQLeaderboardEntry[]>(`/api/players/biq-leaders?limit=${limit}`, 300);
    } catch (error) {
      console.error(`Failed to load the homepage leaders (limit ${limit})`, error);
    }
  }
  return [];
}

export default async function HomePage() {
  const seasonInfo = await fetchSeasonInfo();
  const season = seasonInfo?.season ?? null;
  const dataThrough = formatShortDate(seasonInfo?.dataThrough);
  const leaders = await loadLeaders();
  const board = leaders.slice(0, 20);
  const five = leaders.length ? startingFive(leaders) : null;
  // Open on the two players at the top right now, not a fixed pairing.
  const compareHref =
    board.length >= 2 ? `/compare?a=${board[0].id}&b=${board[1].id}` : '/compare?a=2544&b=201939';

  return (
    <main
      className="biq-page"
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
    >
      <JsonLd data={WEBSITE_JSON_LD} />

      {/* ---------------- 1. HERO: the pitch and search | the starting five ---------------- */}
      <section className="biq-home-hero">
        <div className="biq-home-pitch">
          {season && (
            <p className="biq-home-dateline">
              <strong>The {season.replace('-', '–')} season</strong>
              {dataThrough ? `, through games of ${dataThrough}` : ''}
            </p>
          )}
          <h1 className="biq-display biq-home-headline">One number for what a player is worth.</h1>
          <p className="biq-home-dek">
            BIQ blends workload, creation, efficiency, impact and availability into one current-season
            score, and shows its work.
          </p>

          <div style={{ maxWidth: 460, marginTop: 4 }}>
            <PlayerSearchBar />
          </div>

          <p className="biq-home-links">
            <Link href={compareHref} className="biq-home-link">
              Compare two players
            </Link>
            <Link href="/players" className="biq-home-link">
              Browse every player
            </Link>
          </p>
        </div>

        {five && (
          <StartingFive slots={five.slots} dataThrough={dataThrough} />
        )}
      </section>

      {/* ---------------- 2. THE BOARD — top 20 ----------------
          Ordered by rank score (the leaderboard's order), so rank score is the
          headline number; BIQ alone would read out of order down the list. */}
      {board.length ? (
        <section style={{ padding: '0 0 72px' }}>
          <div className="biq-board-head">
            <h2 id="biq-board-label" className="biq-display biq-board-title">
              The top {board.length} by rank score
            </h2>
            <Link href="/leaderboard" className="biq-home-link">
              Full leaderboard
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
        <section style={{ padding: '0 0 72px' }}>
          <div className="biq-card" style={{ padding: 28 }}>
            <p className="biq-mono">The board</p>
            <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              Leaderboard data is warming up. Search a player to get started.
            </p>
          </div>
        </section>
      )}

      <BiqTicker players={leaders.slice(0, 14)} />

      {/* ---------------- 3. HOW IT WORKS ---------------- */}
      <p style={{ padding: '40px 0 72px', fontSize: 15 }}>
        <Link href="/model" className="biq-home-link">
          How BIQ works
        </Link>
      </p>

      <SpeedInsights />
    </main>
  );
}
