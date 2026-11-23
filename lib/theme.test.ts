// The site's palette, held to its promises: dark everywhere, and every text
// colour readable (WCAG AA, 4.5:1) on every surface it sits on. Also keeps
// light backgrounds from creeping back in through inline styles.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

/** `--name: #hex` pairs from the theme's first :root block. */
function tokens(): Record<string, string> {
  const css = readFileSync(join(ROOT, 'app/styles/biq-theme.css'), 'utf8');
  const root = /:root\s*{([^}]*)}/.exec(css)?.[1] ?? '';
  return Object.fromEntries(
    Array.from(root.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\b/gi), (m) => [m[1], m[2].toLowerCase()]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const theme = tokens();
const AA = 4.5;

describe('the palette', () => {
  it('passes AA for text on every surface', () => {
    const failures: string[] = [];
    for (const text of ['ink', 'ink-2', 'fog', 'key', 'key-deep', 'up', 'down']) {
      for (const surface of ['paper', 'card', 'panel']) {
        const ratio = contrast(theme[text], theme[surface]);
        if (!(ratio >= AA)) failures.push(`--${text} on --${surface}: ${ratio.toFixed(2)}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('passes AA for button and chip text', () => {
    expect(contrast('#ffffff', theme['key-fill'])).toBeGreaterThanOrEqual(AA);
    expect(contrast('#ffffff', theme['key-fill-hover'])).toBeGreaterThanOrEqual(AA);
    expect(contrast(theme.key, theme['key-tint'])).toBeGreaterThanOrEqual(AA);
  });

  it('is a dark theme', () => {
    for (const surface of ['paper', 'card', 'panel']) {
      expect(luminance(theme[surface]), `--${surface}`).toBeLessThan(0.05);
    }
  });
});

// Backgrounds the light theme used. Any of them on a dark page is a hole.
const LIGHT_BACKGROUND =
  /background(-color)?\s*:\s*['"]?(#fff\b|#ffffff|white\b|#faf9f6|#f1efe9|#e9edfa|#f3f1eb)|rgba\(\s*250,\s*249,\s*246/i;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx|css)$/.test(name) ? [path] : [];
  });
}

describe('the code', () => {
  it('leaves no light backgrounds', () => {
    const hits = ['app', 'components'].flatMap((dir) =>
      sourceFiles(join(ROOT, dir)).flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .flatMap((line, i) => (LIGHT_BACKGROUND.test(line) ? [`${file.slice(ROOT.length + 1)}:${i + 1}`] : [])),
      ),
    );
    expect(hits).toEqual([]);
  });
});
