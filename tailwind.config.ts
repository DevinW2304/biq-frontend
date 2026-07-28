import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* COURT PAPER: legacy utility names mapped to the light palette */
        background: '#faf9f6',
        surface: '#f1efe9',
        border: '#e3dfd5',
        text: '#1e1c17',
        muted: '#6f695c',
        accent: '#2545cb',
        /* tokens addressable directly (bg-paper, text-ink, border-line, ...) */
        paper: 'var(--paper)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        fog: 'var(--fog)',
        line: 'var(--line)',
        key: 'var(--key)',
      },
    },
  },
  plugins: [],
};

export default config;
