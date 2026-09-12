import type { CidadeData, ImobiliariaCadastro } from './cidades';

export interface Contagem {
  nome: string;
  total: number;
}

export interface CidadeStats {
  total: number;
  bairros: Contagem[];
  totalBairros: number;
  areas: Contagem[];
  portes: Contagem[];
  porteDominante?: Contagem;
  comTelefone: number;
  anoMaisAntiga?: number;
  abertasUltimos5Anos: number;
}

function contar(items: ImobiliariaCadastro[], pick: (i: ImobiliariaCadastro) => string): Contagem[] {
  const mapa = new Map<string, number>();
  for (const item of items) {
    const chave = pick(item).trim();
    if (!chave) continue;
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'));
}

function anoDeAbertura(data: string): number | undefined {
  const ano = Number(data?.split('/')[2]);
  return Number.isFinite(ano) && ano > 1800 ? ano : undefined;
}

export function getCidadeStats(cidade: CidadeData): CidadeStats {
  const items = cidade.imobiliarias;
  const bairros = contar(items, (i) => i.endereco.bairro);
  const areas = contar(items, (i) => i.areaAtuacao);
  const portes = contar(items, (i) => i.porte);
  const anoAtual = new Date().getFullYear();

  const anos = items
    .map((i) => anoDeAbertura(i.dataAbertura))
    .filter((a): a is number => a !== undefined);

  return {
    total: cidade.total,
    bairros: bairros.slice(0, 5),
    totalBairros: bairros.length,
    areas: areas.slice(0, 4),
    portes,
    porteDominante: portes[0],
    comTelefone: items.filter((i) => i.telefone.trim().length > 0).length,
    anoMaisAntiga: anos.length ? Math.min(...anos) : undefined,
    abertasUltimos5Anos: anos.filter((a) => a >= anoAtual - 5).length,
  };
}

/** Lista em português: "a, b e c". */
export function listar(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

export function porcentagem(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

/** "Demais" é o resíduo da classificação da Receita; sozinho não diz nada ao leitor. */
export function descreverPorte(porte: string): string {
  const normalizado = porte.trim().toLowerCase();
  if (normalizado === 'demais') return 'de médio ou grande porte';
  if (normalizado === 'não informado') return 'sem porte declarado';
  return normalizado;
}
