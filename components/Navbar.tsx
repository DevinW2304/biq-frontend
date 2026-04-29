import Link from 'next/link';

const navStyles = `
  .nav-link:hover { color: var(--text) !important; }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0.875rem;
    right: 0.875rem;
    height: 1px;
    background: var(--gold);
    transform: scaleX(0);
    transition: transform 0.2s ease;
    transform-origin: left;
  }
  .nav-link:hover::after { transform: scaleX(1); }
`;

const navLinks = [
  { href: '/players?q=',              label: 'Players',    external: false },
  { href: '/leaderboard',             label: 'Leaderboard',external: false },
  { href: '/teams',                   label: 'Teams',      external: false },
  { href: '/compare?a=2544&b=201939', label: 'Compare',    external: false },
  { href: '/model',                   label: 'Model',      external: false },
  { href: 'https://biq-coach.vercel.app', label: 'HoopCoach', external: true },
];

export function Navbar() {
  return (
    <header
      className="navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        background: 'rgba(6, 7, 9, 0.88)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background:
            'linear-gradient(90deg, transparent 0%, var(--gold) 30%, var(--teal) 70%, transparent 100%)',
          opacity: 0.7,
        }}
      />

      <div
        className="page-shell"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.875rem',
          paddingBottom: '0.875rem',
          position: 'relative',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              letterSpacing: '0.06em',
              color: 'var(--gold)',
              lineHeight: 1,
            }}
          >
            BIQ
          </span>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            Basketball Intelligence
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map((link) => {
            const baseStyle = {
              fontFamily: 'var(--font-condensed)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase' as const,
              padding: '0.4rem 0.875rem',
              transition: 'color 0.15s ease',
              position: 'relative' as const,
            };

            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link"
                  style={{ ...baseStyle, color: 'var(--gold)' }}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                style={{ ...baseStyle, color: 'var(--muted)' }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <style dangerouslySetInnerHTML={{ __html: navStyles }} />
    </header>
  );
}