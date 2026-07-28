# COURT PAPER kit

Primitives for the BIQ light design system. Tokens and classes live in
`app/styles/biq-theme.css` (imported once in `app/layout.tsx`). Everything in
`BiqKit.tsx` is `"use client"`; the rest is server-component safe.

## BiqKit.tsx

```tsx
import { MeterBar, ScoreMeter, SectionHeader, TierChip } from '@/components/biq/BiqKit';

// The consistent BIQ score unit: label, tabular number, tier chip, gauge.
// The gauge fill on scroll-into-view is the site's ONE signature motion.
<ScoreMeter value={player.biqScore} label="BIQ SCORE" tier={player.biqTier} size="xl" />

// Bare gauge for rows and small tiles (value out of 100 by default).
<MeterBar value={component.score} />

// Small-caps label over a section title, with an optional right-side action.
<SectionHeader label="Top ten by BIQ" title="The board" action={<Link .../>} />

// Tier string as a quiet pill.
<TierChip>{player.biqTier}</TierChip>
```

## Server-safe pieces

```tsx
import { SubjectPhoto } from '@/components/biq/SubjectPhoto'; // color headshot, rounded
import { RuleGrid, StatCell } from '@/components/biq/StatGrid'; // hairline stat tile grid
import { TrendBars } from '@/components/biq/TrendBars'; // last-10 bars, latest in key blue

<SubjectPhoto id={player.id} name={player.name} size={52} />

<RuleGrid>
  {player.stats.map((s) => <StatCell key={s.label} {...s} />)}
</RuleGrid>

<TrendBars data={player.recentTrend} />
```

## Rules of thumb

- Every BIQ score on the site renders through ScoreMeter (or number +
  MeterBar). Never a bare styled number.
- Key blue only on verdicts, meter fills, links, and live/selected states.
- No new animation. Hovers come from the `.biq-row`, `.biq-card`, `.biq-btn`
  classes.
