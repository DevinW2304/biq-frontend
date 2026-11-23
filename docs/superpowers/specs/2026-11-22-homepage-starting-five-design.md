# Homepage: BIQ's starting five

## Why

The homepage "just needs to look better", and the owner wants a real graphic:
the most impactful players, the top player at each position among those who
meet the leaderboard's games-and-minutes bar. Picked from mockups: a starting
five on a half court (option A), as the hero (layout A).

## Goals

- The first screen shows the headline and search beside **BIQ's starting five**
  on a half court.
- A shorter page: hero, top-20 board, LIVE BIQ ticker, one "How BIQ works →" line.
- Works at phone width.

## Non-goals / anti-goals

- No motion beyond the existing ticker (homepage stays static).
- No light surfaces (site is all dark).
- Don't invent positions the data doesn't have (no PG/SG/SF/PF split).

## Approaches (picked in mockups)

- Graphic: A. starting five on a court (chosen) vs B. three big Guard/Forward/
  Center cards vs C. five cards in a row. A is the one that reads as a graphic;
  C becomes its phone layout.
- Page: A. court is the hero (chosen) vs B. court full-width below today's hero
  (below the fold on laptops) vs C. court beside a top-10 list.

## Design

**Who's eligible:** every player in the BIQ leaderboard (the qualified pool: 104
this season). The backend's `/api/players/biq-leaders` cap rises from 25 to
150; the homepage asks for 150 and falls back to 25 if that request fails
(backend not yet deployed).

**The lineup (owner-approved calls):** 2 guards, 2 forwards, 1 center. A player
may fill any position the NBA lists for him ("F-G" can play F or G); each
player once. Choose the five with the highest combined rank score (the
leaderboard's order). An unfillable spot is shown as empty with a short note.

**On the court:** best of the five at the top of the key with a blue ring; the
other guard and a forward on the wings; the other forward and the center on
the blocks. Each shows headshot (initials fallback), name, position, rank
score, and links to the profile. Caption: "BIQ's starting five", with a line
saying how it's picked.

**Phone:** below ~640px the court is replaced by a grid of five player cards
(same data, same order); the hero stacks (copy and search first).

**Page order:** hero (headline, copy, search, Compare / All players buttons |
court) → top-20 board (unchanged) → ticker (unchanged) → "How BIQ works →"
(to /model). "Live signals" and "What BIQ measures" are removed.

**Failure:** no leaderboard data → hero shows headline and search only, as today.

## Left to the builder

Exact court proportions and token placement, the tie-break when two lineups
have equal totals (higher-ranked player first), file names.
