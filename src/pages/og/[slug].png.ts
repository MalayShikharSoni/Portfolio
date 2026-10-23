/** Build-time Open Graph images: /og/default.png and /og/<slug>.png for each case study. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { featuredProjects } from '@/data/projects';
import { site } from '@/data/site';
import { renderOg, type OgOptions } from '@/lib/og';

const host = new URL(site.domain).host;

export const getStaticPaths = (() => {
  const home: OgOptions = {
    kicker: '01 / 06 · Portfolio',
    lines: site.name
      .toUpperCase()
      .split(' ')
      .map((w, i, a) => (i === a.length - 1 ? `${w}.` : w)),
    footer: `${host} · ${site.role}`,
    ink: 'hero',
  };
  return [
    { params: { slug: 'default' }, props: home },
    ...featuredProjects.map((p) => ({
      params: { slug: p.slug },
      props: {
        kicker: `Tape ${String(p.tape).padStart(2, '0')} · Case study · ${p.years}`,
        lines: [`${p.name}.`],
        footer: `${site.name} · ${host}`,
        ink: p.ink,
      } satisfies OgOptions,
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as OgOptions);
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' },
  });
};
