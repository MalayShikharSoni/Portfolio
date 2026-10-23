/**
 * Architecture diagram geometry, computed at build time. The same diagram is laid out twice:
 * "wide" (columns across, for desktop) and "tall" (transposed, for phones). Connections are
 * orthogonal bars between node centres; the request path is one continuous SVG path, and
 * each node on it knows how far along the path it sits (0–1), so the script only has to
 * move a dot along it.
 */
import type { Diagram, DiagramNode } from '@/data/projects';

export type Orientation = 'wide' | 'tall';

interface Point {
  x: number;
  y: number;
}

export interface PlacedNode extends DiagramNode, Point {
  /** Position along the request path (0–1), or null for side-channel nodes. */
  at: number | null;
  captionLines: string[];
}

export interface DiagramLayout {
  width: number;
  height: number;
  /** Shape size (square side / circle diameter / triangle width). */
  size: number;
  label: number;
  caption: number;
  nodes: PlacedNode[];
  edges: { d: string; side: boolean }[];
  route: string;
}

const CONFIG = {
  wide: { cw: 240, ch: 168, size: 58, label: 17, caption: 12.5, wrap: 28 },
  tall: { cw: 250, ch: 210, size: 74, label: 27, caption: 20, wrap: 17 },
} as const;

/** Greedy word wrap into lines of at most `max` characters. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const toD = (pts: Point[]) =>
  pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

const segLength = (pts: Point[]) =>
  pts.slice(1).reduce((sum, p, i) => {
    const prev = pts[i]!;
    return sum + Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y);
  }, 0);

export function layoutDiagram(diagram: Diagram, orientation: Orientation): DiagramLayout {
  const c = CONFIG[orientation];
  const wide = orientation === 'wide';
  const cols = wide ? diagram.cols : diagram.rows;
  const rows = wide ? diagram.rows : diagram.cols;

  const place = (n: DiagramNode): Point => {
    const col = wide ? n.col : n.row;
    const row = wide ? n.row : n.col;
    // the shape sits in the upper part of its cell; label + caption hang below it
    return { x: (col + 0.5) * c.cw, y: row * c.ch + c.size / 2 + c.ch * 0.12 };
  };

  const byId = new Map(diagram.nodes.map((n) => [n.id, { ...n, ...place(n) }]));
  const centres = [...byId.values()];
  const occupied = (p: Point) => centres.some((n) => n.x === p.x && n.y === p.y);

  /** Orthogonal route; the elbow goes whichever way doesn't run through another node. */
  const route = (a: Point, b: Point): Point[] => {
    if (a.x === b.x || a.y === b.y) return [a, b];
    const vertical = { x: a.x, y: b.y };
    const horizontal = { x: b.x, y: a.y };
    return [a, occupied(vertical) ? horizontal : vertical, b];
  };

  const edges = diagram.edges.flatMap((e) => {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    return a && b ? [{ d: toD(route(a, b)), side: Boolean(e.side) }] : [];
  });

  // The request path as one continuous polyline, with each node's distance along it.
  const pathNodes = diagram.path.map((id) => byId.get(id)).filter((n) => n !== undefined);
  const points: Point[] = [];
  const distance = new Map<string, number>();
  let travelled = 0;
  pathNodes.forEach((node, i) => {
    if (i === 0) {
      points.push(node);
      distance.set(node.id, 0);
      return;
    }
    const leg = route(pathNodes[i - 1]!, node);
    travelled += segLength(leg);
    points.push(...leg.slice(1));
    distance.set(node.id, travelled);
  });
  const total = travelled || 1;

  const nodes: PlacedNode[] = centres.map((n) => ({
    ...n,
    at: distance.has(n.id) ? Number(((distance.get(n.id) ?? 0) / total).toFixed(4)) : null,
    captionLines: wrap(n.caption, c.wrap),
  }));

  return {
    width: cols * c.cw,
    height: rows * c.ch,
    size: c.size,
    label: c.label,
    caption: c.caption,
    nodes,
    edges,
    route: toD(points),
  };
}
