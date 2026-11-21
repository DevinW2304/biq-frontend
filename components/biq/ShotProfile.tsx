// Shot profile: one row per zone. The bar is the share of attempts taken
// from the zone, with a tick at the league's share; the figures beside it
// carry the exact numbers, so nothing depends on reading the bar. Static,
// server-component safe.
import type { ShotZone } from '@/lib/types';
import { formatPct, formatSigned, signedColor } from '@/lib/format';

/** Fewer attempts than this and a zone's accuracy is shown without a comparison. */
const MIN_ATTEMPTS_FOR_COMPARISON = 10;

function describe(zone: ShotZone, subject: string) {
  const parts = [`${zone.attempts} attempts`, `${formatPct(zone.frequency)} of ${subject} shots`];
  if (zone.leagueFrequency != null) parts.push(`league ${formatPct(zone.leagueFrequency)}`);
  if (zone.accuracy != null) {
    parts.push(
      `${formatPct(zone.accuracy)} made` +
        (zone.leagueAccuracy != null ? ` (league ${formatPct(zone.leagueAccuracy)})` : ''),
    );
  }
  return parts.join(' · ');
}

export function ShotProfile({
  zones,
  subject = 'his',
}: {
  zones: ShotZone[];
  /** Whose shots these are, for the hover text: "his" or "the team's". */
  subject?: string;
}) {
  if (!zones.length) return null;
  // One scale for every row, so bar lengths compare across zones.
  const scale = Math.max(0.01, ...zones.flatMap((z) => [z.frequency, z.leagueFrequency ?? 0]));

  return (
    <div className="biq-card" style={{ padding: '8px 24px 16px' }}>
      <div className="biq-zone-row biq-zone-head" aria-hidden="true">
        <span className="biq-mono">Zone</span>
        <span className="biq-mono">Share of shots · tick marks the league</span>
        <span className="biq-mono" style={{ textAlign: 'right' }}>Share</span>
        <span className="biq-mono" style={{ textAlign: 'right' }}>Made</span>
        <span className="biq-mono" style={{ textAlign: 'right' }}>vs league</span>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {zones.map((zone) => {
          const comparable =
            zone.accuracy != null &&
            zone.leagueAccuracy != null &&
            zone.attempts >= MIN_ATTEMPTS_FOR_COMPARISON;
          const delta = comparable ? (zone.accuracy! - zone.leagueAccuracy!) * 100 : null;
          return (
            <li key={zone.key} className="biq-zone-row" title={describe(zone, subject)}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{zone.label}</span>
              <span className="biq-zone-bar" role="presentation">
                <span
                  className="biq-zone-fill"
                  style={{ width: `${(zone.frequency / scale) * 100}%` }}
                />
                {zone.leagueFrequency != null ? (
                  <span
                    className="biq-zone-tick"
                    style={{ left: `${(zone.leagueFrequency / scale) * 100}%` }}
                  />
                ) : null}
              </span>
              <span className="biq-num" style={{ textAlign: 'right', fontSize: 14, fontWeight: 600 }}>
                {formatPct(zone.frequency)}
              </span>
              <span className="biq-num" style={{ textAlign: 'right', fontSize: 14 }}>
                {zone.accuracy != null ? formatPct(zone.accuracy) : '—'}
              </span>
              <span
                className="biq-num"
                style={{ textAlign: 'right', fontSize: 14, color: delta != null ? signedColor(delta) : 'var(--fog)' }}
              >
                {delta != null ? formatSigned(delta) : '—'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
