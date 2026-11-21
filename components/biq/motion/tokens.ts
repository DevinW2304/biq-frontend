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
