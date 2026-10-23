/**
 * Halftone lens: a circular halftone field drawn on canvas whose dots swell under the
 * pointer, like a loupe over a print. It replaces an SVG halftone fallback ([data-lens-fallback])
 * only on desktop with a fine pointer and motion allowed; everyone else keeps the SVG.
 */
import { prefersReducedMotion } from './motion';

export interface LensOptions {
  /** Dot pitch in CSS px. */
  spacing?: number;
  /** Screen angle in degrees. */
  angle?: number;
  /** Resting dot radius as a fraction of the pitch. */
  rest?: number;
  /** Dot radius at the centre of the lens, as a fraction of the pitch. */
  peak?: number;
  /** Lens radius in CSS px. */
  radius?: number;
  /** CSS colour token to draw with. */
  ink?: string;
}

export function halftoneLens(canvas: HTMLCanvasElement, opts: LensOptions = {}): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ctx = canvas.getContext('2d');
  if (!ctx || !fine || prefersReducedMotion()) return () => {};

  const { spacing = 11, angle = 15, rest = 0.3, peak = 0.62, radius = 150, ink = '--blue' } = opts;
  const host = canvas.closest<HTMLElement>('[data-lens]') ?? canvas.parentElement!;
  host.classList.add('lens-on');

  let size = 0;
  let color = '';
  let px = -1e4;
  let py = -1e4;
  let lx = px;
  let ly = py;
  let strength = 0;
  let target = 0;
  let frame = 0;
  let visible = true;

  const readColor = () => {
    color = getComputedStyle(canvas).getPropertyValue(ink).trim() || 'currentColor';
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  function draw() {
    if (!size) return;
    const r = size / 2;
    const a = (angle * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const n = Math.ceil((size * 1.5) / spacing);

    ctx!.clearRect(0, 0, size, size);
    ctx!.fillStyle = color;
    ctx!.beginPath();
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        // a rotated screen, centred on the circle
        const gx = i * spacing;
        const gy = j * spacing;
        const x = r + gx * cos - gy * sin;
        const y = r + gx * sin + gy * cos;
        const fromCentre = Math.hypot(x - r, y - r);
        if (fromCentre > r - spacing * 0.2) continue;
        const d = Math.hypot(x - lx, y - ly);
        const t = Math.max(0, 1 - d / radius);
        const swell = t * t * (3 - 2 * t) * strength;
        const dot = spacing * (rest + (peak - rest) * swell);
        ctx!.moveTo(x + dot, y);
        ctx!.arc(x, y, dot, 0, Math.PI * 2);
      }
    }
    ctx!.fill();
  }

  const tick = () => {
    lx += (px - lx) * 0.18;
    ly += (py - ly) * 0.18;
    strength += (target - strength) * 0.1;
    draw();
    const moving =
      Math.abs(px - lx) + Math.abs(py - ly) > 0.3 || Math.abs(target - strength) > 0.004;
    frame = moving && visible ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (!frame && visible) frame = requestAnimationFrame(tick);
  };

  const onMove = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    px = event.clientX - box.left;
    py = event.clientY - box.top;
    const near = Math.hypot(px - box.width / 2, py - box.height / 2) < box.width / 2 + radius;
    target = near ? 1 : 0;
    if (strength < 0.01 && near) {
      lx = px;
      ly = py;
    }
    kick();
  };
  const onLeave = () => {
    target = 0;
    kick();
  };
  const onTheme = () => {
    // wait a frame so the new tokens have applied
    requestAnimationFrame(() => {
      readColor();
      draw();
    });
  };

  readColor();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) kick();
  });
  io.observe(canvas);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  document.addEventListener('themechange', onTheme);

  return () => {
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('themechange', onTheme);
    cancelAnimationFrame(frame);
    host.classList.remove('lens-on');
  };
}
