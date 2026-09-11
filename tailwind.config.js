export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        lineStrong: 'var(--line-strong)',
        accent: 'var(--accent)',
        accentSoft: 'var(--accent-soft)',
        danger: 'var(--danger)',
        dangerSoft: 'var(--danger-soft)',
        warning: 'var(--warning)',
        warningSoft: 'var(--warning-soft)',
        proof: 'var(--proof)',
        proofSoft: 'var(--proof-soft)',
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'JetBrains Mono', 'monospace'],
        sans: ['var(--font-sans)', 'Inter', 'Geist', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
