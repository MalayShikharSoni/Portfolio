/** Shared paint logic for the geometric primitives. */

export type Ink = 'orange' | 'blue' | 'ink' | 'paper' | 'paper-2';
export type Fill = 'solid' | 'halftone' | 'halftone-fine' | 'stripes' | 'outline';

export interface ShapeProps {
  ink?: Ink;
  fill?: Fill;
  /** Blend with what is beneath (multiply on paper, screen on ink). Prefer blending whole plate groups. */
  overprint?: boolean;
  /** Print-run plate this shape belongs to (animated by motion.ts). */
  plate?: 'blue' | 'orange';
  /** Parallax depth for the hero drift (0–1). */
  depth?: number;
  class?: string;
  transform?: string;
}

const PATTERNS: Partial<Record<Fill, string>> = {
  halftone: 'ht',
  'halftone-fine': 'htf',
  stripes: 'st',
};

/** Returns SVG attributes for a shape painted in the given ink and fill. */
export function paint({
  ink = 'ink',
  fill = 'solid',
  overprint = false,
  plate,
  depth,
  class: className,
  transform,
}: ShapeProps): Record<string, string | number | undefined> {
  const classes = [className, overprint ? 'overprint' : undefined].filter(Boolean).join(' ');
  const base = {
    class: classes || undefined,
    transform,
    'data-plate': plate,
    'data-depth': depth,
  };

  if (fill === 'outline') {
    return {
      ...base,
      fill: 'none',
      style: `stroke: var(--${ink}); stroke-width: 1.5px`,
      'vector-effect': 'non-scaling-stroke',
    };
  }

  const pattern = PATTERNS[fill];
  if (pattern) {
    return { ...base, fill: `url(#${pattern}-${ink})` };
  }

  return { ...base, style: `fill: var(--${ink})` };
}
