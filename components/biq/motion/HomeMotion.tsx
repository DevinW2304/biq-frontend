// HomeMotion.tsx — every homepage animation, in one place.
//
// Renders nothing. app/page.tsx stays a server component and just tags its
// elements with data-anime attributes; this reads those tags on mount and
// drives them with anime.js v4.
//
// Safety contract (see docs/superpowers/specs/2026-07-27-homepage-motion-design.md
// and docs/superpowers/specs/2026-07-28-scroll-teardown-design.md):
//   no JS      -> the `js-motion` class never lands, nothing is ever hidden
//   reduced    -> everything settles to its end state without moving
//   JS throws  -> catch, reveal the page, log
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  createScope,
  createTimeline,
  onScroll,
  splitText,
  stagger,
  svg,
  utils,
  type Timeline,
} from 'animejs';
import { DUR, EASE, PHASE, RISE, STAGGER, TEAR } from './tokens';
import { ROW_TICK_SCALE } from './BiqEngine';

/** Fire-once scroll trigger. anime has no `once`; `repeat: false` is it. */
function once(target: Element, enter = 'bottom-=60 top') {
  return onScroll({ target, enter, repeat: false });
}

/** Anything replayable: timelines and standalone animations both expose restart. */
type Replayable = { restart: () => unknown };

function all<T extends Element = HTMLElement>(sel: string, root: ParentNode): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}

function one<T extends Element = HTMLElement>(sel: string, root: ParentNode): T | null {
  return root.querySelector<T>(sel);
}

/** Reads a numeric data attribute that the server wrote. */
function num(el: Element, key: string) {
  return Number((el as HTMLElement).dataset[key] ?? 0);
}

/**
 * Per-element value pulled from a data attribute. anime's typings read a
 * one-argument function as an easing, so the full (target, index, length)
 * signature is what marks this as a value function.
 */
function fromData(key: string) {
  return (el?: unknown, _i?: number, _targets?: unknown) => num(el as Element, key);
}

/* ------------------------------------------------------------------ */
/* Shared tweens                                                       */
/* ------------------------------------------------------------------ */

/** Sweeps a driven meter fill from empty to its data-meter-pct width. */
function addMeter(tl: Timeline, el: HTMLElement, position: number | string) {
  const pct = el.dataset.meterPct;
  if (!pct) return;
  tl.add(el, { width: ['0%', pct], duration: DUR.gauge, ease: EASE.gauge }, position);
}

/**
 * Ticks a score readout up to its true value. The server already rendered the
 * final number as text, so we only zero it here — and every count target sits
 * inside a hidden container, so the reset is never visible.
 */
function addCount(tl: Timeline, el: HTMLElement, position: number | string) {
  const to = Number(el.dataset.countTo);
  if (!Number.isFinite(to)) return;
  const decimals = Number(el.dataset.countDecimals ?? 1);
  const proxy = { n: 0 };
  el.textContent = (0).toFixed(decimals);
  tl.add(
    proxy,
    {
      n: to,
      duration: DUR.count,
      ease: EASE.count,
      onUpdate: () => {
        el.textContent = proxy.n.toFixed(decimals);
      },
      onComplete: () => {
        el.textContent = to.toFixed(decimals);
      },
    },
    position,
  );
}

/* ------------------------------------------------------------------ */
/* 1. Hero: the headline load timeline                                 */
/* ------------------------------------------------------------------ */

function heroIntro(root: HTMLElement) {
  const tl = createTimeline({ defaults: { ease: EASE.entrance, duration: DUR.base } });

  // Headline reveals character by character out of clipped word boxes.
  // splitText's accessible mode keeps the original string for screen readers.
  const headline = one('[data-anime="hero-headline"]', root);
  let chars: HTMLElement[] = [];
  if (headline) {
    chars = splitText(headline, {
      words: { wrap: 'clip' },
      chars: true,
      accessible: true,
    }).chars as HTMLElement[];
    // Arm the characters before un-hiding their container, or they flash first.
    utils.set(chars, { opacity: 0 });
    utils.set(headline, { opacity: 1 });
  }

  tl.add('[data-anime="hero-eyebrow"]', { opacity: [0, 1], translateY: [RISE.small, 0] }, 120);

  if (chars.length) {
    tl.add(
      chars,
      {
        opacity: [0, 1],
        translateY: ['110%', '0%'],
        duration: DUR.slow,
        delay: stagger(STAGGER.char),
      },
      '<<+=90',
    );
  }

  tl.add('[data-anime="hero-body"]', { opacity: [0, 1], translateY: [RISE.base, 0] }, '<<+=420')
    .add('[data-anime="hero-search"]', { opacity: [0, 1], translateY: [RISE.base, 0] }, '<<+=110')
    .add(
      '[data-anime="hero-cta"]',
      { opacity: [0, 1], translateY: [RISE.base, 0], delay: stagger(STAGGER.card) },
      '<<+=90',
    );

  return tl;
}

/* ------------------------------------------------------------------ */
/* 2. THE TEARDOWN — one timeline, scrubbed by scroll                  */
/* ------------------------------------------------------------------ */

/**
 * The object does not play. The reader drives it.
 *
 * One timeline is scrubbed across the pinned stage: read the lane field,
 * take the aperture apart, then reassemble the field as the top 20 board.
 * The scrub is one-way — see the note above the timeline below.
 *
 * The hard rule carried over from the sweep: a tick's height *is* its
 * component score, so nothing here ever rewrites that height. Ticks travel
 * and compress as a whole; the data they carry survives the journey.
 */
function teardown(root: HTMLElement) {
  const stage = one('[data-anime="stage"]', root);
  const engine = one('.biq-engine', root);
  if (!stage || !engine) return null;

  // The engine's parts are armed to invisible by CSS so a failed setup can
  // never leave a half-drawn instrument. Past this point the timeline owns
  // them, so reveal everything it will actually drive.
  utils.set(all('.biq-engine [data-anime]:not([data-motion-only]):not([data-anime="board-row"])', root), {
    opacity: 1,
  });

  const ticks = all<SVGRectElement>('[data-anime="lane-tick"]', engine);
  const anchors = all<SVGRectElement>('[data-anime="lane-tick"][data-lane="0"]', engine);
  const head = one<SVGGElement>('[data-anime="playhead"]', engine);
  const rows = all<HTMLElement>('[data-anime="board-row"]', engine);
  if (!ticks.length || !anchors.length) return null;

  // The markup paints ticks with `fill="var(--eng-tick)"` so a JS-less page is
  // still themed. anime cannot read a `var()` as a colour to tween *from*, and
  // silently drops the property, so materialise the resolved value once here.
  const cs = getComputedStyle(engine);
  const rest = cs.getPropertyValue('--eng-tick').trim() || 'rgba(244,241,232,0.58)';
  const lit = cs.getPropertyValue('--eng-key').trim() || '#6b8cff';
  utils.set(ticks, { fill: rest });

  // Driven by hand rather than by `onScroll({ sync: true })`, for two reasons.
  //
  // The teardown only ever goes forward: once the board is open it stays open,
  // so scrolling back up must not reassemble the instrument. A synced observer
  // scrubs both ways, and there is no one-way mode — so the timeline is paused
  // and seeked from a progress value that can only ever increase.
  //
  // Recomputing the stage's rect each frame also means the range can never go
  // stale the way a cached one does when the page reflows above the stage.
  const tl = createTimeline({ autoplay: false });

  /* ---- phase 1: READ (0 - 25%) ------------------------------------ */

  const columnX = anchors.map(
    (a) => Number(a.getAttribute('x') ?? 0) + Number(a.getAttribute('width') ?? 0) / 2,
  );

  if (head) {
    utils.set(head, { opacity: 1 });
    tl.add(
      head,
      {
        translateX: [columnX[0], columnX[columnX.length - 1]],
        duration: PHASE.read,
        ease: 'linear',
      },
      0,
    );
  }

  // Each column brightens as the playhead reaches it and falls back behind it.
  // Scrubbed, so scrolling back up un-reads them in reverse.
  anchors.forEach((_, pi) => {
    const column = all(`[data-anime="lane-tick"][data-player="${pi}"]`, engine);
    if (!column.length) return;
    tl.add(
      column,
      {
        fill: [
          { to: lit, duration: TEAR.columnLight, ease: 'out(2)' },
          { to: rest, duration: TEAR.columnLight * 2, ease: 'inOut(2)' },
        ],
      },
      (pi / anchors.length) * PHASE.read,
    );
  });

  /* ---- phase 2: RESOLVE (25 - 55%) -------------------------------- */

  const resolveSpan = PHASE.resolve - PHASE.read;

  // The ring fans apart along its own radii rather than merely fading — each
  // tick carries the direction it should leave in.
  const ringTicks = all('[data-anime="ring-tick"]', engine);
  if (ringTicks.length) {
    tl.add(
      ringTicks,
      {
        translateX: fromData('fanX'),
        translateY: fromData('fanY'),
        opacity: 0,
        duration: resolveSpan * 0.8,
        ease: 'inOut(2)',
        delay: stagger(TEAR.ringLag, { from: 'first' }),
      },
      PHASE.read,
    );
  }

  const arcs = all<SVGPathElement>('[data-anime="tier-arc"], [data-anime="verdict-arc"]', engine);
  if (arcs.length) {
    const drawables = svg.createDrawable(arcs);
    tl.add(
      drawables,
      { draw: '1 1', duration: resolveSpan * 0.7, ease: 'inOut(2)', delay: stagger(TEAR.ringLag * 6) },
      PHASE.read,
    );
  }

  tl.add(
    all('[data-anime="aperture"]', engine),
    { scale: 1.35, opacity: 0, duration: resolveSpan, ease: 'inOut(2)' },
    PHASE.read,
  ).add(
    all('[data-anime="beam"]', engine),
    { opacity: 0, duration: resolveSpan * 0.6, ease: 'linear', delay: stagger(TEAR.ringLag * 8) },
    PHASE.read,
  );

  // The lane scaffolding goes too — axes and labels describe a field that is
  // about to stop existing.
  tl.add(
    all('[data-anime="lane-axis"], [data-anime="lane-label"]', engine),
    { opacity: 0, duration: resolveSpan * 0.5, ease: 'linear', delay: stagger(TEAR.ringLag * 4) },
    PHASE.read + resolveSpan * 0.4,
  );

  if (head) {
    tl.add(head, { opacity: 0, duration: resolveSpan * 0.3, ease: 'linear' }, PHASE.read);
  }

  /* ---- phase 3: RANK, then HOLD ----------------------------------- */

  const rankSpan = PHASE.rank - PHASE.resolve;

  // The verdict hands over: the big number gives way as the board prints, and
  // row 01 carries the same score from there on.
  tl.add(
    all('[data-anime-group="verdict"]', engine),
    { scale: 0.6, opacity: 0, translateY: -40, duration: rankSpan * 0.45, ease: 'inOut(2)' },
    PHASE.resolve,
  );

  // Ranks 21-25 have no row to land in, so the field narrows to twenty first.
  const dropped = ticks.filter((t) => t.dataset.drops === '1');
  if (dropped.length) {
    tl.add(
      dropped,
      {
        translateY: 90,
        opacity: 0,
        duration: rankSpan * 0.35,
        ease: 'in(2)',
        delay: stagger(TEAR.tickLag * 0.5),
      },
      PHASE.resolve,
    );
  }

  // ...and the rest fly to their rows. Each tick was given its own delta by the
  // server, so this is one tween over 100 rects with no layout reads.
  const landing = ticks.filter((t) => t.dataset.drops !== '1');
  if (landing.length) {
    tl.add(
      landing,
      {
        translateX: fromData('toX'),
        translateY: fromData('toY'),
        scaleY: ROW_TICK_SCALE,
        duration: rankSpan * 0.5,
        ease: 'inOut(3)',
        delay: (el?: unknown, _i?: number, _targets?: unknown) =>
          num(el as Element, 'player') * TEAR.tickLag,
      },
      PHASE.resolve + rankSpan * 0.1,
    );
  }

  // Each row prints as its own five ticks touch down, so the board writes
  // itself top to bottom rather than appearing under ticks still in flight.
  const rowsAt = PHASE.resolve + rankSpan * 0.42;
  if (rows.length) {
    tl.add(
      rows,
      {
        opacity: [0, 1],
        translateY: [TEAR.rowTravel, 0],
        duration: rankSpan * 0.28,
        ease: 'out(2)',
        delay: stagger(TEAR.tickLag),
      },
      rowsAt,
    );
  }

  /* ---- HOLD (77 - 100%) -------------------------------------------
     Everything has landed. This spacer carries the timeline to its full
     length so the last stretch of stage scrolls with the board sitting
     still — without it the board finishes exactly as the pin releases and
     there is nothing to read. */
  tl.add({ hold: 0 }, { hold: 1, duration: PHASE.total - PHASE.rank, ease: 'linear' }, PHASE.rank);

  /* ---- the one-way scrub ------------------------------------------
     `high` is the furthest the reader has ever got. Scrolling back up leaves
     it alone, so the board stays landed and the instrument never reassembles
     itself behind them. */
  tl.pause();
  tl.seek(0);

  let high = 0;
  let raf = 0;
  let rowsReachable = false;

  const apply = () => {
    raf = 0;
    const r = stage.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    if (span <= 0) return;
    const progress = Math.min(1, Math.max(0, -r.top / span));
    if (progress <= high) return;
    high = progress;
    tl.seek(high * tl.duration);

    // The board's rows are links. `opacity: 0` hides them but leaves them in
    // the tab order, so before this point a keyboard user tabbing out of the
    // hero lands on twenty invisible leaderboard links. CSS keeps them
    // `visibility: hidden` until the rows are actually printing.
    //
    // Driven off the ratchet rather than the tween's own onBegin: the timeline
    // is seeked, not played, and a seek that jumps clean over a tween cannot be
    // relied on to fire its callbacks.
    if (!rowsReachable && high * tl.duration >= rowsAt) {
      rowsReachable = true;
      utils.set(rows, { visibility: 'visible' });
    }
  };

  const onScrollEvent = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  window.addEventListener('scroll', onScrollEvent, { passive: true });
  window.addEventListener('resize', onScrollEvent);
  apply();

  return {
    cleanup: () => {
      window.removeEventListener('scroll', onScrollEvent);
      window.removeEventListener('resize', onScrollEvent);
      if (raf) cancelAnimationFrame(raf);
    },
    // Winds the ratchet back so the dev replay button can actually replay the
    // main event. Clearing the inline visibility hands the rows back to the
    // CSS rule that keeps their links out of the tab order.
    reset: () => {
      high = 0;
      rowsReachable = false;
      tl.seek(0);
      utils.set(rows, { visibility: '' });
      apply();
    },
  };
}

/**
 * The dark stage itself is pure CSS (see .biq-hero-dark::before) so it can
 * never fail. All this does is flip the navbar to light type while it is
 * actually over the stage. Without JS the navbar simply stays paper, which
 * is still perfectly readable.
 */
function darkNav(root: HTMLElement) {
  const dark = one('[data-anime="stage"]', root) ?? one('[data-anime="hero"]', root);
  if (!dark) return null;

  const html = document.documentElement;
  let raf = 0;

  const update = () => {
    raf = 0;
    // The navbar is 64px tall; keep it light while the stage is still behind it.
    html.classList.toggle('biq-dark-nav', dark.getBoundingClientRect().bottom > 140);
  };

  const onScrollEvent = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScrollEvent, { passive: true });
  window.addEventListener('resize', onScrollEvent);

  return {
    cleanup: () => {
      window.removeEventListener('scroll', onScrollEvent);
      window.removeEventListener('resize', onScrollEvent);
      if (raf) cancelAnimationFrame(raf);
      html.classList.remove('biq-dark-nav');
    },
  };
}

/* ------------------------------------------------------------------ */
/* 3. Section rules draw left to right on scroll                       */
/* ------------------------------------------------------------------ */

/**
 * The stage's caption sits on the far side of the pin, armed to invisible like
 * every other `data-anime-hide` element. The teardown does not reach it, so it
 * gets its own trigger — without one it stays at opacity 0 forever.
 */
function revealCaption(root: HTMLElement) {
  const el = one('[data-anime="engine-footer"]', root);
  if (!el) return null;
  return animate(el, {
    opacity: [0, 1],
    translateY: [RISE.base, 0],
    duration: DUR.slow,
    ease: EASE.entrance,
    autoplay: once(el),
  });
}

function drawRules(root: HTMLElement) {
  return all<HTMLElement>('[data-anime="rule"]', root).map((rule) =>
    animate(rule, {
      scaleX: [0, 1],
      opacity: [0, 1],
      duration: DUR.slow,
      ease: EASE.entrance,
      autoplay: once(rule, 'bottom-=40 top'),
    }),
  );
}

/* ------------------------------------------------------------------ */
/* 4. Card grids                                                       */
/* ------------------------------------------------------------------ */

function cardGrid(root: HTMLElement, name: string) {
  const grid = one(`[data-anime="${name}-grid"]`, root);
  if (!grid) return null;
  const cards = all<HTMLElement>(`[data-anime="${name}-card"]`, grid);
  if (!cards.length) return null;

  const tl = createTimeline({ autoplay: once(grid) });

  cards.forEach((card, i) => {
    const at = i * STAGGER.card;
    tl.add(
      card,
      { opacity: [0, 1], translateY: [RISE.card, 0], duration: DUR.slow, ease: EASE.entrance },
      at,
    );
    const count = one('[data-anime="count"]', card);
    const meter = one('[data-anime="meter"]', card);
    if (count) addCount(tl, count, at + 90);
    if (meter) addMeter(tl, meter, at + 90);
  });

  return tl;
}

/** Pointer lift on the signal cards. Returns its own listener cleanup. */
function cardHovers(root: HTMLElement): () => void {
  const cards = all<HTMLElement>('[data-anime="signal-card"]', root);
  const teardownFns: Array<() => void> = [];

  cards.forEach((card) => {
    const lift = () => {
      animate(card, { translateY: -4, duration: DUR.quick, ease: EASE.hover });
    };
    const drop = () => {
      animate(card, { translateY: 0, duration: DUR.quick, ease: EASE.hover });
    };
    card.addEventListener('pointerenter', lift);
    card.addEventListener('pointerleave', drop);
    card.addEventListener('focusin', lift);
    card.addEventListener('focusout', drop);
    teardownFns.push(() => {
      card.removeEventListener('pointerenter', lift);
      card.removeEventListener('pointerleave', drop);
      card.removeEventListener('focusin', lift);
      card.removeEventListener('focusout', drop);
    });
  });

  return () => teardownFns.forEach((fn) => fn());
}

/* ------------------------------------------------------------------ */
/* Settle: the no-animation end state                                  */
/* ------------------------------------------------------------------ */

function settle(root: HTMLElement) {
  utils.set(all('[data-anime-hide]', root), {
    opacity: 1,
    translateY: 0,
    translateX: 0,
    scaleX: 1,
    scaleY: 1,
    scale: 1,
  });
  // The instrument arms as a whole via CSS, so it settles as a whole too.
  utils.set(all('.biq-engine [data-anime]', root), {
    opacity: 1,
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    scale: 1,
  });
  all<HTMLElement>('[data-anime="meter"]', root).forEach((el) => {
    if (el.dataset.meterPct) utils.set(el, { width: el.dataset.meterPct });
  });
  // Board rows are armed `visibility: hidden` to keep their links out of the
  // tab order until they print. On this path they never print, so hand them
  // back — they are the board.
  utils.set(all('[data-anime="board-row"]', root), { visibility: 'visible' });
  // Parts that only exist to carry motion — the playhead above all — have
  // nothing to say once nothing is moving, so the blanket reveal above must
  // not leave them stranded on screen.
  utils.set(all('[data-motion-only]', root), { opacity: 0 });
  // Counts keep their server-rendered text — nothing zeroed them on this path.
}

/* ------------------------------------------------------------------ */

export function HomeMotion() {
  const replayRef = useRef<(() => void) | null>(null);
  const [canReplay, setCanReplay] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-anime-root]');
    if (!root) return;

    // Two ways to end up with no teardown, and they must match the stylesheet's
    // combined query exactly or JS would animate a layout that isn't on screen.
    // The width case is geometry, not preference: below this the board's rows
    // are pitched closer together than their own text is tall. See the
    // "no teardown" block in biq-theme.css for the measurements.
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 1080px)').matches;

    if (still) {
      settle(root);
      // The stage is still dark for these users, so the navbar still inverts.
      const nav = darkNav(root);
      return () => nav?.cleanup();
    }

    try {
      const replayable: Replayable[] = [];
      const cleanups: Array<() => void> = [];
      const resets: Array<() => void> = [];

      const scope = createScope({ root }).add(() => {
        replayable.push(heroIntro(root));

        // The teardown reads scroll rather than playing, so there is nothing
        // for it to collide with in the hero entrance above. It is deliberately
        // not replayable — it only moves forward, and its position is a
        // property of where the reader has scrolled, not of a play head.
        const tear = teardown(root);
        if (tear) {
          cleanups.push(tear.cleanup);
          resets.push(tear.reset);
        }

        const nav = darkNav(root);
        if (nav) cleanups.push(nav.cleanup);

        const caption = revealCaption(root);
        if (caption) replayable.push(caption);

        replayable.push(...drawRules(root));
        for (const name of ['signal', 'method']) {
          const grid = cardGrid(root, name);
          if (grid) replayable.push(grid);
        }
        return cardHovers(root);
      });

      replayRef.current = () => {
        resets.forEach((fn) => fn());
        replayable.forEach((t) => t.restart());
      };
      setCanReplay(true);

      return () => {
        replayRef.current = null;
        setCanReplay(false);
        cleanups.forEach((fn) => fn());
        scope.revert();
      };
    } catch (error) {
      // A motion bug must never leave the page blank.
      console.error('[BIQ motion] setup failed; revealing page', error);
      settle(root);
      return;
    }
  }, []);

  // The entrance is a one-shot on load, which makes it easy to miss while
  // reviewing. This button replays every timeline on demand. Development only:
  // Next.js inlines NODE_ENV, so it is stripped from production builds.
  if (process.env.NODE_ENV !== 'development' || !canReplay) return null;

  return (
    <button
      type="button"
      onClick={() => replayRef.current?.()}
      className="biq-mono"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 9999,
        background: 'var(--key)',
        color: '#fff',
        border: 0,
        borderRadius: 999,
        padding: '10px 18px',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(30, 28, 23, 0.18)',
      }}
    >
      ▸ Replay motion
    </button>
  );
}
