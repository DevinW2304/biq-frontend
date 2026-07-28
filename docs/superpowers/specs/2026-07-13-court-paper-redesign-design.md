# BIQ redesign: COURT PAPER design system

Date: 2026-07-13
Status: approved direction (user delegated execution; will review rendered result)

## Decision context

The user rejected the previous "THE INTELLIGENCE FILE" dossier theme (dark paper,
redaction bars, stamps, teletype). Chosen direction, via Q&A:

- Vibe: clean analytics product. Light, airy, precise. Reference quality:
  Cleaning the Glass, Linear, Stripe dashboards.
- Palette: fresh, Claude's call. Not the old signal orange. Data-readable.
- Motion: subtle and few. Quiet micro-interactions, at most one signature
  reveal. No teletype, no redaction wipes, no stamps, no marquee, no
  smooth-scroll hijack, no count-ups.

## Concept

**COURT PAPER**: a modern front-office analytics workstation. The quiet nod to
basketball is material, not thematic: warm paper neutrals (maple floor) with a
single saturated royal blue (the painted key). No sports-kitsch, no theater.
The number is credible because the interface around it is calm.

## Tokens

Color (light only):

| token | hex | use |
|---|---|---|
| `--paper` | `#FAF9F6` | page background (warm white) |
| `--panel` | `#F1EFE9` | tinted panels, hovers, photo bg |
| `--line` | `#E3DFD5` | borders, dividers, gauge tracks |
| `--line-strong` | `#CFC9BB` | emphasized borders, table header rule |
| `--ink` | `#1E1C17` | primary text (warm near-black) |
| `--ink-2` | `#4F4B42` | body copy secondary |
| `--muted` | `#6F695C` | labels, metadata (AA on paper) |
| `--key` | `#2545CB` | THE accent: BIQ scores, gauges, links, focus |
| `--key-deep` | `#1B34A0` | accent hover |
| `--key-tint` | `#E9EDFA` | tier chips, selected states |
| `--up` / `--down` | `#1A7A4A` / `#BC3A2E` | signed values only (+/-, W/L) |

Rules: blue is reserved for BIQ verdicts, gauges, links, and live/focus states.
Green/red appear only on signed values. Radius 8px (cards), 999px (chips).
Borders 1px. No shadows, no gradients, no glassmorphism.

Type (Google Fonts via next/font, same CSS variable names as before):

- `--font-display`: **Bricolage Grotesque** — headlines, player names, big
  scores. Personality lives here.
- `--font-body`: **Instrument Sans** — body, UI, nav.
- `--font-file`: **Spline Sans Mono** — all data: stat values, table figures,
  small-caps labels. Tabular numerals everywhere numbers align.

Scale: hero name clamp(40px, 6vw, 76px) w700; verdict number clamp(64px, 8vw,
128px); section title 24–30px w600; label 11px mono uppercase 0.14em tracking.

## Signature element

**The BIQ meter**: every BIQ score renders as one consistent unit — tabular
number, tier chip, and a 3px gauge underneath that fills to score/100 in key
blue. The fill transition on first scroll-into-view (600ms ease-out) is the
site's single signature motion; reduced-motion users see it filled. Implemented
once as `ScoreMeter` in `components/biq/BiqKit.tsx`, used on home hero, board
rows, player cover, breakdown rows, and compare folders.

## Component kit (components/biq/)

- `BiqKit.tsx` rewritten: `ScoreMeter` (client, useInView), `SectionHeader`
  (label + title, static), `TierChip`. All dossier components deleted
  (Declassify, Redact, Stamp, FileHeader, CascadeRow, Teletype, Marquee,
  SmoothScroll) along with `CaseFolder.tsx`.
- `SubjectPhoto`: color photos (grayscale removed), 8px radius, panel bg,
  line border.
- `StatGrid.tsx`: card grid with real gaps (no hairline grid), `StatCell` shows
  label / mono value / subtext.
- `TrendBars`: panel-tone bars, latest bar key blue, mono value labels,
  baseline in `--line`.
- `BiqTicker`: light strip, key-blue LIVE chip, scroll animation kept (data
  ticker; respects reduced motion).

## Page treatments

- **Global chrome**: Navbar = paper bg, bottom border, Bricolage "BIQ" wordmark
  with key-blue square, body-font links, rounded search input. Footer =
  sentence-case single line, muted.
- **Home**: hero = "No. 1 on the board" card with photo, name, ScoreMeter;
  search below. The Board = clean ranked list rows (rank, photo, name, team,
  ScoreMeter right). Component leaders = 3 stat cards. Ticker stays. Marquee
  and method rows replaced by a compact "what BIQ measures" 3-column section.
- **Player page**: cover (photo, name, team/pos meta chips, big ScoreMeter,
  form/consistency tiles), then sections: Topline stat grid, Analyst note
  (plain quote block, key-blue left rule), BIQ breakdown (rows with weight +
  per-component gauge), Recent trend bars, Splits tiles, Analytics blocks,
  Game log table (mono, sticky header row style, horizontal scroll).
- **Players index**: search + same ranked-list rows as home board.
- **Compare**: two side-by-side subject cards (no slide-in), each with photo,
  name, ScoreMeter, form, note, stat grid, trend; verdict panel = bordered
  card, advantage line, plain summary text.
- **Leaderboard**: keep all three `?view=` variants functional. Header
  simplified; table view restyled light; visual view rebuilt as clean card
  grid (dark image-overlay cards removed); stacked interactive view recolored
  to light (hard-coded whites/golds replaced with tokens).
- **Teams index / team page / model page**: recolor to tokens (they already
  consume CSS vars); replace remaining dark-assumption rgba whites and the
  leftover gold stroke; keep structure.

## Legacy compatibility

`globals.css` keeps the legacy variable names (`--s1`, `--border`, `--muted`,
`--text`, `--signal`, `--font-condensed`, `--font-mono`) remapped to the new
light tokens so anything not hand-touched still renders coherently. Dead CSS
(court animations, hero basketball, spotlight, grain overlay, global grayscale
and radius-zero overrides) is deleted.

## Out of scope

- Dark mode (light only for now).
- Replacing BIQStorySwap's gsap mechanics (recolor only).
- Any data-fetching, route, or caching changes: presentation only.

## Follow-ups

- CLAUDE.md must be rewritten to describe COURT PAPER instead of THE
  INTELLIGENCE FILE, or future sessions will resurrect the dossier.
- `recharts` dependency is unused and can be dropped separately.
