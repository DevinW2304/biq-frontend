# Editorial Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the homepage hero and starting five as an editorial figure: a numbered court diagram with a key and a "next in line" caption.

**Architecture:** Two pure helpers (runner-ups per spot; team nicknames) with Vitest tests; `StartingFive` rewritten as figure + court + key; homepage hero and board heading restyled in CSS. Server components only; `SubjectPhoto` gains a frameless "cutout" mode.

**Tech Stack:** Next.js 14, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-22-editorial-homepage-design.md`

## Global Constraints

- No rings, glows, gradients, circle avatars; `--key` only on marker 1 and the top score (plus links/focus as site-wide).
- Dark tokens only; `lib/theme.test.ts` stays green. Homepage static except the ticker.
- Local commits, no attribution.

## Review Focus

- Fewer than five filled spots: markers and key rows for empty spots, numbering still 1..n for filled ones. Test in Task 1 (`nextInLine` with gaps) and checked in Task 2.
- A runner-up must never be someone already in the lineup, and a spot with no runner-up is left out of the caption. Task 1 tests.
- Unknown team abbreviation shows the abbreviation, not "undefined". Task 1 test.
- Headshot missing: initials, no broken image. `SubjectPhoto` fallback, checked in Task 2.
- Narrow widths (390-900): key text wrapping, no sideways scroll. Task 3 check.

---

### Task 1: Runner-ups and team nicknames

**Files:** Modify `lib/lineup.ts`, `lib/lineup.test.ts`; create `lib/teams.ts`, `lib/teams.test.ts`.

**Interfaces (produces):**
- `nextInLine(players: BIQLeaderboardEntry[], slots: LineupSlot[]): { spot: Spot; player: BIQLeaderboardEntry }[]` — per spot G, F, C (in that order) the highest rank score eligible player not in the lineup; spots with none omitted.
- `teamNickname(abbreviation: string): string` — 'LAL' → 'Lakers', unknown → the input.

- [ ] Tests first: real top-10 fixture + Murray/Tatum/Jokić runner-ups expected; nobody in the lineup returned; no C-eligible spare → no C entry; `teamNickname('PHI') === '76ers'`, `teamNickname('XYZ') === 'XYZ'`, all 30 current abbreviations map to a non-empty name different from the abbreviation.
- [ ] Run `npx vitest run lib/lineup.test.ts lib/teams.test.ts` → FAIL; implement; → PASS; `npm test` → pass. Commit `Homepage: next in line and team nicknames`.

### Task 2: The figure

**Files:** Rewrite `components/StartingFive.tsx`; modify `components/biq/SubjectPhoto.tsx` (add `cutout?: boolean`: no border/background, width = size × 260/190, object-fit contain); replace the `.biq-five-*` block in `app/styles/biq-theme.css`.

**Interfaces:** `<StartingFive slots starId runnersUp dataThrough />` with `runnersUp` from Task 1, `dataThrough: string | null` (already formatted, e.g. "Nov 21").

Court spots (left%, top%): G1 (50, 30), G2 (17, 50), F1 (83, 50), F2 (29, 80), C (71, 80). Marker number = rank of that slot's player among the filled slots by rank score.

- [ ] Build; `npx tsc --noEmit -p . && npm run lint && npm test` → clean. Commit `Homepage: the starting five as a figure with a key`.

### Task 3: Hero and board heading

**Files:** `app/page.tsx`, `app/styles/biq-theme.css`.

- [ ] Dateline, tighter headline (`.biq-home-headline`), dek, text links; board heading rule + "The top 20" + "Full leaderboard"; "How BIQ works" without arrow; pass `nextInLine` and `fetchSeasonInfo().dataThrough` (formatted with `formatShortDate`) to the figure.
- [ ] Checks: tsc, lint, tests; browser at 390 / 768 / 920 / 1280 (no overlap, no sideways scroll, contrast scan on `/`); CI build in a worktree. Commit `Homepage: editorial hero and board heading`.
