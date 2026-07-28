import { StatCardData } from '@/lib/types';

export function StatCard({ label, value, subtext, description }: StatCardData) {
  return (
    <div className="stat-card" style={{ padding: '1.375rem' }}>
      <p
        style={{
          fontFamily: 'var(--font-file)',
          fontSize: '0.62rem',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '0.875rem',
        }}
      >
        {label}
      </p>

      <h3
        style={{
          fontFamily: 'var(--font-file)',
          fontSize: '1.7rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
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
            fontFamily: 'var(--font-file)',
            fontSize: '0.66rem',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: description ? '0.625rem' : 0,
          }}
        >
          {subtext}
        </p>
      ) : null}

      {description ? (
        <p
          style={{
            fontFamily: 'var(--font-body)',
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