// BIQ's starting five for the homepage: the best two guards, two forwards and
// a center among the qualified players, by combined rank score.
//
// The NBA lists positions as Guard / Forward / Center, often two at once
// ("F-G"). A player may fill any position he's listed at, but only one spot.
import type { BIQLeaderboardEntry } from './types';

export type Spot = 'G' | 'F' | 'C';

export type LineupSlot = { spot: Spot; player: BIQLeaderboardEntry | null };

/** Two guards, two forwards, a center: the order the slots come back in. */
const SHAPE: Spot[] = ['G', 'G', 'F', 'F', 'C'];

/** Enough candidates per spot for the best pick: the two it needs, plus
 *  the four other players who might be taking someone elsewhere. */
const CANDIDATES_PER_SPOT = 6;

/** "F-G" -> ['F', 'G']; anything that isn't a listed position -> []. */
export function positionsOf(position: string | null | undefined): Spot[] {
  const parts = (position ?? '').toUpperCase().split('-').map((p) => p.trim());
  if (!parts.length || !parts.every((p) => p === 'G' || p === 'F' || p === 'C')) return [];
  return parts as Spot[];
}

/** Every way to take up to `k` items from `items`, keeping their order;
 *  fewer than `k` only when there aren't `k` to take. */
function choose<T>(items: T[], k: number): T[][] {
  if (k === 0 || !items.length) return [[]];
  if (items.length <= k) return [items];
  const [first, ...rest] = items;
  return [...choose(rest, k - 1).map((combo) => [first, ...combo]), ...choose(rest, k)];
}

const total = (players: BIQLeaderboardEntry[]) => players.reduce((sum, p) => sum + p.biqRankScore, 0);

export function startingFive(players: BIQLeaderboardEntry[]): {
  slots: LineupSlot[];
  starId: number | null;
} {
  const ranked = [...players].sort((a, b) => b.biqRankScore - a.biqRankScore);
  const pool = (spot: Spot) =>
    ranked.filter((p) => positionsOf(p.position).includes(spot)).slice(0, CANDIDATES_PER_SPOT);

  // A handful of candidates per spot, so trying every combination is cheap.
  // Scores are positive, so the best total also fills as many spots as it can.
  // Candidates are tried in rank order and only a strictly better total
  // replaces the best so far, so ties keep the higher-ranked players.
  let best: { G: BIQLeaderboardEntry[]; F: BIQLeaderboardEntry[]; C: BIQLeaderboardEntry[] } = { G: [], F: [], C: [] };
  let bestTotal = -1;
  for (const center of [...pool('C').map((p) => [p]), []]) {
    const taken = new Set(center.map((p) => p.id));
    for (const forwards of choose(pool('F').filter((p) => !taken.has(p.id)), 2)) {
      const takenToo = new Set([...taken, ...forwards.map((p) => p.id)]);
      const guards = choose(pool('G').filter((p) => !takenToo.has(p.id)), 2)[0] ?? [];
      // The best guards left are always the top two remaining: no other
      // spot competes for them at this point.
      const lineupTotal = total(center) + total(forwards) + total(guards);
      if (lineupTotal > bestTotal) {
        bestTotal = lineupTotal;
        best = { G: guards, F: forwards, C: center };
      }
    }
  }

  const slots: LineupSlot[] = [];
  for (const spot of ['G', 'F', 'C'] as Spot[]) {
    const chosen = [...best[spot]].sort((a, b) => b.biqRankScore - a.biqRankScore);
    SHAPE.filter((s) => s === spot).forEach((_, i) => slots.push({ spot, player: chosen[i] ?? null }));
  }
  const filled = slots.flatMap((s) => (s.player ? [s.player] : []));
  const star = filled.reduce<BIQLeaderboardEntry | null>(
    (top, p) => (!top || p.biqRankScore > top.biqRankScore ? p : top),
    null,
  );
  return { slots, starId: star?.id ?? null };
}

/**
 * Who's next in line at each position: the best player listed there who
 * isn't in the lineup, in G, F, C order. A position nobody else can play is
 * left out.
 */
export function nextInLine(
  players: BIQLeaderboardEntry[],
  slots: LineupSlot[],
): { spot: Spot; player: BIQLeaderboardEntry }[] {
  const inLineup = new Set(slots.flatMap((s) => (s.player ? [s.player.id] : [])));
  const ranked = [...players].sort((a, b) => b.biqRankScore - a.biqRankScore);
  return (['G', 'F', 'C'] as Spot[]).flatMap((spot) => {
    const player = ranked.find((p) => !inLineup.has(p.id) && positionsOf(p.position).includes(spot));
    return player ? [{ spot, player }] : [];
  });
}
