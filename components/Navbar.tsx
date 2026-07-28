import Link from 'next/link';

const navStyles = `
  .nav-link { color: var(--ink-2); font-size: 14px; font-weight: 500; transition: color 0.15s ease; }
  .nav-link:hover, .nav-link:focus-visible { color: var(--ink); }
  .nav-link-live { color: var(--key); }
  .nav-link-live:hover, .nav-link-live:focus-visible { color: var(--key-deep); }
  .nav-search::placeholder { color: var(--fog); }
  .nav-search:focus { border-color: var(--key); }
  @media (max-width: 900px) { .nav-search { display: none; } }
  @media (max-width: 720px) { .nav-tagline { display: none; } }
`;

const navLinks = [
  { href: '/players?q=',              label: 'Players',     external: false },
  { href: '/leaderboard',             label: 'Leaderboard', external: false },
  { href: '/teams',                   label: 'Teams',       external: false },
  { href: '/compare?a=2544&b=201939', label: 'Compare',     external: false },
  { href: '/model',                   label: 'Model',       external: false },
  { href: 'https://biq-coach.vercel.app', label: 'HoopCoach', external: true },
];

export function Navbar() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(250, 249, 246, 0.94)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              background: 'var(--key)',
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
          <span
            className="biq-display"
            style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            BIQ
          </span>
          <span className="nav-tagline" style={{ fontSize: 13, color: 'var(--fog)' }}>
            Basketball Intelligence
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link nav-link-live"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* Server-safe search: submits to the existing /players?q= flow */}
          <form action="/players" method="get" style={{ display: 'flex' }}>
            <input
              name="q"
              placeholder="Search players"
              className="nav-search"
              style={{
                width: 160,
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 999,
                color: 'var(--ink)',
                fontSize: 13,
                padding: '7px 14px',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
            />
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: navStyles }} />
    </header>
  );
}
