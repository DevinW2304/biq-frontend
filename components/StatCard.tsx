import { StatCardData } from '@/lib/types';

export function StatCard({ label, value, subtext, description }: StatCardData) {
  return (
    <div
      className="stat-card"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        padding: '1.375rem',
        transition: 'border-color 0.15s ease, background 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top-left corner accent */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          background: 'radial-gradient(circle at top left, rgba(201,168,76,0.07), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <p
        style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '0.875rem',
        }}
      >
        {label}
      </p>

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.4rem',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: 'var(--text)',
          marginBottom: subtext ? '0.5rem' : 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </h3>

      {subtext ? (
        <p
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--text-2)',
            marginBottom: description ? '0.625rem' : 0,
          }}
        >
          {subtext}
        </p>
      ) : null}

      {description ? (
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.78rem',
            lineHeight: 1.65,
            color: 'var(--muted)',
          }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}