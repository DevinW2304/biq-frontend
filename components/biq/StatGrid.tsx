// Stat tile grid: white cards separated by hairlines, mono values.
// Server-component safe.
import { Children, type ReactNode } from 'react';
import { StatCardData } from '@/lib/types';

export function RuleGrid({
  children,
  min = 200,
}: {
  children: ReactNode;
  min?: number;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        gap: 1,
        background: 'var(--line)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}
    >
      {Children.map(children, (child) => (
        <div style={{ background: '#fff', minWidth: 0 }}>{child}</div>
      ))}
    </div>
  );
}

export function StatCell({ label, value, subtext, description }: StatCardData) {
  return (
    <div style={{ padding: 20 }}>
      <p className="biq-mono">{label}</p>
      <p
        className="biq-num"
        style={{ fontSize: 26, fontWeight: 600, marginTop: 10, letterSpacing: '-0.01em' }}
      >
        {value}
      </p>
      {subtext ? (
        <p className="biq-mono" style={{ marginTop: 8, fontSize: 10 }}>{subtext}</p>
      ) : null}
      {description ? (
        <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)' }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
