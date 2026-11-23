# All-dark theme

## Why

The site is light "court paper" everywhere except the top of the homepage,
where the hero and the top-20 board sit on a black band that fades to paper
through a ~200px grey gradient. A scroll script repaints the navbar dark while
that band is behind it, so the header looks different on the homepage than on
every other page and changes as you scroll. The owner wants one consistent
theme, and wants it dark.

## Goals

- Every page dark, using the palette the homepage band already uses.
- One header look on every page, at every scroll position.
- Readable contrast everywhere (WCAG AA for body text and labels).
- Native controls (inputs, scrollbars) dark too (`color-scheme: dark`).

## Non-goals

- A light mode or a theme toggle.
- Homepage layout changes. That conversation comes after this.

## Anti-goals

- Anything left light: a white card, input, dropdown or share image on a dark
  page is the inconsistency this exists to remove.
- Dimming the data: numbers, gauges and the up/down colours must read at
  least as clearly as they do on paper.

## Approaches

1. **Swap the theme tokens to dark values** (chosen). Almost every colour
   already goes through CSS variables (~300 uses). Change their values once,
   convert the ~115 hard-coded colours to tokens, delete the homepage-only dark
   band and the navbar switch. One source of truth, so it can't drift.
2. Paint dark over each page with page-level overrides. Doubles the styling
   and drifts again the next time a page changes. Rejected.
3. Full light + dark modes. Owner chose all dark; this is roughly options 1
   and 2 combined. Not now, though finishing the tokenisation keeps it cheap
   later.

## Design

- Palette (from the homepage band, tuned for AA):
  page `#131210`; panel a step lighter; lines and strong lines as warm greys;
  ink `#f4f1e8`; secondary and label greys lightened until they pass AA on
  the page colour; key (links, highlights, gauges) the band's `#6b8cff`;
  solid buttons keep a deeper blue fill with white text; key tint a
  translucent blue; up/down brightened green/red.
- Legacy variables in `globals.css` mapped onto the same dark values.
- Homepage: remove `.biq-hero-dark` / `.biq-dark-end` stage, the fade, the
  `biq-dark-nav` rules and `DarkNavSwitch`. Board and hero styles keep only
  what isn't about the band.
- Header: one dark translucent bar everywhere.
- Hard-coded colours (white inputs, cards, dropdown, ghost-button hover,
  stacked leaderboard, navbar, OG images, favicon if needed) become tokens or
  dark values.
- Checked by eye on every route at desktop and phone width: home, players,
  player profile (including unrated and 0-game players), leaderboard (both
  views), teams, team page, compare (empty and filled), model, 404, search
  dropdown, ticker, both OG images.

## Left to the builder

Exact intermediate greys and the brightened up/down values, chosen by contrast
check; how to split commits.
