# Homepage Starting Five Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put "BIQ's starting five" on a half court in the homepage hero, and cut the page down to hero, top-20 board, ticker and a "How BIQ works" link.

**Architecture:** The backend's leaders endpoint may return the whole qualified pool (cap 25 → 150). A pure function picks the five (2G/2F/1C, any listed position, highest combined rank score). A server component draws the court; CSS swaps it for a card grid on phones. The homepage fetches 150 leaders (falls back to 25), feeds the lineup, board and ticker.

**Tech Stack:** FastAPI + pytest (biq-backend), Next.js 14 server components + Vitest (biq-frontend).

**Spec:** `docs/superpowers/specs/2026-11-22-homepage-starting-five-design.md`

## Global Constraints

- Homepage stays static: no animation added (the ticker is the only motion).
- Dark theme only; use tokens from `app/styles/biq-theme.css` (`lib/theme.test.ts` must stay green).
- Positions are the NBA's G / F / C (combos like "F-G"); no PG/SG/SF/PF.
- Lineup: 2 G, 2 F, 1 C; any listed position; each player once; max combined `biqRankScore`.
- Commits: local only, no Claude attribution. Backend commits go in biq-backend on `audit-fixes`.

## Review Focus

- Early-season pool with no eligible center (or fewer than five players): slots show an "open" note, nothing crashes. Test in Task 2.
- A player listed for two positions must not appear twice. Test in Task 2.
- Unknown or empty position strings ("", null, "Active Player"): ineligible everywhere, not a crash. Test in Task 2.
- Old backend (cap 25) still live when the frontend deploys: the 150 request 422s; the homepage must fall back to 25 and still render. Task 4 step.
- Phone width: court names overlapping. Task 3 swaps to cards below 640px; checked at 390px in Task 4.

---

### Task 1: Backend returns the whole qualified pool

**Files:**
- Modify: `biq-backend/app/routers/players.py:100` (`le=25` → `le=150`)
- Test: `biq-backend/tests/test_leaderboard.py`

- [ ] **Step 1: Write the failing test** `test_biq_leaders_accepts_the_whole_qualified_pool`: with any repo installed via `use_repo`, `client.get("/api/players/biq-leaders?limit=150").status_code != 422`, and `limit=151` returns 422.
- [ ] **Step 2: Run** `.venv/bin/python -m pytest tests/test_leaderboard.py -q -k qualified_pool` → FAIL (422 for 150).
- [ ] **Step 3: Raise the cap** to 150.
- [ ] **Step 4: Run the suite** `.venv/bin/python -m pytest -q` → all pass.
- [ ] **Step 5: Commit** (biq-backend): `Leaders: allow up to 150, the whole qualified pool`.

### Task 2: Pick the starting five

**Files:**
- Create: `lib/lineup.ts`, `lib/lineup.test.ts`

**Interfaces:**
- Produces:
  - `type Spot = 'G' | 'F' | 'C'`
  - `positionsOf(position: string | null | undefined): Spot[]` — "F-G" → ['F','G']; unknown → []
  - `type LineupSlot = { spot: Spot; player: BIQLeaderboardEntry | null }`
  - `startingFive(players: BIQLeaderboardEntry[]): { slots: LineupSlot[]; starId: number | null }` — `slots` always length 5 in order G, G, F, F, C; `starId` = id of the chosen player with the highest `biqRankScore`.

- [ ] **Step 1: Write the failing tests** in `lib/lineup.test.ts`:
  - `positionsOf`: 'F-G' → ['F','G']; 'C' → ['C']; 'G-F' → ['G','F']; '' / null / 'Active Player' → [].
  - `picks the current five`: fixture of the real top 10 (Dončić F-G 97.1, Sengun C 86.6, Antetokounmpo F 86.5, Maxey G 84.6, Wembanyama F-C 84.1, Murray G 82.5, Gilgeous-Alexander G 82.0, Tatum F-G 79.6, Jokić C 79.0, Flagg F 78.8) → slots names G: [Dončić, Maxey], F: [Antetokounmpo, Wembanyama], C: [Sengun]; `starId` = Dončić's id.
  - `uses each player once`: two players both 'F-C' and one 'G' → no id repeats; C filled, one F filled, one G filled.
  - `leaves a spot open when nobody can fill it`: no C-eligible player → C slot `player === null`; other four filled.
  - `handles an empty pool`: five null slots, `starId === null`.
- [ ] **Step 2: Run** `npx vitest run lib/lineup.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement.** Keep the top 6 candidates per spot by rank score (enough for an optimal pick: 2 per spot plus 4 others), then try every C (or none) × F pair × G pair without reuse; prefer more filled slots, then the higher total; iterate in rank order and replace only on strictly better, so ties keep the higher-ranked players. Order within G and F slots by rank score.
- [ ] **Step 4: Run** `npx vitest run lib/lineup.test.ts` → PASS; `npm test` → all pass.
- [ ] **Step 5: Commit**: `Homepage: pick BIQ's starting five`.

### Task 3: The court

**Files:**
- Create: `components/StartingFive.tsx` (server component; uses `SubjectPhoto`, `Link`)
- Modify: `app/styles/biq-theme.css` (append a `/* ---- starting five ---- */` block)

**Interfaces:**
- Consumes: `startingFive` result from Task 2.
- Produces: `<StartingFive slots={LineupSlot[]} starId={number | null} />`.

Court: SVG viewBox 520×380 drawn with `--line`/`--line-strong` on a `--card` panel, hoop in `--key`. Spots (left%, top%): star at (50, 22); other G (16, 46); first F (84, 46); second F (25, 77); C (75, 77). The star is whichever chosen player has `starId`, wherever his slot is; the remaining four fill the other spots in slot order. Token: `SubjectPhoto` 56px (star) / 48px with a ring (`--key` for the star, `--line-strong` otherwise), name, `G · 97.1` in mono (`--fog`, score in `--key`), wrapped in a `Link` to `/players/{id}`. Empty slot: a dashed circle and "No qualified {Guard|Forward|Center} yet". Header above the court: mono label "Most impactful by position", title "BIQ's starting five", one line of `--fog` text: "The highest combined rank score at two guards, two forwards and a center, among players who meet the leaderboard's games-and-minutes bar." Below 640px: `.biq-five-court` hidden, `.biq-five-cards` (grid, 2 columns, star card first and full width) shown.

- [ ] **Step 1: Build the component and styles.**
- [ ] **Step 2: Typecheck and lint** `npx tsc --noEmit -p . && npm run lint` → clean; `npm test` → pass (theme test included).
- [ ] **Step 3: Commit**: `Homepage: the starting-five court`.

### Task 4: The new homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Restructure.** Fetch `/api/players/biq-leaders?limit=150`; on error, try `?limit=25`; on error, `[]`. `board = leaders.slice(0, 20)`, ticker `leaders.slice(0, 14)`, `const five = startingFive(leaders)`. Hero: two columns (≥ 900px), left = mono season label, h1, copy, search, Compare / Browse buttons; right = `<StartingFive>` when `leaders.length`, nothing otherwise; stacks on narrow screens. Then the board (unchanged), ticker, and one line `How BIQ works →` linking to `/model`. Delete `METHOD_SECTIONS`, `getTopByMetric`, the signals section, and now-unused imports. Header comment: drop "COURT PAPER".
- [ ] **Step 2: Typecheck, lint, tests** → clean.
- [ ] **Step 3: Look at it** on the dev server at 1280 and 390 wide: court and five correct players, star ringed, links work, no overlap, ticker and board intact; rerun the page-scan for light surfaces and low contrast on `/`.
- [ ] **Step 4: Fallback check:** temporarily point the page's 150 request at an invalid limit (e.g. 151) and confirm the homepage still renders from the 25 fallback; revert.
- [ ] **Step 5: CI checks + production build** in a worktree (`NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:9`) → pass.
- [ ] **Step 6: Commit**: `Homepage: starting five in the hero, shorter page`.
