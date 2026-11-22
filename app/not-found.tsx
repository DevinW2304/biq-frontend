// app/not-found.tsx — every notFound() and unknown URL lands here, in the
// site's own style, with a way forward instead of Next's bare "404" line.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PlayerSearchBar } from '@/components/PlayerSearchBar';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="biq-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <section style={{ padding: '80px 0 120px' }}>
        <p className="biq-mono">404 · Not found</p>
        <h1 className="biq-display biq-h2-size" style={{ marginTop: 12, maxWidth: '20ch' }}>
          That page isn&apos;t here
        </h1>
        <p style={{ marginTop: 16, maxWidth: '60ch', fontSize: 15, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          The link may be old, or the player or team id may be mistyped. Search for a player, or
          start from the leaderboard.
        </p>

        <div style={{ maxWidth: 460, marginTop: 8 }}>
          <PlayerSearchBar />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
          <Link href="/leaderboard" className="biq-btn">
            See the leaderboard
          </Link>
          <Link href="/players" className="biq-btn-ghost">
            All players
          </Link>
          <Link href="/" className="biq-btn-ghost">
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
