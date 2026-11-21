import { fetchSeasonInfo } from '@/lib/api';
import { formatShortDate } from '@/lib/format';

// Global footer: one quiet line on every page, including how current the
// numbers are so no one has to guess whether last night is in them.
export async function SiteFooter() {
  const info = await fetchSeasonInfo();
  const season = info?.season ?? null;
  const dataThrough = formatShortDate(info?.dataThrough);

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
        <span>
          BIQ, the Basketball Intelligence Quotient.{season ? ` ${season} season.` : ''}
        </span>
        <span>
          {dataThrough ? `Games through ${dataThrough}. ` : ''}All evaluations are current-season only.
        </span>
      </div>
    </footer>
  );
}
