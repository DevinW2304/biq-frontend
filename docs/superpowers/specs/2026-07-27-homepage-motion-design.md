# Homepage motion — anime.js showcase layer

Date: 2026-07-27
Status: built

## Revision — the showcase pass

The first pass (tasteful entrances, light hero, a thin drawn distribution
curve) shipped and was judged too small. The reference given was animejs.com:
a bespoke instrument alive with hundreds of parts, on a dark stage. This
document's later sections describe the original pass; what actually shipped:

- **Dark hero stage**, handing over to COURT PAPER paper at the fold.
- **THE CONVERGENCE** (`BiqEngine.tsx`) replaces the signal curve: five lanes
  — workload, creation, efficiency, impact, availability — each carrying one
  tick per real player, bending through beams into an aperture where the
  score resolves. 125 data ticks + 96 ring ticks, all real values.
- **Character-level** headline reveal (was word-level).
- **Ambient motion**: travelling waves down the lanes, a ring rotating once a
  minute, pulsing beams. The instrument never fully stops.

## Revision — the readout sweep (2026-07-28)

The travelling lane waves were cut. They animated `scaleY` on ticks whose
**height is the component score**, so for most of each cycle every bar in the
instrument displayed a value its player did not have. Decorative and untrue.

They are replaced by **THE READOUT SWEEP**, which animates attention instead of
data. A column of five ticks shares one index across all five lanes, so a column
*is* one player — a fact the instrument never stated. Now a playhead crosses the
lane field and reads the league one player at a time:

1. The column under the playhead brightens — **`fill` only, never geometry**.
2. Its five values pulse down the five beams into the aperture, as a travelling
   `draw` segment (`'0 0.12'` → `'0.88 1'`).
3. A status line under the lanes names who is being read, from `data-player-*`
   attributes carried on that column's lane-0 tick.

The aperture keeps NO. 1 throughout: the constant that every read resolves to.
The old ambient beam opacity pulse was cut with the waves — beams now light only
when a player is actually passing through them.

**Scroll-linked motion** (`sync`, scrubbed rather than triggered):

- **Departure** — as the hero leaves, lanes slide off and dim while beams go
  out and the aperture holds. `enter: 'start start', leave: 'start end'`,
  `sync: 0.55` so it eases behind the scroll rather than sticking to it.
- **Ring** — the outer ring group rotates against scroll position, nested
  outside the inner group's 62s clock rotation so the two transforms never
  fight over one property.
- The sweep itself autoplays under `sync: 'play pause'`, so it parks whenever
  the instrument is off-screen.

Three things learned here:

1. anime cannot tween a colour **from** `var(--eng-tick)` — it silently drops
   the property. The markup keeps the `var()` so a JS-less page stays themed;
   `engineSweep` resolves it via `getComputedStyle` and materialises it with
   `utils.set` before animating.
2. Parts that exist only to carry motion (playhead, beam pulses, status line)
   need `data-motion-only`, hidden by an **unscoped** CSS rule. Arming them
   under `.js-motion` would leave a playhead parked at zero on a no-JS page.
   `settle()` re-hides them after its blanket reveal, and the reduced-motion
   block restates the rule *after* the blanket reveal at equal specificity.
3. A wrapper needs `data-anime-group`, not `data-anime` — the latter is armed
   to `opacity: 0` by CSS and would hide everything inside it.

Two constraints learned while building:

1. The backend caps `biq-leaders?limit` at **25** (26+ returns 422). That cap
   sets the instrument's tick density.
2. Component scores among top-25 players cluster high, so lane heights are
   normalised **per component** to its own observed range. The values are
   unchanged; only the scale is per-lane, or the lanes read as a solid block.

**The dark stage must stay in CSS** (`.biq-hero-dark::before`), never a
JS-injected layer. The hero's light type is in static markup, so a
JS-dependent background would leave bone text on white paper for no-JS and
reduced-motion users.

## Goal

Make the BIQ homepage a motion showcase using anime.js v4, while leaving every
stat-tracking page exactly as static as it is today. Data pages exist to be
read; the homepage exists to make an argument.

## Constraints

- `app/page.tsx` is a server component with `revalidate = 300`. It must stay one.
  No converting the page to `'use client'`.
- `gsap` already ships in this repo but is used only by `BIQStorySwap` on
  `/model`. The two libraries never co-mount, so both can coexist.
- COURT PAPER stays the visual system. Motion adds timing, not new styling.
- Reduced-motion users and no-JS users must both get the complete page.

## Non-goals

`/players/[id]`, `/leaderboard`, `/compare`, `/teams` are out of scope and stay
static. `BiqTicker` and the gsap `/model` page are untouched.

## Architecture — markup-driven master timeline

The homepage stays a server component. Animatable elements carry `data-anime`
attributes describing their role. One client component, `<HomeMotion />`,
mounts at the end of the page, queries those attributes, and owns every
animation.

Rejected alternatives:

- **Wrapper components** (`<Reveal>`, `<Stagger>` around each element) — 20+
  wrappers would bury the page markup, and a continuous hero timeline cannot
  span independent wrappers.
- **Client homepage** — trivial to orchestrate, but loses server-rendered data.

### Files

| File | Role |
|---|---|
| `components/biq/motion/tokens.ts` | Durations, easings, stagger intervals. Single source of motion vocabulary. |
| `components/biq/motion/HomeMotion.tsx` | Client. Renders nothing. Owns the hero load timeline and all scroll-triggered timelines, scoped via `createScope`. |
| `components/biq/motion/BiqEngine.tsx` | Server-safe SVG instrument (THE CONVERGENCE) built from real leader data. Replaced the original `SignalCurve.tsx` in the showcase pass. |
| `app/page.tsx` | Gains `data-anime` attributes and mounts `<HomeMotion />`. |
| `app/layout.tsx` | Inline script stamping `js-motion` on `<html>`. |
| `app/styles/biq-theme.css` | Armed initial states, driven-meter override, reduced-motion rules. |
| `components/biq/BiqKit.tsx` | `MeterBar`/`ScoreMeter` gain an opt-in `driven` prop. |

### The `driven` prop

`MeterBar` currently animates itself: `useInView` + a CSS width transition. On
the homepage anime.js needs to drive those fills in sequence instead, and two
systems writing `width` would fight.

`driven` is additive and defaults to false, so every other page keeps today's
behavior. When true, `MeterBar` skips `useInView`, renders at `width: 0%`, and
exposes `data-anime="meter"` plus `data-meter-pct` for `HomeMotion` to read.
CSS drops the transition on driven fills so only anime writes width.

`ScoreMeter` forwards `driven` and marks its number with `data-anime="count"`.

## Motion pieces

All on the homepage only.

1. **Hero entrance** (on mount, one timeline). Eyebrow → headline (word-by-word
   clip reveal via `splitText`, 34ms stagger) → body copy → search bar →
   buttons. ~1.2s with overlap.
2. **Hero leader card.** Fades and rises from `scale(0.98)`; the xl BIQ number
   counts 0→value while its gauge sweeps in sync.
3. **Signal curve.** The distribution SVG draws itself with
   `svg.createDrawable`, overlapping the hero tail. The one thing here that CSS
   could not do.
4. **Section rules.** Each `.biq-rule-line` draws left→right on scroll-in.
5. **The board.** Rows stagger up on scroll (55ms apart); each row's meter
   sweeps and its score counts up.
6. **Live signals.** Cards stagger in on scroll; hover lifts the card.
7. **Method cards.** Quiet stagger fade — the calm landing.

## Counting numbers

Score readouts carry `data-anime="count"` and `data-count-to`. `HomeMotion`
animates a plain object and writes `toFixed(decimals)` on each frame. The
server already renders the final value as text, so no-JS and reduced-motion
users see the real number; only the armed path resets it to zero to count up.
All readouts use `.biq-num` (tabular figures), so counting cannot shift layout.

## No-flash, no-JS, reduced motion

An inline script in `layout.tsx` adds `js-motion` to `<html>` before paint. CSS
hides `[data-anime-hide]` elements *only* under `.js-motion`, so:

- **No JS** — the class never lands, nothing is hidden, the full static page renders.
- **Reduced motion** — a media query re-reveals everything, and `HomeMotion`
  settles all targets to their end state without animating.
- **JS error** — `HomeMotion` wraps setup in try/catch and reveals every armed
  element on failure, so a bug can never leave the page blank.

Only `opacity`, `transform`, `width` (meters), and SVG `draw` are animated.

## Verification

- `npm run build` passes with no type errors.
- Homepage driven in a browser: hero timeline reads correctly, scroll sections
  fire once, numbers land on their true values.
- Reduced-motion emulation: content fully visible, nothing moves.
- JS disabled: complete page renders.
