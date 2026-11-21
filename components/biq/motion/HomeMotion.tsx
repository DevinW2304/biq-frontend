// HomeMotion.tsx — every homepage animation, in one place.
//
// Renders nothing. app/page.tsx stays a server component and just tags its
// elements with data-anime attributes; this reads those tags on mount and
// drives them with anime.js v4.
//
// Safety contract (see docs/superpowers/specs/2026-07-27-homepage-motion-design.md):
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
  utils,
  type Timeline,
} from 'animejs';
import { DUR, EASE, RISE, STAGGER } from './tokens';

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

/**
 * The dark sections themselves are pure CSS (see .biq-hero-dark::before) so
 * they can never fail. All this does is flip the navbar to light type while
 * it is actually over them. Without JS the navbar simply stays paper, which
 * is still perfectly readable.
 */
function darkNav(root: HTMLElement) {
  // The dark run is the hero plus the instrument section under it; the nav
  // stays light until the last of them has scrolled out from behind it.
  const dark = all('.biq-hero-dark', root).pop();
  if (!dark) return null;

  const html = document.documentElement;
  let raf = 0;

  const update = () => {
    raf = 0;
    // The navbar is 64px tall; keep it light while dark is still behind it.
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
/* 2. Section rules draw left to right on scroll                       */
/* ------------------------------------------------------------------ */

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
/* 3. Card grids                                                       */
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
  all<HTMLElement>('[data-anime="meter"]', root).forEach((el) => {
    if (el.dataset.meterPct) utils.set(el, { width: el.dataset.meterPct });
  });
  // Counts keep their server-rendered text — nothing zeroed them on this path.
}

/* ------------------------------------------------------------------ */

export function HomeMotion() {
  const replayRef = useRef<(() => void) | null>(null);
  const [canReplay, setCanReplay] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-anime-root]');
    if (!root) return;

    // Must match the "still" query in biq-theme.css exactly, or JS would
    // animate elements the stylesheet has already revealed. Narrow screens
    // have always rendered the homepage still; that is kept as it was.
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 1080px)').matches;

    if (still) {
      settle(root);
      // The hero is still dark for these users, so the navbar still inverts.
      const nav = darkNav(root);
      return () => nav?.cleanup();
    }

    try {
      const replayable: Replayable[] = [];
      const cleanups: Array<() => void> = [];

      const scope = createScope({ root }).add(() => {
        replayable.push(heroIntro(root));

        const nav = darkNav(root);
        if (nav) cleanups.push(nav.cleanup);

        replayable.push(...drawRules(root));
        for (const name of ['signal', 'method']) {
          const grid = cardGrid(root, name);
          if (grid) replayable.push(grid);
        }
        return cardHovers(root);
      });

      replayRef.current = () => {
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
