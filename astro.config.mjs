import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://www.mooresearch.com',
  trailingSlash: 'never',
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR', en: 'en-US' },
      },
    }),
    tailwind(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
  },
});
