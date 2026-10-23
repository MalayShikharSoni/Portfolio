/**
 * Interactive text effects.
 *
 *   scramble()      mono label "decrypts": glyphs cycle and resolve left → right
 *   bindScramble()  [data-scramble] labels decrypt on hover/focus of themselves or of the
 *                   nearest [data-scramble-trigger]
 *   pressure()      letters respond to the cursor on Archivo's width + weight axes, and the
 *                   two ink plates trail the cursor's velocity (misregistration fringes)
 *   circularSpin()  circular text badge turns with scroll velocity and on hover
 *
 * Everything is a no-op under reduced motion; the markup is always the final, readable text.
 */
import { prefersReducedMotion } from './motion';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// ── Scramble ─────────────────────────────────────────────────────────────────

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+#=';
const running = new WeakMap<HTMLElement, number>();

/** Decrypts `el`'s text over `duration` ms. The element must contain plain text only. */
export function scramble(el: HTMLElement, duration = 520) {
  if (prefersReducedMotion()) return;
  el.dataset.scrambleText ??= el.textContent ?? '';
  const original = el.dataset.scrambleText;
  const start = performance.now();
  let lastSwap = 0;
  cancelAnimationFrame(running.get(el) ?? 0);

  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    if (now - lastSwap > 45 || p === 1) {
      lastSwap = now;
      const resolved = Math.floor(smooth(p) * original.length);
      let out = '';
      for (let i = 0; i < original.length; i++) {
        const c = original[i] ?? '';
        out +=
          i < resolved || /\s|[—·/.,:]/.test(c) ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    }
    if (p < 1) running.set(el, requestAnimationFrame(tick));
    else el.textContent = original;
  };
  running.set(el, requestAnimationFrame(tick));
}

export function bindScramble(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    if (el.dataset.scrambleBound) return;
    el.dataset.scrambleBound = 'true';
    const trigger = el.closest<HTMLElement>('[data-scramble-trigger]') ?? el;
    const run = () => scramble(el);
    trigger.addEventListener('pointerenter', run);
    trigger.addEventListener('focusin', run);
  });
}

// ── Pressure + plate trail ──────────────────────────────────────────────────

export interface PressureOptions {
  /** Influence radius as a multiple of the element's font size. */
  radius?: number;
  /** Plates trail the pointer velocity (sets --tx / --ty on the root). */
  trail?: boolean;
}

export interface Pressure {
  /** A virtual pointer sweeps across the text once (intro, and for touch screens). */
  sweep(duration?: number): void;
  /** Knock the plates out of register and pulse the letters (click / tap). */
  stamp(x?: number, y?: number): void;
  destroy(): void;
}

/**
 * Letters (.ch) inside `root` swell toward the pointer: each gets --p (0–1), which the CSS
 * maps onto font-stretch and font-weight. Runs only while something is moving and the
 * element is on screen.
 */
export function pressure(root: HTMLElement, opts: PressureOptions = {}): Pressure {
  const noop: Pressure = { sweep() {}, stamp() {}, destroy() {} };
  if (prefersReducedMotion()) return noop;

  const chars = [...root.querySelectorAll<HTMLElement>('.ch')];
  const level = chars.map(() => 0);
  const radiusFactor = opts.radius ?? 1.15;
  const trail = opts.trail !== false;
  const FAR = -1e5;

  let px = FAR;
  let py = FAR;
  let lastX: number | null = null;
  let lastY = 0;
  let vx = 0;
  let vy = 0;
  let tx = 0;
  let ty = 0;
  let svx = 0;
  let svy = 0;
  let boost = 0;
  let sweep: { start: number; duration: number } | null = null;
  let visible = true;
  let frame = 0;

  const kick = () => {
    if (!frame && visible) frame = requestAnimationFrame(tick);
  };

  function tick(now: number) {
    const fontSize = parseFloat(getComputedStyle(root).fontSize);
    let radius = fontSize * radiusFactor;

    if (sweep) {
      const box = root.getBoundingClientRect();
      const p = Math.min(1, (now - sweep.start) / sweep.duration);
      radius *= 1.35;
      px = box.left - radius + (box.width + radius * 2) * smooth(p);
      py = box.top + box.height / 2;
      if (p === 1) {
        sweep = null;
        px = py = FAR;
      }
    }

    // Read every letter's position first, then write — one layout per frame.
    const centers = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2] as const;
    });

    let busy = Boolean(sweep);
    chars.forEach((c, i) => {
      const [cx, cy] = centers[i] ?? [0, 0];
      const d = Math.hypot(px - cx, (py - cy) * 1.2);
      const target = Math.min(1, smooth(clamp(1 - d / radius, 0, 1)) + boost);
      const current = level[i] ?? 0;
      const next = current + (target - current) * 0.16;
      level[i] = next;
      if (Math.abs(target - next) > 0.002) busy = true;
      c.style.setProperty('--p', next.toFixed(3));
    });

    boost *= 0.9;
    if (boost < 0.003) boost = 0;
    else busy = true;

    if (trail) {
      // springy plates: pushed by pointer velocity, pulled back into register
      const goalX = clamp(vx * 0.35, -11, 11);
      const goalY = clamp(vy * 0.35, -8, 8);
      vx *= 0.8;
      vy *= 0.8;
      svx = (svx + (goalX - tx) * 0.22) * 0.72;
      svy = (svy + (goalY - ty) * 0.22) * 0.72;
      tx += svx;
      ty += svy;
      root.style.setProperty('--tx', tx.toFixed(2));
      root.style.setProperty('--ty', ty.toFixed(2));
      if (Math.abs(tx) + Math.abs(ty) + Math.abs(svx) + Math.abs(svy) + Math.abs(vx) > 0.03) {
        busy = true;
      }
    }

    frame = busy && visible ? requestAnimationFrame(tick) : 0;
  }

  const onMove = (event: PointerEvent) => {
    if (sweep) return;
    if (lastX !== null) {
      vx += event.clientX - lastX;
      vy += event.clientY - lastY;
    }
    lastX = event.clientX;
    lastY = event.clientY;
    px = event.clientX;
    py = event.clientY;
    kick();
  };

  const onLeave = () => {
    px = py = FAR;
    lastX = null;
    kick();
  };

  const api: Pressure = {
    sweep(duration = 1500) {
      sweep = { start: performance.now(), duration };
      kick();
    },
    stamp(x, y) {
      boost = 0.5;
      const angle = Math.random() * Math.PI * 2;
      svx += Math.cos(angle) * 9;
      svy += Math.sin(angle) * 6;
      if (x !== undefined && y !== undefined) {
        px = x;
        py = y;
      }
      kick();
    },
    destroy() {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerup', onUp);
      io.disconnect();
      cancelAnimationFrame(frame);
    },
  };

  const onDown = (event: PointerEvent) => api.stamp(event.clientX, event.clientY);
  // touch: the letters relax once the finger lifts
  const onUp = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') onLeave();
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointerup', onUp);

  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) kick();
  });
  io.observe(root);

  return api;
}

// ── Circular text ───────────────────────────────────────────────────────────

/** Turns `el` with scroll velocity, and a little faster while hovered. Never loops idle. */
export function circularSpin(el: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {};
  let rot = 0;
  let vel = 0;
  let hover = false;
  let lastY = window.scrollY;
  let frame = 0;

  const tick = () => {
    const y = window.scrollY;
    vel = vel * 0.92 + (y - lastY) * 0.045 + (hover ? 0.14 : 0);
    lastY = y;
    rot = (rot + vel) % 360;
    el.style.transform = `rotate(${rot.toFixed(2)}deg)`;
    frame = Math.abs(vel) > 0.01 || hover ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const enter = () => {
    hover = true;
    kick();
  };
  const leave = () => {
    hover = false;
  };

  const target = el.closest<HTMLElement>('[data-spin-trigger]') ?? el;
  window.addEventListener('scroll', kick, { passive: true });
  target.addEventListener('pointerenter', enter);
  target.addEventListener('pointerleave', leave);

  return () => {
    window.removeEventListener('scroll', kick);
    target.removeEventListener('pointerenter', enter);
    target.removeEventListener('pointerleave', leave);
    cancelAnimationFrame(frame);
  };
}
