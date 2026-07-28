// app/compare/page.tsx — COURT PAPER comparison: two subject cards and a
// verdict panel. Server component; data flow unchanged (fetchCachedJSON,
// revalidate 300, ?a=&b= query params).

export const revalidate = 300;

import Link from 'next/link';
import { fetchCachedJSON } from '@/lib/api';
import { CompareResponse, ComparePlayerCard } from '@/lib/types';
import { MeterBar, ScoreMeter } from '@/components/biq/BiqKit';
import { RuleGrid, StatCell } from '@/components/biq/StatGrid';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import { TrendBars } from '@/components/biq/TrendBars';
import { ComparePlayerPicker } from '@/components/ComparePlayerPicker';

const QUICK_MATCHUPS = [
  { href: '/compare?a=2544&b=201939', label: 'LeBron vs Curry' },
  { href: '/compare?a=1629029&b=203999', label: 'Luka vs Jokic' },
  { href: '/compare?a=1628369&b=2544', label: 'Tatum vs LeBron' },
];

function getAdvantageLine(a: ComparePlayerCard, b: ComparePlayerCard) {
  const gap = Math.abs(a.biqScore - b.biqScore).toFixed(1);
  if (a.biqScore > b.biqScore) return `BIQ advantage +${gap} · ${a.name}`;
  if (b.biqScore > a.biqScore) return `BIQ advantage +${gap} · ${b.name}`;
  return 'BIQ advantage 0.0 · Even';
}

function SubjectCard({ player, slot }: { player: ComparePlayerCard; slot: 'A' | 'B' }) {
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
            {player.team} · {player.position}
          </p>
        </div>
      </div>

      <ScoreMeter value={player.biqScore} label="BIQ SCORE" tier={player.biqTier} size="lg" />

      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
        <p className="biq-mono">Recent form</p>
        <p className="biq-num" style={{ fontSize: 22, fontWeight: 600, margin: '8px 0 6px' }}>
          {player.recentFormScore.toFixed(1)}
        </p>
        <MeterBar value={player.recentFormScore} />
      </div>

      <div style={{ marginTop: 24 }}>
        <p className="biq-mono" style={{ marginBottom: 10 }}>Analyst note</p>
        <div style={{ borderLeft: '3px solid var(--key)', paddingLeft: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>{player.insight}</p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <RuleGrid min={150}>
          {player.stats.map((stat) => (
            <StatCell key={`${player.id}-${stat.label}`} {...stat} />
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

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string };
}) {
  const playerA = searchParams.a?.trim();
  const playerB = searchParams.b?.trim();

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

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <ComparePlayerPicker />

      {compare && (
        <>
          {/* ---------------- THE SUBJECT CARDS ---------------- */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 20,
              padding: '40px 0',
            }}
          >
            <SubjectCard player={compare.playerA} slot="A" />
            <SubjectCard player={compare.playerB} slot="B" />
          </section>

          {/* ---------------- THE VERDICT ---------------- */}
          <section style={{ padding: '0 0 48px' }}>
            <div className="biq-card" style={{ padding: 28, borderLeft: '3px solid var(--key)' }}>
              <p className="biq-mono biq-signal">The verdict</p>
              <p className="biq-display" style={{ marginTop: 10, fontSize: 'clamp(18px, 2vw, 24px)' }}>
                {getAdvantageLine(compare.playerA, compare.playerB)}
              </p>
              <hr className="biq-rule-line" style={{ margin: '18px 0' }} />
              <p style={{ maxWidth: '80ch', fontSize: 15, lineHeight: 1.75, color: 'var(--ink-2)' }}>
                {compare.summary}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 20 }}>
              {QUICK_MATCHUPS.map((matchup) => (
                <Link key={matchup.href} href={matchup.href} className="biq-link" style={{ fontSize: 14 }}>
                  {matchup.label}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

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
