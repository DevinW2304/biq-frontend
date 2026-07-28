// Global footer: one quiet line on every page.
export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 8,
          fontSize: 13,
          color: 'var(--fog)',
        }}
      >
        <span>BIQ, the Basketball Intelligence Quotient. 2025-26 season.</span>
        <span>All evaluations are current-season only.</span>
      </div>
    </footer>
  );
}
