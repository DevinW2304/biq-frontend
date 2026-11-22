'use client';

// Phone-width navigation: a Menu button that opens the links and search as a
// panel under the header. Closes on navigation and on Escape.
import { usePathname, useSearchParams } from 'next/navigation';
import { NavLinks } from '@/components/NavLinks';
import { useEffect, useId, useState } from 'react';

export type NavLink = { href: string; label: string; external: boolean };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelId = useId();

  useEffect(() => setOpen(false), [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="nav-mobile">
      <button
        type="button"
        className="nav-menu-button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <div id={panelId} className="nav-panel" hidden={!open}>
        <nav aria-label="Main">
          <NavLinks links={links} className="nav-panel-link" />
        </nav>
        <form action="/players" method="get" className="nav-panel-search">
          <input name="q" type="search" placeholder="Search players" aria-label="Search players" className="nav-search" />
        </form>
      </div>
    </div>
  );
}
