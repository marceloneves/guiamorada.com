/**
 * Gera public/llms.txt a partir do índice de cidades.
 * Uso: node scripts/generate-llms.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SITE = 'https://guiamorada.com';
const INDEX_FILE = path.join(ROOT, 'src/data/generated/cidades-index.json');
const OUT_FILE = path.join(ROOT, 'public/llms.txt');

function getPrepositionLabel(prep, cidade) {
  return prep === 'no' ? `no ${cidade}` : `em ${cidade}`;
}

function main() {
  if (!fs.existsSync(INDEX_FILE)) {
    console.warn('Índice de cidades não encontrado. llms.txt será gerado com dados mínimos.');
  }

  const cidades = fs.existsSync(INDEX_FILE)
    ? JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'))
    : [];

  const totalImobiliarias = cidades.reduce((s, c) => s + c.total, 0);
  const topCidades = cidades.slice(0, 25);

  const lines = [
    '# Guia Morada',
    '',
    '> Diretório de imobiliárias e corretores no Brasil.',
    '',
    'O Guia Morada lista imobiliárias com telefone, endereço e área de atuação, organizadas por cidade. Não exibimos CNPJ nem e-mail por privacidade.',
    '',
    `Total: ${totalImobiliarias.toLocaleString('pt-BR')} imobiliárias em ${cidades.length.toLocaleString('pt-BR')} cidades.`,
    '',
    '## Páginas principais',
    '',
    `- [Página inicial](${SITE}/)`,
    `- [Imobiliárias por cidade](${SITE}/imobiliarias/cidades)`,
    `- [Imobiliárias](${SITE}/imobiliarias)`,
    `- [Corretores](${SITE}/corretores)`,
    `- [Cadastre-se](${SITE}/cadastro)`,
    `- [Sobre](${SITE}/sobre)`,
    '',
    '## Principais cidades',
    '',
    ...topCidades.map(
      (c) =>
        `- [Imobiliárias ${getPrepositionLabel(c.prep, c.cidade)} (${c.total.toLocaleString('pt-BR')})](${SITE}/${c.slug})`,
    ),
    '',
    '## Formato das URLs por cidade',
    '',
    '- Página 1: `/imobiliarias-em-{cidade}` ou `/imobiliarias-no-{cidade}`',
    '- Paginação: `/imobiliarias-em-{cidade}/2` (20 imobiliárias por página)',
    '- Cidades homônimas incluem UF no slug: `/imobiliarias-em-cascavel-pr`',
    '',
    '## Contato',
    '',
    '- Site: https://guiamorada.com',
    '- E-mail: contato@guiamorada.com.br',
    '',
    '## Sitemap',
    '',
    `- [sitemap-index.xml](${SITE}/sitemap-index.xml)`,
  ];

  fs.writeFileSync(OUT_FILE, lines.join('\n') + '\n');
  console.log(`✓ llms.txt gerado em ${OUT_FILE}`);
}

main();
