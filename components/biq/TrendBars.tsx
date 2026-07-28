// Static trend bar chart: quiet sand bars, the latest game in key blue,
// mono value and G1..Gn labels. Server-component safe.
import { TrendPoint } from '@/lib/types';

export function TrendBars({
  data,
  height = 220,
  barHeight = 170,
}: {
  data: TrendPoint[];
  height?: number;
  barHeight?: number;
}) {
  const trend = data.slice(-10);
  if (!trend.length) return null;
  const max = Math.max(1, ...trend.map((t) => t.value));

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${trend.length}, 1fr)`,
          gap: 12,
          alignItems: 'end',
          height,
          borderBottom: '1px solid var(--line-strong)',
        }}
      >
        {trend.map((point, index) => {
          const latest = index === trend.length - 1;
          return (
            <div
              key={`${point.label}-${index}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                height: '100%',
              }}
            >
              <span
                className="biq-num"
                style={{ fontSize: 12, color: latest ? 'var(--key)' : 'var(--fog)', fontWeight: latest ? 600 : 400 }}
              >
                {point.value.toFixed(0)}
              </span>
              <span
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 48,
                  height: `${Math.max(4, (point.value / max) * barHeight)}px`,
                  background: latest ? 'var(--key)' : 'var(--line)',
                  borderRadius: '3px 3px 0 0',
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${trend.length}, 1fr)`,
          gap: 12,
          marginTop: 10,
        }}
      >
        {trend.map((_, index) => (
          <span key={`label-${index}`} className="biq-mono" style={{ textAlign: 'center', fontSize: 10 }}>
            G{index + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
