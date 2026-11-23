import { describe, expect, it } from 'vitest';
import {
  firstShowing,
  formatPct,
  formatShortDate,
  formatSigned,
  isRated,
  joinMeta,
  knownPosition,
  ordinal,
  teamLabel,
} from './format';

describe('numbers', () => {
  it('formats percentages and signed values', () => {
    expect(formatPct(0.5123)).toBe('51.2%');
    expect(formatSigned(4.2)).toBe('+4.2');
    // A real minus sign, so columns of numbers line up.
    expect(formatSigned(-3)).toBe('−3.0');
    expect(formatSigned(0)).toBe('0.0');
  });

  it('writes ordinals, including the teens', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 93, 101, 111].map(ordinal)).toEqual([
      '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '93rd', '101st', '111th',
    ]);
  });
});

describe('formatShortDate', () => {
  it('reads the calendar date as written, with no time-zone shift', () => {
    expect(formatShortDate('2026-11-09')).toBe('Nov 9');
    expect(formatShortDate('2026-01-31T23:00:00Z')).toBe('Jan 31');
  });

  it('gives null for anything that is not a date', () => {
    expect(formatShortDate('')).toBeNull();
    expect(formatShortDate(null)).toBeNull();
    expect(formatShortDate('2026-13-01')).toBeNull();
  });
});

describe('labels', () => {
  it('treats placeholder positions as unknown', () => {
    expect(knownPosition('G-F')).toBe('G-F');
    expect(knownPosition(' Active Player ')).toBeNull();
    expect(knownPosition('N/A')).toBeNull();
    expect(knownPosition('')).toBeNull();
    expect(knownPosition(null)).toBeNull();
  });

  it('joins only the parts that exist', () => {
    expect(joinMeta('BOS', null, 'G', false, '')).toBe('BOS · G');
    expect(joinMeta()).toBe('');
  });

  it('marks a player off every roster with his last team', () => {
    expect(teamLabel({ team: 'BOS' })).toBe('BOS');
    expect(teamLabel({ team: 'BOS', onRoster: false })).toBe('Not on a roster (last: BOS)');
  });

  it('counts a score as a grade only when the player was rated and has played', () => {
    expect(isRated({})).toBe(true);
    expect(isRated({ rated: false })).toBe(false);
    expect(isRated({ gamesPlayed: 0 })).toBe(false);
    expect(isRated({ rated: true, gamesPlayed: 12 })).toBe(true);
  });
});

describe('firstShowing', () => {
  it('keeps each stat where it first appears, across lists, ignoring case and spaces', () => {
    const once = firstShowing(['BIQ']);
    expect(once([{ label: 'BIQ' }, { label: 'PTS' }, { label: '3PA rate' }])).toEqual([
      { label: 'PTS' },
      { label: '3PA rate' },
    ]);
    expect(once([{ label: 'pts' }, { label: '3PA Rate' }, { label: 'AST' }])).toEqual([{ label: 'AST' }]);
  });
});
