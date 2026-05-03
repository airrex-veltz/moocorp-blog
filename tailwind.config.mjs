/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', '"Helvetica Neue"', '"Segoe UI"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', '"Malgun Gothic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          subtle: '#525252',
          muted: '#737373',
          line: '#e5e5e5',
          paper: '#fafafa',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '70ch',
            color: '#0a0a0a',
            lineHeight: '1.85',
            a: { color: '#0a0a0a', textDecoration: 'underline', textUnderlineOffset: '3px' },
            h1: { fontWeight: '800', letterSpacing: '-0.02em' },
            h2: { fontWeight: '700', letterSpacing: '-0.01em', marginTop: '2.5em', marginBottom: '0.8em', paddingTop: '0.5em', borderTop: '1px solid #e5e5e5' },
            h3: { fontWeight: '700', marginTop: '2em', marginBottom: '0.6em' },
            p: { marginTop: '1.4em', marginBottom: '1.4em' },
            blockquote: { fontWeight: '500', fontStyle: 'normal', borderLeftColor: '#0a0a0a', borderLeftWidth: '3px', color: '#0a0a0a' },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
            strong: { color: '#0a0a0a', fontWeight: '700' },
            code: { color: '#0a0a0a', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px', fontWeight: '500' },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            table: { fontSize: '0.95em' },
            'thead th': { borderBottomColor: '#0a0a0a', borderBottomWidth: '2px' },
            'tbody tr': { borderBottomColor: '#e5e5e5' },
          },
        },
      },
    },
  },
  plugins: [],
};
