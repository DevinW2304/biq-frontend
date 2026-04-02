type SplitTileProps = {
  label: string;
  value: string;
  delta?: { direction: 'up' | 'down' | 'flat'; text: string };
};

export function SplitTile({ label, value, delta }: SplitTileProps) {
  const deltaColor =
    delta?.direction === 'up' ? 'var(--teal)' :
    delta?.direction === 'down' ? 'var(--danger)' :
    'var(--muted)';

  return (
    <div
      className="split-tile"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        padding: '1rem 1.125rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {/* Left accent */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: '25%',
          bottom: '25%',
          width: '2px',
          background: 'var(--gold)',
          opacity: 0.5,
        }}
      />

      <p
        className="split-tile-label"
        style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </p>

      <p
        className="split-tile-value"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>

      {delta && (
        <p
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.62rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: deltaColor,
            marginTop: '0.3rem',
          }}
        >
          {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : '–'}{' '}
          {delta.text}
        </p>
      )}
    </div>
  );
}