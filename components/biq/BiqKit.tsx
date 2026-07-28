// BiqKit.tsx — COURT PAPER primitives. Plain React + biq-theme.css classes.
// The ScoreMeter gauge fill is the site's single signature motion; everything
// else is static with quiet hover states.
'use client';

import { useRef, type ReactNode } from 'react';
import { useInView } from './biq-motion';

/* ------------------------------------------------------------------ */
/* MeterBar: the signature gauge. A 3px track whose key-blue fill      */
/* transitions to value/max on first scroll-into-view. Reduced-motion  */
/* users see it filled (transition disabled in CSS).                   */
/* ------------------------------------------------------------------ */

export function MeterBar({
  value,
  max = 100,
  className = '',
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const open = useInView(ref);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span ref={ref} className={`biq-meter-track ${className}`}>
      <span className="biq-meter-fill" style={{ width: open ? `${pct}%` : '0%' }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ScoreMeter: the consistent BIQ score unit — optional label, tabular */
/* number, optional tier chip, gauge underneath. Use for every BIQ     */
/* verdict on the site.                                                */
/* ------------------------------------------------------------------ */

const SCORE_SIZES = {
  sm: 'clamp(22px, 2.4vw, 28px)',
  md: 'clamp(30px, 3.4vw, 44px)',
  lg: 'clamp(48px, 5.5vw, 72px)',
  xl: 'clamp(64px, 8vw, 128px)',
} as const;

export function ScoreMeter({
  value,
  max = 100,
  decimals = 1,
  label,
  tier,
  size = 'md',
  align = 'left',
  className = '',
}: {
  value: number;
  max?: number;
  decimals?: number;
  label?: string;
  tier?: string;
  size?: keyof typeof SCORE_SIZES;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div className={className} style={{ textAlign: align, minWidth: 0 }}>
      {label ? <p className="biq-mono">{label}</p> : null}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: label ? 6 : 0,
        }}
      >
        <span
          className="biq-display biq-signal"
          style={{
            fontSize: SCORE_SIZES[size],
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value.toFixed(decimals)}
        </span>
        {tier ? <span className="biq-chip">{tier}</span> : null}
      </div>
      <div style={{ marginTop: 10 }}>
        <MeterBar value={value} max={max} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeader: small-caps label over the section title. Static.     */
/* ------------------------------------------------------------------ */

export function SectionHeader({
  label,
  title,
  action,
  className = '',
}: {
  label: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="biq-mono">{label}</p>
          <h2 className="biq-display biq-h2-size" style={{ marginTop: 6 }}>
            {title}
          </h2>
        </div>
        {action ?? null}
      </div>
      <hr className="biq-rule-line" style={{ marginTop: 16 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TierChip: the tier string as a quiet pill.                          */
/* ------------------------------------------------------------------ */

export function TierChip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`biq-chip ${className}`}>{children}</span>;
}
