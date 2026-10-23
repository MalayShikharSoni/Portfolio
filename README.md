# Malay Shikhar Soni — portfolio ("Two-Ink Print")

A two-colour risograph of a Swiss/Bauhaus poster that came to life. Astro (static) + TypeScript
strict, Tailwind CSS v4, GSAP (ScrollTrigger, SplitText) and Lenis.

> **Status:** design system phase. Review `/styleguide` before the home page sections are built.

## Run locally

Requires **Node ≥ 22.23.4** (Astro 7). Node 24 LTS is recommended (`.nvmrc`).

```sh
npm install
npm run dev        # http://localhost:4321  — the styleguide is at /styleguide
npm run check      # astro check (types)
npm run lint       # eslint
npm run build      # static site in dist/
```

## Where things live

| What | Where |
| --- | --- |
| All copy and data | `src/data/` — `site.ts`, `projects.ts`, `timeline.ts`, `skills.ts` |
| Design tokens (inks, type scale, layout) | `src/styles/tokens.css` |
| Tailwind theme mapping, base styles | `src/styles/global.css` |
| Paper grain | `src/styles/grain.css` |
| Geometric primitives (SVG) | `src/components/primitives/` |
| UI (buttons, links, theme toggle, cursor, proof mode) | `src/components/ui/` |
| Project tapes | `src/components/work/` |
| Motion system | `src/scripts/motion.ts` (+ `gsap.ts`, `lenis.ts`, `theme.ts`) |

Press **P** anywhere to see the plates (grid, baseline, blue/orange separations).

Full deployment and content-editing docs arrive in a later phase.
