import { describe, expect, it } from 'vitest';
import { edgeOf, headToHead, parseStat } from './compare';
import type { ComparePlayerCard } from './types';

function card(overrides: Partial<ComparePlayerCard>): ComparePlayerCard {
  return {
    id: 1,
    name: 'Player',
    team: 'BOS',
    position: 'G',
    stats: [],
    recentTrend: [],
    insight: '',
    biqScore: 70,
    biqTier: 'Starter',
    recentFormScore: null,
    ...overrides,
  };
}

describe('parseStat', () => {
  it('reads the numbers the cards print', () => {
    expect(parseStat('62.1%')).toBe(62.1);
    expect(parseStat('1.49')).toBe(1.49);
    expect(parseStat('1,234')).toBe(1234);
    expect(parseStat(7)).toBe(7);
  });

  it('gives null for anything that is not a number', () => {
    expect(parseStat('—')).toBeNull();
    expect(parseStat(null)).toBeNull();
    expect(parseStat(undefined)).toBeNull();
    expect(parseStat(Number.NaN)).toBeNull();
  });
});

describe('edgeOf', () => {
  it('goes to the bigger number', () => {
    expect(edgeOf('PTS', 30, 25)).toBe('a');
    expect(edgeOf('PTS', 25, 30)).toBe('b');
  });

  it('goes to the smaller number for turnovers and fouls', () => {
    expect(edgeOf('TOV', 2.1, 3.4)).toBe('a');
    expect(edgeOf('PF', 3, 2)).toBe('b');
  });

  it('gives no edge on a tie or a missing number', () => {
    expect(edgeOf('PTS', 25, 25)).toBeNull();
    expect(edgeOf('PTS', null, 25)).toBeNull();
  });
});

describe('headToHead', () => {
  it('compares only the stats both cards carry, and never the BIQ stat row', () => {
    const a = card({
      stats: [
        { label: 'PTS', value: '30.1' },
        { label: 'TOV', value: '2.0' },
        { label: 'BIQ', value: '90' },
        { label: 'Only A', value: '5' },
      ],
    });
    const b = card({
      stats: [
        { label: 'PTS', value: '25.0' },
        { label: 'TOV', value: '3.5' },
        { label: 'BIQ', value: '80' },
      ],
    });
    const h2h = headToHead(a, b);
    expect(Array.from(h2h.stats.entries())).toEqual([
      ['PTS', 'a'],
      ['TOV', 'a'],
    ]);
  });

  it('judges BIQ at the precision it is shown, so a hidden decimal is no edge', () => {
    const h2h = headToHead(card({ biqScore: 86.74 }), card({ biqScore: 86.71 }));
    expect(h2h.biq).toBeNull();
    expect(headToHead(card({ biqScore: 86.8 }), card({ biqScore: 86.7 })).biq).toBe('a');
  });

  it('tallies the categories each side leads, out of all compared', () => {
    const h2h = headToHead(
      card({ biqScore: 90, recentFormScore: 50, stats: [{ label: 'PTS', value: '20' }] }),
      card({ biqScore: 80, recentFormScore: 60, stats: [{ label: 'PTS', value: '20' }] }),
    );
    expect(h2h.wins).toEqual({ a: 1, b: 1 });
    expect(h2h.total).toBe(3);
  });
});
