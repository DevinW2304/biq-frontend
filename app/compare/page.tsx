// app/compare/page.tsx — COURT PAPER comparison: two subject cards and a
// verdict panel. Server component; data flow unchanged (fetchCachedJSON,
// revalidate 300, ?a=&b= query params).

export const revalidate = 300;

import Link from 'next/link';
import { fetchCachedJSON, fetchCurrentSeason } from '@/lib/api';
import { pageMetadata } from '@/lib/site';
import { BIQLeaderboardEntry, CompareResponse, ComparePlayerCard } from '@/lib/types';
import { MeterBar, ScoreMeter } from '@/components/biq/BiqKit';
import { EdgeTag, RuleGrid, StatCell } from '@/components/biq/StatGrid';
import { headToHead, type HeadToHead, type Side } from '@/lib/compare';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { TrendBars } from '@/components/biq/TrendBars';
import { ComparePlayerPicker } from '@/components/ComparePlayerPicker';
import { joinMeta, knownPosition } from '@/lib/format';

// Used only if the leaderboard can't be read.
const FALLBACK_MATCHUPS = [
  { href: '/compare?a=2544&b=201939', label: 'LeBron vs Curry' },
  { href: '/compare?a=1629029&b=203999', label: 'Luka vs Jokić' },
  { href: '/compare?a=1628369&b=2544', label: 'Tatum vs LeBron' },
];

function surname(name: string) {
  const parts = name.trim().split(/\s+/);
  // "Jaren Jackson Jr." reads as Jackson, not Jr.
  const last = parts[parts.length - 1];
  return /^(jr|sr|ii|iii|iv)\.?$/i.test(last) && parts.length > 2 ? parts[parts.length - 2] : last;
}

/** Neighbours on the current leaderboard: #1 v #2, #3 v #4, #5 v #6. */
function leaderMatchups(leaders: BIQLeaderboardEntry[]) {
  const pairs = [];
  for (let i = 0; i + 1 < Math.min(leaders.length, 6); i += 2) {
    const [a, b] = [leaders[i], leaders[i + 1]];
    pairs.push({ href: `/compare?a=${a.id}&b=${b.id}`, label: `${surname(a.name)} vs ${surname(b.name)}` });
  }
  return pairs.length ? pairs : FALLBACK_MATCHUPS;
}

function MatchupLinks({ matchups }: { matchups: { href: string; label: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
      {matchups.map((matchup) => (
        <Link key={matchup.href} href={matchup.href} className="biq-link" style={{ fontSize: 14 }}>
          {matchup.label}
        </Link>
      ))}
    </div>
  );
}

function getAdvantageLine(a: ComparePlayerCard, b: ComparePlayerCard) {
  const gap = Math.abs(a.biqScore - b.biqScore).toFixed(1);
  if (a.biqScore > b.biqScore) return `BIQ advantage +${gap} · ${a.name}`;
  if (b.biqScore > a.biqScore) return `BIQ advantage +${gap} · ${b.name}`;
  return 'BIQ advantage 0.0 · Even';
}

/** "Dončić leads 4 of 7 head-to-head · Wembanyama 3", ties named if any. */
function tallyLine(a: ComparePlayerCard, b: ComparePlayerCard, h2h: HeadToHead) {
  const even = h2h.total - h2h.wins.a - h2h.wins.b;
  const [lead, trail, leadWins, trailWins] =
    h2h.wins.a >= h2h.wins.b ? [a, b, h2h.wins.a, h2h.wins.b] : [b, a, h2h.wins.b, h2h.wins.a];
  const head =
    leadWins === trailWins
      ? `Split ${leadWins}–${trailWins} head-to-head`
      : `${surname(lead.name)} leads ${leadWins} of ${h2h.total} head-to-head · ${surname(trail.name)} ${trailWins}`;
  return even > 0 ? `${head} · ${even} even` : head;
}

function SubjectCard({
  player,
  slot,
  h2h,
}: {
  player: ComparePlayerCard;
  slot: 'A' | 'B';
  h2h: HeadToHead;
}) {
  const side: Side = slot === 'A' ? 'a' : 'b';
  return (
    <div className="biq-card" style={{ padding: 28, height: '100%' }}>
      <p className="biq-mono">Player {slot}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '18px 0 24px' }}>
        <SubjectPhoto id={player.id} name={player.name} size={80} />
        <div style={{ minWidth: 0 }}>
          <Link href={`/players/${player.id}`} className="biq-link" style={{ color: 'var(--ink)' }}>
            <span className="biq-display" style={{ display: 'block', fontSize: 'clamp(22px, 2.4vw, 32px)' }}>
              {player.name}
            </span>
          </Link>
          <p style={{ marginTop: 4, fontSize: 14, color: 'var(--fog)' }}>
            {joinMeta(player.team, knownPosition(player.position))}
          </p>
        </div>
      </div>

      <ScoreMeter value={player.biqScore} label="BIQ SCORE" tier={player.biqTier} size="lg" />

      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        <p className="biq-mono" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Recent form
          {h2h.form === side ? <EdgeTag /> : null}
        </p>
        <p
          className="biq-num"
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: '8px 0 6px',
            color: player.recentFormScore == null ? 'var(--fog)' : h2h.form === side ? 'var(--key)' : undefined,
          }}
        >
          {player.recentFormScore == null ? '—' : player.recentFormScore.toFixed(1)}
        </p>
        <MeterBar value={player.recentFormScore ?? 0} />
        {player.recentFormScore == null ? (
          <p className="biq-mono" style={{ marginTop: 6, fontSize: 10 }}>Needs a few more games</p>
        ) : null}
      </div>

      <div style={{ marginTop: 24 }}>
        <p className="biq-mono" style={{ marginBottom: 10 }}>Analyst note</p>
        <div style={{ borderLeft: '3px solid var(--key)', paddingLeft: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>{player.insight}</p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <RuleGrid min={150}>
          {/* BIQ is the ScoreMeter above; don't print it twice. */}
          {player.stats.filter((stat) => stat.label !== 'BIQ').map((stat) => (
            <StatCell key={`${player.id}-${stat.label}`} {...stat} edge={h2h.stats.get(stat.label) === side} />
          ))}
        </RuleGrid>
      </div>

      <div style={{ marginTop: 28 }}>
        <p className="biq-mono" style={{ marginBottom: 14 }}>Recent trend · Last 10 · PTS</p>
        <TrendBars data={player.recentTrend} height={140} barHeight={100} />
      </div>
    </div>
  );
}

// Each ?a=&b= pair is a generated view, not a page worth indexing.
export const metadata = pageMetadata({
  title: 'Compare NBA players',
  description: 'Put two NBA players side by side and see where their BIQ profiles split.',
  path: '/compare',
});

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const playerA = searchParams.a?.trim();
  const playerB = searchParams.b?.trim();
  const season = await fetchCurrentSeason();

  let leaders: BIQLeaderboardEntry[] = [];
  try {
    leaders = await fetchCachedJSON<BIQLeaderboardEntry[]>('/api/players/biq-leaders?limit=25', 300);
  } catch (error) {
    console.error('Failed to load leaders for matchups', error);
  }
  const matchups = leaderMatchups(leaders);

  let compare: CompareResponse | null = null;

  if (playerA && playerB) {
    try {
      compare = await fetchCachedJSON<CompareResponse>(
        `/api/compare?player_a=${encodeURIComponent(playerA)}&player_b=${encodeURIComponent(playerB)}`,
        300
      );
    } catch (error) {
      console.error('Failed to load compare data', error);
    }
  }

  const h2h = compare ? headToHead(compare.playerA, compare.playerB) : null;

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <ComparePlayerPicker
        season={season}
        known={
          compare
            ? Object.fromEntries(
                [compare.playerA, compare.playerB].map((p) => [
                  String(p.id),
                  joinMeta(p.name, p.team, knownPosition(p.position)),
                ]),
              )
            : {}
        }
      />

      {compare && h2h && (
        <>
          {/* ---------------- THE SUBJECT CARDS ---------------- */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
              gap: 20,
              padding: '40px 0',
            }}
          >
            <SubjectCard player={compare.playerA} slot="A" h2h={h2h} />
            <SubjectCard player={compare.playerB} slot="B" h2h={h2h} />
          </section>

          {/* ---------------- THE VERDICT ---------------- */}
          <section style={{ padding: '0 0 48px' }}>
            <div className="biq-card" style={{ padding: 28, borderLeft: '3px solid var(--key)' }}>
              <p className="biq-mono biq-signal">The verdict</p>
              <p className="biq-display" style={{ marginTop: 10, fontSize: 'clamp(18px, 2vw, 24px)' }}>
                {getAdvantageLine(compare.playerA, compare.playerB)}
              </p>
              {h2h.total > 0 ? (
                <p className="biq-mono" style={{ marginTop: 10 }}>
                  {tallyLine(compare.playerA, compare.playerB, h2h)}
                </p>
              ) : null}
              <hr className="biq-rule-line" style={{ margin: '18px 0' }} />
              <p style={{ maxWidth: '80ch', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)' }}>
                {compare.summary}
              </p>
            </div>

            <MatchupLinks matchups={matchups} />
          </section>
        </>
      )}

      {/* Nothing picked yet: offer the closest races at the top of the board
          rather than an empty page under the picker. */}
      {!playerA && !playerB ? (
        <section style={{ padding: '8px 0 88px' }}>
          <p className="biq-mono">Close races on the leaderboard</p>
          <MatchupLinks matchups={matchups} />
        </section>
      ) : null}

      {!compare && playerA && playerB && (
        <section style={{ padding: '40px 0' }}>
          <div className="biq-card" style={{ padding: 28 }}>
            <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
              Comparison unavailable
            </p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              The selected players could not be compared right now. Try another matchup.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
