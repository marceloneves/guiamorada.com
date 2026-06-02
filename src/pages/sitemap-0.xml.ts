import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

function readPublicFile(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'public', name), 'utf-8');
}

export const GET: APIRoute = () =>
  new Response(readPublicFile('sitemap-0.xml'), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
