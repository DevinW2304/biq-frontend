// app/players/[id]/page.tsx — COURT PAPER player profile.
// Server component; data flow unchanged (fetchCachedJSON, revalidate 300).

export const revalidate = 300;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, fetchCachedJSON } from '@/lib/api';
import { PlayerProfile } from '@/lib/types';
import { MeterBar, ScoreMeter, SectionHeader } from '@/components/biq/BiqKit';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { RuleGrid, StatCell } from '@/components/biq/StatGrid';
import { TrendBars } from '@/components/biq/TrendBars';

function buildPlayerTagline(player: PlayerProfile) {
  if (player.biqScore >= 90) return 'An elite franchise-level utility profile with top-tier BIQ support.';
  if (player.biqScore >= 80) return 'A high-level team utility profile backed by strong BIQ indicators.';
  if (player.recentFormScore >= 88) return 'Playing at a high level with strong recent form and measurable season impact.';
  return 'A productive season profile with enough detail to support deeper BIQ evaluation.';
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  let player: PlayerProfile;

  try {
    player = await fetchCachedJSON<PlayerProfile>(`/api/players/${params.id}`, 300);
  } catch (error) {
    // Only a real 404 means the player doesn't exist. Anything else is a
    // backend problem and should surface as an error, not "not found".
    if (error instanceof ApiError && error.isNotFound) {
      notFound();
    }
    console.error(`Failed to load player ${params.id}`, error);
    throw error;
  }

  const sampleGames = (player.gameLog ?? []).length;

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">Player profile · Evaluated 2025-26 season</p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 40,
            marginTop: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, minWidth: 0 }}>
            <SubjectPhoto id={player.id} name={player.name} size={132} />
            <div style={{ minWidth: 0 }}>
              <h1 className="biq-display biq-hero-size">{player.name}</h1>
              <p style={{ marginTop: 8, fontSize: 15, color: 'var(--fog)' }}>
                {player.team} · {player.position} · {sampleGames} games sampled
              </p>
            </div>
          </div>

          <ScoreMeter
            value={player.biqScore}
            label="BIQ SCORE"
            tier={player.biqTier}
            size="xl"
            align="right"
            className="player-verdict"
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginTop: 40,
          }}
        >
          <div className="biq-card" style={{ padding: 20 }}>
            <p className="biq-mono">Recent form</p>
            <p className="biq-num" style={{ fontSize: 26, fontWeight: 600, margin: '10px 0 8px' }}>
              {player.recentFormScore.toFixed(1)}
            </p>
            <MeterBar value={player.recentFormScore} />
            <p className="biq-mono" style={{ marginTop: 8, fontSize: 10 }}>Weighted recent output</p>
          </div>
          <div className="biq-card" style={{ padding: 20 }}>
            <p className="biq-mono">Consistency</p>
            <p className="biq-num" style={{ fontSize: 26, fontWeight: 600, margin: '10px 0 8px' }}>
              {player.consistencyScore.toFixed(1)}
            </p>
            <MeterBar value={player.consistencyScore} />
            <p className="biq-mono" style={{ marginTop: 8, fontSize: 10 }}>Game-to-game stability</p>
          </div>
          <div className="biq-card" style={{ padding: 20, gridColumn: 'span 1' }}>
            <p className="biq-mono">Read</p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {buildPlayerTagline(player)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <Link href={`/compare?a=${player.id}&b=201939`} className="biq-btn">
            Compare this player
          </Link>
          <Link href="/players?q=" className="biq-btn-ghost">
            Back to search
          </Link>
        </div>
      </section>

      {/* ---------------- TOPLINE ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Core season indicators" title="Topline" />
        <div style={{ marginTop: 24 }}>
          <RuleGrid>
            {(player.stats ?? []).map((stat) => (
              <StatCell key={stat.label} {...stat} />
            ))}
          </RuleGrid>
        </div>
      </section>

      {/* ---------------- ANALYST NOTE ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="BIQ insight" title="Analyst note" />
        <div
          className="biq-card"
          style={{
            marginTop: 24,
            maxWidth: 860,
            padding: '20px 24px',
            borderLeft: '3px solid var(--key)',
          }}
        >
          <p className="biq-mono" style={{ marginBottom: 10 }}>What the profile suggests</p>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)' }}>{player.insight}</p>
        </div>
      </section>

      {/* ---------------- BIQ BREAKDOWN ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Component scores" title="BIQ breakdown" />
        <p style={{ marginTop: 20, maxWidth: '64ch', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          BIQ combines availability, efficiency, impact, team context, and box-score burden into
          one team-utility score.
        </p>
        <ol style={{ listStyle: 'none', margin: '12px 0 0', padding: 0 }}>
          {(player.biqBreakdown ?? []).map((component) => (
            <li key={component.label} className="biq-row">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(120px, 12rem) 1fr minmax(110px, 13rem) 4.5rem',
                  alignItems: 'center',
                  gap: 24,
                  padding: '16px 8px',
                }}
              >
                <span className="biq-display" style={{ fontSize: 16, fontWeight: 600 }}>
                  {component.label}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--fog)' }}>
                  {component.explanation}
                </span>
                <span>
                  <MeterBar value={component.score} />
                  <span className="biq-mono" style={{ display: 'block', marginTop: 6, fontSize: 10 }}>
                    Weight {Math.round(component.weight * 100)}%
                  </span>
                </span>
                <span className="biq-num" style={{ fontSize: 20, fontWeight: 600, justifySelf: 'end' }}>
                  {Math.round(component.score)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- RECENT TREND ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Last 10 games · Points" title="Recent trend" />
        <div className="biq-card" style={{ marginTop: 24, padding: 24 }}>
          <TrendBars data={player.recentTrend ?? []} />
        </div>
      </section>

      {/* ---------------- SPLITS ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Situational production" title="Splits" />
        <div style={{ marginTop: 24 }}>
          <RuleGrid min={180}>
            {(player.splits ?? []).map((split) => (
              <div key={split.label} style={{ padding: 20 }}>
                <p className="biq-mono">{split.label}</p>
                <p className="biq-num" style={{ marginTop: 10, fontSize: 22, fontWeight: 600 }}>
                  {split.value}
                </p>
              </div>
            ))}
          </RuleGrid>
        </div>
      </section>

      {/* ---------------- ANALYTICS BLOCKS ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Extended metrics" title="Analytics" />
        {(player.analyticsBlocks ?? []).map((block) => (
          <div key={block.title} style={{ marginTop: 32 }}>
            <p className="biq-mono biq-signal" style={{ marginBottom: 14 }}>{block.title}</p>
            <RuleGrid>
              {block.stats.map((stat) => (
                <StatCell key={`${block.title}-${stat.label}`} {...stat} />
              ))}
            </RuleGrid>
          </div>
        ))}
      </section>

      {/* ---------------- GAME LOG ---------------- */}
      <section style={{ padding: '40px 0 88px' }}>
        <SectionHeader label="Game by game" title="Game log" />
        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table className="biq-table" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                {['DATE', 'MATCHUP', 'W/L', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'TOV', 'FG%', '3PT%', 'FT%', '+/-'].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(player.gameLog ?? []).map((row, index) => (
                <tr key={`${row.gameDate}-${row.matchup}-${index}`}>
                  <td style={{ color: 'var(--fog)' }}>{row.gameDate}</td>
                  <td>{row.matchup}</td>
                  <td style={{ color: row.result === 'W' ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
                    {row.result}
                  </td>
                  <td style={{ color: 'var(--fog)' }}>{row.minutes}</td>
                  <td style={{ fontWeight: 600 }}>{row.points}</td>
                  <td>{row.rebounds}</td>
                  <td>{row.assists}</td>
                  <td>{row.steals}</td>
                  <td>{row.blocks}</td>
                  <td>{row.turnovers}</td>
                  <td>{row.fgPct.toFixed(1)}</td>
                  <td>{row.threePct.toFixed(1)}</td>
                  <td>{row.ftPct.toFixed(1)}</td>
                  <td style={{ color: row.plusMinus >= 0 ? 'var(--up)' : 'var(--down)' }}>
                    {row.plusMinus > 0 ? '+' : ''}
                    {row.plusMinus.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
