// tokens.ts — the homepage motion vocabulary. Every animation pulls from here
// so the page reads as one system rather than a pile of one-off timings.

/** Durations in ms. */
export const DUR = {
  quick: 260,   // hovers, small state changes
  base: 520,    // the default entrance
  slow: 820,    // headline words, hero card
  count: 1100,  // number readouts ticking to their value
  gauge: 900,   // meter fills
  draw: 1500,   // the signal curve drawing itself
} as const;

/** anime.js v4 easing names. */
export const EASE = {
  entrance: 'outExpo',   // arriving from offscreen — fast in, long settle
  settle: 'out(3)',      // quiet fades that shouldn't draw the eye
  gauge: 'inOut(2)',     // meters: eased at both ends, reads as measurement
  count: 'out(2)',       // number readouts decelerating onto their value
  hover: 'outQuad',
} as const;

/** Stagger intervals in ms. */
export const STAGGER = {
  char: 16,   // headline characters
  tight: 34,  // headline words
  row: 55,    // leaderboard rows
  card: 80,   // card grids
} as const;

/** How far elements travel on entrance, in px. */
export const RISE = {
  small: 10,
  base: 18,
  card: 26,
} as const;

/**
 * THE TEARDOWN's three phases, as positions on one scrubbed timeline.
 *
 * These are timeline units, not milliseconds — the timeline never plays itself.
 * Scroll position across the pinned stage maps onto `total`, so these numbers
 * are really percentages of the reader's scroll: read the field, take the
 * aperture apart, land the board.
 */
export const PHASE = {
  read: 250,     // 0-17%   playhead crosses the lane field
  resolve: 550,  // 17-37%  aperture and ring come apart
  rank: 1150,    // 37-77%  the field reassembles as the board
  total: 1500,   // 77-100% HOLD — the board sits still and readable
} as const;

/** Per-element offsets inside a phase, in the same timeline units. */
export const TEAR = {
  columnLight: 26,  // how long a column stays lit as the playhead passes
  ringLag: 1.6,     // per-ring-tick stagger as the ring fans apart
  tickLag: 7,       // per-player stagger as ticks fly to their rows
  rowTravel: 26,    // px a row rises into place
} as const;
