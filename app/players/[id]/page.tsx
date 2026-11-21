// app/players/[id]/page.tsx — COURT PAPER player profile.
// Server component; data flow unchanged (fetchCachedJSON, revalidate 300).

export const revalidate = 300;

import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, fetchCachedJSON, fetchSeasonInfo } from '@/lib/api';
import { formatShortDate, formatSigned, signedColor } from '@/lib/format';
import { OnOffSplit, PlayerProfile } from '@/lib/types';
import { MeterBar, ScoreMeter, SectionHeader } from '@/components/biq/BiqKit';
import { ShotProfile } from '@/components/biq/ShotProfile';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { RuleGrid, StatCell } from '@/components/biq/StatGrid';
import { TrendBars } from '@/components/biq/TrendBars';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata, SITE_URL } from '@/lib/site';

function buildPlayerTagline(player: PlayerProfile) {
  if (player.biqScore >= 90) return 'An elite franchise-level utility profile with top-tier BIQ support.';
  if (player.biqScore >= 80) return 'A high-level team utility profile backed by strong BIQ indicators.';
  if ((player.recentFormScore ?? 0) >= 88) return 'Playing at a high level with strong recent form and measurable season impact.';
  return 'A productive season profile with enough detail to support deeper BIQ evaluation.';
}

// A 0-100 score that the API withholds until there are enough games for it.
function ScoreCard({ label, value, caption, pending }: {
  label: string;
  value: number | null | undefined;
  caption: string;
  pending: string;
}) {
  return (
    <div className="biq-card" style={{ padding: 20 }}>
      <p className="biq-mono">{label}</p>
      <p className="biq-num" style={{ fontSize: 26, fontWeight: 600, margin: '10px 0 8px', color: value == null ? 'var(--fog)' : undefined }}>
        {value == null ? '—' : value.toFixed(1)}
      </p>
      <MeterBar value={value ?? 0} />
      <p className="biq-mono" style={{ marginTop: 8, fontSize: 10 }}>{value == null ? pending : caption}</p>
    </div>
  );
}

function OnOffTiles({ onOff }: { onOff: OnOffSplit }) {
  const tiles: { label: string; value: number | null | undefined; note: string }[] = [
    { label: 'On the floor', value: onOff.onNet, note: `Team net rating · ${onOff.onPossessions.toLocaleString('en-US')} possessions` },
    { label: 'Off the floor', value: onOff.offNet, note: `Team net rating · ${onOff.offPossessions.toLocaleString('en-US')} possessions` },
    { label: 'On/off swing', value: onOff.diff, note: 'Points per 100 possessions the team gains with him on' },
  ];
  return (
    <RuleGrid min={220}>
      {tiles.map((tile) => (
        <div key={tile.label} style={{ padding: 20 }}>
          <p className="biq-mono">{tile.label}</p>
          <p
            className="biq-num"
            style={{ fontSize: 26, fontWeight: 600, marginTop: 10, color: tile.value == null ? 'var(--fog)' : signedColor(tile.value) }}
          >
            {tile.value == null ? '—' : formatSigned(tile.value)}
          </p>
          <p className="biq-mono" style={{ marginTop: 8, fontSize: 10 }}>{tile.note}</p>
        </div>
      ))}
    </RuleGrid>
  );
}

// Shared by generateMetadata and the page; Next dedupes the identical fetch.
function fetchPlayer(id: string) {
  return fetchCachedJSON<PlayerProfile>(`/api/players/${id}`, 300);
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!/^\d+$/.test(params.id)) return { title: 'Player not found' };
  try {
    const player = await fetchPlayer(params.id);
    return pageMetadata({
      title: `${player.name} player profile`,
      description: `${player.name} (${player.team}, ${player.position}): BIQ ${player.biqScore.toFixed(1)}, ${player.biqTier}. Recent form, efficiency, splits and game log.`,
      path: `/players/${player.id}`,
      image: `/players/${player.id}/opengraph-image`,
    });
  } catch {
    // The page itself decides between 404 and an error; don't fail here first.
    return { title: 'Player profile' };
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  // The API 422s on non-numeric ids; that's a missing page, not an outage.
  if (!/^\d+$/.test(params.id)) notFound();

  const seasonInfo = await fetchSeasonInfo();
  let player: PlayerProfile;

  try {
    player = await fetchPlayer(params.id);
  } catch (error) {
    // Only a real 404 means the player doesn't exist. Anything else is a
    // backend problem and should surface as an error, not "not found".
    if (error instanceof ApiError && error.isNotFound) {
      notFound();
    }
    console.error(`Failed to load player ${params.id}`, error);
    throw error;
  }

  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE_URL}/players/${player.id}`,
    mainEntity: {
      '@type': 'Person',
      name: player.name,
      jobTitle: 'Professional basketball player',
    },
  };

  // Older API responses carry no season or games count; fall back gracefully.
  const season = player.season ?? seasonInfo?.season ?? null;
  const gamesPlayed = player.gamesPlayed ?? (player.gameLog ?? []).length;
  const dataThrough = seasonInfo?.season === season ? formatShortDate(seasonInfo?.dataThrough) : null;
  const advanced = player.advanced ?? null;

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <JsonLd data={profileJsonLd} />

      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">
          Player profile{season ? ` · Evaluated ${season} season` : ''}
          {dataThrough ? ` · Games through ${dataThrough}` : ''}
        </p>

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
                {player.team} · {player.position} · {gamesPlayed} {gamesPlayed === 1 ? 'game' : 'games'} played
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
          <ScoreCard
            label="Recent form"
            value={player.recentFormScore}
            caption="Latest games against his season"
            pending="Needs a few more games"
          />
          <ScoreCard
            label="Consistency"
            value={player.consistencyScore}
            caption="Game-to-game stability"
            pending="Needs a few more games"
          />
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
          <Link href="/players" className="biq-btn-ghost">
            All players
          </Link>
        </div>
      </section>

      {/* ---------------- TOPLINE ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Core season indicators" title="Topline" />
        <div style={{ marginTop: 24 }}>
          <RuleGrid min={300}>
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
              <div className="biq-weight-row">
                <span className="biq-display" style={{ fontSize: 16, fontWeight: 600 }}>
                  {component.label}
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--fog)' }}>
                  {component.explanation}
                </span>
                <span className="biq-weight-bar">
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

      {/* ---------------- PER 100, EFFICIENCY, SHOTS, ON/OFF ----------------
          Play-by-play detail. None of it feeds the BIQ score; it is here so
          the score can be checked against the play behind it. */}
      {advanced ? (
        <>
          <section style={{ padding: '40px 0' }}>
            <SectionHeader
              label={`Pace and minutes removed · ${advanced.possessions.toLocaleString('en-US')} possessions on the floor`}
              title="Per 100 possessions"
            />
            <p style={{ marginTop: 20, maxWidth: '68ch', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
              Per-game numbers reward minutes and a fast team. These count what he does per 100
              possessions he is on the floor for. Percentiles are against the league&apos;s rotation
              players, and a fuller gauge is always better.
              {advanced.lowSample
                ? ' He has played too few possessions for these to have settled; read them as early returns.'
                : ''}
            </p>
            <div style={{ marginTop: 24 }}>
              <RuleGrid min={180}>
                {advanced.per100.map((stat) => (
                  <StatCell key={`per100-${stat.label}`} {...stat} />
                ))}
              </RuleGrid>
            </div>
          </section>

          <section style={{ padding: '40px 0' }}>
            <SectionHeader label="How the points and possessions come" title="Efficiency and role" />
            <div style={{ marginTop: 24 }}>
              <RuleGrid min={260}>
                {advanced.efficiency.map((stat) => (
                  <StatCell key={`efficiency-${stat.label}`} {...stat} />
                ))}
              </RuleGrid>
            </div>
          </section>

          {advanced.shotProfile.some((zone) => zone.attempts > 0) ? (
            <section style={{ padding: '40px 0' }}>
              <SectionHeader label="Where the shots come from, and how they fall" title="Shot profile" />
              <div style={{ marginTop: 24 }}>
                <ShotProfile zones={advanced.shotProfile} />
              </div>
            </section>
          ) : null}

          {advanced.onOff ? (
            <section style={{ padding: '40px 0' }}>
              <SectionHeader label="Team results with and without him" title="On / off" />
              <p style={{ marginTop: 20, maxWidth: '68ch', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
                Net rating is points scored minus points allowed per 100 possessions. On/off depends
                heavily on who he shares the floor with and who replaces him, so it is context for the
                score rather than a verdict on its own.
              </p>
              <div style={{ marginTop: 24 }}>
                <OnOffTiles onOff={advanced.onOff} />
              </div>
            </section>
          ) : null}
        </>
      ) : null}

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
                {split.games != null ? (
                  <p className="biq-mono" style={{ marginTop: 8, fontSize: 10 }}>
                    {split.games} {split.games === 1 ? 'game' : 'games'}
                  </p>
                ) : null}
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
        <SectionHeader
          label={`Latest ${(player.gameLog ?? []).length} of ${gamesPlayed} games`}
          title="Game log"
        />
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
                  <td style={{ color: 'var(--fog)', whiteSpace: 'nowrap' }}>
                    {formatShortDate(row.gameDate) ?? row.gameDate}
                  </td>
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
                  <td style={{ color: signedColor(row.plusMinus) }}>
                    {formatSigned(row.plusMinus, 0)}
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
