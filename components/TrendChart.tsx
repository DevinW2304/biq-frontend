'use client';

import {
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
};

export function TrendChart({ data, title }: TrendChartProps) {
  return (
    <section className="card p-6">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d6b25e]">
          Trend
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-zinc-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Recent game-by-game scoring trend from the current season sample.
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#171a20',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#f4f4f5',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#d6b25e"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}