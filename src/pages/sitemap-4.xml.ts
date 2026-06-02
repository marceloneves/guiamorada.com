/** Gerado por scripts/generate-sitemap.mjs — não editar manualmente */
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap-4.xml'), 'utf-8'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
