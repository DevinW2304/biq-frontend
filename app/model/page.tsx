// app/model/page.tsx — COURT PAPER model explainer. Every weight, tier band
// and gate on this page comes from /api/model, so it describes the model the
// live scores are computed with rather than a copy that can drift.
export const revalidate = 3600;

import Link from 'next/link';
import { fetchModelSummary } from '@/lib/api';
import { describeGate } from '@/lib/model';
import { pageMetadata } from '@/lib/site';
import type { ModelComponent } from '@/lib/types';
import { MeterBar, SectionHeader } from '@/components/biq/BiqKit';

export const metadata = pageMetadata({
  title: 'How the model works',
  description: 'What goes into a BIQ score: engine, creation, efficiency, impact, availability and the rest, and how they are weighted.',
  path: '/model',
});

function pct(weight: number) {
  return `${Math.round(weight * 100)}%`;
}

function WeightRows({ rows }: { rows: ModelComponent[] }) {
  return (
    <ol className="biq-ledger" style={{ marginTop: 12 }}>
      {rows.map((row) => (
        <li key={row.label} className="biq-row">
          <div className="biq-weight-row">
            <span className="biq-display" style={{ fontSize: 17, fontWeight: 600 }}>
              {row.label}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>{row.explanation}</span>
            <span className="biq-weight-bar">
              <MeterBar value={row.weight * 100} />
            </span>
            <span className="biq-num" style={{ fontSize: 20, fontWeight: 600, textAlign: 'right' }}>
              {pct(row.weight)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function ModelPage() {
  const model = await fetchModelSummary();
  const components = model ? [...model.components].sort((a, b) => b.weight - a.weight) : [];
  const tiers = model?.tiers ?? [];

  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* ---------------- COVER ---------------- */}
      <section style={{ padding: '56px 0 40px' }}>
        <p className="biq-mono">The BIQ model</p>
        <h1 className="biq-display biq-hero-size" style={{ marginTop: 12, maxWidth: '15ch' }}>
          How a BIQ score is built
        </h1>
        <p style={{ marginTop: 18, maxWidth: '62ch', fontSize: 16, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          BIQ turns a season of box-score and on-court data into one number from 0 to 100 for what
          a player is worth to a team. Every input is scored as a percentile against the
          league&apos;s rotation players, then blended with the weights below. Two scores come out
          of it: BIQ, the broad read on value, and rank score, which orders the leaderboard.
        </p>
      </section>

      {!model ? (
        <section style={{ padding: '0 0 88px' }}>
          <div className="biq-card" style={{ padding: 28 }}>
            <p className="biq-display" style={{ fontSize: 18, fontWeight: 600 }}>
              The model details didn&apos;t load
            </p>
            <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              The weights come straight from the scoring service, which isn&apos;t responding.
              Reload in a minute, or see the scores themselves on the{' '}
              <Link href="/leaderboard" className="biq-link">leaderboard</Link>.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* ---------------- STEP 1: BIQ ---------------- */}
          <section style={{ padding: '40px 0' }}>
            <SectionHeader label={`Step 1 · ${components.length} weighted inputs`} title="The BIQ score" />
            <p style={{ marginTop: 20, maxWidth: '64ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
              BIQ is a weighted average of these inputs. Engine, impact and efficiency carry most of
              it; the rest keep a one-dimensional scorer from grading like a complete player. Players
              who have missed a large share of games take a small reduction on top.
            </p>
            <WeightRows rows={components} />
          </section>

          {/* ---------------- STEP 2: RANK SCORE ---------------- */}
          <section id="rank-score" className="biq-anchor" style={{ padding: '40px 0' }}>
            <SectionHeader label="Step 2 · What orders the board" title="Rank score" />
            <p style={{ marginTop: 20, maxWidth: '64ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
              Two players can post the same BIQ with very different jobs. Rank score separates them
              by blending BIQ with two views of how much offense a player carries, then applying
              adjustments: a bonus when someone is elite at carrying, creating and scoring
              efficiently all at once, and penalties for profiles that look like stars on volume
              alone.
            </p>
            <WeightRows rows={model.rankBlend} />
          </section>

          {/* ---------------- TIERS ---------------- */}
          <section style={{ padding: '40px 0' }}>
            <SectionHeader label="What a score means" title="Tiers" />
            <ol className="biq-ledger" style={{ marginTop: 12 }}>
              {tiers.map((tier, index) => {
                const ceiling = index === 0 ? 100 : tiers[index - 1].minScore;
                return (
                  <li key={tier.label} className="biq-row">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 8px' }}>
                      <span className="biq-chip">{tier.label}</span>
                      <span className="biq-num" style={{ fontSize: 15 }}>
                        {index === 0
                          ? `${tier.minScore}+`
                          : tier.minScore === 0
                            ? `Below ${ceiling}`
                            : `${tier.minScore} to ${ceiling}`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* ---------------- QUALIFICATION ---------------- */}
          <section style={{ padding: '40px 0 88px' }}>
            <SectionHeader label="Who gets ranked" title="Qualifying for the board" />
            <p style={{ marginTop: 20, maxWidth: '64ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
              The leaderboard only ranks players with {describeGate(model)}, so it compares
              established starters with enough of a sample to trust. Everyone else still gets a
              full profile and a BIQ score.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <Link href="/leaderboard" className="biq-btn">
                See the leaderboard
              </Link>
              <Link href="/players" className="biq-btn-ghost">
                Search every player
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
