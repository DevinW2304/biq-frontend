// Head-to-head edges for the compare page: which of two players is better on
// each shared number. Pure, so the page stays a plain server component.
import type { ComparePlayerCard } from './types';

export type Side = 'a' | 'b';

/** Stats where the smaller number is the better one. */
const LOWER_IS_BETTER = new Set(['tov', 'tov%', 'tov/g', 'turnovers', 'pf']);

/** "62.1%" -> 62.1, "1.49" -> 1.49; null for anything that isn't a number. */
export function parseStat(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const n = Number.parseFloat(value.replace(/[%,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Who is ahead on one number. Equal (or missing) gives no edge. */
export function edgeOf(label: string, a: number | null, b: number | null): Side | null {
  if (a == null || b == null || a === b) return null;
  const lowerWins = LOWER_IS_BETTER.has(label.trim().toLowerCase());
  return (lowerWins ? a < b : a > b) ? 'a' : 'b';
}

export type HeadToHead = {
  /** stat label -> side ahead, for every label both cards carry. */
  stats: Map<string, Side | null>;
  biq: Side | null;
  form: Side | null;
  /** Categories each side leads, out of `total` that could be decided. */
  wins: Record<Side, number>;
  total: number;
};

/**
 * Compares the numbers the cards show, at the precision they show them, so an
 * "edge" never goes to a player whose displayed value reads the same.
 */
export function headToHead(a: ComparePlayerCard, b: ComparePlayerCard): HeadToHead {
  const bStats = new Map(b.stats.map((stat) => [stat.label, stat.value]));
  const stats = new Map<string, Side | null>();
  for (const stat of a.stats) {
    if (stat.label === 'BIQ' || !bStats.has(stat.label)) continue;
    stats.set(stat.label, edgeOf(stat.label, parseStat(stat.value), parseStat(bStats.get(stat.label))));
  }
  const shown = (n: number | null | undefined) => (n == null ? null : Number(n.toFixed(1)));
  const biq = edgeOf('BIQ', shown(a.biqScore), shown(b.biqScore));
  const form = edgeOf('Recent form', shown(a.recentFormScore), shown(b.recentFormScore));

  const decided = [biq, form, ...Array.from(stats.values())];
  return {
    stats,
    biq,
    form,
    wins: {
      a: decided.filter((side) => side === 'a').length,
      b: decided.filter((side) => side === 'b').length,
    },
    total: decided.length,
  };
}
