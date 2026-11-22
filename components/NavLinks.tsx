'use client';

// The header's links, marked with aria-current on the section you're in, so
// the nav says where you are. Shared by the desktop bar and the phone panel.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavLink } from '@/components/MobileNav';

/** A link is current on its own path and everything under it (/players/123). */
export function isCurrent(pathname: string, href: string) {
  const path = href.split('?')[0];
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function NavLinks({ links, className }: { links: NavLink[]; className: string }) {
  const pathname = usePathname() ?? '';
  return (
    <>
      {links.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${className} nav-link-live`}
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={className}
            aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ),
      )}
    </>
  );
}
