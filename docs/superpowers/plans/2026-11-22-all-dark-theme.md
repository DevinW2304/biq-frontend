# All-Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page of the site dark, in the homepage band's palette, with one header look everywhere.

**Architecture:** Change the values of the existing CSS theme tokens (biq-theme.css `:root`, plus the legacy names in globals.css) to dark ones, add two tokens the dark palette needs, replace hard-coded light colours with tokens, and delete the homepage-only dark stage and navbar switch. A Vitest test pins the palette's contrast and forbids light backgrounds from coming back.

**Tech Stack:** Next.js 14 App Router, plain CSS (biq-theme.css, globals.css, inline styles), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-22-all-dark-theme-design.md`

## Global Constraints

- Palette (token: value). Existing names keep their meaning; two are new.
  - `--paper: #131210` page background
  - `--card: #1b1916` (new) raised surfaces: cards, inputs, dropdowns (were `#fff`)
  - `--panel: #24221e` tinted panels, hovers, photo backgrounds
  - `--line: #2e2b26`, `--line-strong: #45413a`
  - `--ink: #f4f1e8`, `--ink-2: #c9c4b8`, `--fog: #9a9486`
  - `--key: #6b8cff` links, highlights, gauges, focus; `--key-deep: #93abff` (hover, brighter on dark)
  - `--key-tint: #1f2540` chips, selected rows
  - `--key-fill: #3358e6` (new) solid button fill under white text
  - `--up: #4cc38a`, `--down: #ff7a6b`
- Contrast floors: 4.5:1 for `--ink`, `--ink-2`, `--fog`, `--key`, `--up`, `--down` on `--paper`, `--card` and `--panel`; white on `--key-fill`; `--key` on `--key-tint`.
- `color-scheme: dark` on `:root`; browser theme colour `#131210`.
- No light mode, no toggle, no homepage layout changes.
- Commits: no Claude attribution; commit locally, don't push.

## Review Focus

- A light surface hiding in a rarely seen state: the 0-games profile card, the unrated cover, the compare empty state, the 404, the search dropdown's "no matches" and error rows. Covered by the light-background test (Task 1) and the route pass (Task 4).
- Text drawn on `--key-fill` or `--key-tint` that used `--key` (now light blue on blue). Covered by Task 4's pass over buttons, chips and the leaderboard's selected rows.
- Inline `rgba(…)` overlays in `stacked-leaderboard.tsx` written for a light page (the photo-card overlays). Task 3.
- Share images (`lib/og.tsx`) and the favicon (`app/icon.svg`) still showing paper. Task 3.
- Homepage hero and board still reading `--eng-*` variables after the stage is removed. Task 2's grep step.

---

### Task 1: Dark tokens, and a test that holds them

**Files:**
- Create: `lib/theme.test.ts`
- Modify: `app/styles/biq-theme.css` (`:root` block lines 10-25; `#fff` at 69, 104, 185, 199, 287, 432; button text at 216, 262; dropdown shadow at 107)
- Modify: `app/globals.css` (`:root` lines 13-42: `color-scheme` and legacy tokens; ticker label text at 108)
- Modify: `app/layout.tsx` (add `export const viewport = { themeColor: '#131210' }`)

**Interfaces:**
- Produces: tokens `--card` and `--key-fill` (used by Tasks 2-3); the palette above.

- [ ] **Step 1: Write `lib/theme.test.ts`**

Reads `app/styles/biq-theme.css` with `fs`, parses `--name: #hex` pairs from the first `:root` block, computes WCAG contrast. Tests:
- `it('passes AA for text on every surface')`: for each of `ink, ink-2, fog, key, up, down` × `paper, card, panel`, `contrast >= 4.5`.
- `it('passes AA for button and chip text')`: `contrast('#ffffff', key-fill) >= 4.5`; `contrast(key, key-tint) >= 4.5`.
- `it('is a dark theme')`: luminance of `paper`, `card`, `panel` each `< 0.05`.
- `it('leaves no light backgrounds in the code')`: scan `app/**/*.{tsx,css}` and `components/**/*.tsx` (not `*.test.ts`) for `/background(-color)?\s*:\s*['"]?(#fff\b|#ffffff|white\b|#faf9f6|#f1efe9|#e9edfa|#f3f1eb)/i` and for `rgba\(\s*250,\s*249,\s*246`; expect no matches (report file:line on failure).

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run lib/theme.test.ts`
Expected: FAIL (`paper` is light; `#fff` backgrounds found).

- [ ] **Step 3: Set the palette**

In `biq-theme.css` `:root`: the Global Constraints values, comments updated to say dark. `#fff` surfaces → `var(--card)`; ghost-button hover → `var(--panel)`; the `0 0 0 1px #fff` ring → `var(--paper)`; dropdown shadow → `0 10px 28px rgba(0, 0, 0, 0.5)`; solid buttons' background `var(--key)` → `var(--key-fill)`, hover `var(--key-deep)` → a lighter fill `#4a6cf0` (white text must still pass; check in the test by adding it to the button assertion). In `globals.css`: `color-scheme: dark`; `--bg`, `--s1..s4`, `--border*`, `--text*`, `--muted`, `--faint`, `--overlay-*`, `--signal`, `--rule`, `--bone` mapped to the dark tokens' values (`--faint: #7a7468` is decorative only). Header comments: "COURT PAPER" → dark.

- [ ] **Step 4: Run the test**

Run: `npx vitest run lib/theme.test.ts`
Expected: the three palette tests PASS; the scan still fails, listing only files Tasks 2-3 own (`Navbar.tsx`, `stacked-leaderboard.tsx`, `TeamIndex.tsx`, `StatGrid.tsx`). The test file is committed in Task 3, once it passes.

- [ ] **Step 5: Commit**

```bash
git add app/styles/biq-theme.css app/globals.css app/layout.tsx
git commit -m "Theme: dark palette for every page"
```

### Task 2: One header, no homepage stage

**Files:**
- Delete: `components/biq/DarkNavSwitch.tsx`
- Modify: `app/page.tsx` (drop `DarkNavSwitch` import/use at 17, 265; drop `biq-hero-dark`/`biq-dark-end` classes at 102, 153, 179; keep `biq-home` only if a non-stage rule needs it)
- Modify: `app/styles/biq-theme.css` (delete the DARK HERO block 509-611: `.biq-page.biq-home`, `.biq-hero-dark*`, `.biq-dark-end`, `.biq-dark-nav *`; board rules reading `--eng-*` → tokens: `--eng-key`→`--key`, `--eng-line`→`--line`, `--eng-label`→`--fog`, `--eng-ink`→`--ink`; line 645 `#fff` → `var(--ink)`)
- Modify: `components/Navbar.tsx` (header background `rgba(19, 18, 16, 0.88)`; `.nav-search` backgrounds → `var(--card)`)
- Modify: `components/biq/README.md` (drop DarkNavSwitch mention)

- [ ] **Step 1: Make the edits above**
- [ ] **Step 2: Check nothing still references the stage**

Run: `grep -rn "biq-hero-dark\|biq-dark-end\|biq-dark-nav\|DarkNavSwitch\|--eng-" app components`
Expected: no output.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit -p . && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A app/page.tsx app/styles/biq-theme.css components/Navbar.tsx components/biq
git commit -m "Homepage: drop the dark stage and the navbar switch"
```

### Task 3: The hard-coded colours

**Files:**
- Modify: `components/stacked-leaderboard.tsx` (lines 13, 24, 46-47, 56, 67, 100-101, 296, 328, 376, 473, 511-610, 670, 716, 765-771, 811)
- Modify: `components/TeamIndex.tsx:44`, `components/biq/StatGrid.tsx:23`
- Modify: `app/icon.svg` (paper rect → `#131210`, mark stays key blue → `#6b8cff`)
- Modify: `lib/og.tsx` (`KEY` → `#6b8cff` where it colours text/gauges on the stage; `PAPER` used as text stays)
- Add: `lib/theme.test.ts` from Task 1

Rules: `#fff` surfaces → `var(--card)`; `#e9edfa` → `var(--key-tint)`; `#c8d3f2` → `var(--key)`; `#1b34a0` text → `var(--key-deep)`; `#2545cb` → `var(--key)` (lines, outlines) or `var(--key-fill)` (fills under white text); overlays already dark (`rgba(11,11,12,…)`, `rgba(10,12,20,…)`, white text on photos) stay.

- [ ] **Step 1: Make the edits**
- [ ] **Step 2: Run the whole frontend suite**

Run: `npm test`
Expected: all pass, including all four theme tests.

- [ ] **Step 3: Commit**

```bash
git add components lib app/icon.svg
git commit -m "Theme: no light colours left in components, icon or share images"
```

### Task 4: Every route, by eye

**Files:** whichever the pass turns up.

- [ ] **Step 1: Screenshot each route at 1280 and 390 wide** against the local backend: `/`, `/players`, `/players?q=la`, `/players?q=celtics`, a profile, an unrated profile, a 0-games profile, `/leaderboard` (both views), `/teams`, a team, `/compare` (empty and `?a=2544&b=201939`), `/model`, a 404, the search dropdown (results, no matches, error with backend stopped), `/opengraph-image`, `/players/<id>/opengraph-image`.
- [ ] **Step 2: Fix anything light, illegible, or blue-on-blue;** rerun `npm test`.
- [ ] **Step 3: CI checks and build** in a worktree: lint, `tsc`, `npm test`, `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:9 npm run build`. Expected: all pass.
- [ ] **Step 4: Commit** fixes: `git commit -m "Theme: fixes from the route-by-route pass"`.
