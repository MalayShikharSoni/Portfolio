/**
 * Motion system. Declarative hooks in markup:
 *
 *   data-reveal="lines"    headline lines rise through masks
 *   data-reveal="misreg"   lines rise + orange/blue plates slide into registration
 *   data-reveal="fade"     body copy: fade + 10px rise
 *   data-reveal="stagger"  children fade + rise one after another
 *   data-reveal="wdth"     short single-line type lands from wide to its set width
 *   data-reveal="crop"     crop marks inside draw in
 *   data-reveal="plates"   an illustration's [data-plate] groups slide into register
 *   data-count="600"       numerals count up once (see Count.astro)
 *   data-reveal-delay="0.2"
 *
 * Rules: transform / opacity / clip-path / font variations only. Under reduced motion nothing
 * animates and everything is in its final state. If this file never runs, the CSS fail-safe
 * in global.css shows everything after 2.5s.
 */
import { gsap, ScrollTrigger, SplitText } from './gsap';

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE = {
  reveal: 'expo.out',
  soft: 'power4.out',
  /** The one deliberate snap on the site: plates locking into registration. */
  snap: 'back.out(3)',
} as const;

type Anim = gsap.core.Timeline | gsap.core.Tween;
interface Entry {
  anim?: Anim;
  split?: SplitText;
  extra?: SplitText[];
}

const entries = new Map<Element, Entry>();
let ctx: gsap.Context | null = null;

const once = (el: Element, start = 'top 88%'): ScrollTrigger.Vars => ({
  trigger: el,
  start,
  once: true,
});

const delayOf = (el: HTMLElement) => Number(el.dataset.revealDelay ?? 0) || 0;

function fontsReady(timeout = 1200): Promise<unknown> {
  if (!('fonts' in document)) return Promise.resolve();
  return Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, timeout))]);
}

// ── Lines + misregistration ──────────────────────────────────────────────────

function addPlates(line: HTMLElement): [HTMLElement, HTMLElement] {
  const make = (ink: 'blue' | 'orange') => {
    const plate = document.createElement('span');
    plate.className = `misreg-plate misreg-plate--${ink}`;
    plate.setAttribute('aria-hidden', 'true');
    plate.innerHTML = line.innerHTML;
    line.append(plate);
    return plate;
  };
  return [make('blue'), make('orange')];
}

/** Builds the line reveal for already-split lines. Shared by reveals and the print run. */
export function linesTimeline(
  el: HTMLElement,
  lines: Element[],
  { misreg = false, vars = {} }: { misreg?: boolean; vars?: gsap.TimelineVars } = {},
): gsap.core.Timeline {
  const tl = gsap.timeline(vars);
  tl.from(lines, { yPercent: 118, duration: 1.05, ease: EASE.reveal, stagger: 0.085 }, 0);

  if (misreg) {
    const plates = (lines as HTMLElement[]).map(addPlates);
    const blue = plates.map((p) => p[0]);
    const orange = plates.map((p) => p[1]);
    const all = plates.flat();
    el.classList.add('is-misreg');
    tl.fromTo(
      blue,
      { x: -3, y: 2, opacity: 1 },
      { x: 0, y: 0, duration: 0.9, ease: EASE.soft, stagger: 0.085 },
      0.18,
    )
      .fromTo(
        orange,
        { x: 3, y: -1.5, opacity: 1 },
        { x: 0, y: 0, duration: 0.9, ease: EASE.soft, stagger: 0.085 },
        0.24,
      )
      // in register: hand back to the crisp single-ink text, then drop the plates
      .call(() => el.classList.remove('is-misreg'), undefined, '>-0.15')
      .to(all, { opacity: 0, duration: 0.3, ease: 'none' }, '<')
      .call(() => all.forEach((p) => p.remove()));
  }
  return tl;
}

function revealLines(el: HTMLElement, misreg: boolean, scroll: boolean): Entry {
  const entry: Entry = {};
  entry.split = SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'line',
    autoSplit: true,
    onSplit(self) {
      el.querySelectorAll('.misreg-plate').forEach((p) => p.remove());
      const tl = linesTimeline(el, self.lines, {
        misreg,
        vars: { delay: delayOf(el), scrollTrigger: scroll ? once(el) : undefined },
      });
      entry.anim = tl;
      return tl;
    },
  });
  return entry;
}

// ── Simple reveals ───────────────────────────────────────────────────────────

// Reveal targets are held at opacity 0 by the CSS fail-safe until the page is ready, so a
// plain from() would read that as its end state. Tweens on the element itself use fromTo().

function revealFade(el: HTMLElement, scroll: boolean): Entry {
  return {
    anim: gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: EASE.soft,
        delay: delayOf(el),
        scrollTrigger: scroll ? once(el, 'top 92%') : undefined,
      },
    ),
  };
}

function revealStagger(el: HTMLElement, scroll: boolean): Entry {
  gsap.set(el, { autoAlpha: 1 });
  return {
    anim: gsap.from(el.children, {
      autoAlpha: 0,
      y: 12,
      duration: 0.85,
      ease: EASE.soft,
      stagger: 0.07,
      delay: delayOf(el),
      scrollTrigger: scroll ? once(el, 'top 90%') : undefined,
    }),
  };
}

function revealWdth(el: HTMLElement, scroll: boolean): Entry {
  const tl = gsap.timeline({ delay: delayOf(el), scrollTrigger: scroll ? once(el) : undefined });
  tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'none' }, 0)
    // the width lands on whatever the element's own --wdth is
    .from(el, { '--wdth': 125, duration: 1.1, ease: EASE.reveal }, 0);
  return { anim: tl };
}

export function cropTimeline(root: Element, vars: gsap.TimelineVars = {}): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  return gsap
    .timeline(vars)
    .from(
      q('[data-crop-line="h"]'),
      { scaleX: 0, duration: 0.6, ease: EASE.reveal, stagger: 0.04 },
      0,
    )
    .from(
      q('[data-crop-line="v"]'),
      { scaleY: 0, duration: 0.6, ease: EASE.reveal, stagger: 0.04 },
      0.06,
    );
}

function revealCrop(el: HTMLElement, scroll: boolean): Entry {
  gsap.set(el, { autoAlpha: 1 });
  return {
    anim: cropTimeline(el, { delay: delayOf(el), scrollTrigger: scroll ? once(el) : undefined }),
  };
}

/** An illustration's plates print slightly out of register, then settle as it scrolls in. */
function revealPlates(el: HTMLElement, scroll: boolean): Entry {
  gsap.set(el, { autoAlpha: 1 });
  const q = gsap.utils.selector(el);
  const tl = gsap.timeline({
    delay: delayOf(el),
    scrollTrigger: scroll ? once(el, 'top 80%') : undefined,
  });
  tl.add(cropTimeline(el), 0)
    .from(
      q('[data-plate="blue"]'),
      { autoAlpha: 0, x: -16, y: 10, duration: 1, ease: EASE.reveal },
      0.1,
    )
    .from(
      q('[data-plate="orange"]'),
      { autoAlpha: 0, x: 14, y: -9, duration: 1, ease: EASE.reveal },
      0.3,
    );
  return { anim: tl };
}

// ── Numbers ─────────────────────────────────────────────────────────────────

function countUp(el: HTMLElement, scroll: boolean): Entry {
  const value = el.querySelector<HTMLElement>('[data-count-value]');
  if (!value) return {};
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.countDecimals ?? 0);
  const prefix = el.dataset.countPrefix ?? '';
  const suffix = el.dataset.countSuffix ?? '';
  const state = { v: 0 };
  const render = () => {
    value.textContent = `${prefix}${state.v.toFixed(decimals)}${suffix}`;
  };
  render();

  const tl = gsap.timeline({
    delay: delayOf(el),
    scrollTrigger: scroll ? once(el, 'top 85%') : undefined,
  });
  tl.to(state, { v: target, duration: 1.6, ease: 'power4.out', onUpdate: render })
    // the width axis opens up as the number lands
    .fromTo(
      value,
      { '--wdth': 62 },
      { '--wdth': Number(el.dataset.countWdth ?? 100), duration: 0.7, ease: EASE.reveal },
      0.85,
    );
  return { anim: tl };
}

// ── Registry ─────────────────────────────────────────────────────────────────

function reveal(el: HTMLElement, scroll = true): Entry {
  if (el.hasAttribute('data-count')) return countUp(el, scroll);
  switch (el.dataset.reveal) {
    case 'lines':
      return revealLines(el, false, scroll);
    case 'misreg':
      return revealLines(el, true, scroll);
    case 'stagger':
      return revealStagger(el, scroll);
    case 'wdth':
      return revealWdth(el, scroll);
    case 'crop':
      return revealCrop(el, scroll);
    case 'plates':
      return revealPlates(el, scroll);
    case 'fade':
      return revealFade(el, scroll);
    default:
      return {};
  }
}

const TARGETS = '[data-reveal]:not([data-reveal="print"]), [data-count]';

/** Sets up every reveal on the page. Called on each astro:page-load. */
export async function initMotion() {
  const root = document.documentElement;
  if (prefersReducedMotion()) {
    root.classList.add('motion-ready');
    return;
  }
  await fontsReady();
  ctx ??= gsap.context(() => {});
  ctx.add(() => {
    document.querySelectorAll<HTMLElement>('[data-reveal="print"]').forEach((el) => {
      if (!el.hasAttribute('data-print-demo')) {
        entries.set(el, printRun(el));
        return;
      }
      // Styleguide demos: play when scrolled into view, and never touch the session flag.
      ScrollTrigger.create({
        ...once(el, 'top 70%'),
        onEnter: () =>
          entries.set(
            el,
            inContext(() => printRun(el, { force: true })),
          ),
      });
    });
    document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
      entries.set(el, reveal(el));
    });
  });
  root.classList.add('motion-ready');
  ScrollTrigger.refresh();
}

/** Run something inside the page's GSAP context so it is cleaned up on navigation. */
export function inContext<T>(fn: () => T): T {
  ctx ??= gsap.context(() => {});
  let result!: T;
  ctx.add(() => {
    result = fn();
  });
  return result;
}

export function destroyMotion() {
  ctx?.revert();
  ctx = null;
  entries.clear();
}

/** Styleguide: replay a reveal from the start, without waiting for scroll. */
export function replay(el: HTMLElement) {
  if (prefersReducedMotion()) return;
  const prev = entries.get(el);
  prev?.anim?.revert();
  prev?.split?.revert();
  prev?.extra?.forEach((s) => s.revert());
  el.querySelectorAll('.misreg-plate').forEach((p) => p.remove());
  el.classList.remove('is-misreg');
  if (el.dataset.reveal === 'print') {
    entries.set(
      el,
      inContext(() => printRun(el, { force: true })),
    );
    return;
  }
  entries.set(
    el,
    inContext(() => reveal(el, false)),
  );
}

// ── Hero "print run" ─────────────────────────────────────────────────────────

const PRINTED_KEY = 'mss-printed';

function seenThisSession(): boolean {
  try {
    return sessionStorage.getItem(PRINTED_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(PRINTED_KEY, '1');
  } catch {
    /* ignore */
  }
}

/**
 * ~2.2s, once per session: crop marks draw → blue plate prints (offset) → orange plate prints
 * over it → plates snap into registration → name rises → mono labels type in.
 * Return visits in the same session get a 0.4s fade. Any scroll or key press completes it.
 *
 * Markup inside `root` (which carries data-reveal="print"):
 *   [data-crop-line]  [data-plate="blue"]  [data-plate="orange"]
 *   [data-print="name"]  [data-print="type"]  [data-print="fade"]
 */
export function printRun(root: HTMLElement, { force = false } = {}): Entry {
  const q = gsap.utils.selector(root);
  gsap.set(root, { autoAlpha: 1 });

  const done = () => root.dispatchEvent(new CustomEvent('printrun:done'));

  if (!force && seenThisSession()) {
    return {
      anim: gsap.from(root, { autoAlpha: 0, duration: 0.4, ease: 'none', onComplete: done }),
    };
  }
  if (!force) markSeen();

  const blue = q('[data-plate="blue"]');
  const orange = q('[data-plate="orange"]');
  const name = q<HTMLElement>('[data-print="name"]')[0];
  const typed = q<HTMLElement>('[data-print="type"]');
  const fades = q('[data-print="fade"]');
  const splits: SplitText[] = [];

  const tl = gsap.timeline({ defaults: { ease: EASE.reveal } });
  tl.add(cropTimeline(root), 0)
    .fromTo(
      blue,
      { autoAlpha: 0, x: -14, y: 9 },
      { autoAlpha: 1, duration: 0.45, ease: 'power2.out', stagger: 0.06 },
      0.15,
    )
    .fromTo(
      orange,
      { autoAlpha: 0, x: 12, y: -8 },
      { autoAlpha: 1, duration: 0.45, ease: 'power2.out', stagger: 0.06 },
      0.45,
    )
    .to([...blue, ...orange], { x: 0, y: 0, duration: 0.32, ease: EASE.snap }, 0.92);

  if (name) {
    const split = SplitText.create(name, { type: 'lines', mask: 'lines', linesClass: 'line' });
    splits.push(split);
    tl.add(linesTimeline(name, split.lines, { misreg: true }), 1.0);
  }

  typed.forEach((el, i) => {
    const split = SplitText.create(el, { type: 'words,chars', charsClass: 'char' });
    splits.push(split);
    tl.from(
      split.chars,
      { autoAlpha: 0, duration: 0.01, ease: 'none', stagger: 0.016 },
      1.5 + i * 0.08,
    );
  });

  if (fades.length) {
    tl.from(fades, { autoAlpha: 0, y: 10, duration: 0.8, ease: EASE.soft, stagger: 0.08 }, 1.35);
  }

  // Word-by-word copy: each word rises out of the baseline.
  q<HTMLElement>('[data-print="words"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', mask: 'words', wordsClass: 'word' });
    splits.push(split);
    tl.from(split.words, { yPercent: 110, duration: 0.8, ease: EASE.reveal, stagger: 0.025 }, 1.25);
  });

  // Leave clean DOM behind once printed, then tell the page.
  tl.call(() => {
    splits.forEach((s) => s.revert());
    done();
  });

  // Any scroll or key press completes the run instantly.
  const skip = () => {
    if (tl.progress() < 1) tl.progress(1);
    detach();
  };
  const events = ['wheel', 'touchmove', 'keydown'] as const;
  const detach = () => events.forEach((e) => window.removeEventListener(e, skip));
  if (!force) events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
  tl.eventCallback('onComplete', detach);

  return { anim: tl, extra: splits };
}

// ── Hero drift ───────────────────────────────────────────────────────────────

/**
 * Pointer parallax plus a very slow ambient drift for [data-depth] shapes inside `root`.
 * Desktop with a fine pointer only; paused whenever `root` is off-screen. Each shape moves up
 * to `max` px × its depth, so the overlaps, and the overprint areas, keep changing.
 */
export function drift(root: HTMLElement, max = 18): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || prefersReducedMotion()) return () => {};

  const shapes = [...root.querySelectorAll<SVGElement | HTMLElement>('[data-depth]')].map((el) => ({
    el,
    depth: Number(el.dataset.depth) || 0.5,
    x: 0,
    y: 0,
    phase: Math.random() * Math.PI * 2,
  }));
  let px = 0;
  let py = 0;
  let frame = 0;
  let visible = false;

  const onMove = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const tick = (time: number) => {
    const t = time / 1000;
    for (const s of shapes) {
      const ambientX = Math.sin(t * 0.18 + s.phase) * 3;
      const ambientY = Math.cos(t * 0.14 + s.phase) * 3;
      const tx = (px * max + ambientX) * s.depth;
      const ty = (py * max + ambientY) * s.depth;
      s.x += (tx - s.x) * 0.06;
      s.y += (ty - s.y) * 0.06;
      s.el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
    }
    frame = visible ? requestAnimationFrame(tick) : 0;
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting) && !document.hidden;
    if (visible && !frame) frame = requestAnimationFrame(tick);
  });
  io.observe(root);
  window.addEventListener('pointermove', onMove, { passive: true });

  return () => {
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(frame);
    shapes.forEach((s) => (s.el.style.transform = ''));
  };
}
