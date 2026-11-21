// app/players/page.tsx — COURT PAPER player index: search, or with no search
// every active player A–Z. Both come from the paged /api/players directory.

export const revalidate = 300;

import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';
import { fetchCachedJSON, fetchCurrentSeason } from '@/lib/api';
import { PlayerDirectoryPage } from '@/lib/types';

const PAGE_SIZE = 50;

function pageHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/players?${query}` : '/players';
}

import { SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  // Search results are thin, near-duplicate pages; keep them out of the index
  // but let crawlers follow through to the profiles.
  return pageMetadata({
    title: 'NBA player index',
    description: 'Search every active NBA player and open their BIQ profile.',
    path: '/players',
    noindex: Boolean(searchParams.q?.trim()),
  });
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = (searchParams.q ?? '').trim();
  const page = Math.max(1, Math.floor(Number(searchParams.page)) || 1);
  const season = await fetchCurrentSeason();

  // One directory call serves both modes: a name search, or (q empty) the
  // whole active list A–Z, so "Browse all players" really browses.
  const directory = await fetchCachedJSON<PlayerDirectoryPage>(
    `/api/players?q=${encodeURIComponent(q)}&offset=${(page - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}`,
    300
  );
  const results = directory.items;
  const total = directory.total;
  const offset = directory.offset;

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const countLine = q
    ? `${total} active player${total === 1 ? '' : 's'} found`
    : `${total} active players, A–Z`;

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- SEARCH ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">Player index{season ? ` · ${season}` : ''}</p>
        <h1 className="biq-display biq-h2-size" style={{ marginTop: 12 }}>
          Find active NBA players
        </h1>
        <p style={{ marginTop: 14, maxWidth: '60ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          Search by name, or browse every active player below. For who is playing best right now,
          see the <Link href="/leaderboard" className="biq-link">leaderboard</Link>.
        </p>
        <div style={{ maxWidth: 460 }}>
          <PlayerSearchBar initialValue={q} />
        </div>
      </section>

      {/* ---------------- RESULTS ---------------- */}
      <section style={{ padding: '0 0 88px' }}>
        <SectionHeader
          label={countLine}
          title={q ? `Results for "${q}"` : 'All active players'}
        />

        <ol className="biq-ledger">
          {results.map((player, index) => (
            <li key={player.id} className="biq-row">
              <Link href={`/players/${player.id}`} className="biq-ledger-link">
                <span className="biq-rank" style={{ fontSize: 15 }}>
                  {String(offset + index + 1).padStart(2, '0')}
                </span>
                <SubjectPhoto id={player.id} name={player.name} size={52} />
                <span style={{ minWidth: 0 }}>
                  <span className="biq-ledger-name">{player.name}</span>
                  <span className="biq-ledger-meta">
                    {player.team} · {player.position} ·{' '}
                    {player.gamesPlayed > 0
                      ? `${player.gamesPlayed} game${player.gamesPlayed === 1 ? '' : 's'}`
                      : 'No games yet'}
                  </span>
                </span>
                <span className="biq-link biq-ledger-score" style={{ fontSize: 14, textAlign: 'right' }}>
                  Open profile
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {pageCount > 1 && (
          <nav
            aria-label="Search results pages"
            className="biq-mono"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 24 }}
          >
            {page > 1 ? (
              <Link href={pageHref(q, page - 1)} className="biq-link">Previous</Link>
            ) : (
              <span />
            )}
            <span>
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <Link href={pageHref(q, page + 1)} className="biq-link">Next</Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        {results.length === 0 && (
          <div className="biq-card" style={{ padding: 28, marginTop: 24 }}>
            <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
              {q ? 'No active players found' : 'No players found'}
            </p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {q
                ? 'Try searching for a current NBA player by name.'
                : 'The player directory is unavailable right now.'}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
