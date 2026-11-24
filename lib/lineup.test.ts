import { describe, expect, it } from 'vitest';
import { positionsOf, startingFive } from './lineup';
import type { BIQLeaderboardEntry } from './types';

let nextId = 1;
function player(name: string, position: string, biqRankScore: number): BIQLeaderboardEntry {
  return {
    id: nextId++,
    name,
    team: 'NBA',
    position,
    biqScore: biqRankScore,
    biqRankScore,
    biqTier: '',
    reason: '',
    engineScore: 0,
    burdenScore: 0,
    creationScore: 0,
    efficiencyScore: 0,
    impactScore: 0,
    availabilityScore: 0,
    starScore: 0,
  };
}

const names = (slots: ReturnType<typeof startingFive>['slots'], spot: string) =>
  slots.filter((s) => s.spot === spot).map((s) => s.player?.name ?? null);

describe('positionsOf', () => {
  it('reads the NBA positions a player is listed at', () => {
    expect(positionsOf('F-G')).toEqual(['F', 'G']);
    expect(positionsOf('G-F')).toEqual(['G', 'F']);
    expect(positionsOf('C')).toEqual(['C']);
    expect(positionsOf('C-F')).toEqual(['C', 'F']);
  });

  it('treats anything else as no position', () => {
    expect(positionsOf('')).toEqual([]);
    expect(positionsOf(null)).toEqual([]);
    expect(positionsOf(undefined)).toEqual([]);
    expect(positionsOf('Active Player')).toEqual([]);
  });
});

describe('startingFive', () => {
  it('picks the five with the best combined rank score, 2 G / 2 F / 1 C', () => {
    // The real top ten, 2026-27, as of Nov 21.
    const pool = [
      player('Luka Dončić', 'F-G', 97.1),
      player('Alperen Sengun', 'C', 86.6),
      player('Giannis Antetokounmpo', 'F', 86.5),
      player('Tyrese Maxey', 'G', 84.6),
      player('Victor Wembanyama', 'F-C', 84.1),
      player('Jamal Murray', 'G', 82.5),
      player('Shai Gilgeous-Alexander', 'G', 82.0),
      player('Jayson Tatum', 'F-G', 79.6),
      player('Nikola Jokić', 'C', 79.0),
      player('Cooper Flagg', 'F', 78.8),
    ];
    const { slots, starId } = startingFive(pool);
    expect(slots.map((s) => s.spot)).toEqual(['G', 'G', 'F', 'F', 'C']);
    expect(names(slots, 'G')).toEqual(['Luka Dončić', 'Tyrese Maxey']);
    expect(names(slots, 'F')).toEqual(['Giannis Antetokounmpo', 'Victor Wembanyama']);
    expect(names(slots, 'C')).toEqual(['Alperen Sengun']);
    expect(starId).toBe(pool[0].id);
  });

  it('uses each player once, even one listed at two positions', () => {
    const pool = [player('Big One', 'F-C', 90), player('Big Two', 'F-C', 80), player('Guard', 'G', 70)];
    const { slots } = startingFive(pool);
    const ids = slots.flatMap((s) => (s.player ? [s.player.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(3);
    expect(names(slots, 'C')).toEqual(['Big One']);
    expect(names(slots, 'F')).toEqual(['Big Two', null]);
    expect(names(slots, 'G')).toEqual(['Guard', null]);
  });

  it('leaves a spot open when nobody can fill it', () => {
    const pool = [
      player('G1', 'G', 90),
      player('G2', 'G', 85),
      player('F1', 'F', 80),
      player('F2', 'F-G', 75),
      player('Unknown', '', 99),
    ];
    const { slots } = startingFive(pool);
    expect(names(slots, 'C')).toEqual([null]);
    expect(names(slots, 'G')).toEqual(['G1', 'G2']);
    expect(names(slots, 'F')).toEqual(['F1', 'F2']);
  });

  it('moves a two-position player to where the lineup needs him', () => {
    // Listed F first, but two better forwards exist and only one guard:
    // he plays guard, so all five spots fill.
    const pool = [
      player('Swing', 'F-G', 99),
      player('Forward 1', 'F', 90),
      player('Forward 2', 'F', 89),
      player('Guard', 'G', 50),
      player('Center', 'C', 40),
    ];
    const { slots } = startingFive(pool);
    expect(names(slots, 'G')).toEqual(['Swing', 'Guard']);
    expect(names(slots, 'F')).toEqual(['Forward 1', 'Forward 2']);
    expect(names(slots, 'C')).toEqual(['Center']);
  });

  it('handles an empty pool', () => {
    const { slots, starId } = startingFive([]);
    expect(slots.map((s) => s.player)).toEqual([null, null, null, null, null]);
    expect(starId).toBeNull();
  });
});
