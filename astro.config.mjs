// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO(Malay): confirm final domain (keep in sync with src/data/site.ts)
const SITE = 'https://malayshikharsoni.me';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  fonts: [
    {
      name: 'Archivo',
      cssVariable: '--font-archivo',
      provider: fontProviders.local(),
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'],
            weight: '100 900',
            stretch: '62% 125%',
            style: 'normal',
          },
        ],
      },
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      provider: fontProviders.local(),
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'],
            weight: 400,
            style: 'normal',
          },
          {
            src: ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2'],
            weight: 500,
            style: 'normal',
          },
        ],
      },
    },
  ],
});
