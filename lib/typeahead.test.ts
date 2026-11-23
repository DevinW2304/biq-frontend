import { describe, expect, it } from 'vitest';
import { moveHighlight } from './typeahead';

describe('moveHighlight', () => {
  it('starts at the top going down and at the bottom going up', () => {
    expect(moveHighlight(-1, 'ArrowDown', 5)).toBe(0);
    expect(moveHighlight(-1, 'ArrowUp', 5)).toBe(4);
  });

  it('steps one row at a time', () => {
    expect(moveHighlight(1, 'ArrowDown', 5)).toBe(2);
    expect(moveHighlight(3, 'ArrowUp', 5)).toBe(2);
  });

  it('wraps around both ends', () => {
    expect(moveHighlight(4, 'ArrowDown', 5)).toBe(0);
    expect(moveHighlight(0, 'ArrowUp', 5)).toBe(4);
  });

  it('highlights nothing in an empty list', () => {
    expect(moveHighlight(-1, 'ArrowDown', 0)).toBe(-1);
    expect(moveHighlight(2, 'ArrowUp', 0)).toBe(-1);
  });
});
