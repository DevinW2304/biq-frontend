# THE TEARDOWN — a scroll-driven homepage object

Date: 2026-07-28
Status: approved, building

Supersedes the hero motion in [2026-07-27](./2026-07-27-homepage-motion-design.md).
That page's entrance choreography, safety contract, and `driven` prop all stand.
What changes is the hero: the instrument stops playing itself and becomes
something the reader operates.

## Why

Two complaints, one cause. The sweep read the league on a **clock**, so the page
moved whether or not anyone was watching — a ticker. And the only scroll work
was fire-once triggers, which are not scroll motion; they are load animations
with a delayed start. Scroll had no authority over anything.

So: one scrubbed timeline, scroll as the transport, and an object whose whole
job is to come apart in your hands.

## The object

THE CONVERGENCE becomes THE TEARDOWN. Same instrument, same real data, but the
five lanes now take themselves apart and land as the top 20 leaderboard.

Three phases, in one timeline, scrubbed across a pinned stage:

| Progress | Phase | What moves |
|---|---|---|
| 0–17% | **READ** | The playhead crosses the lane field under the reader's scroll. Columns light as it passes, leaving a short trailing glow. No clock anywhere. |
| 17–37% | **RESOLVE** | The aperture comes apart: ring ticks fan outward along their own radii and dissolve, tier arcs unwind, beams detach from the lanes. |
| 37–77% | **RANK** | The lane field reassembles as rows. Every column is one player, so each column's five ticks fly to that player's row and land as its component signature. Ranks 21–25 drift off — the field narrows to twenty. |
| 77–100% | **HOLD** | Nothing moves. A trailing spacer on the timeline keeps the pin stuck after the board has landed, so there is a stretch of scroll where the top 20 simply sits there and can be read. Without it the board finishes at the exact moment the pin releases and is gone before anyone sees it. |

The deconstruction is literal. The same 100 rects that drew the lane field
become the board's component bars; nothing cross-fades into a replacement. A
tick's height still means its component score at every point in the journey.

## Structure

```
<section class="biq-stage">          height: 420vh      ← the scroll distance
  <div class="biq-stage-pin">        sticky, 100vh      ← what you watch
     <BiqEngine/>   SVG: lanes, beams, aperture, ring
     board rows     HTML overlay: rank · name · team · score
  </div>
</section>
```

### The scrub only goes forward

The timeline is `autoplay: false`, paused, and seeked by hand from a progress
value that can only ever increase:

```js
const progress = clamp(-stage.getBoundingClientRect().top / span, 0, 1);
if (progress > high) { high = progress; tl.seek(high * tl.duration); }
```

**Once the board is open it stays open.** Scrolling back up must never
reassemble the instrument, and `onScroll({ sync: true })` scrubs in both
directions with no one-way mode — hence driving the timeline directly.
`onScroll` is still used for the fire-once triggers elsewhere on the page.

Recomputing the stage's rect every frame has a second benefit: the range can
never go stale the way a cached one does when the page reflows above the stage
— which the web-font headline does. An earlier attempt to fix that by calling
`observer.refresh()` on `document.fonts.ready` froze the scrub completely and
was reverted.

### Two coordinate systems, one source

The flying parts are SVG rects; the row text is real HTML (selectable, and each
row links to its player). They align because both derive from the same viewBox
constants — the pattern the score readout already uses. The viewBox grows to
`1400 × 900` so it spans the pinned viewport rather than the old wide strip.

Rects animate `translate` + `scaleY` under `transform-box: fill-box`, so each
scales about its own centre instead of the viewBox centre.

## Hidden rows must leave the tab order

Each board row is a link, and it spends most of the page at `opacity: 0` —
which hides it visually but leaves it focusable. Before the fix, tabbing out of
the hero landed on twenty invisible leaderboard links. Armed rows are therefore
`visibility: hidden`, flipped the moment the rows start printing.

That flip is driven off the ratchet (`high * duration >= rowsAt`), **not** the
tween's `onBegin`: the timeline is seeked rather than played, and a seek that
jumps clean over a tween cannot be relied on to fire its callbacks. Both the
reduced-motion block and `settle()` hand the rows back explicitly, since on
those paths the rows never print.

## The board

20 rows in one viewport is ~40 units a row, so this board is dense and
typographic: rank, name, team, score, and the five-tick component signature that
just flew in. No player photos at this size — a deliberate change from the old
top-10 rows, and the reason the old top-10 section is deleted rather than kept.

## Too narrow to tear down

A row's pitch is `(40/900) x the engine's height`, and the engine's height is
locked to the container's width by its `1400x900` aspect ratio. Measured
against the 22.5px row text:

| container | row pitch | result |
|---|---|---|
| 1200px | 32.9px | 10.4px clearance |
| 900px | 24.3px | 1.8px — marginal |
| 768px | 20.6px | **1.9px overlap** |
| 414px | **-0.8px** | rows stack backwards |

So below `1080px` the page takes the static layout instead. The stylesheet
expresses this as `@media (prefers-reduced-motion: reduce), (max-width: 1080px)`
— comma is OR, both cases want the same thing — and `HomeMotion` matches the
same query so the two can never disagree about which layout is on screen.

The instrument's layout lives in CSS rather than inline styles specifically so
this query can reach it: in the static layout the SVG goes back to
`position: static` and the verdict block joins the flow, otherwise the aperture
is drawn on top of rows 8-12. The component passes only geometry
(`--vb-aspect`, `--verdict-*`, `--row-y`), never layout.

## No-JS, reduced motion

The pin, the 420vh stage, and the rows' absolute positions are **all scoped to
`.js-motion`**, and the reduced-motion block switches them back off. Without JS
or with reduced motion the DOM is plain flow: the instrument renders whole, the
top 20 renders as an ordinary list beneath it, and nobody scrolls through four
viewports of nothing.

Row positions ride on an inline `--row-y` custom property, so the inline style
carries data only and the `.js-motion` rule decides whether it means anything.

## The dark backdrop, once there are three dark sections

`.biq-hero-dark::before` was written for a single hero: `bottom: -72px` and a
gradient fading to transparent over its last 9%. Stacking hero + stage +
caption gave every one of them its own fade, so paper washed through at each
seam, and 9% means a 48px fade on the hero and a 310px fade on a 420vh stage.

The rule now: **backdrops are solid and butt flush (`bottom: 0`), and exactly
one section — the last, marked `.biq-dark-end` — carries the hand-off to
paper.** That fade is a fixed 200px rather than a percentage, and it must land
on the section's own bottom edge; a negative `bottom` drags the tail of the
gradient over the next section's heading as a muddy wash. The marked section
carries ~240px of bottom padding so the fade starts clear of its last line.

## Deleted

The sweep readout status line, the time-driven sweep loop, the ambient beam
pulse, and the top-10 board section.

## Kept

The marquee `BiqTicker`, the hero headline entrance, Live signals, What BIQ
measures, and the whole safety contract from the 2026-07-27 spec.

## Verification

- `npm run build` clean.
- Scrubbed both directions: phases land in order, nothing jumps, the board is
  readable through the HOLD.
- Reduced motion and no-JS: plain flow, no tall empty stage, full content.

### Two traps when verifying this in a browser

1. **Programmatic scrolling fires no scroll events in the automation harness.**
   `window.scrollTo` from an injected script changes `scrollY` but dispatches
   zero `scroll` events on `window` or `document` — measured directly. Any
   scroll-driven code therefore looks frozen at every sampled position, whether
   it uses anime's ScrollObserver or a plain listener. This costs hours if you
   mistake it for a bug in the page. **Drive it with real wheel events.**
2. **`scroll-behavior: smooth` is set globally**, so a measurement taken right
   after a scroll can be hundreds of pixels away from what is on screen. Poll
   `scrollY` until it stops changing before trusting any measurement.
