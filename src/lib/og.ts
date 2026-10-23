/**
 * Open Graph images (1200×630), rendered at build time.
 *
 * Satori sets the type (text becomes paths, so the PNG needs no fonts at runtime); the print
 * work (paper, crop marks, overprinting shapes, halftone) is plain SVG around it, so resvg
 * can render the multiply blends. Satori can't read variable or woff2 fonts, so the static
 * Fontsource files stand in for Archivo: Archivo Narrow 700 for display, Plex Mono for labels.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { InkCombo } from '@/data/projects';

const W = 1200;
const H = 630;

/* Mirrors the paper-theme tokens in src/styles/tokens.css (the OG card is always "paper"). */
const INK = {
  paper: '#f1ece2',
  ink: '#2a1f1a',
  orange: '#e8501a',
  blue: '#3255a4',
  rule: '#b9b3a6',
};

const font = (pkg: string, file: string) =>
  readFileSync(resolve(process.cwd(), 'node_modules', pkg, 'files', file));

let fonts: Parameters<typeof satori>[1]['fonts'] | null = null;
const loadFonts = () =>
  (fonts ??= [
    {
      name: 'Display',
      data: font('@fontsource/archivo-narrow', 'archivo-narrow-latin-700-normal.woff'),
      weight: 700,
      style: 'normal',
    },
    {
      name: 'Mono',
      data: font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
      weight: 500,
      style: 'normal',
    },
  ]);

/** A tiny element helper so this file needs no JSX. */
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});

const label = (text: string, extra: Record<string, unknown> = {}) =>
  h(
    'div',
    {
      fontFamily: 'Mono',
      fontSize: 22,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: INK.ink,
      ...extra,
    },
    text,
  );

// a type alias (not an interface), so it can be used as Astro route props
export type OgOptions = {
  /** Mono line above the title. */
  kicker: string;
  /** Display lines (each on its own line). */
  lines: string[];
  /** Mono line at the bottom. */
  footer: string;
  ink: InkCombo | 'hero';
};

/** The print layer: crop marks, overprinting shapes and a colour bar, in plain SVG. */
function printLayer(ink: OgOptions['ink']): string {
  const m = 44; // trim inset
  const L = 26;
  const crop = [
    [m, m, -1, -1],
    [W - m, m, 1, -1],
    [m, H - m, -1, 1],
    [W - m, H - m, 1, 1],
  ]
    .map(
      ([x, y, dx, dy]) =>
        `<line x1="${x! + dx! * 10}" y1="${y}" x2="${x! + dx! * (10 + L)}" y2="${y}"/>` +
        `<line x1="${x}" y1="${y! + dy! * 10}" x2="${x}" y2="${y! + dy! * (10 + L)}"/>`,
    )
    .join('');

  const halftone = (id: string, color: string, angle: number) =>
    `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><circle cx="7" cy="7" r="4.6" fill="${color}"/></pattern>`;

  const blend = 'style="mix-blend-mode:multiply"';
  const art: Record<OgOptions['ink'], string> = {
    hero: `
      <circle cx="905" cy="250" r="190" fill="url(#htb)" ${blend}/>
      <rect x="690" y="330" width="22" height="170" fill="${INK.blue}" ${blend}/>
      <rect x="730" y="330" width="22" height="170" fill="${INK.blue}" ${blend}/>
      <rect x="770" y="330" width="22" height="170" fill="${INK.blue}" ${blend}/>
      <circle cx="800" cy="330" r="150" fill="${INK.orange}" ${blend}/>
      <polygon points="1040,70 1110,190 970,190" fill="${INK.orange}" ${blend}/>`,
    blue: `
      <rect x="700" y="110" width="200" height="22" fill="${INK.blue}"/>
      <rect x="700" y="150" width="200" height="22" fill="${INK.blue}"/>
      <rect x="700" y="190" width="200" height="22" fill="${INK.blue}"/>
      <circle cx="960" cy="300" r="190" fill="url(#htb)" ${blend}/>
      <rect x="700" y="300" width="180" height="180" fill="${INK.blue}" ${blend}/>
      <rect x="820" y="400" width="300" height="26" fill="${INK.orange}" ${blend}/>`,
    orange: `
      <path d="M 700 470 A 210 210 0 0 1 1120 470 Z" fill="${INK.orange}" ${blend}/>
      <rect x="690" y="490" width="440" height="20" fill="${INK.orange}"/>
      <rect x="690" y="530" width="440" height="20" fill="${INK.orange}"/>
      <rect x="700" y="110" width="110" height="110" fill="url(#hto)" ${blend}/>
      <polygon points="1020,110 1100,250 940,250" fill="${INK.blue}" ${blend}/>`,
    overprint: `
      <rect x="700" y="120" width="260" height="260" fill="${INK.orange}" ${blend}/>
      <circle cx="960" cy="360" r="170" fill="${INK.blue}" ${blend}/>
      <polygon points="690,440 820,560 690,560" fill="url(#hto)" ${blend}/>`,
  };

  const bar = [INK.orange, 'url(#hto)', INK.blue, 'url(#htb)', INK.ink]
    .map(
      (fill, i) =>
        `<rect x="${W - m - 5 * 22 + i * 22}" y="${H - m - 22}" width="22" height="22" fill="${fill}"/>`,
    )
    .join('');

  return `
    <defs>${halftone('htb', INK.blue, 15)}${halftone('hto', INK.orange, 75)}</defs>
    <rect width="${W}" height="${H}" fill="${INK.paper}"/>
    <rect x="${m}" y="${m}" width="${W - 2 * m}" height="${H - 2 * m}" fill="none" stroke="${INK.rule}" stroke-width="1.5"/>
    <g stroke="${INK.ink}" stroke-width="1.5">${crop}</g>
    <g style="isolation:isolate">${art[ink]}</g>
    <g>${bar}</g>`;
}

export async function renderOg({
  kicker,
  lines,
  footer,
  ink,
}: OgOptions): Promise<Uint8Array<ArrayBuffer>> {
  // titles stay left of the artwork, which starts at x ≈ 690
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(lines.length > 2 ? 124 : 132, Math.floor(560 / (longest * 0.52)));
  const type = h(
    'div',
    {
      position: 'relative',
      width: W,
      height: H,
      flexDirection: 'column',
      padding: '88px 96px 0',
    },
    label(kicker, { color: INK.blue }),
    h(
      'div',
      {
        position: 'absolute',
        left: 96,
        // satori positions from the top only: the title block ends at y ≈ 500
        top: 500 - lines.length * size * 0.9,
        flexDirection: 'column',
        fontFamily: 'Display',
        fontSize: size,
        lineHeight: 0.9,
        color: INK.ink,
      },
      ...lines.map((line, i) =>
        h(
          'div',
          {},
          line.replace(/\.$/, ''),
          ...(i === lines.length - 1 && line.endsWith('.')
            ? [h('span', { color: INK.orange }, '.')]
            : []),
        ),
      ),
    ),
    label(footer, { position: 'absolute', left: 96, top: 524 }),
  );

  const typeSvg = await satori(type as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: loadFonts(),
  });
  const inner = typeSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${printLayer(ink)}${inner}</svg>`;

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  return Uint8Array.from(png);
}
