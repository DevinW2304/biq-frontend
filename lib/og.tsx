import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Shared Open Graph card: the homepage's dark stage with paper type and the
// key-blue accent. Colors mirror the COURT PAPER tokens in biq-theme.css.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const STAGE = '#131210';
const PAPER = '#faf9f6';
const FOG = '#a39d90';
const KEY = '#2545cb';
const TRACK = '#2d2a25';

// The site's display face (OFL, see assets/fonts/OFL.txt). Loaded once per
// server instance; the default OG font has no bold weight.
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 700 }[]> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all(
    ([['Regular', 400], ['Bold', 700]] as const).map(async ([file, weight]) => ({
      name: 'Bricolage Grotesque',
      data: await readFile(join(process.cwd(), 'assets/fonts', `BricolageGrotesque-${file}.ttf`)),
      weight,
    }))
  );
  return fontsPromise;
}

type OgCardProps = {
  eyebrow: string;
  title: string;
  meta?: string;
  score?: { value: number; label: string };
};

export async function ogCard({ eyebrow, title, meta, score }: OgCardProps) {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: STAGE,
          color: PAPER,
          fontFamily: 'Bricolage Grotesque',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, letterSpacing: 4, color: FOG }}>
          <span>{eyebrow.toUpperCase()}</span>
          <span style={{ color: PAPER, fontWeight: 700 }}>BIQ</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ fontSize: title.length > 24 ? 72 : 92, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
              {title}
            </div>
            {meta && <div style={{ marginTop: 20, fontSize: 30, color: FOG }}>{meta}</div>}
          </div>

          {score && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 280 }}>
              <div style={{ fontSize: 132, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>
                {score.value.toFixed(1)}
              </div>
              <div style={{ display: 'flex', width: '100%', height: 10, marginTop: 18, background: TRACK }}>
                <div style={{ width: `${Math.max(0, Math.min(100, score.value))}%`, background: KEY }} />
              </div>
              <div style={{ marginTop: 14, fontSize: 24, letterSpacing: 3, color: FOG }}>
                {score.label.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
