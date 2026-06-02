/**
 * Gera sitemaps em public/ para versionamento e deploy.
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
const URLS_PER_SITEMAP = 5000;

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
  const urls = new Set();
  const lastmod = new Date().toISOString().split('T')[0];

  const add = (pathname) => urls.add(JSON.stringify({ loc: toUrl(pathname), lastmod }));

  // Páginas fixas
  [
    '/',
    '/cadastro',
    '/corretores',
    '/imobiliarias',
    '/imobiliarias/cidades',
    '/sobre',
  ].forEach(add);

  // Corretores e imobiliárias demo
  extractSlugs(path.join(ROOT, 'src/data/corretores.ts')).forEach((slug) =>
    add(`/corretores/${slug}`),
  );
  extractSlugs(path.join(ROOT, 'src/data/imobiliarias.ts')).forEach((slug) =>
    add(`/imobiliarias/${slug}`),
  );

  // Cidades importadas
  if (fs.existsSync(INDEX_FILE)) {
    const cidades = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    for (const city of cidades) {
      add(`/${city.slug}`);
      for (let page = 2; page <= city.totalPages; page++) {
        add(`/${city.slug}/${page}`);
      }
    }
  }

  return [...urls].map((entry) => JSON.parse(entry)).sort((a, b) => a.loc.localeCompare(b.loc));
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

function main() {
  const urls = collectUrls();
  const chunks = [];

  for (let i = 0; i < urls.length; i += URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + URLS_PER_SITEMAP));
  }

  if (chunks.length === 0) {
    chunks.push([]);
  }

  const sitemapFiles = [];

  chunks.forEach((chunk, index) => {
    const filename = `sitemap-${index}.xml`;
    fs.writeFileSync(path.join(PUBLIC_DIR, filename), buildUrlset(chunk));
    sitemapFiles.push(filename);
  });

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'), buildSitemapIndex(sitemapFiles));

  console.log(`✓ ${urls.length} URLs em ${sitemapFiles.length} sitemap(s)`);
  sitemapFiles.forEach((file) => console.log(`  → public/${file}`));
  console.log('  → public/sitemap-index.xml');
}

main();
