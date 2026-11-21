// DarkNavSwitch.tsx — keeps the navbar legible over the homepage's dark hero.
//
// Renders nothing. The dark sections themselves are pure CSS (see
// .biq-hero-dark::before) so they can never fail; this only flips the navbar
// to light type while dark is actually behind it. Without JS the navbar simply
// stays paper, which is still readable.
'use client';

import { useEffect } from 'react';

export function DarkNavSwitch() {
  useEffect(() => {
    // The dark run can span more than one section; the nav stays light until
    // the last of them has scrolled out from behind it.
    const dark = Array.from(document.querySelectorAll('.biq-hero-dark')).pop();
    if (!dark) return;

    const html = document.documentElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      // The navbar is 64px tall; keep it light while dark is still behind it.
      html.classList.toggle('biq-dark-nav', dark.getBoundingClientRect().bottom > 140);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      html.classList.remove('biq-dark-nav');
    };
  }, []);

  return null;
}
