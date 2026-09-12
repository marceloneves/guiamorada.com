/**
 * Corrige a acentuação dos nomes de cidade nos dados gerados, usando a relação
 * de municípios do IBGE (src/data/municipios-ibge.json, que também guarda o
 * código IBGE e o QID do Wikidata de cada município).
 *
 * Os slugs NÃO mudam — só o nome exibido. Rode depois de cada importação:
 *   node scripts/corrigir-acentos.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const GENERATED = path.join(ROOT, 'src/data/generated');
const INDEX_FILE = path.join(GENERATED, 'cidades-index.json');
const CIDADES_DIR = path.join(GENERATED, 'cidades');
const MAPA_FILE = path.join(ROOT, 'src/data/municipios-ibge.json');

const mapa = JSON.parse(fs.readFileSync(MAPA_FILE, 'utf-8'));

function slugify(valor) {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function nomeCorreto(cidade, uf) {
  return mapa[`${uf}:${slugify(cidade)}`]?.nome ?? cidade;
}

const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
let cidadesCorrigidas = 0;
let enderecosCorrigidos = 0;
const semCorrespondencia = [];

for (const entrada of index) {
  const correto = nomeCorreto(entrada.cidade, entrada.estado);
  if (correto !== entrada.cidade) {
    entrada.cidade = correto;
    cidadesCorrigidas++;
  } else if (!mapa[`${entrada.estado}:${slugify(entrada.cidade)}`]) {
    semCorrespondencia.push(`${entrada.estado}/${entrada.cidade}`);
  }

  const arquivo = path.join(CIDADES_DIR, `${entrada.slug}.json`);
  if (!fs.existsSync(arquivo)) continue;

  const data = JSON.parse(fs.readFileSync(arquivo, 'utf-8'));
  let alterado = data.cidade !== correto;
  data.cidade = correto;

  for (const imobiliaria of data.imobiliarias ?? []) {
    const endereco = imobiliaria.endereco;
    if (!endereco?.cidade) continue;
    const cidadeEndereco = nomeCorreto(endereco.cidade, endereco.estado || entrada.estado);
    if (cidadeEndereco !== endereco.cidade) {
      endereco.cidade = cidadeEndereco;
      enderecosCorrigidos++;
      alterado = true;
    }
  }

  if (alterado) fs.writeFileSync(arquivo, JSON.stringify(data));
}

fs.writeFileSync(INDEX_FILE, JSON.stringify(index));

console.log(`✓ ${cidadesCorrigidas} nomes de cidade corrigidos no índice`);
console.log(`✓ ${enderecosCorrigidos} endereços de imobiliária corrigidos`);
if (semCorrespondencia.length) {
  console.log(`· ${semCorrespondencia.length} sem correspondência no IBGE: ${semCorrespondencia.join(', ')}`);
}
