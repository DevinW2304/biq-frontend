type ScoreCardProps = {
  label: string;
  value: string;
  description: string;
  accent?: 'gold' | 'teal' | 'default';
};

export function ScoreCard({ label, value, description, accent = 'gold' }: ScoreCardProps) {
  const accentColor =
    accent === 'gold' ? 'var(--gold)' :
    accent === 'teal' ? 'var(--teal)' :
    'var(--text)';

  return (
    <div
      className="score-card"
      style={{
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        padding: '1.625rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: accentColor,
          opacity: 0.8,
        }}
      />

      {/* Large ghost value in bg */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-0.5rem',
          bottom: '-1rem',
          fontFamily: 'var(--font-display)',
          fontSize: '7rem',
          lineHeight: 1,
          letterSpacing: '0.04em',
          color: 'transparent',
          WebkitTextStroke: `1px rgba(255,255,255,0.03)`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {value}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: accentColor,
          marginBottom: '0.875rem',
        }}
      >
        {label}
      </p>

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '4rem',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: 'var(--text)',
          marginBottom: '0.875rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '0.82rem',
          lineHeight: 1.75,
          color: 'var(--muted)',
          maxWidth: '38ch',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {description}
      </p>
    </div>
  );
}