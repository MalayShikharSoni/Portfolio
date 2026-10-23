# Malay Shikhar Soni · portfolio ("Two-Ink Print")

A two-colour risograph of a Swiss/Bauhaus poster that came to life. Astro (static output),
TypeScript strict, plain modular CSS, GSAP (ScrollTrigger, SplitText) and Lenis.

Lighthouse (mobile): 98–99 performance, 100 accessibility, best practices and SEO.

## Run locally

Requires **Node 22.23.4 or newer** (Astro 7). Node 24 LTS is recommended (see `.nvmrc`).

```sh
npm install
npm run dev          # http://localhost:4321 (styleguide at /styleguide)
npm run build        # static site in dist/
npm run preview      # serve the build
npm run verify       # everything CI runs: types, lint, build, CSP check
```

Other scripts: `npm run check` (types), `npm run lint`, `npm run format` /
`npm run format:check`, `npm run csp` (refresh the CSP hash, see [DEPLOY.md](DEPLOY.md)).

Press **P** on any page for proof mode: the grid, the baseline and the blue/orange plates.

## Where the content lives

All copy and data are typed TypeScript files in `src/data/`. You can update the site without
touching a component.

| File                   | What it holds                                                                   |
| ---------------------- | ------------------------------------------------------------------------------- |
| `src/data/site.ts`     | name, tagline, email, links, domain, status line, bio, "Currently", the numbers |
| `src/data/projects.ts` | every project: tape details, overview, tracklist, decisions, diagram, screens   |
| `src/data/timeline.ts` | education, certificates and milestones (newest first)                           |
| `src/data/skills.ts`   | the toolbox, grouped by what each skill is for                                  |

Anything still marked `TODO(Malay)` shows on the site as a small "To be written" tag, never as
raw text.

## Add a project

1. Copy one of the entries in `src/data/projects.ts` and give it a new `slug`, `name` and
   `tape` number.
2. `featured: true` gives it a tape on the home page and a case study at `/work/<slug>/`.
   `featured: false` lists it under "Also built" instead (three are already there, commented
   out: uncomment the ones you want to show).
3. Pick an `ink`: `'blue'`, `'orange'` or `'overprint'`. It sets the tape artwork, the share
   image and the diagram's colours.
4. For a case-study diagram, describe the nodes on a small grid (`col`, `row`), the `edges`
   between them, and the `path` the request dot travels. `kind` is `'service'` (square),
   `'store'` (circle) or `'external'` (triangle).

## Add screenshots

Each case study has five slots: four desktop shots and one phone shot. Until a file exists,
the slot shows a designed placeholder with the exact path it expects.

| Slot           | File                                      | Size        |
| -------------- | ----------------------------------------- | ----------- |
| Desktop 1 to 4 | `src/assets/work/<slug>/screen-01.webp` … | 1600 × 1000 |
| Phone          | `src/assets/work/<slug>/mobile-01.webp`   | 780 × 1688  |

WebP is best; PNG and JPG work too (same file name, different extension). Drop a file in and
rebuild: it replaces its placeholder automatically and is resized and compressed for every
screen size. Captions and alt text live in each project's `screens` list in
`src/data/projects.ts`.

## Update the résumé

Replace `public/resume.pdf` with your PDF, keeping the same file name. Every "Résumé" link
points to it.

## Deploy

Vercel (free Hobby plan) with the free `.me` domain from the GitHub Student Developer Pack.
Step-by-step instructions, including DNS and the weekly rebuild: **[DEPLOY.md](DEPLOY.md)**.

## Where things live in the code

| What                                                  | Where                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| Global CSS entry (cascade-layer order)                | `src/styles/index.css`                                             |
| Design tokens (inks, type scale, layout)              | `src/styles/tokens.css`                                            |
| Reset, base, typography + text hovers, grid           | `src/styles/reset.css`, `base.css`, `typography.css`, `layout.css` |
| Print effects (overprint, grain, misregistration)     | `src/styles/print.css`                                             |
| Component styles                                      | next to each component, in its scoped `<style>`                    |
| Geometric primitives (SVG)                            | `src/components/primitives/`                                       |
| UI (buttons, links, theme toggle, cursor, proof mode) | `src/components/ui/`                                               |
| Home page sections                                    | `src/components/sections/`                                         |
| Tapes, case-study blocks, diagrams                    | `src/components/work/`, `src/layouts/CaseStudy.astro`              |
| Motion system                                         | `src/scripts/motion.ts` (+ `gsap.ts`, `lenis.ts`, `theme.ts`)      |
| Interactive text (pressure, decrypt, circular badge)  | `src/scripts/text.ts`                                              |
| Hero halftone lens, diagram animation                 | `src/scripts/lens.ts`, `src/scripts/diagram.ts`                    |
| Build-time stats (with fallbacks)                     | `src/lib/stats.ts`                                                 |
| Share images, icons                                   | `src/lib/og.ts`, `src/lib/icon.ts`                                 |
| Subset display font                                   | `src/assets/fonts/` (rebuild with `scripts/subset-font.sh`)        |
| Security headers, CSP                                 | `vercel.json` (hash kept in sync by `scripts/csp.mjs`)             |
| CI and weekly rebuild                                 | `.github/workflows/`                                               |
