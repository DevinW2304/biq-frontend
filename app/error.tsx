'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page render failed', error);
  }, [error]);

  return (
    <main
      className="biq-page"
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
    >
      <section style={{ padding: '80px 0' }}>
        <p className="biq-mono">Something went wrong</p>
        <h1 className="biq-display biq-h2-size" style={{ marginTop: 12, maxWidth: '20ch' }}>
          This page could not be loaded
        </h1>
        <p
          style={{
            marginTop: 16,
            maxWidth: '60ch',
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--ink-2)',
          }}
        >
          The BIQ API did not respond as expected. This is usually temporary —
          the data cache may be refreshing. Try again in a moment.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <button type="button" onClick={reset} className="biq-btn">
            Try again
          </button>
          <Link href="/" className="biq-btn-ghost">
            Back to home
          </Link>
        </div>

        {error.digest ? (
          <p className="biq-mono" style={{ marginTop: 24, fontSize: 10 }}>
            Reference: {error.digest}
          </p>
        ) : null}
      </section>
    </main>
  );
}
