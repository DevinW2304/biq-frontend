'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendPoint } from '@/lib/types';

type TrendChartProps = {
  data: TrendPoint[];
  title: string;
  useArea?: boolean;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'var(--s2)',
        border: '1px solid var(--border-strong)',
        padding: '0.75rem 1rem',
        boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '0.375rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          letterSpacing: '0.04em',
          lineHeight: 1,
          color: 'var(--gold)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {payload[0]?.value?.toFixed(1)}
      </div>
    </div>
  );
}

export function TrendChart({ data, title, useArea = true }: TrendChartProps) {
  return (
    <section
      style={{
        background: 'var(--s1)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.5rem 1.75rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, var(--gold), transparent 60%)',
          }}
        />

        <p
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '0.5rem',
          }}
        >
          Trend
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}
        >
          Game-by-game scoring trend from the current season sample.
        </p>
      </div>

      {/* Chart */}
      <div style={{ height: 320, padding: '1.25rem 0.5rem 0.5rem 0' }}>
        <ResponsiveContainer width="100%" height="100%">
          {useArea ? (
            <AreaChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tick={{
                  fill: 'var(--muted)',
                  fontSize: 11,
                  fontFamily: 'var(--font-condensed)',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: 'var(--muted)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.2)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#c9a84c"
                strokeWidth={2}
                fill="url(#goldGradient)"
                dot={{ r: 3, fill: '#c9a84c', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#e8c56e', strokeWidth: 0 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tick={{
                  fill: 'var(--muted)',
                  fontSize: 11,
                  fontFamily: 'var(--font-condensed)',
                  fontWeight: 600,
                }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.2)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#c9a84c"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#c9a84c', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#e8c56e', strokeWidth: 0 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}