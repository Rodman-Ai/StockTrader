import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0f17',
          elevated: '#111827',
          subtle: '#0f172a',
        },
        line: '#1f2937',
        muted: '#6b7280',
        text: {
          DEFAULT: '#e5e7eb',
          dim: '#9ca3af',
        },
        up: '#22c55e',
        down: '#ef4444',
        accent: '#60a5fa',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
