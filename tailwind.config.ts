import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#081018',
        surface: '#101b26',
        border: '#1f3142',
        text: '#f3f7fb',
        muted: '#9cb0c3',
        accent: '#4cc9f0',
      },
    },
  },
  plugins: [],
};

export default config;
