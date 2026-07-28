export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';
import StackedLeaderboard from '@/components/stacked-leaderboard';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

import { SpeedInsights } from '@vercel/speed-insights/next';

// ─── view toggle ──────────────────────────────────────────────────────────────
function LeaderboardToggle({ activeView }: { activeView: 'visual' | 'stacked' | 'table' }) {
  const linkStyle = (view: string) => ({
    padding: '0.55rem 1rem',
    border: '1px solid var(--border)',
    borderRadius: 999,
    background: activeView === view ? 'var(--text)' : '#fff',
    color: activeView === view ? '#fff' : 'var(--text-2)',
    textDecoration: 'none' as const,
    fontSize: '0.8rem',
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', flexWrap: 'wrap' }}>
      <Link href="/leaderboard"               style={linkStyle('stacked')}>Interactive</Link>
      <Link href="/leaderboard?view=visual"   style={linkStyle('visual')} >Visual view</Link>
      <Link href="/leaderboard?view=table"    style={linkStyle('table')}  >Table view</Link>
    </div>
  );
}

// ─── visual cards ─────────────────────────────────────────────────────────────
function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)',
        background: 'var(--bg)',
        padding: '0.72rem 0.8rem',
      }}
    >
      <div className="stat-label" style={{ marginBottom: '0.35rem' }}>{label}</div>
      <div
        style={{
          fontFamily: 'var(--font-file)',
          fontSize: '1.05rem',
          fontWeight: 600,
          lineHeight: 1,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.toFixed(1)}
      </div>
    </div>
  );
}

function VisualLeaderboardCard({
  player,
  index,
  featured = false,
}: {
  player: BIQLeaderboardEntry;
  index: number;
  featured?: boolean;
}) {
  return (
    <article
      className="card"
      style={{
        padding: featured ? '1.5rem' : '1.25rem',
        display: 'grid',
        alignContent: 'start',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <SubjectPhoto id={player.id} name={player.name} size={featured ? 72 : 56} />
        <div style={{ minWidth: 0 }}>
          <p className="leader-rank" style={{ marginBottom: '0.3rem' }}>Rank #{index + 1}</p>
          <h3
            className="display"
            style={{
              margin: 0,
              fontSize: featured ? 'clamp(1.4rem, 2.4vw, 1.9rem)' : '1.2rem',
              color: 'var(--text)',
            }}
          >
            {player.name}
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
            {player.team} · {player.position}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.7rem' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '0.8rem' }}>
          <div className="stat-label" style={{ marginBottom: '0.35rem' }}>BIQ</div>
          <div
            style={{
              fontFamily: 'var(--font-file)',
              fontSize: featured ? '1.6rem' : '1.25rem',
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {player.biqScore.toFixed(1)}
          </div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '0.8rem' }}>
          <div className="stat-label" style={{ marginBottom: '0.35rem' }}>Rank score</div>
          <div
            style={{
              fontFamily: 'var(--font-file)',
              fontSize: featured ? '1.6rem' : '1.25rem',
              fontWeight: 600,
              lineHeight: 1,
              color: 'var(--signal)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {player.biqRankScore.toFixed(1)}
          </div>
        </div>
      </div>

      <div><span className="badge badge-gold">{player.biqTier}</span></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.6rem' }}>
        <StatMini label="Engine"   value={player.engineScore} />
        <StatMini label="Creation" value={player.creationScore} />
        <StatMini label="Impact"   value={player.impactScore} />
      </div>

      <p style={{ margin: 0, color: 'var(--text-2)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.7 }}>
        {player.reason}
      </p>

      <div><Link href={`/players/${player.id}`} className="section-link">View player</Link></div>
    </article>
  );
}

function VisualLeaderboard({ players }: { players: BIQLeaderboardEntry[] }) {
  const featured = players.slice(0, 3);
  const rest      = players.slice(3);
  return (
    <div style={{ display: 'grid', gap: '1.4rem' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {featured.map((p, i) => <VisualLeaderboardCard key={p.id} player={p} index={i} featured />)}
      </div>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {rest.map((p, i) => <VisualLeaderboardCard key={p.id} player={p} index={i + 3} />)}
      </div>
    </div>
  );
}

// ─── table view ───────────────────────────────────────────────────────────────
function TableLeaderboard({ players }: { players: BIQLeaderboardEntry[] }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="biq-table" style={{ minWidth: 1480 }}>
          <thead>
            <tr>
              {['Rank','Player','Team','Rank Score','BIQ','Tier','Star','Engine','Burden','Creation','Efficiency','Impact','Avail.','Model View'].map(label => (
                <th key={label} style={{ padding: '0.75rem 0.85rem' }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.id} style={{ verticalAlign: 'top' }}>
                <td style={{ padding: '0.9rem 0.85rem', fontWeight: 600 }}>#{index + 1}</td>
                <td style={{ padding: '0.9rem 0.85rem', minWidth: 250 }}>
                  <Link href={`/players/${player.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <SubjectPhoto id={player.id} name={player.name} size={44} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                        {player.name}
                      </span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: '0.7rem', color: 'var(--muted)' }}>
                        {player.position}
                      </span>
                    </span>
                  </Link>
                </td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.team}</td>
                <td style={{ padding: '0.9rem 0.85rem', color: 'var(--signal)', fontSize: '1rem', fontWeight: 600 }}>{player.biqRankScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.biqScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem', minWidth: 160 }}><span className="badge badge-gold">{player.biqTier}</span></td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.starScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.engineScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.burdenScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.creationScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.efficiencyScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.impactScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem' }}>{player.availabilityScore.toFixed(1)}</td>
                <td style={{ padding: '0.9rem 0.85rem', minWidth: 300, maxWidth: 360, whiteSpace: 'normal', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.65 }}>
                  {player.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const view   = params?.view ?? 'stacked'; // default → interactive

  const players = await fetchJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=25');

  const viewLabel = view === 'table'
    ? 'Current rankings · Table view'
    : view === 'visual'
    ? 'Current rankings · Visual view'
    : 'Current rankings · Interactive';

  return (
    <main className="page-shell space-y-8">
      {/* ── hero header ──────────────────────────────────────────────────── */}
      <section style={{ padding: '1.5rem 0 0' }}>
        <p className="eyebrow" style={{ marginBottom: '1rem' }}>BIQ Leaderboard</p>

        <h1
          className="display"
          style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', color: 'var(--text)', marginBottom: '1rem', maxWidth: '16ch' }}
        >
          Top 25 players by BIQ
        </h1>

        <p className="muted-copy" style={{ maxWidth: '70ch', fontSize: '0.95rem' }}>
          This board is built to answer a harder question than who has the biggest box-score line
          or the loudest name value. BIQ starts with broad player utility, then pushes further by
          asking which players are truly driving offense, handling real responsibility, and still
          producing efficient, winning-level impact.
        </p>
      </section>

      {/* ── how to read ──────────────────────────────────────────────────── */}
      <section className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1.1rem' }}>
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <p className="eyebrow" style={{ marginBottom: '0.7rem' }}>How to read the board</p>
            <h2 className="display" style={{ margin: 0, fontSize: 'clamp(1.4rem, 2vw, 1.9rem)', color: 'var(--text)', maxWidth: '24ch' }}>
              Current play shape over reputation
            </h2>
          </div>
          <p style={{ margin: 0, maxWidth: '78ch', color: 'var(--text-2)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            BIQ is not trying to mirror popularity, scoring average, or traditional award logic. It
            is built to identify which players create the most real offensive value once workload,
            creation pressure, efficiency, and impact are viewed together.
          </p>
        </div>
      </section>

      {/* ── rankings section ─────────────────────────────────────────────── */}
      <section style={{ display: 'grid', gap: '1rem' }}>
        <div className="section-head">
          <span className="section-title">{viewLabel}</span>
          <Link href="/players?q=" className="section-link">Browse all players</Link>
        </div>

        <LeaderboardToggle activeView={view as 'visual' | 'stacked' | 'table'} />

        {view === 'table'   && <TableLeaderboard players={players} />}
        {view === 'visual'  && <VisualLeaderboard players={players} />}
        {view === 'stacked' && <StackedLeaderboard players={players} />}
      </section>

      {/* ── summary stats ────────────────────────────────────────────────── */}
      <section>
        <div
          className="grid-ruled"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          <div className="stat-block">
            <span className="stat-label">Leaderboard size</span>
            <div className="stat-val" style={{ color: 'var(--signal)' }}>{players.length}</div>
            <div className="stat-sub">Tracked players on page</div>
          </div>
          <div className="stat-block">
            <span className="stat-label">Top rank score</span>
            <div className="stat-val">{players[0] ? players[0].biqRankScore.toFixed(1) : '0.0'}</div>
            <div className="stat-sub">Current #1 ranking score</div>
          </div>
          <div className="stat-block">
            <span className="stat-label">Top BIQ</span>
            <div className="stat-val">{players[0] ? players[0].biqScore.toFixed(1) : '0.0'}</div>
            <div className="stat-sub">Current #1 broad BIQ score</div>
          </div>
        </div>
      </section>

      <SpeedInsights />
    </main>
  );
}
