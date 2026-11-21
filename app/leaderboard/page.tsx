// app/leaderboard/page.tsx — COURT PAPER leaderboard: the full board in
// three views (ranked list by default, sortable component table, and the
// interactive card stack).
// Reading searchParams keeps this route dynamic; the win is the cached fetch
// below, which spares the backend a leaderboard read on every request.
export const revalidate = 300;

import Link from 'next/link';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { fetchCachedJSON, fetchCurrentSeason, fetchModelSummary } from '@/lib/api';
import { describeGate } from '@/lib/model';
import { pageMetadata } from '@/lib/site';
import { BIQLeaderboardEntry } from '@/lib/types';
import StackedLeaderboard from '@/components/stacked-leaderboard';
import { MeterBar, SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

// Every ?view= is the same ranking, so they all canonicalize to one URL.
export const metadata = pageMetadata({
  title: 'Leaderboard',
  description: 'The current BIQ rankings: the NBA\'s highest-minute players ordered by engine, creation, efficiency and impact.',
  path: '/leaderboard',
});

// List leads: a ranking is read by scanning, and the card stack shows one
// player at a time.
const VIEWS = [
  { key: 'list', label: 'List', href: '/leaderboard' },
  { key: 'table', label: 'Table', href: '/leaderboard?view=table' },
  { key: 'stacked', label: 'Interactive', href: '/leaderboard?view=interactive' },
] as const;

type ViewKey = (typeof VIEWS)[number]['key'];

function parseView(value: string | undefined): ViewKey {
  // "stacked" was the card stack's old key; keep old links working.
  if (value === 'interactive' || value === 'stacked') return 'stacked';
  if (value === 'table') return 'table';
  // "visual" was the card grid the list replaced.
  return 'list';
}

function ViewSwitch({ active }: { active: ViewKey }) {
  return (
    <nav aria-label="Leaderboard view" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {VIEWS.map((view) => (
        <Link
          key={view.key}
          href={view.href}
          className="biq-btn-ghost"
          aria-current={view.key === active ? 'page' : undefined}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}

function ListView({ players }: { players: BIQLeaderboardEntry[] }) {
  return (
    <ol className="biq-ledger">
      {players.map((player, index) => (
        <li key={player.id} className="biq-row">
          <Link href={`/players/${player.id}`} className="biq-ledger-link">
            <span className="biq-rank" style={{ fontSize: 15 }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <SubjectPhoto id={player.id} name={player.name} size={52} />
            <span style={{ minWidth: 0 }}>
              <span className="biq-ledger-name">{player.name}</span>
              <span className="biq-ledger-meta">
                {player.team} · {player.biqTier}
              </span>
              {player.reason ? (
                <span
                  style={{ display: 'block', marginTop: 6, maxWidth: '62ch', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)' }}
                >
                  {player.reason}
                </span>
              ) : null}
            </span>
            <span className="biq-ledger-score">
              <span
                className="biq-num biq-signal"
                style={{ display: 'block', fontSize: 22, fontWeight: 600, textAlign: 'right' }}
              >
                {player.biqRankScore.toFixed(1)}
              </span>
              <span style={{ display: 'block', marginTop: 6 }}>
                <MeterBar value={player.biqRankScore} />
              </span>
              <span className="biq-mono" style={{ display: 'block', marginTop: 6, fontSize: 9, textAlign: 'right' }}>
                Rank score · BIQ {player.biqScore.toFixed(1)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

const TABLE_COLUMNS: { key: string; label: string; value: (p: BIQLeaderboardEntry) => number }[] = [
  { key: 'biq', label: 'BIQ', value: (p) => p.biqScore },
  { key: 'star', label: 'Star', value: (p) => p.starScore },
  { key: 'engine', label: 'Engine', value: (p) => p.engineScore },
  { key: 'burden', label: 'Burden', value: (p) => p.burdenScore },
  { key: 'creation', label: 'Creation', value: (p) => p.creationScore },
  { key: 'efficiency', label: 'Efficiency', value: (p) => p.efficiencyScore },
  { key: 'impact', label: 'Impact', value: (p) => p.impactScore },
  { key: 'avail', label: 'Avail.', value: (p) => p.availabilityScore },
];

const RANK_COLUMN = { key: 'rank', label: 'Rank score', value: (p: BIQLeaderboardEntry) => p.biqRankScore };
const SORTABLE = [RANK_COLUMN, ...TABLE_COLUMNS];

type SortDir = 'desc' | 'asc';

/**
 * Sorting is plain links (?sort=&dir=), so it works without JS and a sorted
 * view can be shared. Best-first is the natural first click for a score, so
 * a new column starts descending and a second click flips it.
 */
function SortHeader({
  column,
  sort,
  dir,
  align = 'right',
}: {
  column: (typeof SORTABLE)[number];
  sort: string;
  dir: SortDir;
  align?: 'left' | 'right';
}) {
  const active = column.key === sort;
  const next: SortDir = active && dir === 'desc' ? 'asc' : 'desc';
  const href =
    column.key === 'rank' && next === 'desc'
      ? '/leaderboard?view=table'
      : `/leaderboard?view=table&sort=${column.key}&dir=${next}`;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}
      style={{ textAlign: align }}
    >
      <Link href={href} scroll={false} className={`biq-sort${active ? ' is-active' : ''}`}>
        {column.label}
        <span aria-hidden="true" className="biq-sort-arrow">
          {active ? (dir === 'desc' ? '↓' : '↑') : '↕'}
        </span>
      </Link>
    </th>
  );
}

function TableView({
  players,
  sort,
  dir,
}: {
  players: BIQLeaderboardEntry[];
  sort: string;
  dir: SortDir;
}) {
  // The # column stays the leaderboard rank whatever the sort, so a re-sorted
  // table still says where each player stands.
  const column = SORTABLE.find((c) => c.key === sort) ?? RANK_COLUMN;
  const rows = players
    .map((player, index) => ({ player, rank: index + 1 }))
    .sort((a, b) => {
      const diff = column.value(b.player) - column.value(a.player);
      return (dir === 'desc' ? diff : -diff) || a.rank - b.rank;
    });

  return (
    <div className="biq-table-scroll" style={{ marginTop: 16 }}>
      <table className="biq-table" style={{ minWidth: 980 }}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col">Team</th>
            <SortHeader column={RANK_COLUMN} sort={column.key} dir={dir} align="left" />
            {TABLE_COLUMNS.map((c) => (
              <SortHeader key={c.key} column={c} sort={column.key} dir={dir} />
            ))}
            <th scope="col" style={{ paddingLeft: 14 }}>Tier</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, rank }) => (
            <tr key={player.id}>
              <td className="biq-rank">{String(rank).padStart(2, '0')}</td>
              <td>
                <Link href={`/players/${player.id}`} className="biq-link" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {player.name}
                </Link>
              </td>
              <td>{player.team}</td>
              <td style={{ minWidth: 150 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="biq-signal" style={{ fontWeight: 600, width: '3.5ch' }}>
                    {player.biqRankScore.toFixed(1)}
                  </span>
                  <span style={{ flex: 1 }}>
                    <MeterBar value={player.biqRankScore} />
                  </span>
                </span>
              </td>
              {TABLE_COLUMNS.map((c) => (
                <td
                  key={c.key}
                  style={{ textAlign: 'right', fontWeight: c.key === column.key ? 600 : undefined }}
                >
                  {c.value(player).toFixed(1)}
                </td>
              ))}
              <td style={{ paddingLeft: 14 }}>
                <span className="biq-chip">{player.biqTier}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { view?: string; sort?: string; dir?: string };
}) {
  const view = parseView(searchParams?.view);

  const [players, season, model] = await Promise.all([
    fetchCachedJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=25', 300),
    fetchCurrentSeason(),
    fetchModelSummary(),
  ]);

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">BIQ leaderboard{season ? ` · ${season}` : ''}</p>
        <h1 className="biq-display biq-hero-size" style={{ marginTop: 12, maxWidth: '16ch' }}>
          The {players.length || 25} most valuable players right now
        </h1>
        <p style={{ marginTop: 18, maxWidth: '62ch', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          Ordered by rank score, which blends a player&apos;s BIQ with how much of an offense they
          actually carry.
          {model
            ? ` Only players with ${describeGate(model)} qualify, so this is a read on established starters, not the whole league.`
            : ' Only high-minute regulars qualify, so this is a read on established starters, not the whole league.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
          <Link href="/model#rank-score" className="biq-link" style={{ fontSize: 14 }}>
            How rank score works
          </Link>
          <Link href="/players" className="biq-link" style={{ fontSize: 14 }}>
            Search every player
          </Link>
        </div>
      </section>

      {/* ---------------- THE BOARD ---------------- */}
      <section style={{ padding: '0 0 88px' }}>
        <SectionHeader
          label={`${players.length} qualified players`}
          title="Rankings"
          action={<ViewSwitch active={view} />}
        />

        {players.length === 0 ? (
          <div className="biq-card" style={{ padding: 28, marginTop: 24 }}>
            <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
              No one has qualified yet
            </p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              The board fills in once players reach the games and minutes gate. Player profiles are
              live in the meantime.
            </p>
          </div>
        ) : view === 'table' ? (
          <TableView
            players={players}
            sort={searchParams?.sort ?? 'rank'}
            dir={searchParams?.dir === 'asc' ? 'asc' : 'desc'}
          />
        ) : view === 'list' ? (
          <ListView players={players} />
        ) : (
          <div style={{ marginTop: 24 }}>
            <StackedLeaderboard players={players} />
          </div>
        )}
      </section>

      <SpeedInsights />
    </main>
  );
}
