export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { BIQLeaderboardEntry } from '@/lib/types';
import StackedLeaderboard from '@/components/stacked-leaderboard';

// ─── helpers ──────────────────────────────────────────────────────────────────
function getPlayerHeadshotUrl(playerId: number) {
  return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}

function getBiqBadge(score: number): { label: string; cls: string } {
  if (score >= 90) return { label: 'Elite Tier', cls: 'badge-gold' };
  if (score >= 80) return { label: 'High Impact', cls: 'badge-teal' };
  return { label: 'Solid Tier', cls: 'badge-neutral' };
}

// ─── view toggle ──────────────────────────────────────────────────────────────
function LeaderboardToggle({ activeView }: { activeView: 'visual' | 'stacked' | 'table' }) {
  const linkStyle = (view: string) => ({
    padding: '0.78rem 1rem',
    border: '1px solid var(--border)',
    background: activeView === view ? 'var(--s1)' : 'transparent',
    color: 'var(--text)' as const,
    textDecoration: 'none' as const,
    fontSize: '0.72rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    fontFamily: 'var(--font-mono)',
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Link href="/leaderboard"               style={linkStyle('stacked')}>Interactive</Link>
      <Link href="/leaderboard?view=visual"   style={linkStyle('visual')} >Visual View</Link>
      <Link href="/leaderboard?view=table"    style={linkStyle('table')}  >Table View</Link>
    </div>
  );
}

// ─── visual card (original layout, kept for ?view=visual) ────────────────────
function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        padding: '0.72rem 0.8rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: '0.54rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
        {value.toFixed(1)}
      </div>
    </div>
  );
}

function getPanelGradient(index: number) {
  const gradients = [
    'linear-gradient(135deg, rgba(214,178,94,0.30) 0%, rgba(255,255,255,0.06) 100%)',
    'linear-gradient(135deg, rgba(56,189,248,0.24) 0%, rgba(16,185,129,0.16) 100%)',
    'linear-gradient(135deg, rgba(168,85,247,0.24) 0%, rgba(244,114,182,0.16) 100%)',
  ];
  return gradients[index % gradients.length];
}

function HeroPanelCard({ player, index }: { player: BIQLeaderboardEntry; index: number }) {
  const badge = getBiqBadge(player.biqScore);
  return (
    <article
      className="card"
      style={{
        position: 'relative', overflow: 'hidden', minHeight: 520, padding: '1.4rem',
        display: 'grid', alignContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
        isolation: 'isolate',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${getPlayerHeadshotUrl(player.id)})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.22, transform: 'scale(1.08)' }} />
      <div style={{ position: 'absolute', inset: 0, background: getPanelGradient(index) }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,10,15,0.18) 0%, rgba(7,10,15,0.50) 42%, rgba(7,10,15,0.95) 100%)' }} />
      <div style={{ position: 'absolute', top: 22, right: 22, width: '58%', height: '70%', border: '1px solid rgba(255,255,255,0.09)', transform: 'translateZ(0) rotate(3deg)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 36, right: 38, width: '58%', height: '70%', border: '1px solid rgba(255,255,255,0.05)', transform: 'translateZ(0) rotate(-2deg)', opacity: 0.4, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p className="eyebrow" style={{ marginBottom: '0.8rem', color: 'rgba(255,255,255,0.78)' }}>Rank #{index + 1}</p>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', lineHeight: 0.92, letterSpacing: '0.02em', color: 'white', maxWidth: '8ch', textShadow: '0 8px 24px rgba(0,0,0,0.28)' }}>
          {player.name}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.85rem' }}>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>{player.team}</span>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.38)', display: 'inline-block' }} />
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>{player.position}</span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '0.95rem' }}>
            <div style={{ fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', marginBottom: '0.45rem' }}>BIQ</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', lineHeight: 1, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{player.biqScore.toFixed(1)}</div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '0.95rem' }}>
            <div style={{ fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', marginBottom: '0.45rem' }}>Rank Score</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', lineHeight: 1, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>{player.biqRankScore.toFixed(1)}</div>
          </div>
        </div>
        <div><span className={`badge ${badge.cls}`}>{player.biqTier}</span></div>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '46ch' }}>{player.reason}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          <StatMini label="Engine"   value={player.engineScore} />
          <StatMini label="Creation" value={player.creationScore} />
          <StatMini label="Impact"   value={player.impactScore} />
        </div>
        <div><Link href={`/players/${player.id}`} className="section-link">View player →</Link></div>
      </div>
    </article>
  );
}

function VisualLeaderboardCard({ player, index }: { player: BIQLeaderboardEntry; index: number }) {
  const badge = getBiqBadge(player.biqScore);
  return (
    <article
      className="card"
      style={{
        position: 'relative', overflow: 'hidden', padding: '1.1rem', minHeight: 410,
        display: 'grid', alignContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.012))',
        isolation: 'isolate',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${getPlayerHeadshotUrl(player.id)})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.16, transform: 'scale(1.06)' }} />
      <div style={{ position: 'absolute', inset: 0, background: getPanelGradient(index), opacity: 0.8 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,10,15,0.18) 0%, rgba(8,10,15,0.62) 54%, rgba(8,10,15,0.94) 100%)' }} />
      <div style={{ position: 'absolute', top: 16, right: 16, width: '68%', height: '74%', border: '1px solid rgba(255,255,255,0.07)', transform: 'rotate(2deg)', opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 26, right: 28, width: '68%', height: '74%', border: '1px solid rgba(255,255,255,0.04)', transform: 'rotate(-2deg)', opacity: 0.45, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.60)', marginBottom: '0.55rem' }}>Rank #{index + 1}</div>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 2vw, 2rem)', lineHeight: 0.96, color: 'white', letterSpacing: '0.02em', maxWidth: '10ch', textShadow: '0 6px 18px rgba(0,0,0,0.24)' }}>{player.name}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.6rem' }}>
          <span style={{ fontSize: '0.56rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.68)' }}>{player.team}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.36)', display: 'inline-block' }} />
          <span style={{ fontSize: '0.56rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.68)' }}>{player.position}</span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gap: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.7rem' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', marginBottom: '0.35rem' }}>BIQ</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{player.biqScore.toFixed(1)}</div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', marginBottom: '0.35rem' }}>Rank Score</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>{player.biqRankScore.toFixed(1)}</div>
          </div>
        </div>
        <div><span className={`badge ${badge.cls}`}>{player.biqTier}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.6rem' }}>
          <StatMini label="Engine"   value={player.engineScore} />
          <StatMini label="Creation" value={player.creationScore} />
          <StatMini label="Impact"   value={player.impactScore} />
        </div>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.76)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.84rem', lineHeight: 1.7 }}>{player.reason}</p>
        <div><Link href={`/players/${player.id}`} className="section-link">View player →</Link></div>
      </div>
    </article>
  );
}

function VisualLeaderboard({ players }: { players: BIQLeaderboardEntry[] }) {
  const featured = players.slice(0, 3);
  const rest      = players.slice(3);
  return (
    <div style={{ display: 'grid', gap: '1.4rem' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {featured.map((p, i) => <HeroPanelCard key={p.id} player={p} index={i} />)}
      </div>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {rest.map((p, i) => <VisualLeaderboardCard key={p.id} player={p} index={i + 3} />)}
      </div>
    </div>
  );
}

// ─── table view (unchanged) ───────────────────────────────────────────────────
function TableLeaderboard({ players }: { players: BIQLeaderboardEntry[] }) {
  return (
    <div className="card-flush" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 1480, borderCollapse: 'collapse', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--s1)', borderBottom: '1px solid var(--border)' }}>
              {['Rank','Player','Team','Rank Score','BIQ','Tier','Star','Engine','Burden','Creation','Efficiency','Impact','Avail.','Model View'].map(label => (
                <th key={label} style={{ padding: '0.75rem 0.85rem', textAlign: 'left', fontSize: '0.56rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const badge = getBiqBadge(player.biqScore);
              return (
                <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'top' }}>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', color: 'var(--text)', fontWeight: 600, fontSize: '0.78rem' }}>#{index + 1}</td>
                  <td style={{ padding: '0.9rem 0.85rem', minWidth: 270 }}>
                    <Link href={`/players/${player.id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 48, height: 48, overflow: 'hidden', flexShrink: 0, background: 'var(--s2)', border: '1px solid var(--border-strong)' }}>
                        <img src={getPlayerHeadshotUrl(player.id)} alt={`${player.name} headshot`} width={48} height={48} style={{ width: 48, height: 48, objectFit: 'cover', display: 'block' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1, letterSpacing: '0.03em', color: 'var(--text)', marginBottom: 4 }}>{player.name}</div>
                        <div style={{ fontSize: '0.56rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{player.position}</div>
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', color: 'var(--text)', fontSize: '0.74rem' }}>{player.team}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', color: 'var(--gold)', fontSize: '1.15rem', lineHeight: 1, letterSpacing: '0.03em', fontFamily: 'var(--font-display)' }}>{player.biqRankScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', color: 'var(--text)', fontSize: '0.74rem', fontVariantNumeric: 'tabular-nums' }}>{player.biqScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', minWidth: 170 }}><span className={`badge ${badge.cls}`}>{player.biqTier}</span></td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.starScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.engineScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.burdenScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.creationScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.efficiencyScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.impactScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', fontSize: '0.74rem' }}>{player.availabilityScore.toFixed(1)}</td>
                  <td style={{ padding: '0.9rem 0.85rem', minWidth: 300, maxWidth: 360, color: 'var(--muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.82rem', lineHeight: 1.65 }}>{player.reason}</td>
                </tr>
              );
            })}
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
    ? 'Current Rankings · Table View'
    : view === 'visual'
    ? 'Current Rankings · Visual View'
    : 'Current Rankings · Interactive';

  return (
    <main className="page-shell space-y-8">
      {/* ── hero header ──────────────────────────────────────────────────── */}
      <section
        className="card"
        style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at top right, rgba(214,178,94,0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(56,189,248,0.10), transparent 26%)',
            pointerEvents: 'none',
          }}
        />

        <p className="eyebrow" style={{ marginBottom: '1rem', position: 'relative' }}>BIQ Leaderboard</p>

        <h1
          className="display"
          style={{ fontSize: 'clamp(2.6rem, 5vw, 4.25rem)', lineHeight: 0.95, color: 'var(--text)', marginBottom: '1rem', position: 'relative' }}
        >
          TOP 25<br />PLAYERS BY BIQ
        </h1>

        <p className="muted-copy" style={{ maxWidth: '70ch', fontSize: '0.92rem', position: 'relative' }}>
          This board is built to answer a harder question than who has the biggest box-score line
          or the loudest name value. BIQ starts with broad player utility, then pushes further by
          asking which players are truly driving offense, handling real responsibility, and still
          producing efficient, winning-level impact.
        </p>
      </section>

      {/* ── how to read ──────────────────────────────────────────────────── */}
      <section className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1.35rem' }}>
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <p className="eyebrow" style={{ marginBottom: '0.7rem' }}>How to Read the Board</p>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 2vw, 2.4rem)', lineHeight: 1.02, letterSpacing: '0.02em', color: 'var(--text)', maxWidth: '15ch' }}>
              Current play shape over reputation
            </h2>
          </div>
          <p style={{ margin: 0, maxWidth: '78ch', color: 'var(--muted)', fontFamily: 'var(--font-serif)', fontSize: '0.98rem', lineHeight: 1.82 }}>
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
          <Link href="/players?q=" className="section-link">Browse all players →</Link>
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
            <span className="stat-label">Leaderboard Size</span>
            <div className="stat-val gold">{players.length}</div>
            <div className="stat-sub">Tracked players on page</div>
          </div>
          <div className="stat-block">
            <span className="stat-label">Top Rank Score</span>
            <div className="stat-val">{players[0] ? players[0].biqRankScore.toFixed(1) : '0.0'}</div>
            <div className="stat-sub">Current #1 ranking score</div>
          </div>
          <div className="stat-block">
            <span className="stat-label">Top BIQ</span>
            <div className="stat-val teal">{players[0] ? players[0].biqScore.toFixed(1) : '0.0'}</div>
            <div className="stat-sub">Current #1 broad BIQ score</div>
          </div>
        </div>
      </section>
    </main>
  );
}