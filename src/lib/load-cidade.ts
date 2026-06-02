import fs from 'node:fs';
import path from 'node:path';
import type { CidadeData, CidadeIndexEntry } from './cidades';

const GENERATED = path.join(process.cwd(), 'src/data/generated');

export function loadCidadesIndex(): CidadeIndexEntry[] {
  return JSON.parse(fs.readFileSync(path.join(GENERATED, 'cidades-index.json'), 'utf-8'));
}

export function loadCidadeData(slug: string): CidadeData {
  return JSON.parse(
    fs.readFileSync(path.join(GENERATED, 'cidades', `${slug}.json`), 'utf-8'),
  );
}

export function isCityListingSlug(slug: string): boolean {
  return /^imobiliarias-(em|no)-/.test(slug);
}
