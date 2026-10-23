/**
 * Architecture diagrams: as the reader scrolls, the figure pins and an orange "request" dot
 * travels the request path step by step (moves, then rests at each node), inking a trail and
 * lighting each node's caption as it arrives. Scrubbed by ScrollTrigger; the user scrolls
 * freely the whole time. Under reduced motion nothing runs and the static diagram stays.
 */
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './motion';

const MOVE = 0.62; // share of each step spent travelling; the rest is a pause at the node
const travel = gsap.parseEase('power2.inOut');

function setup(fig: HTMLElement, svg: SVGSVGElement): () => void {
  const route = svg.querySelector<SVGPathElement>('.diagram__route');
  const trail = svg.querySelector<SVGPathElement>('.diagram__trail');
  const dot = svg.querySelector<SVGCircleElement>('.diagram__dot');
  if (!route || !trail || !dot) return () => {};

  const nodes = [...svg.querySelectorAll<SVGGElement>('.node[data-at]')]
    .map((el) => ({ el, at: Number(el.dataset.at) }))
    .sort((a, b) => a.at - b.at);
  const stops = nodes.map((n) => n.at);
  const total = route.getTotalLength();
  const steps = Math.max(1, stops.length - 1);

  trail.style.strokeDasharray = `${total}`;

  const render = (progress: number) => {
    const scaled = progress * steps;
    const i = Math.min(steps - 1, Math.floor(scaled));
    const local = Math.min(1, (scaled - i) / MOVE);
    const from = stops[i] ?? 0;
    const to = stops[i + 1] ?? 1;
    const frac = progress >= 1 ? 1 : from + (to - from) * travel(local);

    const point = route.getPointAtLength(frac * total);
    dot.setAttribute('cx', point.x.toFixed(1));
    dot.setAttribute('cy', point.y.toFixed(1));
    trail.style.strokeDashoffset = `${total * (1 - frac)}`;
    nodes.forEach((n) => n.el.classList.toggle('is-on', n.at <= frac + 0.0005));
  };

  fig.classList.add('is-live');
  render(0);

  const state = { p: 0 };
  const tween = gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: () => render(state.p),
    scrollTrigger: {
      trigger: fig,
      start: 'center center',
      end: `+=${Math.round(60 + steps * 22)}%`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill(true);
    tween.kill();
    fig.classList.remove('is-live');
    nodes.forEach((n) => n.el.classList.remove('is-on'));
    trail.style.removeProperty('stroke-dasharray');
    trail.style.removeProperty('stroke-dashoffset');
  };
}

/** Wires every [data-diagram] on the page; returns a cleanup for page navigation. */
export function initDiagrams(): () => void {
  const figures = [...document.querySelectorAll<HTMLElement>('[data-diagram]')];
  if (!figures.length || prefersReducedMotion()) return () => {};

  // Only the visible orientation is animated; switching breakpoints rebuilds it.
  const mm = gsap.matchMedia();
  figures.forEach((fig) => {
    mm.add({ wide: '(min-width: 900px)', tall: '(max-width: 899px)' }, (context) => {
      const which = context.conditions?.wide ? 'wide' : 'tall';
      const svg = fig.querySelector<SVGSVGElement>(`.diagram__svg--${which}`);
      return svg ? setup(fig, svg) : undefined;
    });
  });
  ScrollTrigger.refresh();
  return () => mm.revert();
}
