import Link from 'next/link';
import { BIQStorySwap } from '@/components/BIQStorySwap';
import styles from './page.module.css';

const pillars = [
  {
    label: 'Engine',
    value: 'Usage + pressure',
    text: 'Measures how much offensive work a player can carry without the entire possession collapsing.',
  },
  {
    label: 'Creation',
    value: 'Advantage generation',
    text: 'Captures who bends the defense, creates clean looks, and turns possessions into real scoring chances.',
  },
  {
    label: 'Impact',
    value: 'Winning signal',
    text: 'Looks beyond raw totals to ask how strongly a player’s possessions translate to team value.',
  },
];

const outcomes = [
  'A scoring model built to reward useful offensive burden, not just volume.',
  'Player pages that explain why someone grades highly instead of only displaying a rank.',
  'A cleaner analytics experience that feels more editorial than spreadsheet-heavy.',
];

export default function ModelPage() {
  return (
    <>
     

      <main className="page-shell" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <section
          className="card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem',
            marginBottom: '2rem',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-2rem',
              right: '-1rem',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(8rem, 18vw, 14rem)',
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '1px rgba(201, 168, 76, 0.06)',
              letterSpacing: '0.05em',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            MODEL
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
            <p className="eyebrow" style={{ marginBottom: '1rem' }}>
              BIQ Model
            </p>

            <h1
              className="display hero-title-glow"
              style={{
                fontSize: 'clamp(3rem, 7vw, 6rem)',
                lineHeight: 0.92,
                color: 'var(--text)',
                marginBottom: '1rem',
                maxWidth: '10ch',
              }}
            >
              HOW BIQ
              <br />
              WORKS,
              <br />
              LAYER BY
              <br />
              LAYER.
            </h1>

            <p
              className="serif-italic"
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.8,
                color: 'var(--muted)',
                maxWidth: 720,
                marginBottom: '1.5rem',
              }}
            >
              BIQ started as a way to think about player value more clearly than traditional box
              score reading. The goal was not just to rank players, but to build an experience that
              explains burden, creation, efficiency, and impact in a way that feels readable.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/leaderboard" className="btn btn-primary btn-animated">
                View Leaderboard
              </Link>
              <Link href="/players?q=" className="btn btn-ghost btn-animated">
                Explore Players
              </Link>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <BIQStorySwap />
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div className="section-head" style={{ marginBottom: '1px' }}>
            <span className="section-title">What The Model Is Trying To Measure</span>
          </div>

          <div
            className="grid-ruled"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
          >
            {pillars.map((item) => (
              <article key={item.label} style={{ padding: '1.4rem' }}>
                <div
                  className="leader-rank"
                  style={{ marginBottom: '0.75rem', color: 'var(--gold)' }}
                >
                  {item.label}
                </div>
                <h3
                  className="display"
                  style={{
                    fontSize: '1.5rem',
                    color: 'var(--text)',
                    marginBottom: '0.55rem',
                  }}
                >
                  {item.value}
                </h3>
                <p className="muted-copy" style={{ fontSize: '0.82rem' }}>
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <div className="section-head" style={{ marginBottom: '1px' }}>
            <span className="section-title">What Came Out Of It</span>
          </div>

          <div className="grid-ruled" style={{ gridTemplateColumns: '1fr' }}>
            {outcomes.map((item, index) => (
              <div
                key={item}
                style={{
                  padding: '1.15rem 1.4rem',
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: '1rem',
                  alignItems: 'start',
                  borderBottom:
                    index === outcomes.length - 1 ? 'none' : '1px solid var(--border)',
                }}
              >
                <div
                  className="display"
                  style={{
                    fontSize: '2rem',
                    color: 'var(--faint)',
                    lineHeight: 1,
                  }}
                >
                  0{index + 1}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.96rem',
                    lineHeight: 1.85,
                    color: 'var(--text-2)',
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: '1.5rem' }}>
          <div className="section-head" style={{ marginBottom: '1rem' }}>
            <span className="section-title">Why This Page Exists</span>
          </div>

          <div className={styles.whyGrid}>
            <p
              className="serif-italic"
              style={{
                fontSize: '0.98rem',
                lineHeight: 1.9,
                color: 'var(--text-2)',
              }}
            >
              BIQ is meant to feel like both a product and a point of view. This page gives the
              model more narrative context: what problem it is solving, how the layers connect, and
              how the interface supports the scoring logic rather than hiding it.
            </p>

            <div
              className="card-flush"
              style={{ padding: '1rem', borderLeft: '2px solid var(--gold)' }}
            >
              <div className="leader-rank" style={{ marginBottom: '0.55rem' }}>
                Portfolio Context
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  lineHeight: 1.75,
                  color: 'var(--muted)',
                }}
              >
                Product design, analytics thinking, interface systems, and full-stack implementation
                all meet here.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}