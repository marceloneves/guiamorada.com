/**
 * Importa imobiliárias do Excel e gera JSON por cidade.
 * Uso: node scripts/import-imobiliarias.mjs [caminho-do-xlsx]
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src/data/generated/cidades');
const INDEX_FILE = path.join(ROOT, 'src/data/generated/cidades-index.json');

const DEFAULT_XLSX =
  '/Users/marceloneves/Downloads/Lista-de-Empresas-Customizada-46315-empresas-6-1-2026_ID_36732.xlsx';

const PER_PAGE = 20;

function removeAccents(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function slugify(str) {
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getPreposition(cidade) {
  const norm = removeAccents(cidade).toLowerCase();
  if (norm.startsWith('rio ')) return 'no';
  return 'em';
}

function normalizeCidade(cidade) {
  return String(cidade || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeTelefone(tel) {
  return String(tel || '').trim();
}

function buildEnderecoCompleto(row) {
  const parts = [
    row['Endereço'],
    row['Número'] ? `nº ${row['Número']}` : '',
    row['Complemento'],
    row['Bairro'],
  ].filter(Boolean);
  return parts.join(', ');
}

function rowToImobiliaria(row, index) {
  const nomeComercial = String(row['Nome comercial'] || '').trim();
  const razaoSocial = String(row['Razão social'] || '').trim();
  const nome = nomeComercial || razaoSocial || `Imobiliária ${index + 1}`;
  const cidade = normalizeCidade(row['Cidade']);

  return {
    id: slugify(`${nome}-${cidade}-${index}`),
    razaoSocial,
    nomeComercial,
    nome,
    endereco: {
      logradouro: String(row['Endereço'] || '').trim(),
      numero: String(row['Número'] || '').trim(),
      complemento: String(row['Complemento'] || '').trim(),
      bairro: String(row['Bairro'] || '').trim(),
      cidade,
      estado: String(row['Estado'] || '').trim().toUpperCase(),
      cep: String(row['Cep'] || '').trim(),
      completo: buildEnderecoCompleto(row),
    },
    telefone: normalizeTelefone(row['Telefone']),
    segmento: String(row['Segmento'] || '').trim(),
    areaAtuacao: String(row['Área de atuação'] || '').trim(),
    dataAbertura: String(row['Data de abertura'] || '').trim(),
    porte: String(row['Porte da empresa'] || '').trim(),
    naturezaJuridica: String(row['Natureza jurídica'] || '').trim(),
  };
}

function main() {
  const xlsxPath = process.argv[2] || DEFAULT_XLSX;

  if (!fs.existsSync(xlsxPath)) {
    console.error(`Arquivo não encontrado: ${xlsxPath}`);
    process.exit(1);
  }

  console.log(`Lendo ${xlsxPath}...`);
  const wb = XLSX.readFile(xlsxPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  console.log(`${rows.length} registros encontrados.`);

  /** @type {Map<string, { cidade: string, estado: string, items: object[], nameCounts: Map<string, number> }>} */
  const groups = new Map();

  rows.forEach((row, index) => {
    const cidade = normalizeCidade(row['Cidade']);
    const estado = String(row['Estado'] || '').trim().toUpperCase();
    if (!cidade || !estado) return;

    const key = `${removeAccents(cidade).toLowerCase()}|${estado}`;
    if (!groups.has(key)) {
      groups.set(key, { cidade, estado, items: [], nameCounts: new Map() });
    }

    const group = groups.get(key);
    group.nameCounts.set(cidade, (group.nameCounts.get(cidade) || 0) + 1);
    group.items.push(rowToImobiliaria(row, index));
  });

  // Resolve nome canônico da cidade (variante mais frequente)
  for (const group of groups.values()) {
    let bestName = group.cidade;
    let bestCount = 0;
    for (const [name, count] of group.nameCounts) {
      if (count > bestCount) {
        bestCount = count;
        bestName = name;
      }
    }
    group.cidade = bestName;
    for (const item of group.items) {
      item.endereco.cidade = bestName;
    }
  }

  // Detectar colisões de slug entre cidades diferentes
  /** @type {Map<string, string[]>} */
  const slugToKeys = new Map();
  for (const [key, group] of groups) {
    const baseSlug = slugify(group.cidade);
    if (!slugToKeys.has(baseSlug)) slugToKeys.set(baseSlug, []);
    slugToKeys.get(baseSlug).push(key);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  /** @type {object[]} */
  const index = [];

  for (const [key, group] of groups) {
    const baseSlug = slugify(group.cidade);
    const needsStateSuffix = slugToKeys.get(baseSlug).length > 1;
    const cidadeSlug = needsStateSuffix
      ? `${baseSlug}-${group.estado.toLowerCase()}`
      : baseSlug;

    const prep = getPreposition(group.cidade);
    const slug = `imobiliarias-${prep}-${cidadeSlug}`;
    const total = group.items.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

    // Ordenar alfabeticamente por nome
    group.items.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    const payload = {
      slug,
      prep,
      cidade: group.cidade,
      estado: group.estado,
      cidadeSlug,
      total,
      totalPages,
      imobiliarias: group.items,
    };

    fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(payload));

    index.push({
      slug,
      prep,
      cidade: group.cidade,
      estado: group.estado,
      cidadeSlug,
      total,
      totalPages,
    });
  }

  index.sort((a, b) => b.total - a.total);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

  console.log(`\n✓ ${index.length} cidades geradas em ${OUT_DIR}`);
  console.log(`✓ Índice salvo em ${INDEX_FILE}`);
  console.log(`\nTop 5 cidades:`);
  index.slice(0, 5).forEach((c) => {
    console.log(`  /${c.slug} — ${c.total} imobiliárias (${c.cidade}/${c.estado})`);
  });

  const totalPages = index.reduce((sum, c) => sum + c.totalPages, 0);
  console.log(`\nTotal de páginas estáticas: ${totalPages}`);
}

main();
