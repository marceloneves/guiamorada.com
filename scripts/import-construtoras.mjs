/**
 * Gera as páginas de construtoras e incorporadoras a partir dos dados abertos do
 * CNPJ da Receita Federal (CNAEs 4110-7/00 e 4120-4/00, apenas matrizes ativas).
 *
 * Entrada: dois JSONL produzidos pelo filtro dos arquivos da Receita —
 *   estabelecimentos.jsonl e empresas.jsonl
 * Uso: node scripts/import-construtoras.mjs <estabelecimentos.jsonl> <empresas.jsonl>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src/data/generated/construtoras');
const INDEX_FILE = path.join(ROOT, 'src/data/generated/construtoras-index.json');
const MUNICIPIOS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/municipios-ibge.json'), 'utf-8'),
);

const PER_PAGE = 20;

const CNAES = {
  '4110700': 'Incorporação de empreendimentos imobiliários',
  '4120400': 'Construção de edifícios',
};

const PORTES = {
  '00': 'Não informado',
  '01': 'Micro empresa',
  '03': 'Empresa de pequeno porte',
  '05': 'Demais',
};

function slugify(valor) {
  return String(valor)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function lerJsonl(arquivo) {
  return fs
    .readFileSync(arquivo, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((linha) => JSON.parse(linha));
}

function titulo(valor) {
  const minusculas = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'a', 'o']);
  return String(valor)
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, i) => {
      if (i > 0 && minusculas.has(palavra)) return palavra;
      if (/^\d/.test(palavra) || palavra.length <= 2) return palavra.toUpperCase();
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

function formatarCnpj(basico, ordem, dv) {
  return `${basico.slice(0, 2)}.${basico.slice(2, 5)}.${basico.slice(5)}/${ordem}-${dv}`;
}

function formatarTelefone(ddd, numero) {
  const d = String(ddd || '').trim();
  const n = String(numero || '').replace(/\D/g, '');
  if (!d || n.length < 8) return '';
  const meio = n.length > 8 ? n.slice(0, n.length - 4) : n.slice(0, 4);
  return `(${d}) ${meio}-${n.slice(-4)}`;
}

function formatarData(aaaammdd) {
  const v = String(aaaammdd || '');
  if (v.length !== 8) return '';
  return `${v.slice(6, 8)}/${v.slice(4, 6)}/${v.slice(0, 4)}`;
}

function formatarCep(cep) {
  const v = String(cep || '').replace(/\D/g, '');
  return v.length === 8 ? `${v.slice(0, 5)}-${v.slice(5)}` : '';
}

function nomeMunicipio(cidadeSlug, uf) {
  return MUNICIPIOS[`${uf}:${cidadeSlug}`]?.nome ?? titulo(cidadeSlug.replace(/-/g, ' '));
}

function main() {
  const [estabFile, empresasFile] = process.argv.slice(2);
  if (!estabFile || !empresasFile) {
    console.error('Uso: node scripts/import-construtoras.mjs <estabelecimentos.jsonl> <empresas.jsonl>');
    process.exit(1);
  }

  const estabelecimentos = lerJsonl(estabFile);
  const empresas = new Map(lerJsonl(empresasFile).map((e) => [e.cnpj_basico, e]));
  console.log(`${estabelecimentos.length} estabelecimentos, ${empresas.size} empresas`);

  const ativos = estabelecimentos.filter((e) => e.situacao === '02');
  console.log(`${ativos.length} com situação cadastral ativa`);

  const grupos = new Map();

  for (const estab of ativos) {
    const empresa = empresas.get(estab.cnpj_basico) ?? {};
    const razaoSocial = titulo(empresa.razao_social ?? '');
    const nomeComercial = titulo(estab.nome_fantasia ?? '');
    const nome = /[a-z0-9]/i.test(nomeComercial) ? nomeComercial : razaoSocial;
    if (!nome) continue;

    const uf = estab.uf;
    const cidadeSlug = slugify(estab.cidade_nome);
    const cidade = nomeMunicipio(cidadeSlug, uf);
    const chave = `${uf}:${cidadeSlug}`;

    const logradouro = [estab.tipo_logradouro, estab.logradouro]
      .filter(Boolean)
      .join(' ')
      .trim();
    const completo = [
      logradouro && estab.numero ? `${titulo(logradouro)}, nº ${estab.numero}` : titulo(logradouro),
      titulo(estab.bairro ?? ''),
    ]
      .filter(Boolean)
      .join(', ');

    if (!grupos.has(chave)) grupos.set(chave, { cidade, cidadeSlug, estado: uf, items: [] });

    grupos.get(chave).items.push({
      id: `${slugify(nome)}-${cidadeSlug}-${estab.cnpj_basico}`,
      cnpj: formatarCnpj(estab.cnpj_basico, estab.cnpj_ordem, estab.cnpj_dv),
      razaoSocial,
      nomeComercial,
      nome,
      endereco: {
        logradouro: titulo(logradouro),
        numero: String(estab.numero ?? '').trim(),
        complemento: titulo(estab.complemento ?? ''),
        bairro: titulo(estab.bairro ?? ''),
        cidade,
        estado: uf,
        cep: formatarCep(estab.cep),
        completo,
      },
      telefone: formatarTelefone(estab.ddd1, estab.tel1) || formatarTelefone(estab.ddd2, estab.tel2),
      segmento: 'Construtoras e incorporadoras',
      areaAtuacao: CNAES[estab.cnae] ?? '',
      cnae: estab.cnae,
      dataAbertura: formatarData(estab.data_inicio),
      porte: PORTES[empresa.porte] ?? 'Não informado',
      naturezaJuridica: empresa.natureza_nome ?? '',
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const index = [];

  for (const grupo of grupos.values()) {
    // Ordena por tempo de mercado: quem está aberto há mais tempo aparece antes.
    grupo.items.sort((a, b) => {
      const anoA = Number(a.dataAbertura.split('/')[2] ?? 9999);
      const anoB = Number(b.dataAbertura.split('/')[2] ?? 9999);
      return anoA - anoB || a.nome.localeCompare(b.nome, 'pt-BR');
    });

    const prep = grupo.cidade.toLowerCase().startsWith('rio ') ? 'no' : 'em';
    const slug = `construtoras-${prep}-${grupo.cidadeSlug}`;
    const total = grupo.items.length;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

    const data = {
      slug,
      prep,
      cidade: grupo.cidade,
      cidadeSlug: grupo.cidadeSlug,
      estado: grupo.estado,
      total,
      totalPages,
      empresas: grupo.items,
    };

    fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(data));
    index.push({ slug, prep, cidade: data.cidade, cidadeSlug: data.cidadeSlug, estado: data.estado, total, totalPages });
    console.log(`  → ${slug}: ${total} empresas em ${totalPages} página(s)`);
  }

  index.sort((a, b) => b.total - a.total);
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index));
  console.log(`✓ ${index.length} cidade(s) em src/data/generated/construtoras/`);
}

main();
