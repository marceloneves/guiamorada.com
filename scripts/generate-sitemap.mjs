/**
 * Gera sitemaps em public/ e rotas Astro para servir na Vercel.
 * Uso: node scripts/generate-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SITE = 'https://guiamorada.com';
const INDEX_FILE = path.join(ROOT, 'src/data/generated/cidades-index.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PAGES_DIR = path.join(ROOT, 'src/pages');
/** Máximo recomendado para fetch confiável pelo Google Search Console */
const URLS_PER_SITEMAP = 1000;

/** Sitemaps separados por tipo de conteúdo. */
const GRUPOS = [
  { id: 'paginas', label: 'páginas institucionais' },
  { id: 'imobiliarias', label: 'imobiliárias' },
  { id: 'corretores', label: 'corretores' },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractSlugs(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return [...content.matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
}

function toUrl(pathname) {
  if (pathname === '/') return `${SITE}/`;
  return `${SITE}${pathname.endsWith('/') ? pathname : `${pathname}/`}`;
}

function collectUrls() {
  const lastmod = new Date().toISOString().split('T')[0];
  const grupos = Object.fromEntries(GRUPOS.map((g) => [g.id, new Set()]));

  const add = (grupo, pathname) =>
    grupos[grupo].add(JSON.stringify({ loc: toUrl(pathname), lastmod }));

  ['/', '/anuncie', '/sobre'].forEach((p) => add('paginas', p));

  // Índices de listagem entram junto do conteúdo que apresentam.
  ['/imobiliarias', '/imobiliarias/cidades'].forEach((p) => add('imobiliarias', p));
  add('corretores', '/corretores');

  extractSlugs(path.join(ROOT, 'src/data/corretores.ts')).forEach((slug) =>
    add('corretores', `/corretores/${slug}`),
  );
  extractSlugs(path.join(ROOT, 'src/data/imobiliarias.ts')).forEach((slug) =>
    add('imobiliarias', `/imobiliarias/${slug}`),
  );

  if (fs.existsSync(INDEX_FILE)) {
    const cidades = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    for (const city of cidades) {
      add('imobiliarias', `/${city.slug}`);
      for (let page = 2; page <= city.totalPages; page++) {
        add('imobiliarias', `/${city.slug}/${page}`);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(grupos).map(([id, set]) => [
      id,
      [...set].map((entry) => JSON.parse(entry)).sort((a, b) => a.loc.localeCompare(b.loc)),
    ]),
  );
}

function buildUrlset(entries) {
  const body = entries
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildSitemapIndex(files) {
  const lastmod = new Date().toISOString().split('T')[0];
  const body = files
    .map(
      (file) =>
        `  <sitemap>\n    <loc>${escapeXml(`${SITE}/${file}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

function buildSitemapRoute(filename) {
  return `/** Gerado por scripts/generate-sitemap.mjs — não editar manualmente */
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(fs.readFileSync(path.join(process.cwd(), 'public', '${filename}'), 'utf-8'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
`;
}

function cleanOldSitemapRoutes() {
  if (!fs.existsSync(PAGES_DIR)) return;

  for (const file of fs.readdirSync(PAGES_DIR)) {
    if (/^sitemap-[a-z]+(-\d+)?\.xml\.ts$/.test(file) || /^sitemap-\d+\.xml\.ts$/.test(file)) {
      fs.unlinkSync(path.join(PAGES_DIR, file));
    }
  }

  for (const file of fs.readdirSync(PUBLIC_DIR)) {
    if (/^sitemap-[a-z]+(-\d+)?\.xml$/.test(file) || /^sitemap-\d+\.xml$/.test(file)) {
      fs.unlinkSync(path.join(PUBLIC_DIR, file));
    }
  }
}

function main() {
  cleanOldSitemapRoutes();

  const porGrupo = collectUrls();
  const sitemapFiles = [];
  let totalUrls = 0;

  for (const grupo of GRUPOS) {
    const urls = porGrupo[grupo.id] ?? [];
    totalUrls += urls.length;

    const chunks = [];
    for (let i = 0; i < urls.length; i += URLS_PER_SITEMAP) {
      chunks.push(urls.slice(i, i + URLS_PER_SITEMAP));
    }
    if (chunks.length === 0) chunks.push([]);

    // Um grupo pequeno vira um arquivo só; acima de 1.000 URLs ele é numerado.
    chunks.forEach((chunk, index) => {
      const filename =
        chunks.length === 1 ? `sitemap-${grupo.id}.xml` : `sitemap-${grupo.id}-${index + 1}.xml`;
      fs.writeFileSync(path.join(PUBLIC_DIR, filename), buildUrlset(chunk));
      fs.writeFileSync(path.join(PAGES_DIR, `${filename}.ts`), buildSitemapRoute(filename));
      sitemapFiles.push({ filename, grupo: grupo.label, total: chunk.length });
    });
  }

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'sitemap-index.xml'),
    buildSitemapIndex(sitemapFiles.map((f) => f.filename)),
  );

  console.log(`✓ ${totalUrls} URLs em ${sitemapFiles.length} sitemap(s), separados por tipo`);
  sitemapFiles.forEach(({ filename, grupo, total }) => {
    console.log(`  → public/${filename} — ${grupo} (${total} URLs)`);
  });
  console.log('  → public/sitemap-index.xml');
}

main();
