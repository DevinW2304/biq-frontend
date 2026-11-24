// BIQ's starting five, set as a newspaper-style figure: a half court with
// numbered markers at the five spots and a key that names them. Server
// component.
import Link from 'next/link';
import { SubjectPhoto } from '@/components/biq/SubjectPhoto';
import type { LineupSlot, Spot } from '@/lib/lineup';
import { teamNickname } from '@/lib/teams';

const SPOT_NAME: Record<Spot, string> = { G: 'Guard', F: 'Forward', C: 'Center' };

/** Court spots, in % of the court box, in slot order (G, G, F, F, C): the
 *  higher-ranked guard at the top of the key, the other on the left wing,
 *  the higher-ranked forward on the right wing, the other on the left block,
 *  the center on the right block. */
const SPOTS = [
  { left: 50, top: 30 },
  { left: 17, top: 50 },
  { left: 83, top: 50 },
  { left: 29, top: 80 },
  { left: 71, top: 80 },
];

/** A regulation half court, 10 units to the foot (50 x 47 ft), baseline at
 *  the bottom. */
function Court() {
  return (
    <svg className="biq-five-lines" viewBox="0 0 500 470" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="498" height="468" className="biq-five-floor" />
      <rect x="170" y="280" width="160" height="190" className="biq-five-paint" />
      <g className="biq-five-line">
        <path d="M190 0 A 60 60 0 0 0 310 0" />
        <rect x="170" y="280" width="160" height="190" />
        <circle cx="250" cy="280" r="60" />
        <path d="M30 470 V328 A 237.5 237.5 0 0 1 470 328 V470" />
        <path d="M210 417.5 A 40 40 0 0 1 290 417.5" />
      </g>
      <line x1="220" y1="430" x2="280" y2="430" className="biq-five-hoop" />
      <circle cx="250" cy="417.5" r="9" className="biq-five-hoop" />
    </svg>
  );
}

export function StartingFive({
  slots,
  dataThrough,
}: {
  slots: LineupSlot[];
  /** The latest game in the data, already formatted ("Nov 21"). */
  dataThrough: string | null;
}) {
  // Numbered by rank score among the five: 1 is the top score.
  const ranked = slots
    .flatMap((slot, index) => (slot.player ? [{ slot, index, player: slot.player }] : []))
    .sort((a, b) => b.player.biqRankScore - a.player.biqRankScore);
  const numberAt = new Map(ranked.map((r, i) => [r.index, i + 1]));
  const open = slots.filter((s) => !s.player);

  return (
    <figure className="biq-five" aria-labelledby="biq-five-title">
      <div className="biq-five-head">
        <h2 id="biq-five-title" className="biq-display biq-five-title">
          The starting five
        </h2>
        {dataThrough && <span className="biq-five-date">Through {dataThrough}</span>}
      </div>

      <div className="biq-five-body">
        <div className="biq-five-court">
          <Court />
          {slots.map((slot, i) => {
            const n = numberAt.get(i);
            return (
              <span
                key={i}
                aria-hidden="true"
                className={`biq-five-marker${n === 1 ? ' is-top' : ''}${n ? '' : ' is-open'}`}
                style={{ left: `${SPOTS[i].left}%`, top: `${SPOTS[i].top}%` }}
              >
                {n ?? ''}
              </span>
            );
          })}
        </div>

        <ol className="biq-five-key">
          {ranked.map(({ slot, player }, i) => (
            <li key={player.id}>
              <Link href={`/players/${player.id}`} className={`biq-five-row${i === 0 ? ' is-top' : ''}`}>
                <span className="biq-five-n">{i + 1}</span>
                <SubjectPhoto id={player.id} name={player.name} size={40} cutout />
                <span className="biq-five-who">
                  <span className="biq-five-name">{player.name}</span>
                  <span className="biq-five-role">
                    {SPOT_NAME[slot.spot]}, {teamNickname(player.team)}
                  </span>
                </span>
                <span className="biq-five-score biq-num">{player.biqRankScore.toFixed(1)}</span>
              </Link>
            </li>
          ))}
          {open.map((slot, i) => (
            <li key={`open-${i}`} className="biq-five-row is-open">
              <span className="biq-five-n" />
              <span className="biq-five-who">
                <span className="biq-five-role">No qualified {SPOT_NAME[slot.spot].toLowerCase()} yet</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

    </figure>
  );
}
