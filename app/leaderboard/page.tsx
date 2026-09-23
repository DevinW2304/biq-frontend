// app/leaderboard/page.tsx — COURT PAPER leaderboard: the full board in
// three views (interactive stack, ranked list, component table).
// Reading searchParams keeps this route dynamic; the win is the cached fetch
// below, which spares the backend a leaderboard read on every request.
export const revalidate = 300;

import Link from 'next/link';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { fetchCachedJSON, fetchCurrentSeason, fetchModelSummary } from '@/lib/api';
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

const VIEWS = [
  { key: 'stacked', label: 'Interactive', href: '/leaderboard' },
  { key: 'list', label: 'List', href: '/leaderboard?view=list' },
  { key: 'table', label: 'Table', href: '/leaderboard?view=table' },
] as const;

type ViewKey = (typeof VIEWS)[number]['key'];

function parseView(value: string | undefined): ViewKey {
  // "visual" was the card grid this list replaced; keep old links working.
  if (value === 'list' || value === 'visual') return 'list';
  if (value === 'table') return 'table';
  return 'stacked';
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

const TABLE_COLUMNS: { label: string; value: (p: BIQLeaderboardEntry) => number }[] = [
  { label: 'BIQ', value: (p) => p.biqScore },
  { label: 'Star', value: (p) => p.starScore },
  { label: 'Engine', value: (p) => p.engineScore },
  { label: 'Burden', value: (p) => p.burdenScore },
  { label: 'Creation', value: (p) => p.creationScore },
  { label: 'Efficiency', value: (p) => p.efficiencyScore },
  { label: 'Impact', value: (p) => p.impactScore },
  { label: 'Avail.', value: (p) => p.availabilityScore },
];

function TableView({ players }: { players: BIQLeaderboardEntry[] }) {
  return (
    <div className="biq-table-scroll" style={{ marginTop: 16 }}>
      <table className="biq-table" style={{ minWidth: 980 }}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Player</th>
            <th scope="col">Team</th>
            <th scope="col">Rank score</th>
            {TABLE_COLUMNS.map((column) => (
              <th key={column.label} scope="col" style={{ textAlign: 'right' }}>
                {column.label}
              </th>
            ))}
            <th scope="col" style={{ paddingLeft: 14 }}>Tier</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.id}>
              <td className="biq-rank">{String(index + 1).padStart(2, '0')}</td>
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
              {TABLE_COLUMNS.map((column) => (
                <td key={column.label} style={{ textAlign: 'right' }}>
                  {column.value(player).toFixed(1)}
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
  searchParams?: { view?: string };
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
            ? ` Only players with ${model.minGames}+ games at ${Math.round(model.minMinutes)}+ minutes a night qualify, so this is a read on established starters, not the whole league.`
            : ' Only high-minute regulars qualify, so this is a read on established starters, not the whole league.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
          <Link href="/model" className="biq-link" style={{ fontSize: 14 }}>
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
          <TableView players={players} />
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
