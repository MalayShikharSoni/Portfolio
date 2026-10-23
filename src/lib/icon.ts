/**
 * The MSS monogram as a standalone square icon (favicon, apple-touch-icon). Same geometry as
 * src/components/ui/Monogram.astro: the M is two bars and a triangle; each S is a pair of
 * half-discs, one per ink, overprinting where they meet.
 */
import { Resvg } from '@resvg/resvg-js';

const PAPER = '#f1ece2';
const INK = '#2a1f1a';
const ORANGE = '#e8501a';
const BLUE = '#3255a4';

/** viewBox 0 0 48 24, placed on a square canvas. */
const marks = (ink: string, blue: string) => `
  <g fill="${ink}">
    <rect x="0" y="0" width="5" height="24"/>
    <rect x="15" y="0" width="5" height="24"/>
    <polygon points="0,0 20,0 10,13"/>
  </g>
  <g fill="${blue}" style="mix-blend-mode:multiply">
    <path d="M 30 0 A 6 6 0 0 0 30 12 Z"/>
    <path d="M 30 12 A 6 6 0 0 1 30 24 Z"/>
  </g>
  <g fill="${ORANGE}" style="mix-blend-mode:multiply">
    <path d="M 42 0 A 6 6 0 0 0 42 12 Z"/>
    <path d="M 42 12 A 6 6 0 0 1 42 24 Z"/>
  </g>`;

/** The browser-tab icon. Follows the OS theme with a dark variant. */
export function faviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>
    .bg { fill: ${PAPER} }
    @media (prefers-color-scheme: dark) { .bg { fill: #17130f } .m { fill: ${PAPER} } }
  </style>
  <rect class="bg" width="64" height="64" rx="12"/>
  <g transform="translate(6 20) scale(1.1)">
    <g class="m" fill="${INK}">
      <rect x="0" y="0" width="5" height="24"/>
      <rect x="15" y="0" width="5" height="24"/>
      <polygon points="0,0 20,0 10,13"/>
    </g>
    <g fill="${BLUE}"><path d="M 30 0 A 6 6 0 0 0 30 12 Z"/><path d="M 30 12 A 6 6 0 0 1 30 24 Z"/></g>
    <g fill="${ORANGE}"><path d="M 42 0 A 6 6 0 0 0 42 12 Z"/><path d="M 42 12 A 6 6 0 0 1 42 24 Z"/></g>
  </g>
</svg>`;
}

/** A square PNG of the monogram on paper. */
export function iconPng(size: number, { rounded = false } = {}): Uint8Array<ArrayBuffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
    <rect width="64" height="64" rx="${rounded ? 12 : 0}" fill="${PAPER}"/>
    <g transform="translate(6 20) scale(1.1)" style="isolation:isolate">${marks(INK, BLUE)}</g>
  </svg>`;
  return Uint8Array.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng(),
  );
}
