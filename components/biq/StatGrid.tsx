// Stat tile grid: white cards separated by hairlines, mono values.
// Server-component safe.
import { Children, type ReactNode } from 'react';
import { StatCardData } from '@/lib/types';
import { ordinal } from '@/lib/format';
import { MeterBar } from './BiqKit';

export function RuleGrid({
  children,
  min = 200,
}: {
  children: ReactNode;
  min?: number;
}) {
  // Each cell draws its own right and bottom hairline. Drawing them as gaps
  // over a line-colored background instead turned the unused cells of a
  // short last row into a solid block of that color.
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}
    >
      {Children.map(children, (child) => (
        <div style={{ minWidth: 0, boxShadow: '1px 0 0 var(--line), 0 1px 0 var(--line)' }}>{child}</div>
      ))}
    </div>
  );
}

/**
 * Where a value ranks among the league's rotation players: a gauge and the
 * percentile in words. Always oriented so a fuller gauge is better.
 */
export function PercentileMark({ value }: { value: number }) {
  // "100th percentile" isn't a thing; the top of the scale is the 99th.
  const shown = Math.min(99, Math.max(1, Math.round(value)));
  return (
    <div style={{ marginTop: 10 }}>
      <MeterBar value={value} />
      <p className="biq-mono" style={{ marginTop: 6, fontSize: 10 }}>
        {ordinal(shown)} percentile
      </p>
    </div>
  );
}

export function StatCell({ label, value, subtext, description, percentile }: StatCardData) {
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
      {percentile != null ? <PercentileMark value={percentile} /> : null}
      {description ? (
        <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)' }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
