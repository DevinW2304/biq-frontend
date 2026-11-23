import { describe, expect, it } from 'vitest';
import { teamNickname } from './teams';

const CURRENT = [
  'ATL', 'BKN', 'BOS', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM',
  'MIA', 'MIL', 'MIN', 'NOP', 'NYK', 'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS',
];

describe('teamNickname', () => {
  it('names every current team', () => {
    expect(teamNickname('LAL')).toBe('Lakers');
    expect(teamNickname('PHI')).toBe('76ers');
    expect(teamNickname('POR')).toBe('Trail Blazers');
    for (const abbreviation of CURRENT) {
      expect(teamNickname(abbreviation), abbreviation).not.toBe(abbreviation);
      expect(teamNickname(abbreviation), abbreviation).toBeTruthy();
    }
  });

  it('falls back to the abbreviation it was given', () => {
    expect(teamNickname('XYZ')).toBe('XYZ');
    expect(teamNickname('')).toBe('');
  });
});
