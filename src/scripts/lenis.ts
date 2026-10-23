/** Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync. */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './motion';

let lenis: Lenis | null = null;

const raf = (time: number) => lenis?.raf(time * 1000);

export function startLenis(): Lenis | null {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    anchors: { offset: -16 },
    autoRaf: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(raf);
  lenis.destroy();
  lenis = null;
}

export const getLenis = () => lenis;
