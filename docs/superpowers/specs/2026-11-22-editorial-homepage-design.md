# Editorial homepage

## Why

The owner likes the starting-five homepage and wants it revised and enhanced,
"more editorial", without "the typical AI glow". In mockups they picked a
diagram-with-a-key treatment for the starting five (B) over players standing
on the court (A).

## Goals

- Read like a magazine or newspaper graphic: typographic hierarchy, a figure
  with a heading rule, a key and a caption, real information in the caption.
- No glow: no rings, glows, gradients or circle avatars; blue used once
  (the top score).

## Non-goals

- Other pages. Motion beyond the existing ticker. Light surfaces.

## Approaches (picked in mockups)

- A. Players standing on the court (cutouts on their spots, "next in line"
  caption). B. A diagram with a key (chosen): numbered markers on the court,
  a key beside it, the key doubling as the phone layout.

## Design

**Hero, left:** dateline "The {season} season, through games of {date}"
(sentence case, `--fog` with the season in `--ink`); the headline set tighter
and heavier (homepage only); a larger dek; the search bar; "Compare two
players" and "Browse every player" as underlined text links.

**Hero, right: the figure.** A 2px `--ink` rule; "The starting five" (display)
left, the data date right. The court (regulation half court, as now) with five
flat numbered markers: 1 = highest rank score of the five (`--key`, the only
blue), 2-5 in `--ink` with dark numerals. Spots by position: higher-ranked
guard at the top of the key, other guard on the left wing, higher-ranked
forward on the right wing, other forward on the left block, center on the
right block. Empty spot: an outlined marker, and the key row says no
qualified player yet.

**Key:** rows in rank order: number, cutout headshot (initials fallback, no
frame), name, "{Position}, {team nickname}", rank score (tabular). Rows link
to profiles. Caption: where the five come from (the qualified pool) and
"Next in line: {name} at guard ({score}), ... at forward, ... at center",
from the best eligible player not in the lineup at each spot.

**Phone:** court (smaller) above the key; the card grid is removed.

**Rest of the page:** the top-20 heading becomes the same rule + "The top 20"
display heading with a "Full leaderboard" link; "How BIQ works" loses its
arrow. Board rows and ticker unchanged.

## Left to the builder

Exact sizes; the team-nickname list (static, 30 teams, falls back to the
abbreviation).
