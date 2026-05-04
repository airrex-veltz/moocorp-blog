/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', '"Helvetica Neue"', '"Segoe UI"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', '"Malgun Gothic"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
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
            maxWidth: '65ch',
            color: '#0a0a0a',
            fontSize: '1.0625rem',
            lineHeight: '1.85',
            a: { color: '#0a0a0a', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationThickness: '1px' },
            'a:hover': { textDecorationThickness: '2px' },
            h1: { fontWeight: '900', letterSpacing: '-0.025em' },
            h2: {
              fontWeight: '800',
              letterSpacing: '-0.02em',
              fontSize: '1.875rem',
              marginTop: '4em',
              marginBottom: '1em',
              paddingTop: '1em',
              borderTop: '1px solid #e5e5e5',
            },
            h3: { fontWeight: '700', marginTop: '2.5em', marginBottom: '0.7em', fontSize: '1.375rem' },
            p: { marginTop: '1.5em', marginBottom: '1.5em' },
            'p:first-of-type': { fontSize: '1.1875rem', lineHeight: '1.75', fontWeight: '500', color: '#0a0a0a' },
            blockquote: { fontWeight: '500', fontStyle: 'normal', borderLeftColor: '#0a0a0a', borderLeftWidth: '3px', color: '#0a0a0a', marginTop: '2em', marginBottom: '2em' },
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:last-of-type::after': { content: 'none' },
            'blockquote p:first-of-type': { fontSize: '1.0625rem', fontWeight: '500' },
            strong: { color: '#0a0a0a', fontWeight: '700' },
            code: { color: '#0a0a0a', backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px', fontWeight: '500', fontSize: '0.95em' },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            table: { fontSize: '0.95em' },
            'thead th': { borderBottomColor: '#0a0a0a', borderBottomWidth: '2px' },
            'tbody tr': { borderBottomColor: '#e5e5e5' },
            hr: { borderColor: '#0a0a0a', marginTop: '4em', marginBottom: '4em' },
            'ul > li::marker': { color: '#737373' },
            'ol > li::marker': { color: '#737373', fontWeight: '500' },
          },
        },
        story: {
          css: {
            maxWidth: '58ch',
            color: '#0a0a0a',
            fontSize: '1.0625rem',
            lineHeight: '2.1',
            wordBreak: 'keep-all',

            p: {
              marginTop: '2em',
              marginBottom: '2em',
            },

            'p:first-of-type': {
              fontSize: '1.0625rem',
              fontWeight: '400',
            },

            'p:first-of-type::first-letter': {
              float: 'left',
              fontSize: '4.5em',
              lineHeight: '0.85',
              fontWeight: '900',
              marginRight: '0.1em',
              marginTop: '0.05em',
              color: '#0a0a0a',
              '@media (max-width: 640px)': {
                fontSize: '3.5em',
              },
            },

            a: {
              color: '#0a0a0a',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationThickness: '1px'
            },
            'a:hover': { textDecorationThickness: '2px' },
            strong: { color: '#0a0a0a', fontWeight: '700' },

            h2: { display: 'none' },
            h3: { display: 'none' },
          }
        },
      },
    },
  },
  plugins: [],
};
