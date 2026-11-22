// app/teams/[id]/page.tsx — COURT PAPER team dashboard.
export const revalidate = 300;

import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, fetchCachedJSON, fetchSeasonInfo } from '@/lib/api';
import { formatPct, formatShortDate, formatSigned, joinMeta, knownPosition, ordinal, signedColor } from '@/lib/format';
import { pageMetadata } from '@/lib/site';
import { TeamFactor, TeamLineup, TeamProfile, TeamRosterPlayer } from '@/lib/types';
import { MeterBar, SectionHeader } from '@/components/biq/BiqKit';
import { ShotProfile } from '@/components/biq/ShotProfile';
import { RuleGrid, StatCell } from '@/components/biq/StatGrid';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';

function factorValue(factor: TeamFactor, value: number | null | undefined) {
  if (value == null) return '—';
  return factor.format === 'pct' ? formatPct(value) : value.toFixed(1);
}

// A league rank as "3rd of 30", in key blue for the top ten.
function Rank({ rank }: { rank: number | null | undefined }) {
  if (rank == null) return <span style={{ color: 'var(--fog)' }}>—</span>;
  return (
    <span style={{ color: rank <= 10 ? 'var(--key)' : 'var(--fog)', fontWeight: rank <= 10 ? 600 : 400 }}>
      {ordinal(rank)}
    </span>
  );
}

function FourFactors({ factors }: { factors: TeamFactor[] }) {
  return (
    <div className="biq-table-scroll" style={{ marginTop: 24 }}>
      <table className="biq-table biq-table-fit" style={{ minWidth: 640 }}>
        <thead>
          <tr>
            <th scope="col">Factor</th>
            <th scope="col" className="biq-col-num">Offense</th>
            <th scope="col" className="biq-col-num">Rank</th>
            <th scope="col" className="biq-col-num">Defense allows</th>
            <th scope="col" className="biq-col-num">Rank</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((factor) => (
            <tr key={factor.key} title={factor.description}>
              <th scope="row" style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink)' }}>
                {factor.label}
              </th>
              <td className="biq-col-num" style={{ fontWeight: 600 }}>{factorValue(factor, factor.offense)}</td>
              <td className="biq-col-num"><Rank rank={factor.offenseRank} /></td>
              <td className="biq-col-num" style={{ fontWeight: 600 }}>{factorValue(factor, factor.defense)}</td>
              <td className="biq-col-num"><Rank rank={factor.defenseRank} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Lineups({ lineups }: { lineups: TeamLineup[] }) {
  return (
    <div className="biq-table-scroll" style={{ marginTop: 24 }}>
      <table className="biq-table biq-table-fit" style={{ minWidth: 820 }}>
        <thead>
          <tr>
            <th scope="col">Five on the floor</th>
            <th scope="col" className="biq-col-num biq-hide-sm">Min</th>
            <th scope="col" className="biq-col-num">Poss</th>
            <th scope="col" className="biq-col-num biq-hide-sm">Off</th>
            <th scope="col" className="biq-col-num biq-hide-sm">Def</th>
            <th scope="col" className="biq-col-num">Net</th>
          </tr>
        </thead>
        <tbody>
          {lineups.map((lineup) => (
            <tr key={lineup.players.map((player) => player.id).join('-')}>
              <td style={{ whiteSpace: 'normal', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                {lineup.players.map((player, index) => (
                  <span key={player.id}>
                    {index > 0 ? ', ' : ''}
                    <Link href={`/players/${player.id}`} className="biq-link" style={{ color: 'var(--ink)' }}>
                      {player.name}
                    </Link>
                  </span>
                ))}
              </td>
              <td className="biq-col-num biq-hide-sm">{lineup.minutes.toFixed(0)}</td>
              <td className="biq-col-num">{lineup.possessions}</td>
              <td className="biq-col-num biq-hide-sm">{lineup.offRating?.toFixed(1) ?? '—'}</td>
              <td className="biq-col-num biq-hide-sm">{lineup.defRating?.toFixed(1) ?? '—'}</td>
              <td
                className="biq-col-num"
                style={{ fontWeight: 600, color: lineup.netRating != null ? signedColor(lineup.netRating) : 'var(--fog)' }}
              >
                {lineup.netRating != null ? formatSigned(lineup.netRating) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Roster({ roster }: { roster: TeamRosterPlayer[] }) {
  const hasOnOff = roster.some((player) => player.onOffDiff != null);
  return (
    <div className="biq-table-scroll" style={{ marginTop: 24 }}>
      <table className="biq-table biq-table-fit" style={{ minWidth: 720 }}>
        <thead>
          <tr>
            <th scope="col" className="biq-hide-sm" aria-hidden="true" />
            <th scope="col">Player</th>
            <th scope="col" className="biq-col-num biq-hide-sm">GP</th>
            <th scope="col" className="biq-col-num">Min</th>
            <th scope="col" className="biq-col-num biq-hide-sm">Pts</th>
            <th scope="col" className="biq-score-cell">BIQ</th>
            {hasOnOff ? <th scope="col" className="biq-col-num">On/off</th> : null}
          </tr>
        </thead>
        <tbody>
          {roster.map((player) => {
            const played = (player.gamesPlayed ?? 0) > 0;
            const detail = joinMeta(player.number ? `#${player.number}` : '', knownPosition(player.position));
            return (
              <tr key={player.id}>
                <td className="biq-hide-sm" style={{ width: 44, paddingRight: 12 }}>
                  <SubjectPhoto id={player.id} name={player.name} size={36} />
                </td>
                <td style={{ fontFamily: 'var(--font-body)', whiteSpace: 'normal' }}>
                  <Link href={`/players/${player.id}`} className="biq-link" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 15 }}>
                    {player.name}
                  </Link>
                  {detail ? (
                    <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: 'var(--fog)' }}>{detail}</span>
                  ) : null}
                </td>
                <td className="biq-col-num biq-hide-sm">{played ? player.gamesPlayed : '—'}</td>
                <td className="biq-col-num">{player.minutes != null ? player.minutes.toFixed(1) : '—'}</td>
                <td className="biq-col-num biq-hide-sm">{player.points != null ? player.points.toFixed(1) : '—'}</td>
                {/* Every BIQ score on the site is a number with its gauge. */}
                <td className="biq-score-cell">
                  {player.biqScore != null ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: '3.5ch', fontWeight: 600, color: 'var(--key)' }}>
                        {player.biqScore.toFixed(1)}
                      </span>
                      <span className="biq-hide-sm" style={{ flex: 1 }}>
                        <MeterBar value={player.biqScore} />
                      </span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--fog)' }}>—</span>
                  )}
                </td>
                {hasOnOff ? (
                  <td
                    className="biq-col-num"
                    style={{ color: player.onOffDiff != null ? signedColor(player.onOffDiff) : 'var(--fog)' }}
                  >
                    {player.onOffDiff != null ? formatSigned(player.onOffDiff) : '—'}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Shared by generateMetadata and the page; Next dedupes the identical fetch.
function fetchTeam(id: string) {
  return fetchCachedJSON<TeamProfile>(`/api/teams/${id}`, 300);
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!/^\d+$/.test(params.id)) return { title: 'Team not found' };
  try {
    const team = await fetchTeam(params.id);
    return pageMetadata({
      title: `${team.name} dashboard`,
      description: `${team.name} (${team.conference}, ${team.division}): season record, efficiency profile and roster BIQ.`,
      path: `/teams/${team.id}`,
    });
  } catch {
    return { title: 'Team dashboard' };
  }
}

export default async function TeamPage({ params }: { params: { id: string } }) {
  // The API 422s on non-numeric ids; that's a missing page, not an outage.
  if (!/^\d+$/.test(params.id)) notFound();

  const seasonInfo = await fetchSeasonInfo();
  let team: TeamProfile;
  try {
    team = await fetchTeam(params.id);
  } catch (error) {
    // Only a real 404 means the team doesn't exist; anything else is an outage.
    if (error instanceof ApiError && error.isNotFound) notFound();
    console.error(`Failed to load team ${params.id}`, error);
    throw error;
  }
  const roster = team.rosterPreview ?? [];
  const alignment = [team.conference, team.division].filter(Boolean).join(' · ');
  const season = team.season ?? seasonInfo?.season ?? null;
  const dataThrough = seasonInfo?.season === season ? formatShortDate(seasonInfo?.dataThrough) : null;
  const factors = team.fourFactors ?? [];
  const zones = (team.shotProfile ?? []).filter((zone) => zone.attempts > 0);
  const lineups = team.lineups ?? [];

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">
          Team dashboard{season ? ` · ${season}` : ''}
          {dataThrough ? ` · Games through ${dataThrough}` : ''}
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 28, minWidth: 0 }}>
          <span
            aria-hidden="true"
            className="biq-num"
            style={{
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              width: 'clamp(72px, 10vw, 132px)',
              aspectRatio: '1',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              background: 'var(--panel)',
              fontSize: 'clamp(18px, 2.4vw, 30px)',
              fontWeight: 600,
            }}
          >
            {team.abbreviation}
          </span>
          <div style={{ minWidth: 0 }}>
            <h1 className="biq-display biq-hero-size">{team.name}</h1>
            {alignment ? (
              <p style={{ marginTop: 8, fontSize: 15, color: 'var(--fog)' }}>{alignment}</p>
            ) : null}
          </div>
        </div>

        {team.lineupInsight ? (
          <div
            className="biq-card"
            style={{ marginTop: 32, maxWidth: 860, padding: '20px 24px', borderLeft: '3px solid var(--key)' }}
          >
            <p className="biq-mono" style={{ marginBottom: 10 }}>Team read</p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)' }}>{team.lineupInsight}</p>
          </div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <Link href="/teams" className="biq-btn-ghost">
            All teams
          </Link>
        </div>
      </section>

      {/* ---------------- PROFILE ---------------- */}
      <section style={{ padding: '40px 0' }}>
        <SectionHeader label="Season to date" title="Team profile" />
        <div style={{ marginTop: 24 }}>
          <RuleGrid min={300}>
            {team.stats.map((stat) => (
              <StatCell key={stat.label} {...stat} />
            ))}
          </RuleGrid>
        </div>
      </section>

      {/* ---------------- FOUR FACTORS ---------------- */}
      {factors.length > 0 ? (
        <section style={{ padding: '40px 0' }}>
          <SectionHeader label="Why the ratings are what they are" title="Four factors" />
          <p style={{ marginTop: 20, maxWidth: '68ch', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
            A rating comes down to four things: making shots, keeping the ball, getting second
            chances and getting to the line. The left side is what this team does with the ball, the
            right side what it allows. Ranks are out of the league&apos;s 30 teams, and 1st is always
            the good end.
          </p>
          <FourFactors factors={factors} />
        </section>
      ) : null}

      {/* ---------------- SHOT PROFILE ---------------- */}
      {zones.length > 0 ? (
        <section style={{ padding: '40px 0' }}>
          <SectionHeader label="Where the offense shoots from" title="Shot profile" />
          <div style={{ marginTop: 24 }}>
            <ShotProfile zones={zones} subject="the team's" />
          </div>
        </section>
      ) : null}

      {/* ---------------- LINEUPS ---------------- */}
      {lineups.length > 0 ? (
        <section style={{ padding: '40px 0' }}>
          <SectionHeader label="Most-used five-man units" title="Lineups" />
          <p style={{ marginTop: 20, maxWidth: '68ch', fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
            Ratings are points per 100 possessions with these five on the floor. Lineup samples are
            small; a unit needs a few hundred possessions before its net rating says much.
          </p>
          <Lineups lineups={lineups} />
        </section>
      ) : null}

      {/* ---------------- ROSTER ---------------- */}
      <section style={{ padding: '40px 0 88px' }}>
        <SectionHeader label={`${roster.length} players · most minutes first`} title="Roster" />
        {roster.length > 0 ? (
          <Roster roster={roster} />
        ) : (
          <div className="biq-card" style={{ padding: 28, marginTop: 24 }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              This team&apos;s roster hasn&apos;t been synced yet. Every player is still in
              the <Link href="/players" className="biq-link">player index</Link>.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
