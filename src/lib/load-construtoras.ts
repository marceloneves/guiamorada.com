import fs from 'node:fs';
import path from 'node:path';
import type { ConstrutoraCidadeData, ConstrutoraIndexEntry } from './construtoras';

const GENERATED = path.join(process.cwd(), 'src/data/generated');
const INDEX_FILE = path.join(GENERATED, 'construtoras-index.json');

let indexCache: ConstrutoraIndexEntry[] | null = null;

export function loadConstrutorasIndex(): ConstrutoraIndexEntry[] {
  if (indexCache) return indexCache;
  indexCache = fs.existsSync(INDEX_FILE)
    ? JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'))
    : [];
  return indexCache!;
}

export function loadConstrutoraCidade(slug: string): ConstrutoraCidadeData {
  return JSON.parse(
    fs.readFileSync(path.join(GENERATED, 'construtoras', `${slug}.json`), 'utf-8'),
  );
}

export function isConstrutoraListingSlug(slug: string): boolean {
  return /^construtoras-(em|no)-/.test(slug);
}
