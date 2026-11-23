// The search dropdown's arrow-key movement, kept apart from the component so
// it can be tested without a browser.

/**
 * The row highlighted after an arrow key, given the current one (-1 for
 * none) and how many rows there are. Down from nothing starts at the top, up
 * from nothing at the bottom; both wrap around the ends. -1 when the list is
 * empty.
 */
export function moveHighlight(current: number, key: 'ArrowDown' | 'ArrowUp', count: number): number {
  if (count <= 0) return -1;
  if (key === 'ArrowDown') return current < 0 ? 0 : (current + 1) % count;
  return current <= 0 ? count - 1 : current - 1;
}
