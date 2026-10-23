# Malay Shikhar Soni — portfolio ("Two-Ink Print")

A two-colour risograph of a Swiss/Bauhaus poster that came to life. Astro (static) + TypeScript
strict, plain modular CSS, GSAP (ScrollTrigger, SplitText) and Lenis.

> **Status:** design system + nav + hero. Sections 02–06 follow after review.

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

| What                                                  | Where                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| All copy and data                                     | `src/data/` — `site.ts`, `projects.ts`, `timeline.ts`, `skills.ts` |
| Global CSS entry (cascade-layer order)                | `src/styles/index.css`                                             |
| Design tokens (inks, type scale, layout)              | `src/styles/tokens.css`                                            |
| Reset, base, typography + text hovers, grid           | `src/styles/reset.css`, `base.css`, `typography.css`, `layout.css` |
| Print effects (overprint, grain, misregistration)     | `src/styles/print.css`                                             |
| Component styles                                      | next to each component, in its scoped `<style>`                    |
| Geometric primitives (SVG)                            | `src/components/primitives/`                                       |
| UI (buttons, links, theme toggle, cursor, proof mode) | `src/components/ui/`                                               |
| Project tapes                                         | `src/components/work/`                                             |
| Motion system                                         | `src/scripts/motion.ts` (+ `gsap.ts`, `lenis.ts`, `theme.ts`)      |
| Interactive text (pressure, decrypt, circular badge)  | `src/scripts/text.ts`                                              |
| Hero halftone lens                                    | `src/scripts/lens.ts`                                              |

Press **P** anywhere to see the plates (grid, baseline, blue/orange separations).

Full deployment and content-editing docs arrive in a later phase.
