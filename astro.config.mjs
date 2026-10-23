// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO(Malay): confirm final domain (keep in sync with src/data/site.ts)
const SITE = 'https://malayshikharsoni.me';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  // inline the CSS: one less render-blocking request on slow mobile connections
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  vite: {
    build: {
      // never inline bundled scripts: the CSP (vercel.json) allows only same-origin scripts
      // plus the hashed theme snippet in Base.astro
      assetsInlineLimit: 0,
    },
  },
  fonts: [
    {
      name: 'Archivo',
      cssVariable: '--font-archivo',
      provider: fontProviders.local(),
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            // Fontsource's Archivo (latin, wdth + wght), subset to the glyphs the site uses and
            // trimmed to weights 400–900: 46 KB instead of 90 KB. Rebuild it with
            // scripts/subset-font.sh if new characters are needed.
            src: ['./src/assets/fonts/archivo-subset.woff2'],
            weight: '400 900',
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
