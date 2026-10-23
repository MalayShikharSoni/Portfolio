import type { APIRoute } from 'astro';
import { iconPng } from '@/lib/icon';

// iOS rounds the corners itself, so the touch icon is a full square.
export const GET: APIRoute = () =>
  new Response(iconPng(180), { headers: { 'Content-Type': 'image/png' } });
